import fs from 'fs';

let content = fs.readFileSync('src/components/Profile.tsx', 'utf8');

const oldMapping = `{Array.from(new Set(ACHIEVEMENTS.map(a => a.collection))).map(collection => {
            const collectionAchievements = ACHIEVEMENTS.filter(a => a.collection === collection);
            const visibleAchievements = showAllAchievements ? collectionAchievements : collectionAchievements.slice(0, 4);

            return (
              <div key={collection} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h4 className="text-md font-black text-theme-text uppercase tracking-widest">{collection}</h4>
                  <div className="flex-1 h-[1px] bg-theme-border/50"></div>
                </div>`;

const newMapping = `
          {Array.from(new Set(ACHIEVEMENTS.map(a => a.type))).map(type => {
            const collectionAchievements = ACHIEVEMENTS.filter(a => a.type === type);
            // Sort by max value so they appear in progressive order
            collectionAchievements.sort((a, b) => a.max - b.max);
            
            const visibleAchievements = showAllAchievements ? collectionAchievements : collectionAchievements.slice(0, 4);
            
            const typeLabels: Record<string, string> = {
              'activeDays': 'Активные дни',
              'focusDust': 'Пыльца',
              'totalMinutes': 'Минуты фокуса'
            };
            const collectionName = typeLabels[type] || type;

            return (
              <div key={type} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h4 className="text-md font-black text-theme-text uppercase tracking-widest">{collectionName}</h4>
                  <div className="flex-1 h-[1px] bg-theme-border/50"></div>
                </div>`;

content = content.replace(oldMapping, newMapping);
fs.writeFileSync('src/components/Profile.tsx', content);

