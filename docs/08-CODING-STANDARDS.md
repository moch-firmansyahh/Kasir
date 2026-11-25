# 08 — Coding Standards

> **Cek versi di `package.json` dan dokumentasi resmi** sebelum memakai API Next.js, React, Tailwind, shadcn, atau Supabase. Contoh di bawah adalah **pola acuan**; sesuaikan sintaks dengan versi terpasang. Jangan menulis dari ingatan.

## 1. Prinsip

1. Sederhana dan terbaca lebih penting dari pintar.
2. Satu sumber kebenaran per hal (harga: `lib/pricing.ts`; tipe DB: `types/db.ts`; skema: `docs/05`).
3. Validasi di client untuk UX, **di server untuk kebenaran**.
4. Ubah sekecil mungkin; jangan menulis ulang file besar untuk perubahan kecil.
5. Jangan menambah fitur atau dependensi di luar scope.

## 2. Bahasa & penamaan

| Hal | Aturan |
|---|---|
| Kode, variabel, fungsi, komentar teknis | Bahasa Inggris |
| Teks UI, pesan error ke pengguna | Bahasa Indonesia |
| Komponen React | `PascalCase.tsx` |
| Hook | `useCamelCase.ts` |
| Util/lib | `camelCase.ts` |
| Konstanta | `UPPER_SNAKE_CASE` |
| Kolom DB | `snake_case`; objek JS API/UI `camelCase` (petakan di satu lapisan) |
| Rute | huruf kecil, bahasa Indonesia sesuai spesifikasi (`/kasir`, `/dapur`, `/riwayat`) |

## 3. TypeScript

- `strict: true`. Hindari `any`; bila terpaksa, beri komentar alasan.
- Tipe baris DB di `types/db.ts`; tipe request/response di `types/api.ts`.
- Gunakan `type` untuk union/objek sederhana; `interface` bila perlu extends.
- Union status: `type OrderStatus = 'baru' | 'dimasak' | 'selesai'`.
- Jangan meng-cast untuk membungkam error tipe tanpa alasan.

## 4. React & Next.js

- App Router. **Server Component default**; `"use client"` hanya untuk state, event, kamera, realtime, browser API.
- Komponen ≤ ~200 baris; pecah bila lebih.
- Jangan memanggil Supabase service role dari komponen client.
- Gunakan `next/image` untuk gambar menu; konfigurasi `remotePatterns` untuk domain Supabase Storage.
- Hindari `useEffect` untuk hal yang bisa diturunkan dari state/props.
- Bersihkan subscription/timer di cleanup effect.
- Jangan membuat objek/fungsi baru di dependency array tanpa memoization bila memicu loop.
- API yang berubah antar versi (mis. `params`, `cookies()`, `headers()` bisa asinkron di versi baru): **cek dokumentasi versi terpasang**.

## 5. Struktur respons API & penanganan error

Semua Route Handler memakai helper di `lib/api.ts`:
```ts
// pola acuan
export const ok = <T>(data: T, status = 200) =>
  Response.json({ data, error: null }, { status });

export const fail = (code: string, message: string, status = 400, details?: unknown) =>
  Response.json({ data: null, error: { code, message, details } }, { status });
```
- `message` selalu Bahasa Indonesia, ringkas, tanpa detail teknis.
- Detail error teknis hanya di `console.error` server (dihapus/diganti logger bila ada).
- Bungkus handler dalam try/catch → `INTERNAL_ERROR` untuk hal tak terduga.
- Jangan membocorkan pesan error Supabase mentah ke client.

## 6. Validasi (zod) — pola acuan

```ts
import { z } from 'zod';

export const orderItemInput = z.object({
  menuItemId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
  variants: z.array(z.string().min(1)).default([]),
  note: z.string().max(120).optional().default(''),
});

export const createOrderInput = z.object({
  customerName: z.string().trim().max(60).optional(),
  orderType: z.enum(['dine_in', 'take_away']),
  tableNo: z.string().trim().max(10).optional(),
  note: z.string().trim().max(200).optional(),
  paymentMethod: z.enum(['cash', 'qris', 'transfer']),
  discount: z
    .object({ type: z.enum(['percent', 'amount']), value: z.number().int().min(0) })
    .nullable()
    .optional(),
  items: z.array(orderItemInput).min(1).max(50),
});
```
Server **menolak**: qty ≤ 0, varian tidak sesuai, diskon > subtotal, menu nonaktif/tidak ada.

## 7. Perhitungan harga — implementasi acuan

`lib/pricing.ts` (murni, tanpa side effect, mudah diuji):

```ts
export type Discount = { type: 'percent' | 'amount'; value: number } | null;

export type PricingInput = {
  lines: { price: number; qty: number }[];
  discount?: Discount;
  taxPercent: number; // 0..100
};

export type Totals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

export function calculateTotals({ lines, discount, taxPercent }: PricingInput): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  let discountAmount = 0;
  if (discount) {
    discountAmount =
      discount.type === 'percent'
        ? Math.round((subtotal * discount.value) / 100)
        : discount.value;
  }
  discountAmount = Math.min(Math.max(discountAmount, 0), subtotal);

  const taxBase = subtotal - discountAmount;
  const tax = Math.round((taxBase * taxPercent) / 100);
  const total = subtotal - discountAmount + tax;

  return { subtotal, discount: discountAmount, tax, total };
}
```
- Validasi **sebelum** memanggil (persen 0–100; nominal ≥ 0). Fungsi di atas membatasi hasil, tetapi **API tetap harus menolak** input tidak valid dengan `DISCOUNT_EXCEEDS_SUBTOTAL` bila nominal > subtotal (bukan diam-diam memotong).

