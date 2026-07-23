import fs from 'fs';

// 1. Update useAchievements.ts
let useAch = fs.readFileSync('src/useAchievements.ts', 'utf8');

const oldUseAch = `  useEffect(() => {
    if (!stats) return;

    const totalMinutes = Object.values(stats?.disciplineMinutes || {}).reduce((acc: number, cur: any) => acc + cur, 0) as number;
    const focusDust = stats?.focusDust || 0;
    const activeDays = Object.keys(stats?.dailyMinutes || {}).length;

    const getAchievementProgress = (ach: any) => {
      switch(ach.type) {
        case 'activeDays': return activeDays;
        case 'totalMinutes': return totalMinutes;
        case 'focusDust': return focusDust;
        default: return 0;
      }
    };

    const unlockedNow = ACHIEVEMENTS.filter(ach => getAchievementProgress(ach) >= ach.max);
    
    try {
      const previouslyUnlocked = JSON.parse(localStorage.getItem('focusmoon_unlocked_achievements') || '[]');
      
      const newUnlocks = unlockedNow.filter(ach => !previouslyUnlocked.includes(ach.id));
      
      if (newUnlocks.length > 0) {
        // Just show the first one, then save all
        setNewlyUnlocked(newUnlocks[0]);
        localStorage.setItem('focusmoon_unlocked_achievements', JSON.stringify([...previouslyUnlocked, ...newUnlocks.map(a => a.id)]));
      }
    } catch (e) {
      console.warn("Error parsing unlocked achievements", e);
    }
  }, [stats]);`;

const newUseAch = `  useEffect(() => {
    if (!stats) return;

    // Считаем минуты единообразно, как в Profile.tsx
    const totalMinutes = Object.values(stats?.dailyMinutes || {}).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0) as number;
    const focusDust = stats?.focusDust || 0;
    const activeDays = Object.keys(stats?.dailyMinutes || {}).length;

    const getAchievementProgress = (ach: any) => {
      switch(ach.type) {
        case 'activeDays': return activeDays;
        case 'totalMinutes': return totalMinutes;
        case 'focusDust': return focusDust;
        default: return 0;
      }
    };

    const unlockedNow = ACHIEVEMENTS.filter(ach => getAchievementProgress(ach) >= ach.max);
    
    // Используем массив unlockedAchievements из stats, чтобы состояние "показано" синхронизировалось
    const previouslyUnlocked = stats.unlockedAchievements || [];
    const newUnlocks = unlockedNow.filter(ach => !previouslyUnlocked.includes(ach.id));
    
    if (newUnlocks.length > 0) {
      // Just show the first one, the App will need to update stats with new unlocks
      setNewlyUnlocked(newUnlocks[0]);
    }
  }, [stats]);`;

useAch = useAch.replace(oldUseAch, newUseAch);
fs.writeFileSync('src/useAchievements.ts', useAch);


// 2. Update App.tsx to handle acknowledging the newly unlocked achievements
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// replace setNewlyUnlocked(null) with a function that also updates stats
const oldModalClose = `onClose={() => setNewlyUnlocked(null)}`;
const newModalClose = `onClose={() => {
          setStats((prev: any) => ({
            ...prev,
            unlockedAchievements: [...(prev.unlockedAchievements || []), newlyUnlocked.id]
          }));
          setNewlyUnlocked(null);
        }}`;

appTsx = appTsx.replace(oldModalClose, newModalClose);
fs.writeFileSync('src/App.tsx', appTsx);

