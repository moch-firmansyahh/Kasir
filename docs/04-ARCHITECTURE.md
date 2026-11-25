# 04 — Architecture

> Cek versi library di `package.json` sebelum memakai API apa pun. Contoh kode di sini bersifat **pola**, bukan jaminan sintaks untuk versi tertentu.

## 1. Prinsip

1. **Server satu-satunya yang menulis** ke Supabase, memakai service role key (D11).
2. **Client** memakai anon key hanya untuk **subscribe Realtime** (membaca perubahan sebagai pemicu).
3. **Logika penting di server:** hitung total, validasi varian, validasi transisi status.
4. **Satu sumber logika harga** (`lib/pricing.ts`) dipakai client (pratinjau) dan server (final).
5. **Role bukan keamanan.** Jangan menyebutnya auth.

## 2. Diagram tingkat tinggi

```
┌──────────────┐        ┌───────────────────────┐        ┌──────────────────┐
│  Browser     │  HTTP  │  Next.js (server)     │  SQL   │ Supabase         │
│  Kasir/Dapur │ ─────► │  Route Handlers       │ ─────► │ Postgres         │
│              │        │  (service role key)   │        │ Storage          │
│              │ ◄───── │                       │ ◄───── │                  │
│              │        └───────────────────────┘        │                  │
│              │  WebSocket (anon key, subscribe saja)   │ Realtime         │
│              │ ◄────────────────────────────────────── │                  │
└──────────────┘                                         └──────────────────┘
```

## 3. Struktur folder

```
app/
  layout.tsx                    font, Toaster, metadata
  globals.css                   token tema (lihat 11-SHADCN-GUIDE)
  page.tsx                      pilih role
  kasir/
    layout.tsx                  navigasi Kasir + RoleGuard
    page.tsx                    POS
    menu/page.tsx               kelola menu, kategori, varian
    riwayat/page.tsx            riwayat + detail + bukti
    pengaturan/page.tsx         nama toko, pajak
  dapur/
    layout.tsx                  RoleGuard
    page.tsx                    pesanan realtime + ubah status
  api/
    orders/route.ts                     POST buat, GET daftar
    orders/[id]/route.ts                GET detail
    orders/[id]/status/route.ts         PATCH status
    orders/[id]/proof/route.ts          POST upload bukti
    kitchen/orders/route.ts             GET pesanan untuk dapur (tanpa uang)
    menu/route.ts                       GET, POST
    menu/[id]/route.ts                  PATCH, DELETE
    categories/route.ts                 GET, POST
    categories/[id]/route.ts            PATCH, DELETE
    settings/route.ts                   GET, PUT
    upload/menu-image/route.ts          POST gambar menu
components/
  ui/                           shadcn (jangan diedit sembarangan)
  pos/                          MenuCard, CategoryTabs, SearchBar, Cart, CartItem,
                                VariantDialog, OrderMeta, DiscountInput, PaymentPanel,
                                ProofCapture, Summary, CartSheetMobile
  kitchen/                      OrderCard, StatusButton, ConnectionBadge, KitchenTabs
  menu-admin/                   MenuTable, MenuForm, VariantEditor, CategoryManager
  history/                      OrderList, OrderDetail, ProofViewer
  shared/                       RoleGuard, RoleSwitcher, Money, EmptyState, ErrorState,
                                PageHeader, StatusBadge
hooks/
  useCart.ts  useKitchenOrders.ts  useIsMobile.ts  useWakeLock.ts
lib/
  supabase/server.ts            service role, 'server-only'
  supabase/client.ts            anon, realtime only
  store/cart.ts                 Zustand
  pricing.ts                    calculateTotals()
  role.ts                       get/set role (cookie)
  format.ts                     formatRupiah, formatWaktu, relatif
  validators.ts                 skema zod
  api.ts                        helper respons { data, error }
  image.ts                      kompres gambar client
types/
  db.ts                         tipe tabel
  api.ts                        tipe request/response
docs/                           dokumen ini
```

## 4. Envelope respons API

Semua endpoint mengembalikan bentuk seragam:

```json
// sukses
{ "data": { ... }, "error": null }

// gagal
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Pesan ramah untuk pengguna", "details": { } } }
```

