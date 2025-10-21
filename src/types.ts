export type SpeakerId = 'sarah' | 'james' | 'maria' | 'user' | 'system';


export interface Speaker {
id: SpeakerId;
name: string;
role: string;
color: string; // tailwind color key
avatar: string; // path or emoji
}


export interface Line {
id: string;
speakerId: SpeakerId;
text: string;
delayMs?: number; // typing delay before reveal
cues?: { inviteUser?: boolean; emphasis?: 'study' | 'practice' | 'question' };
}


export interface Topic {
id: string;
title: string;
summary: string;
lines: Line[];
}


export interface TranscriptEntry {
id: string;
topicId: string;
speakerId: SpeakerId;
text: string;
timestamp: number; // epoch ms
	reactions?: Record<string, string[]>; // emoji -> array of speakerIds who reacted
	participants: SpeakerId[];
	isPublic: boolean;
}