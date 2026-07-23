import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const afterSessionsByDate = `    sessions.forEach(s => {
      const dateStr = formatDate(new Date(s.startTime));
      if (!sessionsByDate[dateStr]) sessionsByDate[dateStr] = [];
      sessionsByDate[dateStr].push(s);
      minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + s.duration;
    });`;

const addBack = `    // Merge legacy dailyMinutes if it exists
    if (!showDemo) {
       Object.entries(stats?.dailyMinutes || {}).forEach(([dateStr, mins]) => {
         // Only use dailyMinutes if it's larger (meaning sessions are missing or incomplete for this day)
         if (!minutesByDate[dateStr] || minutesByDate[dateStr] < (mins as number)) {
            minutesByDate[dateStr] = mins as number;
         }
       });
    }`;

content = content.replace(afterSessionsByDate, afterSessionsByDate + '\n\n' + addBack);
fs.writeFileSync('src/components/Statistics.tsx', content);
