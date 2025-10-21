import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const therapists = [
  { id: 'sarah', name: 'Dr. Sarah Chen', prompt: 'You are Dr. Sarah Chen, a compassionate therapist.' },
  { id: 'james', name: 'Dr. James Williams', prompt: 'You are Dr. James Williams, a pragmatic therapist.' },
  { id: 'maria', name: 'Dr. Maria Rodriguez', prompt: 'You are Dr. Maria Rodriguez, an insightful therapist.' }
];

async function getAIResponse(messages, systemPrompt) {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 256,
      temperature: 0.7,
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Start debate: returns initial system and greeting
router.post('/start', async (req, res) => {
  const { topicId } = req.body;
  const topicTitle = topicId || 'Wellbeing';
  const systemPrompt = `Start a therapist debate about: ${topicTitle}. The debate should have a clear beginning, middle, and conclusion. Allow natural points for user intervention.`;
  res.json({
    messages: [
      { speakerId: 'system', text: `Welcome to the debate about ${topicTitle}.`, participants: [] }
    ],
    systemPrompt,
    nextSpeaker: therapists[0].id,
    turn: 0
  });
});

// Next debate exchange: returns next AI message
router.post('/next', async (req, res) => {
  const { transcript = [], systemPrompt, nextSpeaker, turn = 0 } = req.body;
  const therapist = therapists.find(t => t.id === nextSpeaker) || therapists[0];
  // Build messages for OpenAI
  const messages = [
    { role: 'system', content: systemPrompt },
    ...transcript.map(e => ({ role: e.speakerId === 'user' ? 'user' : 'assistant', content: e.text }))
  ];
  messages.push({ role: 'assistant', content: therapist.prompt });
  const aiReply = await getAIResponse(messages, systemPrompt);
  // Prepare next speaker
  const nextIndex = (therapists.findIndex(t => t.id === therapist.id) + 1) % therapists.length;
  const nextSpeakerId = therapists[nextIndex].id;
  // Insert user intervention every 5 turns
  let userIntervention = null;
  if ((turn + 1) % 5 === 0) {
    userIntervention = { speakerId: 'user', text: '[User may intervene here]', participants: [] };
  }
  // End after 20 turns
  let isEnd = false;
  if (turn + 1 >= 20) {
    isEnd = true;
  }
  res.json({
    message: { speakerId: therapist.id, text: aiReply, participants: [therapist.id] },
    userIntervention,
    nextSpeaker: nextSpeakerId,
    turn: turn + 1,
    isEnd,
    conclusion: isEnd ? { speakerId: 'system', text: 'The debate has reached its conclusion. Thank you for participating.', participants: [] } : null
  });
});

export default router;
