import { LayoutDashboard, CheckSquare, BarChart2, Settings } from 'lucide-react';
import { Tab } from '../types';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: Props) {
  return (
    <aside className="w-64 bg-theme-sidebar border-r border-theme-sidebar-border flex-col hidden md:flex z-50 transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-theme-text tracking-tight transition-colors">FocusFlow</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem icon={LayoutDashboard} label="Главная" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={CheckSquare} label="Дисциплины" active={activeTab === 'disciplines'} onClick={() => setActiveTab('disciplines')} />
        <NavItem icon={BarChart2} label="Статистика" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} />
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

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-theme-accent/15 text-theme-accent font-semibold' 
          : 'text-theme-muted hover:bg-theme-bg hover:text-theme-text'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-theme-accent' : ''}`} />
      <span>{label}</span>
    </button>
  );
}
