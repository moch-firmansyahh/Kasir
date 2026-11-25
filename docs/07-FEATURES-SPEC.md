# 07 — Features Spec

Perilaku rinci per halaman. Rujuk ID requirement di `02`. Jika ada hal yang tidak tercakup di sini, **tanya**, jangan menebak.

---

## 0. Konvensi teks UI (Bahasa Indonesia)

Gunakan teks berikut agar konsisten. Boleh diubah **hanya** bila user meminta.

| Konteks | Teks |
|---|---|
| Tombol pilih Kasir | "Kasir" |
| Tombol pilih Dapur | "Dapur" |
| Ganti role | "Ganti Role" |
| Cari | "Cari menu..." |
| Kategori semua | "Semua" |
| Tambah item | "Tambah ke Pesanan" |
| Varian dialog | "Pilih {n} {label}" |
| Keranjang kosong | "Keranjang kosong. Pilih menu untuk mulai." |
| Tipe | "Dine In", "Take Away" |
| Nama customer | "Nama customer (opsional)" |
| Meja | "No. meja (opsional)" |
| Catatan | "Catatan (opsional)" |
| Diskon | "Diskon" |
| Subtotal / Diskon / Pajak / Total | "Subtotal", "Diskon", "Pajak", "Total" |
| Metode bayar | "Tunai", "QRIS", "Transfer" |
| Foto bukti | "Foto Bukti Bayar (opsional)" |
| Tombol kirim | "Buat Pesanan" |
| Sukses | "Pesanan #{no} dikirim ke dapur" |
| Gagal | "Pesanan gagal dibuat. Coba lagi." |
| Status | "Baru", "Dimasak", "Selesai" |
| Aksi dapur | "Mulai Masak", "Selesai" |
| Dapur kosong | "Belum ada pesanan." |
| Hapus konfirmasi | "Hapus {nama}? Riwayat pesanan tidak terpengaruh." |
| Offline/putus | "Koneksi terputus. Mencoba menyambung ulang…" |

---

## 1. `/` — Pilih Role (FR-ROLE)

**Tampilan:** judul "Cemal Cemul", dua kartu besar: Kasir (ikon kasir) dan Dapur (ikon chef).

**Perilaku:**
- Klik → simpan `pos_role` → redirect ke `/kasir` atau `/dapur`.
- Bila role sudah tersimpan: tampil tombol tambahan "Lanjut sebagai {role}" namun kedua kartu tetap bisa dipilih.

**AC:**
- [ ] Refresh setelah memilih tidak mengulang pilihan.
- [ ] Tombol Ganti Role di Kasir/Dapur membawa kembali ke `/`.
- [ ] Membuka `/kasir` tanpa role → redirect `/`.

---

## 2. `/kasir` — POS (FR-POS)

### 2.1 Katalog
- Sumber: `GET /api/menu?includeInactive=false`.
- Pencarian client-side, case-insensitive, pada `name`.
- Filter kategori; "Semua" default.
- Urutan: `sort_order`, lalu nama.

### 2.2 Menambah item

| Kasus | Perilaku |
|---|---|
| `variant_pick = 0` | Tambah langsung qty 1. Item identik (key sama) → qty +1 |
| `variant_pick > 0` | Buka **VariantDialog** |

### 2.3 VariantDialog
- Judul: nama menu. Subjudul: "Pilih {variant_pick} {variant_label}".
- Daftar varian sebagai toggle/checkbox.
- Penghitung: "{dipilih}/{variant_pick} dipilih".
- Aturan pemilihan:
  - `variant_pick = 1` → perilaku radio (memilih lain mengganti).
  - `variant_pick > 1` → multi-select, maksimum `variant_pick`; setelah penuh, varian lain nonaktif sampai ada yang dilepas.
  - Pengulangan varian yang sama (mis. Couple Cemul: Mangga + Mangga) **diizinkan** `[ASUMSI A9]` → UI memakai stepper per varian, total harus = `variant_pick`. Bila user menjawab tidak boleh, ganti ke multi-select unik.
- Catatan opsional (satu baris).
- Tombol "Tambah ke Pesanan" aktif hanya bila jumlah = `variant_pick`.

### 2.4 Keranjang
- Baris: nama, varian, catatan, harga baris (`price × qty`), stepper, hapus.
- Stepper turun dari 1 → hapus baris (tanpa konfirmasi untuk satu baris; ada tombol "Kosongkan" dengan `AlertDialog`).
- Penggabungan baris: key = `menuItemId + varian terurut + catatan`.
- Keranjang disimpan di memori (Zustand) selama sesi tab; **hilang saat refresh** `[ASUMSI]`.

