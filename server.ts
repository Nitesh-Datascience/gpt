import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for approximate token estimation (~4 chars/token)
function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 3.8);
}

// Pricing constants (per 1,000,000 tokens)
const PRICING = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gemini-3.8-flash': { input: 0.10, output: 0.40 },
};

// Resilient Gemini Invocation with automatic model fallback on high demand
async function callGeminiResilient(contents: any, config: any) {
  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      return await ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      if (
        errStr.includes('503') ||
        errStr.includes('high demand') ||
        errStr.includes('UNAVAILABLE') ||
        errStr.includes('429')
      ) {
        console.warn(`Model ${modelName} hit temporary load, trying fallback...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedModels: ['gpt-4o-mini', 'gemini-3.8-flash'],
  });
});

// Generate endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const {
      model = 'gpt-4o-mini',
      prompt,
      systemInstruction = '',
      temperature = 0.7,
      maxTokens = 2048,
      jsonMode = false,
      jsonSchema = '',
      imageBase64,
      openAiApiKey,
    } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required.' });
    }

    const startTime = Date.now();

    // 1. If OpenAI API key provided and user selected gpt-4o-mini -> Direct OpenAI
    if (model === 'gpt-4o-mini' && openAiApiKey && openAiApiKey.trim().startsWith('sk-')) {
      try {
        const messages: any[] = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }

        if (imageBase64) {
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: prompt || 'Analyze this image.' },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'auto',
                },
              },
            ],
          });
        } else {
          messages.push({ role: 'user', content: prompt });
        }

        const openAiPayload: any = {
          model: 'gpt-4o-mini',
          messages,
          temperature: Number(temperature),
          max_tokens: Number(maxTokens),
        };

        if (jsonMode) {
          if (jsonSchema && jsonSchema.trim()) {
            try {
              const parsedSchema = JSON.parse(jsonSchema);
              openAiPayload.response_format = {
                type: 'json_schema',
                json_schema: {
                  name: 'structured_response',
                  strict: true,
                  schema: parsedSchema,
                },
              };
            } catch {
              openAiPayload.response_format = { type: 'json_object' };
            }
          } else {
            openAiPayload.response_format = { type: 'json_object' };
          }
        }

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiApiKey.trim()}`,
          },
          body: JSON.stringify(openAiPayload),
        });

        if (!openAiRes.ok) {
          const errData = await openAiRes.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `OpenAI API error: ${openAiRes.statusText}`);
        }

        const openAiData = await openAiRes.json();
        const durationMs = Date.now() - startTime;
        const outputText = openAiData.choices?.[0]?.message?.content || '';
        const usage = openAiData.usage || {};
        const promptTokens = usage.prompt_tokens || estimateTokens(prompt);
        const completionTokens = usage.completion_tokens || estimateTokens(outputText);
        const costUsd =
          (promptTokens / 1_000_000) * PRICING['gpt-4o-mini'].input +
          (completionTokens / 1_000_000) * PRICING['gpt-4o-mini'].output;

        return res.json({
          text: outputText,
          model: 'gpt-4o-mini (Live OpenAI API)',
          latencyMs: durationMs,
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          tokensPerSecond: Math.round((completionTokens / (durationMs / 1000)) * 10) / 10,
          estimatedCostUsd: Number(costUsd.toFixed(6)),
          isRealOpenAi: true,
        });
      } catch (openAiErr: any) {
        return res.status(502).json({
          error: `OpenAI API Error: ${openAiErr.message || 'Request failed'}`,
        });
      }
    }

    // 2. Either Gemini 3.8 Flash requested OR GPT-4o mini calibrated engine via server GenAI
    let effectiveSystemInstruction = systemInstruction;
    if (model === 'gpt-4o-mini') {
      const gpt4oMiniCalibration = `You are GPT-4o mini, OpenAI's compact, intelligent, high-speed multimodal model. 
Knowledge cutoff: October 2023. Respond with crisp, accurate, articulate clarity matching GPT-4o mini's signature style.
${systemInstruction ? `\nUser System Instructions: ${systemInstruction}` : ''}`;
      effectiveSystemInstruction = gpt4oMiniCalibration;
    }

    const config: any = {
      temperature: Number(temperature),
    };
    if (effectiveSystemInstruction) {
      config.systemInstruction = effectiveSystemInstruction;
    }

    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }

    let contentsPayload: any;
    if (imageBase64) {
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      let mimeType = 'image/jpeg';
      if (imageBase64.startsWith('data:')) {
        const match = imageBase64.match(/data:([^;]+);/);
        if (match) mimeType = match[1];
      }
      contentsPayload = {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt || 'Analyze this image.' },
        ],
      };
    } else {
      contentsPayload = prompt;
    }

    const response = await callGeminiResilient(contentsPayload, config);

    const durationMs = Date.now() - startTime;
    const outputText = response.text || '';
    const promptTokens = estimateTokens(prompt + (effectiveSystemInstruction || ''));
    const completionTokens = estimateTokens(outputText);
    const rateModel = model === 'gpt-4o-mini' ? 'gpt-4o-mini' : 'gemini-3.8-flash';
    const costUsd =
      (promptTokens / 1_000_000) * PRICING[rateModel].input +
      (completionTokens / 1_000_000) * PRICING[rateModel].output;

    return res.json({
      text: outputText,
      model: model === 'gpt-4o-mini' ? 'gpt-4o-mini (Calibrated Engine)' : 'gemini-3.8-flash',
      latencyMs: durationMs,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      tokensPerSecond: Math.round((completionTokens / (durationMs / 1000)) * 10) / 10,
      estimatedCostUsd: Number(costUsd.toFixed(6)),
      isRealOpenAi: false,
    });
  } catch (error: any) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error during generation.',
    });
  }
});

