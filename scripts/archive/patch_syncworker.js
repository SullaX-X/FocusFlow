import fs from 'fs';

let content = fs.readFileSync('src/workers/syncWorker.ts', 'utf8');

const oldWorker = `    let mergedDisciplines = [...localDisciplines];
    let mergedStats = { ...localStats };
    
    let mergedInbox: any = typeof localInbox === 'string' ? localInbox : (Array.isArray(localInbox) ? [...localInbox] : []);`;

const newWorker = `    let mergedDisciplines = [...localDisciplines];
    let mergedStats = { ...localStats };
    
    // Merge stats (e.g. max values, combined dust, etc. if needed, but for now take remote if exists and local is empty/smaller)
    if (remoteData.stats) {
       // Simple merge: keep higher focusDust, union of dailyMinutes and disciplineMinutes, union of unlockedAchievements
       mergedStats.focusDust = Math.max(mergedStats.focusDust || 0, remoteData.stats.focusDust || 0);
       
       const remoteDaily = remoteData.stats.dailyMinutes || {};
       const localDaily = mergedStats.dailyMinutes || {};
       const combinedDaily = { ...localDaily };
       for (const date in remoteDaily) {
         combinedDaily[date] = Math.max(combinedDaily[date] || 0, remoteDaily[date]);
       }
       mergedStats.dailyMinutes = combinedDaily;
       
       const remoteUnlocks = remoteData.stats.unlockedAchievements || [];
       const localUnlocks = mergedStats.unlockedAchievements || [];
       mergedStats.unlockedAchievements = Array.from(new Set([...localUnlocks, ...remoteUnlocks]));
    }
    
    let mergedInbox: any = typeof localInbox === 'string' ? localInbox : (Array.isArray(localInbox) ? [...localInbox] : []);`;

content = content.replace(oldWorker, newWorker);
fs.writeFileSync('src/workers/syncWorker.ts', content);

