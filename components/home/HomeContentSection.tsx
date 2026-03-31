import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';

export type ContentCardItem = {
    id: string;
    title: string;
    href: string;
    coverUrl?: string | null;
    date?: string | null;
    excerpt?: string | null;
    badge: string;
    ctaLabel?: string;
};

type ContentSectionProps = {
    items: ContentCardItem[];
    eyebrow: string;
    title: string;
    description: string;
    listHref: string;
    listLabel: string;
    emptyText: string;
    icon: React.ReactNode;
};

const formatCardDate = (value?: string | null) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const HomeContentSection: React.FC<ContentSectionProps> = ({
    items,
    eyebrow,
    title,
    description,
    listHref,
    listLabel,
    emptyText,
    icon,
}) => (
    <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12 animate-fadeInUp">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2">
                        {icon}
                        <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                            {eyebrow}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {description}
                    </p>
                </div>
                <Link
                    href={listHref}
                    className="hidden md:inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold hover:gap-4 transition-all group"
                >
                    {listLabel}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <article
                            key={item.id}
                            className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:-translate-y-2 animate-fadeInUp"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-56 overflow-hidden">
                                <Image
                                    src={item.coverUrl || 'https://picsum.photos/800/600'}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                                    {item.badge}
                                </span>
                            </div>
                            <div className="p-7 flex flex-col flex-grow">
                                <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs font-medium mb-4">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatCardDate(item.date)}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                                    <Link href={item.href}>
                                        {item.title}
                                    </Link>
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">
                                    {item.excerpt || 'Konten tersedia untuk dibaca lebih lanjut.'}
                                </p>
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:gap-4 transition-all group mt-auto"
                                >
                                    {item.ctaLabel || 'Baca Selengkapnya'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{emptyText}</p>
                    </div>
                )}
            </div>

            <div className="mt-12 text-center md:hidden">
                <Link
                    href={listHref}
                    className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold hover:gap-4 transition-all group"
                >
                    {listLabel}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    </section>
);

export default HomeContentSection;
