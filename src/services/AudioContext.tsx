import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
interface AudioContextType {
  activeSounds: Record<string, { volume: number, isPlaying: boolean, waveform?: string }>;
  setSoundWaveform: (id: string, waveform: string) => void;
  toggleSound: (soundId: string) => void;
  setSoundVolume: (soundId: string, volume: number) => void;
  stopAll: () => void;
}
const AudioContext = createContext<AudioContextType>({
  activeSounds: {},
  setSoundWaveform: () => {},
  toggleSound: () => {},
  setSoundVolume: () => {},
  stopAll: () => {},
});
export const useGlobalAudio = () => useContext(AudioContext);
export interface SoundOption {
  id: string;
  name: string;
  type: 'synth' | 'file';
  category: string;
  url?: string;
  warning?: string;
  dustRequired?: number;
}

export const sounds: SoundOption[] = [
  { id: 'white', name: 'Белый шум', type: 'synth', category: 'Шумы' },
  { id: 'pink', name: 'Розовый шум', type: 'synth', category: 'Шумы' },
  { id: 'brown', name: 'Коричневый шум', type: 'synth', category: 'Шумы' },
  { id: 'space', name: 'Шум внутри МКС', type: 'synth', category: 'Шумы', dustRequired: 200 },
  
  { id: 'rain', name: 'Шум дождя', type: 'synth', category: 'Природа' },
  { id: 'sea', name: 'Море', type: 'synth', category: 'Природа' },
  { id: 'birds', name: 'Пение птиц', type: 'synth', category: 'Природа' },
  { id: 'tibetan_birds', name: 'Тибетская флейта и птицы', type: 'synth', category: 'Природа', dustRequired: 400 },
  { id: 'morning_birds', name: 'Утренние песни птиц', type: 'file', url: '/assets/audio/Morning bird songs.mp3', category: 'Природа', dustRequired: 600 },
  { id: 'nightingale', name: 'Соловей', type: 'file', url: '/assets/audio/cuckoo.mp3', category: 'Природа', dustRequired: 800 },
  { id: 'birds_mountain', name: 'Песни птиц в горах', type: 'file', url: '/assets/audio/Bird songs in the mountains.mp3', category: 'Природа', dustRequired: 1000 },
  { id: 'cuckoo', name: 'Кукушка', type: 'file', url: '/assets/audio/Nightingale.mp3', category: 'Природа', dustRequired: 1500 },
  { id: 'minecraft', name: 'Minecraft (Генеративная)', type: 'synth', category: 'Музыка', dustRequired: 500 },
  { id: 'river_piano', name: 'Река и фортепиано', type: 'synth', category: 'Музыка', dustRequired: 1200 },
  { id: 'sea_piano_flute', name: 'Море, фортепиано и флейта', type: 'synth', category: 'Музыка', dustRequired: 2000 },
  { id: 'mc_aria_math', name: 'Aria Math', type: 'file', url: '/assets/audio/minecraft - Aria Math.mp3', category: 'Музыка', dustRequired: 3000 },
  { id: 'mc_moog_city', name: 'Moog City', type: 'file', url: '/assets/audio/minecraft - C418-Moog-City.mp3', category: 'Музыка', dustRequired: 5000 },
  
  { id: 'freq_852', name: '852 Hz (Интуиция)', type: 'synth', category: 'Частоты' },
  { id: 'freq_5208', name: '5208 Hz (Восстановление)', type: 'synth', category: 'Частоты' },
  { id: 'freq_2675', name: '2675 Hz (Резонанс)', type: 'synth', category: 'Частоты' },
  { id: 'freq_8000', name: '8000 Hz (Высокая)', type: 'synth', category: 'Частоты' },
  { id: 'bass_sweep', name: 'Deep Bass Sweep (20-200Hz)', type: 'synth', category: 'Частоты', warning: 'Внимание: Низкие частоты (20-200Гц). Используйте качественные наушники. Начните с минимальной громкости.', dustRequired: 10000 },
  { id: 'full_sweep', name: 'Full Sweep (0-20kHz)', type: 'synth', category: 'Частоты', warning: 'КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ: Сканирование всего спектра (0-20000Гц). Может вызвать дискомфорт или повреждение оборудования. Установите громкость ниже 10%.', dustRequired: 20000 }
];
// Synth Engine
import { AudioEngine } from "../services/AudioEngine";
const engine = new AudioEngine();
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeSounds, setActiveSounds] = useState<Record<string, { volume: number, isPlaying: boolean, waveform?: string }>>({});
  const toggleSound = (soundId: string) => {
    const current = activeSounds[soundId] || { volume: 0.5, isPlaying: false, waveform: 'sine' };
    const newIsPlaying = !current.isPlaying;
    
    if (newIsPlaying) {
      const soundDef = sounds.find(s => s.id === soundId);
      engine.play(soundId, current.volume, { waveform: current.waveform, type: soundDef?.type, url: (soundDef as any)?.url });
    } else {
      engine.stop(soundId);
    }
    
    setActiveSounds(prev => ({
      ...prev,
      [soundId]: {
        ...(prev[soundId] || { volume: 0.5, isPlaying: false, waveform: 'sine' }),
        isPlaying: newIsPlaying
      }
    }));
  };
  const setSoundWaveform = (soundId: string, waveform: string) => {
    const current = activeSounds[soundId] || { volume: 0.5, isPlaying: false, waveform: 'sine' };
    if (current.isPlaying) {
      engine.setWaveform(soundId, waveform as any);
    }
    setActiveSounds(prev => ({
      ...prev,
      [soundId]: {
        ...(prev[soundId] || { volume: 0.5, isPlaying: false, waveform: 'sine' }),
        waveform
      }
    }));
  };
  const setSoundVolume = (soundId: string, volume: number) => {
    const current = activeSounds[soundId] || { volume: 0.5, isPlaying: false };
    if (current.isPlaying) {
      engine.setVolume(soundId, volume);
    }
    setActiveSounds(prev => ({
      ...prev,
      [soundId]: {
        ...(prev[soundId] || { volume: 0.5, isPlaying: false }),
        volume
      }
    }));
  };
  const stopAll = () => {
    engine.stopAll();
    setActiveSounds(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key].isPlaying = false;
      });
      return newState;
    });
  };
  return (
    <AudioContext.Provider value={{ activeSounds, toggleSound, setSoundVolume, setSoundWaveform, stopAll }}>
      {children}
    </AudioContext.Provider>
  );
}
