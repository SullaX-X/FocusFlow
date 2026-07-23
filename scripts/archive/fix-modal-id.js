import fs from 'fs';
const file = 'src/components/FocusMode.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="relative w-full h-full md:h-\[650px\] md:max-h-\[85vh\] md:max-w-5xl bg-theme-card/g, 
  'id="audio-player-modal" className="relative w-full h-full md:h-[650px] md:max-h-[85vh] md:max-w-5xl bg-theme-card'
);

fs.writeFileSync(file, content);
