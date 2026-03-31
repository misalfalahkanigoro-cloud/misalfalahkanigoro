import React from 'react';
import { LogOut, ChevronDown } from 'lucide-react';

type LogoutButtonProps = {
    onLogout: () => void;
};

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
    return (
        <div className="pt-4 border-t border-emerald-900/5 dark:border-white/5">
            <button
                onClick={onLogout}
                className="group flex w-full items-center justify-between rounded-2xl border border-red-500/10 bg-white dark:bg-white/5 py-3 pl-4 pr-3 text-sm font-bold text-red-500 shadow-sm transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors group-hover:bg-white/20 group-hover:text-white dark:bg-red-500/10 dark:text-red-400">
                        <LogOut size={16} />
                    </div>
                    KELUAR
                </div>
                <ChevronDown size={14} className="opacity-0 -rotate-90 group-hover:opacity-100" />
            </button>
        </div>
    );
};
