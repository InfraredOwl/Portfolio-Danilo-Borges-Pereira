import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-3 w-full group">
      <div className="flex justify-between items-center group-hover:px-1 transition-all duration-300">
        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-blue-400">{label}</label>
        <span className="text-xs font-mono text-blue-500/80 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">{value}</span>
      </div>
      <div className="relative flex items-center h-6">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent appearance-none cursor-pointer z-10
                     focus:outline-none
                     [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-runnable-track]:rounded-lg
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125
                     [&::-moz-range-track]:w-full [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:bg-white/10 [&::-moz-range-track]:rounded-lg
                     [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.5)] [&::-moz-range-thumb]:transition-all"
        />
        {/* Fill track visualization */}
        <div 
          className="absolute left-0 h-0.5 bg-blue-400/50 rounded-lg pointer-events-none"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
}
