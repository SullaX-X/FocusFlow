export interface Discipline {
  id: string;
  name: string;
  description: string;
  history: Record<string, boolean>;
  icon: string;
  color: string;
  createdAt: string;
}

export type Tab = 'dashboard' | 'disciplines' | 'statistics' | 'settings';
