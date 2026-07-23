import fs from 'fs';
let content = fs.readFileSync('src/AudioContext.tsx', 'utf8');

const newSounds = `export interface SoundOption {
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
  { id: 'morning_birds', name: 'Утренние песни птиц', type: 'file', url: 'assets/Morning%20bird%20songs.mp3', category: 'Природа', dustRequired: 600 },
  { id: 'nightingale', name: 'Соловей', type: 'file', url: 'assets/Nightingale.mp3', category: 'Природа', dustRequired: 800 },
  { id: 'birds_mountain', name: 'Песни птиц в горах', type: 'file', url: 'assets/Bird%20songs%20in%20the%20mountains.mp3', category: 'Природа', dustRequired: 1000 },
  { id: 'cuckoo', name: 'Кукушка', type: 'file', url: 'assets/cuckoo.mp3', category: 'Природа', dustRequired: 1500 },

  { id: 'minecraft', name: 'Minecraft (Генеративная)', type: 'synth', category: 'Музыка', dustRequired: 500 },
  { id: 'river_piano', name: 'Река и фортепиано', type: 'synth', category: 'Музыка', dustRequired: 1200 },
  { id: 'sea_piano_flute', name: 'Море, фортепиано и флейта', type: 'synth', category: 'Музыка', dustRequired: 2000 },
  { id: 'mc_aria_math', name: 'Aria Math', type: 'file', url: 'assets/minecraft%20-%20Aria%20Math.mp3', category: 'Музыка', dustRequired: 3000 },
  { id: 'mc_moog_city', name: 'Moog City', type: 'file', url: 'assets/minecraft%20-%20C418-Moog-City.mp3', category: 'Музыка', dustRequired: 5000 },
  
  { id: 'freq_852', name: '852 Hz (Интуиция)', type: 'synth', category: 'Частоты' },
  { id: 'freq_5208', name: '5208 Hz (Восстановление)', type: 'synth', category: 'Частоты' },
  { id: 'freq_2675', name: '2675 Hz (Резонанс)', type: 'synth', category: 'Частоты' },
  { id: 'freq_8000', name: '8000 Hz (Высокая)', type: 'synth', category: 'Частоты' },
  { id: 'bass_sweep', name: 'Deep Bass Sweep (20-200Hz)', type: 'synth', category: 'Частоты', warning: 'Внимание: Низкие частоты (20-200Гц). Используйте качественные наушники. Начните с минимальной громкости.', dustRequired: 10000 },
  { id: 'full_sweep', name: 'Full Sweep (0-20kHz)', type: 'synth', category: 'Частоты', warning: 'КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ: Сканирование всего спектра (0-20000Гц). Может вызвать дискомфорт или повреждение оборудования. Установите громкость ниже 10%.', dustRequired: 20000 }
];`;

content = content.replace(/export const sounds = \[[\s\S]*?\];/m, newSounds);

fs.writeFileSync('src/AudioContext.tsx', content);

