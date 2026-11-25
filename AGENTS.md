# AGENTS.md — Cemal Cemul POS

> **BACA FILE INI PERTAMA di setiap sesi baru, tanpa terkecuali.**
> File ini adalah pintu masuk dan kontrak kerja antara kamu (AI agent) dan pemilik project.
> Detail lengkap ada di folder `docs/`. Jika ada konflik antara ingatan/asumsi kamu dan dokumen di repo ini, **dokumen menang**. Jika dokumen diam, **tanya, jangan menebak**.

---

## 1. Ringkasan project (satu paragraf)

Website kasir (POS) **fullstack Next.js** untuk usaha kuliner kecil bernama **Cemal Cemul**. **Tanpa login**: pengguna hanya memilih role **Kasir** atau **Dapur** di halaman awal. **Kasir** menginput pesanan, menghitung total otomatis (subtotal, diskon, pajak), memilih metode bayar, mengambil foto bukti bayar (opsional), dan mengelola menu (admin menyatu di Kasir). **Dapur** melihat pesanan masuk secara realtime dan mengubah status (Baru → Dimasak → Selesai). Database dan storage memakai **Supabase** yang sudah online. UI memakai **shadcn/ui** dengan palet warna dari poster produk Cemal Cemul. Dipakai di tablet, HP, dan laptop. Bahasa UI: Indonesia.

## 2. Peta dokumen

| File | Isi | Kapan dibaca |
|---|---|---|
| `AGENTS.md` | Kontrak kerja, aturan keras, protokol sesi | Selalu, pertama |
| `docs/01-PROJECT-OVERVIEW.md` | Konteks bisnis, persona, alur pengguna, data menu | Awal project |
| `docs/02-REQUIREMENTS.md` | Requirement ber-ID + kriteria penerimaan | Sebelum membuat fitur apa pun |
| `docs/03-DECISIONS.md` | Keputusan final, asumsi, pertanyaan terbuka | Sebelum mengubah/menebak apa pun |
| `docs/04-ARCHITECTURE.md` | Struktur folder, kontrak API, alur data, keamanan | Sebelum menulis kode |
| `docs/05-DATABASE.md` | Skema SQL, RLS, storage, realtime, seed | Sebelum menyentuh DB |
| `docs/06-DESIGN-SYSTEM.md` | Warna, tipografi, layout, wireframe | Sebelum menulis UI |
| `docs/07-FEATURES-SPEC.md` | Perilaku per halaman, validasi, teks UI | Saat mengerjakan halaman |
| `docs/08-CODING-STANDARDS.md` | Aturan kode, pola acuan, testing | Saat menulis kode |
| `docs/09-ROADMAP.md` | Fase kerja + checklist uji | Memilih tugas berikutnya |
| `docs/10-CONTEXT-LOG.md` | **Status terkini**, handoff antar sesi | Paling akhir dibaca, lalu lanjut |
| `docs/11-SHADCN-GUIDE.md` | Token shadcn, pemetaan komponen | Saat styling |

## 3. Urutan baca wajib (sebelum menulis kode apa pun)

1. `AGENTS.md` (ini)
2. `docs/03-DECISIONS.md` ← **paling krusial untuk mencegah melenceng**
3. `docs/02-REQUIREMENTS.md`
4. `docs/01-PROJECT-OVERVIEW.md`
5. `docs/04-ARCHITECTURE.md`
6. `docs/05-DATABASE.md`
7. `docs/06-DESIGN-SYSTEM.md` dan `docs/11-SHADCN-GUIDE.md`
8. `docs/07-FEATURES-SPEC.md`
9. `docs/08-CODING-STANDARDS.md`
10. `docs/09-ROADMAP.md`
11. `docs/10-CONTEXT-LOG.md` ← baca terakhir, lalu lanjutkan dari "Status saat ini"

Jika kamu tidak bisa membaca semua karena batas konteks, **minimal** baca `AGENTS.md`, `03`, `02`, dan `10`, lalu baca file lain yang relevan dengan tugas.

---

## 4. Aturan anti-bias & anti-lupa (WAJIB)

