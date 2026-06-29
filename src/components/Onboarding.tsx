import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline } from '../types';

export default function Onboarding({ onComplete }: { onComplete: (discipline?: Discipline) => void }) {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: goal,
          level: 'Для начинающих',
          time: '30 минут'
        })
      });
      const resData = await response.json();
      if (resData.success) {
        const generatedThemes = resData.data.themes?.map((t: any, idx: number) => ({
          id: `t${idx}`,
          name: t.name,
          tasks: (t.tasks || []).map((task: any, tIdx: number) => ({
            id: `t${idx}_${tIdx}`,
            title: task.title,
            description: task.description,
            status: 'plan',
            energy: task.energy,
            createdAt: new Date().toISOString()
          }))
        })) || [];

        const newDiscipline: Discipline = {
          id: Math.random().toString(36).substr(2, 9),
          name: goal,
          description: 'Моя главная цель на этот месяц',
          icon: 'target',
          color: '#494bd6',
          history: {},
          createdAt: new Date().toISOString(),
          themes: generatedThemes
        };
        onComplete(newDiscipline);
      } else {
        setError('Не удалось сгенерировать план. Попробуйте еще раз.');
      }
    } catch (e) {
      console.error(e);
      setError('Ошибка сети. Проверьте подключение.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[200] flex items-center justify-center p-6 text-theme-text">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[128px] opacity-20 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20 mix-blend-screen pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="material-symbols-outlined text-4xl text-blue-400">rocket_launch</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Привет!<br />Добро пожаловать в FocusFlow.</h1>
        <p className="text-slate-400 text-lg mb-10">Какую главную цель ты хочешь достичь в ближайший месяц?</p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <input 
            type="text" 
            value={goal}
            onChange={e => setGoal(e.target.value)}
            disabled={isGenerating}
            placeholder="Например: Выучить React, Подготовиться к марафону..."
            className="w-full bg-theme-card border border-theme-border text-white rounded-2xl px-6 py-5 text-lg outline-none focus:border-blue-500 transition-colors shadow-inner"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-4 mt-6">
            <button 
              type="button"
              onClick={() => onComplete()}
              disabled={isGenerating}
              className="flex-1 py-4 px-6 rounded-2xl text-slate-400 hover:text-white hover:bg-theme-card transition-colors"
            >
              Пропустить
            </button>
            <button 
              type="submit"
              disabled={!goal.trim() || isGenerating}
              className="flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              {isGenerating ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Создаем план...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Сгенерировать план ИИ
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
