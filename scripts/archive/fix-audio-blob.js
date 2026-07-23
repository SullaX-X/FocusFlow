import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /    if \(options\?\.type === 'file' && options\?\.url\) \{[\s\S]*?return;\n    \}/;

const replacement = `    if (options?.type === 'file' && options?.url) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \\\`\\\${baseUrl}/\\\`;
      let encodedUrl = options.url.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/');
      const url = normalizedBase + encodedUrl;
      
      if (!this.ctx) return;
      
      localNode.stopFn = () => { isPlaying = false; };
      
      fetch(url, { credentials: 'include' })
        .then(response => {
          if (!response.ok) throw new Error("Fetch failed: " + response.status);
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            throw new Error("Received HTML instead of audio");
          }
          return response.blob();
        })
        .then(blob => {
          if (!isPlaying) return;
          const blobUrl = URL.createObjectURL(blob);
          const audioEl = new Audio(blobUrl);
          audioEl.loop = true;
          audioEl.volume = volume;
          
          const sourceNode = this.ctx.createMediaElementSource(audioEl);
          sourceNode.connect(gainNode);
          
          const playPromise = audioEl.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.error("AudioEngine playback error for blob", url, e);
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
              URL.revokeObjectURL(blobUrl);
            } catch(e) {}
          };
        })
        .catch(e => {
          console.error("Failed to fetch or play audio file:", url, e);
        });
        
      return;
    }`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(file, content);
console.log("Replaced with fetch Blob successfully.");
