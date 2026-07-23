import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Copy, Check, ChevronRight, Sparkles, Brain, Music, Database, Settings as SettingsIcon, Info, Download, Trash2, Eye, EyeOff, ExternalLink, Activity, Upload, Table } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';
import { formatDate } from "../../types";
import { syncToSheets, pullFromSheets } from '../../services/sheets';
import { useTheme, THEME_NAMES, Theme } from '../../services/ThemeContext';
import { useGlobalAudio, sounds } from '../../services/AudioContext';
import { motion, AnimatePresence } from 'motion/react';

type SettingCategory = 'atmosphere' | 'intelligence' | 'sound' | 'data' | 'general';

interface CategoryItem {
  id: SettingCategory;
  label: string;
  icon: any;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'atmosphere', label: 'Атмосфера', icon: Sparkles, color: '#f472b6' },
  { id: 'intelligence', label: 'Интеллект', icon: Brain, color: '#60a5fa' },
  { id: 'sound', label: 'Звуковой кокон', icon: Music, color: '#a78bfa' },
  { id: 'data', label: 'Данные и Синхро', icon: Database, color: '#34d399' },
  { id: 'general', label: 'Общие', icon: SettingsIcon, color: '#94a3b8' },
];

import { AccessManager } from "../../services/AccessManager";
import confetti from '../../utils/confetti';
const Settings = React.memo(({ stats = {}, updateStats }: { stats?: any, updateStats?: (s: any) => void }) => {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('atmosphere');
  const [isMobileDetail, setIsMobileDetail] = useState(false);
  const [confirmSound, setConfirmSound] = useState<string | null>(null);
  const [purchasingSound, setPurchasingSound] = useState<string | null>(null);
  
  // Data State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [syncStrategy, setSyncStrategy] = useState({ firebase: true, sheets: true });
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiUrl, setOpenaiUrl] = useState('');
  const [openaiModel, setOpenaiModel] = useState('');
  
  // UI State
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean, message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSheetsInfoOpen, setIsSheetsInfoOpen] = useState(false);

  const { 
    theme, setTheme, themes, setPreviewTheme, previewTheme,
    showBackgroundEffects, setShowBackgroundEffects,
    performanceMode, setPerformanceMode,
    powerSaving, setPowerSaving,
    simplifiedConstellations, setSimplifiedConstellations,
    staticElements, setStaticElements,
    tabTimer, setTabTimer,
    simplifiedUI, setSimplifiedUI
  } = useTheme();
  const { activeSounds, toggleSound, setSoundVolume } = useGlobalAudio();

  useEffect(() => {
    const storedWebhook = localStorage.getItem('focusmoon_webhook_url');
    if (storedWebhook) setWebhookUrl(storedWebhook);

    const storedStrategy = localStorage.getItem('focusmoon_sync_strategy');
    if (storedStrategy) setSyncStrategy(JSON.parse(storedStrategy));
    
    const storedProvider = localStorage.getItem('focusmoon_ai_provider') as 'gemini' | 'openai';
    if (storedProvider) setAiProvider(storedProvider);

    const storedGemini = localStorage.getItem('focusmoon_gemini_key');
    if (storedGemini) setGeminiKey(storedGemini);
    
    const storedOpenAiKey = localStorage.getItem('focusmoon_openai_key');
    if (storedOpenAiKey) setOpenaiKey(storedOpenAiKey);
    
    const storedOpenAiUrl = localStorage.getItem('focusmoon_openai_url');
    if (storedOpenAiUrl) setOpenaiUrl(storedOpenAiUrl);
    
    const storedOpenAiModel = localStorage.getItem('focusmoon_openai_model');
    if (storedOpenAiModel) setOpenaiModel(storedOpenAiModel);
  }, []);

  const handleSave = async () => {
    localStorage.setItem('focusmoon_webhook_url', webhookUrl);
    localStorage.setItem('focusmoon_sync_strategy', JSON.stringify(syncStrategy));
    localStorage.setItem('focusmoon_ai_provider', aiProvider);
    localStorage.setItem('focusmoon_gemini_key', geminiKey);
    localStorage.setItem('focusmoon_openai_key', openaiKey);
    localStorage.setItem('focusmoon_openai_url', openaiUrl || 'https://api.openai.com/v1');
    localStorage.setItem('focusmoon_openai_model', openaiModel || 'google/gemini-1.5-flash-latest');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    if (webhookUrl) {
      setIsSyncing(true);
      try {
        const remoteData = await pullFromSheets(webhookUrl);
        if (remoteData) {
          if (typeof remoteData === 'object' && !Array.isArray(remoteData) && (remoteData.disciplines || remoteData.stats || remoteData.inbox)) {
            const storedData = localStorage.getItem('focusmoon_disciplines');
            const localData = storedData ? JSON.parse(storedData) : [];
            if (localData.length === 0) {
              if (remoteData.disciplines) localStorage.setItem('focusmoon_disciplines', JSON.stringify(remoteData.disciplines));
              if (remoteData.stats) localStorage.setItem('focusmoon_stats', JSON.stringify(remoteData.stats));
              if (remoteData.inbox) localStorage.setItem('focusmoon_inbox', JSON.stringify(remoteData.inbox));
              window.location.reload();
              return;
            }
          }
        }
        await handleManualSync();
      } catch (e) {
        await handleManualSync();
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleManualSync = async () => {
    if (!webhookUrl) return;
    setIsSyncing(true);
    try {
      const disciplines = JSON.parse(localStorage.getItem('focusmoon_disciplines') || '[]');
      const stats = JSON.parse(localStorage.getItem('focusmoon_stats') || '{"weeklyGoal": 10, "dailyMinutes": {}, "disciplineMinutes": {}}');
      const inbox = JSON.parse(localStorage.getItem('focusmoon_inbox') || '[]');
      
      const fullData = { disciplines, stats, inbox };
      await syncToSheets(fullData, webhookUrl);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (e) {
      console.warn('Manual sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportData = () => {
    const d = localStorage.getItem('focusmoon_disciplines');
    const s = localStorage.getItem('focusmoon_stats');
    const i = localStorage.getItem('focusmoon_inbox');
    const data = JSON.stringify({ disciplines: JSON.parse(d || '[]'), stats: JSON.parse(s || '{}'), inbox: JSON.parse(i || '[]') });
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusmoon_backup_${formatDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    try {
      const disciplines = JSON.parse(localStorage.getItem('focusmoon_disciplines') || '[]');
      const statsData = JSON.parse(localStorage.getItem('focusmoon_stats') || '{}');

      const wb = XLSX.utils.book_new();

      // Disciplines Sheet
      const ds = disciplines.map((d: any) => ({
        ID: d.id,
        Name: d.name,
        Level: d.level,
        Experience: d.exp,
        Category: d.category,
        Tasks: d.tasks?.length || 0
      }));
      const wsDisciplines = XLSX.utils.json_to_sheet(ds);
      XLSX.utils.book_append_sheet(wb, wsDisciplines, "Disciplines");

      // Stats Sheet
      const ss = [{
        User: statsData.userName || 'Guest',
        Currency: statsData.focusMoon || 0,
        TotalTime: statsData.totalFocusTime || 0,
        Level: statsData.level || 1
      }];
      const wsStats = XLSX.utils.json_to_sheet(ss);
      XLSX.utils.book_append_sheet(wb, wsStats, "Stats");

      XLSX.writeFile(wb, `FocusMoon_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (e) {
      console.error('Excel export failed:', e);
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.disciplines) localStorage.setItem('focusmoon_disciplines', JSON.stringify(data.disciplines));
        if (data.stats) localStorage.setItem('focusmoon_stats', JSON.stringify(data.stats));
        if (data.inbox) localStorage.setItem('focusmoon_inbox', JSON.stringify(data.inbox));
        
        // Also migration for other keys if needed
        Object.keys(data).forEach(key => {
          if (key.startsWith('focusmoon_') && typeof data[key] === 'string') {
            localStorage.setItem(key, data[key]);
          }
        });

        alert('Данные успешно импортированы! Приложение будет перезагружено.');
        window.location.reload();
      } catch (err) {
        alert('Ошибка при импорте файла. Убедитесь, что это корректный JSON бэкап Focus Moon.');
      }
    };
    reader.readAsText(file);
  };

  const confirmReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);
    const apiKey = aiProvider === 'gemini' ? geminiKey : openaiKey;
    if (!apiKey) {
      setAiTestResult({ success: false, message: 'Ключ не введен' });
      setIsTestingAI(false);
      return;
    }

    try {
      localStorage.setItem('focusmoon_ai_provider', aiProvider);
      localStorage.setItem('focusmoon_gemini_key', geminiKey);
      localStorage.setItem('focusmoon_openai_key', openaiKey);
      localStorage.setItem('focusmoon_openai_url', openaiUrl || 'https://api.openai.com/v1');
      localStorage.setItem('focusmoon_openai_model', openaiModel || 'gpt-4o-mini');

      const { generateContent } = await import('../../services/aiClient');
      const result = await generateContent('Reply strictly in JSON format without markdown. Reply: {"status": "OK"}', apiKey);
      if (result && result.status === 'OK') {
        setAiTestResult({ success: true, message: 'Соединение установлено!' });
      } else {
        setAiTestResult({ success: false, message: 'Неверный ответ' });
      }
    } catch (e: any) {
      setAiTestResult({ success: false, message: e.message || 'Ошибка соединения' });
    } finally {
      setIsTestingAI(false);
    }
  };

  const scriptCode = `function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const data = JSON.parse(e.postData.contents);
    sheet.getRange("A1").setValue(JSON.stringify(data));
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const data = sheet.getRange("A1").getValue();
    return ContentService.createTextOutput(data || "{}")
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput("{}")
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const renderAtmosphere = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Шифрование Инбокса</h3>
          <Tooltip text="Zero-Knowledge Encryption (AES-GCM). Шифрование происходит только на вашем устройстве. Если вы забудете пароль, доступ к данным будет навсегда утерян." />
        </div>
        
        <div className="space-y-5">
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 block px-1">Ключ шифрования (Пароль)</label>
            <input 
              type="password"
              placeholder="Введите пароль для шифрования..."
              className="w-full bg-theme-text/2 border border-theme-text/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-theme-accent transition-all"
              value={localStorage.getItem('focusmoon_inbox_password') || ''}
              onChange={e => {
                const val = e.target.value;
                if (val) {
                  localStorage.setItem('focusmoon_inbox_password', val);
                } else {
                  localStorage.removeItem('focusmoon_inbox_password');
                }
                // force re-render
                setWebhookUrl(webhookUrl + ' ');
                setTimeout(() => setWebhookUrl(webhookUrl.trim()), 0);
              }}
            />
            <p className="text-[11px] text-theme-muted mt-3">Пароль никогда не покидает ваше устройство.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Визуальные темы</h3>
          <Tooltip text="Мгновенное изменение внешнего вида приложения" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isLocked = t.dustRequired && !(stats?.unlockedThemes || []).includes(t.id) && !AccessManager.isPremium();
            const isActive = (previewTheme || theme) === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isLocked) {
                    alert(`Требуется ${t.dustRequired} ✨ звездной пыльцы. Разблокируйте в профиле!`);
                    return;
                  }
                  setTheme(t.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group relative overflow-hidden ${
                  isActive ? 'border-theme-accent bg-theme-accent/5' : 'border-theme-text/5 bg-theme-text/2 hover:border-theme-text/10'
                } ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="relative w-12 h-12 group/theme-icon">
                  <div 
                    className="w-full h-full rounded-full border-2 border-theme-border/30 transition-transform group-hover/theme-icon:scale-110 shadow-sm"
                    style={{ 
                      background: `conic-gradient(${t.colors[1]} 0deg 90deg, ${t.colors[2]} 90deg 180deg, ${t.colors[0]} 180deg 360deg)` 
                    }}
                  />
                  {isActive && !isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-theme-accent text-text-on-accent p-1 rounded-full shadow-lg scale-110">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-theme-bg/80 text-theme-text p-1.5 rounded-full shadow-lg">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center relative z-10 flex flex-col items-center">
                  <div className="text-sm font-bold text-theme-text">{t.name}</div>
                  <div className="text-[10px] text-theme-muted mb-1">{t.desc}</div>
                  {isLocked && t.dustRequired && (
                    <div className={`text-[10px] font-bold flex items-center gap-1 ${isLocked ? 'text-theme-accent' : 'text-theme-muted'}`}>
                      {t.dustRequired} ✨
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Атмосфера и Производительность</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Живой фон</p>
                <p className="text-[11px] text-theme-muted">Анимированные эффекты. Отключение останавливает все анимации.</p>
              </div>
              <Toggle 
                active={showBackgroundEffects} 
                onChange={(val) => {
                  setShowBackgroundEffects(val);
                  setPerformanceMode(!val);
                }} 
              />
            </div>
          </div>

          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Упрощенный UI</p>
                <p className="text-[11px] text-theme-muted">Убирает тени, сложные градиенты и свечения</p>
              </div>
              <Toggle active={simplifiedUI} onChange={setSimplifiedUI} />
            </div>
          </div>

          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Экономия энергии</p>
                <p className="text-[11px] text-theme-muted">Ограничение FPS и количества частиц</p>
              </div>
              <Toggle active={powerSaving} onChange={setPowerSaving} />
            </div>
          </div>

          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Статичное небо</p>
                <p className="text-[11px] text-theme-muted">Звезды и элементы не мерцают</p>
              </div>
              <Toggle active={staticElements} onChange={setStaticElements} />
            </div>
          </div>

          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Упрощенные созвездия</p>
                <p className="text-[11px] text-theme-muted">Отключает линии между звездами в Canvas</p>
              </div>
              <Toggle active={simplifiedConstellations} onChange={setSimplifiedConstellations} />
            </div>
          </div>

          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Таймер во вкладке</p>
                <p className="text-[11px] text-theme-muted">Отображение времени в заголовке браузера</p>
              </div>
              <Toggle active={tabTimer} onChange={setTabTimer} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderIntelligence = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Настройка ИИ</h3>
          <Tooltip text="Настройте ключи для умного планирования и конспектов" />
        </div>
        
        <div className="flex gap-2 p-1 bg-theme-text/5 rounded-2xl border border-theme-text/5 mb-6">
          <button
            onClick={() => setAiProvider('gemini')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aiProvider === 'gemini' ? 'bg-theme-card text-theme-accent shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            Gemini
          </button>
          <button
            onClick={() => setAiProvider('openai')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${aiProvider === 'openai' ? 'bg-theme-card text-theme-accent shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            OpenRouter
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 block px-1">API Ключ</label>
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"} 
                value={aiProvider === 'gemini' ? geminiKey : openaiKey}
                onChange={e => aiProvider === 'gemini' ? setGeminiKey(e.target.value) : setOpenaiKey(e.target.value)}
                className="w-full bg-theme-text/2 border border-theme-text/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-theme-accent transition-all pr-12 font-mono"
                placeholder={aiProvider === 'gemini' ? "AIzaSy..." : "sk-or-v1-..."}
              />
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-accent transition-colors"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {aiProvider === 'openai' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2">
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 block px-1">Base URL</label>
                <input 
                  type="url" 
                  value={openaiUrl}
                  onChange={e => setOpenaiUrl(e.target.value)}
                  className="w-full bg-theme-text/2 border border-theme-text/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-theme-accent transition-all"
                  placeholder="https://openrouter.ai/api/v1"
                />
              </div>
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-theme-muted mb-2 block px-1">Модель</label>
                <input 
                  type="text" 
                  value={openaiModel}
                  onChange={e => setOpenaiModel(e.target.value)}
                  className="w-full bg-theme-text/2 border border-theme-text/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-theme-accent transition-all"
                  placeholder="google/gemini-pro"
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={handleTestAI}
              disabled={isTestingAI}
              className="px-6 py-3 bg-theme-accent/10 border border-theme-accent/20 rounded-xl text-xs font-black uppercase tracking-widest text-theme-accent hover:bg-theme-accent/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isTestingAI ? (
                <div className="w-3 h-3 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <Activity className="w-3.5 h-3.5" />
              )}
              Проверить соединение
            </button>
            {aiTestResult && (
              <span className={`text-[10px] font-black uppercase tracking-wider ${aiTestResult.success ? 'text-theme-success' : 'text-red-500'} animate-in fade-in slide-in-from-left-2`}>
                {aiTestResult.message}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="p-5 rounded-2xl bg-theme-accent/5 border border-theme-accent/10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-3">
          <Info className="w-4 h-4 text-theme-accent" />
          <p className="text-[10px] font-black uppercase tracking-widest">Инструкция</p>
        </div>
        <p className="text-xs text-theme-muted leading-relaxed">
          {aiProvider === 'gemini' 
            ? "Получите ключ в Google AI Studio. Рекомендуется использовать последние модели Gemini для лучшей производительности." 
            : "Рекомендуется OpenRouter для доступа к бесплатным моделям (Gemini, Llama)."}
        </p>
        <a 
          href={aiProvider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://openrouter.ai/keys"} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-theme-accent font-bold hover:underline mt-3"
        >
          Открыть панель управления <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );

  const renderSound = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Микшер звуков</h3>
          <Tooltip text="Настройка атмосферы и фоновых частот" />
        </div>

        <div className="space-y-4">
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold">Bass Boost & Frequencies</p>
                <p className="text-[11px] text-theme-muted">Усиление глубоких частот для погружения</p>
              </div>
              <Toggle active={false} onChange={() => {}} disabled />
            </div>
            <Slider label="Усиление (Hz)" value={40} max={200} onChange={() => {}} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sounds.map(sound => {
              const isUnlocked = !sound.dustRequired || AccessManager.isPremium() || (stats?.unlockedSounds || []).includes(sound.id);
              const isLocked = !isUnlocked;
              
              return (
              <div key={sound.id} className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-500 will-change-transform ${purchasingSound === sound.id ? 'scale-105 opacity-80 border-theme-accent ring-2 ring-theme-accent/50 bg-theme-accent/5' : ''} ${isLocked && purchasingSound !== sound.id ? 'bg-theme-text/5 border-transparent opacity-70 grayscale' : 'bg-theme-text/2 border-theme-text/5 hover:bg-theme-text/5'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (isLocked) {
                          if (!activeSounds[sound.id]?.isPlaying) setConfirmSound(sound.id);
                        } else {
                          toggleSound(sound.id);
                        }
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeSounds[sound.id]?.isPlaying ? 'bg-theme-accent text-text-on-accent shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.4)]' : 'bg-theme-text/10 text-theme-muted hover:bg-theme-text/20'}`}
                      title={isLocked ? 'Купить' : (activeSounds[sound.id]?.isPlaying ? 'Остановить' : 'Слушать')}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isLocked ? 'lock' : (activeSounds[sound.id]?.isPlaying ? 'pause' : 'play_arrow')}
                      </span>
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold">{sound.name}</p>
                        {isLocked && sound.dustRequired && (
                           <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isLocked ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-text/10 text-theme-muted'}`}>
                             {sound.dustRequired} ✨
                           </span>
                        )}
                      </div>
                      <p className="text-[9px] text-theme-muted uppercase tracking-widest">{sound.category}</p>
                    </div>
                  </div>
                  {!isLocked && activeSounds[sound.id]?.isPlaying && (
                    <div className="flex items-center gap-2 flex-1 max-w-[120px] sm:max-w-[150px]">
                      <span className="material-symbols-outlined text-[14px] text-theme-muted">volume_down</span>
                      <input 
                        type="range" 
                        min="0" max="1" step="0.01"
                        value={activeSounds[sound.id].volume}
                        onChange={(e) => setSoundVolume(sound.id, parseFloat(e.target.value))}
                        className="w-full accent-theme-accent"
                      />
                    </div>
                  )}
                  {isLocked && (
                    <div className="flex items-center gap-2 relative z-10">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmSound(sound.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          (stats?.focusDust || 0) >= (sound.dustRequired || 0)
                            ? 'bg-theme-accent text-text-on-accent shadow-lg active:scale-95 hover:brightness-110 hover:shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.5)]' 
                            : 'bg-theme-muted/20 text-theme-muted cursor-not-allowed hover:bg-theme-muted/30'
                        }`}
                      >
                        Купить
                      </button>
                    </div>
                  )}
                </div>
                {sound.warning && !isLocked && (
                  <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px]">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    <span>{sound.warning}</span>
                  </div>
                )}
              </div>
            )
            })}
          </div>
        </div>
      </section>
    </div>
  );

  const renderData = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Выбор хранения данных</h3>
          <Tooltip text="Выберите, куда дублировать ваши локальные данные для синхронизации между устройствами." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Database className="w-8 h-8" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold">Cloud Sync (Firebase)</p>
              <Toggle 
                active={syncStrategy.firebase} 
                onChange={(val) => setSyncStrategy(prev => ({ ...prev, firebase: val }))} 
              />
            </div>
            <p className="text-[11px] text-theme-muted mb-4">Автоматическая синхронизация через Google аккаунт. Рекомендуется для большинства.</p>
          </div>

          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Table className="w-8 h-8" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold">Excel/Sheets Sync</p>
              <Toggle 
                active={syncStrategy.sheets} 
                onChange={(val) => setSyncStrategy(prev => ({ ...prev, sheets: val }))} 
              />
            </div>
            <p className="text-[11px] text-theme-muted mb-4">Синхронизация через Google Sheets Webhook. Данные сохраняются в вашу таблицу.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Локальные инструменты</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button 
            onClick={exportToExcel}
            className="flex flex-col items-start justify-between p-6 rounded-2xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-all group min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-500">Экспорт Excel</p>
              <p className="text-[10px] text-green-500/50 uppercase tracking-widest font-black mt-1">Скачать .xlsx</p>
            </div>
          </button>

          <button 
            onClick={handleExportData}
            className="flex flex-col items-start justify-between p-6 rounded-2xl bg-theme-text/2 border border-theme-text/5 hover:bg-theme-text/5 transition-all group min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold">Экспорт JSON</p>
              <p className="text-[10px] text-theme-muted uppercase tracking-widest font-black mt-1">Создать бэкап</p>
            </div>
          </button>

          <div className="relative group min-h-[140px]">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportData}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-start justify-between p-6 rounded-2xl bg-theme-text/2 border border-theme-text/5 group-hover:bg-theme-text/5 transition-all h-full">
              <div className="w-12 h-12 rounded-xl bg-theme-accent/10 flex items-center justify-center text-theme-accent group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Импорт JSON</p>
                <p className="text-[10px] text-theme-muted uppercase tracking-widest font-black mt-1">Восстановить данные</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {syncStrategy.sheets && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Google Sheets Webhook</h3>
          </div>
          
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsSheetsInfoOpen(!isSheetsInfoOpen)}
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-theme-accent" />
                <p className="text-sm font-bold text-theme-text">Как настроить синхронизацию?</p>
              </div>
              <ChevronRight className={`w-5 h-5 text-theme-muted transition-transform ${isSheetsInfoOpen ? 'rotate-90' : ''}`} />
            </div>
            
            <AnimatePresence>
              {isSheetsInfoOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-theme-muted mb-3 leading-relaxed">
                    1. Создайте новую таблицу в Google Sheets.<br/>
                    2. Перейдите в <strong>Расширения → Apps Script</strong>.<br/>
                    3. Вставьте следующий код, сохраните.<br/>
                    4. Нажмите <strong>Начать развертывание → Новое развертывание</strong>.<br/>
                    5. Выберите тип <strong>Веб-приложение</strong>, доступ <strong>Все</strong>.<br/>
                    6. Скопируйте полученный <strong>URL веб-приложения</strong> и вставьте его ниже.
                  </p>
                  
                  <div className="relative group w-full overflow-hidden rounded-xl border border-theme-text/10 bg-theme-text/5">
                    <pre className="p-4 text-[10px] md:text-xs font-mono text-theme-text overflow-x-auto w-full">
                      {scriptCode}
                    </pre>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(scriptCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="absolute top-2 right-2 p-2 bg-theme-bg/90 border border-theme-border rounded-lg text-theme-muted hover:text-theme-accent hover:bg-theme-bg transition-colors backdrop-blur-sm z-10 shadow-lg"
                      title="Скопировать код"
                    >
                      {copied ? <Check className="w-4 h-4 text-theme-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <input 
              type="url" 
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full bg-theme-text/2 border border-theme-text/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-theme-accent transition-all"
              placeholder="https://script.google.com/macros/s/.../exec"
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-theme-accent text-text-on-accent font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-theme-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {saved ? 'Сохранено!' : 'Сохранить URL'}
              </button>
              <button 
                onClick={handleManualSync}
                disabled={!webhookUrl || isSyncing}
                className="flex-1 py-4 bg-theme-text/5 border border-theme-text/10 text-theme-text rounded-xl text-xs font-black uppercase tracking-widest hover:bg-theme-text/10 transition-all disabled:opacity-50"
              >
                {isSyncing ? 'Синхрон...' : syncSuccess ? 'Успешно!' : 'Синхронизация'}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="pt-8">
        <button 
          onClick={() => setShowConfirmReset(true)}
          className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Сброс и удаление данных
        </button>
      </section>
    </div>
  );

  const renderGeneral = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-accent">Общие настройки</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Уведомления</p>
                <p className="text-[11px] text-theme-muted">Напоминания о фокусе и завершении задач</p>
              </div>
              <Toggle active={true} onChange={() => {}} />
            </div>
          </div>
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Язык интерфейса</p>
                <p className="text-[11px] text-theme-muted">Русский (по умолчанию)</p>
              </div>
              <div className="px-3 py-1 bg-theme-text/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-theme-muted">RU</div>
            </div>
          </div>
          <div className="bg-theme-card/30 p-5 rounded-2xl border border-theme-border/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Версия</p>
                <p className="text-[11px] text-theme-muted">Focus Moon v2.9 High-End Edition</p>
              </div>
              <div className="px-3 py-1 bg-theme-accent/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-theme-accent">Build 2026</div>
            </div>
          </div>
          
          <div className="pt-8">
            <button 
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Удалить аккаунт
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderContent = () => {
    switch(activeCategory) {
      case 'atmosphere': return renderAtmosphere();
      case 'intelligence': return renderIntelligence();
      case 'sound': return renderSound();
      case 'data': return renderData();
      case 'general': return renderGeneral();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg p-4 md:p-8 xl:p-12 pb-32">
      <AnimatePresence>
        {showConfirmReset && (
          <ConfirmModal 
            title="Сброс данных" 
            message="Вы уверены, что хотите удалить все данные? Это действие необратимо." 
            onConfirm={confirmReset} 
            onCancel={() => setShowConfirmReset(false)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-theme-accent/20 flex items-center justify-center text-theme-accent shadow-lg shadow-theme-accent/10">
                  <SettingsIcon className="w-7 h-7" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Настройки</h1>
              </div>
              <p className="text-theme-muted font-medium text-sm md:text-base max-w-xl">
                Центр управления вашим продуктивным пространством.
              </p>
            </div>
            
            <AnimatePresence>
              {saved && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-theme-success/10 text-theme-success px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-theme-success/20 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  Все изменения сохранены
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </header>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Navigation Sidebar */}
          <aside className={`xl:w-80 flex-shrink-0 ${isMobileDetail ? 'hidden xl:block' : 'block'}`}>
            <div className="grid grid-cols-1 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (window.innerWidth < 1280) setIsMobileDetail(true);
                  }}
                  className={`group w-full flex items-center justify-between p-4 md:p-5 rounded-[1.5rem] transition-all relative overflow-hidden ${
                    activeCategory === cat.id 
                      ? 'bg-theme-accent text-text-on-accent shadow-xl shadow-theme-accent/20 scale-[1.02]' 
                      : 'bg-theme-card/30 border border-theme-border/30 hover:bg-theme-card/60 text-theme-muted hover:text-theme-text'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${
                      activeCategory === cat.id ? 'bg-theme-bg text-theme-accent' : 'bg-theme-text/5 text-theme-muted group-hover:bg-theme-text/10'
                    }`}>
                      <cat.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="font-black text-xs md:text-sm uppercase tracking-widest">{cat.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === cat.id ? 'translate-x-1' : 'opacity-30 group-hover:opacity-100'}`} />
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className={`flex-1 ${!isMobileDetail && window.innerWidth < 1280 ? 'hidden xl:block' : 'block'}`}>
            <div className="xl:hidden mb-6">
              <button 
                onClick={() => setIsMobileDetail(false)}
                className="flex items-center gap-2 text-theme-accent font-black text-[10px] uppercase tracking-widest"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Вернуться назад
              </button>
            </div>

            <div className="bg-theme-card/20 backdrop-blur-3xl border border-theme-border/20 rounded-[2.5rem] p-6 md:p-12 min-h-[600px] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="mb-10">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-4">
                      {CATEGORIES.find(c => c.id === activeCategory)?.label}
                    </h2>
                  </div>
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      {confirmSound && (() => {
        const sound = sounds.find(s => s.id === confirmSound);
        if (!sound) return null;
        
        const currentDust = stats?.focusDust || 0;
        const requiredDust = sound.dustRequired || 0;
        const hasEnough = currentDust >= requiredDust;
        
        return (
          <ConfirmModal
            onCancel={() => {
              if (confirmSound && activeSounds[confirmSound]?.isPlaying) {
                toggleSound(confirmSound);
              }
              setConfirmSound(null);
            }}
            onConfirm={() => {
              if (!hasEnough) {
                if (confirmSound && activeSounds[confirmSound]?.isPlaying) {
                  toggleSound(confirmSound);
                }
                setConfirmSound(null);
                return;
              }
              if (updateStats) {
                 setPurchasingSound(sound.id);
                 setTimeout(() => {
                   updateStats({
                     focusDust: currentDust - requiredDust,
                     unlockedSounds: [...(stats?.unlockedSounds || []), sound.id]
                   });
                   setPurchasingSound(null);
                   confetti({
                     particleCount: 100,
                     spread: 70,
                     origin: { y: 0.6 }
                   });
                 }, 800);
              }
              setConfirmSound(null);
            }}
            title={hasEnough ? "Покупка звука" : "Недостаточно пыльцы"}
            message={hasEnough 
              ? `Купить звук "${sound.name}" за ${requiredDust} ✨?` 
              : `Для покупки нужно ${requiredDust} ✨. У вас сейчас ${currentDust} ✨.`}
            confirmText={hasEnough ? "Купить" : "Понятно"}
            hideCancel={!hasEnough}
          />
        );
      })()}

    </div>
  );
});

// Sub-components
function Toggle({ active, onChange, disabled = false }: { active: boolean, onChange: (v: boolean) => void, disabled?: boolean }) {
  return (
    <button 
      onClick={() => !disabled && onChange(!active)}
      className={`w-14 h-8 rounded-full relative transition-all ${active ? 'bg-theme-accent shadow-[0_0_15px_rgba(var(--color-theme-accent-rgb),0.3)]' : 'bg-theme-text/10'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div 
        animate={{ x: active ? 28 : 4 }}
        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

function Slider({ label, value, max = 100, onChange }: { label?: string, value: number, max?: number, onChange: (v: number) => void }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-theme-muted">{label}</span>
          <span className="text-[10px] font-black text-theme-accent">{Math.round(value)}%</span>
        </div>
      )}
      <div className="relative h-1.5 w-full bg-theme-text/5 rounded-full overflow-hidden border border-theme-text/5">
        <div 
          className="absolute top-0 left-0 h-full bg-theme-accent transition-all duration-300" 
          style={{ width: `${(value / max) * 100}%` }} 
        />
        <input 
          type="range"
          min="0"
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
}

export default Settings;

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="w-5 h-5 rounded-full bg-theme-text/5 flex items-center justify-center text-theme-muted hover:text-theme-accent hover:bg-theme-accent/5 transition-all"
      >
        <Info className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-4 bg-theme-card/95 backdrop-blur-2xl border border-theme-border/50 rounded-2xl shadow-2xl z-[100] text-[11px] font-medium leading-relaxed pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-theme-card" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
