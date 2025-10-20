import { useApp } from '../stores';


export default function TopicPicker() {
const { topics, currentTopicId, setTopic, resetPlayback } = useApp();
return (
<div className="flex items-center gap-2">
<select
value={currentTopicId}
onChange={(e)=>{ setTopic(e.target.value); resetPlayback(); }}
className="px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
>
{topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
</select>
</div>
);
}