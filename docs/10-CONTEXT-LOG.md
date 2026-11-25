# 10 — Context Log (STATUS TERKINI & HANDOFF)

> **Bagian paling penting untuk melanjutkan kerja.** Baca "Status saat ini" dahulu, lalu lanjutkan dari sana.
> **Perbarui file ini di akhir setiap sesi.** Entri baru ditaruh di **atas** bagian Riwayat Sesi.
> Jangan menghapus riwayat; tandai yang usang.

---

## 1. Status saat ini

| Item | Nilai |
|---|---|
| Fase aktif | Fase 6 selesai (Audit, README, & Serah Terima) |
| Terakhir selesai | Integrasi logo (`/Logo_cemal_cemul.png`) di `/`, Kasir, Dapur, favicon + 4 gambar menu di `public/` ke DB `menu_items` + verifikasi Playwright |
| Berikutnya | Siap dipakai lokal (`npm run dev`) atau deploy bila diminta user (plus uji manual kamera & simulasi offline `T15` di perangkat target) |
| Blocker | Tidak ada. `DB-01` selesai setelah user menjalankan `GRANT` SQL. |
| Versi stack terpasang | Next.js `16.4.6`, React `19.3.0`, React DOM `19.3.0`, Tailwind CSS `4.3.3`, shadcn `4.23.0` (`radix-nova`, `radix-ui 1.8.1`), `@supabase/supabase-js 2.119.2`, `zod 4.6.7`, `zustand 5.1.0`, `lucide-react 1.80.0`, `sonner 2.0.8`, `vitest 4.1.12` |
| Branch/commit terakhir | _(belum ada commit baru)_ |

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
| 2026-11-25 | Menambahkan pernyataan `GRANT` eksplisit untuk `service_role` dan `anon` di `docs/05-DATABASE.md` §9 | Query REST ke seluruh tabel mengembalikan `42501 permission denied` meskipun key `sb_secret_...` valid (perlu dijalankan user di SQL Editor) | `docs/05-DATABASE.md` §9 |

## 7. Masalah / bug terbuka

| ID | Deskripsi | Tingkat | Status |
|---|---|---|---|
| ENV-01 | `NEXT_PUBLIC_SUPABASE_URL` di `.env` kosong. | Sedang | Selesai (user sudah mengisi; URL valid) |
| DB-01 | Seluruh tabel schema `public` (`categories`, `menu_items`, `menu_variants`, `settings`, `orders`, `order_items`) mengembalikan `42501: permission denied` untuk `service_role` dan `anon`. | Tinggi | Selesai (user sudah menjalankan SQL `GRANT`; query tabel, RPC `create_order`, dan upload bukti teruji live) |

## 8. Utang teknis / catatan

- `cacheComponents: true` & `partialPrefetching: true` dihapus dari `next.config.ts` agar route dinamis berbasis `cookies()` (`/` dan `RoleGuard`) dirender dinamis standar Next.js App Router tanpa error `<Suspense>`.
- File environment user bernama `.env` (bukan `.env.local`); Next.js 16.4.6 memuatnya dan `.gitignore` mengabaikan `.env*` sementara `.env.example` tetap terlacak di git.
- `npm run build` di lingkungan sandbox Windows mengalami `EPERM` saat membuat/menulis `.next` (dan `tsc` tanpa `--incremental false` saat menulis `tsconfig.tsbuildinfo`), sehingga `next build` dijalankan di luar sandbox.
- Rasio kontras WCAG terukur untuk palet `11-SHADCN-GUIDE.md`: `bg/fg` `11.32:1`, `primary/fg` `5.09:1`, `accent/fg` `6.47:1`, `yellow/fg` `6.95:1`, `card/muted-fg` `4.89:1`, `secondary/white` `4.11:1` (aman untuk teks besar/badge), `destructive/white` `3.96:1`, `muted/muted-fg` `3.70:1`.
- `Toaster` di `app/layout.tsx` dipaksa `theme="light"` agar tidak terpengaruh OS dark mode (OOS-10) tanpa mengedit `components/ui/sonner.tsx`.

