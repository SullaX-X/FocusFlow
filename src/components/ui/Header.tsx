import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import UserMenu from './UserMenu';
import { Discipline } from '../../types';

interface HeaderProps {
  syncStatus: 'idle' | 'syncing' | 'success' | 'error' | 'offline';
  stats: any;
  setShowChangelog: (show: boolean) => void;
  className?: string;
}

export default function Header({ syncStatus, stats, setShowChangelog, className = "" }: HeaderProps) {
  return (
    <header className={`flex items-center justify-between gap-4 w-full shrink-0 ${className}`}>
      <div className="flex items-center min-w-0">
        <AnimatePresence mode="wait">
          {syncStatus !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -10 }}
              className="bg-theme-card/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-theme-border shadow-sm overflow-hidden"
            >
              {syncStatus === 'syncing' && <span className="material-symbols-outlined text-sm animate-spin text-theme-muted">sync</span>}
              {syncStatus === 'success' && <span className="material-symbols-outlined text-sm text-green-500">cloud_done</span>}
              {syncStatus === 'error' && <span className="material-symbols-outlined text-sm text-red-500">cloud_off</span>}
              {syncStatus === 'offline' && <span className="material-symbols-outlined text-sm text-theme-accent">wifi_off</span>}
              
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block truncate ${
                syncStatus === 'error' ? 'text-red-500' : 
                syncStatus === 'offline' ? 'text-theme-accent' : 
                'text-theme-muted'
              }`}>
                {syncStatus === 'syncing' ? 'Синхронизация' : 
                 syncStatus === 'success' ? 'Сохранено' : 
                 syncStatus === 'offline' ? 'Оффлайн' : 'Ошибка'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={() => setShowChangelog(true)} 
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-theme-text shadow-sm hover:ring-2 ring-theme-accent transition-all relative group"
          title="Обновления и уведомления"
        >
          <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">notifications</span>
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-theme-bg shadow-sm"></span>
        </button>
        
        <UserMenu stats={stats} />
      </div>
    </header>
  );
}
