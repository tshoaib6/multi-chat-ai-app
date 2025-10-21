export async function fetchChatGPT(token: string, prompt: string, system?: string) {
  const res = await fetch('http://localhost:4000/api/chatgpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, system })
  });
  if (!res.ok) throw new Error('Failed to fetch ChatGPT response');
  return await res.json();
}
export async function fetchPublicChats(token: string) {
  const res = await fetch(`${API}/chat/public`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch public chats');
  return await res.json();
}
export async function fetchChat(token: string, chatId: number) {
  const res = await fetch(`${API}/chat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch chat');
  return await res.json();
}
const API = 'http://localhost:4000/api';

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return await res.json();
}

export async function register(username: string, password: string, fullName: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, fullName })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Register failed');
  return await res.json();
}

export async function fetchChats(token: string) {
  const res = await fetch(`${API}/chat`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch chats');
  return await res.json();
}

export async function saveChat(token: string, title: string, topicId: string, messages: any[], isPublic?: boolean) {
  const res = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, topicId, messages, ...(typeof isPublic === 'boolean' ? { isPublic } : {}) })
  });
  if (!res.ok) throw new Error('Failed to save chat');
  return await res.json();
}

export async function startDebateAPI(token: string, topicId: string) {
  const res = await fetch(`${API}/debate/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ topicId })
  });
  if (!res.ok) throw new Error('Failed to start debate');
  return await res.json(); // Expect { messages: [...] }
}

/**
 * Calls the next step in the debate, expects participants to possibly have fullName.
 */
export async function nextDebateAPI(token: string, payload: { transcript: any[]; systemPrompt: string; nextSpeaker: string; turn: number; }) {
  const res = await fetch(`${API}/debate/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to get next debate message');
  // If the backend returns participantsInfo with fullName, pass it through
  return await res.json(); // { message, userIntervention, nextSpeaker, turn, isEnd, conclusion, participantsInfo? }
}
