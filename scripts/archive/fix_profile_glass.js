import fs from 'fs';
let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

content = content.replace(
  'className="flex-1 bg-theme-bg/50 border border-theme-border/50 text-theme-text px-4 py-3 rounded-2xl outline-none focus:border-theme-accent focus:ring-0 transition-colors placeholder:text-theme-muted/50"',
  'className="flex-1 bg-theme-bg/30 backdrop-blur-md border border-theme-border/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] text-theme-text px-4 py-3 rounded-2xl outline-none focus:border-theme-accent focus:ring-0 transition-all placeholder:text-theme-muted/50"'
);

fs.writeFileSync('src/components/Profile.tsx', content);
