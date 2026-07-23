import re

with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

new_sounds = """export const sounds = [
  { id: 'white', name: 'Белый шум', type: 'synth', category: 'Шумы' },
  { id: 'pink', name: 'Розовый шум', type: 'synth', category: 'Шумы' },
  { id: 'brown', name: 'Коричневый шум', type: 'synth', category: 'Шумы' },
  { id: 'space', name: 'Шум внутри МКС', type: 'synth', category: 'Шумы' },
  
  { id: 'rain', name: 'Шум дождя', type: 'synth', category: 'Природа' },
  { id: 'sea', name: 'Море', type: 'synth', category: 'Природа' },
  { id: 'cuckoo', name: 'Кукушка', type: 'file', url: '/Кукушка.mp3', category: 'Природа' },
  { id: 'birds_mountain', name: 'Песни птиц в горах', type: 'file', url: '/Песни птиц в горах.mp3', category: 'Природа' },
  { id: 'nightingale', name: 'Соловей', type: 'file', url: '/Соловей.mp3', category: 'Природа' },
  { id: 'morning_birds', name: 'Утренние песни птиц', type: 'file', url: '/Утренние песни птиц.mp3', category: 'Природа' },

  { id: 'minecraft', name: 'Minecraft (Генеративная)', type: 'synth', category: 'Музыка' },
  { id: 'mc_aria_math', name: 'Aria Math', type: 'file', url: '/майнкрафт - Aria Math.mp3', category: 'Музыка' },
  { id: 'mc_moog_city', name: 'Moog City', type: 'file', url: '/майнкрафт - C418-Moog-City.mp3', category: 'Музыка' },
  
  { id: 'freq_852', name: '852 Hz (Пробуждение интуиции)', type: 'synth', category: 'Частоты' },
  { id: 'freq_2675', name: '2675 Hz (Резонанс кристалла)', type: 'synth', category: 'Частоты' },
  { id: 'freq_5208', name: '5208 Hz (Восстановление)', type: 'synth', category: 'Частоты' },
  { id: 'freq_8000', name: '8000 Hz (Высокая частота)', type: 'synth', category: 'Частоты' },
  { id: 'bass_sweep', name: 'Bass Sweep (20-200Hz)', type: 'synth', category: 'Частоты', warning: 'Плавный бас. Рекомендуется слушать на комфортной громкости.' },
  { id: 'full_sweep', name: 'Полный Спектр (0-20kHz)', type: 'synth', category: 'Частоты', warning: 'Внимание: Данный сигнал содержит экстремальные частоты от 0 до 20000 Hz. Убавьте громкость во избежание повреждения слуха или оборудования.' }
];"""

content = re.sub(r"export const sounds = \[[^\]]*\];", new_sounds, content, flags=re.MULTILINE)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
