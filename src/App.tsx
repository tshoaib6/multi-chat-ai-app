import { useEffect, useRef, useState, useCallback } from 'react';
import LoginPage from './pages/Login';
import { fetchChats, saveChat, fetchChat, fetchPublicChats, fetchChatGPT, startDebateAPI, nextDebateAPI } from './api';
import TopicPicker from './components/TopicPicker';

import { topicAnxiety } from './data/topics.anxiety';
import { topicDigital } from './data/topics.digital';
import { topicWorkLife } from './data/topics.worklife';
import { exportJSON, exportTXT } from './engine/exporter';
import { stopScheduler } from './engine/scheduler';
import { useApp } from './stores';
import { personas } from './data/personas';
import Message from './components/Message';
import Composer from './components/Composer';
import Participants from './components/Participants';
import Controls from './components/Controls';
import TypingDots from './components/TypingDots';
const ComposerAny = Composer as any;




export default function App(){
// Chat mode: 'hardcoded' or 'api'
const [chatMode, setChatMode] = useState<'hardcoded'|'api'>('hardcoded');
// AI availability state
const [aiReady, setAiReady] = useState<boolean | null>(null);
const [aiError, setAiError] = useState<string | null>(null);
// Helper to get speakers index
	function personIndex(){
		return Object.fromEntries(Object.values(personas).map(p => [p.id, { name: p.name, role: p.role }])) as Record<string, {name:string; role:string}>
	}

	// Export handlers
	function handleExportTXT() {
		if (!topic) return;
		exportTXT(transcript, personIndex(), topic);
	}

	function handleExportJSON() {
		if (!topic) return;
		exportJSON(transcript, topic);
	}
	// Export handlers
const { setTopics, topics, currentTopicId, transcript, resetPlayback, playing, typingActive, typingSpeakerId, theme, setTheme, searchTerm, setSearch } = useApp();
const { setPlaying } = useApp(); // Moved setPlaying to its own line
const chatRef = useRef<HTMLDivElement | null>(null);
const topic = topics.find(t=>t.id===currentTopicId);

// Auth state
const [token, setToken] = useState<string|null>(localStorage.getItem('token'));
const [user, setUser] = useState<any>(token ? JSON.parse(localStorage.getItem('user') || 'null') : null);
const [privateChats, setPrivateChats] = useState<any[]>([]);
const [publicChats, setPublicChats] = useState<any[]>([]);
const [selectedChatId, setSelectedChatId] = useState<number|null>(null);
const [loadingChats, setLoadingChats] = useState(false);

// On login, fetch chats
useEffect(() => {
	if (!token) return;
	setLoadingChats(true);
	Promise.all([
		fetchChats(token),
		fetchPublicChats(token)
	])
		.then(([priv, pub]) => {
		if (!token) return;
			// Use the fetched results to populate the lists instead of incorrectly calling saveChat
			setPrivateChats(priv || []);
			setPublicChats(pub || []);
		})
		.finally(() => setLoadingChats(false));
}, [token]);

const fetchAllChats = useCallback(async () => {
	if (!token) return;
	setLoadingChats(true);
	try {
		const [priv, pub] = await Promise.all([
			fetchChats(token),
			fetchPublicChats(token)
		]);
		setPrivateChats(priv || []);
		setPublicChats(pub || []);
	} catch (err) {
		console.error('[Frontend] Error fetching chats:', err);
		setPrivateChats([]);
		setPublicChats([]);
	} finally {
		setLoadingChats(false);
	}
}, [token]);

useEffect(() => {
	fetchAllChats();
}, [fetchAllChats]);

const handleAuth = useCallback((newToken: string, newUser: any) => {
	setToken(newToken);
	setUser(newUser);
	localStorage.setItem('token', newToken);
	localStorage.setItem('user', JSON.stringify(newUser));
	// Immediately test OpenAI availability using the new token
	(async () => {
		try {
			setAiError(null);
			// Tiny, cheap probe to backend OpenAI proxy; system prompt kept minimal
			await fetchChatGPT(newToken, 'ping', 'Respond with: ok');
			setAiReady(true);
			setChatMode('api');
		} catch (e: any) {
			setAiReady(false);
			setChatMode('hardcoded');
			setAiError(e?.message || 'OpenAI is unavailable. Using local demo mode.');
		}
	})();
}, []);

async function handleSelectChat(chatId: number) {
	setSelectedChatId(chatId);
	if (!token) return;
	try {
		const chat = await fetchChat(token, chatId);
		// Set transcript in store
		if (chat && Array.isArray(chat.messages)) {
			resetPlayback();
			chat.messages.forEach((msg: any) => {
				useApp.getState().addEntry(msg);
			});
		}
	} catch {}
}

function handleSaveChat(title: string, messages: any[]) {
		if (!token || !topic) return;
		console.log('[Frontend] Creating chat:', { token, title, topicId: topic.id, messages });
		saveChat(token, title, topic.id, messages)
			.then(chat => {
				console.log('[Frontend] Chat created:', chat);
				setPrivateChats([chat, ...privateChats]);
				setSelectedChatId(chat.id);
			})
			.catch(err => {
				console.error('[Frontend] Error creating chat:', err);
			});
}


useEffect(()=>{ // boot
setTopics([topicAnxiety, topicDigital, topicWorkLife]);
resetPlayback();
}, []);


useEffect(()=>{ // clean up timers on unmount
return () => stopScheduler();
}, []);

// apply theme class on mount and whenever it changes
useEffect(()=>{
	try {
		if (theme === 'dark') document.documentElement.classList.add('dark');
		else document.documentElement.classList.remove('dark');
	} catch {}
}, [theme]);

// Step-by-step AI debate state and runner (inside component)
const [debateState, setDebateState] = useState<{
	systemPrompt: string;
	nextSpeaker: string;
	turn: number;
	running: boolean;
} | null>(null);
const debateStateRef = useRef<{
	systemPrompt: string;
	nextSpeaker: string;
	turn: number;
	running: boolean;
} | null>(null);
useEffect(() => { debateStateRef.current = debateState; }, [debateState]);

const PER_TURN_MS = 15000; // ~15s per exchange -> ~5–7 minutes for 20+ exchanges

function turnDelay() {
  const jitter = Math.floor(PER_TURN_MS * 0.2 * (Math.random() - 0.5));
  return Math.max(4000, PER_TURN_MS + jitter);
}

async function beginDebate() {
  if (!token || !currentTopicId) return;
  if (debateState?.running) return;
  try {
    setLoadingChats(true);
    console.log('[Frontend] Debate START for topic:', currentTopicId);
    const init = await startDebateAPI(token, currentTopicId);
    if (init?.messages?.length) {
      init.messages.forEach((msg: any) => {
        useApp.getState().addEntry({
          id: crypto.randomUUID(), topicId: currentTopicId, speakerId: msg.speakerId, text: msg.text,
          timestamp: Date.now(), participants: msg.participants || [], isPublic: false,
        });
      });
    }
		const newState = { systemPrompt: init.systemPrompt, nextSpeaker: init.nextSpeaker, turn: init.turn, running: true };
    setDebateState(newState);
    setPlaying(true);
		await runNextTurn(800 + Math.floor(Math.random()*600), newState);
  } catch (err) {
    console.error('[Frontend] beginDebate error:', err);
    useApp.getState().addEntry({ id: crypto.randomUUID(), topicId: currentTopicId!, speakerId: 'system', text: 'Error starting debate.', timestamp: Date.now(), participants: [], isPublic: false });
  } finally { setLoadingChats(false); }
}

async function runNextTurn(delayMs?: number, dsOverride?: { systemPrompt: string; nextSpeaker: string; turn: number; running: boolean; }) {
  const ds = dsOverride ?? debateStateRef.current; if (!ds || !token || !currentTopicId) return;
  if (!useApp.getState().playing) return;
  useApp.getState().setTyping(true, ds.nextSpeaker as any);
  if (delayMs) await new Promise(r => setTimeout(r, delayMs));
  try {
    console.log('[Frontend] NEXT turn', { turn: ds.turn + 1, speaker: ds.nextSpeaker });
    const current = useApp.getState().transcript.filter(e => e.topicId === currentTopicId).map(e => ({ speakerId: e.speakerId, text: e.text }));
    const res = await nextDebateAPI(token, { transcript: current, systemPrompt: ds.systemPrompt, nextSpeaker: ds.nextSpeaker, turn: ds.turn });
    useApp.getState().setTyping(false);
    if (res?.message) {
      useApp.getState().addEntry({ id: crypto.randomUUID(), topicId: currentTopicId, speakerId: res.message.speakerId, text: res.message.text, timestamp: Date.now(), participants: res.message.participants || [], isPublic: false });
    }
    if (res?.userIntervention) {
      useApp.getState().addEntry({ id: crypto.randomUUID(), topicId: currentTopicId, speakerId: 'system', text: res.userIntervention.text, timestamp: Date.now(), participants: [], isPublic: false });
    }
    if (res?.isEnd) {
      if (res?.conclusion) {
        useApp.getState().addEntry({ id: crypto.randomUUID(), topicId: currentTopicId, speakerId: 'system', text: res.conclusion.text, timestamp: Date.now(), participants: [], isPublic: false });
      }
      setDebateState(prev => prev ? { ...prev, running: false } : prev);
      setPlaying(false);
      console.log('[Frontend] Debate FINISHED');
      return;
    }
    setDebateState(prev => prev ? { ...prev, nextSpeaker: res.nextSpeaker, turn: res.turn } : prev);
		if (useApp.getState().playing) {
			const nextState = { systemPrompt: ds.systemPrompt, nextSpeaker: res.nextSpeaker, turn: res.turn, running: true };
			setTimeout(() => { runNextTurn(turnDelay(), nextState); }, 0);
    }
  } catch (err) {
    console.error('[Frontend] runNextTurn error:', err);
    useApp.getState().setTyping(false);
    setPlaying(false);
  }
}

// Resume scheduling if user unpauses
useEffect(() => {
	if (playing && debateStateRef.current?.running) {
		runNextTurn(1000);
	}
}, [playing]);


// Smooth scroll to bottom when transcript grows
useEffect(() => {
	const el = chatRef.current;
	if (el) {
		el.scrollTop = el.scrollHeight;
	}
}, [transcript]);
// If not logged in, show login page
if (!token) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-fadein">
				<LoginPage onAuth={handleAuth} />
			</div>
		);
}

