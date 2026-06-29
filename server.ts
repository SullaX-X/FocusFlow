import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Plan Generation
  app.post("/api/ai/plan", async (req, res) => {
    try {
      const { topic, level, time } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `Создай план обучения для дисциплины "${topic}". Уровень: ${level}. Доступное время: ${time} в день. 
Сгенерируй минимум 2 темы (например, "Основы", "Продвинутый уровень") и по 2-4 задачи для каждой темы.
Оцени уровень энергии (high или low) для каждой задачи: сложные когнитивные задачи = high, легкие = low.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          energy: { type: Type.STRING, description: "high or low" },
                          description: { type: Type.STRING, description: "Short description" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      const data = JSON.parse(jsonStr);
      res.json({ success: true, data });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route for Smart Summary
  app.post("/api/ai/summary", async (req, res) => {
    try {
      const { url } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured.");
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Сделай краткую выжимку (Smart Summary) для следующего материала: ${url}. 
Сделай выжимку на 3-4 абзаца. Выдели главное, убери воду. Если это YouTube или недоступный сайт, придумай хорошую заглушку, описывающую возможный контент, так как ты ИИ и у тебя может не быть доступа к прямому чтению некоторых URL. В любом случае верни осмысленный текст.`,
      });

      res.json({ success: true, summary: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
