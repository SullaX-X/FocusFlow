import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `  setVolume(id: string, volume: number) {
    if (this.nodes[id]) {
      this.nodes[id].gain.gain.linearRampToValueAtTime(volume, this.ctx!.currentTime + 0.1);
    }
  }`;

const replacement = `  setVolume(id: string, volume: number) {
    if (this.nodes[id]) {
      if (this.nodes[id].gain && this.ctx) {
        this.nodes[id].gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
      }
      if (this.nodes[id].audioEl) {
        this.nodes[id].audioEl.volume = volume;
      }
    }
  }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target!");
}