## 9. Hasil uji terakhir

| Skenario | Hasil | Tanggal | Catatan |
|---|---|---|---|
| Query server Fase 0 (`menu_items`, `categories`, `menu_variants`, `settings`) | Lolos | 2026-11-25 | 2 kategori, 4 menu, 19 varian, settings tax 0% |
| Probe live `GET /api/menu` & `GET /api/settings` | Lolos (`200 OK`) | 2026-11-25 | Mengembalikan data seed Cemal Cemul lengkap |
| `npx tsc --noEmit --incremental false` | Lolos (0 error) | 2026-11-25 | Seluruh file Fase 1–3 |
| `npm run lint` | Lolos (0 error/warning) | 2026-11-25 | ESLint Next.js 16.4.6 |
| `npx vitest run --configLoader native` | Lolos (3 file, 21 test) | 2026-11-25 | `pricing.test.ts` (7), `cart-store.test.ts` (7), `core-helpers.test.ts` (7) |
| `npm run build` | Lolos | 2026-11-25 | Termasuk `/api/orders` & `/api/orders/[id]/proof` |
| Uji live `POST /api/orders` + RPC + snapshot DB (T2, T4, T6) | Lolos | 2026-11-25 | Reject varian/diskon invalid (`400`), create `201` (44.000 - 4.400 = 39.600), snapshot `order_items` terverifikasi lalu dibersihkan |
| Uji live `POST /api/orders/[id]/proof` (T7 / H12) | Lolos | 2026-11-25 | Reject MIME invalid (`400`) tanpa hapus order; upload PNG (`200`) + fetch URL publik (`200`) lalu dibersihkan |
| Uji live Fase 4 (`kitchen/orders`, `status`, Realtime, T8, T9, T13) | Lolos | 2026-11-25 | FIFO `true`, 0 field uang di API & `/dapur` SSR, transisi `baru→dimasak→selesai` + idempoten + `409` invalid, WebSocket `SUBSCRIBED` menerima event lalu dibersihkan |
| Uji live Fase 5 (CRUD menu/kategori, upload gambar, riwayat, settings, T10, T11) | Lolos | 2026-11-25 | Snapshot riwayat tetap 12.000/Pedas meski menu diedit/dihapus (`T10`), menu nonaktif hilang dari POS (`T11`), `PUT /api/settings` lalu dikembalikan & data uji dibersihkan |
| Scan keamanan & hex | Lolos | 2026-11-25 | 0 `SUPABASE_SERVICE_ROLE_KEY` / secret value di 26 file `.next/static`; 0 hex hardcode di `app/`, `components/`, `hooks/`, `lib/` |
| Uji Playwright browser (375/768/1280px, T1, T2, T13, T14) | Lolos | 2026-11-25 | 0 overflow horizontal di semua route, 0 console error/warning, VariantDialog validasi 2/3 disabled & 3/3 enabled, `/dapur` `Terhubung` & bebas `Rp ` |
| Uji visual aset `public/` (logo & 4 menu) di Playwright | Lolos | 2026-11-25 | `Logo_cemal_cemul.png` & 4 foto menu (`Mix_Platter.png`, `French_Toast.png`, `Single_cemul.png`, `Couple_Cemul.png`) ter-render (`complete: true, naturalWidth > 0`, 0 console error) |
| Perbaikan layout `TabsList` / `TabsTrigger` (`/dapur` & `OrderMeta`) | Lolos | 2026-11-25 | `group-data-horizontal/tabs:h-12` (48px) + trigger `h-10` (40px) terverifikasi di Playwright & screenshot |
| Sidebar tutup-buka, hapus teks "POS", dan `app/icon.png` | Lolos | 2026-11-25 | Sidebar toggle 240px↔80px (hanya logo+ikon saat ditutup), title `"Cemal Cemul"`, `hasPosText: false`, `/icon.png` 200 OK |
| Penghapusan `backdrop-blur` pada overlay pop-up & bar mobile | Lolos | 2026-11-25 | `backdropFilter: none`, overlay `bg-foreground/35` di `dialog`, `alert-dialog`, `sheet`, `drawer`, `KasirShell`, `CartSheetMobile` |
| Perbaikan lebar, tinggi laptop, dan tombol X pop-up (`Dialog`/`Sheet`) | Lolos | 2026-11-25 | `MenuForm` 2 kolom (`sm:max-w-3xl`, 768×643 di 1280×720), `Dialog` & `Sheet` tombol X 44×44px, `max-h-[90vh]` scroll native |
| Tombol tutup/buka sidebar Kasir dipindah ke tengah | Lolos | 2026-11-25 | Tombol 44×44px dipindah ke `top-1/2 -right-5 -translate-y-1/2` pada `aside` `sticky top-0 h-screen`; koordinat Y logo (`y=20`), nav (`y=97,147,197,247`), footer (`y=707`) identik (0px geser) di state buka (`240px`) & tutup (`80px`), `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Perbaikan transisi sidebar, duplikat Sheet keranjang, padding tabel, & `D17` (Nama customer wajib, hapus Dine In/Take Away/No. meja) | Lolos | 2026-11-25 | Koordinat X/Y logo (`x=19,y=20`), nav (`x=29,y=109`), role (`x=30.8,y=754`) tetap (0px loncat) selama & sesudah animasi 240↔80px; 1 Sheet di tablet (`768px`, `side=right`) & HP (`375px`, `side=bottom`), `Kosongkan` tidak bertabrakan dgn `X`; `MenuTable`/`OrderList` padding `pl-6/pr-6`; `POST /api/orders` tolak `customerName` kosong (`400`); `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Pilihan foto bukti bayar `Dari File` & `Foto Langsung` (`ProofCapture` + `ProofViewer`) | Lolos | 2026-11-25 | Komponen `ProofSourcePicker` + `CameraCaptureDialog` (`getUserMedia` di laptop & `capture="environment"` di touch device, fallback file); `fileInputHasCapture=false`, `camInputCapture="environment"`, tinggi tombol `44px`, upload simulasi file & pratinjau/ganti terverifikasi di Playwright, `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Kolom `Nama Customer` + pencarian nama/`#no` di Riwayat & panduan SQL reset harian `SQL-RESET-NO-HARIAN.md` | Lolos | 2026-11-25 | `/kasir/riwayat` (`1280px`) menampilkan search bar `"Cari nama customer atau #no..."` & kolom `Nama Customer`; `GET /api/orders?q=...` mengembalikan `200`; panduan SQL opsional dibuat di `docs/SQL-RESET-NO-HARIAN.md`; `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Ketahanan sinyal lemah & Offline Queue (Opsi 2 + Opsi 3) | Lolos | 2026-11-25 | Kompresi gambar `800px` JPEG `0.6`, persistensi keranjang `localStorage` (`cemal-cemul-cart`), cache katalog `posCache`, PWA `/manifest.webmanifest` (`200`) + `/sw.js` aktif, `IndexedDB` queue teruji penuh di Playwright offline (`setOffline(true)`): pesan antrean tersimpan, reload `/kasir` offline tetap menampilkan 4 menu & antrean, dialog `Antrean Pesanan Offline` & hapus `AlertDialog` lolos; `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Perbaikan scroll & overlap bottom sheet/drawer mobile (`390×844`) | Lolos | 2026-11-25 | `SheetContent` mobile memakai tinggi terikat `h-[88dvh]! max-h-[88dvh]! overflow-hidden`, `ScrollArea` di `Cart` & `OrderDetail` diganti `min-h-0 flex-1 overflow-y-auto overscroll-contain`, `OfflineQueueBar` & `VariantDialog` mobile dibuat `overflow-y-auto`; terverifikasi di screenshot mobile (`390×844`) tanpa tabrakan dengan tombol `Buat Pesanan` dan scroll berjalan mulus, `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Penyembunyian banner cache menu (berjalan senyap di latar belakang) | Lolos | 2026-11-25 | Banner `"Memakai daftar menu tersimpan (sinyal lemah)"` dihapus; `OfflineQueueBar` hanya tampil saat `!isOnline` atau `queuedOrders.length > 0`, `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Fix cache Service Worker usang di mode dev (`ServiceWorkerRegister` + `sw.js` v2) | Lolos | 2026-11-25 | `ServiceWorkerRegister` otomatis unregister SW & hapus Cache Storage saat `NODE_ENV !== "production"`, `sw.js` bump ke `v2` (`updateViaCache: "none"`), 0 kemunculan `"Memakai daftar menu tersimpan"` di kode, `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Dialog konfirmasi status pesanan Kasir (`OrderStatusDialog`) | Lolos | 2026-11-25 | Dialog konfirmasi hasil (`success`, `partial_proof`, `queued`, `error`) dengan ringkasan `#no`, customer, item, metode, total; `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Fix focus ring input terpotong di container scroll (`Cart`, `OrderDetail`, `OfflineQueueBar`, `MenuForm`, `VariantDialog`) | Lolos | 2026-11-25 | Tambahan padding horizontal `px-1` (`4px`) pada container `overflow-y-auto` agar `focus-visible:ring-3` (`3px`) tidak terpotong di kiri/kanan; terverifikasi Playwright (`insetLeft: 4, insetRight: 19, insetTop: 24`), `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Error boundary global/rute & optimasi perpindahan halaman Vercel (`sin1`, SWR cache, prefetch) | Lolos | 2026-11-25 | Ditambahkan `app/{error,global-error,not-found}.tsx`, `app/{kasir,dapur}/{error,loading}.tsx`, `vercel.json` (`regions: ["sin1"]`), `lib/settings-server.ts` (`unstable_cache` + `revalidateTag`), prefetch `KasirShell` & `RoleSelector`, serta SWR memory cache untuk `/kasir/menu`, `/kasir/riwayat`, `/kasir/pengaturan`; terverifikasi 404 Indonesia & revisit tab instan di Playwright, `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Open Graph link preview (`app/opengraph-image.tsx` + metadata `app/layout.tsx`) | Lolos | 2026-11-25 | Kartu OG statis `1200×630` PNG (`79.685` byte / ~78 KB, HTTP `200`) dengan `Logo_cemal_cemul.png` & `metadataBase` otomatis Vercel; tag `og:image`/`twitter:image` terverifikasi di SSR `/` & preview visual dicek; `tsc`/`lint`/`build`/`vitest` (22/22) lolos |
| Fix bug tidak bisa pindah role (Dapur → Ganti Role → Kasir) | Lolos | 2026-11-25 | Hapus `router.prefetch` yang memicu cache redirect `RoleGuard`, gunakan `window.location.assign` saat pilih role di `RoleSelector`, dan cegah `sw.js` (`v3`) menyimpan respons redirect; terverifikasi Playwright bolak-balik Dapur ↔ Kasir dengan 0 console error, `tsc`/`lint`/`build`/`vitest` (22/22) lolos |

