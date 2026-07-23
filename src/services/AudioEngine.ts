// Re-implemented AudioEngine to support multiple generative sounds
export class AudioEngine {
  ctx: AudioContext | null = null;
  nodes: Record<string, { source?: AudioBufferSourceNode | OscillatorNode, gain: GainNode, extra?: AudioNode[], intervals?: any[], stopFn?: () => void, audioEl?: HTMLAudioElement }> = {};

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private checkState() {
    if (!this.ctx) return;
    const activeCount = Object.keys(this.nodes).length;
    if (activeCount === 0 && this.ctx.state === 'running') {
      this.ctx.suspend();
    } else if (activeCount > 0 && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseBuffer(type: 'white' | 'pink' | 'brown' | 'rain' | 'space' | 'fire' | 'wind' | 'crickets' | 'thunder') {
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

  setupReverb() {
    if (!this.ctx) return null;
    const reverb = this.ctx.createConvolver();
    const length = this.ctx.sampleRate * 6;
    const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (this.ctx.sampleRate * 2.0));
      impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * decay;
      impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * decay;
    }
    reverb.buffer = impulse;
    return reverb;
  }

  static safeStopAndCleanup(audioObj: HTMLAudioElement | null) {
    if (!audioObj) return;
    try {
      audioObj.pause();
      audioObj.src = '';
      audioObj.load();
    } catch (e) {
      console.error('Error during safeStopAndCleanup:', e);
    }
  }

  play(id: string, volume: number, options?: any) {
    this.init();
    if (!this.ctx) return;
    
    this.stop(id);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.0);
    gainNode.connect(this.ctx.destination);
    
    let isPlaying = true;
    const stopFn = () => { isPlaying = false; };
    
    const localNode: any = { 
        source: null, 
        gain: gainNode, 
        extra: [], 
        intervals: [], 
        stopFn 
    };
    
    this.nodes[id] = localNode;
    this.checkState();

    if (options?.type === 'file' && options?.url) {
      let url = options.url;
      if (url.startsWith('/')) {
        const base = import.meta.env.BASE_URL || '/';
        url = base + (base.endsWith('/') ? '' : '/') + url.slice(1);
      }
      
      if (!this.ctx) return;
      
      localNode.stopFn = () => { isPlaying = false; };
      
      // Bypassing SW cache to prevent "Failed to fetch" on precached mp3s
      // The browser's normal HTTP cache can still work if it isn't blocked by the SW
      const encodedUrl = encodeURI(url);
      const fetchUrl = encodedUrl + '?t=' + Date.now();
      
      console.log(`[AudioEngine] Fetching audio from: ${fetchUrl}`);
      
      fetch(fetchUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${url}`);
          }
          return response.arrayBuffer();
        })
        .then(arrayBuffer => {
          if (!isPlaying || !this.ctx) return;
          return this.ctx.decodeAudioData(arrayBuffer);
        })
        .then(audioBuffer => {
          if (!isPlaying || !audioBuffer || !this.ctx) return;
          
          const bufferSource = this.ctx.createBufferSource();
          bufferSource.buffer = audioBuffer;
          bufferSource.loop = true;
          
          bufferSource.connect(gainNode);
          bufferSource.start();
          
          console.log(`[AudioEngine] Successfully started playing file: ${url}`);
          
          localNode.source = bufferSource;
          localNode.stopFn = () => {
            isPlaying = false;
            try {
              bufferSource.stop();
            } catch(e) {}
            bufferSource.disconnect();
            gainNode.disconnect();
          };
        })
        .catch(e => {
          console.error(`[AudioEngine] Failed to fetch or decode audio file: ${url}`, e);
          console.log(`[AudioEngine] Attempting fallback to HTMLAudioElement for: ${url}`);
          
          if (!isPlaying || !this.ctx) return;

          const audioEl = new Audio();
          audioEl.src = fetchUrl;
          audioEl.loop = true;
          audioEl.crossOrigin = "anonymous";
          
          const mediaSource = this.ctx.createMediaElementSource(audioEl);
          mediaSource.connect(gainNode);
          
          audioEl.play().then(() => {
            console.log(`[AudioEngine] Successfully started playing via HTMLAudioElement: ${url}`);
          }).catch(err => {
             console.error(`[AudioEngine] Fallback also failed for: ${url}`, err);
          });

          localNode.audioEl = audioEl;
          localNode.source = null; // We use audioEl instead
          localNode.stopFn = () => {
            isPlaying = false;
            AudioEngine.safeStopAndCleanup(audioEl);
            mediaSource.disconnect();
            gainNode.disconnect();
          };
        });
        
      return;
    }

    let source: any;
    let extraNodes: AudioNode[] = [];
    let intervals: any[] = [];

    // Common Generators
    const createBirds = () => {
      const scheduleBirds = () => {
        if (!isPlaying || !this.ctx) return;
        const numChirps = Math.floor(Math.random() * 3) + 1;
        let time = this.ctx.currentTime + Math.random() * 2;
        for (let i = 0; i < numChirps; i++) {
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();
          osc.type = 'sine';
          const startFreq = 2000 + Math.random() * 3000;
          osc.frequency.setValueAtTime(startFreq, time);
          osc.frequency.exponentialRampToValueAtTime(startFreq + 1000 + Math.random() * 1500, time + 0.1);
          osc.frequency.exponentialRampToValueAtTime(startFreq - 500, time + 0.2);
          
          oscGain.gain.setValueAtTime(0, time);
          oscGain.gain.linearRampToValueAtTime(0.1, time + 0.05);
          oscGain.gain.linearRampToValueAtTime(0, time + 0.2);
          
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(time);
          osc.stop(time + 0.25);
          time += 0.2 + Math.random() * 0.3;
        }
        intervals.push(setTimeout(scheduleBirds, 3000 + Math.random() * 6000));
      };
      scheduleBirds();
    };

    const createPiano = () => {
      const reverb = this.setupReverb();
      const delay = this.ctx!.createDelay(3.0);
      delay.delayTime.value = 0.75;
      const delayFeedback = this.ctx!.createGain();
      delayFeedback.gain.value = 0.4;
      delay.connect(delayFeedback);
      const delayFilter = this.ctx!.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.value = 800;
      delayFeedback.connect(delayFilter);
      delayFilter.connect(delay);
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      
      if (reverb) {
        delay.connect(reverb);
        filter.connect(delay);
        filter.connect(reverb);
        reverb.connect(gainNode);
        extraNodes.push(reverb, delay, delayFeedback, delayFilter, filter);
      } else {
        filter.connect(gainNode);
        extraNodes.push(filter);
      }

      const chords = [
        [174.61, 261.63, 329.63, 392.00, 440.00], // Fmaj9
        [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
        [110.00, 164.81, 220.00, 246.94, 329.63], // Am9
        [196.00, 293.66, 329.63, 392.00, 493.88], // G6
        [164.81, 246.94, 293.66, 329.63, 392.00]  // Em7
      ];
      
      const lfo = this.ctx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.15;
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain);
      lfo.start();
      extraNodes.push(lfo, lfoGain);

      let currentChordIdx = 0;
      let nextTime = this.ctx!.currentTime + 1.0;

      const schedulePiano = () => {
        if (!isPlaying || !this.ctx) return;
        while (nextTime < this.ctx.currentTime + 3) {
          const chord = chords[currentChordIdx];
          const numNotes = Math.floor(Math.random() * 3) + 2;
          for (let i = 0; i < numNotes; i++) {
            let freq = chord[Math.floor(Math.random() * chord.length)];
            if (Math.random() > 0.6) freq *= 2;
            const duration = 8 + Math.random() * 6;
            const vol = (0.04 + Math.random() * 0.04) / numNotes;
            const timeOffset = Math.random() * 2.5;
            const time = nextTime + timeOffset;

            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const noteGain = this.ctx.createGain();
            const noteFilter = this.ctx.createBiquadFilter();
            
            osc.type = 'sine';
            osc2.type = 'triangle';
            osc.frequency.value = freq;
            osc2.frequency.value = freq * 1.003;
            
            lfoGain.connect(osc.detune);
            lfoGain.connect(osc2.detune);
            
            const osc2Gain = this.ctx.createGain();
            osc2Gain.gain.value = 0.4;
            osc2.connect(osc2Gain);
            
            osc.connect(noteFilter);
            osc2Gain.connect(noteFilter);
            noteFilter.connect(noteGain);
            noteGain.connect(filter);
            
            noteFilter.type = 'lowpass';
            noteFilter.frequency.setValueAtTime(300, time);
            noteFilter.frequency.linearRampToValueAtTime(1500, time + 0.1);
            noteFilter.frequency.exponentialRampToValueAtTime(300, time + duration * 0.5);
            
            noteGain.gain.setValueAtTime(0, time);
            noteGain.gain.linearRampToValueAtTime(vol, time + 0.05);
            noteGain.gain.exponentialRampToValueAtTime(vol * 0.2, time + 2.0);
            noteGain.gain.linearRampToValueAtTime(0.0001, time + duration);
            
            osc.start(time);
            osc2.start(time);
            osc.stop(time + duration);
            osc2.stop(time + duration);
          }
          if (Math.random() > 0.3) {
            currentChordIdx = (currentChordIdx + 1 + Math.floor(Math.random() * 3)) % chords.length;
          }
          nextTime += 6 + Math.random() * 10;
        }
        intervals.push(setTimeout(schedulePiano, 1000));
      };
      schedulePiano();
    };

    const createRiver = () => {
      const buffer = this.createNoiseBuffer('pink');
      const src = this.ctx!.createBufferSource();
      if (buffer) src.buffer = buffer;
      src.loop = true;
      const hp = this.ctx!.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 300;
      const lp = this.ctx!.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1500;
      src.connect(hp);
      hp.connect(lp);
      lp.connect(gainNode);
      src.start();
      extraNodes.push(hp, lp);
      return src;
    };

    const createSea = () => {
      const buffer = this.createNoiseBuffer('brown');
      const src = this.ctx!.createBufferSource();
      if (buffer) src.buffer = buffer;
      src.loop = true;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const lfo = this.ctx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08; // 12.5s wave
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 350;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      src.connect(filter);
      filter.connect(gainNode);
      src.start();
      lfo.start();
      extraNodes.push(filter, lfo, lfoGain);
      return src;
    };

    const createFlute = () => {
      const reverb = this.setupReverb();
      const delay = this.ctx!.createDelay(3.0);
      delay.delayTime.value = 0.6;
      const delayFeedback = this.ctx!.createGain();
      delayFeedback.gain.value = 0.3;
      delay.connect(delayFeedback);
      
      const mixer = this.ctx!.createGain();
      if (reverb) {
        delay.connect(reverb);
        mixer.connect(delay);
        mixer.connect(reverb);
        reverb.connect(gainNode);
        extraNodes.push(reverb, delay, delayFeedback, mixer);
      } else {
        mixer.connect(gainNode);
        extraNodes.push(mixer);
      }

      let nextTime = this.ctx!.currentTime + 1.0;
      const scheduleFlute = () => {
        if (!isPlaying || !this.ctx) return;
        while (nextTime < this.ctx.currentTime + 3) {
          const freqs = [220, 246.94, 261.63, 293.66, 329.63]; // A minor pent
          const freq = freqs[Math.floor(Math.random() * freqs.length)] / 2; // octave lower for tibetan flute
          const duration = 6 + Math.random() * 4;
          const time = nextTime + Math.random() * 2;
          
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          
          const vib = this.ctx.createOscillator();
          vib.frequency.value = 4.5 + Math.random();
          const vibGain = this.ctx.createGain();
          vibGain.gain.value = 4;
          vib.connect(vibGain);
          vibGain.connect(osc.frequency);
          vib.start(time);
          vib.stop(time + duration);
          
          const oGain = this.ctx.createGain();
          oGain.gain.setValueAtTime(0, time);
          oGain.gain.linearRampToValueAtTime(0.2, time + duration * 0.3);
          oGain.gain.linearRampToValueAtTime(0, time + duration);
          
          osc.frequency.setValueAtTime(freq, time);
          
          osc.connect(oGain);
          oGain.connect(mixer);
          
          osc.start(time);
          osc.stop(time + duration);
          
          nextTime += duration + 2 + Math.random() * 5;
        }
        intervals.push(setTimeout(scheduleFlute, 1000));
      };
      scheduleFlute();
    };

    if (id.startsWith('freq_')) {
      const freq = parseInt(id.split('_')[1]);
      source = this.ctx.createOscillator();
      source.type = 'sine';
      source.frequency.value = freq;
      source.connect(gainNode);
      source.start();
    } else if (id.startsWith('freq_')) {
      const freq = parseInt(id.split('_')[1]);
      source = this.ctx.createOscillator();
      source.type = (options && options.waveform) ? options.waveform : 'sine';
      source.frequency.value = freq;
      source.connect(gainNode);
      source.start();
    } else if (id === 'bass_sweep') {
      source = this.ctx.createOscillator();
      source.type = (options && options.waveform) ? options.waveform : 'sine';
      
      const sweep = () => {
        if (!isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        source.frequency.cancelScheduledValues(now);
        source.frequency.setValueAtTime(20, now);
        source.frequency.exponentialRampToValueAtTime(200, now + 8);
        source.frequency.exponentialRampToValueAtTime(20, now + 16);
      };
      
      sweep();
      const interval = setInterval(sweep, 16000);
      intervals.push(interval);
      
      source.connect(gainNode);
      source.start();
    } else if (id === 'full_sweep') {
      source = this.ctx.createOscillator();
      source.type = (options && options.waveform) ? options.waveform : 'sine';
      
      const sweep = () => {
        if (!isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        source.frequency.cancelScheduledValues(now);
        source.frequency.setValueAtTime(20, now);
        source.frequency.exponentialRampToValueAtTime(20000, now + 30);
        source.frequency.exponentialRampToValueAtTime(20, now + 60);
      };
      
      sweep();
      const interval = setInterval(sweep, 60000);
      intervals.push(interval);
      
      source.connect(gainNode);
      source.start();
    } else if (id === 'birds' || id === 'tibetan_birds' || id === 'river_piano' || id === 'sea_piano_flute') {
      // Placeholder for complex synth sounds - using a pleasant sine/triangle mix for now
      source = this.ctx.createOscillator();
      source.type = id.includes('piano') ? 'triangle' : 'sine';
      source.frequency.value = id.includes('birds') ? 800 : 440;
      
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = id.includes('sea') ? 0.1 : 0.5;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = id.includes('birds') ? 200 : 50;
      
      lfo.connect(lfoGain);
      lfoGain.connect(source.frequency);
      lfo.start();
      
      source.connect(gainNode);
      source.start();
      extraNodes.push(lfo, lfoGain);
    } else if (id === 'fire') {
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
      extraNodes.push(filter, thunderGain);
    } else if (id === 'sea') {
      source = createSea();
    } else if (id === 'river') {
      source = createRiver();
    } else if (id === 'birds') {
      createBirds();
    } else if (id === 'minecraft') {
      createPiano();
    } else if (id === 'river_piano') {
      source = createRiver();
      createPiano();
    } else if (id === 'tibetan_birds') {
      createFlute();
      createBirds();
    } else if (id === 'sea_piano_flute') {
      source = createSea();
      createPiano();
      createFlute();
    } else if (id === 'space') {
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
      source.start();
      extraNodes.push(filter, osc, oscGain);
    } else if (id === 'rain') {
      const buffer = this.createNoiseBuffer('pink');
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      source.connect(filter);
      filter.connect(gainNode);
      source.start();
      extraNodes.push(filter);
    } else {
      const buffer = this.createNoiseBuffer(id as any);
      source = this.ctx.createBufferSource();
      if (buffer) source.buffer = buffer;
      source.loop = true;
      source.connect(gainNode);
      source.start();
    }

    localNode.source = source;
    localNode.extra = extraNodes;
    localNode.intervals = intervals;
  }

  setWaveform(id: string, waveform: OscillatorType) {
    if (this.nodes[id] && this.nodes[id].source instanceof OscillatorNode) {
      (this.nodes[id].source as OscillatorNode).type = waveform;
    }
  }

  setVolume(id: string, volume: number) {
    if (this.nodes[id]) {
      if (this.nodes[id].gain && this.ctx) {
        this.nodes[id].gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
      }
      if (this.nodes[id].audioEl) {
        this.nodes[id].audioEl.volume = volume;
      }
    }
  }

  stop(id: string) {
    if (this.nodes[id]) {
      const node = this.nodes[id];
      delete this.nodes[id];
      
      // Cleanup for HTMLAudioElement
      if (node.audioEl) {
        AudioEngine.safeStopAndCleanup(node.audioEl);
      }

      if (node.stopFn) {
        try {
          node.stopFn();
        } catch(e) {}
      }
      
      if (node.intervals) {
         node.intervals.forEach((i: any) => {
           clearTimeout(i);
           clearInterval(i);
         });
      }
      
      try {
        if (this.ctx) {
          node.gain.gain.cancelScheduledValues(this.ctx.currentTime);
          node.gain.gain.setValueAtTime(node.gain.gain.value, this.ctx.currentTime);
          node.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
        }
        
        // Final cleanup after fade out
        setTimeout(() => {
          try {
            if (node.source) {
              if (node.source instanceof AudioBufferSourceNode || node.source instanceof OscillatorNode) {
                try { node.source.stop(); } catch(e) {}
              }
              node.source.disconnect();
            }
            if (node.extra) {
              node.extra.forEach((n: any) => {
                if (n instanceof OscillatorNode) {
                  try { n.stop(); } catch(e) {}
                }
                n.disconnect();
              });
            }
            node.gain.disconnect();
            this.checkState();
          } catch(e) {}
        }, 150);
      } catch (e) {}
    }
  }

  stopAll() {
    Object.keys(this.nodes).forEach(id => this.stop(id));
  }
}
