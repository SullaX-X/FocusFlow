import React from 'react';
import { LayoutDashboard, CheckSquare, BarChart2, Settings, Moon, Star, Sparkles, User, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Tab } from '../../types';
import { useTheme, THEME_NAMES, Theme } from '../../services/ThemeContext';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onQuickFocus: () => void;
}

const Sidebar = React.memo(({ activeTab, setActiveTab, onQuickFocus }: Props) => {
  const { theme, actualTheme } = useTheme();
  const isSpecialTheme = ['dimoon', 'dimoon-blue', 'iman_love'].includes(actualTheme);
  const isDimoon = actualTheme.startsWith('dimoon');
  const isImanLove = actualTheme === 'iman_love';

  return (
    <aside className="w-64 bg-theme-sidebar border-r border-theme-sidebar-border flex-col hidden 2xl:flex z-50 transition-colors duration-300">
      <div className="p-8">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-theme-accent uppercase tracking-[0.2em] leading-none opacity-80">Focus Moon</span>
          <h1 
            className={`text-2xl font-black text-theme-text tracking-tight transition-all drop-shadow-sm flex items-center gap-2 ${isSpecialTheme ? 'cursor-pointer select-none' : ''}`}
            onClick={(e) => {
              if (isSpecialTheme) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                
                import('../../utils/confetti').then((confettiModule) => {
                  const confetti = confettiModule.default;
                  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047';
const colors = [accent, '#ffffff'];
                  
                  confetti({
                    particleCount: 20,
                    spread: 70,
                    startVelocity: 30,
                    origin: { x, y },
                    colors: colors,
                    shapes: (isImanLove ? ['circle'] : ['star']) as any,
                    zIndex: 3001
                  });
                });
              }
            }}
          >
            {THEME_NAMES[theme as Theme] || 'Focus Moon'}
            {isDimoon && <span className="material-symbols-outlined text-xl animate-pulse text-yellow-400">star</span>}
            {isImanLove && <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />}
          </h1>
        </div>
      </div>
      
      <div className="px-6 mb-8">
        <button 
          onClick={onQuickFocus}
          className="btn-tactile w-full bg-theme-accent text-text-on-accent px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_20px_-8px_var(--theme-accent)]"
        >
          <span className="material-symbols-outlined text-[20px]">{isSpecialTheme ? 'auto_awesome' : 'bolt'}</span>
          <span className="text-sm">Быстрый фокус</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <NavItem icon={LayoutDashboard} label="Главная" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isSpecial={isSpecialTheme} actualTheme={actualTheme} index={0} />
        <NavItem icon={CheckSquare} label="Дисциплины" active={activeTab === 'disciplines'} onClick={() => setActiveTab('disciplines')} isSpecial={isSpecialTheme} actualTheme={actualTheme} index={1} />
        <NavItem icon={User} label="Профиль" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} isSpecial={isSpecialTheme} actualTheme={actualTheme} index={2} />
        <NavItem icon={BarChart2} label="Статистика" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} isSpecial={isSpecialTheme} actualTheme={actualTheme} index={3} />
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-2 bg-theme-bg/50 rounded-2xl border border-theme-sidebar-border">
          <NavItem icon={Settings} label="Настройки" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isSpecial={isSpecialTheme} actualTheme={actualTheme} index={4} />
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;

const NavItem = React.memo(({ icon: Icon, label, active, onClick, isSpecial, actualTheme, index }: any) => {
  const SpecialIcons = actualTheme === 'iman_love' 
    ? [Heart, Star, Sparkles, BarChart2, Settings]
    : [Moon, Star, Sparkles, BarChart2, Settings];
    
  const ActiveIcon = isSpecial && index < 5 ? SpecialIcons[index] : Icon;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group relative ${
        active 
          ? 'text-theme-accent font-bold' 
          : 'text-theme-muted hover:text-theme-text'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active-pill"
          className="absolute inset-0 bg-theme-accent/10 border border-theme-accent/20 rounded-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      <div className="relative flex items-center space-x-3">
        <ActiveIcon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="text-sm tracking-tight">{label}</span>
      </div>

      {active && (
        <motion.div 
          layoutId="sidebar-active-indicator"
          className="absolute right-3 w-1.5 h-1.5 bg-theme-accent rounded-full shadow-[0_0_8px_var(--theme-accent)]"
        />
      )}
    </button>
  );
});
