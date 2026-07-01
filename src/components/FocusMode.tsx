import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import confetti from "canvas-confetti";
import { useGlobalAudio, sounds } from "../AudioContext";
import { useTheme } from "../ThemeContext";

export default function FocusMode({
  task,
  onClose,
  addFocusMinutes,
  focusTrigger,
}: {
  task: Task | null;
  onClose: () => void;
  addFocusMinutes: (m: number) => void;
  focusTrigger?: number;
}) {
  const { theme, actualTheme } = useTheme();
  const isDimoon = theme === 'dimoon' || actualTheme === 'dimoon' || theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const isDimoonBlue = theme === 'dimoon-blue' || actualTheme === 'dimoon-blue';
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins by default
  const [isActive, setIsActive] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [isZenLock, setIsZenLock] = useState(false);
  const [surrenderProgress, setSurrenderProgress] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const { activeSounds, toggleSound, setSoundVolume, stopAll } = useGlobalAudio();
  const [sessionMode, setSessionMode] = useState<'focus' | 'shortBreak' | 'longBreak' | 'test'>('focus');
  const [isIdle, setIsIdle] = useState(false);

  const [pendingMode, setPendingMode] = useState<'focus' | 'shortBreak' | 'longBreak' | 'test' | null>(null);

  const handleModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak' | 'test') => {
    if (isActive || timeLeft < totalTime) {
      setPendingMode(mode);
      return;
    }
    applyModeChange(mode);
  };

  const applyModeChange = (mode: 'focus' | 'shortBreak' | 'longBreak' | 'test') => {
    setPendingMode(null);
    setSessionMode(mode);
    setIsActive(false);
    setIsOvertime(false);
    if (mode === 'focus') {
      setTotalTime(25 * 60);
      setTimeLeft(25 * 60);
    } else if (mode === 'shortBreak') {
      setTotalTime(5 * 60);
      setTimeLeft(5 * 60);
    } else if (mode === 'longBreak') {
      setTotalTime(15 * 60);
      setTimeLeft(15 * 60);
    } else if (mode === 'test') {
      setTotalTime(10);
      setTimeLeft(10);
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
  const distractionTimerRef = useRef<number | null>(null);

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

  const [presets, setPresets] = useState<number[]>([15, 25, 30, 60]);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [isEditingPresets, setIsEditingPresets] = useState(false);
  const [presetsInput, setPresetsInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("focusflow_presets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.includes(3120)) {
          setPresets([15, 25, 30, 60]);
          localStorage.setItem(
            "focusflow_presets",
            JSON.stringify([15, 25, 30, 60]),
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
      localStorage.setItem("focusflow_presets", JSON.stringify(parsed));
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
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        elapsedSecondsRef.current += 1;
        if (elapsedSecondsRef.current >= 60) {
          addFocusMinutes(1);
          elapsedSecondsRef.current = 0;
        }

        if (!isOvertime) {
          setTimeLeft((prev) => {
            if (prev <= 1) return 0;
            return prev - 1;
          });
        } else {
          // Count up
          setTimeLeft((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isOvertime, addFocusMinutes]);

  useEffect(() => {
    if (timeLeft === 0 && !isOvertime && isActive) {
      setIsOvertime(true);
      if (endAudioRef.current) {
        endAudioRef.current.volume = 0.5;
        endAudioRef.current
          .play()
          .catch((e) => console.warn("Gong play failed", e));
      }
      if (isDimoon) {
        const duration = 3000;
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
            colors: isDimoonBlue ? ['#38bdf8', '#ffffff'] : ['#fde047', '#ffffff'],
            shapes: ['star']
          });
          confetti({
            ...defaults, particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: isDimoonBlue ? ['#38bdf8', '#ffffff'] : ['#fde047', '#ffffff'],
            shapes: ['star']
          });
        }, 250);
      } else {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      }
    }
  }, [timeLeft, isOvertime, isActive]);

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

  // If task changes (user clicks "start focus" from somewhere else while minimized), un-minimize it
  useEffect(() => {
    setIsMinimized(false);
  }, [focusTrigger, task?.id]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const toggleTimer = () => {
    if (!isActive) unlockAudio();
    setIsActive(!isActive);
  };
  const resetTimer = () => {
    setIsActive(false);
    setIsOvertime(false);
    setTimeLeft(totalTime);
  };

  const handleSurrenderStart = () => {
    if (!isZenLock) {
      onClose();
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
      onClose();
    }
  }, [surrenderProgress, onClose]);

  const handleSurrenderEnd = () => {
    if (surrenderIntervalRef.current) {
      clearInterval(surrenderIntervalRef.current);
    }
    if (surrenderProgress < 100) {
      setSurrenderProgress(0); // reset if didn't hold long enough
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 md:right-6 bg-theme-card border border-theme-border p-4 rounded-2xl shadow-2xl z-[999] flex items-center gap-4 cursor-pointer hover:border-theme-accent transition-colors group"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex flex-col">
          <span className="text-xs text-theme-muted font-medium max-w-[150px] truncate">
            {task ? task.title : "Свободная сессия"}
          </span>
          <div className="text-2xl font-mono font-bold text-theme-text tabular-nums tracking-tighter">
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
              onClose();
            }}
            className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-theme-bg text-theme-text z-[999] flex flex-col p-6 overflow-hidden ${isDimoon ? 'shadow-[inset_0_0_150px_rgba(253,224,71,0.03)]' : ''}`}>
      {isDimoon && (
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 15% 25%, var(--color-theme-accent) 100%, transparent), radial-gradient(1px 1px at 35% 45%, #fff 100%, transparent), radial-gradient(2px 2px at 80% 30%, var(--color-theme-accent) 100%, transparent)', backgroundSize: '150px 150px' }}></div>
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
                colors: isDimoonBlue ? ['#38bdf8', '#ffffff'] : ['#fde047', '#ffffff'],
                shapes: ['star'],
                zIndex: 3001
              });
            }}
          >
            <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ backgroundImage: 'radial-gradient(1.5px 1.5px at 10% 20%, #fff 100%, transparent), radial-gradient(2px 2px at 40% 60%, var(--color-theme-accent) 100%, transparent), radial-gradient(1px 1px at 70% 30%, #fff 100%, transparent), radial-gradient(3px 3px at 85% 85%, var(--color-theme-accent) 100%, transparent)', backgroundSize: '200px 200px', animation: 'starsTwinkle 20s linear infinite' }}></div>
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(1px 1px at 25% 15%, var(--color-theme-accent) 100%, transparent), radial-gradient(1.5px 1.5px at 55% 75%, #fff 100%, transparent), radial-gradient(2px 2px at 90% 10%, var(--color-theme-accent) 100%, transparent)', backgroundSize: '130px 130px', animation: 'starsTwinkle 15s linear infinite reverse' }}></div>
            
            <motion.div 
              className="text-[150px] md:text-[250px] cursor-pointer drop-shadow-[0_0_60px_var(--color-theme-accent)] select-none hover:scale-110 transition-transform z-10"
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

      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 md:left-8 right-4 md:right-8 flex items-center justify-between z-50 pointer-events-none">
        <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
          {!isZenLock && (
            <>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-slate-500 hover:text-theme-text transition-colors p-2 bg-theme-card rounded-full shadow-sm"
                title="Свернуть"
              >
                <span className="material-symbols-outlined text-xl">
                  close_fullscreen
                </span>
              </button>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-theme-text transition-colors p-2 bg-theme-card rounded-full shadow-sm"
              >
                <span className="material-symbols-outlined text-xl md:text-3xl">close</span>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-6 pointer-events-auto">
          {isDimoon && (
            <button 
              onClick={() => setIsEasterEgg(true)}
              className="text-theme-accent/50 hover:text-theme-accent transition-colors p-2 rounded-full hover:bg-theme-accent/10 bg-theme-card/50 backdrop-blur-sm"
              title="Посмотреть на звезды"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">telescope</span>
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowAudioPlayer(!showAudioPlayer)}
              className={`text-slate-400 hover:text-white transition-colors p-2 rounded-full bg-theme-card/50 backdrop-blur-sm ${Object.values(activeSounds).some((s: any) => s.isPlaying) ? "text-theme-accent bg-theme-accent/10" : ""}`}
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">
                headphones
              </span>
            </button>

          <AnimatePresence>
            {showAudioPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-64 bg-theme-card border border-theme-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-semibold text-theme-text">Атмосфера</span>
                    <button onClick={stopAll} className="text-xs text-theme-muted hover:text-theme-accent transition-colors">Выкл. всё</button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {sounds.map((s) => {
                      const isActive = activeSounds[s.id]?.isPlaying;
                      return (
                        <div key={s.id} className={`p-2 rounded-lg border transition-colors ${isActive ? 'bg-theme-accent/5 border-theme-accent/20' : 'bg-transparent border-transparent'}`}>
                          <button
                            onClick={() => toggleSound(s.id)}
                            className="w-full text-left flex items-center gap-2 mb-2"
                          >
                            <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-theme-accent' : 'text-theme-muted'}`}>
                              {isActive ? "pause_circle" : "play_circle"}
                            </span>
                            <span className={`text-sm ${isActive ? 'text-theme-accent font-medium' : 'text-theme-text'}`}>{s.name}</span>
                          </button>
                          
                          <AnimatePresence>
                            {isActive && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pl-7 pr-2"
                              >
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={activeSounds[s.id]?.volume ?? 0.5}
                                  onChange={(e) => setSoundVolume(s.id, Number(e.target.value))}
                                  className="w-full accent-theme-accent h-1 bg-theme-border rounded-lg appearance-none cursor-pointer"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isZenLock}
            onChange={(e) => setIsZenLock(e.target.checked)}
            className="rounded border-slate-700 bg-slate-800 text-theme-accent focus:ring-theme-accent"
          />
          Строгий режим (Zen Lock)
        </label>
      </div>
      </div>

      <audio
        ref={endAudioRef}
        src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Tibetan_Bowl.ogg"
      />

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
                  setIsActive(true); // start timer automatically
                }
              }}
              placeholder="Дописать функцию сортировки..."
              className="w-full bg-transparent border-b-2 border-theme-accent/50 text-2xl md:text-4xl text-center text-theme-accent placeholder:text-theme-muted outline-none focus:border-theme-accent transition-colors pb-4"
            />
            <p className="text-theme-muted mt-8 text-lg animate-pulse">
              Нажмите Enter, чтобы начать фокус
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
        className={`flex flex-1 w-full h-full max-w-[1600px] mx-auto gap-8 ${task?.summary ? "flex-row" : "items-center justify-center"}`}
      >
        {/* Timer Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col items-center justify-center ${task?.summary ? "w-1/2" : "max-w-2xl w-full"}`}
        >
          <div className="flex flex-wrap items-center justify-center p-1 bg-theme-bg/50 backdrop-blur-md rounded-full border border-theme-border/50 shadow-sm mx-auto w-fit mb-6">
            <button
              onClick={() => handleModeChange('focus')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${sessionMode === 'focus' ? 'bg-theme-accent text-white' : 'text-slate-400 hover:text-theme-text'}`}
              title="Фокус"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>Фокус
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${sessionMode === 'shortBreak' ? 'bg-theme-success text-white' : 'text-slate-400 hover:text-theme-text'}`}
              title="Короткий перерыв (5 мин)"
            >
              <span className="material-symbols-outlined text-[18px]">local_cafe</span>5м
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${sessionMode === 'longBreak' ? 'bg-theme-success text-white' : 'text-slate-400 hover:text-theme-text'}`}
              title="Длинный перерыв (15 мин)"
            >
              <span className="material-symbols-outlined text-[18px]">weekend</span>15м
            </button>
            <button
              onClick={() => handleModeChange('test')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${sessionMode === 'test' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-theme-text'}`}
              title="Демо-тест (10 сек)"
            >
              <span className="material-symbols-outlined text-[18px]">bug_report</span>Тест
            </button>
          </div>

          <div
            className={`mb-8 text-center transition-opacity duration-1000 ${isIdle && isActive ? "opacity-20" : "opacity-100"}`}
          >
            <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-2">
              {task ? task.title : "Свободная сессия"}
            </h1>
            {task?.description && (
              <p className="text-slate-400">{task.description}</p>
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
              height={radius * 2}
              width={radius * 2}
              className={`origin-center drop-shadow-[0_0_15px_rgba(var(--color-theme-accent),0.3)] ${isActive && totalTime - timeLeft < 60 && !isOvertime ? "animate-breathe" : "rotate-[-90deg]"}`}
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
                className="transition-all duration-1000 ease-linear drop-shadow-[0_0_20px_rgba(var(--color-theme-accent),0.5)]"
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
                        if (m > 1440) m = 1440; // cap at 24 hours
                        if (m === 3120) m = 30; // user requested fix for 3120 turning into 30
                        setTimeLeft(m * 60);
                        setTotalTime(m * 60);
                      }
                      setIsEditingTime(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        let m = parseInt(timeInput, 10);
                        if (!isNaN(m) && m > 0) {
                          if (m > 1440) m = 1440;
                          if (m === 3120) m = 30; // user requested fix
                          setTimeLeft(m * 60);
                          setTotalTime(m * 60);
                        }
                        setIsEditingTime(false);
                      } else if (e.key === "Escape") {
                        setIsEditingTime(false);
                      }
                    }}
                    className="text-[64px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto text-theme-accent bg-transparent border-none outline-none text-center w-full max-w-[240px] px-0 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                ) : (
                  <div
                    className="text-[64px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto text-theme-text hover:text-theme-accent transition-colors cursor-pointer"
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
                  className={`text-[64px] md:text-[84px] font-mono font-bold leading-none tracking-tighter tabular-nums pointer-events-auto transition-colors duration-1000 ${isOvertime ? "text-theme-success drop-shadow-lg" : "text-theme-text"}`}
                >
                  {isOvertime && "+"}
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </div>
              )}
            </div>

            {!isActive && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto items-center pb-4 pt-4">
                {isEditingPresets ? (
                  <div className="flex items-center gap-2 bg-theme-card border border-theme-border rounded-lg px-2 py-1">
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
                      className="bg-transparent border-none outline-none text-sm text-theme-text w-32 placeholder:text-theme-muted"
                      placeholder="15, 25, 30..."
                    />
                  </div>
                ) : (
                  <>
                    {presets.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setTimeLeft(m * 60);
                          setTotalTime(m * 60);
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
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={toggleTimer}
              className={`btn-tactile w-20 h-20 ${isOvertime && sessionMode === 'focus' ? 'bg-theme-success hover:bg-theme-success/90' : 'bg-theme-accent hover:bg-theme-accent/90'} text-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]`}
            >
              <span className="material-symbols-outlined text-4xl">
                {isActive ? "pause" : (isDimoon ? "rocket_launch" : "play_arrow")}
              </span>
            </button>

            <button
              onClick={resetTimer}
              className="btn-tactile w-14 h-14 bg-theme-card border border-theme-border hover:bg-[#20242B] text-slate-400 rounded-full flex items-center justify-center"
            >
              <span className="material-symbols-outlined">{isDimoon ? "stars" : "restart_alt"}</span>
            </button>
          </div>

          <AnimatePresence>
            {isOvertime && !isActive && (
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
              <p className="text-xs text-slate-600 mt-2">
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
            className="w-1/2 h-full flex flex-col justify-center pt-24 pb-12 pr-12"
          >
            <div className="bg-theme-card border border-theme-border rounded-3xl p-8 h-full max-h-[800px] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-theme-card pb-6 mb-6 border-b border-theme-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
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
              <div className="prose prose-invert prose-slate prose-p:text-slate-300 max-w-none whitespace-pre-wrap leading-relaxed">
                {task.summary}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {pendingMode && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-theme-card border border-theme-border p-6 rounded-2xl shadow-2xl max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-theme-text mb-2">Сменить режим?</h3>
              <p className="text-theme-muted mb-6">
                Текущий прогресс таймера будет сброшен. Вы уверены?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setPendingMode(null)}
                  className="px-4 py-2 rounded-xl text-theme-muted hover:text-theme-text hover:bg-theme-bg transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => applyModeChange(pendingMode)}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 font-medium transition-colors"
                >
                  Сбросить и сменить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
