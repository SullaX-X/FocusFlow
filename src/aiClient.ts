export async function generateContent(prompt: string, apiKey: string) {
  if (!apiKey || apiKey.toLowerCase() === 'test') {
    // Mock responses for testing
    await new Promise(r => setTimeout(r, 1500)); // Simulate network delay
    
    if (prompt.includes('{"status": "OK"}')) {
      return { status: "OK" };
    }
    
    if (prompt.includes('Сделай краткое резюме') || prompt.includes('сделай краткий конспект')) {
      return { 
        summary: "• Это тестовое демо-резюме от встроенного ИИ.\n• FocusFlow может автоматически анализировать статьи и видео.\n• Для получения реальных данных, добавьте свой API ключ в настройках." 
      };
    }
    
    if (prompt.includes('вопроса для проверки')) {
      return { 
        questions: [
          "Что самое важное в этом материале (тестовый вопрос)?", 
          "Какие основные принципы можно выделить (тестовый вопрос)?", 
          "Как применить эти знания на практике (тестовый вопрос)?"
        ] 
      };
    }
    
    if (prompt.includes('Создай план обучения по теме') || prompt.includes('Создай подробный план обучения по теме')) {
      return { 
        themes: [
          {
            name: "Введение (Демо)",
            tasks: [
              { title: "Понять основы", description: "Изучение базовых концепций выбранной темы", energy: "high" },
              { title: "Настроить окружение", description: "Подготовка инструментов для работы", energy: "low" }
            ]
          },
          {
            name: "Практика (Демо)",
            tasks: [
              { title: "Первый проект", description: "Применение знаний на практике", energy: "high" },
              { title: "Анализ ошибок", description: "Разбор частых проблем", energy: "low" }
            ]
          }
        ] 
      };
    }
    
    return { status: "Mock Mode Active", message: "Тестовый режим: неизвестный промпт!" };
  }

  const provider = localStorage.getItem('focusflow_ai_provider') || 'gemini';

  if (provider === 'openai') {
    const baseUrl = localStorage.getItem('focusflow_openai_url') || 'https://api.openai.com/v1';
    const model = localStorage.getItem('focusflow_openai_model') || 'gpt-4o-mini';
    const openAiKey = localStorage.getItem('focusflow_openai_key') || apiKey;

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "system", content: "You must always output valid JSON without any markdown formatting like ```json ... ```. Just raw JSON." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Error communicating with AI API (Status: ${response.status})`);
    }

    const data = await response.json();
    let rawText = data.choices[0].message.content.trim();
    if (rawText.startsWith('```json')) {
       rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (rawText.startsWith('```')) {
       rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    try {
      return JSON.parse(rawText);
    } catch (e) {
      console.error('Failed to parse JSON response:', rawText);
      throw new Error('Invalid JSON response from AI');
    }
  }

  // Fallback / Default Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error communicating with Gemini API (Status: ${response.status})`);
  }

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;
  
  try {
    return JSON.parse(rawText);
  } catch (e) {
    console.error('Failed to parse JSON response:', rawText);
    throw new Error('Invalid JSON response from AI');
  }
}

