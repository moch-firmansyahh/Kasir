# Cemal Cemul POS

Aplikasi kasir (POS) dan layar dapur **fullstack Next.js** untuk usaha kuliner **Cemal Cemul**, tanpa login, dengan database & realtime **Supabase** dan UI **shadcn/ui**.

## Fitur Utama

- **Pilih Role (`/`)**: Memilih tampilan **Kasir** atau **Dapur** tanpa login, tersimpan di cookie `pos_role`.
- **Kasir — POS (`/kasir`)**: Katalog menu (dengan cache lokal untuk sinyal lemah), pencarian, filter kategori, dialog varian (`Pilih N` dengan pengulangan varian diizinkan), keranjang Zustand persisten (`localStorage`), antrean pesanan offline (`IndexedDB` + auto-sync saat online) serta dukungan PWA Service Worker, catatan item & pesanan, diskon (`%` / `Rp`), pajak global, metode bayar (`Tunai` + hitung kembalian, `QRIS`, `Transfer`), foto bukti bayar opsional (`Dari File` / `Foto Langsung`, terkompresi ringan), dan penghitungan ulang + snapshot harga di server.
- **Kasir — Kelola Menu (`/kasir/menu`)**: Tambah, edit, hapus, aktif/nonaktifkan menu, kelola varian & kategori, serta upload gambar menu.
- **Kasir — Riwayat (`/kasir/riwayat`)**: Daftar transaksi per tanggal (`Hari ini`, `Kemarin`, `Rentang`), ringkasan penjualan, detail item, status dapur realtime, serta lihat/tambah/ganti foto bukti bayar.
- **Kasir — Pengaturan (`/kasir/pengaturan`)**: Ubah nama toko dan persentase pajak global.
- **Dapur (`/dapur`)**: Antrean pesanan FIFO realtime (tanpa data harga/pembayaran), transisi status maju (`Baru → Dimasak → Selesai`), polling cadangan otomatis saat koneksi terputus, notifikasi bunyi opsional, penanda lama menunggu, dan Screen Wake Lock.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + shadcn/ui (Radix + Lucide)
- Zustand & Zod
- Supabase (Postgres, Storage, Realtime)
- Vitest (unit testing)

## Setup Supabase

1. Jalankan SQL skema, trigger, RPC `create_order`, seed menu, Realtime publication, RLS, dan `GRANT` di **Supabase SQL Editor** sesuai [`docs/05-DATABASE.md`](docs/05-DATABASE.md).
2. Buat dua bucket Storage publik-baca: `payment-proofs` dan `menu-images`.
3. Salin `.env.example` menjadi `.env.local` (atau `.env`) dan isi kredensial Supabase Anda sendiri:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` _(server-only, jangan diberi prefix `NEXT_PUBLIC_`)_
   - `SUPABASE_STORAGE_BUCKET=payment-proofs`
   - `SUPABASE_MENU_BUCKET=menu-images`

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Perintah Pemeriksaan

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Keterbatasan & Catatan Keamanan

- **Tanpa login (`D1`)**: Pemilihan role hanya pemisah tampilan UI; siapa pun yang mengetahui URL dapat membuka `/kasir` atau `/dapur` atau memanggil endpoint API.
- **Bucket publik**: Foto bukti bayar (`payment-proofs`) dan gambar menu (`menu-images`) disimpan pada bucket publik-baca dengan nama file acak berbasis timestamp.
- **Realtime Postgres Changes (`A12`)**: Layar Dapur tidak menampilkan nominal uang, namun policy `SELECT` untuk `anon` pada `orders`/`order_items` membuat baris tabel secara teknis dapat dibaca oleh pemegang anon key.
- **Di luar cakupan**: Tidak ada cetak struk, stok/inventori, laporan keuangan lanjutan, pembatalan/refund, delivery, atau mode gelap.
