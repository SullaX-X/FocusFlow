import { Discipline } from '../types';
import { getPast7Days } from '../utils';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface Props {
  disciplines: Discipline[];
}

export default function Statistics({ disciplines }: Props) {
  const past7Days = getPast7Days().reverse();

  // Calculate completion for each day
  const data = past7Days.map(date => {
    const activeDisciplines = disciplines.filter(d => !d.createdAt || d.createdAt <= date);
    const total = activeDisciplines.length;
    const completed = activeDisciplines.filter(d => d.history[date]).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const [y, m, dDay] = date.split('-');
    const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(dDay));
    const dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dObj.getDay()];
    
    return {
      date: date,
      name: dayName,
      completed,
      total,
      percentage,
    };
  });

  // Calculate overall stats for Pie Chart
  const overallTotal = data.reduce((acc, curr) => acc + curr.total, 0);
  const overallCompleted = data.reduce((acc, curr) => acc + curr.completed, 0);
  const overallMissed = overallTotal - overallCompleted;
  
  const pieData = [
    { name: 'Выполнено', value: overallCompleted },
    { name: 'Пропущено', value: overallMissed },
  ];
  
  const COLORS = ['#00b55d', '#f87171'];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="mb-10 pt-4 md:pt-0">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Статистика</h1>
        <p className="text-base md:text-lg text-slate-500 dark:text-[#908fa0]">Анализ вашей продуктивности за неделю</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] shadow-sm p-6 rounded-2xl"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Выполненные дисциплины</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#4de082' }}
                />
                <Bar dataKey="completed" fill="#494bd6" radius={[6, 6, 0, 0]} name="Выполнено" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] shadow-sm p-6 rounded-2xl"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Процент успеха (%)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} allowDecimals={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#00b55d' }}
                />
                <Line type="monotone" dataKey="percentage" stroke="#00b55d" strokeWidth={3} dot={{ r: 5, fill: '#00b55d', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} name="Успех %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] shadow-sm p-6 rounded-2xl"
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Общее соотношение (неделя)</h2>
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
            <div className="text-slate-500 dark:text-[#908fa0] text-center">Нет данных для отображения</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
