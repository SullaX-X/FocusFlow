import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add global class based on showBackgroundEffects
const effectHook = `
  useEffect(() => {
    if (!showBackgroundEffects) {
      document.body.classList.add('no-bg-effects');
    } else {
      document.body.classList.remove('no-bg-effects');
    }
  }, [showBackgroundEffects]);
`;
content = content.replace('const [isStorageLoaded, setIsStorageLoaded] = useState(false);', 'const [isStorageLoaded, setIsStorageLoaded] = useState(false);\n' + effectHook);

fs.writeFileSync('src/App.tsx', content);
