const fs = require('fs');
let code = fs.readFileSync('src/components/CommandPalette.tsx', 'utf-8');

// Ensure previewTheme is forcefully cleared if not open
code = code.replace(
  /useEffect\(\(\) => \{\n\s+let timeoutId: any;\n\s+if \(mode === 'themes' && activeItem\) \{/g,
  `useEffect(() => {
    let timeoutId: any;
    if (!isOpen) return; // Forcefully do not preview if closed
    if (mode === 'themes' && activeItem) {`
);

fs.writeFileSync('src/components/CommandPalette.tsx', code);
console.log('Fixed CommandPalette preview');
