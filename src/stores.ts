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
addParticipant: (participantId: SpeakerId) => void;
setTopics: (t: Topic[]) => void;
setTopic: (id: string) => void;
setPlaying: (p: boolean) => void;
setSpeed: (s: 1 | 1.5 | 2) => void;
setLineIndex: (i: number) => void;
resetPlayback: () => void;
setTyping: (active: boolean, speakerId?: SpeakerId) => void;
participants: SpeakerId[];
isPublic: boolean;
deleteEntry: (entryId: string) => void;
therapists: Therapist[];
debateEntries: string[];
startDebate: (topicId: string) => void;
submitDebateResponse: (entry: string) => void;
endDebate: () => void;
}


export const useApp = create<AppState>((set) => ({
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
addParticipant: (participantId: SpeakerId) => set((s) => ({ transcript: [...s.transcript, makeEntry(s.currentTopicId, participantId, '')] })),
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
deleteEntry: (entryId: string) => set((s) => ({ transcript: s.transcript.filter(e => e.id !== entryId) })),
participants: [],
isPublic: false,
therapists: [],
debateEntries: [],
startDebate: (topicId: string) => set(() => ({
    debateEntries: [],
    currentTopicId: topicId,
    playing: true,
		// console.log('Debate started with topic ID:', topicId),
})),
submitDebateResponse: (entry: string) => set((state) => ({
    debateEntries: [...state.debateEntries, entry],
})),
endDebate: () => set(() => ({
		// debateEntries: [],
    playing: false,
})),
}));


export const makeEntry = (topicId: string, speakerId: SpeakerId, text: string): TranscriptEntry => ({
id: crypto.randomUUID(),
topicId,
speakerId,
text,
timestamp: Date.now(),
participants: [],
isPublic: false,
}); // Ensure this closing matches the opening
export interface Participant {
	id: string;
	name: string;
	transcriptId: string; // Added transcriptId to Participant type
	role: string; // Added role property to Participant type
}
interface Therapist {
    id: string;
    name: string;
    specialty: string;
    bio: string;
}

export const startDebate = (topicId: string) => useApp.getState().startDebate(topicId);
export const submitDebateResponse = (entry: string) => useApp.getState().submitDebateResponse(entry);
export const endDebate = () => useApp.getState().endDebate();

// export { startDebate, submitDebateResponse, endDebate };