# 06 — Design System

> Hex di bawah adalah **estimasi dari poster** `[ASUMSI A1]`. Semua warna lewat CSS variable/token sehingga mudah diganti. **Dilarang hardcode hex di komponen** (H13). Pemetaan ke shadcn ada di `11-SHADCN-GUIDE.md`.

## 1. Karakter visual

- **Playful, hangat, bersahabat** seperti poster Cemal Cemul: latar krem, teks cokelat tua, aksen oranye/teal/pink/kuning.
- **Bentuk membulat** (radius besar), bayangan lembut.
- **Jelas dan cepat dibaca** untuk kasir yang sibuk dan dapur yang melihat dari jauh.
- Pola layout meniru referensi (Chili POS, Green Grounds) **tanpa** warna hijau mereka.

## 2. Palet warna

| Nama | Hex | Pemakaian utama |
|---|---|---|
| Krem (background) | `#FBF1E1` | latar halaman |
| Putih krem (card) | `#FFFFFF` / `#FFF8EC` | kartu, panel |
| Cokelat tua (foreground) | `#4A2B21` | teks, judul, ikon |
| Oranye (primary) | `#F28A26` | tombol utama, Place Order, item aktif |
| Teal (secondary) | `#1F8C7D` | aksi sekunder, status Selesai |
| Pink (accent) | `#F2A6A0` | highlight, status Baru |
| Kuning mangga | `#F5B52E` | harga, badge, status Dimasak |
| Muted | `#EADFCB` | pemisah, latar input |
| Border | `#E3D3B8` | garis tipis |
| Teks sekunder | `#8A6A5C` | keterangan |
| Destructive | `#D9534F` | hapus/error |

### Aturan kontras
- Teks utama `#4A2B21` di atas `#FBF1E1` aman.
- **Teks putih di atas oranye `#F28A26` kontrasnya rendah.** Gunakan teks cokelat tua `#4A2B21` pada tombol oranye, atau gelapkan oranye. **Ukur** rasio kontras (target ≥ 4.5:1 untuk teks normal, ≥ 3:1 untuk teks besar/ikon) sebelum memutuskan.
- Jangan mengandalkan warna saja untuk status: selalu sertakan teks.

## 3. Tipografi

| Peran | Font | Catatan |
|---|---|---|
| Judul/Display | *Lilita One* atau *Baloo 2* `[A4]` | tebal, playful |
| Isi/UI | *Nunito* atau *Inter* | terbaca di ukuran kecil |
| Angka harga | font isi, `tabular-nums` | agar rapi sejajar |

Dimuat lewat `next/font`. Sediakan fallback `system-ui, sans-serif`.

Skala ukuran (acuan; boleh disesuaikan Tailwind):
| Token | Ukuran | Pemakaian |
|---|---|---|
| display | 28–36px | judul halaman role |
| h1 | 24px | judul halaman |
| h2 | 20px | judul panel |
| h3 | 16–18px | judul kartu |
| body | 14–16px | isi |
| small | 12–13px | keterangan |
| dapur-body | 18–20px | teks di layar dapur (jarak baca jauh) |

## 4. Spasi, bentuk, bayangan

- Skala spasi: 4 / 8 / 12 / 16 / 24 / 32.
- Radius: kartu `1rem`, tombol `0.75rem`–pill, input `0.75rem`.
- Bayangan: lembut (`shadow-sm`/`shadow-md`), tanpa bayangan hitam keras.
- Border: 1px `#E3D3B8`.
- Dekorasi latar opsional: blob organik oranye/teal/pink opasitas 10–20%, **tidak boleh** mengurangi keterbacaan.

## 5. Breakpoint & layout

| Lebar | Layout |
|---|---|
| < 640px (HP) | Grid menu 2 kolom; bottom nav; keranjang = bottom sheet |
| 640–1023px (tablet portrait) | Sidebar ikon saja; grid 3 kolom; keranjang = drawer kanan |
| ≥ 1024px (tablet landscape/laptop) | 3 area: sidebar · grid menu · panel pesanan tetap |
| ≥ 1280px | Grid menu 4 kolom |