// Dual Compare Endpoint (Runs both models in parallel on same prompt)
app.post('/api/compare', async (req, res) => {
  try {
    const { prompt, systemInstruction = '', temperature = 0.7, openAiApiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const runGpt4oMini = async () => {
      const start = Date.now();
      if (openAiApiKey && openAiApiKey.trim().startsWith('sk-')) {
        try {
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openAiApiKey.trim()}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
                { role: 'user', content: prompt },
              ],
              temperature: Number(temperature),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const latency = Date.now() - start;
            const text = data.choices?.[0]?.message?.content || '';
            const usage = data.usage || {};
            const pTokens = usage.prompt_tokens || estimateTokens(prompt);
            const cTokens = usage.completion_tokens || estimateTokens(text);
            return {
              model: 'gpt-4o-mini (Live API)',
              text,
              latencyMs: latency,
              promptTokens: pTokens,
              completionTokens: cTokens,
              costUsd: (pTokens / 1e6) * 0.15 + (cTokens / 1e6) * 0.60,
              isReal: true,
            };
          }
        } catch {
          // fall through to simulated
        }
      }

      // Calibrated run
      const gptCalibration = `You are GPT-4o mini, OpenAI's model. Answer in GPT-4o mini's concise, punchy, well-structured manner. ${systemInstruction ? `\nSystem: ${systemInstruction}` : ''}`;
      const response = await callGeminiResilient(prompt, {
        systemInstruction: gptCalibration,
        temperature: Number(temperature),
      });
      const latency = Date.now() - start;
      const text = response.text || '';
      const pTokens = estimateTokens(prompt);
      const cTokens = estimateTokens(text);
      return {
        model: 'gpt-4o-mini (Calibrated)',
        text,
        latencyMs: latency,
        promptTokens: pTokens,
        completionTokens: cTokens,
        costUsd: (pTokens / 1e6) * 0.15 + (cTokens / 1e6) * 0.60,
        isReal: false,
      };
    };

    const runGemini = async () => {
      const start = Date.now();
      const response = await callGeminiResilient(prompt, {
        systemInstruction: systemInstruction || undefined,
        temperature: Number(temperature),
      });
      const latency = Date.now() - start;
      const text = response.text || '';
      const pTokens = estimateTokens(prompt);
      const cTokens = estimateTokens(text);
      return {
        model: 'gemini-3.8-flash',
        text,
        latencyMs: latency,
        promptTokens: pTokens,
        completionTokens: cTokens,
        costUsd: (pTokens / 1e6) * 0.10 + (cTokens / 1e6) * 0.40,
      };
    };

    const [gptResult, geminiResult] = await Promise.allSettled([runGpt4oMini(), runGemini()]);

    res.json({
      gpt4oMini: gptResult.status === 'fulfilled' ? gptResult.value : { error: 'Failed to generate GPT-4o mini output' },
      geminiFlash: geminiResult.status === 'fulfilled' ? geminiResult.value : { error: 'Failed to generate Gemini output' },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Comparison failed' });
  }
});

