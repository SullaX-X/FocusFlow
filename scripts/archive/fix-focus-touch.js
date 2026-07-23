import fs from 'fs';
const file = 'src/components/FocusMode.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (target.closest && target.closest('#confirm-modal')) return;
      if (audioRef.current && !audioRef.current.contains(event.target as Node)) {
        setShowAudioPlayer(false);
      }
    };

    if (showAudioPlayer) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAudioPlayer]);`;

const replacement = `  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      if (target.closest && target.closest('#confirm-modal')) return;
      if (audioRef.current && !audioRef.current.contains(target as Node)) {
        setShowAudioPlayer(false);
      }
    };

    if (showAudioPlayer) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showAudioPlayer]);`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log("Fixed touch listener for FocusMode click outside.");
