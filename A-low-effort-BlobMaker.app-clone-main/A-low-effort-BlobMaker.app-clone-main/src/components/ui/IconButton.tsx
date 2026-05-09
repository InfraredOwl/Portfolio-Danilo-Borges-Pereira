import React from 'react';
import { Dices } from 'lucide-react';

interface IconButtonProps {
  onClick: () => void;
  title?: string;
}

export function IconButton({ onClick, title }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-blue-400 border border-white/10 rounded-xl transition-all active:scale-95 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
      <Dices className="w-6 h-6 group-active:rotate-180 transition-transform duration-500 relative z-10" />
    </button>
  );
}
