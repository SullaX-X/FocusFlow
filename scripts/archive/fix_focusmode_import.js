import fs from 'fs';
let content = fs.readFileSync('src/components/FocusMode.tsx', 'utf8');

content = content.replace(
  'import { motion, AnimatePresence } from "motion/react";',
  'import { motion, AnimatePresence } from "motion/react";\nimport { AccessManager } from "../AccessManager";'
);

fs.writeFileSync('src/components/FocusMode.tsx', content);
