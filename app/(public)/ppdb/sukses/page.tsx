import PpdbSuccessClient from './PpdbSuccessClient';
import { Suspense } from 'react';

const fallback = (
    <div className="min-h-screen bg-white dark:bg-[#0B0F0C] transition-colors">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-[#151B16]">
                <div className="flex items-center justify-center gap-3 text-emerald-600">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></span>
                    Memuat data pendaftaran...
                </div>
            </div>
        </div>
    </div>
);

export default function Page() {
    return (
        <Suspense fallback={fallback}>
            <PpdbSuccessClient />
        </Suspense>
    );
}
