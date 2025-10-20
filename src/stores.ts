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
addEntry: (e) => set((s) => ({ transcript: [...s.transcript, e] })),
setTopics: (t) => set({ topics: t, currentTopicId: t[0]?.id ?? '' }),
setTopic: (id) => set({ currentTopicId: id }),
setPlaying: (p) => set({ playing: p }),
setSpeed: (s) => set({ speed: s }),
setLineIndex: (i) => set({ lineIndex: i }),
resetPlayback: () => set({ lineIndex: 0, transcript: [], startedAt: Date.now() }),
setTyping: (active: boolean, speakerId?: SpeakerId) => set({ typingActive: active, typingSpeakerId: speakerId }),
}));


export const makeEntry = (topicId: string, speakerId: SpeakerId, text: string): TranscriptEntry => ({
id: crypto.randomUUID(),
topicId,
speakerId,
text,
timestamp: Date.now(),
});