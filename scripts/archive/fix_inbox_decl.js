import fs from 'fs';
let content = fs.readFileSync('src/components/Inbox.tsx', 'utf8');

// The original file had the declarations again after my replacement
content = content.replace("const dummy = (() => {\n    try {", "/*\n    try {");
content = content.replace("  });\n  const [text, setText] = useState('');\n  const inputRef = useRef<HTMLInputElement>(null);", "*/");

fs.writeFileSync('src/components/Inbox.tsx', content);
