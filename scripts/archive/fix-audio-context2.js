import fs from 'fs';

const file = 'src/AudioContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  const setSoundWaveform = (soundId: string, waveform: string) => {
    setActiveSounds(prev => {
      const current = prev[soundId] || { volume: 0.5, isPlaying: false, waveform: 'sine' };
      if (current.isPlaying) {
        engine.setWaveform(soundId, waveform as any);
      }
      return {
        ...prev,
        [soundId]: {
          ...current,
          waveform
        }
      };
    });
  };`;

const replacement1 = `  const setSoundWaveform = (soundId: string, waveform: string) => {
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
  };`;

const target2 = `  const setSoundVolume = (soundId: string, volume: number) => {
    setActiveSounds(prev => {
      const current = prev[soundId] || { volume: 0.5, isPlaying: false };
      if (current.isPlaying) {
        engine.setVolume(soundId, volume);
      }
      return {
        ...prev,
        [soundId]: {
          ...current,
          volume
        }
      };
    });
  };`;

const replacement2 = `  const setSoundVolume = (soundId: string, volume: number) => {
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
  };`;

if (content.includes(target1)) content = content.replace(target1, replacement1);
if (content.includes(target2)) content = content.replace(target2, replacement2);

fs.writeFileSync(file, content);
console.log("Replaced successfully.");
