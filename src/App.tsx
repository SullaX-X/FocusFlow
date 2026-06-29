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
import Inbox from './components/Inbox';
import CommandPalette from './components/CommandPalette';
import FocusMode from './components/FocusMode';
import TaskSidebar from './components/TaskSidebar';
import Onboarding from './components/Onboarding';
import UserMenu from './components/UserMenu';
import { Discipline, Tab, Task } from './types';
import { LayoutDashboard, CheckSquare, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { syncToSheets, pullFromSheets } from './sheets';
import { useTheme } from './ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('focusflow_onboarding') === 'true';
  });

  const [disciplines, setDisciplines] = useState<Discipline[]>(() => {
    try {
      const saved = localStorage.getItem('focusflow_disciplines');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'offline'>('idle');
  const isFirstLoad = useRef(true);
  const previousDisciplines = useRef<Discipline[]>([]);
  const isRollingBack = useRef(false);
  
  const { theme } = useTheme();

  const handleOnboardingComplete = (discipline?: Discipline) => {
    if (discipline) {
      setDisciplines([discipline]);
    }
    localStorage.setItem('focusflow_onboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const pullData = async () => {
    const webhookUrl = localStorage.getItem('focusflow_webhook_url');
    if (webhookUrl && navigator.onLine) {
      setSyncStatus('syncing');
      try {
        const remoteData = await pullFromSheets(webhookUrl);
        if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
          setDisciplines(prev => {
            const merged = [...prev];
            remoteData.forEach((rDisc: any) => {
              const lDisc = merged.find(d => d.id === rDisc.id);
              if (lDisc) {
                lDisc.history = { ...rDisc.history, ...lDisc.history };
              } else {
                merged.push(rDisc);
              }
            });
            previousDisciplines.current = merged;
            return merged;
          });
        }
      } catch (e) {
        console.warn('Silent sync error (CORS/Deployment issue):', e);
      } finally {
        setSyncStatus('idle');
      }
    } else {
      previousDisciplines.current = disciplines;
    }
  };

  useEffect(() => {
    const handleOnline = () => setSyncStatus('idle');
    const handleOffline = () => setSyncStatus('offline');
    const handleFocus = () => pullData();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);
    
    if (!navigator.onLine) setSyncStatus('offline');
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      await pullData();
      setIsHydrating(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (isHydrating) return;
    
    localStorage.setItem('focusflow_disciplines', JSON.stringify(disciplines));
    
    if (isRollingBack.current) {
      isRollingBack.current = false;
      return;
    }

    const syncData = async () => {
      if (!isFirstLoad.current) {
        if (!navigator.onLine) {
           setSyncStatus('offline');
           return;
        }
        setSyncStatus('syncing');
        try {
          const webhookUrl = localStorage.getItem('focusflow_webhook_url');
          if (webhookUrl) {
            await syncToSheets(disciplines, webhookUrl);
            setSyncStatus('success');
            previousDisciplines.current = disciplines;
            setTimeout(() => setSyncStatus('idle'), 3000);
          } else {
            previousDisciplines.current = disciplines;
            setSyncStatus('idle');
          }
        } catch (e) {
          console.warn('Failed to sync to sheets (likely CORS issue):', e);
          setSyncStatus('error');
          // Rollback
          isRollingBack.current = true;
          setDisciplines(previousDisciplines.current);
          setTimeout(() => setSyncStatus('idle'), 4000);
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

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(open => !open);
        return;
      }

      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInboxOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsTaskSidebarOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        // find first available task
        let firstTask: Task | null = null;
        for (const d of disciplines) {
          if (d.themes) {
            for (const t of d.themes) {
              const activeTask = t.tasks.find(task => task.status !== 'done');
              if (activeTask) {
                firstTask = activeTask;
                break;
              }
            }
          }
          if (firstTask) break;
        }
        if (firstTask) {
          setFocusTask(firstTask);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const toggleDay = (disciplineId: string, date: string) => {
    setDisciplines(prev => prev.map(d => {
      if (d.id === disciplineId) {
        const newHistory = { ...d.history };
        if (newHistory[date]) {
          delete newHistory[date];
        } else {
          newHistory[date] = true;
          // check if we hit 7 day streak
          let streak = 0;
          let dDate = new Date();
          while (true) {
            const dateStr = dDate.toISOString().split('T')[0];
            if (newHistory[dateStr]) {
              streak++;
              dDate.setDate(dDate.getDate() - 1);
            } else {
              break;
            }
          }
          if (streak === 7) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        }
        return { ...d, history: newHistory };
      }
      return d;
    }));
  };

  const handleSaveTask = (disciplineId: string, task: Task) => {
    setDisciplines(prev => prev.map(d => {
      if (d.id === disciplineId) {
        const newThemes = [...(d.themes || [])];
        if (newThemes.length === 0) {
          newThemes.push({ id: 'default', name: 'Общие задачи', tasks: [task] });
        } else {
          newThemes[0].tasks.push(task);
        }
        return { ...d, themes: newThemes };
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

  const updateTask = (disciplineId: string, themeId: string, taskId: string, updates: Partial<Task>) => {
    setDisciplines(prev => prev.map(d => {
      if (d.id === disciplineId) {
        return {
          ...d,
          themes: (d.themes || []).map(t => {
            if (t.id === themeId) {
              return {
                ...t,
                tasks: t.tasks.map(task => 
                  task.id === taskId ? { ...task, ...updates } : task
                )
              };
            }
            return t;
          })
        };
      }
      return d;
    }));
  };

  const startFocus = (task: Task) => {
    setFocusTask(task);
  };

  if (isHydrating) {
    return (
      <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center p-6 text-theme-text transition-colors duration-300">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold">Загрузка данных...</h2>
          <p className="text-sm text-theme-muted">
            Синхронизация с облаком
          </p>
          <div className="space-y-3 animate-pulse mt-8">
            <div className="h-16 bg-theme-card rounded-2xl w-full"></div>
            <div className="h-16 bg-theme-card rounded-2xl w-full"></div>
            <div className="h-16 bg-theme-card rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-theme-bg text-theme-text font-sans overflow-hidden transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        <UserMenu />
        {syncStatus !== 'idle' && (
          <div className="absolute top-4 right-16 bg-white/80 dark:bg-theme-card/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-theme-border shadow-sm z-50">
            {syncStatus === 'syncing' && <span className="material-symbols-outlined text-sm animate-spin text-theme-muted">sync</span>}
            {syncStatus === 'success' && <span className="material-symbols-outlined text-sm text-green-500">cloud_done</span>}
            {syncStatus === 'error' && <span className="material-symbols-outlined text-sm text-red-500">cloud_off</span>}
            {syncStatus === 'offline' && <span className="material-symbols-outlined text-sm text-orange-500">wifi_off</span>}
            <span className={`text-xs font-medium ${syncStatus === 'error' ? 'text-red-500' : syncStatus === 'offline' ? 'text-orange-500' : 'text-theme-muted'}`}>
              {syncStatus === 'syncing' ? 'Синхронизация...' : syncStatus === 'success' ? 'Сохранено ☁️✓' : syncStatus === 'offline' ? 'Оффлайн режим. Задачи сохранены' : 'Ошибка синхронизации'}
            </span>
          </div>
        )}
        
        {activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} startFocus={startFocus} />}
        {activeTab === 'disciplines' && <Disciplines disciplines={disciplines} toggleDay={toggleDay} addDiscipline={addDiscipline} deleteDiscipline={deleteDiscipline} updateTask={updateTask} startFocus={startFocus} />}
        {activeTab === 'statistics' && <Statistics disciplines={disciplines} />}
        {activeTab === 'settings' && <Settings />}
      </main>
      
      <Inbox isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} disciplines={disciplines} />
      <TaskSidebar isOpen={isTaskSidebarOpen} onClose={() => setIsTaskSidebarOpen(false)} disciplines={disciplines} onSave={handleSaveTask} />
      {focusTask && <FocusMode task={focusTask} onClose={() => setFocusTask(null)} />}
      
      {!hasSeenOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-theme-sidebar/90 backdrop-blur-md border-t border-theme-sidebar-border flex justify-around items-center p-2 z-50">
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
        active ? 'text-theme-accent' : 'text-theme-muted'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