### 2.5 Data pesanan
- Tab Dine In/Take Away (default Dine In).
- Nama customer: maks 60 karakter.
- No. meja: hanya tampil pada Dine In, maks 10 karakter.
- Catatan pesanan: maks 200 karakter.

### 2.6 Diskon
- Toggle `%` / `Rp` + input angka bulat ≥ 0.
- `%`: 0–100. `Rp`: ≤ subtotal. Nilai tidak valid → pesan inline, tombol Buat Pesanan nonaktif.
- Kosong/0 = tanpa diskon.

### 2.6b Rumus (acuan; kode di `lib/pricing.ts`)
```
subtotal = Σ (price × qty)
discount = type == 'percent' ? round(subtotal × value / 100)
         : type == 'amount'  ? min(value, subtotal)
         : 0
discount = min(discount, subtotal)
taxBase  = subtotal − discount
tax      = round(taxBase × taxPercent / 100)
total    = subtotal − discount + tax
```
Semua integer. Pembulatan `Math.round`. Contoh: subtotal 38.000, diskon 10% = 3.800, pajak 11% dari 34.200 = 3.762, total = 38.000 − 3.800 + 3.762 = **37.962**.

### 2.7 Pembayaran
- Pilih Tunai/QRIS/Transfer (wajib `[A7]`). Bila belum dipilih, tombol Buat Pesanan nonaktif dengan petunjuk "Pilih metode bayar".
- Tunai `[S]`: input "Uang diterima"; tampil "Kembalian = diterima − total" (min 0). Bila diterima < total → peringatan "Uang kurang", **tidak** memblokir (opsional). Tidak disimpan ke DB.

### 2.8 Foto bukti bayar (FR-POS-14)
- `<input type="file" accept="image/*" capture="environment">` disembunyikan; dipicu tombol.
- Setelah ambil: kompres di client (maks sisi 1280px, JPEG ≈0.7), tampil pratinjau, tombol Ganti/Hapus.
- Opsional: tanpa foto tetap bisa lanjut.
- Di perangkat tanpa kamera: input membuka galeri/file picker; tetap valid.

### 2.9 Buat Pesanan
Urutan:
1. Validasi client → tombol aktif/nonaktif.
2. Kirim `POST /api/orders`.
3. Sukses → bila ada foto, kirim `POST /api/orders/[id]/proof`.
4. Kosongkan keranjang & form; toast sukses; fokus kembali ke pencarian.
5. Upload foto gagal → toast peringatan "Pesanan tersimpan, tetapi foto gagal diunggah. Coba lagi dari Riwayat." (H12).
6. Order gagal → pesan error; **keranjang tetap** (FR-POS-16).
- Cegah klik ganda: tombol nonaktif + spinner selama proses; idempotensi sisi UI (satu request per klik).

### 2.10 Responsive
- ≥1024px: panel pesanan tetap di kanan.
- 640–1023px: drawer kanan, dibuka dari tombol keranjang dengan badge jumlah.
- <640px: bottom sheet, bar ringkas "N item · Rp total".

### 2.11 Edge case
- Menu dinonaktifkan/hapus saat di keranjang → server menolak (`MENU_INACTIVE`/`MENU_NOT_FOUND`); UI menandai baris, minta hapus.
- Harga berubah saat di keranjang → server memakai harga DB; respons menyertakan total final; UI memberi tahu bila berbeda dari pratinjau.
- Jaringan putus saat Buat Pesanan → error, keranjang aman, bisa coba lagi.

---

## 3. `/kasir/menu` — Kelola Menu (FR-MENU)

- Daftar semua menu (aktif & nonaktif), pencarian, filter kategori.
- Aksi: tambah, edit, hapus (konfirmasi), switch aktif.

### Form menu
| Field | Aturan |
|---|---|
| Nama | wajib, 1–80 karakter |
| Harga | wajib, bilangan bulat ≥ 0 |
| Kategori | opsional |
| Gambar | opsional; kompres; placeholder bila kosong |
| Label varian | default "Varian" |
| Jumlah dipilih (`variant_pick`) | bilangan bulat ≥ 0 (0 = tanpa varian) |
| Daftar varian | tambah/hapus/urut; nama unik per menu |
| Aktif | switch |

Validasi: bila `variant_pick > 0`, jumlah varian ≥ `variant_pick` (FR-MENU-07).

### Kategori
- Tambah, ubah nama, urutan, hapus. Menghapus kategori → menu terkait `category_id = null`.

### AC
- [ ] Menu baru muncul di POS bila aktif.
- [ ] Mengedit harga **tidak** mengubah riwayat.
- [ ] Menghapus menu tidak menghilangkan pesanan lama.

---

## 4. `/kasir/riwayat` — Riwayat (FR-HIST)

