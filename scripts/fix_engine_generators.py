import re

with open('src/AudioEngine.ts', 'r') as f:
    content = f.read()

new_cases = """    } else if (id === 'fire') {
      const buffer = this.createNoiseBuffer('brown');
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      source.connect(filter);
      filter.connect(gainNode);
      source.start();
      
      const popOsc = this.ctx.createOscillator();
      popOsc.type = 'square';
      popOsc.frequency.value = 50;
      const popGain = this.ctx.createGain();
      popGain.gain.value = 0;
      popOsc.connect(popGain);
      popGain.connect(gainNode);
      popOsc.start();
      
      const fireInterval = setInterval(() => {
        if (!isPlaying) return;
        if (Math.random() > 0.7) {
          popGain.gain.cancelScheduledValues(this.ctx!.currentTime);
          popGain.gain.setValueAtTime(Math.random() * 0.5, this.ctx!.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.1);
        }
      }, 200);
      intervals.push(fireInterval);
      extraNodes.push(filter, popOsc, popGain);
      
    } else if (id === 'wind') {
      const buffer = this.createNoiseBuffer('pink');
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 600;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      
      source.connect(filter);
      filter.connect(gainNode);
      source.start();
      extraNodes.push(filter, lfo, lfoGain);

    } else if (id === 'crickets') {
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.value = 4500;
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 4800;
      
      const lfo = this.ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 15;
      
      const lfoSlow = this.ctx.createOscillator();
      lfoSlow.type = 'sine';
      lfoSlow.frequency.value = 0.5;
      
      const gain1 = this.ctx.createGain();
      gain1.gain.value = 0;
      const gain2 = this.ctx.createGain();
      gain2.gain.value = 0;
      
      lfo.connect(gain1.gain);
      lfo.connect(gain2.gain);
      
      const masterGain = this.ctx.createGain();
      masterGain.gain.value = 0.2;
      lfoSlow.connect(masterGain.gain);
      
      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(masterGain);
      gain2.connect(masterGain);
      masterGain.connect(gainNode);
      
      osc1.start();
      osc2.start();
      lfo.start();
      lfoSlow.start();
      source = osc1; // just to hold reference
      extraNodes.push(osc2, lfo, lfoSlow, gain1, gain2, masterGain);
      
    } else if (id === 'thunder') {
      const buffer = this.createNoiseBuffer('brown');
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      
      const thunderGain = this.ctx.createGain();
      thunderGain.gain.value = 0.1;
      
      source.connect(filter);
      filter.connect(thunderGain);
      thunderGain.connect(gainNode);
      source.start();
      
      const thunderInterval = setInterval(() => {
        if (!isPlaying) return;
        if (Math.random() > 0.9) {
          thunderGain.gain.cancelScheduledValues(this.ctx!.currentTime);
          thunderGain.gain.setValueAtTime(0.8, this.ctx!.currentTime);
          thunderGain.gain.exponentialRampToValueAtTime(0.05, this.ctx!.currentTime + 2 + Math.random() * 3);
          
          filter.frequency.cancelScheduledValues(this.ctx!.currentTime);
          filter.frequency.setValueAtTime(800, this.ctx!.currentTime);
          filter.frequency.exponentialRampToValueAtTime(150, this.ctx!.currentTime + 1.5);
        }
      }, 5000);
      intervals.push(thunderInterval);
      extraNodes.push(filter, thunderGain);"""

content = content.replace("} else if (id === 'sea') {", new_cases + "\n    } else if (id === 'sea') {")

with open('src/AudioEngine.ts', 'w') as f:
    f.write(content)
print("Updated generators in AudioEngine.ts")
