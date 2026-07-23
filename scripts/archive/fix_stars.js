import fs from 'fs';
let content = fs.readFileSync('src/components/FocusStarsCanvas.tsx', 'utf8');

// The issue with stars logic might be that it resets the positions to hash every time, which isn't random enough for different sessions (id might hash to similar things if they are sequential like session_1, session_2), or that resize resets them entirely. Let's make it actually pseudo-random by using a seed based on the string, but better distributed.

const oldStarsLogic = `      sessions.forEach(s => {
        const isDeep = s.isDeepWork;
        // Simple hash for pseudo-random deterministic position based on id
        const hash = s.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        
        stars.push({
          id: s.id,
          x: (hash * 137.5) % canvas.width,
          y: (hash * 93.1) % canvas.height,
          size: isDeep ? ((hash % 10) / 5 + 2) : ((hash % 10) / 5 + 0.5),
          baseAlpha: isDeep ? 0.8 : 0.4,
          speed: (hash % 100) * 0.0002 + 0.005,
          color: isDeep ? accentColor : (theme === 'dark' ? '#ffffff' : '#000000'),
          pulsePhase: hash % (Math.PI * 2),
          isDeep
        });
      });`;

const newStarsLogic = `      // Better hash function for more randomness
      const cyrb53 = (str: string, seed = 0) => {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
          ch = str.charCodeAt(i);
          h1 = Math.imul(h1 ^ ch, 2654435761);
          h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
      };

      sessions.forEach(s => {
        const isDeep = s.isDeepWork;
        const hash1 = cyrb53(s.id, 1);
        const hash2 = cyrb53(s.id, 2);
        
        // Use modulus to get pseudo-random values between 0 and 1
        const randX = (hash1 % 10000) / 10000;
        const randY = (hash2 % 10000) / 10000;
        
        stars.push({
          id: s.id,
          x: randX * canvas.width,
          y: randY * canvas.height,
          size: isDeep ? ((hash1 % 20) / 10 + 1.5) : ((hash1 % 15) / 10 + 0.5),
          baseAlpha: isDeep ? 0.8 : 0.4,
          speed: ((hash2 % 100) / 100) * 0.01 + 0.002,
          color: isDeep ? accentColor : (theme === 'dark' ? '#ffffff' : '#000000'),
          pulsePhase: ((hash1 + hash2) % 100) / 100 * (Math.PI * 2),
          isDeep
        });
      });`;

content = content.replace(oldStarsLogic, newStarsLogic);
fs.writeFileSync('src/components/FocusStarsCanvas.tsx', content);
