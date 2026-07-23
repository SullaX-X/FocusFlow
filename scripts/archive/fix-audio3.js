import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    if (options?.type === 'file' && options?.url) {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \`\${baseUrl}/\`;
        let encodedUrl = options.url.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/');
        const absoluteUrl = new URL(encodedUrl, window.location.origin + normalizedBase).href;
        
        const response = await fetch(absoluteUrl);
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
           throw new Error(\`Got HTML instead of audio from \${absoluteUrl}\`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        
        if (!isPlaying) return; // if stopped while fetching
        
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        
        localNode.source = source as any;
        localNode.stopFn = () => {
          try {
            isPlaying = false;
            source.stop();
            source.disconnect();
          } catch(e) {}
        };
      } catch (e) {
        console.error("Failed to load or play audio file:", options.url, e);
      }
      return;
    }`;

const replacement = `    if (options?.type === 'file' && options?.url) {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \`\${baseUrl}/\`;
        let encodedUrl = options.url.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/');
        const absoluteUrl = new URL(encodedUrl, window.location.origin + normalizedBase).href;
        
        const audioEl = new Audio(absoluteUrl);
        audioEl.loop = true;
        audioEl.volume = volume;
        
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("AudioEngine playback error for", absoluteUrl, e);
          });
        }
        
        localNode.audioEl = audioEl;
        localNode.stopFn = () => {
          try {
            isPlaying = false;
            audioEl.pause();
            audioEl.removeAttribute('src');
            audioEl.load();
          } catch(e) {}
        };
      } catch (e) {
        console.error("Failed to load or play audio file:", options.url, e);
      }
      return;
    }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target!");
}
