# 10 — Context Log (STATUS TERKINI & HANDOFF)

> **Bagian paling penting untuk melanjutkan kerja.** Baca "Status saat ini" dahulu, lalu lanjutkan dari sana.
> **Perbarui file ini di akhir setiap sesi.** Entri baru ditaruh di **atas** bagian Riwayat Sesi.
> Jangan menghapus riwayat; tandai yang usang.

---

## 1. Status saat ini

| Item | Nilai |
|---|---|
| Fase aktif | Fase 0 (belum ada kode) |
| Terakhir selesai | Dokumen konteks dibuat (`AGENTS.md` + `docs/01–11`) |
| Berikutnya | Fase 0: konfirmasi pertanyaan terbuka, jalankan SQL, siapkan `.env.local` |
| Blocker | Menunggu user: hex warna asli, logo, jawaban pertanyaan terbuka, kredensial Supabase (diisi user sendiri di `.env.local`) |
| Versi stack terpasang | _(isi setelah init: Next.js, React, Tailwind, shadcn, supabase-js)_ |
| Branch/commit terakhir | _(isi)_ |

## 2. Ringkasan satu paragraf untuk sesi baru

Cemal Cemul POS: Next.js fullstack + shadcn + Supabase. Tanpa login, pilih role Kasir/Dapur. Kasir: POS (menu, varian, keranjang, total otomatis, diskon, pajak, metode bayar, foto bukti opsional), Kelola Menu, Riwayat, Pengaturan. Dapur: pesanan realtime tanpa data uang, ubah status Baru → Dimasak → Selesai. Server memakai service role; client hanya anon untuk Realtime. UI Indonesia, palet poster Cemal Cemul. Lihat `AGENTS.md`.

## 3. Pertanyaan terbuka untuk user

| # | Pertanyaan | Terkait | Default sementara |
|---|---|---|---|
| Q1 | Hex warna asli poster? | A1 | estimasi di `06` |
| Q2 | French Toast & Single Cemul pilih berapa varian? | A2 | 1 |
| Q3 | Couple Cemul boleh dua rasa sama? | A9 | boleh |
| Q4 | Metode bayar wajib dipilih? | A7 | wajib |
| Q5 | Dapur perlu bisa memundurkan status? | A8 | tidak |
| Q6 | Nomor pesanan reset harian? | A11 | tidak |
| Q7 | Ada kasus "bayar nanti"? | A10 | tidak ada |
| Q8 | Perlu pembatalan pesanan? | OOS-12 | tidak |
| Q9 | Data pesanan boleh terbaca via anon key, atau pakai Broadcast? | A12 | Opsi A |
| Q10 | File logo/maskot? | A13 | teks saja |
| Q11 | Perlu bunyi notifikasi di Dapur? | FR-KIT-08 | ya (opsional) |
| Q12 | Keranjang dipertahankan saat refresh? | `04` §9 | tidak |

## 4. Asumsi aktif `[ASUMSI]`

Daftar lengkap ada di `03-DECISIONS.md` §2 (A1–A13). Asumsi baru yang muncul saat bekerja **ditulis di sini** dan dipindahkan ke `03` setelah disetujui.

| Tanggal | ID | Asumsi | Status |
|---|---|---|---|
| — | — | — | — |

## 5. Usulan fitur (BELUM disetujui — JANGAN dibuat)

- _(kosong)_

## 6. Perubahan skema DB sejak awal

| Tanggal | Perubahan | Alasan | File migrasi |
|---|---|---|---|
| — | — | — | — |

## 7. Masalah / bug terbuka

| ID | Deskripsi | Tingkat | Status |
|---|---|---|---|
| — | — | — | — |

## 8. Utang teknis / catatan

- _(kosong)_

## 9. Hasil uji terakhir

| Skenario | Hasil | Tanggal | Catatan |
|---|---|---|---|
| — | — | — | — |

## 10. Riwayat sesi (terbaru di atas)

### Sesi 0 — Perencanaan
- Requirement dipahami dan dikonfirmasi user.
- Keputusan D1–D15 dan asumsi A1–A13 dicatat.
- Dokumen konteks dibuat: `AGENTS.md`, `docs/01–11`, `.env.example`.
- Belum ada kode.

---

## Template entri sesi

```
### Sesi N — judul singkat (YYYY-MM-DD)
- Tujuan:
- Dikerjakan (ID requirement/roadmap):
- File dibuat/diubah:
- Diuji (apa, cara, hasil):
- Belum diuji:
- Keputusan/asumsi baru:
- Perubahan skema:
- Masalah terbuka:
- Berikutnya:
```

## Checklist akhir sesi

- [ ] `09-ROADMAP.md` dicentang hanya untuk yang selesai & teruji
- [ ] Entri sesi ditambahkan di atas
- [ ] Status saat ini (§1) diperbarui
- [ ] Asumsi/usulan/masalah baru dicatat
- [ ] Dokumen terkait (`05`, `07`, dll.) diperbarui bila ada perubahan
