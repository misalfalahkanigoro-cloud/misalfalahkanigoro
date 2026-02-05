// Types for API responses based on Prisma schema

export interface SchoolSettings {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl: string | null;
}

export interface HeroSlide {
    id: number;
    imageUrl: string;
    title: string;
    subtitle: string;
    order: number;
}

export interface Highlight {
    id: number;
    icon: string;
    title: string;
    description: string;
    order: number;
}

export interface Teacher {
    id: number;
    name: string;
    position: string;
    imageUrl: string | null;
}

export interface NewsItem {
    id: number;
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    content?: string;
    thumbnailUrl: string | null;
    category: string;
}

export type ContentType = 'news' | 'announcement' | 'article' | 'gallery' | 'download';

export interface PinnedItem {
    id: number;
    title: string;
    slug: string;
    coverUrl: string | null;
    type: 'publikasi' | 'prestasi';
    date: string;
}
export type ContentMediaType = 'image' | 'file' | 'embed';

export interface ContentMedia {
    id: number;
    postId: number;
    mediaType: ContentMediaType;
    url: string | null;
    embedHtml: string | null;
    caption: string | null;
    displayOrder: number;
    isActive: boolean;
}

export interface ContentPost {
    id: number;
    type: ContentType;
    title: string;
    slug: string;
    excerpt?: string | null;
    contentHtml?: string | null;
    contentText?: string | null;
    coverUrl?: string | null;
    category?: string | null;
    publishedAt?: string | null;
    isPublished: boolean;
    isPinned: boolean;
    meta?: unknown | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    media?: ContentMedia[];
}

export interface ContentPostDetailResponse {
    post: ContentPost;
    media: ContentMedia[];
}

export interface NewsListResponse {
    items: NewsItem[];
    total: number;
    page: number;
    pageSize: number;
    categories: string[];
    categoryCounts: { category: string; count: number }[];
}

export interface ContentListResponse {
    items: ContentPost[];
    total: number;
    page: number;
    pageSize: number;
    categories: string[];
    categoryCounts: { category: string; count: number }[];
}

export interface Activity {
    id: number;
    title: string;
    imageUrl: string | null;
}

export interface GraduationStudent {
    id: number;
    nisn: string;
    name: string;
    className: string;
    status: 'LULUS' | 'DITUNDA';
    averageScore: number;
    year: string;
}

export interface Achievement {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    contentHtml?: string | null;
    contentText?: string | null;
    coverUrl?: string | null;
    category?: string | null;
    achievedAt?: string | null;
    isPublished: boolean;
    isPinned: boolean;
    meta?: unknown | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface DownloadFile {
    id: number;
    title: string;
    category: string;
    date: string;
    size: string;
    fileType: string;
    fileUrl: string;
}

export interface PPDBFormData {
    namaLengkap: string;
    nik: string;
    nisn: string;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: 'L' | 'P';
    alamat: string;
    namaAyah: string;
    pekerjaanAyah: string;
    namaIbu: string;
    pekerjaanIbu: string;
    noHp: string;
}

export interface PPDBRegistration {
    id: string;
    namaLengkap: string;
    nik: string;
    nisn: string | null;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: 'L' | 'P';
    alamat: string;
    namaAyah: string;
    pekerjaanAyah: string;
    namaIbu: string;
    pekerjaanIbu: string;
    noHp: string;
    status: 'VERIFIKASI' | 'BERKAS_VALID' | 'DITERIMA' | 'DITOLAK';
    pesan: string | null;
}

export interface PPDBStatusResponse {
    id: string;
    nama: string;
    tanggalDaftar: string;
    status: 'VERIFIKASI' | 'BERKAS_VALID' | 'DITERIMA' | 'DITOLAK';
    pesan: string | null;
}

export interface PPDBSubmitResponse {
    success: boolean;
    registrationId: string;
}

export interface ProfilePage {
    id: string;
    descriptionJson?: unknown | null;
    descriptionHtml?: string | null;
    descriptionText?: string | null;
    videoUrl?: string | null;
    schoolName: string;
    npsn: string;
    schoolAddress: string;
    village: string;
    district: string;
    city: string;
    province: string;
    schoolStatus: string;
    educationForm: string;
    educationLevel: string;
}

export interface AcademicSubject {
    id: number;
    name: string;
    order: number;
}

export interface AcademicProgram {
    id: number;
    title: string;
    description: string;
    icon: string | null;
    order: number;
}

export interface AcademicPage {
    id: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl: string | null;
    curriculumTitle: string;
    curriculumIntro1: string;
    curriculumIntro2: string;
    subjectsTitle: string;
    programsTitle: string;
    subjects: AcademicSubject[];
    programs: AcademicProgram[];
}

export interface ContactWhatsappItem {
    id: string;
    name: string;
    url: string;
}

export interface ContactPage {
    id: string;
    address: string;
    phone?: string | null;
    email: string;
    whatsappList: ContactWhatsappItem[];
    adminWhatsappId?: string | null;
    mapEmbedHtml: string | null;
}

export interface SiteSettings {
    id: string;
    schoolName: string;
    schoolLogoUrl: string | null;
    schoolAddress: string | null;
    schoolPhone: string | null;
    schoolEmail: string | null;
    schoolWhatsapp: string | null;
    schoolTagline: string | null;
    isActive: boolean;
}

export interface SocialMediaLink {
    id: string;
    platform: 'facebook' | 'instagram' | 'youtube' | 'twitter' | 'tiktok' | 'linkedin';
    url: string;
    displayOrder: number;
    isActive: boolean;
}

export interface NavigationMenuItem {
    id: string;
    label: string;
    href: string | null;
    parentId: string | null;
    displayOrder: number;
    isActive: boolean;
    icon: string | null;
    children?: NavigationMenuItem[];
}

export interface FooterQuickLink {
    id: string;
    label: string;
    href: string;
    displayOrder: number;
    isActive: boolean;
}

export interface HeadmasterGreeting {
    id: string;
    title: string;
    subtitle: string | null;
    contentJson: unknown | null;
    contentHtml: string | null;
    contentText: string | null;
    headmasterName: string;
    headmasterTitle: string | null;
    photoUrl: string | null;
    isActive: boolean;
}

export interface HistoryPage {
    id: string;
    title: string;
    subtitle: string | null;
    contentJson: unknown | null;
    contentHtml: string | null;
    contentText: string | null;
    coverImageUrl: string | null;
    videoUrl: string | null;
    isActive: boolean;
}

export interface HistoryTimelineItem {
    id: string;
    historyPageId: string;
    year: string;
    title: string;
    descriptionJson: unknown | null;
    descriptionHtml: string | null;
    descriptionText: string | null;
    mediaUrl: string | null;
    displayOrder: number;
    isActive: boolean;
}

export interface VisionMissionPage {
    id: string;
    visionText: string;
    missionText: string;
    isActive: boolean;
}

export type AdminRole = 'admin' | 'superadmin';

export interface AdminPublicUser {
    id: string;
    username: string;
    role: AdminRole;
    fullName: string;
    email: string | null;
    phone: string | null;
}

export interface AdminLoginResponse {
    user: AdminPublicUser;
}

// Navigation (static, not from DB)
export interface NavItem {
    label: string;
    path: string;
}
