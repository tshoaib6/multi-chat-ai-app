import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { personas } from '../data/personas';
import type { TranscriptEntry } from '../types';


export default function Message({ entry }: { entry: TranscriptEntry }) {
	const p = personas[entry.speakerId];

	// explicit Tailwind class mapping per persona color key
	const colorClasses: Record<string, { avatarBg: string; nameText: string; bubbleBg: string }> = {
		sarah: { avatarBg: 'bg-sarah/10', nameText: 'text-sarah-700 dark:text-sarah-300', bubbleBg: 'bg-sarah/5' },
		james: { avatarBg: 'bg-james/10', nameText: 'text-james-700 dark:text-james-300', bubbleBg: 'bg-james/5' },
		maria: { avatarBg: 'bg-maria/10', nameText: 'text-maria-700 dark:text-maria-300', bubbleBg: 'bg-maria/5' },
		user: { avatarBg: 'bg-user/10', nameText: 'text-user-700 dark:text-user-300', bubbleBg: 'bg-user/5' },
	};

	const classes = colorClasses[p.color] ?? { avatarBg: 'bg-gray-100', nameText: 'text-gray-700', bubbleBg: 'bg-gray-50' };

	return (
		<div className="flex gap-3">
			<div className={`shrink-0 w-9 h-9 rounded-full grid place-items-center text-xl ${classes.avatarBg}`}>{p.avatar}</div>
			<div className="flex-1">
				<div className="text-xs opacity-70">
					<span className={`font-medium ${classes.nameText}`}>{p.name}</span>
					<span className="mx-1">•</span>
					<span>{p.role}</span>
					<span className="mx-1">•</span>
					<time title={dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
						{dayjs(entry.timestamp).fromNow()}
					</time>
				</div>
				<div className={`mt-1 text-[15px] leading-6 p-3 rounded-xl break-words ${classes.bubbleBg}`}>{entry.text}</div>
			</div>
		</div>
	);
}