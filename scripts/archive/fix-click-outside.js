import fs from 'fs';

// 1. Fix ConfirmModal.tsx
let cm = fs.readFileSync('src/components/ConfirmModal.tsx', 'utf8');
cm = cm.replace('<div className="fixed inset-0', '<div id="confirm-modal" className="fixed inset-0');
fs.writeFileSync('src/components/ConfirmModal.tsx', cm);

// 2. Fix FocusMode.tsx
let fm = fs.readFileSync('src/components/FocusMode.tsx', 'utf8');
const target = `    const handleClickOutside = (event: MouseEvent) => {
      if (audioRef.current && !audioRef.current.contains(event.target as Node)) {
        setShowAudioPlayer(false);
      }
    };`;
const replacement = `    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest && target.closest('#confirm-modal')) return;
      if (audioRef.current && !audioRef.current.contains(event.target as Node)) {
        setShowAudioPlayer(false);
      }
    };`;
fm = fm.replace(target, replacement);
fs.writeFileSync('src/components/FocusMode.tsx', fm);

console.log("Fixed click outside issues.");
