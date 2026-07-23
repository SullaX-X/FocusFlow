import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const toRemove = `    // Also include stats object actual minutes if we are not in demo mode
    if (!showDemo || hasActualSessions) { 
       Object.entries(stats?.dailyMinutes || {}).forEach(([dateStr, mins]) => {
         minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + (mins as number);
       });
    }`;

const toRemove2 = `    // Also include stats object actual minutes if we are not in demo mode
    if (!showDemo || hasActualSessions) { 
       Object.entries(stats?.dailyMinutes || {}).forEach(([dateStr, mins]) => {
         minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + (mins as number);
       });
    }
`;

content = content.replace(toRemove, '');
content = content.replace(toRemove2, '');

fs.writeFileSync('src/components/Statistics.tsx', content);
