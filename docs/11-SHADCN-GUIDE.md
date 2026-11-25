# 11 — shadcn/ui Guide

> Pelengkap `06-DESIGN-SYSTEM.md`. **Semua UI dibangun dari komponen shadcn/ui lebih dulu** (H8). Komponen kustom hanya bila shadcn tidak punya padanannya.
> **Jangan menebak versi.** Cek `package.json` (Tailwind v3 atau v4) dan `components.json`, lalu ikuti dokumentasi shadcn untuk versi tersebut. Perintah CLI dan format CSS **berbeda antar versi**.

## 1. Setup

1. Pastikan Next.js + Tailwind sudah terpasang.
2. Jalankan init shadcn lewat CLI resmi (cek dokumentasi untuk perintah terbaru sesuai package manager yang dipakai). Pilih base color netral; warna brand ditimpa manual (§2).
3. Pasang komponen **lewat CLI** (bukan menyalin manual) sesuai kebutuhan.
4. Catat versi Tailwind/shadcn di `10-CONTEXT-LOG.md`.

### Komponen yang dibutuhkan
`button` `card` `input` `label` `textarea` `select` `switch` `tabs` `badge` `dialog` `alert-dialog` `sheet` `drawer` `dropdown-menu` `table` `separator` `skeleton` `scroll-area` `sonner` `toggle-group` `radio-group` `form` (opsional: `sidebar`, `tooltip`, `popover`, `command`)

Tambahkan lainnya hanya bila ada kebutuhan nyata.

## 2. Token warna

Hex di bawah adalah **estimasi poster** `[A1]`. Gunakan format yang sesuai versi Tailwind terpasang. Kolom HSL dihitung otomatis dari hex (perkiraan; verifikasi visual).

| Token | Hex | HSL (untuk Tailwind v3) |
|---|---|---|
| `--background` | `#FBF1E1` | `37 76% 93%` |
| `--foreground` | `#4A2B21` | `15 38% 21%` |
| `--card` | `#FFFFFF` | `0 0% 100%` |
| `--card-foreground` | `#4A2B21` | `15 38% 21%` |
| `--popover` | `#FFFFFF` | `0 0% 100%` |
| `--popover-foreground` | `#4A2B21` | `15 38% 21%` |
| `--primary` | `#F28A26` | `29 89% 55%` |
| `--primary-foreground` | `#4A2B21` | `15 38% 21%` |
| `--secondary` | `#1F8C7D` | `172 64% 34%` |
| `--secondary-foreground` | `#FFFFFF` | `0 0% 100%` |
| `--muted` | `#EADFCB` | `39 42% 86%` |
| `--muted-foreground` | `#8A6A5C` | `18 20% 45%` |
| `--accent` | `#F2A6A0` | `4 76% 79%` |
| `--accent-foreground` | `#4A2B21` | `15 38% 21%` |
| `--destructive` | `#D9534F` | `2 64% 58%` |
| `--destructive-foreground` | `#FFFFFF` | `0 0% 100%` |
| `--border` | `#E3D3B8` | `38 43% 81%` |
| `--input` | `#E3D3B8` | `38 43% 81%` |
| `--ring` | `#F28A26` | `29 89% 55%` |
| `--brand-yellow` | `#F5B52E` | `41 91% 57%` |
| `--brand-teal` | `#1F8C7D` | `172 64% 34%` |
| `--brand-pink` | `#F2A6A0` | `4 76% 79%` |

### Catatan kontras
`--primary-foreground` di atas oranye diset cokelat tua `#4A2B21` karena teks putih di atas `#F28A26` berkontras rendah. **Ukur kontras** sebelum final; jika kurang, gelapkan primary atau ubah foreground.

