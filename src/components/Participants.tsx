import { personas } from '../data/personas';


export default function Participants(){
const list = Object.values(personas);
return (
<div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
<div className="font-semibold mb-2">Participants</div>
<ul className="space-y-2">
{list.map(p => (
<li key={p.id} className="flex items-center gap-2">
<span className="text-xl" aria-hidden>{p.avatar}</span>
<div>
<div className={`text-sm font-medium`}>{p.name}</div>
<div className="text-xs opacity-70">{p.role}</div>
</div>
</li>
))}
</ul>
</div>
);
}