- Daftar terbaru dulu, paginasi/"muat lebih banyak".
- Baris: `#no`, waktu (WIB), nama/meja, total, metode, badge status.
- Klik → detail (Sheet/Dialog): item, varian, catatan, subtotal/diskon/pajak/total, metode, bukti bayar.
- Bukti: thumbnail → klik perbesar. Tidak ada bukti → tombol "Tambah bukti bayar".
- Filter tanggal `[S]`: Hari ini (default), Kemarin, Rentang. Ringkasan: jumlah pesanan + total.
- Status diperbarui otomatis (refetch periodik atau Realtime).

---

## 5. `/kasir/pengaturan` — Pengaturan (FR-SET)

- Nama toko: wajib, 1–60 karakter.
- Pajak (%): 0–100, maksimal 2 desimal.
- Simpan → toast "Pengaturan disimpan".
- Perubahan pajak berlaku untuk pesanan **berikutnya**; pesanan lama menyimpan `tax_percent` sendiri.

---

## 6. `/dapur` — Dapur (FR-KIT)

### 6.1 Tampilan
- Header: nama toko, indikator koneksi, tombol bunyi `[S]`, Ganti Role.
- Tab **Aktif** (Baru + Dimasak) dan **Selesai** (selesai hari ini WIB).
- Urutan tab Aktif: `created_at` menaik (FIFO).

### 6.2 Kartu pesanan
Wajib: `#no`, badge status, nama customer/tipe/meja, waktu masuk + relatif, daftar item (`qty× nama`, varian, catatan item), catatan pesanan.
**Dilarang tampil:** harga, total, metode bayar, bukti bayar.

### 6.3 Aksi
| Status | Tombol | Hasil |
|---|---|---|
| baru | "Mulai Masak" | → dimasak |
| dimasak | "Selesai" | → selesai |
| selesai | — | tidak ada aksi (A8: tidak ada mundur) |

- Optimistic update boleh, dengan rollback + toast bila gagal.
- Cegah klik ganda.

### 6.4 Realtime
- Subscribe Postgres Changes `orders` (INSERT/UPDATE) → debounce → refetch `GET /api/kitchen/orders`.
- Indikator: Terhubung / Menyambung ulang / Terputus.
- Terputus → polling tiap 10 detik sampai tersambung.
- Pesanan baru → bunyi `[S]` (hormati kebijakan autoplay browser: perlu interaksi pertama; tampilkan tombol "Aktifkan bunyi").

### 6.5 Ketahanan
- Layar tidak tidur `[S]` (Wake Lock bila didukung).
- Reload halaman tidak kehilangan data (selalu fetch dari server).
- Waktu relatif diperbarui tiap menit.

### AC
- [ ] Pesanan baru muncul tanpa refresh dalam beberapa detik.
- [ ] Tidak ada nominal uang di DOM Dapur.
- [ ] Menekan tombol mengubah status dan Kasir melihat perubahan.
- [ ] Tab Selesai hanya memuat selesai hari ini.

---

## 7. State kosong & error (wajib di semua halaman)

Lihat tabel di `06-DESIGN-SYSTEM.md` §7. Setiap fetch harus punya loading (Skeleton), kosong, dan error + "Coba lagi".

---

## 8. Skenario uji manual inti

| # | Skenario | Hasil yang diharapkan |
|---|---|---|
| T1 | Tambah Mix Platter pilih 3 varian, qty 2 | Baris keranjang qty 2, total 30.000 |
| T2 | Coba tambah Mix Platter dengan 2 varian | Tombol Tambah nonaktif |
| T3 | Diskon 10% pada subtotal 38.000, pajak 0 | Total 34.200 |
| T4 | Diskon nominal > subtotal | Ditolak, pesan inline |
| T5 | Pajak 11% diatur, pesanan 38.000 tanpa diskon | Pajak 4.180, total 42.180 |
| T6 | Place Order tanpa foto | Berhasil |
| T7 | Place Order dengan foto, upload sengaja gagal | Pesanan tersimpan, peringatan tampil |
| T8 | Pesanan baru → Dapur terbuka di perangkat lain | Muncul otomatis |
| T9 | Dapur menekan Mulai Masak → Selesai | Status berubah; Kasir melihat |
| T10 | Edit harga menu setelah ada pesanan | Riwayat lama tidak berubah |
| T11 | Nonaktifkan menu | Hilang dari POS |
| T12 | Buka `/kasir` tanpa role | Redirect `/` |
| T13 | Lihat Dapur di DevTools | Tidak ada harga/total/metode bayar |
| T14 | Lebar 375px | Bottom sheet keranjang, bottom nav, tanpa scroll horizontal |
| T15 | Putus internet di Dapur lalu nyala | Indikator berubah, data tersinkron |
