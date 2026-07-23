import fs from 'fs';
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace the large ternary for the highlighted card
content = content.replace(
  /className=\{`p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden transition-all duration-300 \$\{[\s\S]*?\}`\}/,
  'className="p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden transition-all duration-300 bg-theme-card border-2 border-theme-accent shadow-premium text-theme-text"'
);

// Replace energy tags
content = content.replace(/className=\{`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider \$\{isCyberPulse \? 'bg-\[#ff2d78\] text-white' : \`bg-black\/10 \$\{\(isDimoonBase \|\| isMonoDark\) \? 'text-white' : 'text-text-on-accent'\}\`\}`\}/g, 'className="text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider bg-theme-accent/20 text-theme-accent"');
content = content.replace(/className=\{`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider \$\{isCyberPulse \? 'bg-\[#ffe04a\] text-\[#28283e\]' : \`bg-black\/10 \$\{\(isDimoonBase \|\| isMonoDark\) \? 'text-white' : 'text-text-on-accent'\}\`\}`\}/g, 'className="text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider bg-theme-accent/20 text-theme-accent"');
content = content.replace(/className=\{`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider \$\{isCyberPulse \? 'bg-theme-success text-text-on-success' : \`bg-black\/10 \$\{\(isDimoonBase \|\| isMonoDark\) \? 'text-white' : 'text-text-on-accent'\}\`\}`\}/g, 'className="text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider bg-theme-success/20 text-theme-success"');

// Replace description text color
content = content.replace(/className=\{`\$\{\(isDimoonBase \|\| isCyberPulse \|\| isMonoDark\) \? 'text-white\/80' : 'text-text-on-accent\/80'\} max-w-lg truncate w-full`\}/g, 'className="text-theme-muted max-w-lg truncate w-full"');

fs.writeFileSync('src/components/Dashboard.tsx', content);
