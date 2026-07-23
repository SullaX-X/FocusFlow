import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

// Remove the one I just added
content = content.replace(
  '  const scrollRef = useRef<HTMLDivElement>(null);\n  useEffect(() => {\n    if (scrollRef.current) {\n      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;\n    }\n  }, [selectedYear, activityData]);\n\n',
  ''
);

const afterActivityData = `    return days;
  }, [selectedYear, sessions, stats?.dailyMinutes, showDemo, hasActualSessions]);`;

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
