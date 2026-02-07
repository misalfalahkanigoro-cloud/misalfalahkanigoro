# 📘 DOKUMEN REFACTORING PROYEK WEB SEKOLAH MI AL-FALAH KANIGORO

## 📋 DAFTAR ISI
1. [Overview Refactoring](#overview-refactoring)
2. [Struktur Database Tambahan](#struktur-database-tambahan)
3. [Mapping File & Fungsi](#mapping-file--fungsi)
4. [UI/UX Design Spec](#uiux-design-spec)
5. [Admin Panel Workflow](#admin-panel-workflow)
6. [Timeline Implementasi](#timeline-implementasi)
7. [Testing Checklist](#testing-checklist)

---

## 🎯 OVERVIEW REFACTORING

### Tujuan Utama
Mengubah konten statis (hardcoded) menjadi dinamis yang dapat dikelola melalui admin panel dengan database-driven content.

### Scope Refactoring
- **Dashboard Admin:** Statistik real-time
- **Beranda Publik:** 4 section dinamis (Highlights, Sambutan, CTA, Hero)
- **Halaman Kesiswaan:** Ekstrakurikuler & Pembiasaan
- **Halaman Akademik:** Admin UI untuk kelola konten
- **Halaman Kontak:** Dynamic Google Maps
- **Halaman Kelulusan:** Dynamic hero image
- **Kelola Guru:** CRUD lengkap
- **Kelola Kegiatan:** CRUD lengkap
- **Kelola Download:** CRUD lengkap + upload
- **Kelola Kelulusan:** CRUD + import CSV

---

## 🗄️ STRUKTUR DATABASE TAMBAHAN

### 1. Tabel: `highlights` (SUDAH ADA - perlu API)
**Fungsi:** Menyimpan section "Kenapa Memilih Kami" di beranda

**Struktur:**
```sql
-- Sudah ada di schema
create table if not exists highlights (
  id bigserial primary key,
  icon text not null,                    -- Icon name (lucide-react)
  title text not null,                   -- Judul highlight
  description text not null,             -- Deskripsi singkat
  "order" integer not null default 0,    -- Urutan tampilan
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
```

**Data Seed:**
```sql
insert into highlights (icon, title, description, "order")
values 
  ('BookOpen', 'Pendidikan Berkualitas', 'Kurikulum terintegrasi dengan nilai-nilai Islam', 1),
  ('Users', 'Tenaga Pengajar Kompeten', 'Guru berpengalaman dan bersertifikat', 2),
  ('Award', 'Prestasi Gemilang', 'Ratusan prestasi akademik dan non-akademik', 3),
  ('Heart', 'Lingkungan Islami', 'Pembiasaan akhlak mulia dalam keseharian', 4);
```

---

### 2. Tabel: `extracurriculars` (BARU)
**Fungsi:** Menyimpan data ekstrakurikuler untuk halaman Kesiswaan

**Struktur:**
```sql
create table if not exists extracurriculars (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- Nama ekstrakurikuler
  description text not null,             -- Deskripsi lengkap
  icon text,                             -- Icon name (lucide-react)
  image_url text,                        -- URL foto kegiatan
  schedule text,                         -- Jadwal (misal: "Senin, 15:00-16:30")
  coach_name text,                       -- Nama pembina
  display_order int default 0,           -- Urutan tampilan
  is_active boolean default true,        -- Status aktif
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_extracurriculars_active on extracurriculars(is_active, display_order);

create trigger extracurriculars_updated_at
before update on extracurriculars
for each row execute function set_updated_at_snake();
```

**Data Seed:**
```sql
insert into extracurriculars (name, description, icon, schedule, coach_name, display_order)
values 
  ('Pramuka', 'Melatih kepemimpinan dan kemandirian siswa', 'Tent', 'Jumat, 14:00-16:00', 'Ustadz Ahmad', 1),
  ('Tahfidz', 'Menghafal Al-Quran dengan metode tilawati', 'BookMarked', 'Senin-Kamis, 07:00-08:00', 'Ustadzah Fatimah', 2),
  ('Seni Kaligrafi', 'Mengasah kreativitas seni kaligrafi Arab', 'Paintbrush', 'Rabu, 15:00-16:30', 'Ustadz Bambang', 3),
  ('Futsal', 'Olahraga futsal untuk kesehatan dan teamwork', 'Trophy', 'Sabtu, 08:00-10:00', 'Coach Dedi', 4);
```

---

### 3. Tabel: `character_programs` (BARU)
**Fungsi:** Menyimpan program pembiasaan karakter di halaman Kesiswaan

**Struktur:**
```sql
create table if not exists character_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,                    -- Nama program
  description text not null,             -- Deskripsi program
  icon text,                             -- Icon name
  frequency text,                        -- Frekuensi (misal: "Setiap Hari")
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_character_programs_active on character_programs(is_active, display_order);

create trigger character_programs_updated_at
before update on character_programs
for each row execute function set_updated_at_snake();
```

**Data Seed:**
```sql
insert into character_programs (name, description, icon, frequency, display_order)
values 
  ('Sholat Dhuha Berjamaah', 'Pembiasaan sholat dhuha setiap pagi', 'Sunrise', 'Setiap Hari', 1),
  ('Infaq Jumat', 'Berbagi kepada sesama setiap Jumat', 'Heart', 'Setiap Jumat', 2),
  ('Tahsin & Tartil', 'Pembelajaran baca Al-Quran yang benar', 'BookOpen', '3x Seminggu', 3),
  ('Budaya 5S', 'Senyum, Salam, Sapa, Sopan, Santun', 'SmilePlus', 'Setiap Hari', 4);
```

---

### 4. Tabel: `site_banners` (BARU)
**Fungsi:** Menyimpan banner CTA (Call to Action) yang dapat muncul di berbagai halaman

**Struktur:**
```sql
create table if not exists site_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,                   -- Judul CTA
  description text,                      -- Deskripsi singkat
  button_text text not null,             -- Teks tombol
  button_link text not null,             -- Link tujuan
  background_color text default '#10b981', -- Warna background
  text_color text default '#ffffff',     -- Warna teks
  placement text not null check (placement in ('home', 'all', 'custom')), -- Lokasi tampil
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_site_banners_active on site_banners(is_active, placement);

create trigger site_banners_updated_at
before update on site_banners
for each row execute function set_updated_at_snake();
```

**Data Seed:**
```sql
insert into site_banners (title, description, button_text, button_link, placement, display_order)
values 
  ('PPDB 2026 Dibuka!', 'Daftarkan putra-putri Anda sekarang. Kuota terbatas!', 'Daftar Sekarang', '/ppdb', 'home', 1);
```

---

### 5. Tabel: `page_heroes` (BARU)
**Fungsi:** Menyimpan hero image untuk berbagai halaman (termasuk Kelulusan)

**Struktur:**
```sql
create table if not exists page_heroes (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null unique,        -- Slug halaman (misal: 'kelulusan', 'kontak')
  title text not null,                   -- Judul hero
  subtitle text,                         -- Subtitle
  image_url text not null,               -- URL gambar hero
  overlay_opacity decimal(3,2) default 0.5, -- Opacity overlay (0.0-1.0)
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_page_heroes_slug on page_heroes(page_slug);

create trigger page_heroes_updated_at
before update on page_heroes
for each row execute function set_updated_at_snake();
```

**Data Seed:**
```sql
insert into page_heroes (page_slug, title, subtitle, image_url)
values 
  ('kelulusan', 'Cek Kelulusan', 'Informasi kelulusan siswa tahun ajaran 2025/2026', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920'),
  ('kontak', 'Hubungi Kami', 'Kami siap melayani pertanyaan Anda', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920');
```

---

### 6. Update Tabel: `site_settings` (TAMBAH FIELD)
**Fungsi:** Menambahkan field untuk logo, favicon, dan meta SEO

**Migration:**
```sql
alter table site_settings 
add column if not exists favicon_url text,
add column if not exists meta_description text,
add column if not exists meta_keywords text,
add column if not exists google_analytics_id text,
add column if not exists facebook_pixel_id text;

-- Update data existing
update site_settings 
set 
  favicon_url = '/favicon.ico',
  meta_description = 'Website resmi MI Al-Falah Kanigoro - Madrasah Ibtidaiyah swasta berkualitas di Blitar, Jawa Timur',
  meta_keywords = 'madrasah, MI, Al-Falah, Kanigoro, Blitar, pendidikan Islam'
where id = (select id from site_settings limit 1);
```

---

### 7. Tabel: `admin_activities` (BARU - OPSIONAL)
**Fungsi:** Logging aktivitas admin untuk audit trail

**Struktur:**
```sql
create table if not exists admin_activities (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admin_publicweb(id) on delete cascade,
  action text not null,                  -- CREATE, UPDATE, DELETE
  resource_type text not null,           -- Nama tabel
  resource_id text,                      -- ID record yang diubah
  description text,                      -- Deskripsi aktivitas
  ip_address text,                       -- IP address admin
  created_at timestamptz not null default now()
);

create index idx_admin_activities_admin on admin_activities(admin_id, created_at);
create index idx_admin_activities_resource on admin_activities(resource_type, resource_id);
```

---

## 📁 MAPPING FILE & FUNGSI

### FASE 1: Dashboard Admin & Beranda Dinamis

#### 1.1 Dashboard Admin
**File yang perlu dibuat/update:**

```
@/app/(admin)/admin/dashboard/page.tsx
├── Fetch dari @/app/api/admin/overview/route.ts
├── Display cards: Total Publikasi, Prestasi, Guru, PPDB
├── Chart: Aktivitas 7 hari terakhir (menggunakan recharts)
└── Quick actions: Link ke halaman CRUD

@/app/api/admin/overview/route.ts
└── Return JSON:
    {
      publications: { total, published, draft },
      achievements: { total, published },
      teachers: { total, active },
      ppdb: { total, pending, accepted },
      recentActivities: [...]
    }
```

**UI Spec:**
```tsx
// Layout Dashboard
┌─────────────────────────────────────────┐
│ Dashboard Admin                         │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ 📄 Pub  │ │ 🏆 Pre  │ │ 👨‍🏫 Guru │   │
│ │ 24 post │ │ 12 post │ │ 18 orang│   │
│ └─────────┘ └─────────┘ └─────────┘   │
│ ┌─────────────────────────────────────┐│
│ │ 📊 Statistik Pengunjung (Chart)    ││
│ └─────────────────────────────────────┘│
│ ┌─────────────────────────────────────┐│
│ │ 🕐 Aktivitas Terbaru               ││
│ │ • Admin menambahkan berita...      ││
│ │ • Pendaftar baru PPDB...           ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Komponen Baru:**
```tsx
// @/components/admin/StatCard.tsx
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}

// @/components/admin/ActivityChart.tsx
// Menggunakan recharts LineChart

// @/components/admin/RecentActivities.tsx
// List aktivitas terbaru dengan timestamp
```

---

#### 1.2 Kelola Highlights (Kenapa Memilih Kami)

**File yang perlu dibuat:**

```
@/app/api/admin/highlights/route.ts (POST, GET)
├── GET: Return semua highlights ORDER BY "order"
└── POST: Insert highlight baru

@/app/api/admin/highlights/[id]/route.ts (PUT, DELETE)
├── PUT: Update highlight by id
└── DELETE: Soft delete (atau hard delete)

@/app/(admin)/admin/kelola-highlights/page.tsx
├── Table: List highlights dengan tombol Edit/Delete
├── Modal/Form: Add/Edit highlight
└── Drag & drop untuk reorder (react-beautiful-dnd atau dnd-kit)

@/components/admin/HighlightForm.tsx
├── Input: Icon (dropdown lucide-react icons)
├── Input: Title (text)
├── Textarea: Description
└── Input: Order (number)
```

**UI Spec:**
```tsx
// Halaman Admin Kelola Highlights
┌─────────────────────────────────────────┐
│ Kelola Highlights          [+ Tambah]   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐│
│ │ Icon | Judul | Deskripsi | Aksi    ││
│ ├─────────────────────────────────────┤│
│ │ 📖 | Pendidikan... | ... | ✏️ 🗑️ ││
│ │ 👥 | Tenaga... | ... | ✏️ 🗑️     ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘

// Modal Form
┌─────────────────────────────────────────┐
│ Tambah/Edit Highlight           [✕]    │
├─────────────────────────────────────────┤
│ Icon: [Dropdown: BookOpen, Users, ...]  │
│ Judul: [________________]               │
│ Deskripsi: [_________________]          │
│           [_________________]          │
│ Urutan: [__]                           │
│                    [Batal] [Simpan]    │
└─────────────────────────────────────────┘
```

**Update Halaman Publik:**
```tsx
// @/app/(public)/page.tsx
// Section Highlights - ubah dari hardcoded ke fetch API

export default async function HomePage() {
  const highlights = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/highlights`)
    .then(res => res.json());

  return (
    <section className="py-16">
      <h2>Kenapa Memilih MI Al-Falah?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map(h => (
          <HighlightCard key={h.id} icon={h.icon} title={h.title} desc={h.description} />
        ))}
      </div>
    </section>
  );
}
```

---

#### 1.3 Sambutan Kepala Madrasah (Beranda)

**File yang perlu update:**

```
@/app/(public)/page.tsx
└── Section "Sambutan Kepala Madrasah"
    ├── Fetch dari @/app/api/headmaster-greeting/route.ts
    ├── Display: photo_url, headmaster_name, headmaster_title
    └── Content: Excerpt dari content_text (200 karakter) + link "Baca Selengkapnya" → /sambutan
```

**UI Spec:**
```tsx
// Section di Beranda
┌─────────────────────────────────────────┐
│ Sambutan Kepala Madrasah                │
├─────────────────────────────────────────┤
│ ┌──────┐  Assalamu'alaikum...           │
│ │ FOTO │  Puji syukur kita panjatkan... │
│ │      │  [Baca Selengkapnya →]         │
│ └──────┘  - Drs. H. Ahmad Fauzi, M.Pd   │
│             Kepala Madrasah              │
└─────────────────────────────────────────┘
```

---

#### 1.4 Kelola CTA Banner PPDB

**File yang perlu dibuat:**

```
@/app/api/admin/banners/route.ts (GET, POST)
@/app/api/admin/banners/[id]/route.ts (PUT, DELETE)

@/app/api/banners/route.ts (Publik - GET)
├── GET: Return active banners WHERE placement IN ('home', 'all')
└── Filter by page jika query param ?page=home

@/app/(admin)/admin/kelola-banner/page.tsx
├── Table list banners
└── Form: title, description, button_text, button_link, placement, colors

@/components/admin/BannerForm.tsx
├── Input: Title, Description
├── Input: Button Text, Button Link
├── Color Picker: Background Color, Text Color
└── Select: Placement (home, all, custom)
```

**UI Spec:**
```tsx
// Halaman Admin
┌─────────────────────────────────────────┐
│ Kelola Banner CTA          [+ Tambah]   │
├─────────────────────────────────────────┤
│ Judul | Placement | Status | Aksi       │
│ PPDB 2026 | home | ✅ | ✏️ 🗑️          │
└─────────────────────────────────────────┘

// Form
┌─────────────────────────────────────────┐
│ Tambah/Edit Banner                      │
├─────────────────────────────────────────┤
│ Judul: [PPDB 2026 Dibuka!]             │
│ Deskripsi: [Daftarkan putra...]        │
│ Teks Tombol: [Daftar Sekarang]         │
│ Link Tombol: [/ppdb]                   │
│ Warna BG: [🎨 #10b981]                 │
│ Warna Teks: [🎨 #ffffff]               │
│ Tampil di: [Dropdown: Beranda]         │
│                    [Batal] [Simpan]    │
└─────────────────────────────────────────┘
```

**Update Halaman Publik:**
```tsx
// @/app/(public)/page.tsx
const banners = await fetch('/api/banners?page=home').then(r => r.json());

{banners.map(banner => (
  <div style={{ backgroundColor: banner.background_color, color: banner.text_color }}>
    <h3>{banner.title}</h3>
    <p>{banner.description}</p>
    <Link href={banner.button_link}>{banner.button_text}</Link>
  </div>
))}
```

---

#### 1.5 Kelola Hero Slides (Beranda)

**File yang perlu dibuat:**

```
@/app/api/admin/hero-slides/route.ts (GET, POST)
@/app/api/admin/hero-slides/[id]/route.ts (PUT, DELETE)

@/app/(admin)/admin/kelola-hero/page.tsx
├── Table list slides dengan preview image
├── Upload image via @/app/api/upload/media/route.ts (Cloudinary)
└── Toggle isActive, reorder slides

@/components/admin/HeroSlideForm.tsx
├── Upload Image
├── Input: Title, Subtitle
├── Input: Order
└── Toggle: Is Active
```

**UI Spec:**
```tsx
// Halaman Admin
┌─────────────────────────────────────────┐
│ Kelola Hero Slides         [+ Tambah]   │
├─────────────────────────────────────────┤
│ Preview | Judul | Order | Status | Aksi │
│ [IMG]   | Slamet...| 1 | ✅ | ✏️ 🗑️   │
│ [IMG]   | PPDB... | 2 | ✅ | ✏️ 🗑️   │
└─────────────────────────────────────────┘

// Form
┌─────────────────────────────────────────┐
│ Tambah/Edit Hero Slide                  │
├─────────────────────────────────────────┤
│ Upload Gambar: [Pilih File] [Preview]  │
│ ┌─────────────────┐                    │
│ │   Preview IMG   │                    │
│ └─────────────────┘                    │
│ Judul: [________________________]      │
│ Subtitle: [_____________________]      │
│ Urutan: [__]                           │
│ Status: [☑️ Aktif]                     │
│                    [Batal] [Simpan]    │
└─────────────────────────────────────────┘
```

---

### FASE 2: Halaman Kesiswaan

#### 2.1 Kelola Ekstrakurikuler

**File yang perlu dibuat:**

```
@/app/api/kesiswaan/route.ts (Publik - GET)
└── Return: { extracurriculars: [...], character_programs: [...] }

@/app/api/admin/extracurriculars/route.ts (GET, POST)
@/app/api/admin/extracurriculars/[id]/route.ts (PUT, DELETE)

@/app/(admin)/admin/kesiswaan/ekstrakurikuler/page.tsx
├── Table list ekstrakurikuler
└── Form CRUD dengan upload image

@/components/admin/ExtracurricularForm.tsx
├── Input: Name, Description, Icon
├── Upload: Image (foto kegiatan)
├── Input: Schedule, Coach Name
└── Input: Display Order
```

**UI Spec:**
```tsx
// Halaman Admin
┌─────────────────────────────────────────┐
│ Kelola Ekstrakurikuler     [+ Tambah]   │
├─────────────────────────────────────────┤
│ Nama | Pembina | Jadwal | Status | Aksi │
│ Pramuka | Ustadz A | Jumat... | ✅ | ✏️│
│ Tahfidz | Ustadzah F | Senin... | ✅ |✏️│
└─────────────────────────────────────────┘

// Halaman Publik Kesiswaan
┌─────────────────────────────────────────┐
│ Ekstrakurikuler                         │
├─────────────────────────────────────────┤
│ ┌─────────┐  Pramuka                   │
│ │  [IMG]  │  Melatih kepemimpinan...   │
│ └─────────┘  📅 Jumat, 14:00-16:00     │
│              👨‍🏫 Ustadz Ahmad            │
└─────────────────────────────────────────┘
```

---

#### 2.2 Kelola Pembiasaan Karakter

**File yang perlu dibuat:**

```
@/app/api/admin/character-programs/route.ts (GET, POST)
@/app/api/admin/character-programs/[id]/route.ts (PUT, DELETE)

@/app/(admin)/admin/kesiswaan/pembiasaan/page.tsx
└── Similar dengan ekstrakurikuler

@/components/admin/CharacterProgramForm.tsx
├── Input: Name, Description, Icon
└── Input: Frequency, Display Order
```

**Update Halaman Publik:**
```tsx
// @/app/(public)/kesiswaan/page.tsx
const { extracurriculars, character_programs } = await fetch('/api/kesiswaan')
  .then(r => r.json());

// Replace hardcoded content dengan data dari API
```

---

### FASE 3: Halaman Akademik (Admin UI)

**File yang perlu dibuat:**

```
@/app/(admin)/admin/akademik/page.tsx
├── Form untuk edit academic_page (hero, curriculum)
├── Table untuk academic_subjects (CRUD)
└── Table untuk academic_programs (CRUD)

@/components/admin/AcademicPageForm.tsx
├── Input: Hero Title, Hero Subtitle
├── Upload: Hero Image
├── Textarea: Curriculum Intro 1 & 2
└── Input: Subjects Title, Programs Title

@/components/admin/SubjectForm.tsx
└── Simple input: Name, Order

@/components/admin/ProgramForm.tsx
├── Input: Title, Description, Icon
└── Input: Order
```

**UI Spec:**
```tsx
// Halaman Admin Akademik (Tabs)
┌─────────────────────────────────────────┐
│ [Hero] [Kurikulum] [Mapel] [Program]   │
├─────────────────────────────────────────┤
│ // Tab Hero                             │
│ Hero Title: [_______________________]   │
│ Hero Subtitle: [____________________]   │
│ Hero Image: [Upload]                   │
│                                         │
│ // Tab Mata Pelajaran                  │
│ Nama Mapel | Urutan | Aksi             │
│ Bahasa Indonesia | 1 | ✏️ 🗑️          │
│ [+ Tambah Mapel]                       │
└─────────────────────────────────────────┘
```

---

### FASE 4: Halaman Kontak & Kelulusan

#### 4.1 Dynamic Google Maps (Kontak)

**File yang perlu update:**

```
@/app/(public)/kontak/page.tsx
├── Fetch dari @/app/api/pages/contact/route.ts
└── Render mapEmbedHtml dari database (bukan hardcoded)

@/app/(admin)/admin/kontak/page.tsx (SUDAH ADA)
└── Pastikan field mapEmbedHtml dapat di-edit
```

**UI Admin:**
```tsx
// Form Kelola Kontak
┌─────────────────────────────────────────┐
│ Google Maps Embed Code:                │
│ ┌─────────────────────────────────────┐│
│ │ <iframe src="..."></iframe>        ││
│ │                                     ││
│ └─────────────────────────────────────┘│
│ [Preview Maps]                         │
│                    [Batal] [Simpan]    │
└─────────────────────────────────────────┘
```

---

#### 4.2 Dynamic Hero Image (Kelulusan)

**File yang perlu dibuat:**

```
@/app/api/admin/page-heroes/route.ts (GET, POST)
@/app/api/admin/page-heroes/[slug]/route.ts (PUT, DELETE)

@/app/api/page-heroes/[slug]/route.ts (Publik - GET)
└── GET /api/page-heroes/kelulusan

@/app/(admin)/admin/kelola-hero-pages/page.tsx
├── Table: List page heroes (Kelulusan, Kontak, dll)
└── Form: Edit hero per page

@/components/admin/PageHeroForm.tsx
├── Input: Page Slug (readonly)
├── Upload: Image
├── Input: Title, Subtitle
└── Slider: Overlay Opacity (0-100%)
```

**UI Admin:**
```tsx
// Kelola Hero Pages
┌─────────────────────────────────────────┐
│ Kelola Hero Halaman                     │
├─────────────────────────────────────────┤
│ Halaman | Preview | Aksi                │
│ Kelulusan | [IMG] | ✏️                  │
│ Kontak | [IMG] | ✏️                     │
└─────────────────────────────────────────┘

// Form
┌─────────────────────────────────────────┐
│ Edit Hero: Kelulusan                    │
├─────────────────────────────────────────┤
│ Upload Gambar: [Pilih File]            │
│ [Preview Image]                         │
│ Judul: [Cek Kelulusan]                 │
│ Subtitle: [Informasi kelulusan...]     │
│ Opacity Overlay: [━━●━━━] 50%          │
│                    [Batal] [Simpan]    │
└─────────────────────────────────────────┘
```

**Update Halaman Publik:**
```tsx
// @/app/(public)/kelulusan/page.tsx
const hero = await fetch('/api/page-heroes/kelulusan').then(r => r.json());

<div 
  className="hero" 
  style={{ backgroundImage: `url(${hero.image_url})` }}
>
  <div style={{ opacity: hero.overlay_opacity }}>
    <h1>{hero.title}</h1>
    <p>{hero.subtitle}</p>
  </div>
</div>
```

---

### FASE 5: Kelola Guru

**File yang perlu dibuat:**

```
@/app/api/admin/teachers/route.ts (GET, POST)
@/app/api/admin/teachers/[id]/route.ts (PUT, DELETE)

@/app/(admin)/admin/kelola-guru/page.tsx
├── Table list guru dengan foto
└── Form CRUD + upload foto

@/components/admin/TeacherForm.tsx
├── Input: Name, Position
├── Upload: Image URL
└── Toggle: Is Active
```

**UI Admin:**
```tsx
// Kelola Guru
┌─────────────────────────────────────────┐
│ Kelola Guru & Staff        [+ Tambah]   │
├─────────────────────────────────────────┤
│ Foto | Nama | Jabatan | Status | Aksi   │
│ [IMG]| Ustadz A | Kepala | ✅ | ✏️ 🗑️ │
│ [IMG]| Ustadzah B | Guru | ✅ | ✏️ 🗑️│
└─────────────────────────────────────────┘

// Form
┌─────────────────────────────────────────┐
│ Tambah/Edit Guru                        │
├─────────────────────────────────────────┤
│ Upload Foto: [Pilih File]              │
│ [Preview]                               │
│ Nama Lengkap: [__________________]     │
│ Jabatan: [_______________________]     │
│ Status: [☑️ Aktif]                     │
│                    [Batal] [Simpan]    │
└─────────────────────────────────────────┘
```

---

### FASE 6: Kelola Kegiatan

**File yang perlu dibuat:**

```
@/app/api/admin/activities/route.ts (GET, POST)
@/app/api/admin/activities/[id]/route.ts (PUT, DELETE)

@/app/(admin)/admin/kelola-kegiatan/page.tsx
└── Similar dengan Guru (table + form)

@/components/admin/ActivityForm.tsx
├── Input: Title
├── Upload: Image
└── Toggle: Is Active
```

---

### FASE 7: Kelola File Download

**File yang perlu dibuat:**

```
@/app/api/admin/downloads/route.ts (GET, POST)
@/app/api/admin/downloads/[id]/route.ts (PUT, DELETE)

@/app/(admin)/admin/kelola-download/page.tsx
├── Table list files
├── Upload file via @/app/api/upload/file/route.ts (Supabase Storage)
└── Form: Title, Category, File Type

@/components/admin/DownloadFileForm.tsx
├── Input: Title, Category
├── Upload File (PDF, DOCX, XLSX)
├── Date: Upload Date
└── Auto-detect file size & type
```

**UI Admin:**
```tsx
// Kelola Download
┌─────────────────────────────────────────┐
│ Kelola File Download       [+ Upload]   │
├─────────────────────────────────────────┤
│ Judul | Kategori | Tipe | Size | Aksi   │
│ Form PPDB | Dokumen | PDF | 2MB | 🗑️    │
│ Jadwal | Akademik | XLSX | 1MB | 🗑️    │
└─────────────────────────────────────────┘

// Form
┌─────────────────────────────────────────┐
│ Upload File                             │
├─────────────────────────────────────────┤
│ Judul: [________________________]      │
│ Kategori: [Dropdown: Dokumen, ...]     │
│ Upload File: [Pilih File] (Max 10MB)   │
│ [📄 filename.pdf - 2.3 MB]             │
│                    [Batal] [Upload]    │
└─────────────────────────────────────────┘
```

---

### FASE 8: Kelola Data Kelulusan

**File yang perlu dibuat:**

```
@/app/api/admin/graduation/route.ts (GET, POST)
@/app/api/admin/graduation/[id]/route.ts (PUT, DELETE)
@/app/api/admin/graduation/import/route.ts (POST - CSV import)

@/app/(admin)/admin/kelulusan/page.tsx
├── Table list siswa lulus
├── Form tambah manual (single)
└── Import CSV (batch)

@/components/admin/GraduationForm.tsx
├── Input: NISN, Name, Class Name
├── Select: Status (LULUS, DITUNDA)
├── Input: Average Score, Year
└── Manual input atau CSV upload

@/components/admin/GraduationImport.tsx
├── Upload CSV
├── Preview data before import
└── Validation & bulk insert
```

**UI Admin:**
```tsx
// Kelola Kelulusan
┌─────────────────────────────────────────┐
│ Data Kelulusan  [+ Tambah] [📥 Import] │
├─────────────────────────────────────────┤
│ NISN | Nama | Kelas | Status | Nilai   │
│ 123..| Ali  | 6A    | LULUS  | 85.5    │
│ [Filter: Tahun 2025] [Cari...]         │
└─────────────────────────────────────────┘

// Form Import CSV
┌─────────────────────────────────────────┐
│ Import Data Kelulusan (CSV)             │
├─────────────────────────────────────────┤
│ Upload CSV: [Pilih File]               │
│ [📄 kelulusan_2025.csv]                │
│                                         │
│ Preview (5 baris pertama):             │
│ ┌─────────────────────────────────────┐│
│ │ NISN | Nama | Kelas | Status | ...  ││
│ │ 123  | Ali  | 6A    | LULUS  | 85.5 ││
│ └─────────────────────────────────────┘│
│                                         │
│ ✅ 150 record valid                    │
│ ❌ 2 record error (duplikat NISN)      │
│                    [Batal] [Import]    │
└─────────────────────────────────────────┘
```

**Format CSV:**
```csv
nisn,name,className,status,averageScore,year
1234567890,Ahmad Ali,6A,LULUS,85.5,2025
9876543210,Siti Fatimah,6B,LULUS,88.2,2025
```

**Logic Import:**
```tsx
// @/app/api/admin/graduation/import/route.ts
import Papa from 'papaparse';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const text = await file.text();
  
  const { data } = Papa.parse(text, { header: true });
  
  // Validasi
  const valid = [];
  const errors = [];
  
  for (const row of data) {
    // Check duplikat NISN
    const exists = await supabase
      .from('graduation_students')
      .select('nisn')
      .eq('nisn', row.nisn)
      .single();
    
    if (exists.data) {
      errors.push({ row, reason: 'Duplikat NISN' });
    } else {
      valid.push(row);
    }
  }
  
  // Bulk insert
  if (valid.length > 0) {
    await supabase.from('graduation_students').insert(valid);
  }
  
  return Response.json({ 
    success: valid.length, 
    errors: errors.length,
    errorDetails: errors 
  });
}
```

---

## 🎨 UI/UX DESIGN SPEC

### Design System

**Color Palette:**
```css
:root {
  /* Primary - Brand Green */
  --primary-50: #f0fdf4;
  --primary-100: #dcfce7;
  --primary-500: #10b981;  /* Main */
  --primary-600: #059669;
  --primary-700: #047857;
  
  /* Neutral - Gray */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

**Typography:**
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

**Spacing:**
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

**Border Radius:**
```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem;   /* 8px */
--radius-xl: 0.75rem;  /* 12px */
--radius-2xl: 1rem;    /* 16px */
```

---

### Komponen UI Reusable

**1. Button Component**
```tsx
// @/components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Variants:
primary: bg-primary-500 hover:bg-primary-600 text-white
secondary: bg-gray-100 hover:bg-gray-200 text-gray-900
danger: bg-red-500 hover:bg-red-600 text-white
ghost: bg-transparent hover:bg-gray-100 text-gray-700
```

**2. Input Component**
```tsx
// @/components/ui/Input.tsx
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  ...HTMLInputElement
}

// Styling:
- Label: font-medium text-sm text-gray-700
- Input: border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500
- Error: text-sm text-red-600
- Helper: text-sm text-gray-500
```

**3. Card Component**
```tsx
// @/components/ui/Card.tsx
<Card>
  <CardHeader>
    <CardTitle>Judul</CardTitle>
    <CardDescription>Deskripsi</CardDescription>
  </CardHeader>
  <CardContent>
    {children}
  </CardContent>
  <CardFooter>
    {actions}
  </CardFooter>
</Card>

// Styling:
- Card: bg-white border border-gray-200 rounded-xl shadow-sm
- Header: border-b border-gray-200 p-6
- Content: p-6
- Footer: bg-gray-50 border-t border-gray-200 p-6
```

**4. Table Component**
```tsx
// @/components/ui/Table.tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Kolom 1</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>

// Features:
- Sortable columns
- Pagination
- Row selection (checkbox)
- Row actions (edit, delete)
```

**5. Modal Component**
```tsx
// @/components/ui/Modal.tsx
<Modal open={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Judul Modal</ModalTitle>
  </ModalHeader>
  <ModalBody>
    {children}
  </ModalBody>
  <ModalFooter>
    <Button variant="ghost" onClick={handleClose}>Batal</Button>
    <Button variant="primary" onClick={handleSave}>Simpan</Button>
  </ModalFooter>
</Modal>

// Styling:
- Overlay: bg-black/50 backdrop-blur-sm
- Container: max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl
- Close button: absolute top-4 right-4
```

**6. Toast Notification**
```tsx
// @/components/ui/Toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Usage:
toast.success('Data berhasil disimpan!');
toast.error('Terjadi kesalahan!');

// Styling:
- Success: bg-green-50 border-green-200 text-green-800
- Error: bg-red-50 border-red-200 text-red-800
- Warning: bg-yellow-50 border-yellow-200 text-yellow-800
- Info: bg-blue-50 border-blue-200 text-blue-800
```

**7. Loading State**
```tsx
// @/components/ui/Loading.tsx

// Skeleton
<Skeleton className="h-20 w-full" />

// Spinner
<Spinner size="md" />

// Table Skeleton
<TableSkeleton rows={5} columns={4} />
```

---

### Layout Responsive

**Breakpoints:**
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Grid System:**
```tsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3-4 columns

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(...)}
</div>
```

---

## 🔐 ADMIN PANEL WORKFLOW

### Authentication Flow

```
┌─────────────────────────────────────────┐
│ 1. User akses /admin/*                  │
│    ↓                                    │
│ 2. Check session cookie (JWT)           │
│    ├── Valid? → Continue                │
│    └── Invalid? → Redirect /login       │
│                                         │
│ 3. Login page (/login)                  │
│    ↓                                    │
│ 4. POST /api/auth/login                 │
│    ├── Verify username + password       │
│    ├── bcrypt.compare(password, hash)   │
│    └── Generate JWT + Set cookie        │
│                                         │
│ 5. Redirect → /admin/dashboard          │
└─────────────────────────────────────────┘
```

**Implementation:**
```tsx
// @/app/api/auth/login/route.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  
  // Query admin
  const { data: admin } = await supabase
    .from('admin_publicweb')
    .select('*')
    .eq('username', username)
    .single();
  
  if (!admin) {
    return Response.json({ error: 'User tidak ditemukan' }, { status: 401 });
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, admin.password_hash);
  
  if (!isValid) {
    return Response.json({ error: 'Password salah' }, { status: 401 });
  }
  
  // Generate JWT
  const token = jwt.sign(
    { 
      id: admin.id, 
      username: admin.username, 
      role: admin.user_role 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  // Set HTTP-only cookie
  const response = Response.json({ 
    success: true, 
    user: { 
      id: admin.id, 
      username: admin.username,
      fullName: admin.full_name,
      role: admin.user_role
    } 
  });
  
  response.headers.set(
    'Set-Cookie',
    `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
  );
  
  return response;
}
```

**Middleware Protection:**
```tsx
// @/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

---

### Role-Based Access Control (RBAC)

**Roles:**
- `superadmin`: Full access (CRUD semua tabel, kelola admin)
- `admin`: Limited access (CRUD konten, tidak bisa kelola admin)

**Permission Matrix:**
```
┌─────────────────────────┬────────────┬───────┐
│ Resource                │ Superadmin │ Admin │
├─────────────────────────┼────────────┼───────┤
│ Dashboard               │ ✅         │ ✅    │
│ Kelola Konten (semua)   │ ✅         │ ✅    │
│ Kelola Admin Users      │ ✅         │ ❌    │
│ Site Settings           │ ✅         │ ❌    │
│ Database Backup         │ ✅         │ ❌    │
│ Activity Logs           │ ✅         │ 👁️   │
└─────────────────────────┴────────────┴───────┘
```

**Implementation:**
```tsx
// @/lib/auth.ts
export function checkPermission(user: AdminUser, action: string, resource: string) {
  if (user.role === 'superadmin') return true;
  
  const permissions = {
    admin: {
      content: ['create', 'read', 'update', 'delete'],
      admin_users: ['read'],
      site_settings: ['read'],
    }
  };
  
  return permissions[user.role]?.[resource]?.includes(action) ?? false;
}

// Usage di API:
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  
  if (!checkPermission(user, 'delete', 'admin_users')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // ... delete logic
}
```

---

### Admin Sidebar Navigation

```tsx
// @/components/sidebar-admin.tsx
const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    label: 'Konten Website',
    icon: FileText,
    children: [
      { label: 'Hero Slides', href: '/admin/kelola-hero' },
      { label: 'Highlights', href: '/admin/kelola-highlights' },
      { label: 'Publikasi', href: '/admin/publikasi' },
      { label: 'Prestasi', href: '/admin/prestasi' },
      { label: 'Berita', href: '/admin/berita' },
    ],
  },
  {
    label: 'Halaman',
    icon: Layout,
    children: [
      { label: 'Profil Sekolah', href: '/admin/profil-sekolah' },
      { label: 'Sambutan', href: '/admin/sambutan' },
      { label: 'Sejarah', href: '/admin/sejarah' },
      { label: 'Visi Misi', href: '/admin/visi-misi' },
      { label: 'Akademik', href: '/admin/akademik' },
      { label: 'Kesiswaan', href: '/admin/kesiswaan' },
      { label: 'Kontak', href: '/admin/kontak' },
    ],
  },
  {
    label: 'Data Master',
    icon: Database,
    children: [
      { label: 'Guru & Staff', href: '/admin/kelola-guru' },
      { label: 'Kegiatan', href: '/admin/kelola-kegiatan' },
      { label: 'Download', href: '/admin/kelola-download' },
      { label: 'Kelulusan', href: '/admin/kelulusan' },
    ],
  },
  {
    label: 'PPDB',
    icon: Users,
    href: '/admin/ppdb',
  },
  {
    label: 'Pengaturan',
    icon: Settings,
    children: [
      { label: 'Site Settings', href: '/admin/site-settings', roles: ['superadmin'] },
      { label: 'Menu Navigasi', href: '/admin/kelola-header' },
      { label: 'Footer', href: '/admin/kelola-footer' },
      { label: 'Sosial Media', href: '/admin/sosial-media' },
      { label: 'Banner CTA', href: '/admin/kelola-banner' },
      { label: 'Hero Pages', href: '/admin/kelola-hero-pages' },
    ],
  },
  {
    label: 'Admin Users',
    icon: UserCog,
    href: '/admin/users',
    roles: ['superadmin'],
  },
];
```

---

### Activity Logging

**Setiap aksi admin (create, update, delete) dicatat:**

```tsx
// @/lib/logger.ts
export async function logActivity(
  adminId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  resourceType: string,
  resourceId: string,
  description: string,
  ipAddress: string
) {
  await supabase.from('admin_activities').insert({
    admin_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    description,
    ip_address: ipAddress,
  });
}

// Usage di API:
export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  const { title, slug } = await req.json();
  
  const { data } = await supabase
    .from('content_posts')
    .insert({ title, slug })
    .select()
    .single();
  
  // Log activity
  await logActivity(
    user.id,
    'CREATE',
    'content_posts',
    data.id,
    `Membuat publikasi baru: ${title}`,
    req.headers.get('x-forwarded-for') || 'unknown'
  );
  
  return Response.json(data);
}
```

**View Logs (Superadmin only):**
```tsx
// @/app/(admin)/admin/activity-logs/page.tsx
export default async function ActivityLogsPage() {
  const { data: logs } = await supabase
    .from('admin_activities')
    .select(`
      *,
      admin_publicweb (
        username,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Waktu</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead>Aksi</TableHead>
          <TableHead>Resource</TableHead>
          <TableHead>Deskripsi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map(log => (
          <TableRow key={log.id}>
            <TableCell>{formatDate(log.created_at)}</TableCell>
            <TableCell>{log.admin_publicweb.full_name}</TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(log.action)}>
                {log.action}
              </Badge>
            </TableCell>
            <TableCell>{log.resource_type}</TableCell>
            <TableCell>{log.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 📅 TIMELINE IMPLEMENTASI

### Week 1-2: Foundation & Dashboard
- [ ] Setup tabel baru di database (extracurriculars, character_programs, site_banners, page_heroes)
- [ ] Buat komponen UI reusable (Button, Input, Card, Table, Modal)
- [ ] Implement authentication middleware
- [ ] Buat Dashboard Admin (statistik cards + chart)

### Week 3-4: Beranda Dinamis
- [ ] API & Admin UI untuk Highlights
- [ ] Integrasikan Sambutan Kepala Madrasah ke beranda
- [ ] API & Admin UI untuk Hero Slides
- [ ] API & Admin UI untuk Banner CTA
- [ ] Update beranda publik (replace hardcoded)

### Week 5-6: Halaman Kesiswaan
- [ ] API & Admin UI untuk Ekstrakurikuler
- [ ] API & Admin UI untuk Pembiasaan Karakter
- [ ] Update halaman publik Kesiswaan

### Week 7-8: Halaman Akademik & Kontak
- [ ] Admin UI untuk Akademik (hero, kurikulum, mapel, program)
- [ ] Dynamic Google Maps di halaman Kontak
- [ ] API & Admin UI untuk Hero Pages (Kelulusan, dll)

### Week 9-10: Data Master
- [ ] API & Admin UI untuk Guru
- [ ] API & Admin UI untuk Kegiatan
- [ ] API & Admin UI untuk Download Files
- [ ] API & Admin UI untuk Kelulusan (+ import CSV)

### Week 11-12: Polish & Testing
- [ ] RBAC implementation (role permissions)
- [ ] Activity logging
- [ ] SEO optimization (dynamic meta tags)
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] User acceptance testing (UAT)

### Week 13-14: Deployment & Training
- [ ] Deploy to production
- [ ] Database migration
- [ ] Admin user training
- [ ] Documentation
- [ ] Post-launch monitoring

---

## ✅ TESTING CHECKLIST

### Functional Testing

**Authentication:**
- [ ] Login dengan credentials valid berhasil
- [ ] Login dengan credentials invalid gagal
- [ ] Session expired redirect ke login
- [ ] Logout berhasil menghapus session

**CRUD Operations (untuk setiap module):**
- [ ] Create: Data berhasil tersimpan di database
- [ ] Read: Data ditampilkan dengan benar
- [ ] Update: Data berhasil diupdate
- [ ] Delete: Data berhasil dihapus (atau soft delete)
- [ ] Validation: Form validation berfungsi
- [ ] Error handling: Error message ditampilkan dengan jelas

**Upload Files:**
- [ ] Upload image berhasil (Cloudinary)
- [ ] Upload file berhasil (Supabase Storage)
- [ ] File size validation (max 10MB)
- [ ] File type validation (hanya accept type yang sesuai)
- [ ] Preview image/file sebelum upload

**Import CSV:**
- [ ] CSV format valid berhasil diimport
- [ ] CSV dengan error ditolak dan menampilkan detail error
- [ ] Duplikat data terdeteksi
- [ ] Preview data sebelum confirm import

---

### UI/UX Testing

**Responsive Design:**
- [ ] Mobile (320px - 640px): Layout rapi, tidak ada overflow
- [ ] Tablet (640px - 1024px): Optimal spacing
- [ ] Desktop (1024px+): Full features

**Loading States:**
- [ ] Skeleton loading saat fetch data
- [ ] Spinner saat submit form
- [ ] Disable button saat proses berlangsung

**Error States:**
- [ ] 404 page untuk route tidak ditemukan
- [ ] Error boundary untuk runtime error
- [ ] Form validation error message jelas

**Accessibility:**
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Focus indicators jelas
- [ ] ARIA labels untuk screen reader
- [ ] Color contrast ratio ≥ 4.5:1

---

### Performance Testing

**Page Load:**
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.8s

**API Response:**
- [ ] GET requests < 200ms
- [ ] POST/PUT requests < 500ms
- [ ] Image optimization (WebP format, lazy loading)

**Database:**
- [ ] Query with index < 50ms
- [ ] Bulk insert 1000 records < 2s

---

### Security Testing

**Input Validation:**
- [ ] SQL injection prevention (Supabase RLS)
- [ ] XSS prevention (sanitize HTML input)
- [ ] CSRF protection (SameSite cookie)

**Authentication:**
- [ ] JWT expiration berfungsi
- [ ] Password hashing dengan bcrypt
- [ ] HTTP-only cookie untuk token

**Authorization:**
- [ ] RBAC enforcement (admin vs superadmin)
- [ ] API endpoint protection (verify JWT)
- [ ] File upload permission check

---

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 📝 CATATAN TAMBAHAN

### Dependencies yang Perlu Diinstall

```bash
# UI Components
npm install lucide-react
npm install recharts
npm install react-hook-form
npm install zod
npm install @hookform/resolvers

# File Upload
npm install papaparse
npm install @types/papaparse

# Authentication
npm install bcryptjs
npm install @types/bcryptjs
npm install jsonwebtoken
npm install @types/jsonwebtoken

# Rich Text Editor (if needed)
npm install @tiptap/react @tiptap/starter-kit

# Date Handling
npm install date-fns

# Drag & Drop (for reorder)
npm install @dnd-kit/core @dnd-kit/sortable
```

---

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=your_secret_key_here
```

---

### Git Workflow

```bash
# Branch Strategy
main          # Production
├── develop   # Development
    ├── feature/dashboard
    ├── feature/highlights
    ├── feature/hero-slides
    └── feature/kesiswaan

# Commit Message Convention
feat: Menambahkan fitur kelola highlights
fix: Perbaikan bug upload image
refactor: Refactor komponen Table
docs: Update README
style: Format code dengan prettier
test: Menambahkan unit test untuk API
```

---

### Database Backup Strategy

```bash
# Daily backup (automated via cron)
# Backup script menggunakan pg_dump
0 2 * * * pg_dump -h localhost -U postgres -d mi_alfalah > backup_$(date +\%Y\%m\%d).sql

# Retention policy: 30 hari
# Simpan di cloud storage (Google Drive / Dropbox)
```

---

## 🎯 SUCCESS METRICS

### KPI (Key Performance Indicators)

1. **Konten Dinamis:** 100% konten hardcoded sudah menjadi dinamis
2. **Admin Adoption:** 90% admin bisa kelola konten tanpa bantuan developer
3. **Page Load Speed:** < 3 detik untuk semua halaman
4. **Mobile Traffic:** 60% pengunjung dari mobile
5. **PPDB Conversion:** 20% pengunjung halaman PPDB submit form

---

## 📞 SUPPORT & MAINTENANCE

### Post-Launch Support

1. **Bug Fixing:** 2 minggu intensive monitoring
2. **Admin Training:** 2x sesi training (masing-masing 2 jam)
3. **Documentation:** User manual untuk admin panel
4. **Hotline:** WhatsApp group untuk support cepat

### Maintenance Plan

1. **Monthly:** Review analytics, performance check
2. **Quarterly:** Database optimization, security audit
3. **Yearly:** Feature enhancement based on feedback

---

**Dokumen ini adalah living document dan akan diupdate seiring progress development.**

**Last Updated:** 2026-02-07  
**Version:** 1.0  
**Author:** Development Team MI Al-Falah Kanigoro
