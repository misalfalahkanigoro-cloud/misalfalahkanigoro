'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { PinnedItem } from '@/lib/types';

const PublicHero: React.FC = () => {
    const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchPinned = async () => {
            try {
                const data = await api.getPinnedItems() as PinnedItem[];
                setPinnedItems(data || []);
            } catch (error) {
                console.error('Error fetching pinned items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPinned();
    }, []);

    const nextSlide = useCallback(() => {
        if (pinnedItems.length <= 1) return;
        setCurrentSlide((prev) => (prev + 1) % pinnedItems.length);
    }, [pinnedItems.length]);

    const prevSlide = useCallback(() => {
        if (pinnedItems.length <= 1) return;
        setCurrentSlide((prev) => (prev - 1 + pinnedItems.length) % pinnedItems.length);
    }, [pinnedItems.length]);

    useEffect(() => {
        if (pinnedItems.length <= 1) return;
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, [nextSlide, pinnedItems.length]);

    if (loading) {
        return (
            <div className="relative h-[450px] md:h-[650px] flex items-center justify-center bg-black text-white">
                <Loader2 className="animate-spin text-emerald-400" size={48} />
            </div>
        );
    }

    if (pinnedItems.length === 0) {
        return (
            <div className="relative h-[450px] md:h-[650px] flex items-center justify-center bg-black text-white">
                <p className="text-xl md:text-3xl font-black uppercase tracking-widest opacity-50">tidak ada berita / prestasi</p>
            </div>
        );
    }

    return (
        <div className="relative h-[450px] md:h-[700px] w-full overflow-hidden bg-black text-white group">
            {/* Slides */}
            <div className="absolute inset-0">
                {pinnedItems.map((slide, index) => (
                    <div
                        key={`${slide.type}-${slide.id}`}
                        onClick={() => router.push(slide.type === 'prestasi' ? `/prestasi/${slide.slug}` : `/publikasi/${slide.slug}`)}
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
                        </div>

                        {/* Content - Just Title */}
                        <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
                            <div className="max-w-4xl">
                                <h1 className="text-4xl md:text-7xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-[1.1] animate-fadeInUp">
                                    {slide.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tap/Drag areas for manual navigation */}
            <div
                className="absolute inset-x-0 inset-y-0 z-30 flex"
                onMouseDown={(e) => {
                    const startX = e.pageX;
                    const handleMouseUp = (upEvent: MouseEvent) => {
                        const diff = upEvent.pageX - startX;
                        if (Math.abs(diff) > 50) {
                            if (diff > 0) prevSlide();
                            else nextSlide();
                        }
                        window.removeEventListener('mouseup', handleMouseUp);
                    };
                    window.addEventListener('mouseup', handleMouseUp);
                }}
            >
                <div className="w-1/2 h-full" onClick={(e) => { e.stopPropagation(); prevSlide(); }} />
                <div className="w-1/2 h-full" onClick={(e) => { e.stopPropagation(); nextSlide(); }} />
            </div>

            {/* Slide Indicators */}
            {pinnedItems.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex gap-3">
                    {pinnedItems.map((_, i) => (
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
