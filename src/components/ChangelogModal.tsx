import { motion } from 'motion/react';

export default function ChangelogModal({ onClose }: { onClose: () => void }) {
  const updates = [
    {
      version: '1.9',
      date: 'Сегодня',
      features: [
        'Синхронизация Google Таблиц теперь сохраняет абсолютно все данные: статистику фокуса, входящие задачи (Inbox) и настройки',
        'Интеллектуальный парсинг во Входящих (Inbox): теперь вы можете использовать теги @дата #энергия !проект',
        'Глобальный контроллер аудио: теперь активный фоновый шум отображается на всех экранах (в нижнем правом углу)',
        'Безопасное переключение таймера: добавлено предупреждение при случайной смене режима до завершения сессии',
        'Исправлен баг, из-за которого свернутый таймер не разворачивался при запуске новой задачи'
      ]
    },
    {
      version: '1.8',
      date: 'Сегодня',
      features: [
        'Улучшена адаптивность мобильной версии: корректные отступы для безопасных зон экранов',
        'Исправлен баг с перекрытием элементов таймера и пасхалки телескопа в режиме фокусировки (Focus Mode) на небольших экранах',
        'Оптимизирована производительность списков задач (исправлено дублирование ключей)'
      ]
    },
    {
      version: '1.7',
      date: 'Сегодня',
      features: [
        'Звездное небо (пасхалка) в режиме FocusMode для темы Di Moon с возможностью кликать и менять фазы луны',
        'Праздничное конфетти при клике на логотип приложения (работает только в теме Di Moon)',
        'Возможность сворачивать и разворачивать карточки дисциплин для удобства навигации при большом количестве списков'
      ]
    },
    {
      version: '1.6',
      date: 'Ранее',
      features: [
        'Новая тема "Di Moon 🌙": космический нео-брутализм, звездная панель и адаптивные emoji',
        'Демо-режим ИИ: теперь можно тестировать функции генерации планов, конспектов и квизов без ввода API ключа (используются встроенные мок-данные)',
        'Поддержка OpenRouter и OpenAI: добавлена возможность использовать любые OpenAI-совместимые API',
        'Компактные инструкции: гайды по получению API ключей в настройках теперь аккуратно свернуты',
        'Улучшено окно приветствия (Onboarding): добавлена кнопка генерации демо-плана'
      ]
    },
    {
      version: '1.5',
      date: 'Ранее',
      features: [
        'Исправлен баг с рекомендационными таймерами: пресеты таймера (15, 25, 30, 60) больше не пропадают при наведении',
        'Исправлен баг с кастомным таймером: ввод значений больше не выдает 3120, добавлено логичное ограничение времени (до 24 часов)',
        'Улучшена визуализация трекера привычек: добавлены понятные иконки (галочки и крестики) вместо простого цветового кодирования',
        'Интерактивная проверка знаний: теперь можно отмечать правильные и неправильные ответы в AI квизах',
        'Повышена согласованность интерфейса: все акцентные элементы интерфейса строго следуют выбранной цветовой палитре темы',
        'Более чистый UI: переработан дизайн карточек дисциплин и чек-листов'
      ]
    },
    {
      version: '1.4',
      date: 'Ранее',
      features: [
        'Возможность отмены ИИ-генерации плана обучения и отмены старта фокуса при установке намерения',
        'Динамическая адаптация цветов: графики, теги и другие элементы теперь подстраиваются под выбранную визуальную тему (Nordic, Latte, OLED и т.д.) вместо статических цветов',
        'Добавление дисциплин прямо с главного экрана (Dashboard) через всплывающее окно',
        'Исправления ошибок и повышение общей стабильности работы интерфейса'
      ]
    },
    {
      version: '1.3',
      date: 'Ранее',
      features: [
        'Миграция хранилища: переход на асинхронный IndexedDB (localForage) для быстрой работы с большими конспектами',
        'AI Квизы: автоматическая генерация проверочных вопросов по конспекту (Проверить себя)',
        'Чек-листы внутри задач: удобное разбиение крупных задач на мелкие подзадачи с визуальным прогрессом',
        'Zen Lock v2: строгий контроль отвлечений с предупреждением при переключении вкладок',
        'Глобальная шпаргалка (Shift + ?) для быстрого доступа к шорткатам'
      ]
    },
    {
      version: '1.2',
      date: 'Ранее',
      features: [
        'Состояние «В потоке» (Flow State) — таймер начнет считать вверх, если вы хотите продолжить',
        'Независимый ручной таймер для запуска без ИИ прямо из задачи',
        'Аудио-окружение (Soundscapes): Белый, розовый и коричневый шумы для гиперфокуса',
        'Экранная концентрация (Auto-Dimming) — элементы управления плавно затухают при бездействии',
        'Микро-цели перед стартом сессии для максимальной осознанности',
        'Интеграция пользовательского API-ключа Gemini в настройках',
        'Динамическая смена акцентных цветов кнопок под текущую тему',
        'Полная адаптивность для планшетов и интуитивные подсказки'
      ]
    },
    {
      version: '1.1',
      date: 'Ранее',
      features: [
        'Умный анализ (Smart Summary) для материалов',
        'Zen Lock (Строгий режим) для блокировки отвлечений',
        'Кастомизация тем: Nordic, Latte, OLED',
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-theme-card border border-theme-border rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-theme-muted hover:text-theme-text hover:bg-theme-bg rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-theme-accent/20 flex items-center justify-center text-theme-accent">
            <span className="material-symbols-outlined text-2xl">campaign</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-text">Что нового</h2>
            <p className="text-theme-muted text-sm">История обновлений FocusFlow</p>
          </div>
        </div>

        <div className="space-y-8">
          {updates.map((update, i) => (
            <div key={update.version} className={`relative pl-6 ${i !== updates.length - 1 ? 'border-l-2 border-theme-border pb-8' : ''}`}>
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-theme-card border-2 border-theme-accent" />
              <div className="flex items-baseline gap-3 mb-4">
                <h3 className="text-lg font-bold text-theme-text">Версия {update.version}</h3>
                <span className="text-xs text-theme-muted font-medium">{update.date}</span>
              </div>
              <ul className="space-y-3">
                {update.features.map((feature, j) => (
                  <li key={j} className="flex gap-3 text-sm text-theme-muted items-start">
                    <span className="material-symbols-outlined text-[18px] text-theme-accent shrink-0 mt-0.5">check_circle</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-theme-border">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-theme-accent hover:bg-theme-accent/90 text-white rounded-xl font-bold transition-all"
          >
            Понятно, продолжить
          </button>
        </div>
      </motion.div>
    </div>
  );
}