### 2a. Bentuk untuk Tailwind v4 (nilai warna langsung)
```css
:root {
  --radius: 1rem;
  --background: #FBF1E1;
  --foreground: #4A2B21;
  --card: #FFFFFF;
  --card-foreground: #4A2B21;
  --popover: #FFFFFF;
  --popover-foreground: #4A2B21;
  --primary: #F28A26;
  --primary-foreground: #4A2B21;
  --secondary: #1F8C7D;
  --secondary-foreground: #FFFFFF;
  --muted: #EADFCB;
  --muted-foreground: #8A6A5C;
  --accent: #F2A6A0;
  --accent-foreground: #4A2B21;
  --destructive: #D9534F;
  --destructive-foreground: #FFFFFF;
  --border: #E3D3B8;
  --input: #E3D3B8;
  --ring: #F28A26;
  --brand-yellow: #F5B52E;
  --brand-teal: #1F8C7D;
  --brand-pink: #F2A6A0;
}
```
Pada v4, shadcn memetakan variabel ini lewat blok `@theme inline`. **Ikuti struktur yang dihasilkan init**; jangan menulis ulang blok itu dari ingatan.

### 2b. Bentuk untuk Tailwind v3 (triplet HSL tanpa `hsl()`)
```css
@layer base {
  :root {
    --radius: 1rem;
    --background: 37 76% 93%;
    --foreground: 15 38% 21%;
    --card: 0 0% 100%;
    --card-foreground: 15 38% 21%;
    --popover: 0 0% 100%;
    --popover-foreground: 15 38% 21%;
    --primary: 29 89% 55%;
    --primary-foreground: 15 38% 21%;
    --secondary: 172 64% 34%;
    --secondary-foreground: 0 0% 100%;
    --muted: 39 42% 86%;
    --muted-foreground: 18 20% 45%;
    --accent: 4 76% 79%;
    --accent-foreground: 15 38% 21%;
    --destructive: 2 64% 58%;
    --destructive-foreground: 0 0% 100%;
    --border: 38 43% 81%;
    --input: 38 43% 81%;
    --ring: 29 89% 55%;
    --brand-yellow: 41 91% 57%;
    --brand-teal: 172 64% 34%;
    --brand-pink: 4 76% 79%;
  }
}
```
Pada v3, `tailwind.config` memakai `hsl(var(--primary))`. Jangan menempel hex mentah di sini.

### 2c. Token tambahan (di luar bawaan shadcn)
`brand-yellow`, `brand-teal`, `brand-pink` didaftarkan di theme Tailwind agar bisa dipakai sebagai class (`bg-brand-yellow`, dll.), mengikuti cara pendaftaran sesuai versi.

### 2d. Mode gelap
**Tidak dibuat** (OOS-10). Hapus/abaikan blok `.dark` bawaan.

## 3. Font

- Muat dengan `next/font` (Display: Lilita One atau Baloo 2; Isi: Nunito atau Inter) `[A4]`.
- Petakan ke variabel CSS (mis. `--font-display`, `--font-sans`) dan daftarkan di theme Tailwind.
- Judul besar memakai kelas font display; isi memakai font sans.

## 4. Pemetaan UI → komponen shadcn

| Bagian UI | Komponen | Catatan |
|---|---|---|
| Kartu pilih role | `Card` | besar, ikon + judul |
| Kartu menu | `Card`, `Button` (ikon `+`), `Badge` | badge "Pilih N" |
| Pencarian | `Input` + ikon | |
| Kategori | `ToggleGroup` / `Tabs` | scroll horizontal di HP |
| Dine In / Take Away | `Tabs` atau `ToggleGroup` | |
| Dialog varian | `Dialog` (desktop) / `Drawer` (HP) | logika bersama |
| Stepper varian (A9) | `Button` + teks angka | untuk Couple Cemul |
| Keranjang desktop | panel tetap + `ScrollArea` | |
| Keranjang HP | `Sheet` (bottom) atau `Drawer` | bar ringkas membuka sheet |
| Stepper qty | `Button` + angka | tinggi ≥44px |
| Diskon % / Rp | `ToggleGroup` + `Input` | |
| Metode bayar | `RadioGroup`/`ToggleGroup` bergaya tombol | ikon + teks |
| Foto bukti | `Button` + `<input type=file>` tersembunyi; `Dialog` untuk perbesar | |
| Konfirmasi hapus | `AlertDialog` | wajib (H14) |
| Tabel menu & riwayat | `Table` (desktop), daftar `Card` (HP) | |
| Form menu | `Form` + `Input`, `Select`, `Switch`, `Textarea` | |
| Aktif/nonaktif | `Switch` | |
| Status pesanan | `Badge` | warna + teks |
| Toast | `Sonner` | |
| Loading | `Skeleton` | |
| Navigasi Kasir | kustom dari `Button`/`Separator`; bisa `Sidebar` shadcn bila ada | HP: bottom nav kustom |
| Detail riwayat | `Sheet` (kanan di desktop, bawah di HP) | |

