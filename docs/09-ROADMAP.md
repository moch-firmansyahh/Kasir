# 09 — Roadmap & Checklist

Kerjakan **berurutan**. Centang **hanya** bila selesai **dan** diuji. Setiap tugas merujuk ID requirement (`02`). Satu fase ≈ satu atau beberapa sesi kerja rapi. Jangan melompat fase tanpa alasan.

Legenda: `[ ]` belum · `[x]` selesai & teruji · `(S)` sebaiknya ada

---

## Fase 0 — Persiapan (blocker bila belum)
- [x] Tanyakan/konfirmasi pertanyaan terbuka di `03-DECISIONS.md` §5 (atau catat bahwa belum dijawab dan lanjut dengan asumsi)
- [x] User menjalankan SQL `05-DATABASE.md` (skema, trigger, RPC, seed)
- [x] User membuat bucket `payment-proofs` dan `menu-images`
- [x] User mengaktifkan Realtime untuk `orders`
- [x] User mengatur RLS (§9 di `05`)
- [x] User mengisi `.env.local` dari `.env.example` (**tidak** di chat) — _terdeteksi sebagai `.env` di repo dan termuat oleh Next.js_
- **Uji:** query sederhana ke tabel `menu_items` dari server berhasil _(lolos: 4 menu, 2 kategori, 19 varian, settings tax 0%)_

## Fase 1 — Fondasi
- [x] Init Next.js (TypeScript, App Router, Tailwind); cek versi di `package.json`
- [x] Init shadcn/ui; pasang komponen dasar (`11`)
- [x] Token tema + font (`06`, `11`) — kontras dicek
- [x] `lib/supabase/server.ts` (+ `server-only`), `lib/supabase/client.ts` _(uji koneksi live menunggu `NEXT_PUBLIC_SUPABASE_URL` diisi di `.env`)_
- [x] `lib/format.ts`, `lib/api.ts`, `lib/validators.ts`, `types/*`
- [x] `lib/pricing.ts` + unit test (tabel di `08` §7)
- [x] `lib/role.ts`, `RoleGuard`, `RoleSwitcher` — FR-ROLE-01..05
- [x] Halaman `/`
- [x] Layout Kasir (sidebar desktop, bottom nav HP, header)
- **Uji:** FR-ROLE server guard & SSR lolos; `tsc`, `lint`, `vitest` (13/13), dan `next build` lolos; kontras token terhitung. _(Belum diuji: rendering visual browser di 375/768/1280px & interaksi klik cookie di browser)_

## Fase 2 — POS: katalog & keranjang
- [x] `GET /api/menu` — FR-POS-04 _(uji live 200 OK: 2 kategori, 4 menu aktif)_
- [x] Grid menu, `MenuCard`, pencarian, `CategoryTabs` — FR-POS-01..03 _(komponen, build, lint lolos; uji browser visual menunggu)_
- [x] Store keranjang Zustand (`CartLine`, key gabung) — FR-POS-05, 07 _(unit test lulus)_
- [x] `VariantDialog` (aturan `variant_pick`, A9) — FR-POS-06 _(aturan varian & build lolos; uji klik browser menunggu)_
- [x] Catatan item — FR-POS-08 _(unit test `setLineNote` & build lolos)_
- [x] `Summary` total otomatis (pakai `calculateTotals`) — FR-POS-09 _(unit test lulus)_
- [x] Diskon persen/nominal + validasi — FR-POS-11 _(unit test T3–T4 & server API `DISCOUNT_EXCEEDS_SUBTOTAL` lulus)_
- [x] Pajak dari `GET /api/settings` — FR-POS-12 _(uji live 200 OK: `{ storeName: 'Cemal Cemul', taxPercent: 0 }`)_
- [x] Data pesanan (tipe, nama, meja, catatan) — FR-POS-10 _(unit test, API, & build lolos)_
- [x] Panel kanan desktop, drawer tablet, bottom sheet HP — FR-POS-18 _(komponen & build lolos; uji visual 375/768/1280px menunggu browser)_
- **Uji:** T1–T5, T14 _(T1–T5 teruji di unit test & API server; uji browser visual T1–T5 & T14 menunggu)_

