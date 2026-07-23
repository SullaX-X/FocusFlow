import fs from 'fs';
let content = fs.readFileSync('src/ThemeContext.tsx', 'utf8');

const newThemes = `export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'system', name: 'Системная', colors: ['#64748B', '#94A3B8', '#CBD5E1'], desc: 'Автоматически' },
  { id: 'light', name: 'Светлая', colors: ['#F8FAFC', '#FFFFFF', '#2563EB'], desc: 'Классическая' },
  { id: 'dark', name: 'Темная', colors: ['#0F172A', '#1E293B', '#2563EB'], desc: 'Комфортная' },
  { id: 'nordic', name: 'Nordic', colors: ['#2E3440', '#3B4252', '#88C0D0'], desc: 'Арктическая' },
  { id: 'latte', name: 'Latte', colors: ['#F5F1EA', '#FFFFFF', '#BC6C25'], desc: 'Кофейная' },
  { id: 'oled', name: 'OLED', colors: ['#000000', '#0A0A0A', '#39FF14'], desc: 'Максимальный черный' },
  { id: 'liquid-glass', name: 'Liquid Glass', colors: ['#0F172A', '#1E293B', '#60A5FA'], desc: 'Эстетика стекла', dustRequired: 100 },
  { id: 'iman_love', name: 'Iman Love', colors: ['#1E0716', '#2D0A21', '#EC4899'], desc: 'Нежный розовый', dustRequired: 300 },
  { id: 'iman_love_light', name: 'Iman Love Light', colors: ['#FFF1F2', '#FFFFFF', '#DB2777'], desc: 'Светлая роза', dustRequired: 500 },
  { id: 'dimoon', name: 'Di Moon', colors: ['#050714', '#0B0E20', '#FDE047'], desc: 'Космический синий', dustRequired: 1000 },
  { id: 'dimoon-blue', name: 'Di Moon Blue', colors: ['#020617', '#0F172A', '#38BDF8'], desc: 'Звездное небо', dustRequired: 1500 },
  { id: 'tiffany', name: 'Tiffany', colors: ['#0ABAB5', '#FFFFFF', '#007573'], desc: 'Luxury Teal', dustRequired: 3000 },
  { id: 'matcha-zen', name: 'Matcha Zen', colors: ['#E0E5D1', '#FFFFFF', '#4F6F52'], desc: 'Earthy Light', dustRequired: 5000 },
  { id: 'cyber-pulse', name: 'Cyber Pulse', colors: ['#28283e', '#00ffcc', '#ff2d78'], desc: 'The Masterpiece', dustRequired: 10000 },
  { id: 'mono-dark', name: 'Mono Dark', colors: ['#000000', '#111111', '#FFFFFF'], desc: 'Pure Black', dustRequired: 15000 },
  { id: 'mono-light', name: 'Mono Light', colors: ['#FFFFFF', '#F5F5F5', '#000000'], desc: 'Pure White', dustRequired: 20000 }
];`;

content = content.replace(/export const THEME_OPTIONS: ThemeOption\[\] = \[([\s\S]*?)\];/, newThemes);

const interfaceReplace = `export interface ThemeOption {
  id: Theme;
  name: string;
  colors: string[]; // [bg, panel, accent]
  desc: string;
  dustRequired?: number;
}`;

content = content.replace(/export interface ThemeOption \{[\s\S]*?\}/, interfaceReplace);

fs.writeFileSync('src/ThemeContext.tsx', content);