## 10. Riwayat sesi (terbaru di atas)

### Sesi 8 — Implementasi Aset Logo & Gambar Menu di `public/` (2026-11-25)
- Tujuan: Mengintegrasikan `Logo_cemal_cemul.png` dan 4 gambar menu di `public/` (`Mix_Platter.png`, `French_Toast.png`, `Single_cemul.png`, `Couple_Cemul.png`) ke UI dan database.
- Dikerjakan (ID requirement/roadmap): `D16` (menggantikan `A3` & `A13`), `FR-POS-01`, `FR-MENU-01`, `app/layout.tsx`, `app/page.tsx`, `KasirShell.tsx`, `KitchenBoard.tsx`, `MenuCard.tsx`, `lib/validators.ts`, update DB `menu_items.image_url`.
- File dibuat/diubah: `app/layout.tsx`, `app/page.tsx`, `components/kasir/KasirShell.tsx`, `components/kitchen/KitchenBoard.tsx`, `components/pos/MenuCard.tsx`, `lib/validators.ts`, `docs/03-DECISIONS.md`, `docs/05-DATABASE.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): Update `menu_items` di Supabase berhasil untuk 4 item; `tsc --noEmit --incremental false` (0 error), `npm run lint` (0 error), `npx vitest run --configLoader native` (22/22 lulus), `npm run build` (lolos), Playwright check pada `/`, `/kasir`, `/kasir/menu`, `/dapur` (seluruh `<img>` aset `public/` termuat dengan `complete: true`, `naturalWidth > 0`, 0 console error).
- Belum diuji: Edit ulang menu lewat form UI `/kasir/menu` yang mempertahankan path `/...png` (validator server `imageUrlSchema` sudah diperbarui untuk menerima path `/...`).
- Keputusan/asumsi baru: `D16` ditambahkan di `docs/03-DECISIONS.md`; asumsi `A3` dan `A13` ditutup.
- Perubahan skema: Tidak ada perubahan kolom; seed SQL di `docs/05-DATABASE.md` §5 & 4 baris `menu_items` di Supabase diisi `image_url`.
- Masalah terbuka: Tidak ada.
- Berikutnya: Siap digunakan lokal (`npm run dev`) atau di-deploy bila diminta.

### Sesi 7 — Fase 6 Finishing, Audit, Browser QA, & Serah Terima (2026-11-25)
- Tujuan: Menjalankan audit aksesibilitas, keamanan, kebersihan kode, uji Playwright 375/768/1280px, melengkapi `README.md`, dan serah terima.
- Dikerjakan (ID requirement/roadmap): Fase 6 (`NFR-01`, `NFR-03`, `NFR-04`, `NFR-06`, `README.md`, audit `T1–T14`).
- File dibuat/diubah: `components/pos/{CartItem,ProofCapture,SearchBar,Cart}.tsx`, `components/menu-admin/{MenuTable,CategoryManager,VariantEditor}.tsx` (tombol interaktif dinaikkan ke `size-11` / ≥44px), `README.md`, `docs/09-ROADMAP.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): `tsc --noEmit --incremental false` (0 error), `npm run lint` (0 error), `npx vitest run --configLoader native` (22/22 lulus), `npm run build` (lolos 16 route), Playwright browser test pada `/`, `/kasir`, `/kasir/menu`, `/kasir/riwayat`, `/kasir/pengaturan`, `/dapur` di lebar 375px, 768px, 1280px (`T1`, `T2`, `T13`, `T14`, 0 horizontal scroll, 0 console error/warning), audit `console.log`/`TODO` (0 temuan), audit `.next/static` (0 leak di 26 file).
- Belum diuji: Simulasi putus-nyambung jaringan `T15` di browser dan uji kamera fisik/kompresi canvas di HP, serta deploy (tidak diminta).
- Keputusan/asumsi baru: Tidak ada.
- Perubahan skema: Tidak ada.
- Masalah terbuka: Tidak ada.
- Berikutnya: Siap digunakan lokal atau di-deploy sesuai permintaan user.

