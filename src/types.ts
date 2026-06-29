export type EnergyLevel = 'high' | 'low';
export type TaskStatus = 'plan' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  energy?: EnergyLevel;
  contentUrl?: string; // For summarizing
  summary?: string;
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
}

export type Tab = 'dashboard' | 'disciplines' | 'statistics' | 'settings';

