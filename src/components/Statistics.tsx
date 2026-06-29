import { Discipline } from '../types';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface Props {
  disciplines: Discipline[];
}

export default function Statistics({ disciplines }: Props) {
  // Aggregate task statistics per discipline
  const disciplineStats = disciplines.map(d => {
    let total = 0;
    let completed = 0;
    if (d.themes) {
      d.themes.forEach(t => {
        total += t.tasks.length;
        completed += t.tasks.filter(tsk => tsk.status === 'done').length;
      });
    }
    return {
      name: d.name,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });

  const overallTotal = disciplineStats.reduce((acc, curr) => acc + curr.total, 0);
  const overallCompleted = disciplineStats.reduce((acc, curr) => acc + curr.completed, 0);
  const overallMissed = overallTotal - overallCompleted;
  
  const pieData = [
    { name: 'Выполнено', value: overallCompleted },
    { name: 'Осталось', value: overallMissed },
  ];
  
  const COLORS = ['#00b55d', '#f87171'];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="mb-10 pt-4 md:pt-0">
        <h1 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">Статистика</h1>
        <p className="text-base md:text-lg text-theme-muted">Анализ выполнения задач по дисциплинам</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-card border border-theme-border shadow-sm p-6 rounded-2xl"
        >
          <h2 className="text-xl font-bold text-theme-text mb-6">Прогресс по дисциплинам (%)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disciplineStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} allowDecimals={false} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#4de082' }}
                />
                <Bar dataKey="percentage" fill="#494bd6" radius={[6, 6, 0, 0]} name="Успех %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-theme-card border border-theme-border shadow-sm p-6 rounded-2xl"
        >
          <h2 className="text-xl font-bold text-theme-text mb-6">Общее соотношение задач</h2>
          <div className="h-64 w-full flex items-center justify-center">
            {overallTotal > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-theme-muted text-center">Нет задач для отображения</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