### Sesi 6 — Implementasi & Uji Live Fase 5 Kelola Menu, Riwayat, Pengaturan (2026-11-25)
- Tujuan: Menyelesaikan seluruh API dan UI Fase 5 (`FR-MENU-01..09`, `FR-HIST-01..07`, `FR-SET-01..02`).
- Dikerjakan (ID requirement/roadmap): `app/api/categories/{route,[id]/route}.ts`, `app/api/menu/{route,[id]/route}.ts`, `app/api/upload/menu-image/route.ts`, `app/api/orders/{route,[id]/route}.ts`, `app/api/settings/route.ts`, `lib/format.ts` (`getWibDateString`, `getWibDateRangeIso`), `lib/validators.ts` (`menuItemPatchInput`), `components/menu-admin/{VariantEditor,CategoryManager,MenuForm,MenuTable}.tsx`, `components/history/{ProofViewer,OrderDetail,OrderList}.tsx`, `app/kasir/{menu,riwayat,pengaturan}/page.tsx`.
- File dibuat/diubah: daftar di atas + `lib/__tests__/core-helpers.test.ts`, `docs/09-ROADMAP.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): `tsc --noEmit --incremental false` (lolos), `npm run lint` (lolos), `npx vitest run --configLoader native` (22/22 lulus), `npm run build` (lolos 16 route), uji live API/DB Fase 5 (`CAT_CRUD`, `MENU_IMG_UPLOAD`, `MENU_VAR_GUARD 400`, `T10` snapshot setelah edit & delete menu, `T11` menu nonaktif tersembunyi di POS, `PUT /api/settings` & restore, cleanup), scan hex & `.next/static` (0 leak di 26 file statis).
- Belum diuji: Uji klik/visual browser langsung untuk halaman `/kasir/menu`, `/kasir/riwayat`, `/kasir/pengaturan` di 375/768/1280px (dijadwalkan di Fase 6).
- Keputusan/asumsi baru: Tidak ada.
- Perubahan skema: Tidak ada.
- Masalah terbuka: Tidak ada.
- Berikutnya: Fase 6 — Finishing & Audit.

### Sesi 5 — Implementasi & Uji Live Fase 4 Dapur (2026-11-25)
- Tujuan: Membangun endpoint Dapur, endpoint transisi status, langganan Supabase Realtime + fallback polling, dan UI `/dapur` lengkap dengan fitur `[S]` (bunyi, penanda tunggu, Wake Lock).
- Dikerjakan (ID requirement/roadmap): `FR-KIT-01..10`, `getWibTodayStartIso`, `GET /api/kitchen/orders`, `PATCH /api/orders/[id]/status`, `hooks/useKitchenOrders.ts`, `hooks/useWakeLock.ts`, `components/kitchen/{ConnectionBadge,KitchenTabs,StatusButton,OrderCard,KitchenBoard}.tsx`, `app/dapur/page.tsx`.
- File dibuat/diubah: daftar di atas + `lib/format.ts`, `lib/__tests__/core-helpers.test.ts`, `docs/09-ROADMAP.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): `tsc --noEmit --incremental false` (lolos), `npm run lint` (lolos), `npx vitest run --configLoader native` (22/22 lulus termasuk batas hari WIB), `npm run build` (lolos), uji live end-to-end (`FIFO_OK`, `T9` transisi maju & idempoten & penolakan `409`, `T13` 0 field uang di API & `/dapur` SSR, `T8` WebSocket Realtime `SUBSCRIBED` menerima event `orders`, lalu cleanup), scan hex & `.next/static` (bersih).
- Belum diuji: Uji browser langsung untuk audio chime (`FR-KIT-08`), Wake Lock (`FR-KIT-10`), dan putus-nyambung jaringan `T15` di UI.
- Keputusan/asumsi baru: Tidak ada.
- Perubahan skema: Tidak ada.
- Masalah terbuka: Tidak ada.
- Berikutnya: Fase 5 — Kelola Menu, Riwayat, Pengaturan.

