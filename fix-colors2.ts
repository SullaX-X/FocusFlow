import fs from 'fs';
import path from 'path';

const dir = './src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.push('../App.tsx');
files.push('../index.css'); // just in case? No wait, index.css is fine.

const replacements = [
  { regex: /bg-slate-50 dark:bg-theme-bg/g, replace: 'bg-theme-bg' },
  { regex: /bg-white dark:bg-theme-bg/g, replace: 'bg-theme-bg' },
  { regex: /bg-white dark:bg-theme-card/g, replace: 'bg-theme-card' },
  { regex: /bg-slate-50 dark:bg-theme-card/g, replace: 'bg-theme-card' },
  
  { regex: /text-slate-900 dark:text-theme-text/g, replace: 'text-theme-text' },
  { regex: /text-slate-800 dark:text-theme-text/g, replace: 'text-theme-text' },
  { regex: /text-slate-800 dark:text-white/g, replace: 'text-theme-text' },
  { regex: /text-slate-900 dark:text-white/g, replace: 'text-theme-text' },
  { regex: /text-slate-700 dark:text-theme-text/g, replace: 'text-theme-text' },
  { regex: /text-slate-600 dark:text-theme-text/g, replace: 'text-theme-text' },
  
  { regex: /text-slate-500 dark:text-theme-muted/g, replace: 'text-theme-muted' },
  { regex: /text-slate-600 dark:text-theme-muted/g, replace: 'text-theme-muted' },
  { regex: /text-slate-400 dark:text-theme-muted/g, replace: 'text-theme-muted' },
  
  { regex: /border-slate-200 dark:border-theme-border/g, replace: 'border-theme-border' },
  { regex: /border-slate-100 dark:border-theme-border/g, replace: 'border-theme-border' },
  { regex: /border-slate-300 dark:border-theme-border/g, replace: 'border-theme-border' },
  
  { regex: /bg-slate-100 dark:bg-theme-border/g, replace: 'bg-theme-border' },
  { regex: /bg-slate-100 dark:bg-theme-card/g, replace: 'bg-theme-card' },
  { regex: /bg-slate-200 dark:bg-theme-card/g, replace: 'bg-theme-card' },
  { regex: /bg-slate-900\/20 dark:bg-black\/40/g, replace: 'bg-black/40' },
  { regex: /text-slate-500 dark:text-theme-text/g, replace: 'text-theme-muted' }
];

for (const file of files) {
  const filePath = file.startsWith('../') ? path.join('./src', file.replace('../', '')) : path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const { regex, replace } of replacements) {
      content = content.replace(regex, replace);
    }
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
}
