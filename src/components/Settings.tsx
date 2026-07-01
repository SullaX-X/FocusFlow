import React, { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { syncToSheets, pullFromSheets } from '../sheets';
import { useTheme } from '../ThemeContext';

function Accordion({ title, children }: { title: React.ReactNode, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-theme-border rounded-xl overflow-hidden bg-theme-bg/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-theme-card hover:bg-theme-bg transition-colors"
      >
        <span className="font-semibold text-theme-text">{title}</span>
        <ChevronDown className={`w-5 h-5 text-theme-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-4 border-t border-theme-border animate-in fade-in slide-in-from-top-2">{children}</div>}
    </div>
  );
}

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiUrl, setOpenaiUrl] = useState('');
  const [openaiModel, setOpenaiModel] = useState('');
  
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean, message: string } | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const storedWebhook = localStorage.getItem('focusflow_webhook_url');
    if (storedWebhook) setWebhookUrl(storedWebhook);
    
    const storedProvider = localStorage.getItem('focusflow_ai_provider') as 'gemini' | 'openai';
    if (storedProvider) setAiProvider(storedProvider);

    const storedGemini = localStorage.getItem('focusflow_gemini_key');
    if (storedGemini) setGeminiKey(storedGemini);
    
    const storedOpenAiKey = localStorage.getItem('focusflow_openai_key');
    if (storedOpenAiKey) setOpenaiKey(storedOpenAiKey);
    
    const storedOpenAiUrl = localStorage.getItem('focusflow_openai_url');
    if (storedOpenAiUrl) setOpenaiUrl(storedOpenAiUrl);
    
    const storedOpenAiModel = localStorage.getItem('focusflow_openai_model');
    if (storedOpenAiModel) setOpenaiModel(storedOpenAiModel);
  }, []);

  const handleSave = async () => {
    localStorage.setItem('focusflow_webhook_url', webhookUrl);
    localStorage.setItem('focusflow_ai_provider', aiProvider);
    localStorage.setItem('focusflow_gemini_key', geminiKey);
    localStorage.setItem('focusflow_openai_key', openaiKey);
    localStorage.setItem('focusflow_openai_url', openaiUrl || 'https://api.openai.com/v1');
    localStorage.setItem('focusflow_openai_model', openaiModel || 'gpt-4o-mini');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    if (webhookUrl) {
      setIsSyncing(true);
      try {
        const remoteData = await pullFromSheets(webhookUrl);
        if (remoteData) {
          if (Array.isArray(remoteData) && remoteData.length > 0) {
            // Legacy format
            const storedData = localStorage.getItem('focusflow_disciplines');
            const localData = storedData ? JSON.parse(storedData) : [];
            if (localData.length === 0) {
              localStorage.setItem('focusflow_disciplines', JSON.stringify(remoteData));
              window.location.reload();
              return;
            }
          } else if (typeof remoteData === 'object' && !Array.isArray(remoteData) && (remoteData.disciplines || remoteData.stats || remoteData.inbox)) {
            // New format
            const storedData = localStorage.getItem('focusflow_disciplines');
            const localData = storedData ? JSON.parse(storedData) : [];
            if (localData.length === 0) {
              if (remoteData.disciplines) localStorage.setItem('focusflow_disciplines', JSON.stringify(remoteData.disciplines));
              if (remoteData.stats) localStorage.setItem('focusflow_stats', JSON.stringify(remoteData.stats));
              if (remoteData.inbox) localStorage.setItem('focusflow_inbox', JSON.stringify(remoteData.inbox));
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
      const disciplines = JSON.parse(localStorage.getItem('focusflow_disciplines') || '[]');
      const stats = JSON.parse(localStorage.getItem('focusflow_stats') || '{"weeklyGoal": 10, "dailyMinutes": {}, "disciplineMinutes": {}}');
      const inbox = JSON.parse(localStorage.getItem('focusflow_inbox') || '[]');
      
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

  const scriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.getRange("A:A").clearContent();
    sheet.getRange("A1").setValue(JSON.stringify(data));
    return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getRange("A1").getValue();
    if (!data) data = "{}";
    return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput("{}").setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportData = () => {
    const data = localStorage.getItem('focusflow_disciplines');
    if (!data) return;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    setShowConfirmReset(true);
  };

  const confirmReset = async () => {
    // Clear everything from localforage and localStorage
    const keysToRemove = [
      'focusflow_disciplines',
      'focusflow_stats',
      'focusflow_onboarding',
      'focusflow_version',
      'focusflow_inbox'
    ];
    
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    // If using localforage in App.tsx, we should clear it too
    // But since we can't easily import localforage here without adding it to the project properly,
    // we'll rely on the fact that App.tsx hydrates from these.
    // Actually, let's just reload after clearing localStorage.
    
    localStorage.clear(); // Nuclear option for "Delete All"
    window.location.reload();
  };

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);
    
    const provider = aiProvider;
    const apiKey = provider === 'gemini' ? geminiKey : openaiKey;
    
    if (!apiKey) {
      setAiTestResult({ success: false, message: 'Ключ не введен' });
      setIsTestingAI(false);
      return;
    }

    try {
      localStorage.setItem('focusflow_ai_provider', aiProvider);
      localStorage.setItem('focusflow_gemini_key', geminiKey);
      localStorage.setItem('focusflow_openai_key', openaiKey);
      localStorage.setItem('focusflow_openai_url', openaiUrl || 'https://api.openai.com/v1');
      localStorage.setItem('focusflow_openai_model', openaiModel || 'gpt-4o-mini');

      const { generateContent } = await import('../aiClient');
      
      const result = await generateContent('Reply strictly in JSON format without markdown. Reply: {"status": "OK"}', apiKey);
      if (result && result.status === 'OK') {
        setAiTestResult({ success: true, message: 'Соединение установлено!' });
      } else {
        setAiTestResult({ success: false, message: 'Ошибка: пустой или неверный ответ' });
      }
    } catch (e: any) {
      setAiTestResult({ success: false, message: e.message || 'Ошибка соединения' });
    } finally {
      setIsTestingAI(false);
    }
  };

  const themes = [
    { id: 'light', name: 'Светлая', color: '#F8FAFC' },
    { id: 'dark', name: 'Темная', color: '#0F1115' },
    { id: 'nordic', name: 'Nordic', color: '#1E232A' },
    { id: 'latte', name: 'Latte', color: '#F4F0EA' },
    { id: 'oled', name: 'OLED', color: '#000000' },
    { id: 'liquid-glass', name: 'Liquid Glass', color: '#0F172A' },
    { id: 'iman_love', name: 'Iman Love', color: '#FFF5F7' },
    { id: 'dimoon', name: 'Di Moon', color: '#050714' },
    { id: 'dimoon-blue', name: 'Di Moon Blue', color: '#020617' }
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8 space-y-8">
      {showConfirmReset && (
        <ConfirmModal 
          title="Сброс данных" 
          message="Вы уверены, что хотите удалить все данные? Это действие необратимо и вся ваша статистика будет удалена!" 
          onConfirm={confirmReset} 
          onCancel={() => setShowConfirmReset(false)} 
        />
      )}
      <div className="pt-4 md:pt-0">
        <h1 className="text-3xl md:text-4xl font-bold text-theme-text mb-2">Настройки</h1>
        <p className="text-theme-muted text-sm md:text-base">Управление интеграциями и настройками приложения.</p>
      </div>

      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-theme-text mb-4">Управление данными</h2>
        <p className="text-theme-muted mb-6 text-sm">
          Экспортируйте ваши данные для резервного копирования или полностью очистите историю, если хотите начать сначала.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExportData}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-theme-border dark:hover:bg-theme-border dark:text-theme-text px-5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-theme-border"
          >
            <span className="material-symbols-outlined text-xl">download</span>
            Экспортировать JSON
          </button>
          
          <button 
            onClick={handleResetData}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400 px-5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/30"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
            Удалить все данные
          </button>
        </div>
      </div>

      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-theme-text mb-4">Настройки ИИ провайдера</h2>
        <p className="text-theme-muted mb-6 text-sm">
          FocusFlow использует ИИ для автоматического создания конспектов. Вы можете использовать Gemini API по умолчанию,
          или любой API-совместимый с OpenAI (например, OpenRouter, DeepSeek, Together AI). 
          <br/><span className="text-theme-accent font-medium mt-1 inline-block">Если ключ не введен, приложение будет работать в тестовом (демо) режиме.</span>
        </p>

        <div className="space-y-6">
          <div className="flex gap-4 p-1 bg-theme-bg/50 rounded-xl w-full sm:w-fit border border-theme-border">
            <button
              onClick={() => setAiProvider('gemini')}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors ${aiProvider === 'gemini' ? 'bg-theme-card shadow-sm text-theme-accent border border-theme-border' : 'text-theme-muted hover:text-theme-text'}`}
            >
              Gemini API
            </button>
            <button
              onClick={() => setAiProvider('openai')}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors ${aiProvider === 'openai' ? 'bg-theme-card shadow-sm text-theme-accent border border-theme-border' : 'text-theme-muted hover:text-theme-text'}`}
            >
              OpenAI / OpenRouter
            </button>
          </div>

          {aiProvider === 'gemini' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Google Gemini API Key</label>
                <input 
                  type="password" 
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  className="w-full bg-theme-bg border-theme-border border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all"
                  placeholder="AIzaSy..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTestAI}
                  disabled={isTestingAI}
                  className="px-4 py-2 bg-theme-bg border border-theme-border rounded-lg text-sm font-medium hover:bg-theme-card transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isTestingAI ? (
                    <span className="w-4 h-4 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  )}
                  Проверить ключ
                </button>
                {aiTestResult && (
                  <span className={`text-xs font-medium ${aiTestResult.success ? 'text-theme-success' : 'text-red-500'} animate-in fade-in slide-in-from-left-2`}>
                    {aiTestResult.message}
                  </span>
                )}
              </div>
              <Accordion title="Инструкция для Gemini">
                <div className="text-sm text-theme-muted space-y-3">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Зайдите в <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-theme-accent hover:underline">Google AI Studio</a>.</li>
                    <li>Войдите с Google-аккаунтом.</li>
                    <li>Нажмите <strong>Create API key</strong> (создайте новый проект или выберите существующий).</li>
                    <li>Скопируйте ключ и вставьте в поле выше.</li>
                  </ol>
                  <p className="text-xs italic pt-1">Модель по умолчанию: <code>gemini-2.5-flash-lite</code>. Это самый быстрый и стабильный вариант.</p>
                </div>
              </Accordion>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">API Key (OpenRouter / OpenAI)</label>
                <input 
                  type="password" 
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  className="w-full bg-theme-bg border-theme-border border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all"
                  placeholder="sk-or-v1-..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Base URL</label>
                <input 
                  type="url" 
                  value={openaiUrl}
                  onChange={e => setOpenaiUrl(e.target.value)}
                  className="w-full bg-theme-bg border-theme-border border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all"
                  placeholder="https://openrouter.ai/api/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">Model Identifier</label>
                <input 
                  type="text" 
                  value={openaiModel}
                  onChange={e => setOpenaiModel(e.target.value)}
                  className="w-full bg-theme-bg border-theme-border border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all"
                  placeholder="google/gemini-2.0-flash-exp:free"
                />
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleTestAI}
                  disabled={isTestingAI}
                  className="px-4 py-2 bg-theme-bg border border-theme-border rounded-lg text-sm font-medium hover:bg-theme-card transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isTestingAI ? (
                    <span className="w-4 h-4 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  )}
                  Проверить соединение
                </button>
                {aiTestResult && (
                  <span className={`text-xs font-medium ${aiTestResult.success ? 'text-theme-success' : 'text-red-500'} animate-in fade-in slide-in-from-left-2`}>
                    {aiTestResult.message}
                  </span>
                )}
              </div>
              <Accordion title="Инструкция для OpenRouter">
                <div className="text-sm text-theme-muted space-y-3">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Зайдите на <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-theme-accent hover:underline">OpenRouter.ai</a>.</li>
                    <li>Создайте новый ключ (Keys &rarr; Create Key).</li>
                    <li>Base URL: укажите <code>https://openrouter.ai/api/v1</code>.</li>
                    <li>Model: укажите ID модели, например <code>google/gemini-2.0-flash-exp:free</code> для бесплатного использования.</li>
                  </ol>
                </div>
              </Accordion>
            </div>
          )}
        </div>
      </div>

      <div className="bg-theme-card border border-theme-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-theme-text mb-4">Интеграция с Google Таблицами (Webhook)</h2>
        <p className="text-theme-muted mb-6 text-sm">
          Чтобы сохранять данные в свою Google Таблицу на вашем диске, создайте скрипт в Google Apps Script 
          с функцией <code className="bg-theme-bg px-1 py-0.5 rounded text-theme-accent">doPost(e)</code>, разверните его как веб-приложение 
          и вставьте полученный URL ниже.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">URL веб-приложения (Webhook)</label>
            <input 
              type="url" 
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full bg-theme-bg border-theme-border border rounded-xl px-4 py-3 text-theme-text focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all"
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </div>
        </div>

        <Accordion title="Как настроить интеграцию">
          <div className="mt-4">
            <ol className="list-decimal list-inside space-y-3 text-theme-muted mb-6 text-sm md:text-base">
              <li>Создайте новую таблицу на <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-theme-accent hover:underline">sheets.google.com</a>.</li>
              <li>В верхнем меню таблицы выберите <strong>«Расширения»</strong> &rarr; <strong>«Apps Script»</strong>.</li>
              <li>Удалите весь код в открывшемся редакторе и вставьте код, приведенный ниже.</li>
              <li>Нажмите синюю кнопку <strong>«Начать развертывание»</strong> (Deploy) в правом верхнем углу &rarr; <strong>«Новое развертывание»</strong>.</li>
              <li>Выберите тип <strong>«Веб-приложение»</strong> (кликнув на шестеренку).</li>
              <li>В поле «У кого есть доступ» (Who has access) <strong>ОБЯЗАТЕЛЬНО</strong> выберите <strong>«Все»</strong> (Anyone).</li>
              <li>Нажмите <strong>«Начать развертывание»</strong>, предоставьте необходимые разрешения для скрипта.</li>
              <li>Скопируйте полученный <strong>URL веб-приложения</strong>, вставьте его в поле выше и сохраните.</li>
            </ol>

            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-theme-text">Код для Apps Script:</h4>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-theme-accent hover:text-theme-accent/80 transition-colors bg-theme-accent/10 px-2.5 py-1.5 rounded-lg"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Скопировано' : 'Копировать код'}
              </button>
            </div>
            <pre className="bg-theme-bg border border-theme-border p-4 rounded-xl text-xs md:text-sm text-theme-muted overflow-x-auto select-all">
{scriptCode}
            </pre>
          </div>
        </Accordion>
      </div>

      <div className="flex gap-4 sticky bottom-6 bg-theme-card p-4 rounded-2xl border border-theme-border shadow-xl z-10">
        <button 
          onClick={handleSave}
          className="flex-1 bg-theme-accent hover:bg-theme-accent/90 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-theme-accent/20"
        >
          {saved ? 'Настройки сохранены!' : 'Сохранить все настройки'}
        </button>
        <button 
          onClick={handleManualSync}
          disabled={!webhookUrl || isSyncing}
          className="flex-1 bg-theme-border hover:bg-theme-border/80 text-theme-text px-5 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {isSyncing ? 'Синхронизация...' : syncSuccess ? 'Успешно синхронизировано!' : 'Синхронизировать данные'}
        </button>
      </div>
    </div>
  );
}
