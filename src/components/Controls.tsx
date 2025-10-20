import { useApp } from '../stores';
import { setPlaying } from  '../engine/scheduler';


export default function Controls() {
const { playing, speed, setSpeed } = useApp();
return (
<div className="flex items-center gap-2">
<button
	className="px-3 py-1.5 rounded-lg bg-gray-900 text-white"
	onClick={() => setPlaying(!playing)}
>
	{playing ? 'Pause' : 'Play'}
</button>


<label className="text-sm opacity-70">Speed</label>
<select
value={speed}
onChange={(e)=> setSpeed(Number(e.target.value) as any)}
className="px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
>
<option value={1}>1x</option>
<option value={1.5}>1.5x</option>
<option value={2}>2x</option>
</select>
</div>
);
}