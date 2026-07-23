import re

with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

# Update context type
content = content.replace(
    '  activeSounds: Record<string, { volume: number, isPlaying: boolean }>;',
    '  activeSounds: Record<string, { volume: number, isPlaying: boolean, waveform?: string }>;\n  setSoundWaveform: (id: string, waveform: string) => void;'
)

# Update sounds array
sounds_replacement = """export const sounds = [
  { id: 'white', name: 'Белый шум', type: 'synth' },
  { id: 'pink', name: 'Розовый шум', type: 'synth' },
  { id: 'brown', name: 'Коричневый шум', type: 'synth' },
  { id: 'rain', name: 'Шум дождя', type: 'synth' },
  { id: 'space', name: 'Шум внутри МКС', type: 'synth' },
  { id: 'minecraft', name: 'Minecraft (Генеративная)', type: 'synth' },
  { id: 'freq_852', name: '852 Hz (Пробуждение интуиции)', type: 'synth' },
  { id: 'freq_2675', name: '2675 Hz (Резонанс кристалла)', type: 'synth' },
  { id: 'freq_5208', name: '5208 Hz (Восстановление)', type: 'synth' },
  { id: 'freq_8000', name: '8000 Hz (Высокая частота)', type: 'synth' },
  { id: 'bass_sweep', name: 'Bass Sweep (20-200Hz)', type: 'synth', warning: 'Плавный бас. Рекомендуется слушать на комфортной громкости.' },
  { id: 'full_sweep', name: 'Полный Спектр (0-20kHz)', type: 'synth', warning: 'Внимание: Данный сигнал содержит экстремальные частоты от 0 до 20000 Hz. Убавьте громкость во избежание повреждения слуха или оборудования.' }
];"""

content = re.sub(r"export const sounds = \[[^\]]*\];", sounds_replacement, content, flags=re.MULTILINE)

# Update AudioEngine
play_def = "play(id: string, volume: number, options?: any) {\n    this.init();\n    if (!this.ctx) return;\n    \n    this.stop(id);\n    \n    const gainNode = this.ctx.createGain();\n    gainNode.gain.value = 0;\n    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.5);\n    gainNode.connect(this.ctx.destination);\n    \n    let source;\n    let extraNodes: AudioNode[] = [];\n\n    if (id.startswith('freq_')) {"

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
