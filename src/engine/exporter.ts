import dayjs from 'dayjs';
import type { TranscriptEntry, Topic } from '../types';


export function exportTXT(entries: TranscriptEntry[], speakers: Record<string, {name: string; role: string;}>, topic: Topic) {
const lines = entries.map(e => {
const s = speakers[e.speakerId];
const ts = dayjs(e.timestamp).format('YYYY-MM-DD HH:mm:ss');
return `[${ts}] ${s.name} (${s.role}): ${e.text}`;
});
const blob = new Blob([
`Topic: ${topic.title}\n\n` + lines.join('\n')
], { type: 'text/plain;charset=utf-8' });
triggerDownload(`${topic.id}.txt`, blob);
}


export function exportJSON(entries: TranscriptEntry[], topic: Topic) {
const blob = new Blob([JSON.stringify({
topicId: topic.id,
topicTitle: topic.title,
startedAt: entries[0]?.timestamp ?? Date.now(),
entries: entries.map(e => ({ t: e.timestamp, speaker: e.speakerId, text: e.text })),
}, null, 2)], { type: 'application/json' });
triggerDownload(`${topic.id}.json`, blob);
}


function triggerDownload(filename: string, blob: Blob) {
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = filename;
a.click();
URL.revokeObjectURL(a.href);
}