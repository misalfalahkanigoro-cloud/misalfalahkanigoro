'use client';

import React, { useEffect } from 'react';
import type { PPDBWave } from '@/lib/types';

type PPDBActiveWaveWatcherProps = {
    onStatus: (open: boolean) => void;
    onWave: (wave: PPDBWave | null) => void;
};

const PPDBActiveWaveWatcher: React.FC<PPDBActiveWaveWatcherProps> = ({ onStatus, onWave }) => {
    useEffect(() => {
        const fetchWave = async () => {
            try {
                const res = await fetch('/api/ppdb/active-wave');
                const json = await res.json();
                const active = Boolean(json?.active);
                onStatus(active);
                onWave(active ? (json.wave as PPDBWave) : null);
            } catch (error) {
                console.error('Failed to fetch active wave', error);
                onStatus(false);
                onWave(null);
            }
        };
        fetchWave();
    }, [onStatus, onWave]);

    return null;
};

export default PPDBActiveWaveWatcher;