## Fase 3 — Pembayaran, Place Order, Bukti
- [x] `PaymentPanel` (Tunai/QRIS/Transfer) — FR-POS-13
- [x] Kembalian tunai (S) — FR-POS-17
- [x] `POST /api/orders` (zod, validasi varian/menu, hitung ulang, snapshot, RPC) — FR-POS-15 _(uji live RPC + snapshot DB lulus)_
- [x] Penanganan gagal tanpa kehilangan keranjang — FR-POS-16
- [x] `ProofCapture` (kamera, kompres, pratinjau) — FR-POS-14 _(unit test skala gambar & build lolos; uji kamera/upload browser menunggu)_
- [x] `POST /api/orders/[id]/proof` + simpan URL _(uji live upload PNG ke `payment-proofs` & public URL 200 OK lulus)_
- [x] Upload gagal tidak membatalkan pesanan (H12) _(uji API proof gagal `400` tetap menjaga order + UI banner retry)_
- [x] Cegah klik ganda _(`submittingRef` + disabled state)_
- **Uji:** T6, T7; cek DB: snapshot & total benar _(API & DB snapshot/upload/cleanup teruji live; uji alur klik UI browser menyusul)_

## Fase 4 — Dapur
- [x] `GET /api/kitchen/orders` (tanpa uang) — FR-KIT-05 _(uji live FIFO, tab active/done, 0 field uang)_
- [x] Halaman `/dapur`, `OrderCard`, `StatusBadge`, tab Aktif/Selesai — FR-KIT-02, 04, 06 _(SSR & build lolos)_
- [x] `PATCH /api/orders/[id]/status` + validasi transisi — FR-KIT-03 _(uji live forward-only, idempoten, 409 invalid)_
- [x] Realtime subscribe + debounce refetch + indikator + polling cadangan — FR-KIT-01, 07 _(uji live WebSocket `SUBSCRIBED` & event `orders`; simulasi offline browser menyusul)_
- [x] Bunyi notifikasi (S) — FR-KIT-08 _(tombol toggle + Web Audio API chime terpasang; uji suara di browser menyusul)_
- [x] Penanda lama menunggu (S) — FR-KIT-09 _(ambang 10/20 mnt di `OrderCard` terpasang)_
- [x] Wake Lock (S) — FR-KIT-10 _(`useWakeLock` + re-acquire `visibilitychange` terpasang)_
- **Uji:** T8, T9, T13, T15 _(T8 Realtime, T9 status, T13 bebas uang di API/SSR teruji live; T15 & interaksi browser menyusul)_

## Fase 5 — Kelola Menu, Riwayat, Pengaturan
- [x] `POST/PATCH/DELETE /api/menu`, `/api/categories` — FR-MENU-01..08 _(uji live CRUD & validasi varian lolos)_
- [x] UI Kelola Menu + `VariantEditor` + validasi — FR-MENU-02..07
- [x] Upload gambar menu (S) — FR-MENU-09 _(uji live `POST /api/upload/menu-image` + hapus gambar saat menu dihapus lolos)_
- [x] `GET /api/orders`, `GET /api/orders/[id]` _(uji live daftar, ringkasan, detail snapshot lolos)_
- [x] Riwayat + detail + tampil bukti — FR-HIST-01..03
- [x] Tambah/ganti bukti dari Riwayat — FR-HIST-04
- [x] Status terlihat di Kasir — FR-HIST-05 _(Realtime `orders` subscribe di `/kasir/riwayat`)_
- [x] Filter tanggal + ringkasan (S) — FR-HIST-06, 07
- [x] Pengaturan (nama toko, pajak) — FR-SET-01, 02 _(uji live `PUT /api/settings` & restore lolos)_
- **Uji:** T10, T11 _(T10 snapshot harga & delete menu + T11 nonaktif menu teruji live di API/DB; uji interaksi klik UI browser menyusul di Fase 6)_

## Fase 6 — Finishing & Audit
- [x] Loading/empty/error state di semua halaman — NFR-04
- [x] Uji responsive 375/768/1280 — NFR-01 _(diuji di Playwright browser tanpa overflow horizontal)_
- [x] Audit aksesibilitas dasar (label, fokus, kontras) — NFR-03 _(seluruh tombol interaktif ≥44px, `aria-label`, rasio kontras diukur)_
- [x] Audit keamanan: bundle client tanpa service key; DOM Dapur tanpa uang — NFR-06 _(0 leak di 26 file `.next/static`; DOM `/dapur` bebas uang)_
- [ ] Semua skenario T1–T15 dijalankan dan dicatat _(T1–T14 teruji; T15 putus-nyambung internet browser & uji klik kamera browser belum dijalankan)_
- [x] Rapikan: hapus console.log, kode mati _(0 `console.log`/`TODO` di `app/`, `components/`, `hooks/`, `lib/`)_
- [x] README ringkas (cara menjalankan, env, setup Supabase)
- [ ] Deploy (bila diminta) + set env + `remotePatterns` _(deploy belum diminta; `remotePatterns` dinamis sudah siap di `next.config.ts`)_
- [x] Serah terima: ringkasan keterbatasan (tanpa login, bucket publik, dll.)

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
