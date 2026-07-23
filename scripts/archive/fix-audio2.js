import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `const response = await fetch(absoluteUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);`;

const replacement = `const response = await fetch(absoluteUrl);
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
           throw new Error(\`Got HTML instead of audio from \${absoluteUrl}\`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target!");
}
