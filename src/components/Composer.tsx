import { useState } from 'react';
import { useApp, makeEntry } from '../stores';


export default function Composer(){
const [val, setVal] = useState('');
const { currentTopicId, addEntry } = useApp();


function send(){
const text = val.trim();
if (!text) return;
addEntry(makeEntry(currentTopicId, 'user', text));
setVal('');
}


return (
<div className="flex flex-col sm:flex-row gap-2 items-end">
<textarea
value={val}
onChange={e=> setVal(e.target.value)}
onKeyDown={e=> { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }}}
placeholder="Jump in with your message…"
className="w-full sm:flex-1 min-h-[48px] max-h-40 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
/>
<div className="w-full sm:w-auto">
	<button onClick={send} className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900">Send</button>
</div>
</div>
);
}