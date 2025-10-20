export default function TypingDots(){
return (
<span className="inline-flex gap-1 align-middle">
<span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.2s]"></span>
<span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></span>
<span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]"></span>
</span>
);
}