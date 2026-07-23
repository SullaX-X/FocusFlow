import { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '../data/achievementsData';

export function useAchievements(stats: any) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<any | null>(null);

  useEffect(() => {
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
  }, [stats]);

  return { newlyUnlocked, setNewlyUnlocked };
}
