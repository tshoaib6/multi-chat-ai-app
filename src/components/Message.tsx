import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { personas } from '../data/personas';
import type { TranscriptEntry } from '../types';


export default function Message({ entry }: { entry: TranscriptEntry }) {
const p = personas[entry.speakerId];
const color = p.color as any;
return (
<div className="flex gap-3">
<div className={`shrink-0 w-9 h-9 rounded-full grid place-items-center text-xl bg-${color}/10`}>{p.avatar}</div>
<div>
<div className="text-xs opacity-70">
<span className={`font-medium text-${color}-700 dark:text-${color}-300`}>{p.name}</span>
<span className="mx-1">•</span>
<span>{p.role}</span>
<span className="mx-1">•</span>
<time title={dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
{dayjs(entry.timestamp).fromNow()}
</time>
</div>
<div className="mt-1 text-[15px] leading-6">{entry.text}</div>
</div>
</div>
);
}