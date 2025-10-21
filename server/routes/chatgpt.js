import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

router.post('/', async (req, res) => {
  const { prompt, system } = req.body;
  console.log('[ChatGPT API] Incoming request:', { prompt, system });
  if (!OPENAI_API_KEY) {
    console.error('[ChatGPT API] Missing OpenAI API key');
    return res.status(500).json({ error: 'OpenAI API key missing' });
  }
  if (!prompt) {
    console.error('[ChatGPT API] Missing prompt');
    return res.status(400).json({ error: 'Prompt required' });
  }

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          system ? { role: 'system', content: system } : null,
          { role: 'user', content: prompt }
        ].filter(Boolean),
        max_tokens: 512,
        temperature: 0.7,
      })
    });
    const data = await response.json();
    console.log('[ChatGPT API] OpenAI response:', data);
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI error');
    const message = data.choices?.[0]?.message?.content || '';
    res.json({ message });
  } catch (err) {
    console.error('[ChatGPT API] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
