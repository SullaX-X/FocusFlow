import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('focusflow_webhook_url');
    if (stored) {
      setWebhookUrl(stored);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('focusflow_webhook_url', webhookUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const scriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Получаем переданные данные
    var data = JSON.parse(e.postData.contents);
    
    // Очищаем столбец A
    sheet.getRange("A:A").clearContent();
    
    // Записываем новые данные (как JSON) в первую ячейку
    sheet.getRange("A1").setValue(JSON.stringify(data));
    
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
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

  const confirmReset = () => {
    localStorage.removeItem('focusflow_disciplines');
    window.location.reload();
  };

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
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Настройки</h1>
        <p className="text-slate-500 dark:text-[#908fa0] text-sm md:text-base">Управление интеграциями и настройками приложения.</p>
      </div>

      <div className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Управление данными</h2>
        <p className="text-slate-500 dark:text-[#908fa0] mb-6 text-sm">
          Экспортируйте ваши данные для резервного копирования или полностью очистите историю, если хотите начать сначала.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleExportData}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#1c2b3c] dark:hover:bg-[#273647] dark:text-[#d4e4fa] px-5 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-[#273647]"
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

      <div className="bg-white dark:bg-[#122131] border border-slate-200 dark:border-[#273647] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Интеграция с Google Таблицами (Webhook)</h2>
        <p className="text-slate-500 dark:text-[#908fa0] mb-6 text-sm">
          Чтобы сохранять данные в свою Google Таблицу на вашем диске, создайте скрипт в Google Apps Script 
          с функцией <code className="bg-slate-100 dark:bg-[#051424] px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">doPost(e)</code>, разверните его как веб-приложение 
          и вставьте полученный URL ниже.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-[#908fa0] mb-2">URL веб-приложения (Webhook)</label>
            <input 
              type="url" 
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              className="w-full bg-slate-50 border-slate-200 text-slate-900 dark:bg-[#051424] border dark:border-[#273647] rounded-xl px-4 py-3 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-[#494bd6] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#494bd6] transition-all"
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </div>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-[#494bd6] dark:hover:bg-[#c0c1ff] dark:hover:text-[#1000a9] px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            {saved ? 'Сохранено!' : 'Сохранить настройки'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#273647]">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 text-lg">Как настроить интеграцию:</h3>
          
          <ol className="list-decimal list-inside space-y-3 text-slate-600 dark:text-[#908fa0] mb-6 text-sm md:text-base">
            <li>Создайте новую таблицу на <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">sheets.google.com</a>.</li>
            <li>В верхнем меню таблицы выберите <strong>«Расширения»</strong> &rarr; <strong>«Apps Script»</strong>.</li>
            <li>Удалите весь код в открывшемся редакторе и вставьте код, приведенный ниже.</li>
            <li>Нажмите синюю кнопку <strong>«Начать развертывание»</strong> (Deploy) в правом верхнем углу &rarr; <strong>«Новое развертывание»</strong>.</li>
            <li>Выберите тип <strong>«Веб-приложение»</strong> (кликнув на шестеренку).</li>
            <li>В поле «У кого есть доступ» (Who has access) <strong>ОБЯЗАТЕЛЬНО</strong> выберите <strong>«Все»</strong> (Anyone).</li>
            <li>Нажмите <strong>«Начать развертывание»</strong>, предоставьте необходимые разрешения для скрипта (может потребоваться перейти в "Дополнительные настройки").</li>
            <li>Скопируйте полученный <strong>URL веб-приложения</strong>, вставьте его в поле выше и сохраните.</li>
          </ol>

          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-800 dark:text-white">Код для Apps Script:</h4>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Скопировано' : 'Копировать код'}
            </button>
          </div>
          <pre className="bg-slate-50 dark:bg-[#051424] border border-slate-200 dark:border-[#273647] p-4 rounded-xl text-xs md:text-sm text-slate-700 dark:text-[#908fa0] overflow-x-auto select-all">
{scriptCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