### Sesi 4 — Verifikasi Live Fase 0 & 2 + Penyelesaian Fase 3 (2026-11-25)
- Tujuan: Memverifikasi DB setelah `GRANT` SQL, memastikan endpoint Fase 2 hidup, dan menyelesaikan seluruh Fase 3 (Pembayaran, Place Order, Bukti).
- Dikerjakan (ID requirement/roadmap): Fase 0 `Uji`, Fase 2 `GET /api/menu` & `GET /api/settings`, Fase 3 (`FR-POS-13..17`, `H12`, `D13`, `D14`).
- File dibuat/diubah: `lib/image.ts`, `app/api/orders/route.ts`, `app/api/orders/[id]/proof/route.ts`, `lib/store/cart.ts`, `components/pos/{PaymentPanel,ProofCapture,CartItem,Cart,CartSheetMobile,PosWorkspace}.tsx`, `lib/__tests__/core-helpers.test.ts`, `docs/09-ROADMAP.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): Query Supabase live (lolos), `GET /api/menu` & `/api/settings` (200 OK), `tsc` (lolos), `eslint` (lolos), `vitest` (21/21 lulus), `next build` (lolos), integrasi live `POST /api/orders` + `POST /api/orders/[id]/proof` + verifikasi `orders`/`order_items` DB + cleanup data uji (semua lulus), scan hex & `.next/static` (bersih).
- Belum diuji: Uji interaksi klik UI browser langsung (kamera/kompresi canvas browser, alur klik Place Order & responsive 375/768/1280px).
- Keputusan/asumsi baru: Tidak ada.
- Perubahan skema: Tidak ada (user mengeksekusi `GRANT` SQL dari sesi sebelumnya).
- Masalah terbuka: Tidak ada (`DB-01` selesai).
- Berikutnya: Fase 4 — Dapur (`GET /api/kitchen/orders`, `/dapur`, `PATCH /api/orders/[id]/status`, Realtime + polling cadangan).

### Sesi 3 — Implementasi Fase 2 POS Katalog & Keranjang + Diagnosa Privilege DB (2026-11-25)
- Tujuan: Memverifikasi koneksi Supabase setelah user mengisi `NEXT_PUBLIC_SUPABASE_URL`, lalu membangun seluruh komponen dan API Fase 2 (`09-ROADMAP.md`).
- Dikerjakan (ID requirement/roadmap): `FR-POS-01..12`, `FR-POS-18`, `next.config.ts` (`images.remotePatterns`), `GET /api/menu`, `GET /api/settings`, `hooks/useIsMobile.ts`, `lib/store/cart.ts`, `hooks/useCart.ts`, `components/pos/{SearchBar,CategoryTabs,MenuCard,VariantDialog,CartItem,OrderMeta,DiscountInput,Summary,Cart,CartSheetMobile,PosWorkspace}.tsx`, `app/kasir/page.tsx`, `lib/__tests__/cart-store.test.ts`.
- File dibuat/diubah: daftar di atas + `components/kasir/KasirShell.tsx` (tinggi bottom nav `h-16` agar pas di bawah bar keranjang HP) + `docs/05-DATABASE.md`, `docs/09-ROADMAP.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): `tsc --noEmit --incremental false` (lolos), `npm run lint` (lolos), `npx vitest run --configLoader native` (20/20 lulus mencakup skenario T1, T3–T5, varian, penggabungan keranjang), `npm run build` (lolos), scan hex & `.next/static` (bersih), uji koneksi Supabase (bucket terbaca, tabel gagal `42501` `DB-01`), probe `GET /api/menu` & `GET /api/settings` (`500 INTERNAL_ERROR` aman tanpa bocor detail Postgres).
- Belum diuji: Fetch menu/pajak live dari Supabase (terblokir `DB-01`) dan uji browser manual T1–T5 & T14 pada 375/768/1280px.
- Keputusan/asumsi baru: Tidak ada perubahan keputusan; `docs/05-DATABASE.md` §9 diperbarui dengan pernyataan `GRANT` eksplisit untuk `service_role` & `anon`.
- Perubahan skema: Tambahan `GRANT` di `docs/05-DATABASE.md` §9 (menunggu eksekusi user di Supabase SQL Editor).
- Masalah terbuka: `DB-01` (`42501 permission denied` pada seluruh tabel `public`).
- Berikutnya: User menjalankan SQL `GRANT` di Supabase SQL Editor → verifikasi query `menu_items`, `/api/menu`, `/api/settings` → lanjut Fase 3.

