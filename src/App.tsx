/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/ui/Sidebar';
import Dashboard from './components/features/Dashboard';
import Disciplines from './components/features/Disciplines';
import Statistics from './components/features/Statistics';
import Settings from './components/features/Settings';
import Profile from './components/features/Profile';
import Inbox from './components/features/Inbox';
import AchievementAwardModal from './components/features/AchievementAwardModal';
import { useAchievements } from './hooks/useAchievements';
import CommandPalette from './components/ui/CommandPalette';
import FocusMode from './components/features/FocusMode';
import TaskSidebar from './components/TaskSidebar';
import Onboarding from './components/features/Onboarding';
import UserMenu from './components/ui/UserMenu';
import ChangelogModal from './components/ChangelogModal';
import Header from './components/ui/Header';
import HeartsBackground from './components/HeartsBackground';
import StarsBackground from './components/StarsBackground';
import { useBrowserEngagement } from './hooks/useBrowserEngagement';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline, Tab, Task, formatDate } from './types';
import { LayoutDashboard, CheckSquare, BarChart2, Settings as SettingsIcon, Moon, Star, Sparkles, User as UserIcon, Heart } from 'lucide-react';
import confetti from './utils/confetti';
import { syncToSheets, pullFromSheets } from './services/sheets';
import { useTheme } from './services/ThemeContext';
import { useGlobalAudio } from './services/AudioContext';
import { syncService } from './services/SyncService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';

