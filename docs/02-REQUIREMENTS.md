# 02 — Requirements

Setiap requirement punya **ID**, **prioritas**, dan **kriteria penerimaan (AC)**. Sebut ID ini saat melaporkan pekerjaan (contoh: "FR-POS-04 selesai").

Prioritas: **[M]** wajib · **[S]** sebaiknya ada (kerjakan setelah semua [M] fase tersebut selesai) · **[X]** di luar scope (dilarang dibuat).

---

## A. Akses & Role (FR-ROLE)

| ID | P | Requirement | Kriteria penerimaan |
|---|---|---|---|
| FR-ROLE-01 | M | Halaman `/` menampilkan dua pilihan: Kasir dan Dapur | Dua kartu besar terlihat; klik Kasir → `/kasir`, klik Dapur → `/dapur` |
| FR-ROLE-02 | M | Tanpa login/password/akun | Tidak ada form login, token, atau tabel user |
| FR-ROLE-03 | M | Role tersimpan di perangkat | Setelah memilih, refresh/buka ulang tidak meminta pilih lagi (cookie `pos_role`) |
| FR-ROLE-04 | M | Tombol Ganti Role di Kasir dan Dapur | Klik → kembali ke `/` dan role bisa diganti |
| FR-ROLE-05 | M | Guard rute | Membuka `/kasir` tanpa role → redirect ke `/`; role `dapur` membuka `/kasir` → redirect ke `/` (atau ke `/dapur`) |

## B. Kasir — POS (FR-POS)

| ID | P | Requirement | Kriteria penerimaan |
|---|---|---|---|
| FR-POS-01 | M | Katalog menu berupa kartu | Kartu menampilkan gambar (placeholder bila kosong), nama, harga, tombol tambah |
| FR-POS-02 | M | Pencarian menu | Mengetik memfilter nama, tidak peka huruf besar/kecil |
| FR-POS-03 | M | Filter kategori | Pilihan "Semua" + tiap kategori; memfilter grid |
| FR-POS-04 | M | Hanya menu aktif tampil | Menu `is_active=false` tidak muncul di POS |
| FR-POS-05 | M | Tambah item tanpa varian | Ketuk → masuk keranjang qty 1; ketuk lagi → qty +1 |
| FR-POS-06 | M | Tambah item dengan varian | Ketuk → dialog; tombol Tambah aktif **hanya** bila jumlah dipilih = `variant_pick` |
| FR-POS-07 | M | Ubah qty & hapus item | Stepper +/−; qty menjadi 0 menghapus baris |
| FR-POS-08 | M | Catatan per item | Teks opsional tampil di baris keranjang dan di dapur |
| FR-POS-09 | M | **Total otomatis** | Subtotal, diskon, pajak, total berubah seketika setiap keranjang/diskon berubah |
| FR-POS-10 | M | Data pesanan | Nama customer (opsional), tipe Dine In/Take Away, nomor meja (hanya Dine In, opsional), catatan pesanan (opsional) |
| FR-POS-11 | M | Diskon per pesanan | Persen **atau** nominal; tidak boleh > subtotal; persen 0–100; opsional |
| FR-POS-12 | M | Pajak dari pengaturan | Persentase global, default 0%; dihitung dari (subtotal − diskon) |
| FR-POS-13 | M | Metode bayar | Tunai / QRIS / Transfer; wajib dipilih `[ASUMSI A7]` |
| FR-POS-14 | M | Foto bukti bayar **opsional** | Tombol kamera; tanpa foto tetap bisa Place Order |
| FR-POS-15 | M | Place Order | Menyimpan pesanan; pesanan muncul di dapur; keranjang dikosongkan; toast sukses |
| FR-POS-16 | M | Kegagalan aman | Bila gagal, keranjang **tidak** hilang dan pesan error jelas tampil |
| FR-POS-17 | S | Tunai: uang diterima & kembalian | Input nominal → tampil kembalian (tidak wajib disimpan) |
| FR-POS-18 | M | Responsive keranjang | Desktop/tablet: panel kanan; HP: bottom sheet dengan bar ringkas |

## C. Kasir — Kelola Menu (FR-MENU)

| ID | P | Requirement | Kriteria penerimaan |
|---|---|---|---|
| FR-MENU-01 | M | Daftar menu | Tampil semua menu (aktif & nonaktif) |
| FR-MENU-02 | M | Tambah menu | Form nama, harga, kategori, gambar (opsional), varian; tersimpan dan muncul di POS bila aktif |
| FR-MENU-03 | M | Edit menu | Perubahan tercermin di POS; riwayat lama tidak berubah |
| FR-MENU-04 | M | Hapus menu | Dengan konfirmasi; riwayat tetap utuh (snapshot) |
| FR-MENU-05 | M | Aktif/nonaktif | Switch; menu nonaktif hilang dari POS |
| FR-MENU-06 | M | Kelola varian | Tambah/hapus/urutkan varian; atur `variant_label` dan `variant_pick` |
| FR-MENU-07 | M | Validasi varian | Bila `variant_pick > 0`, jumlah varian ≥ `variant_pick` |
| FR-MENU-08 | M | Kelola kategori | Tambah, ubah nama, hapus (menu terkait menjadi tanpa kategori) |
| FR-MENU-09 | S | Upload gambar menu | Gambar tersimpan di Storage; placeholder bila kosong |