### Sesi 2 — Penyelesaian Seluruh Task Fase 1 Fondasi (2026-11-25)
- Tujuan: Menyelesaikan seluruh tugas Fase 1 di `09-ROADMAP.md` (`shadcn/ui`, token tema & font, client Supabase, helper/validator/types, `pricing` + unit test, `role` + guard/switcher, halaman `/`, dan layout Kasir).
- Dikerjakan (ID requirement/roadmap): Fase 1 Task 2–9, `FR-ROLE-01..05`, `NFR-02`, `NFR-03`, `NFR-06`, `NFR-07`, `NFR-08`.
- File dibuat/diubah: `components.json`, `components/ui/*` (22 komponen shadcn), `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/kasir/layout.tsx`, `app/kasir/page.tsx`, `app/kasir/menu/page.tsx`, `app/kasir/riwayat/page.tsx`, `app/kasir/pengaturan/page.tsx`, `app/dapur/layout.tsx`, `app/dapur/page.tsx`, `components/role/RoleSelector.tsx`, `components/kasir/KasirShell.tsx`, `components/shared/{RoleGuard,RoleSwitcher,Money,StatusBadge,EmptyState,ErrorState,PageHeader}.tsx`, `lib/supabase/{server,client}.ts`, `lib/{format,api,validators,pricing,role,role-server}.ts`, `lib/__tests__/{pricing,core-helpers}.test.ts`, `types/{db,api}.ts`, `vitest.config.mts`, `next.config.ts`, `package.json`, `package-lock.json`, `docs/09-ROADMAP.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): `tsc --noEmit --incremental false` (lolos), `npm run lint` (lolos), `npm test` (13/13 lolos), `npm run build` (lolos), probe HTTP `next start` (redirect `FR-ROLE-05` & konten SSR `/` `/kasir` `/dapur` lolos), scan hex & `.next/static` (bersih), pengecekan dukungan `sb_publishable_`/`sb_secret_` di `@supabase/supabase-js@2.119.2` (terverifikasi).
- Belum diuji: Query live ke `menu_items` (terblokir `ENV-01`: `NEXT_PUBLIC_SUPABASE_URL` di `.env` kosong), dan uji visual/interaksi browser langsung pada breakpoint 375px / 768px / 1280px.
- Keputusan/asumsi baru: Mematikan `cacheComponents` di `next.config.ts` agar cookie `RoleGuard` berjalan standar; memakai font `Baloo_2` + `Nunito` (`A4`); memaksa `Toaster` `theme="light"` (`OOS-10`).
- Perubahan skema: Tidak ada.
- Masalah terbuka: `ENV-01` (`NEXT_PUBLIC_SUPABASE_URL` di `.env` kosong).
- Berikutnya: User mengisi `NEXT_PUBLIC_SUPABASE_URL` di `.env` lalu uji query `menu_items`, kemudian masuk Fase 2 (`GET /api/menu` & UI POS).

### Sesi 1 — Init Next.js & Fondasi Awal (2026-11-25)
- Tujuan: Konfirmasi selesainya Fase 0 oleh user dan menyelesaikan Task 1 Fase 1 (`Init Next.js`).
- Dikerjakan (ID requirement/roadmap): Fase 0 (konfirmasi setup dari user), Fase 1 Task 1 (`Init Next.js`, cek versi `package.json`).
- File dibuat/diubah: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`, `next-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `public/*`, `docs/09-ROADMAP.md`, `docs/10-CONTEXT-LOG.md`.
- Diuji (apa, cara, hasil): `npm run lint` (lolos tanpa isu), `npm run build` (lolos TypeScript + production build Next.js 16.4.6), `git status` & `git ls-files` (`.env` ter-ignore, `.env.example` tetap tracked).
- Belum diuji: Query server ke tabel `menu_items` dan kompatibilitas key Supabase format baru (`publishable`/`secret`) — dijadwalkan di Task 4 Fase 1 setelah `@supabase/supabase-js` terpasang.
- Keputusan/asumsi baru: Melanjutkan Q1–Q12 dengan default sementara (`A1–A13`) sesuai konfirmasi eksekusi langsung.
- Perubahan skema: Tidak ada.
- Masalah terbuka: Tidak ada.
- Berikutnya: Fase 1 Task 2 — Init shadcn/ui dan pasang komponen dasar (`docs/11-SHADCN-GUIDE.md`).

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
