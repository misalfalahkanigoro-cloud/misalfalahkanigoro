'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Maximize2 } from 'lucide-react';
import type { MediaItem } from '@/lib/types';

interface AcademicGalleryProps {
    items: MediaItem[];
}

export const AcademicGallery: React.FC<AcademicGalleryProps> = ({ items }) => {
    const [activeImage, setActiveImage] = useState<number | null>(null);

    const imageItems = items.filter((m) => m.mediaType === 'image');
    const videoItems = items.filter((m) => m.mediaType === 'video' || m.mediaType === 'youtube_embed');

    if (imageItems.length === 0 && videoItems.length === 0) return null;

    return (
        <div className="space-y-8">
            {/* Images Grid */}
            {imageItems.length > 0 && (
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Galeri Foto
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {imageItems.map((media, idx) => (
                            <button
                                key={media.id || idx}
                                type="button"
                                onClick={() => setActiveImage(idx)}
                                className="group relative rounded-[2rem] overflow-hidden aspect-square bg-emerald-50 dark:bg-white/5 border border-emerald-100 dark:border-white/10"
                            >
                                <img
                                    src={media.mediaUrl}
                                    alt={media.caption || ''}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <Maximize2 className="text-white" size={24} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Videos List */}
            {videoItems.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Dokumentasi Video
                    </h3>
                    {videoItems.map((media, idx) => (
                        <div key={media.id || idx} className="rounded-[2rem] overflow-hidden border border-emerald-100 dark:border-white/10 bg-black shadow-xl ring-4 ring-emerald-50 dark:ring-white/5">
                            {media.mediaType === 'video' ? (
                                <video controls className="w-full aspect-video bg-black">
                                    <source src={media.mediaUrl} />
                                </video>
                            ) : (
                                media.mediaUrl.includes('<iframe') ? (
                                    <div className="aspect-video [&_iframe]:h-full [&_iframe]:w-full" dangerouslySetInnerHTML={{ __html: media.mediaUrl }} />
                                ) : (
                                    <iframe src={media.mediaUrl} className="w-full aspect-video" allowFullScreen />
                                )
                            )}
                            {media.caption && (
                                <div className="px-6 py-4 text-xs font-bold text-emerald-950 dark:text-emerald-100 bg-white dark:bg-gray-900 flex items-center gap-3">
                                    <Play size={14} className="text-emerald-600" /> {media.caption}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {activeImage !== null && imageItems.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-emerald-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
                    <button
                        onClick={() => setActiveImage(null)}
                        className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all hover:rotate-90"
                    >
                        <X size={28} />
                    </button>

                    <button
                        onClick={() => setActiveImage((prev) => (prev !== null && prev > 0 ? prev - 1 : imageItems.length - 1))}
                        className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95"
                    >
                        <ChevronLeft size={36} />
                    </button>

                    <div className="max-w-6xl w-full h-[80vh] flex flex-col items-center justify-center gap-8">
                        <img
                            src={imageItems[activeImage].mediaUrl}
                            alt={imageItems[activeImage].caption || ''}
                            className="max-h-full max-w-full object-contain rounded-3xl shadow-2xl"
                        />
                        {imageItems[activeImage].caption && (
                            <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
                                <p className="text-white text-lg font-bold tracking-tight">{imageItems[activeImage].caption}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setActiveImage((prev) => (prev !== null && prev < imageItems.length - 1 ? prev + 1 : 0))}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95"
                    >
                        <ChevronRight size={36} />
                    </button>
                </div>
            )}
        </div>
    );
};