### Wireframe — POS desktop
```
┌────────┬──────────────────────────────────────┬──────────────────┐
│ LOGO   │ [🔍 Cari menu...                  ]  │ Pesanan baru     │
│        │ [Semua][Makanan][Minuman]            │ [Dine In|Take Away]│
│ POS    │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │ Nama: [_______]   │
│ Menu   │ │ img  │ │ img  │ │ img  │ │ img  │ │ Meja: [___]       │
│ Riwayat│ │ Nama │ │ Nama │ │ Nama │ │ Nama │ │ ───────────────── │
│ Setting│ │ Rp.. │ │ Rp.. │ │ Rp.. │ │ Rp.. │ │ item x qty  [-][+]│
│        │ │ [ + ]│ │ [ + ]│ │ [ + ]│ │ [ + ]│ │ ───────────────── │
│ Ganti  │ └──────┘ └──────┘ └──────┘ └──────┘ │ Subtotal  Rp..    │
│ Role   │                                      │ Diskon    -Rp..   │
│        │                                      │ Pajak     Rp..    │
│        │                                      │ TOTAL     Rp..    │
│        │                                      │ [Tunai][QRIS][TF] │
│        │                                      │ [📷 Foto bukti]   │
│        │                                      │ [ PLACE ORDER ]   │
└────────┴──────────────────────────────────────┴──────────────────┘
```

### Wireframe — POS HP
```
┌─────────────────────┐
│ Cemal Cemul   [role]│
│ [🔍 Cari...]        │
│ [Semua][Makanan]... │
│ ┌─────┐ ┌─────┐     │
│ │ img │ │ img │     │
│ │Nama │ │Nama │     │
│ │Rp.. │ │Rp.. │     │
│ │ [+] │ │ [+] │     │
│ └─────┘ └─────┘     │
│                     │
│ ┌─────────────────┐ │
│ │ 3 item · Rp 38k │ │ ← bar ringkas, ketuk = buka bottom sheet
│ │   [Lihat Pesanan]│ │
│ └─────────────────┘ │
│ [POS][Menu][Riwayat][⚙]│ ← bottom nav
└─────────────────────┘
```

### Wireframe — Dapur
```
┌─────────────────────────────────────────────────────────┐
│ Dapur Cemal Cemul    ● Terhubung   [🔔]  [Ganti Role]    │
│ [ Aktif (3) ] [ Selesai ]                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│ │ #12  [Baru]  │ │ #11 [Dimasak]│ │ #10 [Dimasak]│      │
│ │ Muadz · B1   │ │ Take Away    │ │ Dine In · A2 │      │
│ │ 2 mnt lalu   │ │ 8 mnt lalu   │ │ 12 mnt lalu  │      │
│ │ 1× Mix Platter│ │ 2× Single... │ │ ...          │      │
│ │  Kentang,... │ │  Mangga,Apel │ │              │      │
│ │ Catatan: ... │ │              │ │              │      │
│ │ [Mulai Masak]│ │ [  Selesai  ]│ │ [  Selesai  ]│      │
│ └──────────────┘ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Wireframe — Kelola Menu
```
┌ Kelola Menu            [+ Tambah Menu] [Kategori] ┐
│ Cari...                                            │
│ ┌────────────────────────────────────────────────┐ │
│ │ [img] Mix Platter  Makanan  Rp 15.000  Pilih 3 │ │
│ │                                  [Aktif ●] [✎] [🗑]│ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

## 6. Spesifikasi komponen

### MenuCard
- Gambar rasio 4:3 (placeholder berwarna krem + ikon bila kosong).
- Nama (maks 2 baris, ellipsis), harga (kuning mangga/cokelat tebal).
- Tombol `+` bulat ≥44px; bila ada varian tampil badge "Pilih N".
- Kartu menu nonaktif **tidak** tampil di POS.
- Hover (desktop): bayangan naik tipis. Tekan: skala 0.98.