## 5. Aturan pemakaian

1. Jangan mengedit `components/ui/*` kecuali terpaksa; bungkus di `components/shared/*`.
2. Warna lewat token (`bg-primary`, `text-foreground`); **dilarang hex hardcode** (H13).
3. Gunakan `cn()` untuk menggabungkan class.
4. Varian tombol: `default` (primary/oranye), `secondary` (teal), `outline`, `ghost`, `destructive`. Jangan membuat varian baru bila yang ada cukup.
5. Ukuran: tombol utama POS `size="lg"` atau tinggi ≥44px; tombol aksi Dapur ≥56px.
6. Ikon: `lucide-react`, ukuran 16/20/24 konsisten.
7. **Dialog di desktop, Drawer/Sheet di HP** dipilih lewat breakpoint (`useIsMobile`); jangan menduplikasi logika — ekstrak isi ke komponen bersama.
8. Jangan mematikan aksesibilitas bawaan Radix (label, focus trap, `aria-*`).
9. Form: gunakan `Form` + zod resolver bila form kompleks (Kelola Menu); form sederhana cukup state biasa.
10. Teks UI mengikuti tabel di `07` §0.

## 6. Pola komponen acuan

### 6.1 Tombol utama (Buat Pesanan)
```tsx
<Button size="lg" className="w-full h-14 text-base" disabled={!canSubmit || loading}>
  {loading ? <Spinner /> : null} Buat Pesanan
</Button>
```

### 6.2 Dialog di desktop, Drawer di HP (pola)
```tsx
const isMobile = useIsMobile();
return isMobile ? (
  <Drawer open={open} onOpenChange={setOpen}><DrawerContent>{content}</DrawerContent></Drawer>
) : (
  <Dialog open={open} onOpenChange={setOpen}><DialogContent>{content}</DialogContent></Dialog>
);
```

### 6.3 Status badge
```tsx
const STATUS = {
  baru:    { label: 'Baru',    className: 'bg-brand-pink text-foreground' },
  dimasak: { label: 'Dimasak', className: 'bg-brand-yellow text-foreground' },
  selesai: { label: 'Selesai', className: 'bg-brand-teal text-white' },
} as const;
```

### 6.4 Konfirmasi hapus
Selalu `AlertDialog` dengan teks: "Hapus {nama}? Riwayat pesanan tidak terpengaruh." dan tombol destructive "Hapus" + "Batal".

## 7. Status badge

| Status | Token | Teks |
|---|---|---|
| baru | `brand-pink` | Baru |
| dimasak | `brand-yellow` | Dimasak |
| selesai | `brand-teal` | Selesai |

## 8. Konfigurasi gambar (next.config)

Tambahkan domain Supabase Storage ke `images.remotePatterns` agar `next/image` bisa memuat gambar menu dan bukti bayar. Gunakan hostname project Supabase kamu (diisi user; **jangan menebak**).

## 9. Checklist styling

- [ ] Token warna ditimpa (format sesuai versi) dan kontras dicek
- [ ] Font dimuat via `next/font` dan dipetakan ke Tailwind
- [ ] Tidak ada hex hardcode di komponen
- [ ] Token `brand-*` terdaftar
- [ ] Dialog/Drawer/Sheet benar di 375px
- [ ] Semua aksi destruktif memakai `AlertDialog`
- [ ] Target sentuh ≥44px
- [ ] Mode gelap tidak aktif