return (
<div className="min-h-screen text-gray-900 dark:text-gray-100 bg-gradient-to-br from-blue-50 via-teal-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
	{aiReady === false && (
		<div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 p-3 text-sm flex items-center justify-center">
			<span className="mr-2">⚠️</span>
			<span>{aiError || 'OpenAI is unavailable. Switching to local demo mode.'} You can continue in Hardcoded mode or try again later.</span>
		</div>
	)}
	{aiReady && chatMode === 'api' && (
		<div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 p-2 text-xs text-center">OpenAI is connected. Enjoy AI-driven debates!</div>
	)}
	<header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
		<div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 flex flex-col sm:flex-row flex-wrap items-center gap-3 justify-between">
			<div className="flex items-center gap-3 w-full sm:w-auto justify-between">
				<h1 className="text-lg font-semibold">Multi‑AI Therapist Debate</h1>
				<span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800">Demo</span>
				<div className="ml-4 flex items-center gap-2">
					<span className="text-xs font-semibold">Mode:</span>
					<select value={chatMode} onChange={e => setChatMode(e.target.value as 'hardcoded'|'api')} className="px-2 py-1 rounded border bg-white dark:bg-gray-900 text-xs">
						<option value="hardcoded">Hardcoded</option>
						<option value="api">AI (ChatGPT)</option>
					</select>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
				<TopicPicker />
				<Controls />
				<div className="select-wrapper w-full sm:w-auto">
					<input value={searchTerm ?? ''} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" className="px-3 py-2 rounded-md border w-full sm:w-auto" />
				</div>
				<button
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					aria-label="Toggle dark mode"
					className="p-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center"
				>
					{theme === 'dark' ? (
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>
					) : (
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v2M12 19v-2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
					)}
				</button>
				<button onClick={handleExportTXT} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 7h10v2H7zM7 11h10v2H7z" fill="currentColor"/></svg>
					Export TXT
				</button>
				<button onClick={handleExportJSON} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
					Export JSON
				</button>
			</div>
		</div>
	</header>

	<main className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-4 sm:gap-6 mt-4 px-1 sm:px-2">
		{/* Sidebar left */}
		<aside className="w-full lg:w-[300px] flex-shrink-0 space-y-4 min-h-[70vh] flex flex-col order-2 lg:order-1 mb-4 lg:mb-0">
		{/* Participants section at top */}
		<div className="mb-2">
			<Participants />
		</div>
		{/* Debate section */}
		<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
			<h2 className="font-semibold mb-2">Debate</h2>
			<button onClick={beginDebate} className="mb-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold">Start Debate</button>
			{/* Add more UI elements for submitting entries and viewing debates */}
		</div>
		{/* User profile and logout */}
		<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
			<div>
				<div className="font-semibold">{user?.username}</div>
				<div className="text-xs text-gray-500">Logged in</div>
			</div>
			<button
				className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
				onClick={() => {
					setToken(null);
					setUser(null);
					localStorage.removeItem('token');
					localStorage.removeItem('user');
					setPrivateChats([]);
					setSelectedChatId(null);
				}}
			>Logout</button>
		</div>
		{/* Chat list: public and private */}
		<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm flex-1 flex flex-col">
			{/* New Chat Button */}
			<button
				onClick={() => {
					if (topic) {
						const firstQuestion = window.prompt('Enter the first question (this will be the chat name):');
						if (firstQuestion) {
							handleSaveChat(firstQuestion, [{
								id: crypto.randomUUID(),
								topicId: topic.id,
								speakerId: 'user',
								text: firstQuestion,
								timestamp: Date.now(),
								participants: [], // Add participants array
								isPublic: false, // Set isPublic to false
							}]);
						}
					} else {
						alert('Please select a topic first');
					}
			}}
			className="w-full mb-4 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
			>
				+ New Chat
			</button>

			<div className="font-semibold mb-1">Public Chats</div>
			{loadingChats ? <div>Loading…</div> : (
				publicChats.length === 0 ? (
					<div className="text-gray-400 text-xs">No public chats yet</div>
				) : (
					<ul className="space-y-2">
						{publicChats.map(chat => (
							<li key={chat.id} className="flex items-center justify-between">
								<button
									className={`flex-1 text-left px-2 py-1 rounded ${selectedChatId === chat.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
									onClick={() => handleSelectChat(chat.id)}
								>
									{chat.title || 'Untitled'}
									<span className="ml-2 text-xs text-gray-500">{new Date(chat.createdAt).toLocaleString()}</span>
								</button>
								{chat.userId === user.id && (
									<button
										onClick={() => {
											if (window.confirm('Delete this chat?')) {
												fetch(`/api/chat/${chat.id}`, {
													method: 'DELETE',
													headers: { 'Authorization': `Bearer ${token}` }
												}).then(() => {
													setPublicChats(chats => chats.filter(c => c.id !== chat.id));
													if (selectedChatId === chat.id) setSelectedChatId(null);
												});
											}
										}}
										className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
									</button>
								)}
							</li>
						))}
					</ul>
				)
			)}
			<div className="font-semibold mb-1 mt-6">Your Private Chats</div>
			{loadingChats ? <div>Loading…</div> : (
				privateChats.length === 0 ? (
					<div className="text-gray-400 text-xs">No private chats yet</div>
				) : (
					<ul className="space-y-2">
						{privateChats.map(chat => (
							<li key={chat.id} className="flex items-center justify-between">
								<button
									className={`flex-1 text-left px-2 py-1 rounded ${selectedChatId === chat.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
									onClick={() => handleSelectChat(chat.id)}
								>
									{chat.title || 'Untitled'}
									<span className="ml-2 text-xs text-gray-500">{new Date(chat.createdAt).toLocaleString()}</span>
								</button>
								<div className="flex items-center">
									{/* Toggle Privacy Button */}
									<button
										onClick={() => {
											fetch(`/api/chat/${chat.id}/privacy`, {
												method: 'POST',
												headers: {
													'Authorization': `Bearer ${token}`,
													'Content-Type': 'application/json'
												},
												body: JSON.stringify({ isPublic: true })
											}).then(() => {
												setPrivateChats(chats => chats.filter(c => c.id !== chat.id));
												setPublicChats(chats => [chat, ...chats]);
											});
										}}
										className="ml-2 p-1 text-blue-500 hover:bg-blue-100 rounded"
										title="Make Public"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
									</button>
									{/* Delete Button */}
									<button
										onClick={() => {
											if (window.confirm('Delete this chat?')) {
												fetch(`/api/chat/${chat.id}`, {
													method: 'DELETE',
													headers: { 'Authorization': `Bearer ${token}` }
												}).then(() => {
													setPrivateChats(chats => chats.filter(c => c.id !== chat.id));
													if (selectedChatId === chat.id) setSelectedChatId(null);
												});
											}
										}}
										className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
									</button>
								</div>
							</li>
						))}
					</ul>
				)
			)}
		</div>
		{/* How to use */}
		<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">
			<div className="font-semibold mb-1">How to use</div>
			<p>Select a topic, press Play, jump in with your message any time, and export the transcript when done.</p>
		</div>
	</aside>
		{/* Centered chat panel */}
	<section className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 sm:p-3 md:p-4 flex flex-col h-[60vh] sm:h-[70vh] w-full order-1 lg:order-2 overflow-hidden">
{/* Topic summary & actions */}
<div className="flex items-center justify-between mb-3">
<div>
<div className="font-semibold">{topic?.title}</div>
<div className="text-sm opacity-70">{topic?.summary}</div>
</div>
<div>
<button className="text-sm underline opacity-80" onClick={async ()=> {
  if (!playing) {
    await beginDebate();
  } else {
    setPlaying(false);
  }
}}>
  {playing ? 'Pause' : 'Play'} debate
</button>
</div>
</div>
{/* Chat */}
<div ref={chatRef} className="flex-1 min-h-0 overflow-auto chat-scroll space-y-4 pr-1 md:pr-2 max-h-[40vh] sm:max-h-none" id="chat">
{transcript.map(e => (
	<Message entry={e} key={e.id} searchTerm={searchTerm} />
))}

{/* typing indicator: only show when a non-user speaker is typing */}
{typingActive && typingSpeakerId && typingSpeakerId !== 'user' && (
	<div className="flex gap-3 items-center">
		<div className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-xl bg-gray-100 dark:bg-gray-800">{/* avatar placeholder */}
			{ /* show avatar from personas if available */ }
			{ (personas as any)[typingSpeakerId]?.avatar }
		</div>
		<div className="text-sm text-gray-700 dark:text-gray-300"><TypingDots /></div>
	</div>
)}

</div>


<div className="mt-3">
	<p className="text-xs opacity-70 mt-1">Simulation for education only • Not medical advice</p>
{/* Composer at bottom of chat panel */}
<div className="mt-2">
	<ComposerAny onSaveChat={handleSaveChat} />
</div>
</div>
</section>
</main>
</div>
);
}