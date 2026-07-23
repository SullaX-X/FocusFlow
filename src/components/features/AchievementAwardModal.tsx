import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RARITY_LABELS } from '../../data/achievementsData';
import confetti from '../../utils/confetti';

export default function AchievementAwardModal({ achievement, onClose }: { achievement: any, onClose: () => void }) {
  if (!achievement) return null;

  useEffect(() => {
    if (achievement.isUnlocked !== false) {
      // Play confetti when opened (only if unlocked or just unlocked)
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [achievement.displayColor || achievement.color || '#ffffff', '#ffffff', '#aaaaaa']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [achievement.displayColor || achievement.color || '#ffffff', '#ffffff', '#aaaaaa']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [achievement]);

  const isUnlocked = achievement.isUnlocked !== false;
  const isNewlyUnlocked = achievement.isUnlocked === undefined; // when passed from App.tsx it doesn't have isUnlocked

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-[20px] bg-theme-bg/60"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100, duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[500px] bg-theme-card/80 border border-theme-accent/30 rounded-3xl p-8 flex flex-col items-center backdrop-blur-2xl shadow-2xl overflow-hidden"
          style={{ borderColor: 'var(--color-theme-accent)' }}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-theme-bg/50 text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-accent mb-2">
              {achievement.collection || "Достижение"}
            </h2>
            <h1 className="text-3xl font-black text-theme-text drop-shadow-lg tracking-wide">{achievement.title}</h1>
            <div className="mt-2 px-3 py-1 rounded-full border inline-block" style={{ borderColor: 'var(--color-theme-accent)', color: 'var(--color-theme-accent)' }}>
              <span className="text-[9px] font-black uppercase tracking-widest">{RARITY_LABELS[achievement.rarity] || achievement.rarity}</span>
            </div>
          </div>

          {/* Visual: Image in golden/theme ring */}
          <div className="relative mb-8">
            {/* Glowing Aura behind */}
            {isUnlocked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[40px]"
                style={{ backgroundColor: 'var(--color-theme-accent)' }}
              />
            )}
            
            <div 
              className={`relative w-40 h-40 rounded-full overflow-hidden border-[4px] shadow-2xl flex items-center justify-center bg-theme-bg ${!isUnlocked ? 'grayscale opacity-50 border-theme-border' : ''}`}
              style={isUnlocked ? { borderColor: 'var(--color-theme-accent)', boxShadow: `0 0 30px var(--color-theme-accent)` } : {}}
            >
              {achievement.icon ? (
                <span className="material-symbols-outlined text-6xl text-theme-text opacity-80" style={isUnlocked ? { color: 'var(--color-theme-accent)' } : {}}>{achievement.icon}</span>
              ) : (
                <motion.img 
                  src={achievement.img}
                  loading="lazy" 
                  alt={achievement.title}
                  className="w-[135%] h-[135%] max-w-none flex-shrink-0 object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                />
              )}
              {isUnlocked && achievement.isThemeTinted && !achievement.icon && (
                <div className="absolute inset-0 pointer-events-none mix-blend-color" style={{ backgroundColor: 'var(--color-theme-accent)' }} />
              )}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="material-symbols-outlined text-4xl text-white">lock</span>
                </div>
              )}
            </div>
          </div>

          {/* Lore Content */}
          <div className="text-center mb-8 px-4">
            <p className="text-sm font-light italic text-theme-text/80 leading-relaxed max-w-[400px]">
              "{achievement.lore || achievement.desc}"
            </p>
          </div>

          {/* Footer: Status */}
          <div className="w-full bg-theme-bg/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-theme-border/50">
            {isUnlocked ? (
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-theme-accent text-2xl">verified</span>
                <span className="text-xs font-bold text-theme-accent uppercase tracking-widest">Разблокировано</span>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-theme-muted">Прогресс ({achievement.desc})</span>
                  <span className="text-theme-text">
                    {achievement.progress} / {achievement.max}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-theme-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-theme-text rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (achievement.progress / achievement.max) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {(isNewlyUnlocked || isUnlocked) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 w-full py-3 rounded-xl bg-theme-accent/10 text-theme-accent font-black uppercase tracking-widest hover:bg-theme-accent/20 transition-all border border-theme-accent/20"
              onClick={onClose}
            >
              Отлично
            </motion.button>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
