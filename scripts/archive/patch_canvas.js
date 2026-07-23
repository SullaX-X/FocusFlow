import fs from 'fs';
let content = fs.readFileSync('src/components/FocusStarsCanvas.tsx', 'utf8');

content = content.replace(
  'animationId = requestAnimationFrame(render);',
  'if (showBackgroundEffects) { animationId = requestAnimationFrame(render); }'
);

fs.writeFileSync('src/components/FocusStarsCanvas.tsx', content);
