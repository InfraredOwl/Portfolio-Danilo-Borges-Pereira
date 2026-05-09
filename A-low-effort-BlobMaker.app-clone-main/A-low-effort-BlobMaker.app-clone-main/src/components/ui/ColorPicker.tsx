import React, { useState } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#FF0066', '#FF3366', '#FF6699', '#FF99CC', '#CC66FF', '#9933FF', '#6600FF',
  '#0066FF', '#3399FF', '#66CCFF', '#00FFCC', '#00FF66', '#66FF33', '#CCFF00'
];

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Indicator / Input */}
      <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 shadow-lg cursor-pointer flex-shrink-0 group">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer scale-150"
        />
        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/20 rounded-full" />
      </div>
      
      {/* Hex Text */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Primary Color</span>
        <span className="font-mono text-xs text-blue-400 uppercase tracking-wider">
          {color}
        </span>
      </div>

      {/* Preset Colors Tooltip (Shows on Hover) */}
      <div 
        className={`absolute top-full left-0 mt-4 p-4 glass-panel border border-white/10 shadow-2xl rounded-2xl flex flex-wrap gap-2 w-64 z-20 transition-all duration-300 origin-top-left ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="w-full text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-2 px-1">Studio Palette</div>
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className="w-6 h-6 rounded-lg border border-white/5 hover:scale-110 transition-transform shadow-inner"
            style={{ backgroundColor: preset }}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
}
