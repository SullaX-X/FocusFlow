import re

with open('src/AudioEngine.ts', 'r') as f:
    engine = f.read()

# Replace play and stop
new_methods = """  async play(id: string, volume: number, options?: any) {
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

    if (options?.type === 'file' && options?.url) {
      try {
        const response = await fetch(options.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        
        if (!isPlaying) return;
        
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        
        localNode.source = source;
      } catch (e) {
        console.error("Failed to load or play audio file:", options.url, e);
      }
      return;
    }

    let source: any;
    let extraNodes: AudioNode[] = [];
    let intervals: any[] = [];
"""

# Now we need to replace from async play to Common Generators
engine = re.sub(r"  async play\(id: string, volume: number, options\?: any\) \{.*?// Common Generators", new_methods + "\n    // Common Generators", engine, flags=re.DOTALL)

# For the end of play(), it currently does:
#    this.nodes[id] = { source, gain: gainNode, extra: extraNodes, intervals, stopFn };
# We should update localNode instead.
end_of_play = """    localNode.source = source;
    localNode.extra = extraNodes;
    localNode.intervals = intervals;
  }"""

engine = re.sub(r"    this\.nodes\[id\] = \{ source, gain: gainNode, extra: extraNodes, intervals, stopFn \};\n  \}", end_of_play, engine)

# Now rewrite stop
new_stop = """  stop(id: string) {
    if (this.nodes[id]) {
      const node = this.nodes[id];
      delete this.nodes[id];
      
      if (node.stopFn) node.stopFn();
      if (node.intervals) {
         node.intervals.forEach((i: any) => clearTimeout(i));
      }
      
      try {
        if (this.ctx) {
          node.gain.gain.cancelScheduledValues(this.ctx.currentTime);
          node.gain.gain.setValueAtTime(node.gain.gain.value, this.ctx.currentTime);
          node.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
        }
        
        setTimeout(() => {
          try {
            if (node.source) (node.source as any).stop();
            if (node.extra) {
              node.extra.forEach((n: any) => {
                if (n instanceof OscillatorNode) n.stop();
                n.disconnect();
              });
            }
            node.gain.disconnect();
          } catch(e) {}
        }, 1000);
      } catch (e) {}
    }
  }"""

engine = re.sub(r"  stop\(id: string\) \{.*?  \}", new_stop, engine, flags=re.DOTALL)

with open('src/AudioEngine.ts', 'w') as f:
    f.write(engine)
