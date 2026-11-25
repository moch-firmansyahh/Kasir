# 09 — Roadmap & Checklist

Kerjakan **berurutan**. Centang **hanya** bila selesai **dan** diuji. Setiap tugas merujuk ID requirement (`02`). Satu fase ≈ satu atau beberapa sesi kerja rapi. Jangan melompat fase tanpa alasan.

Legenda: `[ ]` belum · `[x]` selesai & teruji · `(S)` sebaiknya ada

---

## Fase 0 — Persiapan (blocker bila belum)
- [ ] Tanyakan/konfirmasi pertanyaan terbuka di `03-DECISIONS.md` §5 (atau catat bahwa belum dijawab dan lanjut dengan asumsi)
- [ ] User menjalankan SQL `05-DATABASE.md` (skema, trigger, RPC, seed)
- [ ] User membuat bucket `payment-proofs` dan `menu-images`
- [ ] User mengaktifkan Realtime untuk `orders`
- [ ] User mengatur RLS (§9 di `05`)
- [ ] User mengisi `.env.local` dari `.env.example` (**tidak** di chat)
- **Uji:** query sederhana ke tabel `menu_items` dari server berhasil

## Fase 1 — Fondasi
- [ ] Init Next.js (TypeScript, App Router, Tailwind); cek versi di `package.json`
- [ ] Init shadcn/ui; pasang komponen dasar (`11`)
- [ ] Token tema + font (`06`, `11`) — kontras dicek
- [ ] `lib/supabase/server.ts` (+ `server-only`), `lib/supabase/client.ts`
- [ ] `lib/format.ts`, `lib/api.ts`, `lib/validators.ts`, `types/*`
- [ ] `lib/pricing.ts` + unit test (tabel di `08` §7)
- [ ] `lib/role.ts`, `RoleGuard`, `RoleSwitcher` — FR-ROLE-01..05
- [ ] Halaman `/`
- [ ] Layout Kasir (sidebar desktop, bottom nav HP, header)
- **Uji:** FR-ROLE AC; build lolos; tema tampil benar

## Fase 2 — POS: katalog & keranjang
- [ ] `GET /api/menu` — FR-POS-04
- [ ] Grid menu, `MenuCard`, pencarian, `CategoryTabs` — FR-POS-01..03
- [ ] Store keranjang Zustand (`CartLine`, key gabung) — FR-POS-05, 07
- [ ] `VariantDialog` (aturan `variant_pick`, A9) — FR-POS-06
- [ ] Catatan item — FR-POS-08
- [ ] `Summary` total otomatis (pakai `calculateTotals`) — FR-POS-09
- [ ] Diskon persen/nominal + validasi — FR-POS-11
- [ ] Pajak dari `GET /api/settings` — FR-POS-12
- [ ] Data pesanan (tipe, nama, meja, catatan) — FR-POS-10
- [ ] Panel kanan desktop, drawer tablet, bottom sheet HP — FR-POS-18
- **Uji:** T1–T5, T14

## Fase 3 — Pembayaran, Place Order, Bukti
- [ ] `PaymentPanel` (Tunai/QRIS/Transfer) — FR-POS-13
- [ ] Kembalian tunai (S) — FR-POS-17
- [ ] `POST /api/orders` (zod, validasi varian/menu, hitung ulang, snapshot, RPC) — FR-POS-15
- [ ] Penanganan gagal tanpa kehilangan keranjang — FR-POS-16
- [ ] `ProofCapture` (kamera, kompres, pratinjau) — FR-POS-14
- [ ] `POST /api/orders/[id]/proof` + simpan URL
- [ ] Upload gagal tidak membatalkan pesanan (H12)
- [ ] Cegah klik ganda
- **Uji:** T6, T7; cek DB: snapshot & total benar

## Fase 4 — Dapur
- [ ] `GET /api/kitchen/orders` (tanpa uang) — FR-KIT-05
- [ ] Halaman `/dapur`, `OrderCard`, `StatusBadge`, tab Aktif/Selesai — FR-KIT-02, 04, 06
- [ ] `PATCH /api/orders/[id]/status` + validasi transisi — FR-KIT-03
- [ ] Realtime subscribe + debounce refetch + indikator + polling cadangan — FR-KIT-01, 07
- [ ] Bunyi notifikasi (S) — FR-KIT-08
- [ ] Penanda lama menunggu (S) — FR-KIT-09
- [ ] Wake Lock (S) — FR-KIT-10
- **Uji:** T8, T9, T13, T15

## Fase 5 — Kelola Menu, Riwayat, Pengaturan
- [ ] `POST/PATCH/DELETE /api/menu`, `/api/categories` — FR-MENU-01..08
- [ ] UI Kelola Menu + `VariantEditor` + validasi — FR-MENU-02..07
- [ ] Upload gambar menu (S) — FR-MENU-09
- [ ] `GET /api/orders`, `GET /api/orders/[id]`
- [ ] Riwayat + detail + tampil bukti — FR-HIST-01..03
- [ ] Tambah/ganti bukti dari Riwayat — FR-HIST-04
- [ ] Status terlihat di Kasir — FR-HIST-05
- [ ] Filter tanggal + ringkasan (S) — FR-HIST-06, 07
- [ ] Pengaturan (nama toko, pajak) — FR-SET-01, 02
- **Uji:** T10, T11

## Fase 6 — Finishing & Audit
- [ ] Loading/empty/error state di semua halaman — NFR-04
- [ ] Uji responsive 375/768/1280 — NFR-01
- [ ] Audit aksesibilitas dasar (label, fokus, kontras) — NFR-03
- [ ] Audit keamanan: bundle client tanpa service key; DOM Dapur tanpa uang — NFR-06
- [ ] Semua skenario T1–T15 dijalankan dan dicatat
- [ ] Rapikan: hapus console.log, kode mati
- [ ] README ringkas (cara menjalankan, env, setup Supabase)
- [ ] Deploy (bila diminta) + set env + `remotePatterns`
- [ ] Serah terima: ringkasan keterbatasan (tanpa login, bucket publik, dll.)

---

## Tabel risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Tanpa login | Siapa pun bisa mengakses | Diterima (D1); tawarkan PIN bila diminta |
| Anon key bisa membaca `orders` | Data pesanan terbaca | Opsi B Broadcast (`04` §7) |
| Bucket bukti publik | Foto bisa dibuka lewat URL | Nama acak; opsi bucket privat |
| Realtime putus | Dapur tidak update | Polling cadangan + indikator |
| Autoplay bunyi diblokir | Notifikasi tak bunyi | Tombol "Aktifkan bunyi" |
| Kamera tidak tersedia | Foto tak bisa diambil | Fallback file picker |
| Harga berubah saat transaksi | Selisih total | Server memakai harga DB, beri tahu UI |

## Definition of Done (per fitur)

1. Berfungsi sesuai spec (`07`) dan AC (`02`).
2. Tidak melanggar keputusan final (`03`).
3. Teruji manual (catat apa & hasil) / unit test untuk logika murni.
4. Responsive di 375/768/1280.
5. Loading/empty/error ditangani.
6. Validasi client + server.
7. `09-ROADMAP.md` dan `10-CONTEXT-LOG.md` diperbarui.

## Urutan prioritas bila waktu terbatas (MVP)

1. Fase 0–1 (fondasi)
2. Fase 2–3 (POS + Place Order)
3. Fase 4 (Dapur)
4. Fase 5 bagian kelola menu
5. Sisanya (Riwayat lengkap, pengaturan, (S))
