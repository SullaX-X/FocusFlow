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
import ChangelogModal from './components/ChangelogModal';
import { Discipline, Tab, Task } from './types';
import { LayoutDashboard, CheckSquare, BarChart2, Settings as SettingsIcon, Moon, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { syncToSheets, pullFromSheets } from './sheets';
import { useTheme } from './ThemeContext';
import { useGlobalAudio } from './AudioContext';

const APP_VERSION = '1.9';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandPaletteMode, setCommandPaletteMode] = useState<'root' | 'themes'>('root');
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | 'free' | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [isHydrating, setIsHydrating] = useState(true);
  const [showChangelog, setShowChangelog] = useState(false);

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [stats, setStats] = useState({ weeklyGoal: 10, dailyMinutes: {}, disciplineMinutes: {} });
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const { theme, setTheme, actualTheme } = useTheme();

  const { activeSounds, stopAll } = useGlobalAudio();
  const isAudioPlaying = Object.values(activeSounds).some((s: any) => s.isPlaying);

  useEffect(() => {
    const loadStorage = () => {
      try {
        const ob = localStorage.getItem('focusflow_onboarding');
        if (ob === 'true') setHasSeenOnboarding(true);

        const st = localStorage.getItem('focusflow_stats');
        if (st) setStats(JSON.parse(st));

        const d = localStorage.getItem('focusflow_disciplines');
        if (d) {
          const parsed = JSON.parse(d) as Discipline[];
          const seenIds = new Set<string>();
          parsed.forEach(discipline => {
            if (seenIds.has(discipline.id)) {
               discipline.id = discipline.id + '_' + Math.random().toString(36).substring(2, 9);
            }
            seenIds.add(discipline.id);

            if (discipline.themes) {
              discipline.themes.forEach(theme => {
                if (seenIds.has(theme.id)) {
                   theme.id = theme.id + '_' + Math.random().toString(36).substring(2, 9);
                }
                seenIds.add(theme.id);
                
                if (theme.tasks) {
                  theme.tasks.forEach(task => {
                    if (seenIds.has(task.id)) {
                       task.id = task.id + '_' + Math.random().toString(36).substring(2, 9);
                    }
                    seenIds.add(task.id);
                  });
                }
              });
            }
          });
          setDisciplines(parsed);
        }
      } catch (e) {
        console.error("Storage error:", e);
      } finally {
        setIsStorageLoaded(true);
      }
    };
    loadStorage();
  }, []);

  useEffect(() => {
    if (!isStorageLoaded) return;
    localStorage.setItem('focusflow_stats', JSON.stringify(stats));
  }, [stats, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    localStorage.setItem('focusflow_onboarding', hasSeenOnboarding ? 'true' : 'false');
  }, [hasSeenOnboarding, isStorageLoaded]);

  const addFocusMinutes = (minutes: number, disciplineId: string | 'free') => {
    setStats((prev: any) => {
      const today = new Date().toISOString().split('T')[0];
      return {
        ...prev,
        focusDust: (prev.focusDust || 0) + minutes,
        dailyMinutes: {
          ...prev.dailyMinutes,
          [today]: (prev.dailyMinutes?.[today] || 0) + minutes
        },
        disciplineMinutes: {
          ...prev.disciplineMinutes,
          [disciplineId]: (prev.disciplineMinutes?.[disciplineId] || 0) + minutes
        }
      };
    });
  };

  const updateWeeklyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, weeklyGoal: goal }));
  };

  useEffect(() => {
    const seenVersion = localStorage.getItem('focusflow_version');
    if (seenVersion !== APP_VERSION && hasSeenOnboarding) {
      setShowChangelog(true);
      localStorage.setItem('focusflow_version', APP_VERSION);
    } else if (!seenVersion) {
      localStorage.setItem('focusflow_version', APP_VERSION);
    }
  }, [hasSeenOnboarding]);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'offline'>('idle');
  const isFirstLoad = useRef(true);
  const previousDisciplines = useRef<Discipline[]>([]);
  const isRollingBack = useRef(false);

  const handleOnboardingComplete = (discipline?: Discipline) => {
    if (discipline) {
      setDisciplines([discipline]);
    }
    setHasSeenOnboarding(true);
  };

  const pullData = async () => {
    const webhookUrl = localStorage.getItem('focusflow_webhook_url');
    if (webhookUrl && navigator.onLine) {
      setSyncStatus('syncing');
      try {
        const remoteData = await pullFromSheets(webhookUrl);
        if (remoteData) {
          if (Array.isArray(remoteData) && remoteData.length > 0) {
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
          } else if (typeof remoteData === 'object' && !Array.isArray(remoteData)) {
            if (remoteData.disciplines && Array.isArray(remoteData.disciplines)) {
              setDisciplines(prev => {
                const merged = [...prev];
                remoteData.disciplines.forEach((rDisc: any) => {
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
            if (remoteData.stats) {
              setStats(prev => ({ ...prev, ...remoteData.stats }));
            }
            if (remoteData.inbox && Array.isArray(remoteData.inbox)) {
              const currentInboxStr = localStorage.getItem('focusflow_inbox');
              const currentInbox = currentInboxStr ? JSON.parse(currentInboxStr) : [];
              const mergedInbox = [...currentInbox];
              remoteData.inbox.forEach((rItem: any) => {
                if (!mergedInbox.find((i: any) => i.id === rItem.id)) {
                  mergedInbox.push(rItem);
                }
              });
              localStorage.setItem('focusflow_inbox', JSON.stringify(mergedInbox));
              window.dispatchEvent(new Event('focusflow_inbox_updated'));
            }
          }
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
    if (isHydrating || !isStorageLoaded) return;
    
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
            const statsData = JSON.parse(localStorage.getItem('focusflow_stats') || '{"weeklyGoal": 10, "dailyMinutes": {}, "disciplineMinutes": {}}');
            const inboxData = JSON.parse(localStorage.getItem('focusflow_inbox') || '[]');
            const fullData = { disciplines, stats: statsData, inbox: inboxData };
            
            await syncToSheets(fullData, webhookUrl);
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

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'nordic' | 'latte' | 'oled' | 'liquid-glass' | 'iman_love' | 'dimoon' | 'dimoon-blue' | 'system')[] = ['light', 'dark', 'nordic', 'latte', 'oled', 'liquid-glass', 'iman_love', 'dimoon', 'dimoon-blue', 'system'];
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(nextTheme);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '?') {
        e.preventDefault();
        setCommandPaletteMode('root');
        setIsCommandOpen(open => !open);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteMode('root');
        setIsCommandOpen(open => !open);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setCommandPaletteMode('root');
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

      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        setCommandPaletteMode('themes');
        setIsCommandOpen(true);
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
          handleStartFocus(firstTask);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [disciplines, theme, setTheme]);

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

  const editDiscipline = (id: string, updates: Partial<Discipline>) => {
    setDisciplines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
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

  const handleStartFocus = (task: Task | 'free') => {
    setFocusTask(task);
    setFocusTrigger(Date.now());
  };

  const startFocus = (task: Task) => {
    handleStartFocus(task);
  };

  if (isHydrating) {
    return (
      <div className="min-h-[100dvh] bg-theme-bg flex flex-col items-center justify-center p-6 text-theme-text transition-colors duration-300">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
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
    <div className="flex h-[100dvh] w-full bg-theme-bg text-theme-text font-sans overflow-hidden transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onQuickFocus={() => handleStartFocus('free')} />
      <main className="flex-1 flex flex-col h-screen pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 relative overflow-hidden">
        {/* Desktop Header / Global Header */}
        <header className="hidden md:flex sticky top-0 z-[60] bg-theme-bg/80 backdrop-blur-md border-b border-theme-border p-3 md:p-4 justify-end items-center gap-3 w-full shrink-0">
          {syncStatus !== 'idle' && (
            <div className="bg-theme-card/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-theme-border shadow-sm mr-2">
              {syncStatus === 'syncing' && <span className="material-symbols-outlined text-sm animate-spin text-theme-muted">sync</span>}
              {syncStatus === 'success' && <span className="material-symbols-outlined text-sm text-green-500">cloud_done</span>}
              {syncStatus === 'error' && <span className="material-symbols-outlined text-sm text-red-500">cloud_off</span>}
              {syncStatus === 'offline' && <span className="material-symbols-outlined text-sm text-orange-500">wifi_off</span>}
              <span className={`text-xs font-medium ${syncStatus === 'error' ? 'text-red-500' : syncStatus === 'offline' ? 'text-orange-500' : 'text-theme-muted'}`}>
                {syncStatus === 'syncing' ? 'Синхронизация...' : syncStatus === 'success' ? 'Сохранено' : syncStatus === 'offline' ? 'Оффлайн' : 'Ошибка'}
              </span>
            </div>
          )}
          
          <button 
            onClick={() => setShowChangelog(true)} 
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-theme-text shadow-sm hover:ring-2 ring-theme-accent transition-all relative"
            title="Обновления и уведомления"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-theme-bg"></span>
          </button>
          
          <UserMenu className="relative z-[60]" />
        </header>

        {/* Mobile Header / Floating elements */}
        <div className="md:hidden">
          <button 
            onClick={() => setShowChangelog(true)} 
            className="absolute top-4 right-[4.5rem] w-10 h-10 rounded-full glass-panel flex items-center justify-center text-theme-text shadow-sm z-[60]"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-theme-bg"></span>
          </button>
          <UserMenu className="absolute top-4 right-4 z-[60]" />
          
          {syncStatus !== 'idle' && (
            <div className="absolute top-4 right-[8rem] bg-white/80 dark:bg-theme-card/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-theme-border shadow-sm z-50">
              {syncStatus === 'syncing' && <span className="material-symbols-outlined text-sm animate-spin text-theme-muted">sync</span>}
              {syncStatus === 'success' && <span className="material-symbols-outlined text-sm text-green-500">cloud_done</span>}
              {syncStatus === 'error' && <span className="material-symbols-outlined text-sm text-red-500">cloud_off</span>}
              {syncStatus === 'offline' && <span className="material-symbols-outlined text-sm text-orange-500">wifi_off</span>}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto relative">
          {activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} startFocus={startFocus} stats={stats} updateWeeklyGoal={updateWeeklyGoal} addDiscipline={addDiscipline} />}
          {activeTab === 'disciplines' && <Disciplines disciplines={disciplines} toggleDay={toggleDay} addDiscipline={addDiscipline} deleteDiscipline={deleteDiscipline} editDiscipline={editDiscipline} updateTask={updateTask} startFocus={startFocus} />}
          {activeTab === 'statistics' && <Statistics disciplines={disciplines} stats={stats} />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
      
      <Inbox isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} disciplines={disciplines} onQuickFocus={() => handleStartFocus('free')} initialMode={commandPaletteMode} />
      <TaskSidebar isOpen={isTaskSidebarOpen} onClose={() => setIsTaskSidebarOpen(false)} disciplines={disciplines} onSave={handleSaveTask} />
      
      {/* Global Audio Controller (shows when audio is playing and FocusMode is not open or minimized) */}
      {isAudioPlaying && (!focusTask || (focusTask && true /* we will handle hiding it inside FocusMode if needed, or just let it show */)) && (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 bg-theme-card/90 backdrop-blur-md border border-theme-border shadow-lg rounded-2xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-full bg-theme-accent/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-theme-accent rounded-full animate-pulse"></div>
          </div>
          <div className="text-sm font-medium text-theme-text pr-2">Фоновый шум активен</div>
          <button 
            onClick={stopAll}
            className="p-2 rounded-xl bg-theme-bg hover:bg-red-500/10 text-theme-muted hover:text-red-500 transition-colors"
            title="Остановить все звуки"
          >
            <span className="material-symbols-outlined text-[18px]">stop_circle</span>
          </button>
        </div>
      )}

      {focusTask && <FocusMode 
        task={focusTask === 'free' ? null : focusTask} 
        onClose={() => setFocusTask(null)} 
        focusTrigger={focusTrigger}
        addFocusMinutes={(m) => {
          let discId = 'free';
          if (focusTask !== 'free') {
            for (const d of disciplines) {
              if (d.themes?.some(t => t.tasks.some(tsk => tsk.id === focusTask.id))) {
                discId = d.id;
                break;
              }
            }
          }
          addFocusMinutes(m, discId);
        }} 
      />}
      
      {!hasSeenOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-theme-sidebar/90 backdrop-blur-md border-t border-theme-sidebar-border flex justify-around items-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50">
        <MobileNavItem icon={LayoutDashboard} label="Главная" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isDimoon={theme === 'dimoon' || theme === 'dimoon-blue'} index={0} />
        <MobileNavItem icon={CheckSquare} label="Дисциплины" active={activeTab === 'disciplines'} onClick={() => setActiveTab('disciplines')} isDimoon={theme === 'dimoon' || theme === 'dimoon-blue'} index={1} />
        <MobileNavItem icon={BarChart2} label="Статистика" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} isDimoon={theme === 'dimoon' || theme === 'dimoon-blue'} index={2} />
        <MobileNavItem icon={SettingsIcon} label="Настройки" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isDimoon={theme === 'dimoon' || theme === 'dimoon-blue'} index={3} />
      </nav>
    </div>
  );
}

function MobileNavItem({ icon: Icon, label, active, onClick, isDimoon, index }: any) {
  const DimoonIcons = [Moon, Star, Sparkles, SettingsIcon];
  const ActiveIcon = isDimoon && index < 4 ? DimoonIcons[index] : Icon;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
        active ? 'text-theme-accent' : 'text-theme-muted'
      }`}
    >
      <ActiveIcon className="w-6 h-6 mb-1" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
