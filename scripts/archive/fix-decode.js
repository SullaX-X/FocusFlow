import fs from 'fs';

const file = 'src/AudioEngine.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `    if (options?.type === 'file' && options?.url) {
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

const replacement = `    if (options?.type === 'file' && options?.url) {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : \`\${baseUrl}/\`;
      let encodedUrl = options.url.split('/').map(part => encodeURIComponent(decodeURIComponent(part))).join('/');
      const url = normalizedBase + encodedUrl;

      if (!this.ctx) return;
      
      const audioEl = new Audio(url);
      audioEl.crossOrigin = "anonymous";
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

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find target!");
}
