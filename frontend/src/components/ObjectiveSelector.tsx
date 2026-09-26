import React from 'react';
import { DollarSign, Scale, Award, Zap } from 'lucide-react';

interface ObjectiveSelectorProps {
  currentObjective: string;
  onChangeObjective: (objective: string) => void;
  isRecalculating?: boolean;
}

export const OBJECTIVES = [
  {
    id: 'lowest_cost',
    label: 'Lowest Cost',
    icon: DollarSign,
    weightInfo: '65% Price Weight | 15% Speed',
    desc: 'Select cheapest suitable model for basic prompts'
  },
  {
    id: 'balanced',
    label: 'Balanced',
    icon: Scale,
    weightInfo: '30% Cost | 25% Cap | 25% Reason',
    desc: 'Optimal balance of capability, speed, and cost'
  },
  {
    id: 'highest_quality',
    label: 'Highest Quality',
    icon: Award,
    weightInfo: '50% Capability | 40% Reasoning',
    desc: 'Prioritize complex reasoning & precision'
  },
  {
    id: 'lowest_latency',
    label: 'Lowest Latency',
    icon: Zap,
    weightInfo: '65% Speed Rating',
    desc: 'Prioritize lightning-fast response times'
  }
];

export const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  currentObjective,
  onChangeObjective,
  isRecalculating
}) => {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>ROUTING OBJECTIVE</span>
          <span className="text-emerald-700 text-[11px] font-mono font-normal">(Click to test dynamic scoring recalculation)</span>
        </label>
        {isRecalculating && (
          <span className="text-[11px] text-emerald-700 font-mono font-bold animate-pulse">
            ⚡ Recalculating Model Arena Ranking...
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {OBJECTIVES.map((obj) => {
          const Icon = obj.icon;
          const isActive = currentObjective === obj.id;
          return (
            <button
              key={obj.id}
              onClick={() => onChangeObjective(obj.id)}
              className={`obj-btn text-left p-3.5 ${isActive ? 'active ring-1 ring-emerald-500' : ''}`}
              type="button"
            >
              <div className="flex items-center gap-2 font-extrabold text-sm mb-1 text-slate-900">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>{obj.label}</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-mono font-bold block mb-0.5">
                {obj.weightInfo}
              </span>
              <span className="text-[11px] text-slate-500 font-normal leading-tight block">
                {obj.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