### CategoryTabs
- Pill/kartu; aktif = latar primary, teks kontras; bisa scroll horizontal di HP.

### CartItem
- Gambar kecil 48px, nama, daftar varian (teks kecil, dipisah koma), catatan (ikon + teks), harga baris, stepper `−  qty  +`, tombol hapus.

### Summary
- Baris: Subtotal, Diskon (negatif), Pajak (tampil hanya bila > 0), **Total** (besar, tebal).
- Angka rata kanan, `tabular-nums`.

### PaymentPanel
- Tiga tombol besar bergaya toggle: Tunai, QRIS, Transfer (ikon + teks).
- Tunai: input "Uang diterima" + tampil "Kembalian".

### ProofCapture
- Tombol "Foto Bukti Bayar (opsional)". Setelah ambil: pratinjau + tombol Ganti/Hapus. Label "opsional" jelas.

### OrderCard (Dapur)
- Header: `#nomor`, badge status. Subheader: nama · meja/tipe, waktu relatif.
- Daftar item dengan `qty×` besar dan varian di bawahnya.
- Tombol aksi lebar penuh, tinggi ≥ 56px.
- Penanda lama menunggu: tepi kartu berubah warna (kuning > 10 mnt, destructive > 20 mnt `[S]`).

### StatusBadge
| Status | Warna | Teks |
|---|---|---|
| baru | pink | Baru |
| dimasak | kuning | Dimasak |
| selesai | teal | Selesai |

## 7. State yang wajib dirancang

| Konteks | Loading | Kosong | Error |
|---|---|---|---|
| Grid menu | Skeleton kartu | "Belum ada menu. Tambahkan di Kelola Menu." | "Gagal memuat menu" + Coba lagi |
| Keranjang | — | "Keranjang kosong. Pilih menu untuk mulai." | — |
| Dapur | Skeleton kartu | "Belum ada pesanan." | "Tidak dapat memuat pesanan" + Coba lagi |
| Riwayat | Skeleton baris | "Belum ada transaksi." | pesan + Coba lagi |
| Upload bukti | Spinner pada tombol | — | "Foto gagal diunggah" + Coba lagi |

## 8. Gerak (motion)

- Singkat dan halus (150–250ms). Hormati `prefers-reduced-motion`.
- Kartu dapur baru: fade/slide masuk ringan.
- Tombol aksi: umpan balik tekan.
- Tidak ada animasi berat.

## 9. Ikonografi

`lucide-react`, ukuran 16/20/24, stroke konsisten. Ikon yang disarankan: `Search`, `Plus`, `Minus`, `Trash2`, `ShoppingBag`, `Camera`, `Banknote`, `QrCode`, `Landmark` (transfer), `ChefHat`, `Receipt`, `History`, `Settings`, `LogOut/ArrowLeftRight` (ganti role), `Bell`, `Wifi/WifiOff`.

### Catatan: teks tombol utama
Gunakan kata kerja jelas: "Tambah ke Pesanan", "Place Order" boleh dipertahankan sebagai istilah, atau "Buat Pesanan" `[ASUMSI: pakai "Buat Pesanan"]`. Konsisten di seluruh app (lihat daftar teks di `07`).

## 10. Aksesibilitas

- Target sentuh ≥ 44px; jarak antar target cukup.
- Fokus terlihat (ring token).
- Label untuk setiap input dan tombol ikon (`aria-label`).
- Dialog fokus-terkunci (bawaan Radix).
- Status tidak hanya warna.
- Ukuran teks dapur lebih besar.

## 11. Aset

- Logo/maskot beruang **belum tersedia** `[A13]`. Gunakan teks "Cemal Cemul" dengan font display. **Jangan menggambar ulang atau mengarang logo.**
- Foto produk belum ada `[A3]`; gunakan placeholder.
- Pola latar (doodle di poster) opsional, buat sederhana atau tunggu aset dari user.
