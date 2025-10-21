import { useState, useRef, useEffect } from 'react';

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
};

export default function Tooltip({ content, children, placement = 'top', delay = 200, className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  function show() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  }
  function hide() {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  }

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => setVisible(true), 10);
      return () => window.clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [open]);

  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[placement];

  return (
    <span className={`relative inline-flex ${className}`} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 ${pos} whitespace-nowrap`}
          aria-hidden={!visible}
        >
          <span className={`inline-block rounded-lg bg-gray-900 text-white text-xs px-2.5 py-1 shadow-lg transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'} `}>
            {content}
          </span>
        </span>
      )}
    </span>
  );
}
