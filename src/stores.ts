import { create } from 'zustand';
import type { Topic, TranscriptEntry, SpeakerId } from './types';


interface AppState {
topics: Topic[];
currentTopicId: string;
playing: boolean;
speed: 1 | 1.5 | 2;
lineIndex: number; // next line to schedule
transcript: TranscriptEntry[];
startedAt?: number;
typingActive: boolean;
typingSpeakerId?: SpeakerId;
theme: 'light' | 'dark';
setTheme: (t: 'light' | 'dark') => void;
searchTerm?: string;
setSearch: (s: string) => void;
toggleReaction: (entryId: string, emoji: string, by: SpeakerId) => void;
addEntry: (e: TranscriptEntry) => void;
setTopics: (t: Topic[]) => void;
setTopic: (id: string) => void;
setPlaying: (p: boolean) => void;
setSpeed: (s: 1 | 1.5 | 2) => void;
setLineIndex: (i: number) => void;
resetPlayback: () => void;
setTyping: (active: boolean, speakerId?: SpeakerId) => void;
}


export const useApp = create<AppState>((set, get) => ({
topics: [],
currentTopicId: '',
playing: false,
speed: 1,
lineIndex: 0,
transcript: [],
typingActive: false,
typingSpeakerId: undefined,
// initialize theme from localStorage if present, default to light
theme: (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') ? 'dark' : 'light',
setTheme: (t) => {
	set({ theme: t });
	try { localStorage.setItem('theme', t); } catch {}
},
addEntry: (e) => set((s) => ({ transcript: [...s.transcript, e] })),
setTopics: (t) => set({ topics: t, currentTopicId: t[0]?.id ?? '' }),
setTopic: (id) => set({ currentTopicId: id }),
setPlaying: (p) => set({ playing: p }),
setSpeed: (s) => set({ speed: s }),
setLineIndex: (i) => set({ lineIndex: i }),
resetPlayback: () => set({ lineIndex: 0, transcript: [], startedAt: Date.now() }),
setTyping: (active: boolean, speakerId?: SpeakerId) => set({ typingActive: active, typingSpeakerId: speakerId }),
searchTerm: undefined,
setSearch: (s: string) => set({ searchTerm: s }),
toggleReaction: (entryId: string, emoji: string, by: SpeakerId) => set((state) => ({
	transcript: state.transcript.map(e => {
		if (e.id !== entryId) return e;
		const reactions = { ...(e.reactions ?? {}) } as Record<string, string[]>;
		const list = reactions[emoji] ?? [];
		const has = list.includes(by);
		reactions[emoji] = has ? list.filter(x => x !== by) : [...list, by];
		return { ...e, reactions };
	}),
})),
}));


export const makeEntry = (topicId: string, speakerId: SpeakerId, text: string): TranscriptEntry => ({
id: crypto.randomUUID(),
topicId,
speakerId,
text,
timestamp: Date.now(),
});