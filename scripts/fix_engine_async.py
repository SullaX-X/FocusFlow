import re

with open('src/AudioEngine.ts', 'r') as f:
    engine = f.read()

# Replace the beginning of play to store the node immediately
play_start = """  async play(id: string, volume: number, options?: any) {
    this.init();
    if (!this.ctx) return;
    
    this.stop(id);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.0);
    gainNode.connect(this.ctx.destination);
    
    let source: any;
    let extraNodes: AudioNode[] = [];
    let stopFn: any = null;
    let intervals: any[] = [];
    let isPlaying = true;
    
    stopFn = () => { isPlaying = false; };
    
    // Register immediately so stop() can find it and call stopFn even while loading
    this.nodes[id] = { source, gain: gainNode, extra: extraNodes, intervals, stopFn };

    if (options?.type === 'file' && options?.url) {
      try {
        const response = await fetch(options.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        
        if (!isPlaying) return;
        
        source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        
        // Update the stored node with the actual source
        if (this.nodes[id]) {
          this.nodes[id].source = source;
        } else {
          // If stopped while parsing
          source.stop();
        }
      } catch (e) {
        console.error("Failed to load or play audio file:", options.url, e);
      }
      return;
    }
"""

engine = re.sub(r"  async play\(id: string, volume: number, options\?: any\) \{.*?if \(options\?\.type === 'file' && options\?\.url\) \{[^\}]*\}\s*return;\s*\}", play_start, engine, flags=re.DOTALL)

with open('src/AudioEngine.ts', 'w') as f:
    f.write(engine)

