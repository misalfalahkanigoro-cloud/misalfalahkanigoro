# MIS Al Falah Public Web + Perpustakaan

Runtime utama proyek ini:
- `NeonDB + Prisma` untuk database
- `Cloudflare R2` untuk object storage
- `Next.js App Router` untuk web publik dan admin

## 1. Prasyarat
- Node.js 20+ (direkomendasikan 22+)
- npm 10+
- Akses ke database Neon
- Akses Cloudflare R2 bucket

## 2. Environment Variables
Minimal variabel yang wajib tersedia di `.env`:
- `DATABASE_URL`
- `DIRECT_URL` (opsional, tapi direkomendasikan sama dengan database direct)
- `ADMIN_SESSION_SECRET` (wajib untuk signature cookie admin)
- `R2_S3_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_MEDIA`
- `R2_BUCKET_DOWNLOADS`
- `R2_DEFAULT_BUCKET`
- `R2_PUBLIC_BASE_URL` (opsional)
- `SOURCE_DATABASE_URL` (opsional, untuk seed/migrasi source lama)

Variabel batas upload opsional:
- `MAX_UPLOAD_MEDIA_BYTES` (default 25MB)
- `MAX_UPLOAD_DOCUMENT_BYTES` (default 50MB)
- `MAX_RICH_TEXT_LENGTH` (default 200000 karakter)

## 3. Setup Lokal
```bash
npm install
npm run prisma:generate
npm run prisma:db:push
npm run dev
```

## 4. Migrasi & Backfill Data
```bash
# Copy data dari source DB (jika dipakai)
npm run prisma:seed

# Backfill data lama ke modul perpustakaan final (idempotent)
npm run prisma:backfill:library
```

## 5. Testing
```bash
npm run test:unit
npm run test:integration
npm run test:smoke
```

Atau semua sekaligus:
```bash
npm run test
```

## 6. Deploy Produksi
1. Pastikan `npm run test` hijau.
2. Pastikan env produksi lengkap (terutama `ADMIN_SESSION_SECRET`, DB, R2).
3. Build:
```bash
npm run build
```
4. Start:
```bash
npm run start
```

## 7. Rollback
1. Simpan baseline sebelum perubahan mayor (branch/tag).
2. Jika rilis bermasalah:
- rollback aplikasi ke tag stabil terakhir
- rollback database hanya jika ada migrasi struktural bermasalah
3. Jalankan verifikasi cepat:
```bash
npm run test:smoke
```

## 8. UAT (Ringkas)
Gunakan checklist lengkap di:
- `docs/UAT_CHECKLIST.md`

## 9. Release Checklist
1. `npm run test` hijau.
2. UAT publik + admin + PPDB lulus.
3. Tidak ada penggunaan legacy aktif untuk fitur yang dirilis.
4. Build produksi hijau.
5. Catat changelog rilis.

## 10. Definition of Done
Proyek dianggap selesai jika:
1. Semua endpoint sudah Prisma native.
2. Modul perpustakaan live admin + publik.
3. Tidak ada artefak legacy aktif.
4. `tsc` + `build` hijau.
5. UAT lulus.

Status saat ini:
- [ ] Semua endpoint Prisma native (masih ada endpoint legacy adapter di domain lama)
- [x] Modul perpustakaan live admin + publik
- [~] Artefak legacy aktif (sudah banyak dibersihkan, alias kompatibilitas sementara masih ada)
- [x] Build hijau
- [~] UAT: checklist sudah disiapkan, eksekusi manual final per lingkungan masih diperlukan

