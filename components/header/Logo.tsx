import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type LogoProps = {
    logoUrl: string | undefined | null;
    schoolName: string | undefined | null;
};

export const Logo: React.FC<LogoProps> = ({ logoUrl, schoolName }) => {
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        setLogoError(false);
    }, [logoUrl]);

    return (
        <Link href="/" className="flex items-center gap-3 group">
            {!logoError && logoUrl ? (
                <div className="relative w-12 h-12 md:w-14 md:h-14 transition-transform group-hover:scale-105">
                    <Image
                        src={logoUrl}
                        alt={`Logo ${schoolName || ''}`}
                        fill
                        className="object-contain drop-shadow-sm"
                        onError={() => setLogoError(true)}
                        sizes="(max-width: 768px) 48px, 56px"
                    />
                </div>
            ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-[10px] px-2 text-center leading-tight">
                    Data<br />Belum<br />Lengkap
                </div>
            )}

            <div className="leading-tight">
                <h1 className="text-lg md:text-xl font-bold text-primary dark:text-green-400">
                    {schoolName || 'Profil Sekolah'}
                </h1>
            </div>
        </Link>
    );
};