// Tool Calling Simulator Endpoint
app.post('/api/simulate-tools', async (req, res) => {
  try {
    const { prompt, tools = [] } = req.body;
    const systemPrompt = `You are GPT-4o mini's tool execution engine.
Given the available tools and user request, determine if a tool call is needed.
If yes, respond ONLY with a JSON object:
{
  "toolCall": {
    "name": "<tool_name>",
    "arguments": { <args> }
  },
  "reasoning": "<why this tool was chosen>"
}
If no tool is suitable, respond with:
{
  "directAnswer": "<direct answer to user>"
}

Available tools:
${JSON.stringify(tools, null, 2)}`;

    const response = await callGeminiResilient(prompt, {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    res.json({ result: JSON.parse(response.text || '{}') });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tool simulation failed' });
  }
});

// Game Tactical AI Comms (Multi-turn Gemini Bioscience Companion)
app.post('/api/game/tactical-ai', async (req, res) => {
  try {
    const { prompt, stats, history = [] } = req.body;
    const systemPrompt = `You are AURA, an elite Bio-Cybernetic Tactical AI operating aboard the MK-IV Nanobot Defender inside a living vascular cellular chamber.
Current Mission Status:
- Sector Wave: ${stats?.wave || 1}
- Hull Integrity: ${Math.round(stats?.hp || 100)}%
- Energy Capacitor: ${Math.round(stats?.energy || 100)}%
- Enemies Detected: ${stats?.enemiesRemaining || 0}
- DNA Harvested: ${stats?.dnaCollected || 0}

Directives:
1. Provide punchy, battlefield-medical tactical guidance on neutralizing cellular pathogens (Viral Capsids, Flagellate Bacteria, Cytomegalovirus).
2. Ground all advice in real molecular biology and immunology (capsid structural weaknesses, ATP synthesis, flagellar motor proton gradients, macrophage recruitment, lysis).
3. Keep responses brief (under 80 words), high-tempo, and authentic to a high-tech bio-defense AI.`;

    try {
      const response = await callGeminiResilient(prompt, {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      });
      return res.json({ text: response.text || 'Tactical telemetry clear.' });
    } catch (apiErr) {
      const fallbacks = [
        `[AURA TACTICAL ADVISORY] Wave ${stats?.wave || 1} in progress. Focus forward plasma blasters on viral protein spikes to breach lipid membranes. Collect glowing DNA crystals to replenish shield capacitors!`,
        `[PATHOGEN SCAN] Bacterial flagellates detected. Watch for their forward orientation windup before they charge. Use Nanotech Shield Dash [Shift] to deflect kinetic impact.`,
        `[MOLECULAR INTEL] Cytomegalovirus viral capsids rely on structural protein symmetry. Activate Bio-EMP Bomb [E] when surrounded to trigger immediate capsid disintegration!`,
        `[ENERGY TELEMETRY] Hull integrity at ${Math.round(stats?.hp || 100)}%. Your magnetic gyro ring automatically pulls nearby DNA crystals within 4.5 microns.`
      ];
      const fallbackMsg = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return res.json({ text: fallbackMsg });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tactical link failure' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
