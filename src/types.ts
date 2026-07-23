export type EnergyLevel = 'high' | 'low';
export type TaskStatus = 'plan' | 'in_progress' | 'done';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  disciplineId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  energy?: EnergyLevel;
  contentUrl?: string; // For summarizing
  summary?: string;
  quiz?: string[]; // Questions from AI
  subtasks?: SubTask[];
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Discipline {
  id: string;
  name: string;
  description: string;
  history: Record<string, boolean>; // Still keeping for heatmap/streak
  icon: string;
  color: string;
  createdAt: string;
  themes?: Theme[]; // Optional for backwards compatibility
}

export interface InboxItem {
  id: string;
  text: string;
  createdAt: string;
  metadata?: {
    date?: string;
    energy?: string;
    category?: string;
  };
}

export interface Session {
  id: string;
  startTime: string; // ISO
  duration: number; // minutes
  disciplineId: string | 'free';
  isDeepWork: boolean; // no pauses
  energy: EnergyLevel;
  isEarlyMorning: boolean; // before 9 AM
  taskTitle?: string;
  categoryColor?: string;
}

export type Tab = 'dashboard' | 'disciplines' | 'statistics' | 'settings' | 'profile';

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPast14Days(): string[] {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
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
