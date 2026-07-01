import { LayoutDashboard, CheckSquare, BarChart2, Settings, Moon, Star, Sparkles } from 'lucide-react';
import { Tab } from '../types';
import { useTheme, THEME_NAMES, Theme } from '../ThemeContext';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onQuickFocus: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onQuickFocus }: Props) {
  const { theme, actualTheme } = useTheme();
  const isDimoon = theme === 'dimoon' || actualTheme === 'dimoon' || theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';

  return (
    <aside className="w-64 bg-theme-sidebar border-r border-theme-sidebar-border flex-col hidden md:flex z-50 transition-colors duration-300">
      <div className="p-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-theme-muted uppercase tracking-widest leading-none">FocusFlow</span>
          <h1 
            className={`text-xl font-black text-theme-text tracking-tight transition-all drop-shadow-sm flex items-center gap-2 ${isDimoon ? 'cursor-pointer hover:scale-105 active:scale-95 select-none' : ''}`}
            onClick={(e) => {
              if (isDimoon) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                
                import('canvas-confetti').then((confettiModule) => {
                  const confetti = confettiModule.default;
                  const isDimoonBlue = theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
                  
                  confetti({
                    particleCount: 20,
                    spread: 70,
                    startVelocity: 30,
                    origin: { x, y },
                    colors: isDimoonBlue ? ['#38bdf8', '#ffffff'] : ['#fde047', '#ffffff'],
                    shapes: ['star'],
                    zIndex: 3001
                  });
                });
              }
            }}
          >
            {THEME_NAMES[theme as Theme] || 'FocusFlow'}
            {isDimoon && <span className="material-symbols-outlined text-xl animate-pulse">dark_mode</span>}
          </h1>
        </div>
      </div>
      
      <div className="px-4 mb-4">
        <button 
          onClick={onQuickFocus}
          className="btn-tactile w-full bg-theme-accent text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-theme-accent/90 transition-all shadow-[0_0_15px_rgba(var(--color-theme-accent),0.3)]"
        >
          <span className="material-symbols-outlined text-[18px]">{isDimoon ? 'stars' : 'timer'}</span>
          Быстрый фокус
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavItem icon={LayoutDashboard} label="Главная" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isDimoon={isDimoon} index={0} />
        <NavItem icon={CheckSquare} label="Дисциплины" active={activeTab === 'disciplines'} onClick={() => setActiveTab('disciplines')} isDimoon={isDimoon} index={1} />
        <NavItem icon={BarChart2} label="Статистика" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} isDimoon={isDimoon} index={2} />
      </nav>
      <div className="p-4 border-t border-theme-sidebar-border flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all ${
            activeTab === 'settings' 
              ? 'bg-theme-accent/15 text-theme-accent font-semibold' 
              : 'text-theme-muted hover:bg-theme-bg hover:text-theme-text'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-theme-accent' : ''}`} />
          <span className="font-medium text-sm">Настройки</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, onClick, isDimoon, index }: any) {
  const DimoonIcons = [Moon, Star, Sparkles];
  const ActiveIcon = isDimoon && index < 3 ? DimoonIcons[index] : Icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-theme-accent/15 text-theme-accent font-semibold' 
          : 'text-theme-muted hover:bg-theme-bg hover:text-theme-text'
      }`}
    >
      <ActiveIcon className={`w-5 h-5 ${active ? 'text-theme-accent' : ''}`} />
      <span>{label}</span>
    </button>
  );
}
