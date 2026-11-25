# 01 — Project Overview

Dokumen ini menjelaskan **konteks bisnis dan pengguna**. Untuk apa yang harus dibangun lihat `02-REQUIREMENTS.md`; untuk keputusan final lihat `03-DECISIONS.md`.

## 1. Identitas

| Item | Nilai |
|---|---|
| Nama toko | **Cemal Cemul** |
| Jenis usaha | Jajanan & minuman skala kecil |
| Sumber brand | Poster "OUR MENU" (latar krem, cokelat tua, oranye, teal, pink, kuning; maskot beruang) |
| Bahasa operasional | Indonesia |
| Mata uang | Rupiah (IDR), tanpa desimal |
| Zona waktu | Asia/Jakarta (WIB) `[ASUMSI A6]` |

## 2. Tujuan

1. Mempercepat pencatatan pesanan di kasir.
2. Menghitung total secara otomatis dan tanpa salah hitung.
3. Menyimpan bukti pembayaran (foto) per pesanan bila kasir mau.
4. Menyalurkan pesanan ke dapur secara realtime.
5. Memberi kasir satu tempat untuk mengelola menu, tanpa aplikasi admin terpisah.

## 3. Bukan tujuan (non-goals)

Login/akun, multi-cabang, stok/inventori, laporan keuangan lanjutan, cetak struk, integrasi payment gateway/QRIS dinamis, delivery/ojol, reservasi, program loyalitas, mode gelap, aplikasi native.

## 4. Pengguna dan perangkat

| Role | Siapa | Perangkat | Tugas inti |
|---|---|---|---|
| **Kasir** | Penjaga kasir, juga pengelola menu | Tablet / HP / laptop | Input pesanan, bayar, foto bukti, kelola menu, lihat riwayat |
| **Dapur** | Orang yang memasak | Tablet / HP / laptop | Melihat pesanan, mengubah status |

Tidak ada akun. Role dipilih di halaman awal dan disimpan di perangkat.

## 5. Persona singkat

**Kasir (mis. "Dina")** — sibuk saat ramai, memegang HP/tablet satu tangan, butuh tombol besar, alur cepat, dan tidak mau salah hitung. Kadang diminta customer menunjukkan bukti transfer, lalu difoto.

**Dapur (mis. "Rudi")** — tangan sering basah/kotor, melihat layar dari jarak, butuh teks besar, jelas varian apa yang diminta, dan satu tap untuk mengubah status.

## 6. Alur pengguna utama

### 6.1 Pesanan baru (Kasir)
1. Buka `/` → pilih **Kasir**.
2. Cari/pilih kategori → ketuk menu.
3. Bila menu punya varian: pilih varian sesuai jumlah yang diwajibkan → Tambah.
4. Atur qty, catatan item.
5. Isi nama customer (opsional), pilih Dine In/Take Away, nomor meja (opsional).
6. (Opsional) isi diskon.
7. Pilih metode bayar. (Opsional) foto bukti bayar.
8. Tekan **Place Order** → toast "Pesanan #N dikirim ke dapur".

### 6.2 Memasak (Dapur)
1. Buka `/` → pilih **Dapur**.
2. Pesanan baru muncul otomatis di tab **Aktif**.
3. Tekan **Mulai Masak** → status Dimasak.
4. Setelah jadi, tekan **Selesai** → pesanan pindah ke tab Selesai.

### 6.3 Mengelola menu (Kasir)
1. Di Kasir buka **Kelola Menu**.
2. Tambah/edit menu, harga, kategori, gambar, varian, dan `Pilih N`.
3. Aktif/nonaktifkan menu yang habis.

### 6.4 Mengecek riwayat (Kasir)
1. Buka **Riwayat** → pilih pesanan → lihat rincian dan bukti bayar.
2. Bila bukti belum ada, tambahkan dari kamera.

## 7. Data menu awal (dari poster)

| Menu | Harga | Varian | Aturan pilih | Catatan |
|---|---|---|---|---|
| Mix Platter | Rp 15.000 | Kentang, Nugget, Sosis, Mie Goreng | Pilih **3** | tertulis "Pilih 3" di poster |
| French Toast | Rp 13.000 | Gurih, Karamel, Coklat, Madu, Gula | Pilih **1** | `[ASUMSI A2]` poster tidak menulis jumlah |
| Single Cemul | Rp 9.000 | Mangga, Anggur, Sirsak, Jeruk, Apel | Pilih **1** | `[ASUMSI A2]` |
| Couple Cemul | Rp 14.000 | Mangga, Anggur, Sirsak, Jeruk, Apel | Pilih **2** | tertulis "Pilih 2"; boleh rasa sama? `[ASUMSI A9]` |

Poster menulis harga "15k", "13k", "9k", "14k". Interpretasi: 15.000, 13.000, 9.000, 14.000 rupiah.

Kategori awal: **Makanan** (Mix Platter, French Toast) dan **Minuman** (Single Cemul, Couple Cemul).

## 8. Stack teknologi

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js (App Router, TypeScript) fullstack |
| Styling | Tailwind CSS + shadcn/ui |
| State klien | Zustand (keranjang) |
| Validasi | zod |
| Database | Supabase Postgres (online) |
| File | Supabase Storage |
| Realtime | Supabase Realtime |
| Ikon | lucide-react |
| Notifikasi UI | sonner |

Versi tepatnya **ditentukan oleh `package.json`**; jangan menebak.

## 9. Referensi desain

Tiga gambar referensi diberikan user:

1. **Chili POS** — layout 3 area (sidebar, grid menu, panel pesanan), tab Dine in/Take Away/Delivery, ringkasan Sub Total/Tax/Total, pilihan metode bayar, tombol besar Place Order, strip pesanan aktif di bawah.
2. **Green Grounds Coffee POS** — kartu kategori besar dengan status (Available/Need to re-stock), kartu menu membulat dengan tombol "+" bulat, daftar order dengan catatan per item, field nama customer, tab Dine In/Take Away.
3. **Poster Cemal Cemul** — sumber **palet warna, nuansa playful, data menu**.

**Cara memakai referensi:** ambil **pola layout dan interaksi**. **Jangan** menyalin warna hijau; warna mengikuti poster Cemal Cemul. **Jangan** menambah Delivery (di luar scope).

## 10. Kriteria sukses

- Kasir bisa menyelesaikan satu pesanan sederhana dalam **kurang dari 30 detik** setelah terbiasa.
- Total selalu benar dan sama antara layar kasir dan data tersimpan.
- Dapur menerima pesanan baru dalam **beberapa detik** tanpa refresh.
- Berfungsi nyaman di layar 375px hingga 1280px.
- Tidak ada secret bocor ke browser.

## 11. Glosarium

| Istilah | Arti |
|---|---|
| POS | Point of Sale, layar kasir |
| Varian | Pilihan rasa/isi pada satu menu |
| Pilih N | Jumlah varian wajib dipilih (`variant_pick`) |
| Dine In | Makan di tempat |
| Take Away | Bawa pulang |
| Bukti bayar | Foto layar HP customer yang diambil kasir |
| Snapshot | Salinan nama/harga saat transaksi |
| Status | `baru`, `dimasak`, `selesai` |
| Aktif (dapur) | Pesanan berstatus baru atau dimasak |
| Role | Pilihan tampilan Kasir/Dapur, bukan akun |
