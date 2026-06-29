import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';
import confetti from 'canvas-confetti';

export default function FocusMode({ task, onClose }: { task: Task | null, onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins by default
  const [isActive, setIsActive] = useState(false);
  const [isZenLock, setIsZenLock] = useState(false);
  const [surrenderProgress, setSurrenderProgress] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const surrenderIntervalRef = useRef<number | null>(null);

  const sounds = [
    { id: 'lofi', name: 'Lo-Fi Beats', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { id: 'rain', name: 'Шум дождя', url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_82c2a969ea.mp3' },
    { id: 'brown', name: 'Коричневый шум', url: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_2448375c87.mp3' },
  ];

  useEffect(() => {
    if (activeSound) {
      const sound = sounds.find(s => s.id === activeSound);
      if (sound && audioRef.current) {
        audioRef.current.src = sound.url;
        audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [activeSound]);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Request Fullscreen on Zen Lock
  useEffect(() => {
    if (isZenLock) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [isZenLock]);

  if (!task) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const handleSurrenderStart = () => {
    if (!isZenLock) {
      onClose();
      return;
    }
    setSurrenderProgress(0);
    surrenderIntervalRef.current = window.setInterval(() => {
      setSurrenderProgress(prev => {
        if (prev >= 100) {
          if (surrenderIntervalRef.current) clearInterval(surrenderIntervalRef.current);
          onClose();
          return 100;
        }
        return prev + 2; // 2% every 100ms = 5 seconds
      });
    }, 100);
  };

  const handleSurrenderEnd = () => {
    if (surrenderIntervalRef.current) {
      clearInterval(surrenderIntervalRef.current);
    }
    if (surrenderProgress < 100) {
      setSurrenderProgress(0); // reset if didn't hold long enough
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F1115] text-[#F5F5F5] z-[100] flex flex-col p-6 overflow-hidden">
      {!isZenLock && (
        <button 
          onClick={onClose}
          className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors p-2 z-50"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      )}

      <div className="absolute top-8 right-8 flex items-center gap-6 z-50">
        <div className="relative">
          <button 
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            className={`text-slate-400 hover:text-white transition-colors p-2 rounded-full ${activeSound ? 'text-blue-400 bg-blue-500/10' : ''}`}
          >
            <span className="material-symbols-outlined text-2xl">headphones</span>
          </button>
          
          <AnimatePresence>
            {showAudioPlayer && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-[#181B20] border border-[#30343D] rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => setActiveSound(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${!activeSound ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-[#20242B]'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">volume_off</span>
                    Тишина
                  </button>
                  {sounds.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => setActiveSound(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeSound === s.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-[#20242B]'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{activeSound === s.id ? 'volume_up' : 'music_note'}</span>
                      {s.name}
                    </button>
                  ))}
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
            className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          Строгий режим (Zen Lock)
        </label>
      </div>

      <audio ref={audioRef} loop />

      <div className={`flex flex-1 w-full h-full max-w-[1600px] mx-auto gap-8 ${task.summary ? 'flex-row' : 'items-center justify-center'}`}>
        {/* Timer Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col items-center justify-center ${task.summary ? 'w-1/2' : 'max-w-2xl w-full'}`}
        >
          <div className="mb-8 text-center">
            <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-lg font-medium uppercase tracking-wider">Фокус</span>
            <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-2">{task.title}</h1>
            {task.description && <p className="text-slate-400">{task.description}</p>}
          </div>

          <div className="text-[120px] md:text-[180px] font-mono font-bold leading-none tracking-tighter tabular-nums mb-12">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={toggleTimer}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-4xl">{isActive ? 'pause' : 'play_arrow'}</span>
            </button>
            
            <button 
              onClick={resetTimer}
              className="w-14 h-14 bg-[#181B20] border border-[#30343D] hover:bg-[#20242B] text-slate-400 rounded-full flex items-center justify-center transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">restart_alt</span>
            </button>
          </div>

          {isZenLock && (
            <div className="mt-20 flex flex-col items-center">
              <button
                onMouseDown={handleSurrenderStart}
                onMouseUp={handleSurrenderEnd}
                onMouseLeave={handleSurrenderEnd}
                onTouchStart={handleSurrenderStart}
                onTouchEnd={handleSurrenderEnd}
                className="text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest text-sm font-bold relative overflow-hidden px-8 py-3 rounded-lg border border-red-500/20"
              >
                <div 
                  className="absolute inset-0 bg-red-500/20 -z-10 transition-all duration-75"
                  style={{ width: `${surrenderProgress}%` }}
                />
                Зажмите, чтобы сдаться
              </button>
              <p className="text-xs text-slate-600 mt-2">Удерживайте 5 секунд для выхода</p>
            </div>
          )}
        </motion.div>

        {/* Summary Section */}
        {task.summary && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-1/2 h-full flex flex-col justify-center pt-24 pb-12 pr-12"
          >
            <div className="bg-[#181B20] border border-[#30343D] rounded-3xl p-8 h-full max-h-[800px] overflow-y-auto shadow-2xl relative">
              <div className="sticky top-0 bg-[#181B20] pb-6 mb-6 border-b border-[#30343D] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Конспект материала</h2>
                  <a href={task.contentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline break-all truncate block max-w-sm">
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
    </div>
  );
}
