import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    if (options?.type === 'file' && options?.url) {
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
            if (e.name !== "AbortError" && e.name !== "NotSupportedError" && e.name !== "NotAllowedError") {
              console.warn("AudioEngine playback error for", absoluteUrl, e.message || e);
            }
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

const replacement = `    if (options?.type === 'file' && options?.url) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \`\${baseUrl}/\`;
      let encodedUrl = options.url.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/');
      const absoluteUrl = new URL(encodedUrl, window.location.origin + normalizedBase).href;

      if (!this.ctx) return;
      
      const loadAndPlay = async () => {
        try {
          // fetch the audio file
          const response = await fetch(absoluteUrl);
          const arrayBuffer = await response.arrayBuffer();
          if (!isPlaying) return; // user stopped before loaded
          
          const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
          if (!isPlaying) return;
          
          const bufferSource = this.ctx!.createBufferSource();
          bufferSource.buffer = audioBuffer;
          bufferSource.loop = true;
          
          // create a specific gain node for this file
          const fileGain = this.ctx!.createGain();
          fileGain.gain.value = volume;
          
          bufferSource.connect(fileGain);
          fileGain.connect(gainNode);
          
          bufferSource.start();
          
          localNode.source = bufferSource;
          localNode.gain = fileGain; // use specific fileGain for volume control
          localNode.stopFn = () => {
            try {
              isPlaying = false;
              bufferSource.stop();
              bufferSource.disconnect();
              fileGain.disconnect();
            } catch(e) {}
          };
          this.checkState();
        } catch (e) {
          console.error("Failed to load or decode audio file:", absoluteUrl, e);
        }
      };
      
      localNode.stopFn = () => { isPlaying = false; };
      loadAndPlay();
      return;
    }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced audio element with buffer source successfully.");
} else {
  console.log("Could not find target in AudioEngine!");
}