### 4.1 Jangan mengarang
- **Jangan menambah fitur** yang tidak ada di `02-REQUIREMENTS.md`. Ide tambahan dicatat di `10-CONTEXT-LOG.md` bagian "Usulan", **bukan dibuat**.
- **Jangan mengubah keputusan** di `03-DECISIONS.md` tanpa persetujuan eksplisit dari user.
- **Jangan mengasumsikan diam-diam.** Jika terpaksa berasumsi, tandai `[ASUMSI]`, catat di `03-DECISIONS.md` (tabel asumsi) dan `10-CONTEXT-LOG.md`, lalu sebutkan di responsmu.
- **Jangan menebak versi/API library.** Next.js, shadcn/ui, Tailwind, dan Supabase JS cepat berubah. Cek `package.json` dan dokumentasi resmi sebelum memakai API tertentu. Jangan menulis dari ingatan.
- **Jangan mengarang data.** Menu, harga, dan varian hanya yang ada di `01-PROJECT-OVERVIEW.md` dan seed di `05-DATABASE.md`.
- **Jangan mengarang aset.** Logo/maskot Cemal Cemul tidak tersedia; jangan menggambar ulang. Pakai teks sampai user memberi file.
- Hex warna di dokumen adalah **estimasi dari poster**. Jangan menyebutnya "resmi".

### 4.2 Jangan melenceng dari domain
- Ini **kasir kecil**, bukan ERP. **Tidak ada**: login/auth, multi-user, multi-cabang, stok/inventori, laporan keuangan lanjutan, cetak struk, payment gateway, delivery, reservasi, loyalty, mode gelap.
- Dapur **tidak melihat harga atau pembayaran**.
- Foto bukti bayar **opsional**, termasuk untuk tunai.
- Admin/kelola menu **menyatu di role Kasir**, bukan role ketiga.

### 4.3 Jaga konteks antar sesi
- Setelah menyelesaikan satu tugas, **perbarui `docs/10-CONTEXT-LOG.md`** dan **centang `docs/09-ROADMAP.md`** (hanya bila benar-benar selesai dan diuji).
- Setiap perubahan skema DB wajib tercermin di `docs/05-DATABASE.md` dan dicatat di `10-CONTEXT-LOG.md`.
- Setiap perubahan perilaku wajib tercermin di `docs/07-FEATURES-SPEC.md`.
- Jika sesi panjang dan konteks mulai kabur, **baca ulang `AGENTS.md` dan `03-DECISIONS.md`**.
- **Sumber kebenaran adalah isi repo**, bukan ingatan percakapan.

### 4.4 Jujur dan transparan
- Jangan klaim "sudah jalan/teruji" jika belum dijalankan. Sebut apa yang diuji, bagaimana, dan hasilnya; sebut juga yang belum diuji.
- Jika tidak yakin, katakan terus terang dan beri opsi dengan trade-off.
- Laporkan error apa adanya. Jangan menyembunyikan, memotong, atau "memperbaiki diam-diam" yang mengubah perilaku.
- Jangan meminta user menempelkan secret (URL/key Supabase) di chat. Minta mereka mengisi `.env.local` sendiri.

### 4.5 Jebakan umum yang harus dihindari
| Jebakan | Yang benar |
|---|---|
| Mengira ada login karena ada "role" | Role hanyalah pemisah tampilan, **bukan keamanan** |
| Menaruh service role key di client | Hanya server, `import 'server-only'` |
| Mempercayai total dari client | Hitung ulang di server |
| Memakai harga menu terkini untuk riwayat | Pakai snapshot di `order_items` |
| Menampilkan harga di Dapur | Dilarang |
| Mewajibkan foto bukti | Opsional |
| Menambah struk/print | Di luar scope (D6) |
| Menyalin warna hijau dari referensi UI | Warna ikut poster Cemal Cemul (D8) |
| Menulis UI berbahasa Inggris | UI Indonesia |
| Memakai float untuk uang | Integer rupiah |
| Menambah library besar | Cek dulu apakah shadcn/Tailwind cukup |
| Mengubah `components/ui/*` sembarangan | Bungkus lewat `components/shared` |
| Mencentang roadmap sebelum diuji | Centang hanya bila selesai dan teruji |

---

## 5. Aturan keras (hard rules)