const APP_VERSION = '2.10';

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
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error' | 'offline'>('idle');
  const [syncStrategy, setSyncStrategy] = useState({ firebase: true, sheets: true });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [stats, setStats] = useState({ weeklyGoal: 10, dailyMinutes: {}, disciplineMinutes: {} });
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);


  const { 
    theme, setTheme, themes, actualTheme, showBackgroundEffects, setShowBackgroundEffects, 
    tabTimer, setTabTimer, performanceMode, setPerformanceMode, powerSaving, setPowerSaving,
    simplifiedConstellations, setSimplifiedConstellations, staticElements, setStaticElements,
    simplifiedUI, setSimplifiedUI, previewTheme, setPreviewTheme 
  } = useTheme();
  const { newlyUnlocked, setNewlyUnlocked } = useAchievements(stats);

  useEffect(() => {
    if (!showBackgroundEffects) {
      document.body.classList.add('no-bg-effects');
    } else {
      document.body.classList.remove('no-bg-effects');
    }
  }, [showBackgroundEffects]);

  const { activeSounds, stopAll } = useGlobalAudio();
  const isAudioPlaying = Object.values(activeSounds).some((s: any) => s.isPlaying);

  // Tab Timer Logic
  useEffect(() => {
    if (!tabTimer) {
      document.title = 'Focus Moon';
      return;
    }

    let intervalId: any;
    if (focusTask) {
       // FocusMode handles its own internal timer but we can sync here or just show generic "Focusing..."
       document.title = 'Focusing... | Focus Moon';
    } else {
       intervalId = setInterval(() => {
         const now = new Date();
         document.title = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} | Focus Moon`;
       }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [tabTimer, focusTask]);

  useBrowserEngagement({
    isActive: false,
    actualTheme,
    disabled: !!focusTask
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        handleCloudSync(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const applySyncData = (cloudData: any) => {
    if (!cloudData) return;
    
    if (cloudData.stats) setStats(cloudData.stats);
    if (cloudData.disciplines) setDisciplines(cloudData.disciplines);
    
    if (cloudData.settings) {
      const s = cloudData.settings;
      if (s.theme) setTheme(s.theme);
      if (s.showBackgroundEffects !== undefined) setShowBackgroundEffects(s.showBackgroundEffects);
      if (s.tabTimer !== undefined) setTabTimer(s.tabTimer);
      if (s.performanceMode !== undefined) setPerformanceMode(s.performanceMode);
      if (s.powerSaving !== undefined) setPowerSaving(s.powerSaving);
      if (s.simplifiedConstellations !== undefined) setSimplifiedConstellations(s.simplifiedConstellations);
      if (s.staticElements !== undefined) setStaticElements(s.staticElements);
      if (s.simplifiedUI !== undefined) setSimplifiedUI(s.simplifiedUI);
    }

    if (cloudData.inbox) {
      localStorage.setItem('focusmoon_inbox', typeof cloudData.inbox === 'string' ? cloudData.inbox : JSON.stringify(cloudData.inbox));
      window.dispatchEvent(new Event('focusmoon_inbox_updated'));
    }
  };

  const handleCloudSync = async (currentUser: User) => {
    setSyncStatus('syncing');
    try {
      const cloudData = await syncService.loadFromCloud();
      if (cloudData) {
        applySyncData(cloudData);
        // Also save current local + cloud merged back if needed? 
        // SyncService.merge is better used here if we want to preserve local work
      } else {
        await syncService.saveToCloud({
          stats,
          disciplines,
          settings: {
            theme, showBackgroundEffects, tabTimer, performanceMode, powerSaving,
            simplifiedConstellations, staticElements, simplifiedUI
          }
        });
      }
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Initial sync failed:', error);
      setSyncStatus('error');
    }
  };

  // Periodic Cloud Sync
  useEffect(() => {
    if (!user || !isStorageLoaded) return;

    const interval = setInterval(async () => {
      if (!navigator.onLine) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('syncing');
      try {
        await syncService.saveToCloud({
          stats,
          disciplines,
          settings: {
            theme,
            showBackgroundEffects,
            tabTimer,
            performanceMode,
            powerSaving,
            simplifiedConstellations,
            staticElements,
            simplifiedUI
          }
        });
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (error) {
        setSyncStatus('error');
      }
    }, 60000); // Sync every minute

    return () => clearInterval(interval);
  }, [user, stats, disciplines, theme, showBackgroundEffects, tabTimer, performanceMode, powerSaving, simplifiedConstellations, staticElements, simplifiedUI, isStorageLoaded]);

  useEffect(() => {
    const loadStorage = () => {
      try {
        const strategy = localStorage.getItem('focusmoon_sync_strategy');
        if (strategy) setSyncStrategy(JSON.parse(strategy));

        const ob = localStorage.getItem('focusmoon_onboarding');
        if (ob === 'true') setHasSeenOnboarding(true);

        const st = localStorage.getItem('focusmoon_stats');
        if (st) setStats(JSON.parse(st));

        const d = localStorage.getItem('focusmoon_disciplines');
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
      } finally {
        setIsStorageLoaded(true);
      }
    };
    loadStorage();
  }, []);

  useEffect(() => {
    if (!isStorageLoaded) return;
    localStorage.setItem('focusmoon_stats', JSON.stringify(stats));
  }, [stats, isStorageLoaded]);

  useEffect(() => {
    if (!isStorageLoaded) return;
    localStorage.setItem('focusmoon_onboarding', hasSeenOnboarding ? 'true' : 'false');
  }, [hasSeenOnboarding, isStorageLoaded]);

  const addFocusMinutes = (minutes: number, disciplineId: string | 'free', isOvertime: boolean = false) => {
    setStats((prev: any) => {
      const today = formatDate(new Date());
      const dustGained = isOvertime ? minutes * 2 : minutes; // Double dust for overtime!
      return {
        ...prev,
        focusDust: (prev.focusDust || 0) + dustGained,
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

  const recordSession = (session: any) => {
    setStats((prev: any) => ({
      ...prev,
      sessions: [...(prev.sessions || []), session]
    }));
  };

  const updateWeeklyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, weeklyGoal: goal }));
  };

  const updateDailyGoal = (goal: number) => {
    setStats((prev: any) => ({ ...prev, dailyGoal: goal }));
  };

  const claimBonusDust = (amount: number) => {
    setStats((prev: any) => ({ ...prev, focusDust: (prev.focusDust || 0) + amount }));
  };

  useEffect(() => {
    const seenVersion = localStorage.getItem('focusmoon_version');
    if (seenVersion !== APP_VERSION && hasSeenOnboarding) {
      setShowChangelog(true);
      localStorage.setItem('focusmoon_version', APP_VERSION);
    } else if (!seenVersion) {
      localStorage.setItem('focusmoon_version', APP_VERSION);
    }
  }, [hasSeenOnboarding]);

  useEffect(() => {
    const handleSetTab = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('set_tab', handleSetTab);
    return () => window.removeEventListener('set_tab', handleSetTab);
  }, []);

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
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      let mergedData: any = null;

      // 1. Pull from Firebase if enabled
      if (user && syncStrategy.firebase) {
        try {
          const cloudData = await syncService.loadFromCloud();
          if (cloudData) mergedData = cloudData;
        } catch (e) {
          console.warn('Firebase pull error:', e);
        }
      }

      // 2. Pull from Sheets if enabled
      const webhookUrl = localStorage.getItem('focusmoon_webhook_url');
      if (webhookUrl && syncStrategy.sheets) {
        try {
          const remoteData = await pullFromSheets(webhookUrl);
          if (remoteData) {
            if (mergedData) {
              mergedData = syncService.merge(mergedData, remoteData);
            } else {
              mergedData = remoteData;
            }
          }
        } catch (e) {
          console.warn('Sheets pull error:', e);
        }
      }

      const rawInbox = localStorage.getItem('focusmoon_inbox');
      const localInbox = rawInbox ? (rawInbox.startsWith('ENC:') ? rawInbox : JSON.parse(rawInbox)) : [];
      
      const localData = {
        stats,
        disciplines,
        inbox: localInbox,
        settings: { 
          theme, showBackgroundEffects, tabTimer, performanceMode, powerSaving,
          simplifiedConstellations, staticElements, simplifiedUI
        }
      };

      // Always merge with local to preserve recent changes
      const finalMerged = mergedData ? syncService.merge(localData as any, mergedData) : localData;
      
      if (mergedData) {
        applySyncData(finalMerged as any);
      }
      
      // Save back to both if enabled to ensure parity
      const syncPromises = [];
      if (user && syncStrategy.firebase) syncPromises.push(syncService.saveToCloud(finalMerged as any));
      if (webhookUrl && syncStrategy.sheets) syncPromises.push(syncToSheets(finalMerged as any, webhookUrl));
      
      if (syncPromises.length > 0) await Promise.all(syncPromises);
      
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
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
  }, [disciplines, stats]);

  useEffect(() => {
    const init = async () => {
      await pullData();
      setIsHydrating(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (isHydrating || !isStorageLoaded) return;
    
    localStorage.setItem('focusmoon_disciplines', JSON.stringify(disciplines));
    
    const syncData = async () => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      if (!navigator.onLine) {
        setSyncStatus('offline');
        return;
      }

      setSyncStatus('syncing');
      try {
        const rawInbox = localStorage.getItem('focusmoon_inbox');
        const localInbox = rawInbox ? (rawInbox.startsWith('ENC:') ? rawInbox : JSON.parse(rawInbox)) : [];
        const payload = {
          stats,
          disciplines,
          inbox: localInbox,
          settings: { theme, showBackgroundEffects, tabTimer }
        };

      // Sync to Firebase if enabled
        if (user && syncStrategy.firebase) {
          await syncService.saveToCloud(payload);
        }

        // Sync to Sheets if enabled
        const webhookUrl = localStorage.getItem('focusmoon_webhook_url');
        if (webhookUrl && syncStrategy.sheets) {
          await syncToSheets(payload, webhookUrl);
        }

        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (e) {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
      }
    };
    
    const timeoutId = setTimeout(syncData, 5000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [disciplines, stats, user, theme, showBackgroundEffects, tabTimer, isHydrating, isStorageLoaded]);

  const cycleTheme = () => {
    const availableThemes = themes.map(t => t.id);
    const currentIndex = availableThemes.indexOf(theme);
    const nextTheme = availableThemes[(currentIndex + 1) % availableThemes.length];
    setTheme(nextTheme as any);
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
            const dateStr = formatDate(dDate);
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
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Optimized Header Area */}
        <div className="sticky top-0 z-[60] w-full pointer-events-none">
          <div className="p-4 md:p-6 pointer-events-auto">
             <Header 
               syncStatus={syncStatus} 
               stats={stats} 
               setShowChangelog={setShowChangelog} 
             />
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto custom-scrollbar pb-32 2xl:pb-8 px-4 md:px-8"
            >
              {activeTab === 'dashboard' && <Dashboard disciplines={disciplines} toggleDay={toggleDay} startFocus={startFocus} stats={stats} updateWeeklyGoal={updateWeeklyGoal} updateDailyGoal={updateDailyGoal} claimBonusDust={claimBonusDust} addDiscipline={addDiscipline} />}
              {activeTab === 'disciplines' && <Disciplines disciplines={disciplines} toggleDay={toggleDay} addDiscipline={addDiscipline} deleteDiscipline={deleteDiscipline} editDiscipline={editDiscipline} updateTask={updateTask} startFocus={startFocus} />}
              {activeTab === 'statistics' && <Statistics disciplines={disciplines} stats={stats} />}
              {activeTab === 'settings' && <Settings stats={stats} updateStats={(newStats: any) => setStats((prev: any) => ({ ...prev, ...newStats }))} />}
              {activeTab === 'profile' && <Profile stats={stats} updateStats={(newStats: any) => setStats((prev: any) => ({ ...prev, ...newStats }))} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <Inbox isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />
      <AnimatePresence>
        {newlyUnlocked && (
          <AchievementAwardModal achievement={newlyUnlocked} onClose={() => {
          setStats((prev: any) => ({
            ...prev,
            unlockedAchievements: [...(prev.unlockedAchievements || []), newlyUnlocked.id]
          }));
          setNewlyUnlocked(null);
        }} />
        )}
      </AnimatePresence>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} disciplines={disciplines} onQuickFocus={() => handleStartFocus('free')} initialMode={commandPaletteMode} stats={stats} />
      <TaskSidebar isOpen={isTaskSidebarOpen} onClose={() => setIsTaskSidebarOpen(false)} disciplines={disciplines} onSave={handleSaveTask} />
      
      {previewTheme && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-theme-card border border-theme-accent shadow-xl rounded-full px-4 py-2 flex items-center gap-4 animate-in slide-in-from-top-4">
           <span className="text-xs font-bold text-theme-text uppercase tracking-widest hidden sm:inline">Режим предпросмотра</span>
           <div className="flex gap-2">
             <button onClick={() => setPreviewTheme(null)} className="px-3 py-1.5 rounded-lg bg-theme-bg border border-theme-border text-theme-muted text-[10px] font-black uppercase hover:text-theme-text transition-colors">Отменить</button>
             {(() => {
               const themeObj = themes.find(t => t.id === previewTheme);
               const s = stats as any;
               const isUnlocked = themeObj?.dustRequired ? (s?.isPremium || (s?.unlockedThemes || []).includes(previewTheme)) : true;
               if (isUnlocked) {
                 return (
                   <button onClick={() => { setTheme(previewTheme); setPreviewTheme(null); }} className="px-3 py-1.5 rounded-lg bg-theme-accent text-text-on-accent text-[10px] font-black uppercase shadow-lg active:scale-95">Применить</button>
                 );
               }
               return null;
             })()}
           </div>
        </div>
      )}

      {/* Global Audio Controller (shows when audio is playing and FocusMode is not open or minimized) */}
      {isAudioPlaying && (!focusTask || (focusTask && true /* we will handle hiding it inside FocusMode if needed, or just let it show */)) && (
        <div className="fixed bottom-24 2xl:bottom-8 right-4 2xl:right-8 z-40 bg-theme-card/90 backdrop-blur-md border border-theme-border shadow-lg rounded-2xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
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

      {focusTask && <FocusMode stats={stats} updateStats={(newStats: any) => setStats((prev: any) => ({ ...prev, ...newStats }))}
        task={focusTask === 'free' ? null : focusTask} 
        onClose={() => setFocusTask(null)} 
        focusTrigger={focusTrigger}
        isPageVisible={isPageVisible}
        recordSession={(session) => {
          let discId = session.disciplineId;
          let color = 'var(--color-theme-accent)';
          if (discId !== 'free') {
            const disc = disciplines.find(d => d.id === discId);
            if (disc) color = disc.color;
          }
          recordSession({ ...session, categoryColor: color });
        }}
        addFocusMinutes={(m, isOvertime) => {
          let discId = 'free';
          if (focusTask !== 'free') {
            for (const d of disciplines) {
              if (d.themes?.some(t => t.tasks.some(tsk => tsk.id === focusTask.id))) {
                discId = d.id;
                break;
              }
            }
          }
          addFocusMinutes(m, discId, isOvertime);
        }} 
      />}
      
      {!hasSeenOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
      
      <AnimatePresence>
        {showBackgroundEffects && (
          <>
            {actualTheme === 'iman_love' && <HeartsBackground />}
            {actualTheme === 'iman_love_light' && <HeartsBackground />}
            {(actualTheme === 'dimoon' || actualTheme === 'dimoon-blue') && <StarsBackground />}
          </>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <nav className="2xl:hidden fixed bottom-0 w-full bg-theme-sidebar/90 backdrop-blur-md border-t border-theme-sidebar-border flex justify-around items-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50">
        <MobileNavItem icon={LayoutDashboard} label="Главная" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} actualTheme={actualTheme} index={0} />
        <MobileNavItem icon={CheckSquare} label="Дисциплины" active={activeTab === 'disciplines'} onClick={() => setActiveTab('disciplines')} actualTheme={actualTheme} index={1} />
        <MobileNavItem icon={UserIcon} label="Профиль" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} actualTheme={actualTheme} index={2} />
        <MobileNavItem icon={BarChart2} label="Статистика" active={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} actualTheme={actualTheme} index={3} />
        <MobileNavItem icon={SettingsIcon} label="Настройки" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} actualTheme={actualTheme} index={4} />
      </nav>
    </div>
  );
}

function MobileNavItem({ icon: Icon, label, active, onClick, actualTheme, index }: any) {
  const isSpecial = ['dimoon', 'dimoon-blue', 'iman_love'].includes(actualTheme);
  const SpecialIcons = actualTheme === 'iman_love' 
    ? [Heart, Star, UserIcon, BarChart2, SettingsIcon]
    : [Moon, Star, UserIcon, BarChart2, SettingsIcon];
  const ActiveIcon = isSpecial && index < 5 ? SpecialIcons[index] : Icon;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 relative group ${
        active ? 'text-theme-accent' : 'text-theme-muted hover:text-theme-text'
      }`}
    >
      <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-theme-accent/10 shadow-sm' : 'group-hover:bg-theme-bg'}`}>
        <ActiveIcon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      {active && (
        <motion.div 
          layoutId="mobile-nav-indicator"
          className="absolute -top-1 w-1 h-1 bg-theme-accent rounded-full shadow-[0_0_8px_var(--theme-accent)]"
        />
      )}
    </button>
  );
}
