import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

// Add a ref to the scrollable container
content = content.replace(
  '<div className="relative z-10 w-full overflow-x-auto pb-4 custom-scrollbar">',
  '<div className="relative z-10 w-full overflow-x-auto pb-4 custom-scrollbar" ref={scrollRef}>'
);

// Add scrollRef and useEffect
const hookOld = `  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());`;
const hookNew = `  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [selectedYear, activityData]);`;
content = content.replace(hookOld, hookNew);

// Fix the gap of the flex row (was gap-[6px], make it gap-[4px] and cells w-[14px])
// Actually let's just make the cells 14px and the gap 4px.
// Wait, the column gap:
content = content.replace(
  '<div className="flex gap-[6px]">',
  '<div className="flex gap-[4px]">'
);
content = content.replace(
  'className="flex gap-[6px]"',
  'className="flex gap-[4px]"'
);
content = content.replace(
  'className="flex flex-col gap-[6px]"',
  'className="flex flex-col gap-[4px]"'
);
// Also for Weekday labels
content = content.replace(
  '<div className="flex flex-col gap-[6px] text-[9px]',
  '<div className="flex flex-col gap-[4px] text-[9px]'
);

// Replace cell size to fixed px
content = content.replace(
  /className=\`w-3\.5 h-3\.5 md:w-4 md:h-4 rounded-\[4px\]/g,
  'className={`w-[14px] h-[14px] rounded-[4px]'
);

// Fix month labels: style={{ left: \`\${m.index * 18}px\` }} (14px + 4px gap)
content = content.replace(
  /style=\{\{ left: \`\\\$\\{m\.index \* 16\\}px\` \}\}/g,
  'style={{ left: `${m.index * 18}px` }}'
);

fs.writeFileSync('src/components/Statistics.tsx', content);
console.log("Fixed matrix scroll and layout");
