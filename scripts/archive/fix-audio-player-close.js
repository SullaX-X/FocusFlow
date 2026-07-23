import fs from 'fs';

const file = 'src/components/FocusMode.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add ID to audio player modal
content = content.replace(
  /className="relative w-full sm:w-\[480px\] bg-theme-bg sm:rounded-\[2\.5rem\] shadow-2xl overflow-hidden flex flex-col h-\[85vh\] sm:h-\[80vh\] border-t sm:border border-theme-border\/50"/,
  'id="audio-player-modal" className="relative w-full sm:w-[480px] bg-theme-bg sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[80vh] border-t sm:border border-theme-border/50"'
);

// Update handleClickOutside
const target = `    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest && target.closest('#confirm-modal')) return;
      if (audioRef.current && !audioRef.current.contains(event.target as Node)) {
        setShowAudioPlayer(false);
      }
    };`;

const replacement = `    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      if (target.closest && target.closest('#confirm-modal')) return;
      if (target.closest && target.closest('#audio-player-modal')) return;
      if (audioRef.current && !audioRef.current.contains(target as Node)) {
        setShowAudioPlayer(false);
      }
    };`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
console.log("Fixed audio player kick-out issue.");