Unit test minimum (Vitest/Jest sesuai yang terpasang):
| Kasus | Input | Hasil |
|---|---|---|
| Tanpa diskon/pajak | 15.000 × 2 | subtotal 30.000, total 30.000 |
| Diskon persen | 38.000, 10% | diskon 3.800, total 34.200 |
| Diskon nominal | 38.000, 5.000 | total 33.000 |
| Pajak | 38.000, 11% | pajak 4.180, total 42.180 |
| Diskon + pajak | 38.000, 10%, 11% | pajak 3.762, total 37.962 |
| Pembulatan | 9.999, 10% | memakai `Math.round` konsisten |
| Kosong | [] | semua 0 |

## 8. Format uang & waktu

```ts
export const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(n)
    .replace(/\u00A0/g, ' ');            // "Rp 15.000"

export const formatWaktu = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(iso));
```
- Uang di state/DB **selalu integer**. Format hanya di lapisan tampilan.
- Jangan `parseFloat` untuk uang.

## 9. Supabase

- `lib/supabase/server.ts`: service role, **`import 'server-only'`** di bagian atas.
- `lib/supabase/client.ts`: anon key, hanya untuk Realtime.
- **Selalu** periksa `error` dari setiap query; jangan abaikan.
- Jangan `select('*')` bila tidak perlu; pilih kolom.
- Dapur: endpoint server memilih kolom non-keuangan saja.
- Realtime: bersihkan channel saat unmount; payload diabaikan, refetch dari server.
- Upload: nama file dibuat server; whitelist MIME (`image/jpeg`, `image/png`, `image/webp`); batas ukuran.

## 10. shadcn/ui & styling

- Tambah komponen via CLI sesuai kebutuhan.
- Warna lewat token (`bg-primary`, `text-foreground`); **dilarang hex hardcode** (H13).
- Gunakan `cn()` untuk menggabungkan class.
- Jangan mengedit `components/ui/*` kecuali terpaksa; bungkus di `components/shared/*`.
- Detail: `11-SHADCN-GUIDE.md`.

## 11. Aksesibilitas

- Tombol ikon wajib `aria-label`.
- Input wajib `label` terkait.
- Target sentuh ≥ 44px.
- Jangan menghapus outline fokus tanpa pengganti.
- Status tidak hanya warna.

## 12. Performa

- Hindari render ulang berat pada grid menu (memoize kartu bila perlu).
- Gambar via `next/image` dengan ukuran/`sizes` sesuai.
- Debounce pencarian bila daftar besar (biasanya tidak perlu untuk menu kecil).
- Riwayat: batasi `limit`, muat bertahap.

## 13. Keamanan (checklist kode)

- [ ] Tidak ada `SUPABASE_SERVICE_ROLE_KEY` di file client / `NEXT_PUBLIC_*`.
- [ ] Input API divalidasi zod.
- [ ] Upload: MIME & ukuran dicek, nama file dari server.
- [ ] Tidak ada `dangerouslySetInnerHTML` untuk data pengguna.
- [ ] Tidak ada secret/URL privat di log atau di repo.
- [ ] `.env*.local` ada di `.gitignore`.

## 14. Komentar & dokumentasi

- Komentar menjelaskan **kenapa**, bukan **apa**.
- Tidak ada kode mati. TODO hanya bila dicatat di `10-CONTEXT-LOG.md`.
- Perubahan skema/perilaku → perbarui `05`/`07` pada commit yang sama.

## 15. Git

- Commit kecil dan bermakna: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`.
- Satu commit = satu tujuan.
- Jangan commit `.env.local`, `node_modules`, `.next`.

## 16. Testing

| Jenis | Cakupan minimum |
|---|---|
| Unit | `pricing.ts`, `format.ts`, aturan varian, transisi status |
| Manual | Skenario T1–T15 di `07-FEATURES-SPEC.md` |
| Responsive | 375px, 768px, 1280px |
| Keamanan | Cek bundle client tanpa service key; cek DOM Dapur tanpa uang |

Laporkan hasil uji secara jujur: apa yang diuji, bagaimana, hasil; dan apa yang **belum** diuji.

## 17. Transisi status (acuan)

```ts
const NEXT: Record<OrderStatus, OrderStatus | null> = {
  baru: 'dimasak',
  dimasak: 'selesai',
  selesai: null,
};
export const canTransition = (from: OrderStatus, to: OrderStatus) => NEXT[from] === to;
```

## 18. Yang DILARANG

- Menyimpan/meneruskan secret ke client.
- Mempercayai total dari client.
- Memakai float untuk uang.
- Menambah dependensi besar tanpa izin.
- Mengubah skema tanpa memperbarui dokumen.
- Menambah fitur di luar `02-REQUIREMENTS.md`.
- Mengklaim "sudah teruji" tanpa menjalankan.
- Menulis UI berbahasa Inggris.
- Menggambar/mengarang logo.
