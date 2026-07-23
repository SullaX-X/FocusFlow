import fs from 'fs';
let content = fs.readFileSync('src/AudioEngine.ts', 'utf8');

const oldFileLogic = `    if (options?.type === 'file' && options?.url) {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \`\${baseUrl}/\`;
        const absoluteUrl = new URL(options.url, window.location.origin + normalizedBase).href;
        
        const response = await fetch(absoluteUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        
        if (!isPlaying) return;
        
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        
        localNode.source = source;
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

const newFileLogic = `    if (options?.type === 'file' && options?.url) {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \`\${baseUrl}/\`;
        const absoluteUrl = new URL(options.url, window.location.origin + normalizedBase).href;
        
        const audioEl = new Audio(absoluteUrl);
        audioEl.loop = true;
        audioEl.crossOrigin = 'anonymous';
        
        const source = this.ctx.createMediaElementSource(audioEl);
        source.connect(gainNode);
        
        audioEl.play().catch(e => console.error("AudioEngine playback error:", e));
        
        localNode.source = source as any;
        localNode.stopFn = () => {
          try {
            isPlaying = false;
            audioEl.pause();
            audioEl.removeAttribute('src');
            audioEl.load();
            source.disconnect();
          } catch(e) {}
        };
      } catch (e) {
        console.error("Failed to load or play audio file:", options.url, e);
      }
      return;
    }`;

content = content.replace(oldFileLogic, newFileLogic);

fs.writeFileSync('src/AudioEngine.ts', content);
