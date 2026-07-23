import re

with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

# 1. Update sounds list
new_sounds = """export const sounds = [
  { id: 'white', name: 'Белый шум', type: 'synth', category: 'Шумы' },
  { id: 'pink', name: 'Розовый шум', type: 'synth', category: 'Шумы' },
  { id: 'brown', name: 'Коричневый шум', type: 'synth', category: 'Шумы' },
  { id: 'space', name: 'Шум внутри МКС', type: 'synth', category: 'Шумы' },
  
  { id: 'rain', name: 'Шум дождя', type: 'synth', category: 'Природа' },
  { id: 'sea', name: 'Море', type: 'synth', category: 'Природа' },

  { id: 'custom_1', name: 'Мой трек 1', type: 'file', url: '/track1.mp3', category: 'Моя Музыка', warning: 'Загрузите track1.mp3 в папку public/ через панель файлов.' },
  { id: 'custom_2', name: 'Мой трек 2', type: 'file', url: '/track2.mp3', category: 'Моя Музыка', warning: 'Загрузите track2.mp3 в папку public/ через панель файлов.' },
  { id: 'custom_3', name: 'Мой трек 3', type: 'file', url: '/track3.mp3', category: 'Моя Музыка', warning: 'Загрузите track3.mp3 в папку public/ через панель файлов.' },

  { id: 'minecraft', name: 'Minecraft (Генеративная)', type: 'synth', category: 'Музыка' },
  
  { id: 'freq_852', name: '852 Hz (Пробуждение интуиции)', type: 'synth', category: 'Частоты' },
  { id: 'freq_2675', name: '2675 Hz (Резонанс кристалла)', type: 'synth', category: 'Частоты' },
  { id: 'freq_5208', name: '5208 Hz (Восстановление)', type: 'synth', category: 'Частоты' },
  { id: 'freq_8000', name: '8000 Hz (Высокая частота)', type: 'synth', category: 'Частоты' },
  { id: 'bass_sweep', name: 'Bass Sweep (20-200Hz)', type: 'synth', category: 'Частоты', warning: 'Плавный бас. Рекомендуется слушать на комфортной громкости.' },
  { id: 'full_sweep', name: 'Полный Спектр (0-20kHz)', type: 'synth', category: 'Частоты', warning: 'Внимание: Данный сигнал содержит экстремальные частоты от 0 до 20000 Hz. Убавьте громкость во избежание повреждения слуха или оборудования.' }
];"""

content = re.sub(r"export const sounds = \[[^\]]*\];", new_sounds, content, flags=re.MULTILINE)

# 2. Update toggleSound to pass options
old_play = "engine.play(soundId, current.volume, { waveform: current.waveform });"
new_play = """const soundDef = sounds.find(s => s.id === soundId);
        engine.play(soundId, current.volume, { waveform: current.waveform, type: soundDef?.type, url: (soundDef as any)?.url });"""
content = content.replace(old_play, new_play)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
