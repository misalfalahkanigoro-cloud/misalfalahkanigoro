'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Calendar, ChevronRight, Pin } from 'lucide-react';
import type { ContentPost, ContentType } from '@/lib/types';

interface PublicationListProps {
    posts: ContentPost[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onAdd: () => void;
    loading: boolean;
}

const TYPE_OPTIONS: { label: string; value: ContentType | 'all' }[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Berita', value: 'news' },
    { label: 'Pengumuman', value: 'announcement' },
    { label: 'Artikel', value: 'article' },
    { label: 'Galeri', value: 'gallery' },
    { label: 'Unduhan', value: 'download' },
];

const PublicationList: React.FC<PublicationListProps> = ({
    posts,
    selectedId,
    onSelect,
    onAdd,
    loading,
}) => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all');

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
            const matchesType = typeFilter === 'all' || post.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [posts, search, typeFilter]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-white/5 border border-emerald-900/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Daftar Publikasi</h2>
                    <button
                        onClick={onAdd}
                        className="rounded-full p-2 bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari publikasi..."
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 dark:bg-black/20 dark:border-white/10 focus:ring-2 focus:ring-emerald-500 transition"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {TYPE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTypeFilter(opt.value)}
                            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${typeFilter === opt.value
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                        <p className="text-xs text-gray-500">Memuat data...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm">
                        Tidak ada publikasi ditemukan.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {filteredPosts.map((post) => (
                            <button
                                key={post.id}
                                onClick={() => onSelect(post.id)}
                                className={`w-full p-4 text-left transition-colors flex items-center justify-between group ${selectedId === post.id
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500'
                                    : 'hover:bg-gray-50 dark:hover:bg-white/5 border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="space-y-1 pr-2 max-w-[85%]">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${post.type === 'news' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            post.type === 'announcement' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                post.type === 'article' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    post.type === 'gallery' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400'
                                            }`}>
                                            {post.type}
                                        </span>
                                        {!post.isPublished && (
                                            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded text-[10px] font-bold">DRAFT</span>
                                        )}
                                        {post.isPinned && (
                                            <Pin size={12} className="text-amber-500 fill-amber-500" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-emerald-600 transition">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                        <Calendar size={12} />
                                        <span>{new Date(post.publishedAt || post.createdAt || '').toLocaleDateString('id-ID')}</span>
                                        {post.category && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate">{post.category}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight
                                    size={16}
                                    className={`text-gray-300 transition-transform ${selectedId === post.id ? 'translate-x-1 text-emerald-500' : 'group-hover:translate-x-1'}`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicationList;
