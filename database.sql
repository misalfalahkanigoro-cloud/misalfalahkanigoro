-- Database schema for Supabase (PostgreSQL)
-- Enable required extensions
create extension if not exists "pgcrypto";

-- Enums
create type gender as enum ('L', 'P');
create type graduation_status as enum ('LULUS', 'DITUNDA');
create type ppdb_status as enum ('VERIFIKASI', 'BERKAS_VALID', 'DITERIMA', 'DITOLAK');
create type file_type as enum ('PDF', 'DOCX', 'XLSX');

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_type') then
    create type content_type as enum ('news', 'announcement', 'article', 'gallery', 'download');
  end if;
  if not exists (select 1 from pg_type where typname = 'media_type') then
    create type media_type as enum ('image', 'file', 'embed');
  end if;
end $$;

-- Utility trigger to auto-update "updatedAt"
create or replace function set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

-- Core tables
create table if not exists school_settings (
  id text primary key default 'main',
  name text not null,
  address text not null,
  phone text not null,
  email text not null,
  "logoUrl" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists hero_slides (
  id bigserial primary key,
  "imageUrl" text not null,
  title text not null,
  subtitle text not null,
  "order" integer not null default 0,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists hero_slides_active_order_idx on hero_slides ("isActive", "order");

create table if not exists highlights (
  id bigserial primary key,
  icon text not null,
  title text not null,
  description text not null,
  "order" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists highlights_order_idx on highlights ("order");

create table if not exists teachers (
  id bigserial primary key,
  name text not null,
  position text not null,
  "imageUrl" text,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists teachers_active_idx on teachers ("isActive");

create table if not exists news (
  id bigserial primary key,
  title text not null,
  slug text not null unique,
  date timestamptz not null,
  excerpt text not null,
  content text,
  "thumbnailUrl" text,
  category text not null,
  "isPublished" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists news_published_date_idx on news ("isPublished", date);
create index if not exists news_category_idx on news (category);

-- Unified content posts (news, announcement, article, gallery, download)
create table if not exists content_posts (
  id bigserial primary key,
  type content_type not null,
  title text not null,
  slug text not null unique,
  excerpt text,
  "contentHtml" text,
  "contentText" text,
  "coverUrl" text,
  category text,
  "publishedAt" timestamptz,
  "isPublished" boolean not null default true,
  "isPinned" boolean not null default false,
  meta jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists content_posts_type_published_idx on content_posts (type, "isPublished", "publishedAt");
create index if not exists content_posts_category_idx on content_posts (category);

create table if not exists content_media (
  id bigserial primary key,
  "postId" bigint not null references content_posts(id) on delete cascade,
  "mediaType" media_type not null,
  url text,
  "embedHtml" text,
  caption text,
  "displayOrder" integer not null default 0,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists content_media_post_order_idx on content_media ("postId", "displayOrder");

-- Achievements (separate module, similar to content)
create table if not exists achievements (
  id bigserial primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  "contentHtml" text,
  "contentText" text,
  "coverUrl" text,
  category text,
  "achievedAt" date,
  "isPublished" boolean not null default true,
  "isPinned" boolean not null default false,
  meta jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists achievements_published_idx on achievements ("isPublished", "achievedAt");
create index if not exists achievements_category_idx on achievements (category);


create table if not exists activities (
  id bigserial primary key,
  title text not null,
  "imageUrl" text,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists activities_active_idx on activities ("isActive");

create table if not exists graduation_students (
  id bigserial primary key,
  nisn text not null unique,
  name text not null,
  "className" text not null,
  status graduation_status not null,
  "averageScore" double precision not null default 0,
  year text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists graduation_students_year_idx on graduation_students (year);

create table if not exists download_files (
  id bigserial primary key,
  title text not null,
  category text not null,
  date timestamptz not null,
  size text not null,
  "fileType" file_type not null,
  "fileUrl" text not null,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists download_files_active_category_idx on download_files ("isActive", category);

create table if not exists ppdb_registrations (
  id uuid primary key default gen_random_uuid(),
  "namaLengkap" text not null,
  nik text not null,
  nisn text,
  "tempatLahir" text not null,
  "tanggalLahir" date not null,
  "jenisKelamin" gender not null,
  alamat text not null,
  "namaAyah" text not null,
  "pekerjaanAyah" text,
  "namaIbu" text not null,
  "pekerjaanIbu" text,
  "noHp" text not null,
  status ppdb_status not null default 'VERIFIKASI',
  pesan text,
  "tanggalDaftar" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists ppdb_registrations_status_date_idx on ppdb_registrations (status, "tanggalDaftar");

-- Admin users (separate table for admin panel access)
-- Admin users for public web (separate table for admin panel access)
create table if not exists admin_publicweb (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  user_role text not null default 'admin' check (user_role in ('admin', 'superadmin')),
  full_name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: site_settings
-- Menyimpan pengaturan umum website
-- ============================================
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  school_logo_url text,
  school_address text,
  school_phone text,
  school_email text,
  school_whatsapp text,
  school_tagline text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: social_media_links
-- Menyimpan link sosial media
-- ============================================
create table if not exists social_media_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook', 'instagram', 'youtube', 'twitter', 'tiktok', 'linkedin')),
  url text not null,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: navigation_menu
-- Menyimpan menu navigasi (header)
-- ============================================
create table if not exists navigation_menu (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text,
  parent_id uuid references navigation_menu(id) on delete cascade,
  display_order int default 0,
  is_active boolean default true,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_navigation_parent on navigation_menu(parent_id);
create index if not exists idx_navigation_order on navigation_menu(display_order);

-- ============================================
-- TABLE: footer_quick_links
-- Menyimpan tautan cepat di footer
-- ============================================
create table if not exists footer_quick_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: headmaster_greeting
-- Menyimpan sambutan kepala madrasah
-- ============================================
create table if not exists headmaster_greeting (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  content_json jsonb,
  content_html text,
  content_text text,
  headmaster_name text not null,
  headmaster_title text,
  photo_url text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: history_page
-- Menyimpan halaman sejarah madrasah
-- ============================================
create table if not exists history_page (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Sejarah Madrasah',
  subtitle text,
  content_json jsonb,
  content_html text,
  content_text text,
  cover_image_url text,
  video_url text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- TABLE: history_timeline_items
-- Menyimpan timeline sejarah
-- ============================================
create table if not exists history_timeline_items (
  id uuid primary key default gen_random_uuid(),
  history_page_id uuid not null references history_page(id) on delete cascade,
  year text not null,
  title text not null,
  description_json jsonb,
  description_html text,
  description_text text,
  media_url text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists history_timeline_items_page_order_idx on history_timeline_items(history_page_id, display_order);

-- ============================================
-- TABLE: vision_mission_page
-- Menyimpan halaman visi dan misi (simpel)
-- ============================================
create table if not exists vision_mission_page (
  id uuid primary key default gen_random_uuid(),
  vision_text text not null,
  mission_text text not null,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists vision_mission_page_active_idx on vision_mission_page(is_active);

-- Content pages
create table if not exists profile_page (
  id text primary key default 'main',
  "descriptionJson" jsonb,
  "descriptionHtml" text,
  "descriptionText" text,
  "videoUrl" text,
  "schoolName" text not null,
  npsn text not null,
  "schoolAddress" text not null,
  village text not null,
  district text not null,
  city text not null,
  province text not null,
  "schoolStatus" text not null,
  "educationForm" text not null,
  "educationLevel" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists profile_mission_items (
  id bigserial primary key,
  "pageId" text not null references profile_page(id) on delete cascade,
  text text not null,
  "order" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists profile_mission_items_page_order_idx on profile_mission_items ("pageId", "order");

create table if not exists profile_identity_items (
  id bigserial primary key,
  "pageId" text not null references profile_page(id) on delete cascade,
  label text not null,
  value text not null,
  "order" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists profile_identity_items_page_order_idx on profile_identity_items ("pageId", "order");

create table if not exists academic_page (
  id text primary key default 'main',
  "heroTitle" text not null,
  "heroSubtitle" text not null,
  "heroImageUrl" text,
  "curriculumTitle" text not null,
  "curriculumIntro1" text not null,
  "curriculumIntro2" text not null,
  "subjectsTitle" text not null,
  "programsTitle" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists academic_subjects (
  id bigserial primary key,
  "pageId" text not null references academic_page(id) on delete cascade,
  name text not null,
  "order" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists academic_subjects_page_order_idx on academic_subjects ("pageId", "order");

create table if not exists academic_programs (
  id bigserial primary key,
  "pageId" text not null references academic_page(id) on delete cascade,
  title text not null,
  description text not null,
  icon text,
  "order" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists academic_programs_page_order_idx on academic_programs ("pageId", "order");

create table if not exists contact_page (
  id text primary key default 'main',
  address text not null,
  phone text,
  email text not null,
  "whatsappList" jsonb not null default '[]'::jsonb,
  "adminWhatsappId" text,
  "mapEmbedHtml" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- Triggers for updatedAt
create trigger school_settings_updated_at before update on school_settings
for each row execute function set_updated_at();
create trigger hero_slides_updated_at before update on hero_slides
for each row execute function set_updated_at();
create trigger highlights_updated_at before update on highlights
for each row execute function set_updated_at();
create trigger teachers_updated_at before update on teachers
for each row execute function set_updated_at();
create trigger news_updated_at before update on news
for each row execute function set_updated_at();
create trigger content_posts_updated_at before update on content_posts
for each row execute function set_updated_at();
create trigger content_media_updated_at before update on content_media
for each row execute function set_updated_at();
create trigger achievements_updated_at before update on achievements
for each row execute function set_updated_at();
create trigger achievement_media_updated_at before update on achievement_media
for each row execute function set_updated_at();
create trigger activities_updated_at before update on activities
for each row execute function set_updated_at();
create trigger graduation_students_updated_at before update on graduation_students
for each row execute function set_updated_at();
create trigger download_files_updated_at before update on download_files
for each row execute function set_updated_at();
create trigger ppdb_registrations_updated_at before update on ppdb_registrations
for each row execute function set_updated_at();
-- Function to update updated_at timestamp (snake_case columns)
create or replace function set_updated_at_snake()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger admin_publicweb_updated_at
before update on admin_publicweb
for each row execute function set_updated_at_snake();
create trigger site_settings_updated_at
before update on site_settings
for each row execute function set_updated_at_snake();
create trigger social_media_links_updated_at
before update on social_media_links
for each row execute function set_updated_at_snake();
create trigger navigation_menu_updated_at
before update on navigation_menu
for each row execute function set_updated_at_snake();
create trigger footer_quick_links_updated_at
before update on footer_quick_links
for each row execute function set_updated_at_snake();
create trigger headmaster_greeting_updated_at
before update on headmaster_greeting
for each row execute function set_updated_at_snake();
create trigger history_page_updated_at
before update on history_page
for each row execute function set_updated_at_snake();
create trigger history_timeline_items_updated_at
before update on history_timeline_items
for each row execute function set_updated_at_snake();
create trigger vision_mission_page_updated_at
before update on vision_mission_page
for each row execute function set_updated_at_snake();
create trigger profile_page_updated_at before update on profile_page
for each row execute function set_updated_at();
create trigger profile_mission_items_updated_at before update on profile_mission_items
for each row execute function set_updated_at();
create trigger profile_identity_items_updated_at before update on profile_identity_items
for each row execute function set_updated_at();
create trigger academic_page_updated_at before update on academic_page
for each row execute function set_updated_at();
create trigger academic_subjects_updated_at before update on academic_subjects
for each row execute function set_updated_at();
create trigger academic_programs_updated_at before update on academic_programs
for each row execute function set_updated_at();
create trigger contact_page_updated_at before update on contact_page
for each row execute function set_updated_at();

-- Enable RLS on all tables
alter table school_settings enable row level security;
alter table hero_slides enable row level security;
alter table highlights enable row level security;
alter table teachers enable row level security;
alter table news enable row level security;
alter table content_posts enable row level security;
alter table content_media enable row level security;
alter table achievements enable row level security;
alter table achievement_media enable row level security;
alter table activities enable row level security;
alter table graduation_students enable row level security;
alter table download_files enable row level security;
alter table ppdb_registrations enable row level security;
alter table admin_publicweb enable row level security;
alter table site_settings enable row level security;
alter table social_media_links enable row level security;
alter table navigation_menu enable row level security;
alter table footer_quick_links enable row level security;
alter table headmaster_greeting enable row level security;
alter table history_page enable row level security;
alter table history_timeline_items enable row level security;
alter table vision_mission_page enable row level security;
alter table profile_page enable row level security;
alter table profile_mission_items enable row level security;
alter table profile_identity_items enable row level security;
alter table academic_page enable row level security;
alter table academic_subjects enable row level security;
alter table academic_programs enable row level security;
alter table contact_page enable row level security;

-- Policies: anon can read only
create policy "anon_read_school_settings" on school_settings for select to anon using (true);
create policy "anon_read_hero_slides" on hero_slides for select to anon using (true);
create policy "anon_read_highlights" on highlights for select to anon using (true);
create policy "anon_read_teachers" on teachers for select to anon using (true);
create policy "anon_read_news" on news for select to anon using (true);
create policy "anon_read_content_posts" on content_posts for select to anon using ("isPublished" = true);
create policy "anon_read_content_media" on content_media for select to anon using ("isActive" = true);
create policy "anon_read_achievements" on achievements for select to anon using ("isPublished" = true);
create policy "anon_read_achievement_media" on achievement_media for select to anon using ("isActive" = true);
create policy "anon_read_activities" on activities for select to anon using (true);
create policy "anon_read_graduation_students" on graduation_students for select to anon using (true);
create policy "anon_read_download_files" on download_files for select to anon using (true);
create policy "anon_read_ppdb_registrations" on ppdb_registrations for select to anon using (true);
-- RLS Policies (optional - sesuaikan dengan kebutuhan)
-- Policy untuk superadmin bisa akses semua
create policy "Superadmin can do everything"
on admin_publicweb
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid() and user_role = 'superadmin'
  )
);

-- Policy untuk admin hanya bisa lihat data sendiri
create policy "Admin can view own data"
on admin_publicweb
for select
using (id = auth.uid() or user_role = 'superadmin');
create policy "anon_read_profile_page" on profile_page for select to anon using (true);
create policy "anon_read_profile_mission_items" on profile_mission_items for select to anon using (true);
create policy "anon_read_profile_identity_items" on profile_identity_items for select to anon using (true);
create policy "anon_read_academic_page" on academic_page for select to anon using (true);
create policy "anon_read_academic_subjects" on academic_subjects for select to anon using (true);
create policy "anon_read_academic_programs" on academic_programs for select to anon using (true);
create policy "anon_read_contact_page" on contact_page for select to anon using (true);

-- Policies: public web settings
create policy "Anyone can read site settings"
on site_settings
for select
using (is_active = true);

create policy "Only admin can modify site settings"
on site_settings
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Anyone can read active social media"
on social_media_links
for select
using (is_active = true);

create policy "Only admin can modify social media"
on social_media_links
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Anyone can read active navigation"
on navigation_menu
for select
using (is_active = true);

create policy "Only admin can modify navigation"
on navigation_menu
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Only admin can modify content posts"
on content_posts
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Only admin can modify content media"
on content_media
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Only admin can modify achievements"
on achievements
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Only admin can modify achievement media"
on achievement_media
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Anyone can read active footer links"
on footer_quick_links
for select
using (is_active = true);

create policy "Only admin can modify footer links"
on footer_quick_links
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Anyone can read active headmaster greeting"
on headmaster_greeting
for select
using (is_active = true);

create policy "Only admin can modify headmaster greeting"
on headmaster_greeting
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Anyone can read active history page"
on history_page
for select
using (is_active = true);

create policy "Only admin can modify history page"
on history_page
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Anyone can read active history timeline"
on history_timeline_items
for select
using (is_active = true);

create policy "Only admin can modify history timeline"
on history_timeline_items
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

create policy "Anyone can read active vision mission"
on vision_mission_page
for select
using (is_active = true);

create policy "Only admin can modify vision mission"
on vision_mission_page
for all
using (
  exists (
    select 1 from admin_publicweb
    where id = auth.uid()
  )
);

-- Seed dummy admin accounts
-- Note: bcryptjs default menggunakan 10 rounds
insert into admin_publicweb (username, password_hash, user_role, full_name, email, phone)
values 
  (
    'superadmin', 
    crypt('superadmin123', gen_salt('bf', 10)), 
    'superadmin',
    'Kang Dedi',
    'superadmin@misalfalah.sch.id',
    '081234567890'
  ),
  (
    'admin', 
    crypt('admin12345', gen_salt('bf', 10)), 
    'admin',
    'Kang Mulet',
    'admin@misalfalah.sch.id',
    '081234567891'
  )
on conflict (username)
do update set
  password_hash = excluded.password_hash,
  user_role = excluded.user_role,
  full_name = excluded.full_name,
  email = excluded.email,
  phone = excluded.phone;

-- Seed data awal site settings
insert into site_settings (
  school_name, 
  school_logo_url, 
  school_address, 
  school_phone, 
  school_email,
  school_whatsapp,
  school_tagline
)
values (
  'MIS Al-Falah Kanigoro',
  '/images/logo.png',
  'Jl. Raya Kanigoro No. 123, Blitar, Jawa Timur',
  '(0342) 123456',
  'info@misalfalah.sch.id',
  '6281234567890',
  'Mencetak generasi cerdas, berakhlak mulia, dan berwawasan global dengan landasan nilai-nilai Islami yang kuat.'
);

-- Seed data sosial media
insert into social_media_links (platform, url, display_order)
values 
  ('facebook', 'https://facebook.com/misalfalah', 1),
  ('instagram', 'https://instagram.com/misalfalah', 2),
  ('youtube', 'https://youtube.com/@misalfalah', 3);

-- Seed data menu navigasi (updated)
insert into navigation_menu (id, label, href, parent_id, display_order, is_active, icon, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'Beranda', '/', null, 1, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('00000000-0000-0000-0000-000000000002', 'Profil', null, null, 5, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('00000000-0000-0000-0000-000000000003', 'Akademik', null, null, 9, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('00000000-0000-0000-0000-000000000004', 'Informasi', null, null, 13, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('03aec87a-0649-4e79-8fee-3453e80bb417', 'RDM', 'https://rdm.mialfalahkanigoroblitar.sch.id/', '00000000-0000-0000-0000-000000000004', 19, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('1446cafd-68aa-4b5a-a1d8-0c770de41ae5', 'Sambutan Kepala Madrasah', '/sambutan', '00000000-0000-0000-0000-000000000002', 2, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 11:16:47.550436+00'),
  ('29437ea6-d220-4881-8451-867676f700fc', 'Akademik', '/akademik', '00000000-0000-0000-0000-000000000003', 3, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('3440477f-21c4-493d-a526-80a2c3b9f31a', 'Guru', '/guru', '00000000-0000-0000-0000-000000000002', 17, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('41b2531a-a7da-40a2-98fc-d46a6895468b', 'Prestasi', '/prestasi', '00000000-0000-0000-0000-000000000004', 15, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('5608b20b-471b-4915-982d-08c99df704a1', 'CBTM', 'https://misalfalah.cbtm.my.id/login', '00000000-0000-0000-0000-000000000004', 20, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('5f75bcaf-9f08-41e2-90c1-96d91b1cfefb', 'PPDB', '/ppdb', '00000000-0000-0000-0000-000000000003', 11, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('720b1c5f-2fb2-498e-8c1d-53f898696cab', 'Profil Madrasah', '/profil', '00000000-0000-0000-0000-000000000002', 6, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('7a9eda66-7822-44dd-b3f5-308b1a5ed9b4', 'Berita', '/berita', '00000000-0000-0000-0000-000000000004', 4, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('9cc27794-48c6-4d66-ab65-e2ab495d26d4', 'Kesiswaan', '/kesiswaan', '00000000-0000-0000-0000-000000000003', 7, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('aedb3d6b-d447-46b2-acc4-9a5d9daafae9', 'Kontak Madrasah', '/kontak', '00000000-0000-0000-0000-000000000002', 16, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('b8708c00-063e-4d47-9203-ca968163a1aa', 'Visi Misi Madrasah', '/visimisi', '00000000-0000-0000-0000-000000000002', 14, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 11:16:57.019408+00'),
  ('e6223482-c23f-4d09-b630-a563e86d5b2e', 'Sejarah Madrasah', '/sejarah', '00000000-0000-0000-0000-000000000002', 10, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 11:17:24.595945+00'),
  ('e688ba91-400a-4f06-b8e7-fc3b50403767', 'Kelulusan', '/kelulusan', '00000000-0000-0000-0000-000000000004', 8, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('ef5b7248-c76d-4d7d-83e2-cab07537bee4', 'Unduhan', '/download', '00000000-0000-0000-0000-000000000004', 12, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00'),
  ('f627cd99-d861-44c6-bf06-6fba3d921dd9', 'E learning', 'https://elearning.mialfalahkanigoroblitar.sch.id/', '00000000-0000-0000-0000-000000000004', 18, true, null, '2026-02-04 10:48:04.282507+00', '2026-02-04 10:48:04.282507+00');

-- Seed data footer links
insert into footer_quick_links (label, href, display_order)
values 
  ('Profil Sekolah', '/profil', 1),
  ('Info PPDB', '/ppdb', 2),
  ('Berita & Kegiatan', '/berita', 3),
  ('Kurikulum', '/akademik', 4),
  ('Hubungi Kami', '/kontak', 5);

insert into headmaster_greeting (
  title,
  subtitle,
  content_text,
  headmaster_name,
  headmaster_title,
  photo_url
)
values (
  'Sambutan Kepala Madrasah',
  'Mewujudkan Generasi Islami yang Kompetitif',
  'Assalamu''alaikum Warahmatullahi Wabarakatuh. Puji syukur kita panjatkan ke hadirat Allah SWT...',
  'Drs. H. Ahmad Fauzi, M.Pd',
  'Kepala Madrasah',
  'https://picsum.photos/id/1005/600/800'
);

-- Seed history page (Sejarah Madrasah)
insert into history_page (
  id,
  title,
  subtitle,
  content_html,
  content_text
)
values (
  '00000000-0000-0000-0000-000000000010',
  'Sejarah Madrasah',
  'Perjalanan MI Al-Falah Kanigoro dari masa ke masa.',
  '<p>MI Al-Falah Kanigoro berkembang sebagai madrasah ibtidaiyah yang menekankan pendidikan karakter dan nilai-nilai Islam.</p>',
  'MI Al-Falah Kanigoro berkembang sebagai madrasah ibtidaiyah yang menekankan pendidikan karakter dan nilai-nilai Islam.'
)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  content_html = excluded.content_html,
  content_text = excluded.content_text;

insert into history_timeline_items (
  history_page_id,
  year,
  title,
  description_text,
  display_order
)
values
  ('00000000-0000-0000-0000-000000000010', '1995', 'Awal Berdiri', 'Madrasah mulai dirintis oleh masyarakat sekitar.', 1)
on conflict do nothing;

-- Seed vision & mission page (Visi dan Misi)
insert into vision_mission_page (
  id,
  vision_text,
  mission_text,
  is_active
)
values (
  '00000000-0000-0000-0000-000000000020',
  'Terwujudnya peserta didik yang beriman, berakhlak mulia, cerdas, dan berdaya saing.',
  'Menanamkan nilai-nilai keislaman dan karakter. Meningkatkan kualitas pembelajaran yang aktif dan kreatif. Mendorong prestasi akademik dan non-akademik.',
  true
)
on conflict (id) do update set
  vision_text = excluded.vision_text,
  mission_text = excluded.mission_text,
  is_active = excluded.is_active;

-- Seed profile page (Profil Madrasah)
insert into profile_page (
  id,
  "descriptionHtml",
  "descriptionText",
  "videoUrl",
  "schoolName",
  npsn,
  "schoolAddress",
  village,
  district,
  city,
  province,
  "schoolStatus",
  "educationForm",
  "educationLevel"
)
values (
  'main',
  '<p><strong>MI AL-FALAH KANIGORO</strong> adalah madrasah ibtidaiyah swasta yang berlokasi di Kecamatan Kanigoro, Kabupaten Blitar, Provinsi Jawa Timur. Dengan NPSN <strong>60714626</strong>, kami berkomitmen menghadirkan layanan pendidikan dasar Islam yang berkualitas, berakar pada nilai-nilai keislaman, dan adaptif terhadap perkembangan zaman.</p><p>Madrasah ini berada di <strong>JL. IRIAN GANG PONDOK JAJAR KANIGORO</strong> dan melayani peserta didik jenjang <strong>DIKDAS</strong> (Bentuk Pendidikan: <strong>MI</strong>). Kami terus mendorong budaya belajar yang berakhlak, disiplin, dan berprestasi.</p>',
  'MI AL-FALAH KANIGORO adalah madrasah ibtidaiyah swasta yang berlokasi di Kecamatan Kanigoro, Kabupaten Blitar, Provinsi Jawa Timur. Dengan NPSN 60714626, kami berkomitmen menghadirkan layanan pendidikan dasar Islam yang berkualitas, berakar pada nilai-nilai keislaman, dan adaptif terhadap perkembangan zaman. Madrasah ini berada di JL. IRIAN GANG PONDOK JAJAR KANIGORO dan melayani peserta didik jenjang DIKDAS (Bentuk Pendidikan: MI). Kami terus mendorong budaya belajar yang berakhlak, disiplin, dan berprestasi.',
  null,
  'MI AL-FALAH KANIGORO',
  '60714626',
  'JL. IRIAN GANG PONDOK JAJAR KANIGORO',
  'KANIGORO',
  'KEC. KANIGORO',
  'KAB. BLITAR',
  'PROV. JAWA TIMUR',
  'SWASTA',
  'MI',
  'DIKDAS'
)
on conflict (id) do update set
  "descriptionHtml" = excluded."descriptionHtml",
  "descriptionText" = excluded."descriptionText",
  "videoUrl" = excluded."videoUrl",
  "schoolName" = excluded."schoolName",
  npsn = excluded.npsn,
  "schoolAddress" = excluded."schoolAddress",
  village = excluded.village,
  district = excluded.district,
  city = excluded.city,
  province = excluded.province,
  "schoolStatus" = excluded."schoolStatus",
  "educationForm" = excluded."educationForm",
  "educationLevel" = excluded."educationLevel";

-- Seed contact page (Kontak Madrasah)
insert into contact_page (
  id,
  address,
  phone,
  email,
  "whatsappList",
  "adminWhatsappId",
  "mapEmbedHtml"
)
values (
  'main',
  'JL. IRIAN GANG PONDOK JAJAR KANIGORO, KEC. KANIGORO, KAB. BLITAR, JAWA TIMUR',
  '(0342) 123456',
  'info@misalfalah.sch.id',
  $$[
    {"id":"wa-1","name":"Admin PPDB","url":"https://wa.me/6281234567890"},
    {"id":"wa-2","name":"Admin Humas","url":"https://wa.me/6281234567891"}
  ]$$::jsonb,
  'wa-1',
  '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.7337151461493!2d112.2221!3d-8.12857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78eb3897ca0edb%3A0x7e5b26d2a3d88ee9!2sMIS%20Al-Falah%20Kanigoro!5e0!3m2!1sid!2sid!4v1770228442341!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
)
on conflict (id) do update set
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  "whatsappList" = excluded."whatsappList",
  "adminWhatsappId" = excluded."adminWhatsappId",
  "mapEmbedHtml" = excluded."mapEmbedHtml";

-- Seed content posts (Publikasi)
with upsert as (
  insert into content_posts (
    type,
    title,
    slug,
    excerpt,
    "contentHtml",
    "contentText",
    "coverUrl",
    category,
    "publishedAt",
    "isPublished",
    meta
  )
  values (
    'news'::content_type,
    'Kegiatan Jumat Berkah',
    'kegiatan-jumat-berkah',
    'Siswa belajar berbagi melalui kegiatan Jumat Berkah di lingkungan madrasah.',
    $$<p>Kegiatan Jumat Berkah diikuti seluruh siswa dengan agenda berbagi dan doa bersama.</p>$$,
    'Kegiatan Jumat Berkah diikuti seluruh siswa dengan agenda berbagi dan doa bersama.',
    'https://picsum.photos/seed/berita-cover/1200/600',
    'Kegiatan',
    now(),
    true,
    '{"tags":["kegiatan","sosial"]}'::jsonb
  )
  on conflict (slug) do update set
    type = excluded.type,
    title = excluded.title,
    excerpt = excluded.excerpt,
    "contentHtml" = excluded."contentHtml",
    "contentText" = excluded."contentText",
    "coverUrl" = excluded."coverUrl",
    category = excluded.category,
    "publishedAt" = excluded."publishedAt",
    "isPublished" = excluded."isPublished",
    meta = excluded.meta
  returning id
)
insert into content_media ("postId", "mediaType", url, caption, "displayOrder", "isActive")
select id, 'image'::media_type, 'https://picsum.photos/seed/berita-1/1200/800', 'Dokumentasi 1', 1, true
from upsert
where not exists (
  select 1 from content_media where "postId" = upsert.id and url = 'https://picsum.photos/seed/berita-1/1200/800'
)
union all
select id, 'image'::media_type, 'https://picsum.photos/seed/berita-2/1200/800', 'Dokumentasi 2', 2, true
from upsert
where not exists (
  select 1 from content_media where "postId" = upsert.id and url = 'https://picsum.photos/seed/berita-2/1200/800'
);

with upsert as (
  insert into content_posts (
    type,
    title,
    slug,
    excerpt,
    "contentHtml",
    "contentText",
    "coverUrl",
    category,
    "publishedAt",
    "isPublished"
  )
  values (
    'announcement'::content_type,
    'Pengumuman PPDB 2026',
    'pengumuman-ppdb-2026',
    'Jadwal dan berkas PPDB tahun ajaran 2026 sudah tersedia.',
    $$<p>Silakan unduh dokumen pengumuman dan lengkapi berkas sesuai jadwal.</p>$$,
    'Silakan unduh dokumen pengumuman dan lengkapi berkas sesuai jadwal.',
    'https://picsum.photos/seed/pengumuman-cover/1200/600',
    'PPDB',
    now(),
    true
  )
  on conflict (slug) do update set
    type = excluded.type,
    title = excluded.title,
    excerpt = excluded.excerpt,
    "contentHtml" = excluded."contentHtml",
    "contentText" = excluded."contentText",
    "coverUrl" = excluded."coverUrl",
    category = excluded.category,
    "publishedAt" = excluded."publishedAt",
    "isPublished" = excluded."isPublished"
  returning id
)
insert into content_media ("postId", "mediaType", url, caption, "displayOrder", "isActive")
select id, 'file'::media_type, 'https://example.com/pengumuman-ppdb-2026.pdf', 'Pengumuman PPDB 2026 (PDF)', 1, true
from upsert
where not exists (
  select 1 from content_media where "postId" = upsert.id and url = 'https://example.com/pengumuman-ppdb-2026.pdf'
);

with upsert as (
  insert into content_posts (
    type,
    title,
    slug,
    excerpt,
    "contentHtml",
    "contentText",
    "coverUrl",
    category,
    "publishedAt",
    "isPublished"
  )
  values (
    'gallery'::content_type,
    'Galeri Lomba Pramuka',
    'galeri-lomba-pramuka',
    'Dokumentasi kegiatan lomba pramuka tingkat kecamatan.',
    $$<p>Galeri ini berisi dokumentasi kegiatan lomba pramuka di tingkat kecamatan.</p>$$,
    'Galeri ini berisi dokumentasi kegiatan lomba pramuka di tingkat kecamatan.',
    'https://picsum.photos/seed/galeri-cover/1200/600',
    'Galeri',
    now(),
    true
  )
  on conflict (slug) do update set
    type = excluded.type,
    title = excluded.title,
    excerpt = excluded.excerpt,
    "contentHtml" = excluded."contentHtml",
    "contentText" = excluded."contentText",
    "coverUrl" = excluded."coverUrl",
    category = excluded.category,
    "publishedAt" = excluded."publishedAt",
    "isPublished" = excluded."isPublished"
  returning id
)
insert into content_media ("postId", "mediaType", url, caption, "displayOrder", "isActive")
select id, 'image'::media_type, 'https://picsum.photos/seed/galeri-1/1200/800', 'Dokumentasi 1', 1, true
from upsert
where not exists (
  select 1 from content_media where "postId" = upsert.id and url = 'https://picsum.photos/seed/galeri-1/1200/800'
)
union all
select id, 'image'::media_type, 'https://picsum.photos/seed/galeri-2/1200/800', 'Dokumentasi 2', 2, true
from upsert
where not exists (
  select 1 from content_media where "postId" = upsert.id and url = 'https://picsum.photos/seed/galeri-2/1200/800'
);

with upsert as (
  insert into content_posts (
    type,
    title,
    slug,
    excerpt,
    "contentHtml",
    "contentText",
    category,
    "publishedAt",
    "isPublished"
  )
  values (
    'download'::content_type,
    'Formulir Daftar Ulang',
    'formulir-daftar-ulang',
    'Formulir daftar ulang peserta didik baru.',
    $$<p>Silakan unduh formulir daftar ulang melalui tautan berikut.</p>$$,
    'Silakan unduh formulir daftar ulang melalui tautan berikut.',
    'Dokumen',
    now(),
    true
  )
  on conflict (slug) do update set
    type = excluded.type,
    title = excluded.title,
    excerpt = excluded.excerpt,
    "contentHtml" = excluded."contentHtml",
    "contentText" = excluded."contentText",
    category = excluded.category,
    "publishedAt" = excluded."publishedAt",
    "isPublished" = excluded."isPublished"
  returning id
)
insert into content_media ("postId", "mediaType", url, caption, "displayOrder", "isActive")
select id, 'file'::media_type, 'https://example.com/formulir-daftar-ulang.pdf', 'Formulir Daftar Ulang (PDF)', 1, true
from upsert
where not exists (
  select 1 from content_media where "postId" = upsert.id and url = 'https://example.com/formulir-daftar-ulang.pdf'
);

-- Seed achievements (Prestasi)
with upsert as (
  insert into achievements (
    title,
    slug,
    excerpt,
    "contentHtml",
    "contentText",
    "coverUrl",
    category,
    "achievedAt",
    "isPublished",
    meta
  )
  values (
    'Juara 1 Olimpiade Matematika',
    'juara-1-olimpiade-matematika',
    'Prestasi siswa kelas 5 pada olimpiade matematika tingkat kabupaten.',
    $$<p>Siswa kelas 5 meraih Juara 1 Olimpiade Matematika tingkat kabupaten.</p>$$,
    'Siswa kelas 5 meraih Juara 1 Olimpiade Matematika tingkat kabupaten.',
    'https://picsum.photos/seed/prestasi-cover/1200/600',
    'Akademik',
    '2025-11-12',
    true,
    '{"level":"Kabupaten","peserta":"Tim Kelas 5"}'::jsonb
  )
  on conflict (slug) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    "contentHtml" = excluded."contentHtml",
    "contentText" = excluded."contentText",
    "coverUrl" = excluded."coverUrl",
    category = excluded.category,
    "achievedAt" = excluded."achievedAt",
    "isPublished" = excluded."isPublished",
    meta = excluded.meta
  returning id
)
insert into achievement_media ("achievementId", "mediaType", url, caption, "displayOrder", "isActive")
select id, 'image'::media_type, 'https://picsum.photos/seed/prestasi-1/1200/800', 'Dokumentasi Prestasi', 1, true
from upsert
where not exists (
  select 1 from achievement_media where "achievementId" = upsert.id and url = 'https://picsum.photos/seed/prestasi-1/1200/800'
);
