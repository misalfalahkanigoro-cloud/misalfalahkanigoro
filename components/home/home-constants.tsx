import React from 'react';
import {
    Star,
    BookOpen,
    Users,
    Trophy,
    Shield,
    Award,
    Landmark,
    Heart,
    GraduationCap,
    Sparkles,
} from 'lucide-react';

export const HIGHLIGHTS = [
    {
        id: 1,
        title: 'Akreditasi A',
        description: 'Mutu pendidikan terjamin dengan standar nasional yang kuat.',
        icon: <Star className="w-7 h-7 text-amber-500" />,
        accent: 'from-amber-50 via-amber-100/50 to-white dark:from-amber-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-amber-500/20',
    },
    {
        id: 2,
        title: 'Tahfidz & Adab',
        description: 'Pembiasaan ibadah dan pembinaan karakter sejak dini.',
        icon: <BookOpen className="w-7 h-7 text-emerald-600" />,
        accent: 'from-emerald-50 via-emerald-100/50 to-white dark:from-emerald-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-emerald-500/20',
    },
    {
        id: 3,
        title: 'Ekstrakurikuler',
        description: 'Bakat siswa diasah melalui kegiatan kreatif dan sportif.',
        icon: <Users className="w-7 h-7 text-sky-500" />,
        accent: 'from-sky-50 via-sky-100/50 to-white dark:from-sky-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-sky-500/20',
    },
    {
        id: 4,
        title: 'Prestasi Konsisten',
        description: 'Kompetisi akademik dan non-akademik terus bertumbuh.',
        icon: <Trophy className="w-7 h-7 text-rose-500" />,
        accent: 'from-rose-50 via-rose-100/50 to-white dark:from-rose-500/10 dark:to-transparent',
        glow: 'group-hover:shadow-rose-500/20',
    },
];

export const PROGRAMS = [
    {
        title: 'Kurikulum Islami Terpadu',
        description: 'Sinergi ilmu umum dan diniyah dengan pembiasaan harian.',
        icon: <Shield className="w-6 h-6" />,
        color: 'emerald',
    },
    {
        title: 'Guru Berpengalaman',
        description: 'Tenaga pendidik profesional dengan pendekatan humanis.',
        icon: <Award className="w-6 h-6" />,
        color: 'blue',
    },
    {
        title: 'Fasilitas Nyaman',
        description: 'Ruang belajar, perpustakaan, dan sarana pendukung yang representatif.',
        icon: <Landmark className="w-6 h-6" />,
        color: 'purple',
    },
    {
        title: 'Pembinaan Akhlak',
        description: 'Pendampingan karakter dan adab dalam setiap kegiatan.',
        icon: <Heart className="w-6 h-6" />,
        color: 'rose',
    },
    {
        title: 'Literasi & Numerasi',
        description: 'Program penguatan dasar untuk capaian akademik optimal.',
        icon: <GraduationCap className="w-6 h-6" />,
        color: 'amber',
    },
    {
        title: 'Kegiatan Inovatif',
        description: 'Kelas proyek, expo siswa, dan pembelajaran berbasis praktik.',
        icon: <Sparkles className="w-6 h-6" />,
        color: 'cyan',
    },
];
