import type { Speaker } from '../types';


export const personas: Record<Speaker['id'], Speaker> = {
    sarah: { id: 'sarah', name: 'Dr. Sarah Chen', role: 'Evidence‑Based Practitioner', color: 'sarah', avatar: '🧠' },
    james: { id: 'james', name: 'Dr. James Williams', role: 'Holistic Healer', color: 'james', avatar: '🧘' },
    maria: { id: 'maria', name: 'Dr. Maria Rodriguez', role: 'Analytical Psychologist', color: 'maria', avatar: '🔎' },
    user: { id: 'user', name: 'You', role: 'Participant', color: 'user', avatar: '👤' },
    system: { id: 'system', name: 'System', role: 'System Message', color: 'gray', avatar: '🤖' },
};