| # | Aturan |
|---|---|
| H1 | Tanpa login. Role dipilih di `/`, disimpan di cookie `pos_role`. |
| H2 | `SUPABASE_SERVICE_ROLE_KEY` **hanya di server**; tidak boleh berawalan `NEXT_PUBLIC_`; tidak boleh ada di bundle client. |
| H3 | Semua tulis data lewat Route Handler / Server Action. Client tidak menulis langsung ke Supabase. |
| H4 | `order_items.name` dan `.price` adalah **snapshot**. Riwayat tidak boleh berubah saat menu diedit. |
| H5 | Total **dihitung ulang di server** memakai harga dari DB. |
| H6 | Teks UI berbahasa **Indonesia**; kode, nama variabel, komentar teknis berbahasa Inggris. |
| H7 | Uang = integer rupiah. Tampilan: `Rp 15.000` via `Intl.NumberFormat('id-ID')`. |
| H8 | Gunakan komponen shadcn/ui lebih dulu sebelum membuat komponen kustom. |
| H9 | Responsive: laptop, tablet, HP. Di HP keranjang = bottom sheet. |
| H10 | Jangan commit `.env.local`. |
| H11 | Status pesanan hanya `baru`, `dimasak`, `selesai`, dengan transisi maju saja. |
| H12 | Kegagalan upload bukti bayar **tidak boleh** membatalkan pesanan. |
| H13 | Tidak ada warna hardcode (hex) di komponen; pakai token. |
| H14 | Setiap aksi destruktif memakai `AlertDialog` konfirmasi. |

---

## 6. Protokol sesi

### 6.1 Awal sesi
1. Baca dokumen sesuai bagian 3.
2. Ringkas dalam 3–5 kalimat apa yang kamu pahami sebagai status saat ini (dari `10-CONTEXT-LOG.md`).
3. Sebutkan tugas yang akan dikerjakan (dari `09-ROADMAP.md`, urut dari atas yang belum dicentang) dan minta konfirmasi bila ambigu.

### 6.2 Selama sesi
- Kerjakan **satu tugas kecil** sekali waktu.
- Jelaskan file yang dibuat/diubah dan alasannya.
- Jangan menulis ulang file besar bila perubahan kecil cukup.
- Jalankan lint, type-check, test, atau build bila memungkinkan.
- Bila menemukan kontradiksi antar dokumen, **berhenti dan laporkan**, jangan memilih sendiri.

### 6.3 Akhir sesi
1. Perbarui `docs/10-CONTEXT-LOG.md` memakai template di file itu.
2. Perbarui centang `docs/09-ROADMAP.md`.
3. Tutup respons dengan format di bagian 7.

---

## 7. Format respons akhir (wajib)

```
**Selesai:** (apa yang dikerjakan)
**File berubah:** (daftar)
**Diuji:** (apa & hasil)  |  **Belum diuji:** (apa)
**Asumsi baru / keputusan:** (jika ada)
**Masalah terbuka:** (jika ada)
**Berikutnya:** (tugas roadmap selanjutnya)
**Pertanyaan untuk user:** (jika ada)
```

---

## 8. Kapan HARUS bertanya (jangan menebak)

- Requirement ambigu atau dua dokumen bertentangan.
- Perlu mengubah skema DB, status, atau alur utama.
- Perlu menambah dependensi besar.
- Perlu aset yang tidak ada (logo, foto produk, hex asli).
- Ada hal yang menyentuh keamanan/data yang tidak tercakup dokumen.
- Pengguna meminta sesuatu yang melanggar `03-DECISIONS.md` (ingatkan, tawarkan opsi).

## 9. Kapan BOLEH memutuskan sendiri

- Detail implementasi kecil yang tidak mengubah perilaku (nama variabel internal, pemecahan komponen).
- Pilihan visual minor yang konsisten dengan `06` dan `11`.
- Perbaikan bug yang jelas tanpa mengubah requirement.

Selain itu, ikuti dokumen.

---

## 10. Definition of Done (ringkas)

- [ ] Sesuai `02-REQUIREMENTS.md` dan kriteria penerimaannya
- [ ] Tidak melanggar `03-DECISIONS.md`
- [ ] Tidak ada fitur di luar scope
- [ ] Tidak ada secret bocor ke client
- [ ] Teks UI Indonesia; uang terformat benar
- [ ] Dicek di 375px, 768px, 1280px
- [ ] Loading, empty, dan error state ditangani
- [ ] Validasi di client **dan** server
- [ ] `09-ROADMAP.md` dan `10-CONTEXT-LOG.md` diperbarui

---

## 11. Template prompt untuk user (menjaga AI tetap di jalur)

Awal sesi:
> Baca `AGENTS.md`, lalu ikuti urutan baca di sana. Ringkas status terkini dari `docs/10-CONTEXT-LOG.md`, lalu kerjakan tugas berikutnya di `docs/09-ROADMAP.md`.

Bila AI melenceng:
> Berhenti. Baca ulang `AGENTS.md` bagian 4 dan `docs/03-DECISIONS.md`. Apa yang barusan kamu lakukan yang tidak ada di requirement?

Akhir sesi:
> Perbarui `docs/10-CONTEXT-LOG.md` dan `docs/09-ROADMAP.md`, lalu beri ringkasan dengan format di `AGENTS.md` bagian 7.
