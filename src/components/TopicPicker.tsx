import { useApp } from '../stores';


export default function TopicPicker() {
const { topics, currentTopicId, setTopic, resetPlayback } = useApp();
return (
	<div className="flex items-center gap-2">
		<div className="select-wrapper">
			<select
				value={currentTopicId}
				onChange={(e)=>{ setTopic(e.target.value); resetPlayback(); }}
				className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
			>
				{topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
			</select>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
		</div>
	</div>
);
}