## D. Kasir — Riwayat (FR-HIST)

| ID | P | Requirement | Kriteria penerimaan |
|---|---|---|---|
| FR-HIST-01 | M | Daftar pesanan terbaru | Kolom: nomor, waktu, customer/meja, total, metode, status |
| FR-HIST-02 | M | Detail pesanan | Item, varian, catatan, rincian angka, bukti bayar bila ada |
| FR-HIST-03 | M | Lihat bukti bayar | Gambar tampil; klik untuk perbesar |
| FR-HIST-04 | M | Tambah/ganti bukti bayar | Bila belum ada, tombol "Tambah bukti bayar" membuka kamera |
| FR-HIST-05 | M | Status terlihat | Status terkini (Baru/Dimasak/Selesai) tampil di daftar dan detail |
| FR-HIST-06 | S | Filter tanggal | Hari ini / kemarin / rentang |
| FR-HIST-07 | S | Ringkasan penjualan | Total dan jumlah pesanan pada rentang terpilih |

## E. Kasir — Pengaturan (FR-SET)

| ID | P | Requirement | Kriteria penerimaan |
|---|---|---|---|
| FR-SET-01 | M | Nama toko | Dapat diubah; tampil di header |
| FR-SET-02 | M | Persentase pajak | 0–100 (boleh desimal); memengaruhi pesanan **berikutnya**, bukan riwayat |

## F. Dapur (FR-KIT)

| ID | P | Requirement | Kriteria penerimaan |
|---|---|---|---|
| FR-KIT-01 | M | Daftar pesanan realtime | Pesanan baru muncul tanpa refresh dalam beberapa detik |
| FR-KIT-02 | M | Isi kartu pesanan | Nomor, waktu masuk, nama/meja, tipe, item × qty, varian, catatan item, catatan pesanan |
| FR-KIT-03 | M | Ubah status | Baru → Dimasak → Selesai lewat tombol |
| FR-KIT-04 | M | Tab Aktif/Selesai | Aktif = baru+dimasak; Selesai = selesai (hari ini) |
| FR-KIT-05 | M | Tanpa data uang | Tidak ada harga, total, metode bayar, bukti di layar Dapur |
| FR-KIT-06 | M | Urutan FIFO | Pesanan terlama di posisi teratas pada tab Aktif |
| FR-KIT-07 | M | Ketahanan koneksi | Indikator bila realtime putus + polling cadangan |
| FR-KIT-08 | S | Bunyi notifikasi | Bunyi saat pesanan baru; bisa dimatikan |
| FR-KIT-09 | S | Penanda lama menunggu | Warna/teks berubah bila menunggu melebihi ambang (mis. 10 menit) |
| FR-KIT-10 | S | Wake Lock | Layar tablet dapur tidak tidur selama halaman terbuka |

## G. Non-fungsional (NFR)

| ID | P | Requirement |
|---|---|---|
| NFR-01 | M | Responsive 375px → 1280px+ |
| NFR-02 | M | Semua teks UI berbahasa Indonesia |
| NFR-03 | M | Target sentuh ≥ 44px |
| NFR-04 | M | Loading, empty, error state di setiap halaman data |
| NFR-05 | M | Validasi di client dan server |
| NFR-06 | M | Secret tidak pernah ke client |
| NFR-07 | M | Uang integer rupiah; format `Rp 15.000` |
| NFR-08 | M | Waktu disimpan UTC, ditampilkan WIB |
| NFR-09 | M | Halaman utama termuat cepat di HP (gambar menu dioptimalkan) |
| NFR-10 | S | Dapat dipakai nyaman dengan satu tangan di HP |

## H. Di luar scope [X] (DILARANG dibuat)

| ID | Item |
|---|---|
| OOS-01 | Login, akun, password, OAuth |
| OOS-02 | Multi-cabang / multi-toko |
| OOS-03 | Stok / inventori / resep |
| OOS-04 | Laporan keuangan lanjutan, grafik analitik |
| OOS-05 | Cetak struk / printer |
| OOS-06 | Payment gateway / QRIS dinamis / verifikasi pembayaran otomatis |
| OOS-07 | Delivery / ojol / alamat |
| OOS-08 | Reservasi meja |
| OOS-09 | Loyalty / member / voucher |
| OOS-10 | Mode gelap |
| OOS-11 | Aplikasi native / PWA offline penuh |
| OOS-12 | Pembatalan/refund pesanan `[belum diputuskan — tanya user bila diminta]` |

## I. Matriks keterlacakan ringkas

| Halaman | Requirement |
|---|---|
| `/` | FR-ROLE-01..05 |
| `/kasir` | FR-POS-01..18 |
| `/kasir/menu` | FR-MENU-01..09 |
| `/kasir/riwayat` | FR-HIST-01..07 |
| `/kasir/pengaturan` | FR-SET-01..02 |
| `/dapur` | FR-KIT-01..10 |
