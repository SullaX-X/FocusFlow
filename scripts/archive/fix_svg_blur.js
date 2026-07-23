import fs from 'fs';

// Fix Profile.tsx
let profile = fs.readFileSync('src/components/Profile.tsx', 'utf8');

profile = profile.replace(
  /className="w-full h-full object-cover scale-\[1.35\]"/g,
  'className="w-[135%] h-[135%] max-w-none flex-shrink-0 object-cover"'
);

profile = profile.replace(
  /className="absolute inset-0 pointer-events-none mix-blend-color opacity-\[0.85\]"/g,
  'className="absolute inset-0 pointer-events-none mix-blend-color"'
);

fs.writeFileSync('src/components/Profile.tsx', profile);

// Fix AchievementAwardModal.tsx
let modal = fs.readFileSync('src/components/AchievementAwardModal.tsx', 'utf8');

// Ensure the wrapper has flex centering
modal = modal.replace(
  /className="relative w-48 h-48 rounded-full overflow-hidden border-\[6px\] shadow-2xl mb-8 group cursor-pointer"/g,
  'className="relative w-48 h-48 rounded-full overflow-hidden border-[6px] shadow-2xl mb-8 group cursor-pointer flex items-center justify-center"'
);

modal = modal.replace(
  /className="w-full h-full object-cover scale-\[1.35\]"/g,
  'className="w-[135%] h-[135%] max-w-none flex-shrink-0 object-cover"'
);

modal = modal.replace(
  /className="absolute inset-0 pointer-events-none mix-blend-color opacity-90"/g,
  'className="absolute inset-0 pointer-events-none mix-blend-color"'
);

fs.writeFileSync('src/components/AchievementAwardModal.tsx', modal);
