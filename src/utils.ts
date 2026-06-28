export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPast7Days(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
}

export function calculateStreak(history: Record<string, boolean>): number {
  if (!history) return 0;
  
  let currentStreak = 0;
  const d = new Date();
  // We check from today backwards
  let checkDate = formatDate(d);
  
  // If not done today, we can check yesterday. If not done yesterday either, streak is 0.
  if (!history[checkDate]) {
    d.setDate(d.getDate() - 1);
    checkDate = formatDate(d);
    if (!history[checkDate]) {
      return 0; // Missed both today and yesterday
    }
  }
  
  // Count backwards
  while (history[checkDate]) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
    checkDate = formatDate(d);
  }
  
  return currentStreak;
}

export function calculateGlobalStreak(disciplines: any[]): number {
  if (!disciplines || disciplines.length === 0) return 0;
  
  let currentStreak = 0;
  const d = new Date();
  let checkDate = formatDate(d);
  
  const allDoneOnDate = (dateStr: string) => {
    // Only check disciplines that existed on or before this date
    const activeDisciplines = disciplines.filter(d => !d.createdAt || d.createdAt <= dateStr);
    if (activeDisciplines.length === 0) return false;
    return activeDisciplines.every(d => d.history && d.history[dateStr]);
  };
  
  if (!allDoneOnDate(checkDate)) {
    d.setDate(d.getDate() - 1);
    checkDate = formatDate(d);
    if (!allDoneOnDate(checkDate)) {
      return 0;
    }
  }
  
  while (allDoneOnDate(checkDate)) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
    checkDate = formatDate(d);
  }
  
  return currentStreak;
}
