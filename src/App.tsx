/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Disciplines from './components/Disciplines';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import { Discipline, Tab } from './types';
import { LayoutDashboard, CheckSquare, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import { syncToSheets } from './sheets';
import { useTheme } from './ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [disciplines, setDisciplines] = useState<Discipline[]>(() => {
    try {
      const saved = localStorage.getItem('focusflow_disciplines');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const isFirstLoad = useRef(true);
  
  const { theme } = useTheme();

  useEffect(() => {
    localStorage.setItem('focusflow_disciplines', JSON.stringify(disciplines));
    
    const syncData = async () => {
      if (!isFirstLoad.current) {
        setIsSyncing(true);
        try {
          const webhookUrl = localStorage.getItem('focusflow_webhook_url');
          if (webhookUrl) {
            await syncToSheets(disciplines, webhookUrl);
          }
        } catch (e) {
          console.error('Failed to sync to sheets', e);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    
    if (!isFirstLoad.current) {
      const timeoutId = setTimeout(syncData, 1500);
      return () => clearTimeout(timeoutId);
    } else {
      isFirstLoad.current = false;
    }
  }, [disciplines]);

  const toggleDay = (disciplineId: string, date: string) => {
    setDisciplines(prev => prev.map(d => {
      if (d.id === disciplineId) {
        const newHistory = { ...d.history };
        if (newHistory[date]) {
          delete newHistory[date];
        } else {
          newHistory[date] = true;
        }
        return { ...d, history: newHistory };
      }
      return d;
    }));
  };

  const addDiscipline = (d: Discipline) => {
    setDisciplines([...disciplines, d]);
  };
  
  const deleteDiscipline = async (id: string) => {
    setDisciplines(disciplines.filter(d => d.id !== id));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#051424] text-slate-900 dark:text-[#d4e4fa] font-sans overflow-hidden transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {isSyncing && (
          <div className="absolute top-4 right-4 bg-white/80 dark:bg-[#122131]/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 dark:border-[#273647] shadow-sm z-50">
            <span className="material-symbols-outlined text-sm animate-spin text-slate-500 dark:text-[#908fa0]">sync</span>
            <span className="text-xs font-medium text-slate-600 dark:text-[#908fa0]">Синхронизация...</span>
          </div>
        )}
        
        {activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} />}
        {activeTab === 'disciplines' && <Disciplines disciplines={disciplines} toggleDay={toggleDay} addDiscipline={addDiscipline} deleteDiscipline={deleteDiscipline} />}
        {activeTab === 'statistics' && <Statistics disciplines={disciplines} />}
        {activeTab === 'settings' && <Settings />}
      </main>
      
      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-[#010f1f]/90 backdrop-blur-md border-t border-slate-200 dark:border-[#273647] flex justify-around items-center p-2 z-50">
        <MobileNavItem icon={LayoutDashboard} label="Главная" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={CheckSquare} label="Дисциплины" active={activeTab === 'disciplines'} onClick={() => setActiveTab('disciplines')} />
        <MobileNavItem icon={BarChart2} label="Статистика" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} />
        <MobileNavItem icon={SettingsIcon} label="Настройки" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>
    </div>
  );
}

function MobileNavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
        active ? 'text-blue-600 dark:text-[#c0c1ff]' : 'text-slate-500 dark:text-[#908fa0]'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

