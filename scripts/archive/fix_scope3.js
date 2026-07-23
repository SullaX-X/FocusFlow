import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const afterActivityData = `  }, [sessions, stats?.dailyMinutes, selectedYear, showDemo, hasActualSessions]);`;

const insertAfter = `
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [selectedYear, activityData]);`;

content = content.replace(
  afterActivityData,
  afterActivityData + '\n' + insertAfter
);

fs.writeFileSync('src/components/Statistics.tsx', content);
