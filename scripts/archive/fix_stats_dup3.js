import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /const sessionsByDate: Record<string, Session\[\]> = \{\};[\s\S]*?const days = \[\];/m;
const replacement = `const sessionsByDate: Record<string, Session[]> = {};
    const minutesByDate: Record<string, number> = {};
    
    sessions.forEach(s => {
      const dateStr = formatDate(new Date(s.startTime));
      if (!sessionsByDate[dateStr]) sessionsByDate[dateStr] = [];
      sessionsByDate[dateStr].push(s);
      minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + s.duration;
    });

    // Merge legacy dailyMinutes if it exists
    if (!showDemo || hasActualSessions) {
       Object.entries(stats?.dailyMinutes || {}).forEach(([dateStr, mins]) => {
         // Only use dailyMinutes if it's larger (meaning sessions are missing or incomplete for this day)
         if (!minutesByDate[dateStr] || minutesByDate[dateStr] < (mins as number)) {
            minutesByDate[dateStr] = mins as number;
         }
       });
    }

    const days = [];`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Statistics.tsx', content);
