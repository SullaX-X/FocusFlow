import fs from 'fs';
let content = fs.readFileSync('src/components/FocusStarsCanvas.tsx', 'utf8');

const oldBgStars = `      // Add background stars
      for (let i = 0; i < 50; i++) {
        stars.push({
          id: \`bg-\${i}\`,
          x: (i * 73.1) % canvas.width,
          y: (i * 11.3) % canvas.height,
          size: (i % 3) * 0.5 + 0.5,
          baseAlpha: (i % 10) * 0.03 + 0.1,
          speed: (i % 10) * 0.001 + 0.002,
          color: theme === 'dark' ? '#ffffff' : '#000000',
          pulsePhase: i % (Math.PI * 2),
          isDeep: false
        });
      }`;

const newBgStars = `      // Add background stars
      for (let i = 0; i < 50; i++) {
        const hash1 = cyrb53(\`bg-\${i}\`, 1);
        const hash2 = cyrb53(\`bg-\${i}\`, 2);
        stars.push({
          id: \`bg-\${i}\`,
          x: ((hash1 % 10000) / 10000) * canvas.width,
          y: ((hash2 % 10000) / 10000) * canvas.height,
          size: ((hash1 % 30) / 10) * 0.5 + 0.5,
          baseAlpha: ((hash2 % 10) / 10) * 0.3 + 0.1,
          speed: ((hash1 % 100) / 100) * 0.01 + 0.002,
          color: theme === 'dark' ? '#ffffff' : '#000000',
          pulsePhase: ((hash1 + hash2) % 100) / 100 * (Math.PI * 2),
          isDeep: false
        });
      }`;

content = content.replace(oldBgStars, newBgStars);

const oldRenderCall = `    if (showBackgroundEffects) {
      render();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }`;

const newRenderCall = `    render(); // Always render at least once`;

content = content.replace(oldRenderCall, newRenderCall);

fs.writeFileSync('src/components/FocusStarsCanvas.tsx', content);
