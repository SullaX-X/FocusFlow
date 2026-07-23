import fs from 'fs';

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/hover:opacity-80 hover:shadow-\[0_0_15px_currentColor\]/g, 'hover:brightness-110 hover:shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.5)]');
  fs.writeFileSync(file, content);
};

['src/components/Settings.tsx', 'src/components/FocusMode.tsx', 'src/components/ConfirmModal.tsx'].forEach(fixFile);
console.log("Hover fixed");
