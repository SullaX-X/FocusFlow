import fs from 'fs';
let content = fs.readFileSync('src/components/Statistics.tsx', 'utf8');

const regex = /\/\/ Pre-compute sessions map by date string for O\(1\) lookup/;
const replacement = `    // Find the first ever app usage date (either from sessions or today)
    let firstUsageDate = new Date();
    if (sessions.length > 0) {
      const earliestSession = sessions.reduce((earliest, s) => {
        const d = new Date(s.startTime);
        return d < earliest ? d : earliest;
      }, new Date());
      firstUsageDate = earliestSession;
    }
    // Also check legacy dailyMinutes just in case
    if (stats?.dailyMinutes) {
      Object.keys(stats.dailyMinutes).forEach(dateStr => {
        const d = new Date(dateStr);
        if (d < firstUsageDate) firstUsageDate = d;
      });
    }
    firstUsageDate.setHours(0, 0, 0, 0);

    // Pre-compute sessions map by date string for O(1) lookup`;

content = content.replace(regex, replacement);

const daysLoopRegex = /const isFuture = dDate > today;\n      const isOutsideYear = dDate\.getFullYear\(\) !== currentYear;\n      const isPast = dDate < new Date\(currentYear, 0, 1\);/;
const newDaysLoop = `const isFuture = dDate > today;
      const isOutsideYear = dDate.getFullYear() !== currentYear;
      const isBeforeAppExisted = dDate < firstUsageDate;`;

content = content.replace(daysLoopRegex, newDaysLoop);

const pushRegex = /isFuture,\n        isOutsideYear,\n        label:/;
const newPush = `isFuture,\n        isOutsideYear,\n        isBeforeAppExisted,\n        label:`;

content = content.replace(pushRegex, newPush);

const styleRegex = /style=\{day\.isOutsideYear && day\.minutes === 0 \? \{ opacity: 0, pointerEvents: 'none' \} : getIntensityInlineStyle\(day\.minutes, day\.isOutsideYear, day\.isFuture\)\}/;
const newStyle = `style={(day.isOutsideYear || day.isBeforeAppExisted) && day.minutes === 0 ? { opacity: 0, pointerEvents: 'none' } : getIntensityInlineStyle(day.minutes, day.isOutsideYear || day.isBeforeAppExisted, day.isFuture)}`;

content = content.replace(styleRegex, newStyle);

fs.writeFileSync('src/components/Statistics.tsx', content);
