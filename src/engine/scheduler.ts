import { useApp, makeEntry } from '../stores';
import type { Line } from '../types';


let timer: number | null = null;


export function stopScheduler() {
if (timer) { clearTimeout(timer); timer = null; }
}


export function playNext() {
const s = useApp.getState();
const topic = s.topics.find(t => t.id === s.currentTopicId);
if (!topic) return;
const i = s.lineIndex;
if (i >= topic.lines.length) { useApp.setState({ playing: false }); return; }
const line: Line = topic.lines[i];


// Simulate typing delay based on text length
const base = Math.min(2000, Math.max(400, Math.floor(line.text.length * 25)));
const jitter = Math.floor(base * (Math.random() * 0.2 - 0.1));
const delay = Math.max(200, (line.delayMs ?? base) / s.speed + jitter);


timer = window.setTimeout(() => {
useApp.getState().addEntry(makeEntry(topic.id, line.speakerId, line.text));
useApp.setState({ lineIndex: i + 1 });
if (useApp.getState().playing) playNext();
}, delay);
}


export function setPlaying(p: boolean) {
useApp.setState({ playing: p });
if (p) playNext(); else stopScheduler();
}