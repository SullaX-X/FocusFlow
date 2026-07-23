import fs from 'fs';

let profile = fs.readFileSync('src/components/Profile.tsx', 'utf8');
profile = profile.replace(/bg-yellow-500/g, 'bg-theme-accent');
profile = profile.replace(/bg-green-500/g, 'bg-theme-success');
fs.writeFileSync('src/components/Profile.tsx', profile);

let stats = fs.readFileSync('src/components/Statistics.tsx', 'utf8');
stats = stats.replace(/bg-yellow-400\/10/g, 'bg-theme-accent/10');
stats = stats.replace(/text-yellow-500/g, 'text-theme-accent');
fs.writeFileSync('src/components/Statistics.tsx', stats);

