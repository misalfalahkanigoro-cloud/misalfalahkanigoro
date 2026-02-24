export type ContentMediaType = 'image' | 'video' | 'youtube_embed';

export interface MediaItem {
    id?: string;
    entityType?: 'news' | 'publication' | 'achievement' | 'gallery' | 'download' | 'academic' | 'ppdb';
    entityId?: string;
    mediaType: ContentMediaType;
    mediaUrl: string;
    url?: string; // Alias for backward compatibility
    storageProvider?: string | null;
    storageBucket?: string | null;
    storagePath?: string | null;
    thumbnailUrl?: string | null;
    caption?: string | null;
    isMain?: boolean;
    displayOrder: number;
    createdAt?: string;
}

export interface NewsPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    authorName: string;
    publishedAt: string;
    isPublished: boolean;
    isPinned: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    media?: MediaItem[];
    coverUrl?: string | null;
}

export type PublicationType = 'announcement' | 'article' | 'bulletin' | 'publication';

export interface Publication {
    id: string;
    title: string;
    slug: string;
    type: PublicationType;
    excerpt?: string | null;
    description?: string | null; // Alias for excerpt
    content?: string | null;
    authorName: string;
    publishedAt: string;
    isPublished: boolean;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    media?: MediaItem[];
    coverUrl?: string | null;
}

export interface Achievement {
    content: string | TrustedHTML;
    id: string;
    title: string;
    slug: string;
    eventName: string | null;
    eventLevel: AchievementLevel;
    rank: string | null;
    description: string | null;
    achievedAt: string;
    isPublished: boolean;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    media?: MediaItem[];
    coverUrl?: string | null;
}

export type AchievementLevel = 'sekolah' | 'kecamatan' | 'kabupaten' | 'provinsi' | 'nasional' | 'internasional';

export interface Gallery {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    eventDate: string | null;
    publishedAt: string;
    isPublished: boolean;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
    media?: MediaItem[];
    coverUrl?: string | null;
}

export interface Download {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    fileUrl?: string | null; // legacy single file
    fileStorageProvider?: string | null;
    fileStorageBucket?: string | null;
    fileStoragePath?: string | null;
    fileSizeKb?: number | null; // legacy single file
    fileType?: string | null; // legacy single file
    files?: DownloadFile[]; // new multi-file attachments stored in object storage
    downloadCount: number;
    isPublished: boolean;
    isPinned?: boolean;
    createdAt: string;
    updatedAt: string;
    coverUrl?: string | null;
    media?: MediaItem[];
}

export interface DownloadFile {
    id: string;
    downloadId: string;
    fileName: string;
    fileType: string | null;
    fileSizeKb: number | null;
    storageProvider?: string | null;
    storageBucket?: string | null;
    storagePath: string | null;
    publicUrl: string;
    displayOrder: number;
    createdAt?: string;
}

export type ContentPost = NewsPost | Publication | Achievement | Gallery;
export type ContentType = 'news' | 'publication' | 'achievement' | 'gallery' | 'download';

export interface PinnedItem {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
    type: string;
    date: string;
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
    faviconUrl?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    googleAnalyticsId?: string | null;
    facebookPixelId?: string | null;
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

export interface ProfilePage {
    id: string;
    schoolName: string;
    npsn: string;
    schoolAddress: string;
    village?: string;
    district?: string;
    city?: string;
    province?: string;
    schoolStatus?: string;
    educationForm?: string;
    educationLevel?: string;
    descriptionHtml?: string | null;
    descriptionText?: string | null;
    descriptionJson?: any;
    videoUrl?: string | null;
}

export interface AdminPublicUser {
    id: string;
    username: string;
    role: 'admin' | 'superadmin';
    fullName: string;
    email: string | null;
    phone: string | null;
}

export interface HeadmasterGreeting {
    id: string;
    title: string;
    subtitle: string | null;
    contentHtml: string | null;
    contentText: string | null;
    contentJson?: any;
    headmasterName: string;
    headmasterTitle: string | null;
    photoUrl: string | null;
    isActive?: boolean;
    updatedAt?: string;
}

export interface Activity {
    id: string;
    title: string;
    imageUrl: string | null;
    date: string;
}

export interface Extracurricular {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    coachName?: string | null;
    schedule?: string | null;
    displayOrder: number;
    isActive: boolean;
}

export interface CharacterProgram {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    frequency?: string | null;
    displayOrder: number;
    isActive: boolean;
}

export interface AcademicSubject {
    id: string;
    name: string;
    icon: string | null;
    order: number;
    description?: string | null;
}

export interface AcademicProgram {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
    order: number;
}

export interface AcademicPage {
    id: string;
    title: string;
    subtitle?: string | null;
    content?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    sections?: AcademicSection[];
    media?: MediaItem[];
    coverUrl?: string | null;
}

export interface AcademicSection {
    id: string;
    pageId: string;
    title: string;
    body?: string | null;
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface GraduationStudent {
    id: string;
    registrationNumber: string;
    fullName: string;
    name?: string; // for compatibility
    nisn?: string;
    className?: string;
    status: 'LULUS' | 'TIDAK_LULUS' | 'PENDING';
    schoolName: string;
    averageScore?: number;
}

export interface PageHero {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
}

export interface PPDBStatusResponse {
    id: string;
    nama: string;
    tanggalDaftar: string;
    status: string;
    pesan: string | null;
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
    files?: Array<{
        fileType: string;
        fileUrl: string;
        storageProvider?: string;
        storageBucket?: string;
        storagePath?: string;
    }>;
}

export interface PPDBSubmitResponse {
    success: boolean;
    registration?: PPDBRegistration;
    registrationId?: string;
    nisn?: string;
    message: string;
}

export interface ContactWhatsappItem {
    id: string;
    label: string;
    name?: string; // Compatibility
    number: string;
    isActive: boolean;
    url?: string;
}

export interface ContactPage {
    id: string;
    title: string | null;
    description: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
    whatsappItems?: ContactWhatsappItem[];
    whatsappList?: ContactWhatsappItem[]; // Compatibility
    adminWhatsappId?: string | null; // Compatibility
    mapEmbedHtml?: string | null;
}

export interface SiteBanner {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl?: string | null;
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
    pekerjaanAyah?: string | null;
    namaIbu: string;
    pekerjaanIbu?: string | null;
    noHp: string;
    status: string;
    pesan?: string | null;
    tanggalDaftar?: string;
    createdAt?: string;
    updatedAt?: string;
    files?: PPDBFile[];
}

export interface PPDBFile {
    id: string;
    registrationId: string;
    fileType: 'kk' | 'akta_kelahiran' | 'ktp_wali' | 'pas_foto' | 'nisn' | 'ijazah_rapor';
    fileUrl: string;
    storageProvider?: string | null;
    storageBucket?: string | null;
    storagePath?: string | null;
    createdAt?: string;
}

export interface PPDBListItem {
    id: string;
    namaLengkap: string;
    status: string;
    nisn: string | null;
}

export interface PushSubscriptionPayload {
    registrationId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string | null;
}

export interface PPDBWave {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    quota?: number | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface PPDBNotification {
    id: string;
    registrationId?: string | null;
    waveId?: string | null;
    title: string;
    message: string;
    createdAt?: string;
}

export interface Teacher {
    id: number;
    name: string;
    position: string;
    imageUrl?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminLoginResponse {
    user: AdminPublicUser;
}

export interface HeroItem {
    id: string;
    type: 'news' | 'publication' | 'achievement' | 'gallery' | 'download';
    title: string;
    slug: string;
    description?: string | null;
    date: string;
    coverUrl?: string | null;
    isPinned?: boolean;
}
