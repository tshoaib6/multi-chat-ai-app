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

export async function register(username: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
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

export async function saveChat(token: string, title: string, topicId: string, messages: any[]) {
  const res = await fetch(`${API}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, topicId, messages })
  });
  if (!res.ok) throw new Error('Failed to save chat');
  return await res.json();
}
