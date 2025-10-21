import { useApp } from '../stores';
import { useState, useEffect } from 'react';

export default function Participants({ participantsInfo = [] }: { participantsInfo?: {id:number, username:string, fullName?:string}[] }) {
  // If participantsInfo is not passed, fallback to personas
  if (!participantsInfo || participantsInfo.length === 0) {
    const { transcript } = useApp();
    // fallback: show unique speakerIds from transcript
    const ids = Array.from(new Set(transcript.map(e => e.speakerId)));
    return (
      <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="font-semibold mb-2">Participants</div>
        <ul className="space-y-2">
          {ids.map(id => (
            <li key={id} className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>👤</span>
              <div>
                <div className={`text-sm font-medium`}>{id}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="font-semibold mb-2">Participants</div>
      <ul className="space-y-2">
        {participantsInfo.map(p => (
          <li key={p.id} className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>👤</span>
            <div>
              <div className={`text-sm font-medium`}>{p.fullName || p.username}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}