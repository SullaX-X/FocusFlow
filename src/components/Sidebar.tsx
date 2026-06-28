import { LayoutDashboard, CheckSquare, BarChart2, Sun, Moon, Settings } from 'lucide-react';
import { Tab } from '../types';
import { useTheme } from '../ThemeContext';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 bg-white dark:bg-[#010f1f] border-r border-slate-200 dark:border-[#273647] flex-col hidden md:flex z-50 transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-[#c0c1ff] tracking-tight transition-colors">FocusFlow</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem icon={LayoutDashboard} label="Главная" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={CheckSquare} label="Дисциплины" active={activeTab === 'disciplines'} onClick={() => setActiveTab('disciplines')} />
        <NavItem icon={BarChart2} label="Статистика" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} />
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-[#273647] flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all ${
            activeTab === 'settings' 
              ? 'bg-blue-50 dark:bg-[#1e293b] text-blue-700 dark:text-[#c0c1ff] font-semibold' 
              : 'text-slate-500 dark:text-[#908fa0] hover:bg-slate-100 dark:hover:bg-[#122131] hover:text-slate-800 dark:hover:text-[#d4e4fa]'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Настройки</span>
        </button>
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-3 text-slate-500 dark:text-[#908fa0] hover:text-slate-800 dark:hover:text-[#d4e4fa] hover:bg-slate-100 dark:hover:bg-[#122131] transition-all w-full p-2 rounded-lg"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="font-medium text-sm">{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-50 dark:bg-[#1e293b] text-blue-700 dark:text-[#c0c1ff] font-semibold' 
          : 'text-slate-500 dark:text-[#908fa0] hover:bg-slate-50 dark:hover:bg-[#122131] hover:text-slate-800 dark:hover:text-[#d4e4fa]'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-[#c0c1ff]' : ''}`} />
      <span>{label}</span>
    </button>
  );
}
