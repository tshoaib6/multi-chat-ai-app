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
	<div className="flex gap-2 items-end">
		<textarea
			value={val}
			onChange={e=> setVal(e.target.value)}
			onKeyDown={e=> { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }}}
			placeholder="Jump in with your message…"
			className="w-full min-h-[48px] max-h-40 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
		/>

		<button onClick={send} className="px-4 py-2 rounded-xl bg-gray-900 text-white flex items-center gap-2">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor"/></svg>
			Send
		</button>
	</div>
);
}