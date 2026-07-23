import fs from 'fs';

const file = 'src/AudioContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const toggleSound = (soundId: string) => {
    setActiveSounds(prev => {
      const current = prev[soundId] || { volume: 0.5, isPlaying: false, waveform: 'sine' };
      const newIsPlaying = !current.isPlaying;
      if (newIsPlaying) {
        const soundDef = sounds.find(s => s.id === soundId);
        engine.play(soundId, current.volume, { waveform: current.waveform, type: soundDef?.type, url: (soundDef as any)?.url });
      } else {
        engine.stop(soundId);
      }
      return {
        ...prev,
        [soundId]: {
          ...current,
          isPlaying: newIsPlaying
        }
      };
    });
  };`;

const replacement = `  const toggleSound = (soundId: string) => {
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
  };`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target!");
}
