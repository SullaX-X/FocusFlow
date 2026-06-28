import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2 } from 'lucide-react';
import { Discipline } from '../types';
import { getPast7Days, formatDate, calculateStreak } from '../utils';
import ConfirmModal from './ConfirmModal';

export default function Disciplines({ disciplines, toggleDay, addDiscipline, deleteDiscipline }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const past7Days = getPast7Days();

  const confirmDelete = (id: string) => {
    deleteDiscipline(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pt-4 md:pt-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Дисциплины</h2>
          <p className="text-slate-500 dark:text-[#908fa0] text-sm md:text-base">Отслеживайте свои ежедневные обязательства и создавайте темп.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#494bd6] dark:hover:bg-[#c0c1ff] dark:hover:text-[#1000a9] px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 dark:shadow-[#494bd6]/20 whitespace-nowrap w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Добавить дисциплину
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {disciplines.map((d: Discipline) => (
            <motion.div 
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] rounded-2xl p-4 md:p-5 hover:border-slate-300 dark:hover:border-[#464554] transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-opacity-20 shrink-0" style={{ backgroundColor: `${d.color}20`, color: d.color, border: `1px solid ${d.color}40` }}>
                    <span className="material-symbols-outlined text-xl md:text-2xl">{d.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white truncate max-w-[150px] sm:max-w-[300px]">{d.name}</h3>
                    <p className="text-slate-500 dark:text-[#908fa0] text-xs md:text-sm mt-1 truncate max-w-[150px] sm:max-w-[300px]">{d.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <div className="flex items-center gap-1 md:gap-1.5 bg-green-50 dark:bg-[#1c2b3c] px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-green-100 dark:border-[#273647]">
                    <span className="material-symbols-outlined text-green-500 dark:text-[#4de082] text-sm md:text-base" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                    <span className="text-green-600 dark:text-[#4de082] font-bold text-xs md:text-sm">{calculateStreak(d.history)}</span>
                  </div>
                  <button onClick={() => setDeleteConfirmId(d.id)} className="text-slate-400 hover:text-red-500 dark:text-[#908fa0] dark:hover:text-[#ffb4ab] transition-colors p-1 md:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-[#93000a]/20">
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-1 md:gap-2 justify-between">
                {past7Days.map((date, i) => {
                  const isDone = !!d.history[date];
                  const [y, m, dDay] = date.split('-');
                  const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(dDay));
                  const dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dObj.getDay()];
                  const isToday = date === formatDate(new Date());
                  const isPast = date < formatDate(new Date());

                  return (
                    <div key={date} className="flex flex-col items-center gap-1.5 md:gap-2 flex-1">
                      <span className={`text-[10px] md:text-xs font-medium ${isToday ? 'text-blue-600 dark:text-[#c0c1ff]' : 'text-slate-500 dark:text-[#908fa0]'}`}>{dayName}</span>
                      <button
                        onClick={() => toggleDay(d.id, date)}
                        className={`w-full aspect-square rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                          isDone 
                            ? 'bg-green-500 border-green-500 dark:bg-[#00b55d] dark:border-[#00b55d] shadow-[0_0_12px_rgba(34,197,94,0.3)] dark:shadow-[0_0_12px_rgba(0,181,93,0.3)]' 
                            : isToday 
                              ? 'bg-blue-50 border-blue-300 dark:bg-[#1c2b3c] dark:border-[#494bd6]/50'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-[#051424] dark:border-[#273647] dark:hover:border-[#464554]'
                        }`}
                      >
                        {isDone && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <span className="material-symbols-outlined text-white dark:text-[#003919] font-bold text-sm md:text-lg">check</span>
                          </motion.div>
                        )}
                        {!isDone && isPast && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <span className="material-symbols-outlined text-slate-400/70 dark:text-[#908fa0]/50 font-bold text-sm md:text-lg">close</span>
                          </motion.div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {disciplines.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-[#122131] rounded-2xl border border-dashed border-slate-300 dark:border-[#273647]">
            <p className="text-slate-500 dark:text-[#908fa0]">Дисциплины еще не добавлены. Создайте новую, чтобы начать отслеживание!</p>
          </div>
        )}
      </div>

      {isAdding && <AddDisciplineModal onClose={() => setIsAdding(false)} onAdd={addDiscipline} />}
      {deleteConfirmId && (
        <ConfirmModal 
          title="Удаление дисциплины" 
          message="Вы уверены, что хотите удалить эту дисциплину? Это действие нельзя отменить." 
          onConfirm={() => confirmDelete(deleteConfirmId)} 
          onCancel={() => setDeleteConfirmId(null)} 
        />
      )}
    </div>
  );
}

function AddDisciplineModal({ onClose, onAdd }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('menu_book');
  const [color, setColor] = useState('#494bd6');
  const [showConfirm, setShowConfirm] = useState(false);

  const icons = ['menu_book', 'fitness_center', 'psychology', 'self_improvement', 'laptop_mac', 'payments', 'edit'];
  const colors = ['#494bd6', '#4de082', '#ffb783', '#ec4899', '#8b5cf6', '#eab308'];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!name) return;
    setShowConfirm(true);
  };

  const confirmAdd = () => {
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      icon,
      color,
      history: {},
      createdAt: formatDate(new Date())
    });
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-[#010f1f]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      {showConfirm && (
        <ConfirmModal 
          title="Добавление дисциплины" 
          message="Вы уверены, что хотите добавить эту дисциплину?" 
          onConfirm={confirmAdd} 
          onCancel={() => setShowConfirm(false)} 
        />
      )}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Новая дисциплина</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-[#908fa0] mb-2">Название</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-[#051424] border dark:border-[#273647] rounded-xl px-4 py-3 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-[#494bd6] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#494bd6] transition-all"
              placeholder="например, Глубокая работа"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-[#908fa0] mb-2">Описание</label>
            <input 
              type="text" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-[#051424] border dark:border-[#273647] rounded-xl px-4 py-3 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-[#494bd6] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#494bd6] transition-all"
              placeholder="например, 2 часа без отвлечений"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-[#908fa0] mb-2">Иконка</label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all border ${
                    icon === i ? 'bg-blue-50 dark:bg-[#494bd6]/20 border-2 border-blue-500 dark:border-[#494bd6] text-blue-600 dark:text-[#c0c1ff]' : 'bg-slate-50 dark:bg-[#051424] border-slate-200 dark:border-[#273647] text-slate-500 dark:text-[#908fa0] hover:border-slate-300 dark:hover:border-[#464554]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{i}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-[#908fa0] mb-2">Цвет</label>
            <div className="flex gap-3">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#122131] scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c, '--tw-ring-color': c } as any}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-[#273647] mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-slate-600 dark:text-[#908fa0] font-medium hover:bg-slate-100 dark:hover:bg-[#1c2b3c] transition-colors"
            >
              Отмена
            </button>
            <button 
              type="submit"
              disabled={!name}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-[#494bd6] text-white font-medium dark:hover:bg-[#c0c1ff] dark:hover:text-[#1000a9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Создать
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
