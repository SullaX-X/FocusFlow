import fs from 'fs';
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

content = content.replace(
  'export default function Settings({ stats = {} }: { stats?: any }) {',
  'import { AccessManager } from "../AccessManager";\nimport confetti from "canvas-confetti";\nexport default function Settings({ stats = {}, updateStats }: { stats?: any, updateStats?: (s: any) => void }) {'
);

fs.writeFileSync('src/components/Settings.tsx', content);
