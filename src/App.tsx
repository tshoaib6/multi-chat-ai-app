import { useEffect, useRef, useState } from 'react';
import LoginPage from './pages/Login';
import { fetchChats, saveChat, fetchChat } from './api';
import TopicPicker from './components/TopicPicker';

import { topicAnxiety } from './data/topics.anxiety';
import { topicDigital } from './data/topics.digital';
import { topicWorkLife } from './data/topics.worklife';
import { exportJSON, exportTXT } from './engine/exporter';
import { setPlaying, stopScheduler } from './engine/scheduler';
import { useApp } from './stores';
import { personas } from './data/personas';
import Message from './components/Message';
import Composer from './components/Composer';
import Participants from './components/Participants';
import Controls from './components/Controls';
import TypingDots from './components/TypingDots';




export default function App(){
const { setTopics, topics, currentTopicId, transcript, resetPlayback, playing, typingActive, typingSpeakerId, theme, setTheme, searchTerm, setSearch } = useApp();
const chatRef = useRef<HTMLDivElement | null>(null);
const topic = topics.find(t=>t.id===currentTopicId);

// Auth state
const [token, setToken] = useState<string|null>(localStorage.getItem('token'));
const [user, setUser] = useState<any>(token ? JSON.parse(localStorage.getItem('user') || 'null') : null);
const [chats, setChats] = useState<any[]>([]);
const [selectedChatId, setSelectedChatId] = useState<number|null>(null);
const [loadingChats, setLoadingChats] = useState(false);

// On login, fetch chats
useEffect(() => {
	if (!token) return;
	setLoadingChats(true);
	fetchChats(token)
		.then(setChats)
		.catch(() => setChats([]))
		.finally(() => setLoadingChats(false));
}, [token]);

function handleAuth(newToken: string, newUser: any) {
	setToken(newToken);
	setUser(newUser);
	localStorage.setItem('token', newToken);
	localStorage.setItem('user', JSON.stringify(newUser));
}

async function handleSelectChat(chatId: number) {
	setSelectedChatId(chatId);
	if (!token) return;
	try {
		const chat = await fetchChat(token, chatId);
		// Set transcript in store
		if (chat && Array.isArray(chat.messages)) {
			// Use store's resetPlayback and addEntry for each message
			resetPlayback();
			chat.messages.forEach((msg: any) => {
				// If msg is not a TranscriptEntry, adapt as needed
				// For now, assume it matches TranscriptEntry
				useApp.getState().addEntry(msg);
			});
		}
	} catch {}
}

function handleSaveChat(title: string, messages: any[]) {
	if (!token) return;
	saveChat(token, title, messages).then(chat => {
		setChats([chat, ...chats]);
		setSelectedChatId(chat.id);
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


// Smooth scroll to bottom when transcript grows or when typing stops (a new AI message likely appended)
useEffect(()=>{
	const el = chatRef.current;
	if (!el) return;
	// wait for DOM updates then scroll to bottom smoothly
	requestAnimationFrame(() => {
		el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
	});
}, [transcript.length, typingActive]);


function handleExportTXT(){ if(topic) exportTXT(transcript, personIndex(), topic); }
function handleExportJSON(){ if(topic) exportJSON(transcript, topic); }


if (!token) {
	return <LoginPage onAuth={handleAuth} />;
}

return (
<div className="min-h-screen text-gray-900 dark:text-gray-100">
<header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
<div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
<div className="flex items-center gap-3">
<h1 className="text-lg font-semibold">Multi‑AI Therapist Debate</h1>
<span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800">Demo</span>
</div>
	<div className="flex items-center gap-3">
	<TopicPicker />
	<Controls />
		<div className="select-wrapper">
			<input value={searchTerm ?? ''} onChange={e => setSearch(e.target.value)} placeholder="Search messages…" className="px-3 py-2 rounded-md border" />
		</div>

	<button
		onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
		aria-label="Toggle dark mode"
		className="p-2 rounded-md border border-gray-200 dark:border-gray-700 flex items-center"
	>
		{theme === 'dark' ? (
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/></svg>
		) : (
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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


<main className="w-full flex justify-center items-start gap-6 mt-6 px-2">
	{/* Sidebar left */}
	<aside className="w-[300px] flex-shrink-0 space-y-4 min-h-[70vh] flex flex-col">
		{/* Participants section at top */}
		<div className="mb-2">
			<Participants />
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
					setChats([]);
					setSelectedChatId(null);
				}}
			>Logout</button>
		</div>
		{/* Chat list */}
		<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm flex-1 flex flex-col">
			<div className="font-semibold mb-1">Your Chats</div>
			{loadingChats ? <div>Loading…</div> : (
				<ul className="space-y-2 overflow-auto flex-1">
					{chats.length === 0 ? (
						<li className="text-gray-400 text-xs">No chats yet</li>
					) : chats.map(chat => (
						<li key={chat.id}>
							<button
								className={`w-full text-left px-2 py-1 rounded ${selectedChatId === chat.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
								onClick={() => handleSelectChat(chat.id)}
							>
								{chat.title || 'Untitled'}
								<span className="ml-2 text-xs text-gray-500">{new Date(chat.createdAt).toLocaleString()}</span>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
		{/* How to use */}
		<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">
			<div className="font-semibold mb-1">How to use</div>
			<p>Select a topic, press Play, jump in with your message any time, and export the transcript when done.</p>
		</div>
	</aside>
		{/* Centered chat panel */}
			<section className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4 flex flex-col h-[70vh]">
{/* Topic summary & actions */}
<div className="flex items-center justify-between mb-3">
<div>
<div className="font-semibold">{topic?.title}</div>
<div className="text-sm opacity-70">{topic?.summary}</div>
</div>
<div>
<button className="text-sm underline opacity-80" onClick={()=> setPlaying(!playing)}>
{playing ? 'Pause' : 'Play'} debate
</button>
</div>
</div>
{/* Chat */}
<div ref={chatRef} className="flex-1 min-h-0 overflow-auto chat-scroll space-y-4 pr-1 md:pr-2" id="chat">
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
</div>
{/* Composer at bottom of chat panel */}
<div className="mt-2">
	<Composer />
</div>
</section>


								{/* ...existing code... */}

	</main>
	</div>
);
}


function personIndex(){
return Object.fromEntries(Object.values(personas).map(p => [p.id, { name: p.name, role: p.role }])) as Record<string, {name:string; role:string}>;
}