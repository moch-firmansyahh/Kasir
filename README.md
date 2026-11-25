# Cemal Cemul POS — Dokumen Konteks

Kumpulan dokumen untuk menjaga AI agent tetap konsisten, tidak bias, dan tidak lupa konteks.

## Cara pakai
1. Salin `AGENTS.md` ke **root** repo, dan folder `docs/` ke root repo.
2. Salin `.env.example` ke root, lalu buat `.env.local` (isi sendiri, jangan dibagikan).
3. Pada awal sesi AI, beri prompt:
   > Baca `AGENTS.md`, lalu ikuti urutan baca di sana. Ringkas status terkini dari `docs/10-CONTEXT-LOG.md`, lalu kerjakan tugas berikutnya di `docs/09-ROADMAP.md`.

## Isi
- `AGENTS.md` — kontrak kerja & aturan keras (baca pertama)
- `docs/01..11` — konteks, requirement, keputusan, arsitektur, database, desain, spesifikasi, standar kode, roadmap, context log, panduan shadcn

Beberapa AI tool membaca `AGENTS.md` otomatis; tool lain (mis. yang memakai `CLAUDE.md`) bisa memakai salinan/rujukan ke file ini.
