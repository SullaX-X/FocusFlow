import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const oldLogic = `  const originalSessions: Session[] = useMemo(() => stats?.sessions || [], [stats?.sessions]);
  const hasActualSessions = originalSessions.length > 0;
  
  const [showDemo, setShowDemo] = useState(!hasActualSessions);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (hasActualSessions) {
      setShowDemo(false);
    }
  }, [hasActualSessions]);

  const sessions = useMemo(() => {
    if (showDemo && !hasActualSessions) {
      return generateDemoSessions();
    }
    return originalSessions;
  }, [showDemo, originalSessions, hasActualSessions]);`;

const newLogic = `  const originalSessions: Session[] = useMemo(() => stats?.sessions || [], [stats?.sessions]);
  const hasLegacyData = Object.keys(stats?.dailyMinutes || {}).length > 0;
  const hasActualData = originalSessions.length > 0 || hasLegacyData;
  
  const [showDemo, setShowDemo] = useState(!hasActualData);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (hasActualData && !showDemo) {
      // Just ensure it's false initially if they have data
    }
  }, [hasActualData]);

  const sessions = useMemo(() => {
    if (showDemo) {
      return generateDemoSessions();
    }
    return originalSessions;
  }, [showDemo, originalSessions]);`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/Statistics.tsx', content);