| Kode | HTTP | Arti |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Input tidak valid |
| `MENU_NOT_FOUND` | 404 | Menu tidak ada |
| `MENU_INACTIVE` | 409 | Menu dinonaktifkan |
| `VARIANT_COUNT_INVALID` | 400 | Jumlah varian ≠ `variant_pick` |
| `VARIANT_NOT_ALLOWED` | 400 | Varian tidak terdaftar pada menu |
| `DISCOUNT_EXCEEDS_SUBTOTAL` | 400 | Diskon melebihi subtotal |
| `ORDER_NOT_FOUND` | 404 | Pesanan tidak ada |
| `INVALID_STATUS_TRANSITION` | 409 | Transisi status tidak diizinkan |
| `UPLOAD_FAILED` | 502 | Upload ke storage gagal |
| `FILE_TOO_LARGE` | 413 | Foto terlalu besar |
| `INTERNAL_ERROR` | 500 | Kesalahan server |

`message` ditulis dalam **bahasa Indonesia**. Detail teknis hanya di log server.

## 5. Kontrak API

### 5.1 `POST /api/orders` — buat pesanan
Request:
```json
{
  "customerName": "Muadz",
  "orderType": "dine_in",
  "tableNo": "B1",
  "note": "Jangan pedas",
  "paymentMethod": "qris",
  "discount": { "type": "percent", "value": 10 },
  "items": [
    { "menuItemId": "uuid", "qty": 2, "variants": ["Kentang","Nugget","Sosis"], "note": "" }
  ]
}
```
Aturan server:
1. Validasi dengan zod.
2. Ambil menu dari DB; tolak yang tidak ada/nonaktif.
3. Validasi `variants` ⊆ varian menu dan `variants.length === variant_pick` (bila `variant_pick > 0`).
4. Hitung total dengan `calculateTotals` memakai **harga DB** dan `settings.tax_percent`.
5. Insert `orders` + `order_items` (snapshot nama & harga) dalam satu transaksi/RPC atau dengan rollback manual bila gagal.
6. Kembalikan order lengkap.

Response `201`: `{ data: { id, orderNo, subtotal, discount, tax, total, status }, error: null }`

### 5.2 `GET /api/orders?date=YYYY-MM-DD&status=...&limit=50`
Untuk Riwayat Kasir. Mengembalikan daftar + ringkasan (jumlah, total).

### 5.3 `GET /api/orders/[id]`
Detail pesanan + item.

### 5.4 `PATCH /api/orders/[id]/status`
Body: `{ "status": "dimasak" }`. Transisi valid: `baru → dimasak`, `dimasak → selesai`. Lainnya → `INVALID_STATUS_TRANSITION`. Menetapkan status yang sama = idempoten (kembalikan sukses tanpa perubahan).

### 5.5 `POST /api/orders/[id]/proof`
`multipart/form-data` field `file` (image/jpeg|png|webp). Batas ≈ 2 MB setelah kompres (server menolak > batas). Simpan di `payment-proofs/{order_id}/{timestamp}.jpg`, update `payment_proof_url`. Mengunggah ulang mengganti URL (file lama boleh dihapus).

### 5.6 `GET /api/kitchen/orders?tab=active|done`
Mengembalikan **hanya** field non-keuangan:
```json
{ "data": [ { "id": "...", "orderNo": 12, "customerName": "Muadz", "orderType": "dine_in",
  "tableNo": "B1", "note": "...", "status": "baru", "createdAt": "...",
  "items": [ { "name": "Mix Platter", "qty": 1, "variants": ["Kentang","Nugget","Sosis"], "note": "" } ] } ] }
```
Tab `done` = status selesai hari ini (WIB). **Tidak boleh** menyertakan `price`, `subtotal`, `total`, `payment_*`.

### 5.7 Menu & kategori
- `GET /api/menu?includeInactive=true|false` → menu + kategori + varian.
- `POST /api/menu`, `PATCH /api/menu/[id]`, `DELETE /api/menu/[id]`.
- `GET/POST /api/categories`, `PATCH/DELETE /api/categories/[id]`.
- Saat `PATCH` varian, kirim daftar varian lengkap (replace); server menyinkronkan.

### 5.8 `GET/PUT /api/settings`
`{ storeName: string, taxPercent: number }`.

## 6. Alur data

