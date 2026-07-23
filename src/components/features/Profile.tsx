import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ACHIEVEMENTS, RARITY_LABELS } from '../../data/achievementsData';
import AchievementAwardModal from './AchievementAwardModal';
import { useTheme } from '../../services/ThemeContext';
import { User as UserIcon, Cloud, CloudOff, RefreshCw, LogIn, LogOut, UserPlus, Mail, Lock, ShieldCheck } from 'lucide-react';
import { AccessManager } from '../../services/AccessManager';
import { auth, loginWithEmail, registerWithEmail, logout } from '../../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { syncService } from '../../services/SyncService';
import confetti from '../../utils/confetti';

const Profile = React.memo(({ stats, updateStats }: { stats?: any, updateStats?: (s: any) => void }) => {
  const { theme, setTheme, themes, previewTheme, setPreviewTheme } = useTheme();

  
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const getAchievementProgress = (ach: any) => {
    switch(ach.type) {
      case 'activeDays': return activeDays;
      case 'totalMinutes': return totalMinutes;
      case 'focusDust': return focusDust;
      default: return 0;
    }
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(stats?.userName || 'Гость');

  const totalMinutes = Object.values(stats?.dailyMinutes || {}).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0) as number;
  const formatTime = (totalMin: number) => {
    const hrs = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<string | null>(null);
  const [purchasingTheme, setPurchasingTheme] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(AccessManager.isPremium());
  
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'profile'>('profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setAuthMode('profile');
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка входа');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await registerWithEmail(email, password);
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка регистрации');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  useEffect(() => {
    const handlePremium = () => setIsPremium(true);
    window.addEventListener('focusmoon_premium_unlocked', handlePremium);
    return () => window.removeEventListener('focusmoon_premium_unlocked', handlePremium);
  }, []);

    const handlePromoCode = () => {
    if (AccessManager.validateCode(promoCode)) {
      setPromoStatus('success');
      setPromoCode('');
      setTimeout(() => setPromoStatus(null), 5000);
    } else if (promoCode === '1000000' || promoCode.toLowerCase() === 'million') {
      if (updateStats) {
        updateStats({ focusDust: (stats?.focusDust || 0) + 1000000 });
      }
      setPromoStatus('success_dust');
      setPromoCode('');
      setTimeout(() => setPromoStatus(null), 5000);
    } else {
      setPromoStatus('error');
      setTimeout(() => setPromoStatus(null), 3000);
    }
  };

  const focusDust = stats?.focusDust || 0;
  const dailyGoal = stats?.dailyGoal || stats?.weeklyGoal || 0; // Use weeklyGoal if dailyGoal not set, though App says weeklyGoal
  const activeDays = Object.keys(stats?.dailyMinutes || {}).length;
  const avgDaily = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;

  const handleNameSave = () => {
    setIsEditingName(false);
    if (updateStats) {
      updateStats({ userName: tempName });
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-16">
      
      {/* Identity & Header Section */}
      <section className="relative">
        {!user && authMode !== 'profile' ? (
          <div className="glass-panel p-8 rounded-[2.5rem] border border-theme-border/50 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-theme-text uppercase tracking-tight">
                {authMode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
              </h3>
              <p className="text-theme-muted text-xs font-bold uppercase tracking-widest opacity-60">
                {authMode === 'login' ? 'Войдите для синхронизации прогресса' : 'Начните свое путешествие в облаке'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-theme-muted group-focus-within:text-theme-accent transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-theme-bg/50 border border-theme-border/50 rounded-2xl pl-12 pr-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-theme-muted group-focus-within:text-theme-accent transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Пароль" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-theme-bg/50 border border-theme-border/50 rounded-2xl pl-12 pr-4 py-3 text-theme-text outline-none focus:border-theme-accent transition-all"
                  />
                </div>
              </div>

              {authError && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{authError}</p>}

              <button 
                type="submit"
                disabled={isAuthLoading}
                className="w-full bg-theme-accent text-text-on-accent font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:bg-theme-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isAuthLoading ? <RefreshCw className="animate-spin" size={18} /> : (authMode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />)}
                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="text-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-[10px] font-black uppercase tracking-widest text-theme-muted hover:text-theme-accent transition-colors"
              >
                {authMode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative group"
             >
                <div className="absolute -inset-2 bg-gradient-to-tr from-theme-accent to-transparent rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-700"></div>
                <div className="relative w-24 h-24 rounded-3xl bg-theme-card border border-theme-border flex items-center justify-center text-theme-accent shadow-2xl overflow-hidden">
                   {user?.photoURL ? (
                     <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <UserIcon size={42} strokeWidth={1.5} />
                   )}
                </div>
                {user && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center shadow-lg">
                     <span className="material-symbols-outlined text-[16px] text-green-500">verified</span>
                  </div>
                )}
             </motion.div>
             
             <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  {isEditingName ? (
                    <input 
                      autoFocus
                      className="text-3xl font-black bg-transparent border-b-2 border-theme-accent text-theme-text outline-none max-w-[300px] tracking-tight"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    />
                  ) : (
                    <h2 
                      onClick={() => setIsEditingName(true)}
                      className="text-3xl font-black text-theme-text tracking-tighter truncate cursor-pointer hover:text-theme-accent transition-colors flex items-center gap-3 group/name"
                    >
                      {user?.displayName || stats?.userName || 'Гость'}
                      <span className="material-symbols-outlined text-lg opacity-0 group-hover/name:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">edit</span>
                    </h2>
                  )}
                </div>
                <p className="text-theme-muted text-sm font-medium opacity-60">
                  {user ? user.email : 'Senior Focus Architect • Focus Moon v2.9 High-End Edition'}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-theme-card/50 border border-theme-border/50 rounded-full">
                      <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${user ? 'bg-theme-success' : 'bg-orange-500'}`}></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-theme-text">
                        {user ? 'Cloud Synced' : 'Local Mode'}
                      </span>
                   </div>
                   {isPremium && (
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-theme-accent/10 border border-theme-accent/20 rounded-full">
                        <span className="material-symbols-outlined text-[12px] text-theme-accent">star</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent">Premium Mode</span>
                     </div>
                   )}
                   {user && (
                     <button 
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors"
                     >
                        <LogOut size={12} className="text-red-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Выйти</span>
                     </button>
                   )}
                   {!user && (
                     <button 
                      onClick={() => setAuthMode('login')}
                      className="flex items-center gap-1.5 px-3 py-1 bg-theme-accent/10 border border-theme-accent/20 rounded-full hover:bg-theme-accent/20 transition-colors"
                     >
                        <Cloud size={12} className="text-theme-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent">Синхронизация</span>
                     </button>
                   )}
                </div>
             </div>
          </div>
        )}
      </section>

      
      {/* PROMO CODE SECTION */}
      <section className="glass-panel p-6 rounded-3xl border border-theme-border mt-8 mb-8">
        <h3 className="text-xl font-black text-theme-text uppercase tracking-tight font-display mb-4">Ключ Экосистемы</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="text" 
            placeholder="Введите код доступа..."
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-theme-bg/30 backdrop-blur-md border border-theme-border/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] text-theme-text px-4 py-3 rounded-2xl outline-none focus:border-theme-accent focus:ring-0 transition-all placeholder:text-theme-muted/50"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          />
          <button
            onClick={handlePromoCode}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all bg-theme-accent text-text-on-accent hover:bg-theme-accent/90"
          >
            Применить
          </button>
        </div>
                {promoStatus === 'success_dust' && (
          <p className="mt-4 text-theme-accent font-bold text-sm">Вам начислено 1 000 000 ✨ звездной пыльцы!</p>
        )}
        {promoStatus === 'success' && (
          <p className="mt-4 text-theme-accent font-bold text-sm">Доступ разрешен. Добро пожаловать, Хранитель Вселенной!</p>
        )}
        {promoStatus === 'error' && (
          <p className="mt-4 text-red-500 font-bold text-sm">Неверный код.</p>
        )}
      </section>
      {/* Theme Selection Grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Персонализация</h3>
            <p className="text-theme-muted text-sm font-medium opacity-60">Выберите визуальный код вашего прогресса</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {themes.map((t, idx) => {
             const isUnlocked = t.dustRequired ? (isPremium || (stats?.unlockedThemes || []).includes(t.id)) : true;
             const isLocked = !isUnlocked;
             const isSelected = theme === t.id;
             const isPreviewing = previewTheme === t.id;

             return (
               <motion.div
                 key={t.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 onClick={() => {
                   if (!isPreviewing) {
                     setPreviewTheme(t.id as any);
                   }
                 }}
                 className={`group relative flex flex-col rounded-2xl border transition-all duration-500 will-change-transform bg-theme-card/30 overflow-hidden cursor-pointer ${
                   purchasingTheme === t.id ? 'scale-105 opacity-80' : 'scale-100 opacity-100'
                 } ${
                   (isSelected || isPreviewing)
                     ? 'border-theme-accent ring-2 ring-theme-accent/10 shadow-lg shadow-theme-accent/5' 
                     : 'border-theme-border/50 hover:border-theme-accent/30'
                 }`}
               >
                 <div className="aspect-video p-2 flex flex-col relative">
                   <div className="theme-card-preview relative flex-1 mb-2">
                      <div className="theme-card-section theme-card-section-bg" style={{ backgroundColor: t.colors[0] }} />
                      <div className="theme-card-section theme-card-section-panel" style={{ backgroundColor: t.colors[1] }} />
                      <div className="theme-card-section theme-card-section-accent" style={{ backgroundColor: t.colors[2] }} />
                      
                      {isSelected && !isPreviewing && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="bg-theme-accent text-text-on-accent p-1 rounded-full shadow-xl scale-125 border-2 border-theme-bg">
                            <span className="material-symbols-outlined text-[16px] font-black">check</span>
                          </div>
                        </div>
                      )}

                      {isLocked && !isPreviewing && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-[1px]">
                          <span className="material-symbols-outlined text-white/80 text-xl">lock</span>
                        </div>
                      )}

                      {isPreviewing && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-theme-accent/20">
                          <div className="bg-theme-accent text-text-on-accent px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                            Preview
                          </div>
                        </div>
                      )}
                   </div>
                   
                   <div className="px-1 pb-1">
                     <p className={`text-[10px] font-black uppercase tracking-widest truncate ${(isSelected || isPreviewing) ? 'text-theme-accent' : 'text-theme-text'}`}>
                       {t.name}
                     </p>
                     <p className="text-[8px] text-theme-muted font-bold uppercase opacity-60 truncate">
                       {isLocked ? `Заблокировано: ${t.dustRequired} ✨` : t.desc}
                     </p>
                   </div>
                 </div>

                 {/* Hover Overlay Actions */}
                 <div className={`absolute inset-0 bg-theme-card/80 backdrop-blur-sm transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20 ${isPreviewing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
                    {isLocked ? (
                      <>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); isPreviewing ? setPreviewTheme(null) : setPreviewTheme(t.id as any); }}
                          className={`w-full py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-colors ${isPreviewing ? 'bg-theme-accent/20 border-theme-accent text-theme-accent' : 'bg-theme-bg border-theme-border hover:border-theme-accent'}`}
                        >
                          {isPreviewing ? 'Отменить' : 'Обзор'}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (focusDust >= (t.dustRequired || 0) || isPremium) {
                              setPurchasingTheme(t.id);
                              
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = (rect.left + rect.width / 2) / window.innerWidth;
                              const y = (rect.top + rect.height / 2) / window.innerHeight;
                              
                              confetti({
                                particleCount: 40,
                                spread: 70,
                                origin: { x, y },
                                colors: [t.colors[0], t.colors[2]],
                                disableForReducedMotion: true,
                                zIndex: 1000,
                              });

                              setTimeout(() => {
                                if (updateStats && !isPremium) {
                                  const newUnlocked = [...(stats?.unlockedThemes || []), t.id];
                                  updateStats({
                                    focusDust: focusDust - (t.dustRequired || 0),
                                    unlockedThemes: newUnlocked
                                  });
                                } else if (updateStats && isPremium) {
                                  const newUnlocked = [...(stats?.unlockedThemes || []), t.id];
                                  updateStats({
                                    unlockedThemes: newUnlocked
                                  });
                                }
                                setTheme(t.id as any);
                                setPurchasingTheme(null);
                              }, 600);
                            } else {
                              alert(`Недостаточно звездной пыли! Нужно еще ${(t.dustRequired || 0) - focusDust} ✨`);
                            }
                          }}
                          className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            focusDust >= (t.dustRequired || 0) 
                              ? 'bg-theme-accent text-text-on-accent shadow-lg active:scale-95' 
                              : 'bg-theme-muted/20 text-theme-muted cursor-not-allowed'
                          }`}
                        >
                          Разблокировать
                        </button>
                      </>
                                        ) : (
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); isPreviewing ? setPreviewTheme(null) : setPreviewTheme(t.id as any); }}
                          className={`flex-1 py-1.5 rounded-lg border text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-colors ${isPreviewing ? 'bg-theme-accent/20 border-theme-accent text-theme-accent' : 'bg-theme-bg/50 border-theme-border hover:border-theme-accent'}`}
                        >
                          {isPreviewing ? 'Отменить' : 'Обзор'}
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTheme(t.id as any); }}
                          className="flex-1 py-1.5 rounded-lg bg-theme-accent text-text-on-accent text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                        >
                          Применить
                        </button>
                      </div>
                    )}
                 </div>
               </motion.div>
             );
          })}
        </div>
      </section>

      
      {/* Achievements System: Focus Odyssey */}
      <section className="space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Галлерея Достижений</h3>
        </div>

        
        <div className="space-y-12">
          
          {Array.from(new Set(ACHIEVEMENTS.map(a => a.type as string))).map((type: string) => {
            const collectionAchievements = ACHIEVEMENTS.filter(a => a.type === type);
            // Sort by max value so they appear in progressive order
            collectionAchievements.sort((a, b) => a.max - b.max);
            
            const visibleAchievements = showAllAchievements ? collectionAchievements : collectionAchievements.slice(0, 4);
            
            const typeLabels: Record<string, string> = {
              'activeDays': 'Активные дни',
              'focusDust': 'Пыльца',
              'totalMinutes': 'Минуты фокуса'
            };
            const collectionName = typeLabels[type] || type;

            return (
              <div key={type} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h4 className="text-md font-black text-theme-text uppercase tracking-widest">{collectionName}</h4>
                  <div className="flex-1 h-[1px] bg-theme-border/50"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {visibleAchievements.map((ach) => {
                    const progress = getAchievementProgress(ach);
                    const isUnlocked = progress >= ach.max;
                    const progressPercent = Math.min(100, (progress / ach.max) * 100);
                    
                    const displayColor = ach.color;
                    const rarityLabel = RARITY_LABELS[ach.rarity] || ach.rarity;

                    return (
                      <motion.div 
                        key={ach.id} 
                        onClick={() => setSelectedAchievement({ ...ach, displayColor, isThemeTinted: isUnlocked, isUnlocked, progress, progressPercent })}
                        whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                        className={`relative flex flex-col items-center p-4 bg-theme-card/30 border rounded-3xl transition-all duration-500 ${isUnlocked ? 'cursor-pointer hover:bg-theme-card hover:shadow-xl' : 'opacity-80'}`}
                        style={isUnlocked ? { borderColor: displayColor, boxShadow: `0 10px 30px -10px ${displayColor}40` } : { borderColor: 'var(--color-theme-border)' }}
                      >
                        <div 
                          className={`w-24 h-24 shrink-0 rounded-full overflow-hidden border-[4px] bg-theme-bg flex items-center justify-center mb-3 transition-all duration-500 relative ${!isUnlocked ? 'grayscale opacity-50' : ''}`}
                          style={{ borderColor: isUnlocked ? displayColor : 'var(--color-theme-border)' }}
                        >
                          
                          {ach.img ? (
                            <img src={ach.img} alt={ach.title} loading="lazy" className="w-[135%] h-[135%] max-w-none flex-shrink-0 object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-4xl" style={{ color: isUnlocked ? displayColor : 'var(--color-theme-muted)' }}>stars</span>
                          )}

                          {isUnlocked && (
                            <div className="absolute inset-0 pointer-events-none mix-blend-color" style={{ backgroundColor: displayColor }} />
                          )}
                          {!isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                              <span className="material-symbols-outlined text-3xl text-white">lock</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full text-center flex-1 flex flex-col">
                          <h4 className={`font-bold text-sm mb-1 ${!isUnlocked ? 'text-theme-muted' : 'text-theme-text'}`}>{ach.title}</h4>
                          
                          {isUnlocked ? (
                            <>
                              <span className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: displayColor }}>
                                {rarityLabel}
                              </span>
                              <p className="text-[9px] text-theme-muted uppercase tracking-widest mb-3 flex-1">{ach.desc}</p>
                            </>
                          ) : (
                            <div className="flex-1 flex flex-col justify-center mb-3">
                              <span className="text-[10px] font-black uppercase tracking-widest mb-1 text-theme-muted">
                                {rarityLabel}
                              </span>
                              <p className="text-[9px] text-theme-accent font-bold uppercase tracking-widest leading-tight">
                                Как получить:
                              </p>
                              <p className="text-[9px] text-theme-text uppercase tracking-widest opacity-80 mt-1">
                                {ach.desc}
                              </p>
                            </div>
                          )}
                          
                          <div className="w-full mt-auto">
                            <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                              <span className="text-theme-muted">{isUnlocked ? 'Разблокировано' : 'Прогресс'}</span>
                              <span style={{ color: isUnlocked ? displayColor : 'var(--color-theme-text)' }}>
                                {isUnlocked ? '100%' : `${Math.floor(progressPercent)}%`}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-theme-bg rounded-full overflow-hidden">
                              <div 
                                className="h-full transition-all duration-1000" 
                                style={{ 
                                  width: `${progressPercent}%`, 
                                  backgroundColor: isUnlocked ? displayColor : 'var(--color-theme-text)' 
                                }} 
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAllAchievements(!showAllAchievements)}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-theme-card border border-theme-border hover:border-theme-accent transition-all hover:shadow-lg"
          >
            <span className="text-xs font-black uppercase tracking-widest text-theme-text group-hover:text-theme-accent transition-colors">
              {showAllAchievements ? 'Скрыть часть' : 'Показать все достижения'}
            </span>
            <span className={`material-symbols-outlined text-[18px] text-theme-text group-hover:text-theme-accent transition-all ${showAllAchievements ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="space-y-8">
        <h3 className="text-xl font-black text-theme-text tracking-tight uppercase">Аналитика фокуса</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'время в фокусе', value: formatTime(totalMinutes), icon: 'schedule' },
            { label: 'активных дней', value: activeDays, icon: 'calendar_today' },
            { label: 'среднее / день', value: `${avgDaily}m`, icon: 'trending_up' },
            { label: 'индекс фокуса', value: `${totalMinutes > 0 ? Math.min(100, Math.round((totalMinutes / 60) * 1.5)) : 0}%`, icon: 'analytics', isAccent: true },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="p-6 bg-theme-card/30 border border-theme-border/30 rounded-3xl space-y-3 group hover:bg-theme-card transition-all"
            >
               <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-theme-muted font-bold opacity-60">{item.label}</span>
                  <span className="material-symbols-outlined text-[18px] text-theme-muted group-hover:text-theme-accent transition-colors">{item.icon}</span>
               </div>
               <p className={`text-3xl font-black font-mono tracking-tighter ${item.isAccent ? 'text-theme-accent' : 'text-theme-text'}`}>{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Focus Dust Display */}
        <div className="relative py-12 flex flex-col items-center justify-center overflow-hidden rounded-[3rem] bg-theme-card/20 border border-theme-border/30">
          <div className="absolute -inset-24 bg-theme-accent/5 blur-[120px] rounded-full animate-pulse"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center relative z-10"
          >
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.6em] text-theme-muted font-black opacity-40 mb-4">накоплено звездной пыли</p>
            <div className="text-7xl md:text-9xl font-thin text-theme-text tracking-tighter tabular-nums mb-2">
              {focusDust.toLocaleString()}
            </div>
            <div className="w-12 h-1 bg-theme-accent/30 mx-auto rounded-full"></div>
          </motion.div>
        </div>
      </section>
      {selectedAchievement && (
        <AchievementAwardModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
    </div>
  );
});

export default Profile;
