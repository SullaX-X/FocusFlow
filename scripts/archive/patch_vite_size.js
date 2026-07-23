import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf8');

content = content.replace("globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],", "globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],\n          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB");

fs.writeFileSync('vite.config.ts', content);
