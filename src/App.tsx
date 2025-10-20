import { useEffect } from 'react';
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




export default function App(){
const { setTopics, topics, currentTopicId, transcript, resetPlayback, playing } = useApp();
const topic = topics.find(t=>t.id===currentTopicId);


useEffect(()=>{ // boot
setTopics([topicAnxiety, topicDigital, topicWorkLife]);
resetPlayback();
}, []);


useEffect(()=>{ // clean up timers on unmount
return () => stopScheduler();
}, []);


function handleExportTXT(){ if(topic) exportTXT(transcript, personIndex(), topic); }
function handleExportJSON(){ if(topic) exportJSON(transcript, topic); }


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
<button onClick={handleExportTXT} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700">Export TXT</button>
<button onClick={handleExportJSON} className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700">Export JSON</button>
</div>
</div>
</header>


<main className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 mt-4">
<section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4 flex flex-col min-h-[70vh]">
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
<div className="flex-1 overflow-auto chat-scroll space-y-4 pr-1" id="chat">
{transcript.map(e => (
<Message entry={e} key={e.id} />
))}
</div>


<div className="mt-3">
<Composer />
<p className="text-xs opacity-70 mt-1">Simulation for education only • Not medical advice</p>
</div>
</section>
<aside className="space-y-4">
<Participants />
<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">
<div className="font-semibold mb-1">How to use</div>
<p>Select a topic, press Play, jump in with your message any time, and export the transcript when done.</p>
</div>
</aside>
</main>
</div>
);
}


function personIndex(){
return Object.fromEntries(Object.values(personas).map(p => [p.id, { name: p.name, role: p.role }])) as Record<string, {name:string; role:string}>;
}