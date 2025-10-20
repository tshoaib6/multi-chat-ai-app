import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { personas } from '../data/personas';
import type { TranscriptEntry } from '../types';
import { useApp } from '../stores';

export default function Message({ entry, searchTerm }: { entry: TranscriptEntry, searchTerm?: string }) {
	const p = personas[entry.speakerId];
	const { toggleReaction } = useApp();
	const userId = 'user'; // could use from store if needed

	// explicit Tailwind class mapping per persona color key
	const colorClasses: Record<string, { avatarBg: string; nameText: string; bubbleBg: string }> = {
		sarah: { avatarBg: 'bg-sarah/10', nameText: 'text-sarah-700 dark:text-sarah-300', bubbleBg: 'bg-sarah/5' },
		james: { avatarBg: 'bg-james/10', nameText: 'text-james-700 dark:text-james-300', bubbleBg: 'bg-james/5' },
		maria: { avatarBg: 'bg-maria/10', nameText: 'text-maria-700 dark:text-maria-300', bubbleBg: 'bg-maria/5' },
		user: { avatarBg: 'bg-user/10', nameText: 'text-user-700 dark:text-user-300', bubbleBg: 'bg-user/5' },
	};
	const classes = colorClasses[p.color] ?? { avatarBg: 'bg-gray-100', nameText: 'text-gray-700', bubbleBg: 'bg-gray-50' };

	// highlight search matches
	function highlight(text: string, term?: string) {
		if (!term || !term.trim()) return text;
		const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\$&')})`, 'gi'));
		return parts.map((part, i) =>
			part.toLowerCase() === term.toLowerCase()
				? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 rounded px-1">{part}</mark>
				: part
		);
	}

	// emoji reactions
	const emojis = ['👍', '😂', '😍'];
	const reactions = entry.reactions ?? {};

	// TTS play
	function speak() {
		if ('speechSynthesis' in window) {
			const utter = new window.SpeechSynthesisUtterance(entry.text);
			utter.lang = 'en-US';
			window.speechSynthesis.speak(utter);
		}
	}

	return (
		<div className="flex gap-3 group">
			<div className={`shrink-0 w-9 h-9 rounded-full grid place-items-center text-xl ${classes.avatarBg}`}>{p.avatar}</div>
			<div className="flex-1">
				<div className="text-xs opacity-70 flex items-center gap-2">
					<span className={`font-medium ${classes.nameText}`}>{p.name}</span>
					<span className="mx-1">•</span>
					<span>{p.role}</span>
					<span className="mx-1">•</span>
					<time title={dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm:ss')}>{dayjs(entry.timestamp).fromNow()}</time>
					<button onClick={speak} className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800" title="Play message">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 8v8a2 2 0 0 0 2 2h3l5 4V4l-5 4H7a2 2 0 0 0-2 2z" fill="currentColor"/></svg>
					</button>
				</div>
				<div className={`mt-1 text-[15px] leading-6 p-3 rounded-xl break-words ${classes.bubbleBg}`}>{highlight(entry.text, searchTerm)}</div>
				<div className="flex gap-2 mt-1">
					{emojis.map(emoji => {
						const count = reactions[emoji]?.length ?? 0;
						const active = reactions[emoji]?.includes(userId);
						return (
							<button
								key={emoji}
								className={`px-2 py-1 rounded-full border text-lg transition ${active ? 'bg-yellow-100 dark:bg-yellow-800 border-yellow-400' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}
								onClick={() => toggleReaction(entry.id, emoji, userId)}
								aria-label={`React with ${emoji}`}
							>
								{emoji} {count > 0 && <span className="text-xs font-semibold">{count}</span>}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}