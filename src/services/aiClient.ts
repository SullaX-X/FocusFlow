export async function generateContent(prompt: string, apiKey: string) {
  if (!apiKey || apiKey.toLowerCase() === 'test') {
    // Mock responses for testing
    await new Promise(r => setTimeout(r, 1500)); // Simulate network delay
    
    if (prompt.includes('{"status": "OK"}')) {
      return { status: "OK" };
    }
    
    if (prompt.includes('Сделай краткое резюме') || prompt.includes('сделай краткий конспект')) {
      return { 
        summary: "• Это тестовое демо-резюме от встроенного ИИ.\n• Focus Moon может автоматически анализировать статьи и видео.\n• Для получения реальных данных, добавьте свой API ключ в настройках." 
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

  const provider = localStorage.getItem('focusmoon_ai_provider') || 'gemini';

  if (provider === 'openai') {
    const baseUrl = localStorage.getItem('focusmoon_openai_url') || 'https://api.openai.com/v1';
    const model = localStorage.getItem('focusmoon_openai_model') || 'google/gemini-1.5-flash-latest';
    const openAiKey = localStorage.getItem('focusmoon_openai_key') || apiKey;

    // Clean up base URL and ensure it points to the right endpoint
    let finalUrl = baseUrl.replace(/\/$/, '');
    if (!finalUrl.endsWith('/chat/completions')) {
      finalUrl += '/chat/completions';
    }

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Focus Moon',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "system", content: "You must always output valid JSON without any markdown formatting like ```json ... ```. Just raw JSON." }, { role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let msg = errorData.error?.message || `Error communicating with AI API (Status: ${response.status})`;
      if (msg.includes('Incorrect API key')) {
        msg = 'Неверный API ключ. Пожалуйста, проверьте его в настройках.';
      }
      throw new Error(msg);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      if (data.error) {
        throw new Error(data.error.message || 'API returned an error');
      }
      throw new Error('AI response is empty (no choices found)');
    }

    let rawText = data.choices[0].message.content.trim();
    
    // Robust JSON extraction
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }
    
    try {
      return JSON.parse(rawText);
    } catch (e) {
      console.error('Failed to parse AI response:', rawText);
      throw new Error('Не удалось обработать ответ от ИИ (ошибка формата)');
    }
  }

  // Fallback / Default Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  
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
    let msg = errorData.error?.message || `Error communicating with Gemini API (Status: ${response.status})`;
    if (msg.includes('API key not valid')) {
      msg = 'Неверный API ключ Gemini. Пожалуйста, проверьте его в настройках.';
    }
    throw new Error(msg);
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('AI response is empty (no candidates found)');
  }

  let rawText = data.candidates[0].content.parts[0].text;
  
  // Robust JSON extraction for Gemini too
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    rawText = jsonMatch[0];
  }

  try {
    return JSON.parse(rawText);
  } catch (e) {
    console.error('Failed to parse Gemini response:', rawText);
    throw new Error('Не удалось обработать ответ от Gemini (ошибка формата)');
  }
}

