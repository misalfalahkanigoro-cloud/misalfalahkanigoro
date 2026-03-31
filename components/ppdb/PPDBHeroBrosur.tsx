'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { MediaItem } from '@/lib/types';

type PPDBHeroBrosurProps = {
    waveId?: string | null;
};

const PPDBHeroBrosur: React.FC<PPDBHeroBrosurProps> = ({ waveId }) => {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrosur = async () => {
            try {
                const params = new URLSearchParams({ entityType: 'ppdb' });
                if (waveId) params.set('entityId', waveId);
                const res = await fetch(`/api/media-items?${params.toString()}`);
                const json = await res.json();
                setItems(Array.isArray(json) ? json : []);
            } catch (error) {
                console.error('Failed to fetch brosur', error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBrosur();
    }, [waveId]);

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-600/70">Brosur PPDB</p>
                    <h2 className="text-xl md:text-2xl font-bold text-emerald-950 dark:text-white">Informasi Utama PPDB</h2>
                </div>
                {loading && <Loader2 className="animate-spin text-emerald-600" size={20} />}
            </div>

            {items.length === 0 && !loading ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-6 text-sm text-emerald-700">
                    Brosur PPDB belum tersedia.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-emerald-100/60 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-emerald-50">
                                <img src={item.mediaUrl} alt={item.caption || 'Brosur PPDB'} className="h-full w-full object-cover" />
                            </div>
                            {item.caption && <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">{item.caption}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PPDBHeroBrosur;
