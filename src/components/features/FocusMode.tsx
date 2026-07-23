import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AccessManager } from "../../services/AccessManager";
import { Task } from "../../types";
import confetti from '../../utils/confetti';
import { useGlobalAudio, sounds } from "../../services/AudioContext";
import { useTheme } from "../../services/ThemeContext";
import { useBrowserEngagement } from "../../hooks/useBrowserEngagement";
import { Telescope } from "lucide-react";
import { AudioEngine } from "../../services/AudioEngine";
import ConfirmModal from "../ui/ConfirmModal";

function BreathingText({ isPageVisible = true }: { isPageVisible?: boolean }) {
  const [text, setText] = useState('Вдох');

  useEffect(() => {
    if (!isPageVisible) return;
    const cycle = () => {
      setText('Вдох');
      setTimeout(() => setText('Задержка'), 4000);
      setTimeout(() => setText('Выдох'), 8000);
    };
    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, [isPageVisible]);

  return <>{text}</>;
}

const FocusMode = React.memo(({
  task,
  onClose,
  addFocusMinutes,
  recordSession,
  focusTrigger,
  isPageVisible = true,
  stats,
  updateStats,
}: {
  task: Task | null;
  onClose: () => void;
  addFocusMinutes: (m: number, isOvertime?: boolean) => void;
  recordSession?: (session: any) => void;
  focusTrigger?: number;
  isPageVisible?: boolean;
  stats?: any;
  updateStats?: (updates: any) => void;
}) => {
  const { theme, actualTheme, showBackgroundEffects, performanceMode } = useTheme();
  const isDimoon = theme === 'dimoon' || actualTheme === 'dimoon' || theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const isDimoonBlue = theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins by default
  const [isActive, setIsActive] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [isZenLock, setIsZenLock] = useState(false);
  const [surrenderProgress, setSurrenderProgress] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isHoveringTelescope, setIsHoveringTelescope] = useState(false);
  const { activeSounds, toggleSound, setSoundVolume, setSoundWaveform, stopAll } = useGlobalAudio();
  const [sessionMode, setSessionMode] = useState<'focus' | 'shortBreak' | 'longBreak' | 'test'>('focus');
  const [isIdle, setIsIdle] = useState(false);
  const [selectedAudioCategory, setSelectedAudioCategory] = useState("Все");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'focus' | 'shortBreak' | 'longBreak' | 'test' | null>(null);
  const [pendingTime, setPendingTime] = useState<number | null>(null);
  const [purchasingSound, setPurchasingSound] = useState<string | null>(null);
  const [confirmSound, setConfirmSound] = useState<string | null>(null);

  const lastProcessedMinuteRef = useRef<number>(0);

  const handleModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak' | 'test') => {
    if (isActive || (timeLeft < totalTime && !isOvertime)) {
      setPendingMode(mode);
      setShowConfirmModal(true);
      return;
    }
    applyModeChange(mode);
  };

  const applyTimeChange = (m: number) => {
    if (m > 1440) m = 1440;
    if (m === 3120) m = 30;
    
    // If timer is running or has progress, and we're just clicking a preset, 
    // it should reset the timer but NOT auto-start.
    setTotalTime(m * 60);
    setTimeLeft(m * 60);
    elapsedSecondsRef.current = 0;
    totalSessionMinutesRef.current = 0;
    lastProcessedMinuteRef.current = 0;
    setIsOvertime(false);
    setIsActive(false); // Manual start only
    setSessionMode('focus');
    
    timerWorkerRef.current?.postMessage({ type: 'RESET' });
    
    unlockAudio();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const applyModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak' | 'test') => {
    setPendingMode(null);
    setSessionMode(mode);
    setIsActive(false); // Manual start only
    setIsOvertime(false);
    elapsedSecondsRef.current = 0;
    totalSessionMinutesRef.current = 0;
    lastProcessedMinuteRef.current = 0;
    
    let newTime = 25 * 60;
    if (mode === 'focus') {
      newTime = 25 * 60;
    } else if (mode === 'shortBreak') {
      newTime = 5 * 60;
    } else if (mode === 'longBreak') {
      newTime = 15 * 60;
    } else if (mode === 'test') {
      newTime = 10;
    }
    
    setTotalTime(newTime);
    setTimeLeft(newTime);
    
    timerWorkerRef.current?.postMessage({ type: 'RESET' });

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const [microIntent, setMicroIntent] = useState("");
  const [isSettingIntent, setIsSettingIntent] = useState(true);
  const [distractionWarning, setDistractionWarning] = useState<number | null>(
    null,
  );
  const [isEasterEgg, setIsEasterEgg] = useState(false);
  const [moonPhase, setMoonPhase] = useState(0);
  const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = () => {
    if (endAudioRef.current) {
      endAudioRef.current.volume = 0;
      endAudioRef.current
        .play()
        .then(() => {
          if (endAudioRef.current) {
            endAudioRef.current.pause();
            endAudioRef.current.currentTime = 0;
            endAudioRef.current.volume = 0.5;
          }
        })
        .catch(() => {});
    }
  };

  const surrenderIntervalRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const elapsedSecondsRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const distractionTimerRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());
  const hasPausedRef = useRef<boolean>(false);
  const totalSessionMinutesRef = useRef<number>(0);
  
  const addFocusMinutesRef = useRef(addFocusMinutes);
  const totalTimeRef = useRef(totalTime);
  
  useEffect(() => {
    addFocusMinutesRef.current = addFocusMinutes;
    totalTimeRef.current = totalTime;
  }, [addFocusMinutes, totalTime]);

  // Timer Logic with Worker
  const timerWorkerRef = useRef<Worker | null>(null);
  const targetEndTimeRef = useRef<number>(0);

  useEffect(() => {
    timerWorkerRef.current = new Worker(new URL('../../workers/timerWorker.ts', import.meta.url), { type: 'module' });
    
    timerWorkerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'TICK') {
        const { totalElapsedMs, remainingMs, targetEndTime } = payload;
        
        // Save target end time for reconciliation
        if (targetEndTime) targetEndTimeRef.current = targetEndTime;

        const totalElapsedSeconds = Math.floor(totalElapsedMs / 1000);
        
        // Calculate incremental minutes for addFocusMinutes
        const currentTotalMinutes = Math.floor(totalElapsedSeconds / 60);
        if (currentTotalMinutes > lastProcessedMinuteRef.current) {
          const minutesToAdd = currentTotalMinutes - lastProcessedMinuteRef.current;
          const isTestMode = totalTimeRef.current <= 10 || sessionMode === 'test';
          
          if (!isTestMode) {
            addFocusMinutesRef.current(minutesToAdd, isOvertimeRef.current);
            totalSessionMinutesRef.current += minutesToAdd;
          }
          
          lastProcessedMinuteRef.current = currentTotalMinutes;
        }

        if (!isOvertimeRef.current) {
          const newTimeLeft = Math.floor(remainingMs / 1000);
          setTimeLeft(newTimeLeft);
          
          // Auto-trigger overtime if remainingMs is 0
          if (remainingMs <= 0 && isActive) {
            setIsOvertime(true);
            isOvertimeRef.current = true;
          }
        } else {
          const overTimeSeconds = Math.max(0, totalElapsedSeconds - Math.floor(totalTimeRef.current));
          setTimeLeft(overTimeSeconds);
        }
      }
    };

    return () => {
      timerWorkerRef.current?.terminate();
      AudioEngine.safeStopAndCleanup(endAudioRef.current);
    };
  }, []); // Only on mount

  const isOvertimeRef = useRef(isOvertime);
  useEffect(() => {
    isOvertimeRef.current = isOvertime;
  }, [isOvertime]);

  useEffect(() => {
    if (isActive) {
      timerWorkerRef.current?.postMessage({ 
        type: 'START', 
        payload: { durationMs: totalTime * 1000 } 
      });
    } else {
      timerWorkerRef.current?.postMessage({ type: 'PAUSE' });
    }
  }, [isActive, totalTime]);

  // Reconciliation on visibility change
  useEffect(() => {
    const reconcile = () => {
      if (!document.hidden && isActive && targetEndTimeRef.current > 0) {
        const now = Date.now();
        if (!isOvertimeRef.current) {
          const remaining = Math.max(0, targetEndTimeRef.current - now);
          setTimeLeft(Math.floor(remaining / 1000));
          if (remaining === 0) {
            setIsOvertime(true);
            isOvertimeRef.current = true;
          }
        }
        // Tell worker to sync its internal startTime
        timerWorkerRef.current?.postMessage({ type: 'SYNC_TIME' });
      }
    };
    document.addEventListener('visibilitychange', reconcile);
    return () => document.removeEventListener('visibilitychange', reconcile);
  }, [isActive]);

  const radius = 160;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // If overtime, circle is full.
  const strokeDashoffset = isOvertime
    ? 0
    : circumference - (timeLeft / totalTime) * circumference;

  // Auto-dimming logic
  useEffect(() => {
    const handleActivity = () => {
      setIsIdle(false);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(
        () => setIsIdle(true),
        2 * 60 * 1000,
      ); // 2 minutes
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    handleActivity();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  const [presets, setPresets] = useState<number[]>([15, 30, 60]);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [presetsInput, setPresetsInput] = useState("");
  const audioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      if (target.closest && target.closest('#confirm-modal')) return;
      if (target.closest && target.closest('#audio-player-modal')) return;
      if (audioRef.current && !audioRef.current.contains(target as Node)) {
        setShowAudioPlayer(false);
      }
    };
    if (showAudioPlayer) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAudioPlayer]);

  useEffect(() => {
    const saved = localStorage.getItem("focusmoon_presets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.includes(3120) || JSON.stringify(parsed) === JSON.stringify([15, 25, 30, 60])) {
          setPresets([15, 30, 60]);
          localStorage.setItem(
            "focusmoon_presets",
            JSON.stringify([15, 30, 60]),
          );
        } else {
          setPresets(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const handleEditPresets = () => {
    setPresetsInput(presets.join(", "));
    setIsEditingPresets(true);
  };

  const savePresets = () => {
    let parsed = presetsInput
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0)
      .slice(0, 5);
    parsed = parsed.map((n) => (n === 3120 ? 30 : n > 1440 ? 1440 : n));
    if (parsed.length > 0) {
      setPresets(parsed);
      localStorage.setItem("focusmoon_presets", JSON.stringify(parsed));
    }
    setIsEditingPresets(false);
  };

  // Zen Lock Distraction Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEasterEgg) {
        setIsEasterEgg(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEasterEgg]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isZenLock && isActive) {
        setIsActive(false);
        setDistractionWarning(10);
      } else if (!document.hidden && distractionWarning !== null) {
        setIsActive(true);
        setDistractionWarning(null);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isZenLock, isActive, distractionWarning]);

  useEffect(() => {
    if (distractionWarning !== null) {
      if (distractionWarning <= 0) {
        onClose();
        return;
      }
      const timer = window.setTimeout(() => {
        setDistractionWarning((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => window.clearTimeout(timer);
    }
  }, [distractionWarning, onClose]);

  useEffect(() => {
    if (timeLeft === 0 && !isOvertime && isActive) {
      setIsOvertime(true);
      stopAll(); // Stop all atmosphere sounds to focus on the gong/notification
      setShowTimeUpAlert(true);
      
      // Request permission again if it was default before
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Время вышло!", { 
          body: "Пора сделать перерыв или продолжить работу.",
          icon: "/favicon.ico",
          silent: false 
        });
      }

      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
      }

      if (endAudioRef.current) {
        endAudioRef.current.volume = 0.7; // Slightly louder
        endAudioRef.current
          .play()
          .catch((e) => console.warn("Gong play failed", e));
      }

      if (isDimoon) {
        const duration = 5000; // Longer celebration
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        const interval: any = setInterval(function() {
          const timeLeftAnim = animationEnd - Date.now();
          if (timeLeftAnim <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 50 * (timeLeftAnim / duration);
          confetti({
            ...defaults, particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047', '#ffffff'],
            shapes: ['star']
          });
          confetti({
            ...defaults, particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047', '#ffffff'],
            shapes: ['star']
          });
        }, 250);
      } else {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
  }, [timeLeft, isOvertime, isActive, stopAll, isDimoon, isDimoonBlue]);

  // Request Fullscreen on Zen Lock
  useEffect(() => {
    if (isZenLock) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [isZenLock]);

  const [isMinimized, setIsMinimized] = useState(false);
  const isDraggingTimerRef = useRef(false);
  const [showTimeUpAlert, setShowTimeUpAlert] = useState(false);

  // If task changes or time is up, un-minimize it
  useEffect(() => {
    if (showTimeUpAlert) {
      setIsMinimized(false);
      // Ensure sound plays if it didn't play in the minimized block
      if (endAudioRef.current && endAudioRef.current.paused) {
        endAudioRef.current.volume = 0.7;
        endAudioRef.current.play().catch(e => console.warn("Delayed gong failed", e));
      }
    }
  }, [showTimeUpAlert]);

  useEffect(() => {
    setIsMinimized(false);
  }, [focusTrigger, task?.id]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useBrowserEngagement({ 
    isActive, 
    minutes: Math.abs(minutes), 
    seconds: Math.abs(seconds), 
    actualTheme 
  });

  const toggleTimer = () => {
    if (isActive) {
      hasPausedRef.current = true;
    } else {
      unlockAudio();
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
    setIsActive(!isActive);
  };
  const resetTimer = () => {
    setIsActive(false);
    setIsOvertime(false);
    isOvertimeRef.current = false;
    setTimeLeft(totalTime);
    elapsedSecondsRef.current = 0;
    totalSessionMinutesRef.current = 0;
    lastProcessedMinuteRef.current = 0;
    targetEndTimeRef.current = 0;
    timerWorkerRef.current?.postMessage({ type: 'RESET' });
  };

  const handleClose = () => {
    const isTestMode = totalTime <= 10 || sessionMode === 'test';
    
    if (totalSessionMinutesRef.current > 0 && recordSession && !isTestMode) {
      const now = new Date();
      const isEarlyMorning = now.getHours() < 9;
      
      recordSession({
        id: `session_${Date.now()}`,
        startTime: sessionStartTimeRef.current,
        duration: totalSessionMinutesRef.current,
        disciplineId: task ? task.disciplineId : 'free',
        isDeepWork: !hasPausedRef.current,
        energy: 'high', // Default
        isEarlyMorning,
        taskTitle: task ? task.title : 'Свободная сессия'
      });
    }
    onClose();
  };

  const handleSurrenderStart = () => {
    if (!isZenLock) {
      handleClose();
      return;
    }
    setSurrenderProgress(0);
    surrenderIntervalRef.current = window.setInterval(() => {
      setSurrenderProgress((prev) => {
        if (prev >= 100) {
          if (surrenderIntervalRef.current)
            clearInterval(surrenderIntervalRef.current);
          return 100;
        }
        return prev + 2; // 2% every 100ms = 5 seconds
      });
    }, 100);
  };

  useEffect(() => {
    if (surrenderProgress >= 100) {
      handleClose();
    }
  }, [surrenderProgress]);

  const handleSurrenderEnd = () => {
    if (surrenderIntervalRef.current) {
      clearInterval(surrenderIntervalRef.current);
    }
    if (surrenderProgress < 100) {
      setSurrenderProgress(0); // reset if didn't hold long enough
    }
  };

  return (
    <>
      <audio
        ref={endAudioRef}
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        preload="auto"
      />
      {isMinimized ? (
        <>
          <AnimatePresence>
            {showTimeUpAlert && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex items-center justify-center bg-theme-bg/80 backdrop-blur-md p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-theme-card border border-theme-accent shadow-[0_0_50px_rgba(var(--color-theme-accent-rgb),0.2)] p-8 rounded-3xl flex flex-col items-center text-center gap-6 max-w-md w-full relative overflow-hidden"
                >
                  {/* Animated rings behind the icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="w-20 h-20 rounded-full bg-theme-accent text-text-on-accent flex items-center justify-center shadow-lg relative">
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="material-symbols-outlined text-4xl"
                    >
                      notifications_active
                    </motion.span>
                    <div className="absolute inset-0 rounded-full border-4 border-theme-accent animate-ping opacity-20"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-theme-text tracking-tight">Время вышло!</h3>
                    <p className="text-theme-muted">
                      Сессия завершена. Рекомендуется сделать небольшую разминку или выпить воды перед продолжением.
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={() => setShowTimeUpAlert(false)}
                      className="w-full py-4 bg-theme-accent text-text-on-accent font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95"
                    >
                      Понятно
                    </button>
                    <button 
                      onClick={() => {
                        setShowTimeUpAlert(false);
                        handleClose();
                      }}
                      className="w-full py-3 text-theme-muted hover:text-theme-text font-medium transition-colors"
                    >
                      Завершить сессию
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            onDragStart={() => {
              isDraggingTimerRef.current = true;
            }}
            onDragEnd={() => {
              setTimeout(() => {
                isDraggingTimerRef.current = false;
              }, 100);
            }}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            className={`fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 md:right-6 bg-theme-card border p-4 rounded-2xl shadow-2xl z-[999] flex items-center gap-4 cursor-pointer transition-colors group ${isOvertime ? 'border-theme-success shadow-[0_0_20px_rgba(var(--color-theme-success-rgb),0.3)] bg-theme-success/5' : 'border-theme-border hover:border-theme-accent'}`}
            onTap={() => {
              if (!isDraggingTimerRef.current) {
                setIsMinimized(false);
              }
            }}
          >
            <div className="flex flex-col">
              <span className={`text-xs font-medium max-w-[150px] truncate ${isOvertime ? 'text-theme-success/80' : 'text-theme-muted'}`}>
                {task ? task.title : "Свободная сессия"}
              </span>
              <div className={`text-2xl font-mono font-bold tabular-nums tracking-tighter ${isOvertime ? 'text-theme-success' : 'text-theme-text'}`}>
                {isOvertime && "+"}
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTimer();
                }}
                className="w-10 h-10 bg-theme-accent/10 dark:bg-theme-accent/100/20 hover:bg-theme-accent/20 dark:hover:bg-theme-accent/100/30 text-theme-accent  rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">
                  {isActive ? "pause" : "play_arrow"}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="w-8 h-8 text-theme-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </motion.div>
        </>
      ) : (
        <div className={`fixed inset-0 bg-theme-bg text-theme-text z-[999] flex flex-col p-6 overflow-hidden will-change-contents ${isDimoon ? 'shadow-[inset_0_0_150px_rgba(253,224,71,0.03)]' : ''}`}>
          <AnimatePresence>
            {showTimeUpAlert && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex items-center justify-center bg-theme-bg/80 backdrop-blur-md p-6"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-theme-card border border-theme-accent shadow-[0_0_50px_rgba(var(--color-theme-accent-rgb),0.2)] p-8 rounded-3xl flex flex-col items-center text-center gap-6 max-w-md w-full relative overflow-hidden"
                >
                  {/* Animated rings behind the icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="w-20 h-20 rounded-full bg-theme-accent text-text-on-accent flex items-center justify-center shadow-lg relative">
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="material-symbols-outlined text-4xl"
                    >
                      notifications_active
                    </motion.span>
                    <div className="absolute inset-0 rounded-full border-4 border-theme-accent animate-ping opacity-20"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-theme-text tracking-tight">Время вышло!</h3>
                    <p className="text-theme-muted">
                      Сессия завершена. Рекомендуется сделать небольшую разминку или выпить воды перед продолжением.
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={() => setShowTimeUpAlert(false)}
                      className="w-full py-4 bg-theme-accent text-text-on-accent font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95"
                    >
                      Понятно
                    </button>
                    <button 
                      onClick={() => {
                        setShowTimeUpAlert(false);
                        handleClose();
                      }}
                      className="w-full py-3 text-theme-muted hover:text-theme-text font-medium transition-colors"
                    >
                      Завершить сессию
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
      {isDimoon && (
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 15% 25%, var(--color-theme-accent) 100%, transparent), radial-gradient(1px 1px at 35% 45%, #fff 100%, transparent), radial-gradient(2px 2px at 80% 30%, var(--color-theme-accent) 100%, transparent)', backgroundSize: '150px 150px' }}></div>
      )}
      
      
      {/* Background Stars for Dimoon Themes */}
      {(isDimoon || isDimoonBlue) && (
        <div className="absolute inset-0 pointer-events-none z-[0] overflow-hidden">
          {isDimoon && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(253,224,71,0.15)_0%,transparent_70%)] animate-[dimoonPulse_10s_ease-in-out_infinite]" />
              <div className="absolute top-[10vh] right-[10vw] text-[clamp(40px,15vw,200px)] text-theme-accent animate-[moonRiseSet_30s_ease-in-out_infinite]">☽</div>
              <div className="absolute top-[30vh] left-[10vw] text-[clamp(16px,6vw,80px)] text-theme-accent opacity-60 animate-[floatSpin_15s_linear_infinite,dimoonPulse_4s_ease-in-out_infinite]">✦</div>
              <div className="absolute bottom-[20vh] right-[25vw] text-[clamp(12px,5vw,60px)] text-theme-accent opacity-40 animate-[floatSpin_20s_linear_infinite_reverse,dimoonPulse_6s_ease-in-out_infinite_2s]">✧</div>
            </>
          )}
          {isDimoonBlue && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(56,189,248,0.2)_0%,transparent_60%)] animate-[dimoonPulse_12s_ease-in-out_infinite_reverse]" />
              <div className="absolute top-[5vh] left-[5vw] text-[clamp(50px,18vw,250px)] text-theme-accent drop-shadow-[0_0_40px_var(--color-theme-accent)] animate-[moonRiseSet_40s_ease-in-out_infinite_reverse]">☾</div>
              <div className="absolute top-[15vh] right-[15vw] text-[clamp(24px,8vw,120px)] text-theme-accent opacity-50 animate-[floatSpin_25s_linear_infinite,dimoonPulse_5s_ease-in-out_infinite]">✺</div>
              <div className="absolute bottom-[15vh] left-[20vw] text-[clamp(16px,6vw,80px)] text-theme-accent opacity-30 animate-[floatSpin_18s_linear_infinite_reverse,dimoonPulse_7s_ease-in-out_infinite_3s]">❅</div>
            </>
          )}
        </div>
      )}

      {/* Easter Egg Overlay */}
      <AnimatePresence>
        {isEasterEgg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
            className="absolute inset-0 z-[3000] bg-theme-bg flex flex-col items-center justify-center overflow-hidden cursor-crosshair"
            onClick={() => {
              const rect = document.documentElement.getBoundingClientRect();
              confetti({
                particleCount: 20,
                spread: 60,
                origin: { x: Math.random(), y: Math.random() },
                colors: [getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#fde047', '#ffffff'],
                shapes: ['star'],
                zIndex: 3001
              });
            }}
          >
            <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 10% 20%, #fff 100%, transparent), radial-gradient(2px 2px at 40% 60%, var(--color-theme-accent) 100%, transparent), radial-gradient(1px 1px at 70% 30%, #fff 100%, transparent), radial-gradient(3px 3px at 85% 85%, var(--color-theme-accent) 100%, transparent)', backgroundSize: '200px 200px', animation: showBackgroundEffects ? 'starsTwinkle 20s linear infinite' : 'none' }}></div>
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(1px 1px at 25% 15%, var(--color-theme-accent) 100%, transparent), radial-gradient(1.5px 1.5px at 55% 75%, #fff 100%, transparent), radial-gradient(2px 2px at 90% 10%, var(--color-theme-accent) 100%, transparent)', backgroundSize: '130px 130px', animation: showBackgroundEffects ? 'starsTwinkle 15s linear infinite reverse' : 'none' }}></div>
            
            <motion.div 
              className="text-[150px] md:text-[250px] cursor-pointer drop-shadow-[0_0_60px_var(--color-theme-accent)] select-none transition-transform z-10"
              onClick={(e) => { e.stopPropagation(); setMoonPhase((p) => (p + 1) % moonPhases.length); }}
              animate={{ rotate: [0, 5, -5, 0], y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            >
              {moonPhases[moonPhase]}
            </motion.div>
            
            <p className="absolute bottom-10 text-theme-muted text-lg tracking-widest font-mono opacity-50 select-none pointer-events-none">
              Кликните по небу или луне. Нажмите ESC, чтобы вернуться.
            </p>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEasterEgg(false); }}
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 md:right-8 text-white/50 hover:text-white transition-colors p-4 rounded-full bg-black/20 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-2xl md:text-3xl">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Distraction Warning Overlay */}
      <AnimatePresence>
        {distractionWarning !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[2000] bg-red-900/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8 text-center"
          >
            <span className="material-symbols-outlined text-6xl md:text-8xl mb-6 text-red-400 animate-pulse">
              warning
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Вы отвлеклись!
            </h1>
            <p className="text-xl md:text-2xl text-red-200 mb-8 max-w-2xl leading-relaxed">
              Вернитесь к работе. Если вы не вернетесь через{" "}
              {distractionWarning} секунд, сессия будет прервана.
            </p>
            <div className="text-9xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(248,113,113,0.5)]">
              {distractionWarning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full px-4 md:px-8 pt-[max(1rem,env(safe-area-inset-top))] pb-4 flex items-center justify-between z-[100] shrink-0 pointer-events-none relative">
        <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
          {!isZenLock && (
            <>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-theme-muted hover-btn-accent"
                title="Свернуть"
              >
                <span className="material-symbols-outlined text-xl">
                  close_fullscreen
                </span>
              </button>
              <button
                onClick={handleClose}
                className="text-theme-muted hover-btn-red"
              >
                <span className="material-symbols-outlined text-xl md:text-3xl">close</span>
              </button>
            </>
          )}
        </div>

        {/* Desktop Menu - Absolute Centered */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center p-1 bg-theme-bg/80 backdrop-blur-md rounded-full border border-theme-border/50 shadow-sm gap-1.5 pointer-events-auto text-sm">
          <button
            onClick={() => handleModeChange('focus')}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors flex items-center justify-center gap-1.5 min-w-[70px] ${sessionMode === 'focus' ? 'bg-theme-accent text-text-on-accent shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-accent/20'}`}
            title="Фокус"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>Фокус
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors flex items-center justify-center gap-1.5 min-w-[70px] ${sessionMode === 'shortBreak' ? 'bg-theme-success text-text-on-success shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-success/20'}`}
            title="Короткий перерыв (5 мин)"
          >
            <span className="material-symbols-outlined text-[18px]">local_cafe</span>5м
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors flex items-center justify-center gap-1.5 min-w-[70px] ${sessionMode === 'longBreak' ? 'bg-theme-success text-text-on-success shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-success/20'}`}
            title="Длинный перерыв (15 мин)"
          >
            <span className="material-symbols-outlined text-[18px]">weekend</span>15м
          </button>
          <button
            onClick={() => handleModeChange('test')}
            className={`px-4 py-1.5 rounded-full font-medium transition-colors flex items-center justify-center gap-1.5 min-w-[70px] ${sessionMode === 'test' ? 'bg-theme-accent text-text-on-accent shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-accent/20'}`}
            title="Демо-тест (10 сек)"
          >
            <span className="material-symbols-outlined text-[18px]">bug_report</span>Тест
          </button>
        </div>

        <div className="flex flex-row items-center gap-2 md:gap-4 pointer-events-auto">
          <button
            onClick={() => setIsBreathing(!isBreathing)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${isBreathing ? "bg-theme-accent text-text-on-accent shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.5)]" : "bg-theme-card border border-theme-border text-theme-muted hover:border-theme-accent hover:text-theme-accent"}`}
            title="Дыхательное упражнение"
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">
              self_improvement
            </span>
          </button>

          <div className="relative" ref={audioRef}>
            <button
              onClick={() => setShowAudioPlayer(!showAudioPlayer)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${Object.values(activeSounds).some((s: any) => s.isPlaying) ? "bg-theme-accent text-text-on-accent shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.5)]" : "bg-theme-card border border-theme-border text-theme-muted hover:border-theme-accent hover:text-theme-accent"}`}
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">
                headphones
              </span>
            </button>

            <AnimatePresence>
              {showAudioPlayer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[1200] flex items-center justify-center p-0 md:p-8"
                >
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-theme-bg/70 backdrop-blur-3xl" 
                    onClick={() => setShowAudioPlayer(false)}
                  />

                  <motion.div
                    initial={{ y: '100%', opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: '100%', opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    id="audio-player-modal" className="relative w-full h-full md:h-[650px] md:max-h-[85vh] md:max-w-5xl bg-theme-card border-t md:border border-theme-border md:rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                  >
                    <div className="sticky top-0 z-30 bg-theme-card border-b border-theme-border/50">
                      {/* Header */}
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent">
                            <span className="material-symbols-outlined text-xl">headphones</span>
                          </div>
                          <div>
                            <h2 className="text-base font-black text-theme-text leading-none tracking-tight">Аудио-центр</h2>
                            <p className="text-[8px] text-theme-muted mt-1 uppercase tracking-[0.2em] font-bold">Иммерсивное погружение</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={stopAll}
                            className="w-9 h-9 rounded-xl bg-theme-bg/50 flex items-center justify-center text-theme-muted hover:text-theme-accent transition-all border border-theme-border/50"
                            title="Выключить всё"
                          >
                            <span className="material-symbols-outlined text-lg">power_settings_new</span>
                          </button>
                          <button 
                            onClick={() => setShowAudioPlayer(false)}
                            className="w-9 h-9 flex items-center justify-center text-theme-muted hover:text-theme-text transition-all hover:rotate-90"
                          >
                            <span className="material-symbols-outlined text-xl">close</span>
                          </button>
                        </div>
                      </div>

                      {/* Categories Bar */}
                      <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                        {["Все", ...Array.from(new Set(sounds.map(s => s.category)))].map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedAudioCategory(category)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${selectedAudioCategory === category ? 'bg-theme-accent text-text-on-accent shadow-lg shadow-theme-accent/20' : 'text-theme-muted hover:text-theme-text hover:bg-theme-bg/50'}`}
                          >
                            <span className="material-symbols-outlined text-base">
                              {category === 'Все' ? 'grid_view' : category === 'Природа' ? 'forest' : category === 'Шумы' ? 'waves' : category === 'Музыка' ? 'album' : 'graphic_eq'}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider">{category}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden bg-theme-bg/5">
                        {/* Active Mixes Bar */}
                        <AnimatePresence>
                          {Object.values(activeSounds).some((s: any) => s.isPlaying) && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="p-4 border-b border-theme-border bg-theme-accent/[0.03] shrink-0 overflow-hidden"
                            >
                              <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
                                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-accent">Микс</h3>
                                </div>
                                <button onClick={stopAll} className="text-[9px] font-bold text-theme-muted hover:text-theme-accent transition-colors uppercase tracking-widest">
                                  Сбросить
                                </button>
                              </div>
                              
                              <div className="flex overflow-x-auto custom-scrollbar gap-3 pb-2">
                                {sounds.filter(s => activeSounds[s.id]?.isPlaying).map(s => {
                                  const isUnlocked = !s.dustRequired || AccessManager.isPremium() || (stats?.unlockedSounds || []).includes(s.id);
                                  const isLocked = !isUnlocked;
                                  return (
                                  <motion.div 
                                    layout
                                    key={s.id}
                                    className={`bg-theme-card border ${isLocked ? 'border-theme-muted/20 opacity-70 grayscale' : 'border-theme-accent/20'} rounded-xl p-3 flex flex-col gap-3 min-w-[280px] md:min-w-[320px] shadow-sm shrink-0`}
                                  >
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg ${isLocked ? 'bg-theme-bg' : 'bg-theme-accent/10 text-theme-accent'} flex items-center justify-center shrink-0`}>
                                          <span className="material-symbols-outlined text-sm">
                                            {isLocked ? 'lock' : (s.category === 'Природа' ? 'forest' : s.category === 'Шумы' ? 'waves' : s.category === 'Музыка' ? 'piano' : 'graphic_eq')}
                                          </span>
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <p className="text-[11px] font-black text-theme-text truncate">{s.name}</p>
                                            <span className={`text-[7px] px-1 py-0.25 rounded uppercase font-black tracking-tighter border ${s.category === 'Частоты' ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/20' : 'bg-theme-muted/10 text-theme-muted border-theme-muted/20'}`}>
                                              {s.category === 'Частоты' ? '[Сгенерировано]' : '[MP3]'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <p className="text-[8px] text-theme-muted uppercase font-bold tracking-wider">{s.category}</p>
                                            {isLocked && s.dustRequired && (
                                              <span className={`text-[7px] font-bold px-1 py-0.5 rounded-sm ${isLocked ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-text/10 text-theme-muted'}`}>
                                                {s.dustRequired} ✨
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {s.category === 'Частоты' && !isLocked && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-theme-accent/10 border border-theme-accent/20 text-theme-accent ml-1">
                                            <span className="material-symbols-outlined text-[10px]">warning</span>
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Caution</span>
                                          </div>
                                        )}
                                      </div>
                                      <button onClick={() => {
                                        if (isLocked) {
                                          setConfirmSound(s.id);
                                          return;
                                        }
                                        toggleSound(s.id);
                                      }} className="p-1 text-theme-muted hover:text-red-500 transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-sm">{isLocked ? 'lock' : 'stop'}</span>
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                      <div className="flex-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-theme-muted text-[14px]">volume_mute</span>
                                        <input
                                          type="range"
                                          min="0"
                                          max="1"
                                          step="0.01"
                                          value={activeSounds[s.id]?.volume ?? 0.5}
                                          onChange={(e) => setSoundVolume(s.id, Number(e.target.value))}
                                          className="flex-1 h-1 bg-theme-border rounded-full appearance-none cursor-pointer accent-theme-accent"
                                        />
                                        <span className="material-symbols-outlined text-theme-muted text-[14px]">volume_up</span>
                                      </div>

                                      {s.type === 'synth' && !s.id.includes('birds') && !s.id.includes('piano') && (
                                        <div className="flex gap-1 shrink-0">
                                          {[
                                            { id: 'sine', icon: 'waves' },
                                            { id: 'square', icon: 'reorder' },
                                            { id: 'sawtooth', icon: 'multiline_chart' },
                                            { id: 'triangle', icon: 'change_history' }
                                          ].map((wave) => (
                                            <button
                                              key={wave.id}
                                              onClick={() => setSoundWaveform(s.id, wave.id)}
                                              className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${activeSounds[s.id]?.waveform === wave.id || (!activeSounds[s.id]?.waveform && wave.id === 'sine') ? 'bg-theme-accent text-text-on-accent border-theme-accent' : 'bg-theme-bg/50 border-theme-border text-theme-muted hover:border-theme-accent/30'}`}
                                            >
                                              <span className="material-symbols-outlined text-[12px]">{wave.icon}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )})}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Library Grid */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-20 md:pb-6">
                              {sounds
                                .filter(s => selectedAudioCategory === "Все" || s.category === selectedAudioCategory)
                                .map(s => {
                                const isActive = activeSounds[s.id]?.isPlaying;
                                const isUnlocked = !s.dustRequired || AccessManager.isPremium() || (stats?.unlockedSounds || []).includes(s.id);
                                const isLocked = !isUnlocked;
                                return (
                                  <div
                                    key={s.id}
                                    className={`group relative w-full p-2.5 sm:p-3.5 rounded-xl border transition-all duration-500 will-change-transform flex items-center gap-3 text-left overflow-hidden ${purchasingSound === s.id ? 'scale-105 opacity-80 border-theme-accent ring-2 ring-theme-accent/50 bg-theme-accent/5' : isLocked && purchasingSound !== s.id ? 'bg-theme-bg/50 border-transparent hover:border-theme-accent/50 hover:bg-theme-card cursor-pointer' : (isActive ? 'bg-theme-accent border-theme-accent text-text-on-accent shadow-md' : 'bg-theme-card border-theme-border/50 hover:border-theme-accent text-theme-text hover:bg-theme-card-hover')}`}
                                  >
                                    <button
                                      onClick={() => {
                                        if (isLocked) {
                                          if (!isActive) setConfirmSound(s.id);
                                        } else {
                                          toggleSound(s.id);
                                        }
                                      }}
                                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shrink-0 ${isActive ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-bg group-hover:bg-theme-accent/10 text-theme-muted group-hover:text-theme-accent'}`}
                                      title={isLocked ? 'Купить' : (isActive ? 'Остановить' : 'Слушать')}
                                    >
                                      <span className="material-symbols-outlined text-lg sm:text-xl transition-colors">
                                        {isLocked ? 'lock' : (isActive ? 'stop' : 'play_arrow')}
                                      </span>
                                    </button>
                                    
                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
                                      if (isLocked) {
                                        if (!isActive) setConfirmSound(s.id);
                                      } else {
                                        toggleSound(s.id);
                                      }
                                    }}>
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <p className="text-[11px] sm:text-xs font-black truncate tracking-tight">{s.name}</p>
                                        <span className={`text-[7px] px-1 py-0.25 rounded uppercase font-black tracking-tighter border transition-colors ${isLocked ? 'bg-theme-muted/10 text-theme-muted border-theme-muted/20' : (isActive ? 'bg-text-on-accent/10 text-text-on-accent border-text-on-accent/20' : s.category === 'Частоты' ? 'bg-theme-accent/10 text-theme-accent border-theme-accent/20' : 'bg-theme-muted/10 text-theme-muted border-theme-muted/20')}`}>
                                          {s.category === 'Частоты' ? '[Сгенерировано]' : '[MP3]'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className={`text-[8px] font-bold uppercase tracking-wider ${isLocked ? 'text-theme-muted' : (isActive ? 'text-text-on-accent/70' : 'text-theme-muted')}`}>
                                          {s.category}
                                        </p>
                                        {isLocked && s.dustRequired && (
                                          <span className={`text-[7px] font-bold px-1 py-0.5 rounded-sm ${isLocked ? 'bg-theme-accent/20 text-theme-accent' : (isActive ? 'bg-text-on-accent/20 text-text-on-accent' : 'bg-theme-text/10 text-theme-muted')}`}>
                                            {s.dustRequired} ✨
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="shrink-0 flex items-center gap-2">
                                      {isLocked ? (
                                        <button 
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setConfirmSound(s.id);
                                          }}
                                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            (stats?.focusDust || 0) >= (s.dustRequired || 0)
                                              ? 'bg-theme-accent text-text-on-accent shadow-lg active:scale-95 hover:brightness-110 hover:shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.5)]' 
                                              : 'bg-theme-muted/20 text-theme-muted cursor-not-allowed hover:bg-theme-muted/30'
                                          }`}
                                        >
                                          Купить
                                        </button>
                                      ) : (
                                        <>
                                          {s.category === 'Частоты' && (
                                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border transition-colors ${isActive ? 'bg-text-on-accent/10 border-text-on-accent/20 text-text-on-accent' : 'bg-theme-accent/10 border-theme-accent/20 text-theme-accent'}`}>
                                              <span className="material-symbols-outlined text-[10px]">warning</span>
                                              <span className="text-[8px] font-black uppercase tracking-tighter">Caution</span>
                                            </div>
                                          )}
                                          {isActive && (
                                            <div className="flex gap-[1.5px] h-3 items-end mb-0.5">
                                              {[...Array(3)].map((_, i) => (
                                                <motion.div 
                                                  key={i}
                                                  animate={{ height: [`${30 + Math.random() * 70}%`, `${10 + Math.random() * 40}%`, `${50 + Math.random() * 50}%`] }}
                                                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                                                  className="w-0.5 bg-current rounded-full"
                                                />
                                              ))}
                                            </div>
                                          )}
                                          <button onClick={() => toggleSound(s.id)}>
                                            <span className="material-symbols-outlined text-lg opacity-50 hover:opacity-100 transition-opacity">
                                              {isActive ? 'stop_circle' : 'play_circle'}
                                            </span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                      </div>

                    {/* Footer */}
                    <div className="p-6 bg-theme-card border-t border-theme-border flex justify-center sticky bottom-0 z-30">
                      <button 
                        onClick={() => setShowAudioPlayer(false)}
                        className="w-full max-w-md py-4 bg-theme-accent text-text-on-accent rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-theme-accent/30 hover:brightness-110 transition-all active:scale-[0.98]"
                      >
                        Готово
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsZenLock(!isZenLock)}
            className={`text-theme-muted hover-btn-accent ${isZenLock ? "text-theme-accent bg-theme-accent/20" : ""}`}
            title={isZenLock ? "Строгий режим включен (Zen Lock)" : "Строгий режим выключен"}
          >
            <span className="material-symbols-outlined text-xl md:text-2xl">
              {isZenLock ? "lock" : "lock_open"}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBreathing(false)}
            className="absolute inset-0 z-[500] flex items-center justify-center bg-theme-bg/80 backdrop-blur-xl pointer-events-auto cursor-pointer"
          >
            <div className="flex flex-col items-center gap-12 pointer-events-none">
              <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1.5, 1],
                    opacity: [0.3, 0.1, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    times: [0, 0.33, 0.66, 1],
                    ease: "easeInOut",
                  }}
                  className="absolute w-64 h-64 rounded-full bg-theme-accent/20"
                />
                
                {/* Main breathing circle */}
                <motion.div
                  animate={isPageVisible ? {
                    scale: [1, 1.5, 1.5, 1],
                  } : { scale: 1.25 }}
                  transition={isPageVisible ? {
                    duration: 12,
                    repeat: Infinity,
                    times: [0, 0.33, 0.66, 1],
                    ease: "easeInOut",
                  } : {}}
                  className="w-48 h-48 rounded-full bg-theme-accent/30 border-4 border-theme-accent shadow-[0_0_40px_rgba(var(--color-theme-accent-rgb),0.3)] flex items-center justify-center"
                />

                {/* Text guide */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    animate={isPageVisible ? {
                      opacity: [1, 0, 1, 0, 1],
                    } : { opacity: 1 }}
                    transition={isPageVisible ? {
                      duration: 12,
                      repeat: Infinity,
                      times: [0, 0.3, 0.33, 0.63, 0.66, 0.96, 1],
                    } : {}}
                    className="text-theme-accent font-bold text-xl uppercase tracking-widest"
                  >
                    <BreathingText isPageVisible={isPageVisible} />
                  </motion.span>
                </div>
              </div>
              
              <div className="text-theme-muted font-medium tracking-wide flex flex-col items-center gap-8">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-theme-accent"></span> Вдох</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-theme-muted"></span> Задержка</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-theme-accent/50"></span> Выдох</span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); setIsBreathing(false); }}
                  className="pointer-events-auto px-6 py-2 rounded-full border border-theme-border text-theme-muted hover:text-theme-text hover:border-theme-accent transition-all flex items-center gap-2 bg-theme-card/50"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Выйти
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSettingIntent ? (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-theme-bg/90 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-theme-text">
              Что главное нужно сделать за эти {Math.round(totalTime / 60)}{" "}
              минут?
            </h2>
            <input
              autoFocus
              type="text"
              value={microIntent}
              onChange={(e) => setMicroIntent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  unlockAudio();
                  setIsSettingIntent(false);
                  setIsActive(false); // Manual start only
                }
              }}
              placeholder="Дописать функцию сортировки..."
              className="w-full bg-transparent border-b-2 border-theme-accent/50 text-2xl md:text-4xl text-center text-theme-accent placeholder:text-theme-muted outline-none focus:border-theme-accent transition-colors pb-4"
            />
            <p className="text-theme-muted mt-8 text-lg">
              Нажмите Enter, чтобы подготовиться к фокусу
            </p>
            <button
              onClick={onClose}
              className="mt-12 px-6 py-2 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-card border border-transparent hover:border-theme-border transition-all"
            >
              Отмена
            </button>
          </motion.div>
        </div>
      ) : null}

      <div
        className={`flex flex-1 w-full h-full max-w-[1600px] mx-auto gap-8 ${isBreathing ? 'overflow-hidden' : 'overflow-y-auto'} overflow-x-hidden custom-scrollbar px-4 pt-8 pb-32 md:py-12 ${task?.summary ? "flex-col lg:flex-row" : "flex-col justify-start md:justify-center items-center"}`}
      >
        {/* Timer Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col items-center justify-center ${task?.summary ? "w-full lg:w-1/2" : "max-w-2xl w-full"}`}
        >
          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center justify-center p-1.5 bg-theme-bg/80 backdrop-blur-md rounded-2xl border border-theme-border/50 shadow-sm mx-auto w-full max-w-[340px] mb-6 gap-1 relative z-10 text-xs">
            <button
              onClick={() => handleModeChange('focus')}
              className={`flex-1 px-1 py-2 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-1 ${sessionMode === 'focus' ? 'bg-theme-accent text-text-on-accent shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-accent/20'}`}
              title="Фокус"
            >
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span>Фокус</span>
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`flex-1 px-1 py-2 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-1 ${sessionMode === 'shortBreak' ? 'bg-theme-success text-text-on-success shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-success/20'}`}
              title="Короткий перерыв (5 мин)"
            >
              <span className="material-symbols-outlined text-[20px]">local_cafe</span>
              <span>5м</span>
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`flex-1 px-1 py-2 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-1 ${sessionMode === 'longBreak' ? 'bg-theme-success text-text-on-success shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-success/20'}`}
              title="Длинный перерыв (15 мин)"
            >
              <span className="material-symbols-outlined text-[20px]">weekend</span>
              <span>15м</span>
            </button>
            <button
              onClick={() => handleModeChange('test')}
              className={`flex-1 px-1 py-2 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-1 ${sessionMode === 'test' ? 'bg-theme-accent text-text-on-accent shadow-sm' : 'text-theme-muted hover:text-theme-text hover:bg-theme-accent/20'}`}
              title="Демо-тест (10 сек)"
            >
              <span className="material-symbols-outlined text-[20px]">bug_report</span>
              <span>Тест</span>
            </button>
          </div>

          <div
            className={`mb-4 md:mb-8 text-center transition-opacity duration-1000 flex flex-col items-center justify-center ${isIdle && isActive ? "opacity-20" : "opacity-100"}`}
          >
            <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-2 truncate w-full max-w-[80vw] md:max-w-2xl px-4" title={task ? task.title : "Свободная сессия"}>
              {task ? task.title : "Свободная сессия"}
            </h1>
            {task?.description && (
              <p className="text-theme-muted truncate w-full max-w-[80vw] md:max-w-xl px-4">{task.description}</p>
            )}
          </div>

          {microIntent && !isSettingIntent && (
            <div
              className={`mb-8 text-xl md:text-2xl font-medium text-theme-accent text-center px-4 max-w-lg transition-opacity duration-1000 ${isIdle && isActive ? "opacity-50" : "opacity-100"}`}
            >
              {microIntent}
            </div>
          )}

          <div className="relative mb-8 group flex items-center justify-center">
            {isDimoon && (
              <div 
                className={`absolute inset-0 m-auto rounded-full blur-2xl pointer-events-none transition-all duration-1000 ${isActive ? "opacity-30 scale-100" : "opacity-10 scale-90"}`} 
                style={{ width: radius * 1.6, height: radius * 1.6, background: 'radial-gradient(circle, var(--color-theme-accent) 0%, transparent 60%)' }}
              ></div>
            )}
            {isDimoon && isActive && (
              <div className="absolute inset-0 pointer-events-none text-theme-accent opacity-50">
                <span className="material-symbols-outlined absolute top-[15%] left-[20%] text-lg drop-shadow-[0_0_10px_var(--color-theme-accent)] animate-[pulse_4s_ease-in-out_infinite]">star</span>
                <span className="material-symbols-outlined absolute bottom-[20%] right-[15%] text-xl drop-shadow-[0_0_10px_var(--color-theme-accent)] animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>stars</span>
                <span className="material-symbols-outlined absolute top-[40%] right-[5%] text-base drop-shadow-[0_0_10px_var(--color-theme-accent)] animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>star</span>
                <span className="material-symbols-outlined absolute bottom-[30%] left-[10%] text-sm drop-shadow-[0_0_10px_var(--color-theme-accent)] animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}>stars</span>
                {isDimoonBlue && Array.from({ length: 12 }).map((_, i) => (
                  <span 
                    key={i}
                    className="material-symbols-outlined absolute text-base drop-shadow-[0_0_15px_var(--color-theme-accent)] animate-[pulse_3s_ease-in-out_infinite]"
                    style={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%`, 
                      animationDelay: `${Math.random() * 3}s`,
                      transform: `scale(${Math.random() * 0.5 + 0.5})`,
                      opacity: Math.random() * 0.5 + 0.5
                    }}
                  >
                    star
                  </span>
                ))}
              </div>
            )}
            {/* SVG Circle Timer */}
            <svg
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}
              overflow="visible"
              className={`w-[280px] h-[280px] md:w-[clamp(240px,40vh,320px)] md:h-[clamp(240px,40vh,320px)] origin-center ${isActive && !isOvertime && showBackgroundEffects ? "animate-breathe" : "rotate-[-90deg]"}`}
            >
              <circle
                stroke="var(--color-theme-border)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className={`transition-opacity duration-1000 ${isIdle && isActive ? "opacity-20" : "opacity-100"}`}
              />
              <circle
                stroke={isOvertime ? "#10B981" : "var(--color-theme-accent)"}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className={`transition-all duration-1000 ease-linear ${isOvertime ? "drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "drop-shadow-[0_0_20px_var(--color-theme-accent)]"}`}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isActive && !isOvertime ? (
                isEditingTime ? (
                  <input
                    autoFocus
                    type="number"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    onBlur={() => {
                      let m = parseInt(timeInput, 10);
                      if (!isNaN(m) && m > 0) {
                        applyTimeChange(m);
                      }
                      setIsEditingTime(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        let m = parseInt(timeInput, 10);
                        if (!isNaN(m) && m > 0) {
                          applyTimeChange(m);
                        }
                        setIsEditingTime(false);
                      } else if (e.key === "Escape") {
                        setIsEditingTime(false);
                      }
                    }}
                    className="text-[60px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto text-theme-accent bg-transparent border-none outline-none text-center w-full max-w-[240px] px-0 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <div
                    className="text-[60px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto text-theme-text hover:text-theme-accent transition-colors cursor-pointer"
                    onClick={() => {
                      setTimeInput(String(minutes));
                      setIsEditingTime(true);
                    }}
                    title="Кликните чтобы изменить время"
                  >
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                  </div>
                )
              ) : (
                <div
                  className={`text-[60px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto transition-colors duration-1000 ${isOvertime ? "text-theme-success drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse" : "text-theme-text"} ${isActive && !isOvertime ? "animate-breathe-scale" : ""}`}
                >
                  {isOvertime && "+"}
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
              )}
            </div>
          </div>

          <div className="min-h-[56px] flex items-center justify-center pointer-events-auto w-full max-w-[340px] px-2">
            {!isActive && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-2 items-center flex-wrap justify-center w-full"
              >
                {isEditingPresets ? (
                  <div className="flex items-center gap-2 bg-theme-card border border-theme-border rounded-lg px-2 py-1 w-full max-w-[200px]">
                    <input
                      autoFocus
                      type="text"
                      value={presetsInput}
                      onChange={(e) => setPresetsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") savePresets();
                        if (e.key === "Escape") setIsEditingPresets(false);
                      }}
                      onBlur={savePresets}
                      className="bg-transparent border-none outline-none text-sm text-theme-text w-full placeholder:text-theme-muted text-center"
                      placeholder="15, 25, 30..."
                    />
                  </div>
                ) : (
                  <>
                    {presets.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          applyTimeChange(m);
                        }}
                        className="px-3 py-1 bg-theme-card hover:bg-theme-bg border border-theme-border rounded-lg text-sm text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
                      >
                        {m}m
                      </button>
                    ))}
                    <button
                      onClick={handleEditPresets}
                      className="px-2 py-1 flex items-center justify-center bg-theme-card hover:bg-theme-bg border border-theme-border rounded-lg text-sm text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
                      title="Настроить пресеты"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 mb-8 md:mb-0 w-full relative mx-auto shrink-0 z-50">
            {isDimoon && (
              <button 
                onClick={() => setIsEasterEgg(true)}
                onMouseEnter={() => {
                  setIsHoveringTelescope(true);
                  confetti({
                    particleCount: 20,
                    spread: 120,
                    origin: { y: 0, x: Math.random() * 0.5 + 0.25 },
                    colors: ['#ffffff', '#fde047', '#38bdf8'],
                    shapes: ['star'],
                    gravity: 0.8,
                    ticks: 200,
                  });
                }}
                onMouseLeave={() => setIsHoveringTelescope(false)}
                className="text-theme-accent hover:text-white transition-colors w-14 h-14 rounded-full bg-theme-card border border-theme-accent/30 hover:bg-theme-accent/40 flex items-center justify-center btn-tactile animate-[pulse_3s_ease-in-out_infinite] hover:animate-none shadow-[0_0_15px_color-mix(in_srgb,var(--color-theme-accent)_40%,transparent)] relative z-50"
                title="Посмотреть на звезды"
              >
                <Telescope className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={toggleTimer}
              className={`btn-tactile w-20 h-20 ${isOvertime && sessionMode === 'focus' ? 'bg-theme-success hover:bg-theme-success/90' : 'bg-theme-accent hover:bg-theme-accent/90'} text-white rounded-full flex items-center justify-center shadow-premium`}
            >
              <span className="material-symbols-outlined text-4xl">
                {isActive ? "pause" : (isDimoon ? "rocket_launch" : "play_arrow")}
              </span>
            </button>

            <button
              onClick={resetTimer}
              className="btn-tactile w-14 h-14 bg-theme-card border border-theme-border hover:bg-[#20242B] text-theme-muted rounded-full flex items-center justify-center"
            >
              <span className="material-symbols-outlined">{isDimoon ? "stars" : "restart_alt"}</span>
            </button>
          </div>

          <AnimatePresence>
            {isOvertime && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 flex flex-col items-center gap-3"
              >
                {sessionMode === 'focus' || sessionMode === 'test' ? (
                  <>
                    <p className="text-theme-success font-medium">Отличная работа! Время отдохнуть.</p>
                    <button 
                      onClick={() => handleModeChange('shortBreak')}
                      className="px-6 py-3 rounded-xl bg-theme-success/20 text-theme-success hover:bg-theme-success/30 transition-colors font-semibold shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">local_cafe</span>
                      Начать перерыв (5 мин)
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-theme-accent font-medium">Перерыв окончен. Готовы продолжить?</p>
                    <button 
                      onClick={() => handleModeChange('focus')}
                      className="px-6 py-3 rounded-xl bg-theme-accent/20 text-theme-accent hover:bg-theme-accent/30 transition-colors font-semibold shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">bolt</span>
                      Вернуться к фокусу (25 мин)
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {isZenLock && (
            <div className="mt-20 flex flex-col items-center">
              <button
                onMouseDown={handleSurrenderStart}
                onMouseUp={handleSurrenderEnd}
                onMouseLeave={handleSurrenderEnd}
                onTouchStart={handleSurrenderStart}
                onTouchEnd={handleSurrenderEnd}
                className="btn-tactile text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest text-sm font-bold relative overflow-hidden px-8 py-3 rounded-lg border border-red-500/20"
              >
                <div
                  className="absolute inset-0 bg-red-500/20 -z-10 transition-all duration-75"
                  style={{ width: `${surrenderProgress}%` }}
                />
                Зажмите, чтобы сдаться
              </button>
              <p className="text-xs text-theme-muted mt-2">
                Удерживайте 5 секунд для выхода
              </p>
            </div>
          )}
        </motion.div>

        {/* Summary Section */}
        {task?.summary && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/2 h-auto lg:h-full flex flex-col justify-center lg:pt-24 pb-12 lg:pr-12"
          >
            <div className="bg-theme-card border border-theme-border rounded-3xl p-8 h-full max-h-[800px] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-theme-card pb-6 mb-6 border-b border-theme-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-theme-accent/10 flex items-center justify-center text-theme-accent">
                  <span className="material-symbols-outlined">
                    auto_awesome
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Конспект материала
                  </h2>
                  <a
                    href={task.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-theme-accent hover:underline break-all truncate block max-w-sm"
                  >
                    {task.contentUrl}
                  </a>
                </div>
              </div>
              <div className="prose prose-invert prose-theme-muted max-w-none whitespace-pre-wrap leading-relaxed">
                {task.summary}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showConfirmModal && pendingMode && (
          <ConfirmModal
            title="Сменить режим?"
            message="Текущий прогресс таймера будет сброшен. Вы уверены?"
            onConfirm={() => {
              applyModeChange(pendingMode);
              setShowConfirmModal(false);
            }}
            onCancel={() => {
              setPendingMode(null);
              setShowConfirmModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
    )}
      {confirmSound && (() => {
        const sound = sounds.find(s => s.id === confirmSound);
        if (!sound) return null;
        
        const currentDust = stats?.focusDust || 0;
        const requiredDust = sound.dustRequired || 0;
        const hasEnough = currentDust >= requiredDust;
        
        return (
          <ConfirmModal
            onCancel={() => {
              if (confirmSound && activeSounds[confirmSound]?.isPlaying) {
                toggleSound(confirmSound);
              }
              setConfirmSound(null);
            }}
            onConfirm={() => {
              if (!hasEnough) {
                if (confirmSound && activeSounds[confirmSound]?.isPlaying) {
                  toggleSound(confirmSound);
                }
                setConfirmSound(null);
                return;
              }
              if (updateStats) {
                 setPurchasingSound(sound.id);
                 setTimeout(() => {
                   updateStats({
                     focusDust: currentDust - requiredDust,
                     unlockedSounds: [...(stats?.unlockedSounds || []), sound.id]
                   });
                   setPurchasingSound(null);
                   confetti({
                     particleCount: 100,
                     spread: 70,
                     origin: { y: 0.6 }
                   });
                 }, 800);
              }
              setConfirmSound(null);
            }}
            title={hasEnough ? "Покупка звука" : "Недостаточно пыльцы"}
            message={hasEnough 
              ? `Купить звук "${sound.name}" за ${requiredDust} ✨?` 
              : `Для покупки нужно ${requiredDust} ✨. У вас сейчас ${currentDust} ✨.`}
            confirmText={hasEnough ? "Купить" : "Понятно"}
            hideCancel={!hasEnough}
          />
        );
      })()}

    </>
  );
});

export default FocusMode;
