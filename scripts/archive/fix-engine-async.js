import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `  async play(id: string, volume: number, options?: any) {`;
const replacement = `  play(id: string, volume: number, options?: any) {`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Removed async from play.");
} else {
  console.log("Could not find target async play.");
}
