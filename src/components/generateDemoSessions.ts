import { Session } from '../types';

export const generateDemoSessions = (): Session[] => {
  const demoSessions: Session[] = [];
  const now = Date.now();
  const tasks = ['Системный анализ', 'Глубокое проектирование', 'Рефакторинг ядра', 'Визуализация данных', 'Спринт разработки'];
  
  for (let i = 0; i < 40; i++) {
    const startTime = now - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000 - Math.random() * 8 * 60 * 60 * 1000;
    const duration = [20, 30, 45, 60, 95, 120, 40, 55, 70, 85, 100, 35][i % 12];
    demoSessions.push({
      id: `demo-${i}`,
      taskTitle: tasks[i % tasks.length],
      startTime: new Date(startTime).toISOString(),
      duration,
      isDeepWork: duration > 45,
      energy: duration > 60 ? 'high' : 'low',
      categoryColor: '#ff69b4',
      disciplineId: 'demo',
      isEarlyMorning: new Date(startTime).getHours() < 9
    });
  }
  return demoSessions;
};
