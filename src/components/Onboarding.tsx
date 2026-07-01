import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline } from '../types';
import { generateContent } from '../aiClient';

export default function Onboarding({ onComplete }: { onComplete: (discipline?: Discipline) => void }) {
  const [slide, setSlide] = useState(1);
  const [goal, setGoal] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiUrl, setOpenaiUrl] = useState('');
  const [openaiModel, setOpenaiModel] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleNextSlide = () => {
    if (slide === 2) {
      if (aiProvider === 'gemini' && apiKey.trim()) {
        localStorage.setItem('focusflow_gemini_key', apiKey.trim());
      }
      localStorage.setItem('focusflow_ai_provider', aiProvider);
      if (aiProvider === 'openai' && openaiKey.trim()) {
        localStorage.setItem('focusflow_openai_key', openaiKey.trim());
        localStorage.setItem('focusflow_openai_url', openaiUrl.trim() || 'https://api.openai.com/v1');
        localStorage.setItem('focusflow_openai_model', openaiModel.trim() || 'gpt-4o-mini');
      }
    }
    setSlide(slide + 1);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    let savedKey = '';
    const provider = localStorage.getItem('focusflow_ai_provider') || 'gemini';
    if (provider === 'gemini') {
      savedKey = localStorage.getItem('focusflow_gemini_key') || '';
    } else {
      savedKey = localStorage.getItem('focusflow_openai_key') || '';
    }

    try {
      const prompt = `Создай подробный план обучения по теме "${goal}" (уровень: Для начинающих, 30 минут в день). Выдай ответ строго в формате JSON без маркдауна и лишнего текста. 
      Формат: {"themes": [{"name": "название темы", "tasks": [{"title": "конкретная задача", "description": "что именно сделать", "energy": "high"}]}]}`;

      const resData = await generateContent(prompt, savedKey);
      
      if (resData && resData.themes) {
        const generatedThemes = resData.themes.map((t: any, idx: number) => ({
          id: `theme_${idx}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: t.name,
          tasks: (t.tasks || []).map((task: any, tIdx: number) => ({
            id: `task_${idx}_${tIdx}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title: task.title,
            description: task.description,
            status: 'plan',
            energy: task.energy || 'high',
            createdAt: new Date().toISOString()
          }))
        }));

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
        setError('Не удалось сгенерировать план. Проверьте правильность API ключа или лимиты провайдера.');
      }
    } catch (e: any) {
      console.error(e);
      setError('Ошибка генерации: ' + (e.message || 'неизвестная ошибка'));
    } finally {
      setIsGenerating(false);
    }
  };

  const hasKey = !!(localStorage.getItem('focusflow_ai_provider') === 'openai' ? localStorage.getItem('focusflow_openai_key') : localStorage.getItem('focusflow_gemini_key'));

  return (
    <div className="fixed inset-0 bg-theme-bg z-[200] flex items-center justify-center p-6 text-theme-text transition-colors duration-300">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-theme-accent rounded-full blur-[128px] opacity-20 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20 mix-blend-screen pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {slide === 1 && (
          <motion.div 
            key="slide1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-xl w-full text-center relative z-10"
          >
            <div className="w-20 h-20 bg-theme-accent/20 border border-theme-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl text-theme-accent">rocket_launch</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Добро пожаловать в FocusFlow.</h1>
            <p className="text-theme-muted text-lg mb-6 leading-relaxed">
              Это не просто таск-трекер. Это система глубокой работы. <br/><br/>
              Она построена на простой методологии:<br/>
              <span className="font-semibold text-theme-text mt-4 block mb-4">Дисциплина → Тема → Задача</span>
            </p>
            <ul className="text-sm text-theme-muted/80 space-y-2 mb-8 text-left max-w-sm mx-auto">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-theme-accent text-[18px]">auto_awesome</span> <b>ИИ Конспекты и Квизы</b> для быстрого обучения</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-theme-accent text-[18px]">timer</span> <b>Фокус-таймер</b> с режимом Zen Lock и фоновым шумом</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-theme-accent text-[18px]">checklist</span> <b>Чек-листы</b> внутри задач для разбиения целей</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-theme-accent text-[18px]">palette</span> Кастомизация <b>тем</b> (Nordic, Latte, OLED)</li>
            </ul>
            <button 
              onClick={() => setSlide(2)}
              className="py-4 px-8 rounded-2xl bg-theme-accent hover:bg-theme-accent/90 text-white font-semibold transition-all shadow-[0_0_20px_rgba(var(--color-theme-accent),0.3)]"
            >
              Начать
            </button>
          </motion.div>
        )}

        {slide === 2 && (
          <motion.div 
            key="slide2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-xl w-full text-center relative z-10"
          >
            <div className="w-20 h-20 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-4xl text-purple-400">key</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Интеграция ИИ</h1>
            <p className="text-theme-muted text-lg mb-8">
              Для автоматической генерации планов, конспектов и оценки задач приложению нужен API ключ.
            </p>
            <div className="space-y-4 max-w-sm mx-auto text-left">
              <div className="flex gap-2 p-1 bg-theme-bg/50 rounded-xl w-full border border-theme-border mb-6">
                <button
                  onClick={() => setAiProvider('gemini')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aiProvider === 'gemini' ? 'bg-theme-card shadow-sm text-theme-accent border border-theme-border' : 'text-theme-muted hover:text-theme-text'}`}
                >
                  Gemini
                </button>
                <button
                  onClick={() => setAiProvider('openai')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aiProvider === 'openai' ? 'bg-theme-card shadow-sm text-theme-accent border border-theme-border' : 'text-theme-muted hover:text-theme-text'}`}
                >
                  OpenRouter
                </button>
              </div>

              {aiProvider === 'gemini' ? (
                <>
                  <div className="text-left mb-2">
                    <label className="text-xs font-semibold text-theme-accent uppercase tracking-wider">Google Gemini API</label>
                  </div>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Вставьте ваш Gemini API Key..."
                    className="w-full bg-theme-card border border-theme-border text-theme-text rounded-2xl px-6 py-4 outline-none focus:border-theme-accent transition-colors mb-4"
                  />
                  <div className="bg-theme-accent/5 border border-theme-accent/10 rounded-xl p-4 text-xs text-theme-muted space-y-2">
                    <p className="font-bold text-theme-text">Как подключить Gemini:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Зайдите на <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-theme-accent hover:underline">Google AI Studio</a></li>
                      <li>Нажмите кнопку <b>Create API key</b></li>
                      <li>Скопируйте ключ и вставьте его выше</li>
                    </ol>
                    <p className="pt-1 italic opacity-70">Бесплатно для большинства регионов. Модель: gemini-2.5-flash-lite.</p>
                  </div>
                </>
              ) : (
                <div className="space-y-4 mb-6">
                  <div className="text-left">
                    <label className="text-xs font-semibold text-theme-accent uppercase tracking-wider">OpenRouter / OpenAI Compatible</label>
                  </div>
                  <input 
                    type="password" 
                    value={openaiKey}
                    onChange={e => setOpenaiKey(e.target.value)}
                    placeholder="API Key (напр. sk-or-v1-...)"
                    className="w-full bg-theme-card border border-theme-border text-theme-text rounded-2xl px-6 py-3 outline-none focus:border-theme-accent transition-colors"
                  />
                  <input 
                    type="url" 
                    value={openaiUrl}
                    onChange={e => setOpenaiUrl(e.target.value)}
                    placeholder="Base URL (напр. https://openrouter.ai/api/v1)"
                    className="w-full bg-theme-card border border-theme-border text-theme-text rounded-2xl px-6 py-3 outline-none focus:border-theme-accent transition-colors text-sm"
                  />
                  <input 
                    type="text" 
                    value={openaiModel}
                    onChange={e => setOpenaiModel(e.target.value)}
                    placeholder="Модель (напр. google/gemini-2.0-flash-exp:free)"
                    className="w-full bg-theme-card border border-theme-border text-theme-text rounded-2xl px-6 py-3 outline-none focus:border-theme-accent transition-colors text-sm"
                  />
                  <div className="bg-theme-accent/5 border border-theme-accent/10 rounded-xl p-4 text-xs text-theme-muted space-y-2">
                    <p className="font-bold text-theme-text">Как подключить OpenRouter:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Создайте ключ на <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-theme-accent hover:underline">openrouter.ai</a></li>
                      <li>URL по умолчанию: <code>https://openrouter.ai/api/v1</code></li>
                      <li>Выберите любую модель (есть бесплатные варианты)</li>
                    </ol>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleNextSlide}
                  className="flex-1 py-4 px-6 rounded-2xl text-theme-muted hover:text-theme-text hover:bg-theme-card transition-colors font-medium"
                >
                  Сделать позже
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="flex-1 py-4 px-6 rounded-2xl bg-theme-accent hover:bg-theme-accent/90 text-white font-semibold transition-all"
                >
                  Далее
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {slide === 3 && (
          <motion.div 
            key="slide3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl w-full text-center relative z-10"
          >
            <div className="w-20 h-20 bg-theme-accent/20 border border-theme-accent/30 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-4xl text-theme-accent">flag</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Быстрый старт</h1>
            <p className="text-theme-muted text-lg mb-10">Какую главную цель вы хотите достичь в этот месяц?</p>

            <form onSubmit={handleGenerate} className="space-y-4 max-w-md mx-auto">
              <input 
                type="text" 
                value={goal}
                onChange={e => setGoal(e.target.value)}
                disabled={isGenerating}
                placeholder="Например: Выучить React..."
                className="w-full bg-theme-card border border-theme-border text-theme-text rounded-2xl px-6 py-4 text-lg outline-none focus:border-theme-accent transition-colors"
                autoFocus
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-4 mt-6">
                <button 
                  type="button"
                  onClick={() => onComplete()}
                  disabled={isGenerating}
                  className="flex-1 py-4 px-6 rounded-2xl text-theme-muted hover:text-theme-text hover:bg-theme-card transition-colors font-medium"
                >
                  Пропустить
                </button>
                <button 
                  type="submit"
                  disabled={!goal.trim() || isGenerating}
                  className="flex-[2] btn-ai flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-theme-accent hover:bg-theme-accent/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <><span className="material-symbols-outlined animate-spin">sync</span> Создаем...</>
                  ) : (
                    <><span className="material-symbols-outlined">auto_awesome</span> {hasKey ? 'Сгенерировать план ИИ' : 'Сгенерировать план (Демо)'}</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
