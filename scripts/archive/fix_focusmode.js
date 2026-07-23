import fs from 'fs';
let content = fs.readFileSync('src/components/FocusMode.tsx', 'utf8');

// Inject AccessManager if not present
if (!content.includes('AccessManager')) {
  content = content.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { AccessManager } from '../AccessManager';");
}

content = content.replace(
  /const isLocked = s\.dustRequired && \(stats\?\.focusDust \|\| 0\) < s\.dustRequired;/g,
  'const isLocked = s.dustRequired && (stats?.focusDust || 0) < s.dustRequired && !AccessManager.isPremium();'
);

fs.writeFileSync('src/components/FocusMode.tsx', content);
