import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    if (options?.type === 'file' && options?.url) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \\\`\\\${baseUrl}/\\\`;
      let encodedUrl = options.url.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/');
      const url = normalizedBase + encodedUrl;

      if (!this.ctx) return;
      
      const audioEl = new Audio(url);
      
      audioEl.loop = true;
      audioEl.volume = volume;
      
      const sourceNode = this.ctx.createMediaElementSource(audioEl);
      sourceNode.connect(gainNode);
      
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("AudioEngine playback error for", url, e);
          if (e.name === "NotAllowedError") {
             // Autoplay blocked
          }
        });
      }
      
      localNode.source = sourceNode;
      localNode.audioEl = audioEl;
      localNode.stopFn = () => {
        try {
          isPlaying = false;
          audioEl.pause();
          audioEl.removeAttribute('src');
          audioEl.load();
          sourceNode.disconnect();
        } catch(e) {}
      };
      return;
    }`;

const replacement = `    if (options?.type === 'file' && options?.url) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \\\`\\\${baseUrl}/\\\`;
      let encodedUrl = options.url.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/');
      const url = normalizedBase + encodedUrl;
      
      const audioEl = new Audio(url);
      audioEl.loop = true;
      audioEl.volume = volume;
      
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("AudioEngine playback error for", url, e);
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
      return;
    }`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Replaced with native Audio successfully.");
