import re

with open('src/AudioEngine.ts', 'r') as f:
    engine = f.read()

# I will find "  stop(id: string) {"
start = engine.find("  stop(id: string) {")
end = engine.find("  stopAll() {")

if start != -1 and end != -1:
    old_stop = engine[start:end]

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
  }

"""
engine = engine[:start] + new_stop + engine[end:]
with open('src/AudioEngine.ts', 'w') as f:
    f.write(engine)

