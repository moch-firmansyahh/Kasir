# 03 — Decisions Log

Keputusan di sini **sudah disepakati user** dan **mengikat**. Untuk mengubahnya, AI harus **meminta persetujuan eksplisit** dan memperbarui file ini. Jangan mengubah diam-diam.

---

## 1. Keputusan final (ADR ringkas)

### D1 — Tanpa login, hanya pilih role
- **Konteks:** operasional ingin sesederhana mungkin.
- **Keputusan:** halaman awal memilih Kasir/Dapur; tidak ada akun.
- **Konsekuensi:** role bukan keamanan. Siapa pun yang tahu URL bisa membuka halaman mana pun. Diterima user.
- **Dilarang:** menambah login, token, atau tabel user tanpa persetujuan.

### D2 — Dapur boleh mengubah status
- **Keputusan:** alur **Baru → Dimasak → Selesai**. Saat pesanan sudah dimasak, dapur menekan "Selesai" (accept).
- **Konsekuensi:** perlu endpoint `PATCH status` dan realtime ke Kasir.
- **Dilarang:** status lain (mis. "Batal", "Diantar") tanpa persetujuan.

### D3 — Foto bukti bayar opsional
- **Keputusan:** tidak wajib, termasuk untuk tunai.
- **Konsekuensi:** `payment_proof_url` boleh null; kegagalan upload tidak membatalkan pesanan.

### D4 — Admin menyatu di Kasir
- **Keputusan:** kelola menu, riwayat, pengaturan adalah navigasi di dalam role Kasir.
- **Dilarang:** membuat role "Admin" ketiga.

### D5 — Pajak & diskon fleksibel
- **Keputusan:** pajak = persentase global di Pengaturan (default 0%). Diskon = per pesanan (persen atau nominal), opsional.
- **Dilarang:** diskon per item, kupon, atau aturan promo kompleks tanpa persetujuan.

### D6 — Tanpa cetak struk
- **Keputusan:** hasil cukup tampil di layar.

### D7 — Multi-perangkat
- **Keputusan:** tablet, HP, laptop.
- **Konsekuensi:** desain responsive wajib; keranjang HP = bottom sheet.

### D8 — Warna dari poster Cemal Cemul
- **Keputusan:** palet krem/cokelat/oranye/teal/pink/kuning.
- **Dilarang:** memakai hijau dari referensi Chili POS / Green Grounds.

### D9 — Supabase online
- **Keputusan:** Postgres + Storage + Realtime Supabase yang sudah berjalan.

### D10 — shadcn/ui
- **Keputusan:** UI dibangun dengan shadcn/ui.

### D11 — Akses data lewat server
- **Konteks:** tanpa login, RLS tidak bisa membedakan pengguna.
- **Keputusan:** semua tulis dan baca sensitif lewat Route Handler/Server Action memakai service role key.
- **Konsekuensi:** client hanya memakai anon key untuk Realtime (bila dipakai).

### D12 — Realtime dengan Supabase Realtime
- **Keputusan:** dapur menerima perubahan tanpa refresh. Event realtime dipakai sebagai **pemicu**; data lengkap diambil dari endpoint server.

### D13 — Harga snapshot
- **Keputusan:** `order_items` menyimpan nama dan harga saat transaksi.

### D14 — Perhitungan total di server
- **Keputusan:** server menghitung ulang dari harga DB; total dari client hanya pratinjau.

### D15 — Pesanan dianggap sudah dibayar saat Place Order
- **Konteks:** tidak ada status "belum bayar" yang diminta.
- **Keputusan:** Place Order = pembayaran dicatat. Tidak ada alur "bayar nanti". `[perlu konfirmasi user, lihat A10]`

---

## 2. Asumsi yang belum dikonfirmasi `[ASUMSI]`

| ID | Asumsi | Dampak bila salah | Cara verifikasi |
|---|---|---|---|
| A1 | Hex warna di `06` adalah estimasi dari gambar poster | Warna kurang akurat | Minta hex asli |
| A2 | French Toast dan Single Cemul memilih **1** varian | Aturan varian salah | Tanya user |
| A3 | Satu gambar per menu; awalnya placeholder | Tampilan kurang menarik | Tanya user / minta foto |
| A4 | Font judul playful (Lilita One / Baloo 2) | Gaya berbeda | Tanya user |
| A5 | IDR tanpa desimal | — | Pasti benar |
| A6 | Zona waktu WIB | Waktu tampil salah | Tanya user |
| A7 | Metode bayar **wajib** dipilih saat Place Order | Alur kasir terhambat | Tanya user |
| A8 | Dapur **tidak** bisa memundurkan status | Salah tekan tak bisa dibatalkan | Tanya user |
| A9 | Couple Cemul boleh memilih dua rasa yang sama | Validasi varian beda | Tanya user |
| A10 | Pesanan sudah dibayar saat dibuat (tidak ada "belum bayar") | Alur kasir restoran bisa beda | Tanya user |
| A11 | Nomor pesanan terus bertambah (tidak reset harian) | Nomor makin panjang | Tanya user |
| A12 | Realtime memakai Postgres Changes + SELECT anon pada `orders`/`order_items` | Data pesanan terbaca siapa pun yang punya anon key | Lihat opsi B di `04` dan keputusan user |
| A13 | Logo belum tersedia; header pakai teks | — | Minta file logo |

Ketika sebuah asumsi dijawab user, **pindahkan** ke bagian "Keputusan final" dengan ID baru dan hapus dari tabel ini.

---

## 3. Hal yang SENGAJA tidak dilakukan

- Tidak ada struk cetak.
- Tidak ada login/akun.
- Tidak ada stok/inventori.
- Dapur tidak melihat uang.
- Tidak ada mode gelap.
- Tidak ada pembatalan/refund (sampai user meminta).
- Tidak ada delivery.

---

## 4. Proses mengubah keputusan

1. AI mengajukan perubahan: apa, kenapa, dampak, alternatif.
2. User menyetujui eksplisit.
3. AI memperbarui file ini (tambah entri baru, tandai yang lama `DIGANTI oleh Dxx`).
4. AI memperbarui dokumen terkait (`02`, `04`, `05`, `07`, dll.).
5. Catat di `10-CONTEXT-LOG.md`.

---

## 5. Pertanyaan terbuka untuk user

1. Hex warna asli poster? (A1)
2. French Toast & Single Cemul memilih berapa varian? (A2)
3. Couple Cemul: boleh dua rasa sama? (A9)
4. Metode bayar wajib dipilih? (A7)
5. Perlukah dapur bisa memundurkan status? (A8)
6. Nomor pesanan reset harian atau lanjut? (A11)
7. Apakah ada kasus "bayar nanti" (belum dibayar saat pesan)? (A10)
8. Apakah perlu pembatalan pesanan? (OOS-12)
9. Data pesanan boleh terbaca lewat anon key, atau pakai opsi Broadcast yang lebih tertutup? (A12)
10. Logo/maskot dalam file PNG/SVG? (A13)
