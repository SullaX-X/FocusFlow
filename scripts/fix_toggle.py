import re
with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

# Update toggleSound
old_toggle = """  const toggleSound = (soundId: string) => {
    setActiveSounds(prev => {
      const current = prev[soundId] || { volume: 0.5, isPlaying: false };
      const newIsPlaying = !current.isPlaying;
      
      if (newIsPlaying) {
        engine.play(soundId, current.volume);
      } else {
        engine.stop(soundId);
      }"""

new_toggle = """  const toggleSound = (soundId: string) => {
    setActiveSounds(prev => {
      const current = prev[soundId] || { volume: 0.5, isPlaying: false, waveform: 'sine' };
      const newIsPlaying = !current.isPlaying;
      
      if (newIsPlaying) {
        engine.play(soundId, current.volume, { waveform: current.waveform });
      } else {
        engine.stop(soundId);
      }"""

content = content.replace(old_toggle, new_toggle)

# add setSoundWaveform function
set_vol = """  const setSoundVolume = (soundId: string, volume: number) => {"""
set_wave = """  const setSoundWaveform = (soundId: string, waveform: string) => {
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
  };

  const setSoundVolume = (soundId: string, volume: number) => {"""

content = content.replace(set_vol, set_wave)

# update Provider values
old_prov = """<AudioContext.Provider value={{ activeSounds, toggleSound, setSoundVolume, stopAll }}>"""
new_prov = """<AudioContext.Provider value={{ activeSounds, toggleSound, setSoundVolume, setSoundWaveform, stopAll }}>"""
content = content.replace(old_prov, new_prov)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
