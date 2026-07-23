import re

with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

sounds_replacement = """export const sounds = [
  { id: 'white', name: 'Белый шум', type: 'synth', category: 'Шумы' },
  { id: 'pink', name: 'Розовый шум', type: 'synth', category: 'Шумы' },
  { id: 'brown', name: 'Коричневый шум', type: 'synth', category: 'Шумы' },
  { id: 'space', name: 'Шум внутри МКС', type: 'synth', category: 'Шумы' },
  
  { id: 'rain', name: 'Шум дождя', type: 'synth', category: 'Природа' },
  { id: 'sea', name: 'Море', type: 'synth', category: 'Природа' },
  { id: 'river', name: 'Река', type: 'synth', category: 'Природа' },
  { id: 'birds', name: 'Пение птиц', type: 'synth', category: 'Природа' },
  
  { id: 'minecraft', name: 'Minecraft (Генеративная)', type: 'synth', category: 'Музыка' },
  { id: 'river_piano', name: 'Река и фортепиано', type: 'synth', category: 'Музыка' },
  { id: 'tibetan_birds', name: 'Тибетская флейта и птицы', type: 'synth', category: 'Музыка' },
  { id: 'sea_piano_flute', name: 'Море, фортепиано и флейта', type: 'synth', category: 'Музыка' },
  
  { id: 'freq_852', name: '852 Hz (Пробуждение интуиции)', type: 'synth', category: 'Частоты' },
  { id: 'freq_2675', name: '2675 Hz (Резонанс кристалла)', type: 'synth', category: 'Частоты' },
  { id: 'freq_5208', name: '5208 Hz (Восстановление)', type: 'synth', category: 'Частоты' },
  { id: 'freq_8000', name: '8000 Hz (Высокая частота)', type: 'synth', category: 'Частоты' },
  { id: 'bass_sweep', name: 'Bass Sweep (20-200Hz)', type: 'synth', category: 'Частоты', warning: 'Плавный бас. Рекомендуется слушать на комфортной громкости.' },
  { id: 'full_sweep', name: 'Полный Спектр (0-20kHz)', type: 'synth', category: 'Частоты', warning: 'Внимание: Данный сигнал содержит экстремальные частоты от 0 до 20000 Hz. Убавьте громкость во избежание повреждения слуха или оборудования.' }
];"""

content = re.sub(r"export const sounds = \[[^\]]*\];", sounds_replacement, content, flags=re.MULTILINE)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
