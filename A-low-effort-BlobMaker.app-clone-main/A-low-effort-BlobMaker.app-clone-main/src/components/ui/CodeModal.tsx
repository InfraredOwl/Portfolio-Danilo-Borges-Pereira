import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgCode: string;
}

export function CodeModal({ isOpen, onClose, svgCode }: CodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div 
        className="glass-panel rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold gradient-text">Source Code</h2>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">Vector XML Output</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 bg-black/40 overflow-y-auto overflow-x-auto flex-grow custom-scrollbar">
          <pre className="text-xs font-mono text-blue-300/80 whitespace-pre-wrap break-all leading-relaxed">
            {svgCode}
          </pre>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end shrink-0">
          <Button 
            variant="primary" 
            onClick={handleCopy} 
            className="w-full sm:w-auto min-w-[200px]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Captured!' : 'Copy System Vector'}
          </Button>
        </div>
      </div>
    </div>
  );
}
