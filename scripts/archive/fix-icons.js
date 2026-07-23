import fs from 'fs';

const files = ['src/components/FocusMode.tsx', 'src/components/Settings.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace pause icons with stop icons for clarity
  content = content.replace(/{isActive \? 'pause' : 'play_arrow'}/g, "{isActive ? 'stop' : 'play_arrow'}");
  content = content.replace(/{isActive \? 'pause_circle' : 'play_circle'}/g, "{isActive ? 'stop_circle' : 'play_circle'}");
  
  // In Settings:
  content = content.replace(/{activeSounds\\[sound.id\\]\?\\.isPlaying \? 'pause' : 'play_arrow'}/g, "{activeSounds[sound.id]?.isPlaying ? 'stop' : 'play_arrow'}");
  content = content.replace(/{isLocked \? 'lock' : \(activeSounds\\[sound.id\\]\?\\.isPlaying \? 'pause' : 'play_arrow'\)}/g, "{isLocked ? 'lock' : (activeSounds[sound.id]?.isPlaying ? 'stop' : 'play_arrow')}");
  
  fs.writeFileSync(file, content);
}
console.log("Icons updated.");
