import re

with open('src/aiClient.ts', 'r') as f:
    content = f.read()

# Replace the openai error handling
content = content.replace(
"""    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Error communicating with AI API (Status: ${response.status})`);
    }""",
"""    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let msg = errorData.error?.message || `Error communicating with AI API (Status: ${response.status})`;
      if (msg.includes('Incorrect API key')) {
        msg = 'Неверный API ключ OpenAI. Пожалуйста, проверьте его в настройках.';
      }
      throw new Error(msg);
    }"""
)

# Same for Gemini
content = content.replace(
"""  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error communicating with Gemini API (Status: ${response.status})`);
  }""",
"""  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = errorData.error?.message || `Error communicating with Gemini API (Status: ${response.status})`;
    if (msg.includes('API key not valid')) {
      msg = 'Неверный API ключ Gemini. Пожалуйста, проверьте его в настройках.';
    }
    throw new Error(msg);
  }"""
)

with open('src/aiClient.ts', 'w') as f:
    f.write(content)
