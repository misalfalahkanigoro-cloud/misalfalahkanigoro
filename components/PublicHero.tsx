'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { HeroItem } from '@/lib/types';

const outlineBackTitle: React.CSSProperties = {
    WebkitTextStroke: '1.8px rgba(0, 0, 0, 0.7)',
    color: 'transparent',
};

const outlineBackSoft: React.CSSProperties = {
    WebkitTextStroke: '1.2px rgba(0, 0, 0, 0.62)',
    color: 'transparent',
};

const PublicHero: React.FC = () => {
    const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchHero = async () => {
            try {
                // In a real app, this would fetch from /api/hero (the view_hero_section)
                const data = await api.getHeroItems() as HeroItem[];
                setHeroItems(data || []);
            } catch (error) {
                console.error('Error fetching hero items:', error);
                // Fallback / Mock data if API is not ready or failed
                setHeroItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHero();
    }, []);

    const nextSlide = useCallback(() => {
        if (heroItems.length <= 1) return;
        setCurrentSlide((prev) => (prev + 1) % heroItems.length);
    }, [heroItems.length]);

    const prevSlide = useCallback(() => {
        if (heroItems.length <= 1) return;
        setCurrentSlide((prev) => (prev - 1 + heroItems.length) % heroItems.length);
    }, [heroItems.length]);

    useEffect(() => {
        if (heroItems.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, heroItems.length]);

    const handleItemClick = (item: HeroItem) => {
        // Dynamic routing based on separate modules
        switch (item.type) {
            case 'news':
                router.push(`/berita/${item.slug}`);
                break;
            case 'publication':
                router.push(`/publikasi/${item.slug}`);
                break;
            case 'achievement':
                router.push(`/prestasi/${item.slug}`);
                break;
            case 'gallery':
                router.push(`/galeri/${item.slug}`);
                break;
            case 'download':
                router.push(`/download`); // Download usually doesn't have a detail page, or maybe it does?
                break;
            default:
                break;
        }
    };

    if (loading) {
        return (
            <div className="relative h-[450px] md:h-[650px] flex items-center justify-center bg-black text-white">
                <Loader2 className="animate-spin text-emerald-400" size={48} />
            </div>
        );
    }

    if (heroItems.length === 0) {
        // Fallback or Empty State
        return (
            <div className="relative h-[450px] md:h-[650px] flex items-center justify-center bg-black text-white">
                <div className="text-center opacity-70">
                    <h2 className="text-2xl font-bold mb-2">Selamat Datang</h2>
                    <p>Menunggu konten unggulan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[450px] md:h-[700px] w-full overflow-hidden bg-black text-white group">
            {/* Slides */}
            <div className="absolute inset-0">
                {heroItems.map((slide, index) => (
                    <div
                        key={`${slide.type}-${slide.id}`}
                        onClick={() => handleItemClick(slide)}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out cursor-pointer ${index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                            }`}
                    >
                        {/* Background Image - No Overlay */}
                        <div className="absolute inset-0">
                            <img
                                src={slide.coverUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=2000'}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Black bottom gradient overlay (bottom -> top) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-20 container mx-auto px-4 h-full flex items-end pb-20 md:pb-32">
                            <div className="max-w-4xl animate-fadeInUp">
                                <span className="relative mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                                    <span aria-hidden className="absolute inset-0 select-none" style={outlineBackSoft}>
                                        {slide.type === 'news' ? 'Berita' :
                                            slide.type === 'publication' ? 'Publikasi' :
                                                slide.type === 'achievement' ? 'Prestasi' :
                                                    slide.type === 'gallery' ? 'Galeri' : 'Info'}
                                    </span>
                                    <span className="relative">
                                        {slide.type === 'news' ? 'Berita' :
                                            slide.type === 'publication' ? 'Publikasi' :
                                                slide.type === 'achievement' ? 'Prestasi' :
                                                    slide.type === 'gallery' ? 'Galeri' : 'Info'}
                                    </span>
                                </span>
                                <h1 className="relative mb-2 text-3xl font-black leading-tight drop-shadow-lg md:text-5xl lg:text-7xl">
                                    <span aria-hidden className="absolute inset-0 select-none" style={outlineBackTitle}>
                                        {slide.title}
                                    </span>
                                    <span className="relative text-white">{slide.title}</span>
                                </h1>
                                {slide.description && (
                                    <p className="relative mb-4 max-w-2xl line-clamp-2 text-sm text-gray-200 md:text-lg">
                                        <span aria-hidden className="absolute inset-0 select-none" style={outlineBackSoft}>
                                            {slide.description}
                                        </span>
                                        <span className="relative">{slide.description}</span>
                                    </p>
                                )}
                                <p className="relative mb-6 text-sm text-gray-300 md:text-base">
                                    <span aria-hidden className="absolute inset-0 select-none" style={outlineBackSoft}>
                                        {new Date(slide.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                    </span>
                                    <span className="relative">
                                        {new Date(slide.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                    </span>
                                </p>
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-xl">
                                    Baca Selengkapnya <ArrowRight size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Side Navigation Arrows - Subtle */}
            {heroItems.length > 1 && (
                <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-between px-4 md:px-8">
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* Slide Indicators */}
            {heroItems.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3">
                    {heroItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                            className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-10 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicHero;
