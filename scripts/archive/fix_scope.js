import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

// Remove the bad line
content = content.replace(
  '  const scrollRef = useRef<HTMLDivElement>(null);\n  useEffect(() => { if (scrollRef.current) { scrollRef.current.scrollLeft = scrollRef.current.scrollWidth; } }, [selectedYear, activityData]);\n',
  ''
);

const beforeActivityData = `  const activityData = useMemo(() => {`;
const insertAfter = `  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [selectedYear, activityData]);`;

content = content.replace(
  beforeActivityData,
  insertAfter + '\n\n' + beforeActivityData
);

fs.writeFileSync('src/components/Statistics.tsx', content);
