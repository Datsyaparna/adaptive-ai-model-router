import React from 'react';
import type { DemoPreset } from '../types';
import { Sparkles, Code, Cpu, FileText } from 'lucide-react';

interface DemoPresetsProps {
  presets: DemoPreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: DemoPreset) => void;
}

export const DemoPresets: React.FC<DemoPresetsProps> = ({
  presets,
  activePresetId,
  onSelectPreset
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'simple': return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'medium': return <Code className="w-3.5 h-3.5 text-indigo-600" />;
      case 'complex': return <Cpu className="w-3.5 h-3.5 text-purple-600" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Demo Presets:
      </span>
      {presets.map((preset) => {
        const isActive = activePresetId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={`preset-pill ${isActive ? 'active ring-1 ring-emerald-400' : ''}`}
          >
            {getIcon(preset.id)}
            <span className="font-bold">{preset.label}:</span>
            <span>{preset.title}</span>
          </button>
        );
      })}
    </div>
  );
};
