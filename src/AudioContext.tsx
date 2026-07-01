import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface AudioContextType {
  activeSounds: Record<string, { volume: number, isPlaying: boolean }>;
  toggleSound: (soundId: string) => void;
  setSoundVolume: (soundId: string, volume: number) => void;
  stopAll: () => void;
}

const AudioContext = createContext<AudioContextType>({
  activeSounds: {},
  toggleSound: () => {},
  setSoundVolume: () => {},
  stopAll: () => {},
});

export const useGlobalAudio = () => useContext(AudioContext);

export const sounds = [
  { id: 'white', name: 'Белый шум', type: 'synth' },
  { id: 'pink', name: 'Розовый шум', type: 'synth' },
  { id: 'brown', name: 'Коричневый шум', type: 'synth' },
  { id: 'rain', name: 'Шум дождя', type: 'synth' },
  { id: 'space', name: 'Шум внутри МКС', type: 'synth' }
];

// Synth Engine
class AudioEngine {
  ctx: AudioContext | null = null;
  nodes: Record<string, { source: AudioBufferSourceNode | OscillatorNode, gain: GainNode, extra?: AudioNode[] }> = {};

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  createNoiseBuffer(type: 'white' | 'pink' | 'brown' | 'rain' | 'space') {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
    
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      if (type === 'white') {
        output[i] = white * 0.1;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
        b6 = white * 0.115926;
      } else { // brown / rain / space
        b0 = (b0 + (0.02 * white)) / 1.02;
        output[i] = b0 * 0.1;
      }
    }
    return buffer;
  }

  play(id: string, volume: number) {
    this.init();
    if (!this.ctx) return;
    
    // Stop if already playing
    this.stop(id);

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.ctx.destination);

    let source;
    let extraNodes: AudioNode[] = [];

    if (id === 'space') {
      // Space rumble = heavily lowpassed brown noise + subtle low sine
      const buffer = this.createNoiseBuffer('brown');
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 100;
      
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60;
      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.5;
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();

      source.connect(filter);
      filter.connect(gainNode);
      
      extraNodes = [filter, osc, oscGain];
    } else if (id === 'rain') {
      // Rain = pink noise with lowpass + LFO on gain for wind effect
      const buffer = this.createNoiseBuffer('pink');
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      source.connect(filter);
      filter.connect(gainNode);
      extraNodes = [filter];
    } else {
      // Standard noises
      const buffer = this.createNoiseBuffer(id as any);
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;
      source.connect(gainNode);
    }

    source.start();
    this.nodes[id] = { source, gain: gainNode, extra: extraNodes };
  }

  setVolume(id: string, volume: number) {
    if (this.nodes[id]) {
      this.nodes[id].gain.gain.linearRampToValueAtTime(volume, this.ctx!.currentTime + 0.1);
    }
  }

  stop(id: string) {
    if (this.nodes[id]) {
      try {
        this.nodes[id].source.stop();
        if (this.nodes[id].extra) {
          this.nodes[id].extra!.forEach(n => {
            if (n instanceof OscillatorNode) n.stop();
            n.disconnect();
          });
        }
        this.nodes[id].gain.disconnect();
      } catch (e) {}
      delete this.nodes[id];
    }
  }
  
  stopAll() {
    Object.keys(this.nodes).forEach(id => this.stop(id));
  }
}

const engine = new AudioEngine();

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeSounds, setActiveSounds] = useState<Record<string, { volume: number, isPlaying: boolean }>>({});

  const toggleSound = (soundId: string) => {
    setActiveSounds(prev => {
      const current = prev[soundId] || { volume: 0.5, isPlaying: false };
      const newIsPlaying = !current.isPlaying;
      
      if (newIsPlaying) {
        engine.play(soundId, current.volume);
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
  };

  const setSoundVolume = (soundId: string, volume: number) => {
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
    <AudioContext.Provider value={{ activeSounds, toggleSound, setSoundVolume, stopAll }}>
      {children}
    </AudioContext.Provider>
  );
}
