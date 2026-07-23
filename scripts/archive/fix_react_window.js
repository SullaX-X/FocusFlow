import fs from 'fs';
let content = fs.readFileSync('src/components/Inbox.tsx', 'utf8');

content = content.replace("import reactWindow from 'react-window';\nconst { FixedSizeList: List } = reactWindow;", "import { List } from 'react-window';");

fs.writeFileSync('src/components/Inbox.tsx', content);