### 6.1 Buat pesanan
```
Kasir → POST /api/orders
  server: validasi → ambil harga DB → hitung → insert orders+order_items
  → response 201
Dapur ← Realtime INSERT(orders) → refetch GET /api/kitchen/orders → kartu baru muncul
Kasir (setelah sukses) → bila ada foto: POST /api/orders/[id]/proof
```

### 6.2 Upload bukti
```
Ambil foto (kamera) → kompres client (±1280px, JPEG ≈0.7)
→ POST /api/orders/[id]/proof → upload Storage → simpan URL
Gagal? → pesanan tetap ada; tampilkan peringatan + tombol coba lagi (juga di Riwayat)
```

### 6.3 Ubah status
```
Dapur klik → PATCH /api/orders/[id]/status
→ update DB → Realtime UPDATE → Dapur & Kasir refetch/ubah tampilan
```

## 7. Realtime

**Default (Opsi A, asumsi A12):** Postgres Changes pada `orders` (INSERT, UPDATE). Payload **diabaikan**; setiap event memicu refetch ke endpoint server. Alasan: Dapur tidak boleh mengonsumsi data uang dari payload.
- Cleanup channel saat unmount.
- Debounce refetch (±300ms) bila banyak event berdekatan.
- Indikator koneksi: `terhubung` / `menyambung ulang` / `terputus`.
- Fallback polling tiap 10 detik saat status bukan `terhubung`.

**Opsi B (lebih tertutup, bila user meminta):** server mengirim **Broadcast** ke channel `kitchen` setelah INSERT/UPDATE (tanpa data sensitif), sehingga tabel tidak perlu policy SELECT untuk anon. Konsekuensi: kode tambahan di server. **Jangan beralih tanpa persetujuan.**

## 8. Role handling

- `lib/role.ts` menyimpan `pos_role` (`kasir` | `dapur`) di cookie (SameSite=Lax, path `/`, umur panjang).
- `RoleGuard` membaca role; bila kosong atau tidak cocok dengan rute → redirect `/`.
- **Ini bukan keamanan.** API tidak memeriksa role (sesuai D1). Jangan menulis kode yang seolah-olah mengamankan lewat role.

## 9. State keranjang (Zustand)

Bentuk item:
```ts
type CartLine = {
  key: string;            // hash: menuItemId + variants terurut + catatan
  menuItemId: string;
  name: string;
  price: number;          // untuk pratinjau; server tetap memakai harga DB
  imageUrl?: string | null;
  qty: number;
  variants: string[];
  note: string;
};
```
Aturan penggabungan: `key` sama → qty bertambah; berbeda → baris baru. Keranjang tidak di-persist ke localStorage kecuali diminta (hindari kehilangan data tak terduga **dan** data basi); `[ASUMSI]` default: persist **tidak**.

## 10. Env

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # SERVER ONLY
SUPABASE_STORAGE_BUCKET=payment-proofs
SUPABASE_MENU_BUCKET=menu-images
```

## 11. Keamanan (jujur dan eksplisit)

- Tanpa login, siapa pun yang mengetahui URL dapat membuka Kasir dan memanggil API. **Ini trade-off yang diterima user (D1).**
- Mitigasi opsional yang **boleh ditawarkan tetapi tidak boleh dipasang tanpa izin:** PIN sederhana per role, pembatasan jaringan toko, rate limiting.
- Wajib: service role key hanya server; validasi input server; batas ukuran upload; whitelist MIME; nama file dihasilkan server (jangan memakai nama dari client).
- Foto bukti disimpan di bucket publik-baca (URL tidak mudah ditebak karena memakai UUID + timestamp). Catat risikonya di `10-CONTEXT-LOG` bila user mempermasalahkan privasi; alternatif: bucket privat + signed URL.

## 12. Performa

- Gambar menu lewat `next/image`, ukuran sesuai.
- Daftar menu kecil: ambil sekali, filter di client.
- Riwayat: paginasi/limit.
- Dapur: refetch ringan, tanpa join berat.

## 13. Deployment (bila diminta)

- Target umum: Vercel atau host Node lain.
- Set env di hosting; jangan commit `.env.local`.
- Domain Storage ditambahkan ke `images.remotePatterns` di `next.config`.
- Pastikan zona waktu tampilan WIB di client.
