import fs from 'fs';
let content = fs.readFileSync('src/components/FocusMode.tsx', 'utf8');

const oldProps = `export default function FocusMode({
  task,
  onClose,
  addFocusMinutes,
  recordSession,
  focusTrigger,
  isPageVisible = true,
}: {
  task: Task | null;
  onClose: () => void;
  addFocusMinutes: (m: number, isOvertime?: boolean) => void;
  recordSession?: (session: any) => void;
  focusTrigger?: number;
  isPageVisible?: boolean;
}) {`;

const newProps = `export default function FocusMode({
  task,
  onClose,
  addFocusMinutes,
  recordSession,
  focusTrigger,
  isPageVisible = true,
  stats,
}: {
  task: Task | null;
  onClose: () => void;
  addFocusMinutes: (m: number, isOvertime?: boolean) => void;
  recordSession?: (session: any) => void;
  focusTrigger?: number;
  isPageVisible?: boolean;
  stats?: any;
}) {`;

content = content.replace(oldProps, newProps);
fs.writeFileSync('src/components/FocusMode.tsx', content);

