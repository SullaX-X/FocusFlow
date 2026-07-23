import re

with open('src/AudioEngine.ts', 'r') as f:
    engine = f.read()

# Make play async
engine = engine.replace('  play(id: string, volume: number, options?: any) {', '  async play(id: string, volume: number, options?: any) {')

# Add the file handler
file_handler = """
    if (options?.type === 'file' && options?.url) {
      try {
        const response = await fetch(options.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        
        // Ensure not stopped while loading
        if (!isPlaying) return;
        
        source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        
        this.nodes[id] = { source, gain: gainNode, extra: extraNodes, intervals, stopFn };
      } catch (e) {
        console.error("Failed to load or play audio file:", options.url, e);
      }
      return;
    }
"""

engine = engine.replace(
    '    // Common Generators',
    file_handler + '\n    // Common Generators'
)

with open('src/AudioEngine.ts', 'w') as f:
    f.write(engine)

