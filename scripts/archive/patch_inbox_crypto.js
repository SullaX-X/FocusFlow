import fs from 'fs';
let content = fs.readFileSync('src/components/Inbox.tsx', 'utf8');

const replacement = `import { FixedSizeList as List } from 'react-window';
import { encryptText, decryptText } from '../crypto';

export default function Inbox({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { actualTheme } = useTheme();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [text, setText] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadItems = async () => {
    try {
      const saved = localStorage.getItem('focusmoon_inbox');
      if (saved) {
        if (saved.startsWith('ENC:')) {
          const pass = localStorage.getItem('focusmoon_inbox_password');
          if (!pass) {
            setIsLocked(true);
            setItems([]);
            return;
          }
          const decrypted = await decryptText(saved, pass);
          if (decrypted.startsWith('Locked')) {
            setIsLocked(true);
            setItems([]);
          } else {
            setIsLocked(false);
            setItems(JSON.parse(decrypted));
          }
        } else {
          setItems(JSON.parse(saved));
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('focusmoon_inbox_updated', handleUpdate);
    return () => window.removeEventListener('focusmoon_inbox_updated', handleUpdate);
  }, []);

  const saveItems = async (newItems: InboxItem[]) => {
    setItems(newItems);
    const pass = localStorage.getItem('focusmoon_inbox_password');
    const jsonStr = JSON.stringify(newItems);
    if (pass) {
      const enc = await encryptText(jsonStr, pass);
      localStorage.setItem('focusmoon_inbox', enc);
    } else {
      localStorage.setItem('focusmoon_inbox', jsonStr);
    }
    window.dispatchEvent(new Event('focusmoon_inbox_updated'));
  };

`;

content = content.replace("export default function Inbox({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {\n  const { actualTheme } = useTheme();\n  const [items, setItems] = useState<InboxItem[]>(() => {", replacement + "  const dummy = (() => {");

const effectReplacement = `  useEffect(() => {
    if (isOpen && !isLocked) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isLocked]);`;

content = content.replace(/useEffect\(\(\) => \{\n    const handleUpdate = \(\) => \{[\s\S]*?\}, \[items\]\);\n\n  useEffect\(\(\) => \{\n    if \(isOpen\) \{\n      setTimeout\(\(\) => inputRef\.current\?\.focus\(\), 100\);\n    \}\n  \}, \[isOpen\]\);/, effectReplacement);

const handleAddReplacement = `  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLocked) return;

    const nlpWorker = new Worker(new URL('../workers/nlpWorker.ts', import.meta.url), { type: 'module' });
    
    nlpWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'PARSE_COMPLETE') {
        saveItems([payload, ...items]);
        setText('');
        nlpWorker.terminate();
      }
    };
    nlpWorker.postMessage({ type: 'PARSE_NLP', payload: { text } });
  };

  const handleDelete = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
  };
`;

content = content.replace(/const handleAdd = \(e: React\.FormEvent\) => \{[\s\S]*?  const handleDelete = \(id: string\) => \{\n    setItems\(items\.filter\(i => i\.id !== id\)\);\n  \};/, handleAddReplacement);

fs.writeFileSync('src/components/Inbox.tsx', content);
