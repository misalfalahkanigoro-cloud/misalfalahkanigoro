import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Users } from 'lucide-react';

type HomePpdbCtaProps = {
    schoolName: string;
};

const HomePpdbCta: React.FC<HomePpdbCtaProps> = ({ schoolName }) => (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 py-28 text-white">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="absolute top-20 right-20 w-20 h-20 border-2 border-white/20 rounded-2xl rotate-45 animate-bounce-subtle"></div>
        <div className="absolute bottom-32 left-32 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto space-y-8 animate-fadeInUp">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-5 py-2.5 border border-white/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider text-white">
                        PPDB 2026 Dibuka
                    </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                    Penerimaan Peserta Didik Baru
                </h2>

                <p className="text-emerald-50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                    Bergabunglah bersama keluarga besar <span className="font-bold text-white">{schoolName}</span>.
                    Mari wujudkan generasi cerdas, berakhlak, dan siap masa depan.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
                    <Link
                        href="/ppdb"
                        className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-emerald-800 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105"
                    >
                        Daftar Sekarang
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/kontak"
                        className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                    >
                        Hubungi Panitia
                        <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Link>
                </div>

                <div className="flex flex-wrap gap-4 justify-center pt-8 text-sm">
                    <div className="flex items-center gap-2 text-emerald-100">
                        <CheckCircle className="w-5 h-5" />
                        <span>Pendaftaran Online</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                        <CheckCircle className="w-5 h-5" />
                        <span>Proses Mudah & Cepat</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-100">
                        <CheckCircle className="w-5 h-5" />
                        <span>Konsultasi Gratis</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default HomePpdbCta;
