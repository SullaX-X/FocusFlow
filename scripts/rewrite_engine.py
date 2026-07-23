import re
with open('src/AudioContext.tsx', 'r') as f:
    content = f.read()

# We need to rewrite AudioEngine's play method.
# Let's find play(id: string, volume: number) and replace it
old_play = """  play(id: string, volume: number) {
    this.init();
    if (!this.ctx) return;
    
    // Stop if already playing
    this.stop(id);

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.ctx.destination);

    let source;
    let extraNodes: AudioNode[] = [];"""

new_play = """  play(id: string, volume: number, options?: any) {
    this.init();
    if (!this.ctx) return;
    
    // Stop if already playing
    this.stop(id);

    const gainNode = this.ctx.createGain();
    // Fade in to avoid clicks
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.0);
    gainNode.connect(this.ctx.destination);

    let source;
    let extraNodes: AudioNode[] = [];
    
    if (id.startsWith('freq_')) {
      const freq = parseInt(id.split('_')[1]);
      source = this.ctx.createOscillator();
      source.type = 'sine';
      source.frequency.value = freq;
      source.connect(gainNode);
      source.start();
      this.nodes[id] = { source, gain: gainNode, extra: extraNodes };
      return;
    } else if (id === 'bass_sweep') {
      source = this.ctx.createOscillator();
      source.type = 'sine';
      source.frequency.value = 110; // Base freq
      
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1 / 15; // 15 seconds cycle (slow up and down)
      
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 90; // sweeps from 20 to 200 Hz
      
      lfo.connect(lfoGain);
      lfoGain.connect(source.frequency);
      
      source.connect(gainNode);
      source.start();
      lfo.start();
      
      this.nodes[id] = { source, gain: gainNode, extra: [lfo, lfoGain] };
      return;
    } else if (id === 'full_sweep') {
      source = this.ctx.createOscillator();
      source.type = (options && options.waveform) ? options.waveform : 'sine';
      source.frequency.value = 10000;
      
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1 / 20; // 20s cycle
      
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 10000; // sweeps 0 to 20k
      
      lfo.connect(lfoGain);
      lfoGain.connect(source.frequency);
      
      source.connect(gainNode);
      source.start();
      lfo.start();
      
      this.nodes[id] = { source, gain: gainNode, extra: [lfo, lfoGain] };
      return;
    }"""

content = content.replace(old_play, new_play)

# Add setWaveform
set_vol = """  setVolume(id: string, volume: number) {"""
set_wave = """  setWaveform(id: string, waveform: OscillatorType) {
    if (this.nodes[id] && this.nodes[id].source instanceof OscillatorNode) {
      (this.nodes[id].source as OscillatorNode).type = waveform;
    }
  }
  
  setVolume(id: string, volume: number) {"""
content = content.replace(set_vol, set_wave)

# update stop to fade out
old_stop = """  stop(id: string) {
    if (this.nodes[id]) {
      try {
        if (this.nodes[id].source) (this.nodes[id].source as any).stop();"""

new_stop = """  stop(id: string) {
    if (this.nodes[id]) {
      const node = this.nodes[id];
      delete this.nodes[id]; // prevent double stop
      try {
        if (this.ctx) {
          node.gain.gain.cancelScheduledValues(this.ctx.currentTime);
          node.gain.gain.setValueAtTime(node.gain.gain.value, this.ctx.currentTime);
          node.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
        }
        
        setTimeout(() => {
          try {
            if (node.source) (node.source as any).stop();
            if (node.stopFn) node.stopFn!();
            if (node.intervals) {
               node.intervals!.forEach((i: any) => clearTimeout(i));
            }
            if (node.extra) {
              node.extra!.forEach((n: any) => {
                if (n instanceof OscillatorNode) n.stop();
                n.disconnect();
              });
            }
            node.gain.disconnect();
          } catch(e) {}
        }, 1000);
      } catch (e) {}
    }
  }
  
  _old_stop(id: string) {"""
content = content.replace(old_stop, new_stop)

with open('src/AudioContext.tsx', 'w') as f:
    f.write(content)
