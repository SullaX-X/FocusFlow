import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Discipline } from '../../types';
import { generateContent } from '../../services/aiClient';
import { useTheme } from '../../services/ThemeContext';
import { useGlobalAudio } from '../../services/AudioContext';

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

  const { setTheme, theme: currentTheme } = useTheme();
  const { toggleSound, activeSounds } = useGlobalAudio();

  const handleNextSlide = () => {
    if (slide === 3) {
      if (aiProvider === 'gemini' && apiKey.trim()) {
        localStorage.setItem('focusmoon_gemini_key', apiKey.trim());
      }
      localStorage.setItem('focusmoon_ai_provider', aiProvider);
      if (aiProvider === 'openai' && openaiKey.trim()) {
        localStorage.setItem('focusmoon_openai_key', openaiKey.trim());
        localStorage.setItem('focusmoon_openai_url', openaiUrl.trim() || 'https://api.openai.com/v1');
        localStorage.setItem('focusmoon_openai_model', openaiModel.trim() || 'google/gemini-1.5-flash-latest');
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
    const provider = localStorage.getItem('focusmoon_ai_provider') || 'gemini';
    if (provider === 'gemini') {
      savedKey = localStorage.getItem('focusmoon_gemini_key') || '';
    } else {
      savedKey = localStorage.getItem('focusmoon_openai_key') || '';
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
      setError('Ошибка генерации: ' + (e.message || 'неизвестная ошибка'));
    } finally {
      setIsGenerating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  } as const;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#050714] text-white overflow-y-auto h-[100dvh] custom-scrollbar">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vh] bg-theme-accent/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vh] bg-theme-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30"
          style={{ 
            backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1.5px 1.5px at 150px 150px, #fff, transparent)',
            backgroundSize: '200px 200px'
          }} 
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4 md:p-12 pt-12 md:pt-20">
        <div className="w-full max-w-[600px] mx-auto flex flex-col items-center pb-32 md:pb-40">
          <AnimatePresence mode="wait">
            {slide === 1 && (
              <motion.div 
                key="slide1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full flex flex-col items-center text-center will-change-transform"
              >
                <motion.div variants={itemVariants} className="w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-10 relative">
                  <div className="absolute inset-0 bg-theme-accent/30 rounded-full blur-3xl animate-pulse" />
                  <motion.div 
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full glass-panel rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-[0_0_50px_rgba(var(--color-theme-accent-rgb),0.2)] relative z-10"
                  >
                    <span className="material-symbols-outlined text-6xl text-theme-accent">rocket_launch</span>
                  </motion.div>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[0.9]">
                  Твое время — <br/><span className="text-theme-accent drop-shadow-[0_0_20px_rgba(var(--color-theme-accent-rgb),0.5)]">это космос.</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-xl text-white/60 mb-12 max-w-md font-medium leading-relaxed">
                  Давай наведем в нем порядок и превратим твои цели в созвездия достижений.
                </motion.p>

                <motion.div variants={itemVariants} className="w-full grid grid-cols-1 gap-4 mb-12">
                  {[
                    { icon: 'auto_awesome', title: 'Атмосферное погружение', desc: 'Ambient-микшер и живое «Жидкое стекло»' },
                    { icon: 'temp_preferences_custom', title: 'Созвездия прогресса', desc: 'Задачи становятся звездами на карте' },
                    { icon: 'psychology', title: 'Умное планирование', desc: 'Персональные планы обучения от ИИ' }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/10 text-left backdrop-blur-xl group hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 rounded-2xl bg-theme-accent/10 flex items-center justify-center shrink-0 border border-theme-accent/20">
                        <span className="material-symbols-outlined text-theme-accent">{feat.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider">{feat.title}</h3>
                        <p className="text-xs text-white/40 font-medium">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {slide === 2 && (
              <motion.div 
                key="slide2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full flex flex-col items-center text-center"
              >
                <motion.div variants={itemVariants} className="w-24 h-24 mb-10 glass-panel rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl relative">
                   <div className="absolute inset-0 bg-theme-accent/10 rounded-full blur-xl" />
                   <span className="material-symbols-outlined text-5xl text-theme-accent relative z-10">palette</span>
                </motion.div>                
                <motion.h1 variants={itemVariants} className="text-4xl font-black mb-4 tracking-tight">Выбери свою атмосферу</motion.h1>
                <motion.p variants={itemVariants} className="text-white/60 mb-12 font-medium">Настрой окружение под свое настроение прямо сейчас.</motion.p>

                <motion.div variants={itemVariants} className="w-full grid grid-cols-1 gap-10 mb-12">
                  <div className="space-y-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-left px-4">Визуальная тема</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all active:scale-95 ${currentTheme === 'dark' ? 'bg-theme-accent/20 border-theme-accent' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                      >
                        <span className="material-symbols-outlined text-3xl text-theme-accent">dark_mode</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Dark</span>
                      </button>
                      <button 
                        onClick={() => setTheme('nordic')}
                        className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all active:scale-95 ${currentTheme === 'nordic' ? 'bg-theme-accent/20 border-theme-accent' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                      >
                        <span className="material-symbols-outlined text-3xl text-cyan-500">ac_unit</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Nordic</span>
                      </button>                    </div>
                  </div>

                  <div className="space-y-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 text-left px-4">Фоновое звучание</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => toggleSound('space')}
                        className={`flex items-center justify-center gap-4 p-6 rounded-[2rem] border-2 transition-all active:scale-95 ${activeSounds['space']?.isPlaying ? 'bg-theme-accent/20 border-theme-accent shadow-[0_0_20px_rgba(var(--color-theme-accent-rgb),0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {activeSounds['space']?.isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Space</span>
                      </button>
                      <button 
                        onClick={() => toggleSound('rain')}
                        className={`flex items-center justify-center gap-4 p-6 rounded-[2rem] border-2 transition-all active:scale-95 ${activeSounds['rain']?.isPlaying ? 'bg-theme-accent/20 border-theme-accent shadow-[0_0_20px_rgba(var(--color-theme-accent-rgb),0.2)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {activeSounds['rain']?.isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Rain</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {slide === 3 && (
              <motion.div 
                key="slide3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full flex flex-col items-center"
              >
                <motion.div 
                  variants={itemVariants}
                  animate={{ 
                    scale: (aiProvider === 'gemini' ? apiKey : openaiKey) ? [1, 1.1, 1] : 1,
                    boxShadow: (aiProvider === 'gemini' ? apiKey : openaiKey) ? "0 0 50px rgba(var(--color-theme-accent-rgb), 0.3)" : "none"
                  }}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-10 border-2 transition-all duration-700 ${(aiProvider === 'gemini' ? apiKey : openaiKey) ? 'bg-theme-accent/20 border-theme-accent' : 'bg-white/5 border-white/10'}`}
                >
                  <span className={`material-symbols-outlined text-4xl md:text-5xl transition-all duration-700 ${(aiProvider === 'gemini' ? apiKey : openaiKey) ? 'text-theme-accent' : 'text-white/20'}`}>
                    {(aiProvider === 'gemini' ? apiKey : openaiKey) ? 'psychology' : 'key'}
                  </span>
                </motion.div>
 
                <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-black mb-3 tracking-tight">AI Co-pilot</motion.h1>
                <motion.p variants={itemVariants} className="text-white/60 mb-8 font-medium text-center text-sm md:text-base">ИИ поможет превратить хаос в четкий план действий.</motion.p>
 
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <motion.div variants={itemVariants} className="space-y-5">
                    <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                      <button
                        onClick={() => setAiProvider('gemini')}
                        className={`flex-1 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${aiProvider === 'gemini' ? 'bg-white/10 text-theme-accent border border-white/10 shadow-xl' : 'text-white/40 hover:text-white'}`}
                      >
                        Gemini
                      </button>
                      <button
                        onClick={() => setAiProvider('openai')}
                        className={`flex-1 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${aiProvider === 'openai' ? 'bg-white/10 text-theme-accent border border-white/10 shadow-xl' : 'text-white/40 hover:text-white'}`}
                      >
                        OpenRouter
                      </button>
                    </div>
 
                    <div className="relative group">
                      <input 
                        type="password" 
                        value={aiProvider === 'gemini' ? apiKey : openaiKey}
                        onChange={e => aiProvider === 'gemini' ? setApiKey(e.target.value) : setOpenaiKey(e.target.value)}
                        placeholder={aiProvider === 'gemini' ? "Вставьте Gemini API Key..." : "API Key (sk-or-v1-...)"}
                        className="w-full bg-white/5 border-2 border-white/10 text-white rounded-2xl px-6 py-5 outline-none focus:border-theme-accent/50 focus:bg-white/10 transition-all placeholder:text-white/20 font-mono text-xs md:text-sm"
                      />
                      <AnimatePresence>
                        {(aiProvider === 'gemini' ? apiKey : openaiKey) && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2"
                          >
                            <span className="text-[8px] font-black text-theme-accent uppercase tracking-widest hidden sm:inline">Ключ готов</span>
                            <div className="w-4 h-4 bg-theme-accent rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.8)]">
                              <span className="material-symbols-outlined text-[10px] text-text-on-accent font-bold">check</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
 
                    {aiProvider === 'openai' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <input 
                          type="url" 
                          value={openaiUrl}
                          onChange={e => setOpenaiUrl(e.target.value)}
                          placeholder="Base URL (openrouter.ai/api/v1)"
                          className="w-full bg-white/5 border-2 border-white/10 text-white rounded-xl px-6 py-3.5 outline-none focus:border-theme-accent/50 transition-all text-xs placeholder:text-white/20"
                        />
                        <input 
                          type="text" 
                          value={openaiModel}
                          onChange={e => setOpenaiModel(e.target.value)}
                          placeholder="Например: google/gemini-pro"
                          className="w-full bg-white/5 border-2 border-white/10 text-white rounded-xl px-6 py-3.5 outline-none focus:border-theme-accent/50 transition-all text-xs placeholder:text-white/20"
                        />
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-theme-accent/10 flex items-center justify-center text-theme-accent">
                          <span className="material-symbols-outlined text-lg">info</span>
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Как получить ключ?</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-theme-accent uppercase tracking-wider">
                            {aiProvider === 'gemini' ? 'Google AI Studio (Gemini)' : 'OpenRouter'}
                          </p>
                          <ol className="text-[11px] text-white/50 space-y-1.5 font-medium list-decimal pl-4">
                            {aiProvider === 'gemini' ? (
                              <>
                                <li>Перейдите в <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">Google AI Studio</a></li>
                                <li>Нажмите <span className="text-white/80">"Create API Key"</span></li>
                                <li>Скопируйте и вставьте в поле слева</li>
                              </>
                            ) : (
                              <>
                                <li>Перейдите в <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">OpenRouter Keys</a></li>
                                <li>Создайте новый ключ (напр. 'Focus Moon')</li>
                                <li>Скопируйте ключ и укажите модель</li>
                              </>
                            )}
                          </ol>
                        </div>
                        <p className="text-[9px] text-white/30 italic">Ваши ключи хранятся только локально в браузере.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {slide === 4 && (
              <motion.div 
                key="slide4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full flex flex-col items-center text-center"
              >
                <motion.div variants={itemVariants} className="w-24 h-24 mb-10 glass-panel rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl relative">
                  <div className="absolute inset-0 bg-theme-accent/30 rounded-full blur-2xl animate-pulse" />
                  <span className="material-symbols-outlined text-6xl text-theme-accent relative z-10">stars</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-4xl font-black mb-4 tracking-tight leading-tight">Запуск первой миссии</motion.h1>
                <motion.p variants={itemVariants} className="text-white/60 mb-12 font-medium">Какую главную цель ты хочешь достичь в этом месяце?</motion.p>

                <motion.form variants={itemVariants} onSubmit={handleGenerate} className="w-full space-y-6 mb-12">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      disabled={isGenerating}
                      placeholder="Например: Выучить React..."
                      className="w-full bg-white/5 border-2 border-white/10 text-white rounded-[2.5rem] px-10 py-7 text-2xl outline-none focus:border-theme-accent/50 focus:bg-white/10 transition-all placeholder:text-white/20 shadow-inner text-center font-bold"
                      autoFocus
                    />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-50 transition-opacity">
                      <span className="material-symbols-outlined text-4xl">target</span>
                    </div>
                  </div>
                  
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-bold bg-red-400/10 py-3 px-6 rounded-2xl border border-red-400/20">
                      {error}
                    </motion.p>
                  )}
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistent Navigation (Bottom Bar) */}
      <div className="relative z-20 w-full max-w-[600px] mx-auto p-6 pb-12 md:pb-16 bg-gradient-to-t from-[#050714] via-[#050714]/80 to-transparent">
        <div className="flex flex-col gap-4">
          {slide === 4 ? (
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleGenerate}
                disabled={!goal.trim() || isGenerating}
                className="w-full btn-ai flex items-center justify-center gap-4 py-7 rounded-[2.5rem] bg-theme-accent text-text-on-accent font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-[0_20px_40px_rgba(var(--color-theme-accent-rgb),0.3)] active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                {isGenerating ? (
                  <><span className="material-symbols-outlined animate-spin text-2xl">sync</span> Запуск двигателя...</>
                ) : (
                  <><span className="material-symbols-outlined text-2xl">rocket_launch</span> Зажечь звезду 🚀</>
                )}
              </button>
              <button 
                onClick={() => onComplete()}
                disabled={isGenerating}
                className="w-full py-5 text-white/30 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95"
              >
                Пропустить и войти
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-5">
                <button 
                  onClick={() => slide === 1 ? onComplete() : setSlide(slide - 1)}
                  className="flex-1 py-6 rounded-[2.5rem] bg-white/5 border-2 border-white/5 text-white/40 font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all active:scale-95"
                >
                  {slide === 1 ? 'Пропустить' : 'Назад'}
                </button>
                <button 
                  onClick={handleNextSlide}
                  disabled={slide === 3 && (aiProvider === 'gemini' ? !apiKey.trim() : !openaiKey.trim())}
                  className="flex-[2] py-6 rounded-[2.5rem] bg-theme-accent text-text-on-accent font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(var(--color-theme-accent-rgb),0.2)] hover:scale-[1.02] active:scale-95 transition-all text-[11px] disabled:opacity-30 disabled:grayscale disabled:scale-100"
                >
                  {slide === 3 ? 'Активировать' : 'Далее'}
                </button>
              </div>
              
              {slide === 3 && (
                <button 
                  onClick={() => setSlide(4)}
                  className="w-full py-2 text-white/30 hover:text-white font-black uppercase tracking-[0.3em] text-[9px] transition-all active:scale-95 text-center"
                >
                  Пропустить (Настроить позже)
                </button>
              )}
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex justify-center gap-3 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-700 ${s === slide ? 'w-12 bg-theme-accent shadow-[0_0_10px_rgba(var(--color-theme-accent-rgb),0.5)]' : 'w-3 bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
