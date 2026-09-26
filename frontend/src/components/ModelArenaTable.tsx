import React from 'react';
import type { ScoredCandidate } from '../types';
import { Swords, Check, AlertTriangle } from 'lucide-react';

interface ModelArenaTableProps {
  candidates: ScoredCandidate[];
  selectedModelId: string | null;
}

export const ModelArenaTable: React.FC<ModelArenaTableProps> = ({
  candidates,
  selectedModelId
}) => {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="glass-panel p-6 mb-8 border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 tracking-wider uppercase text-base">MODEL ARENA & SCORING MATRIX</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Catalog: {candidates.length} Evaluated Models
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50">
              <th className="p-3.5">Rank & Model</th>
              <th className="p-3.5 text-center">Provider</th>
              <th className="p-3.5 text-center">Capability</th>
              <th className="p-3.5 text-center">Reasoning</th>
              <th className="p-3.5 text-center">Speed Score</th>
              <th className="p-3.5 text-center">Est. Cost / Run</th>
              <th className="p-3.5 text-center">Routing Match</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {candidates.map((cand, idx) => {
              const isSelected = cand.id === selectedModelId;
              return (
                <tr
                  key={cand.id}
                  className={`transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600 text-slate-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="p-3.5 flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-sans font-bold text-slate-900 flex items-center gap-2">
                        {cand.name}
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{cand.id}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-center font-sans text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700">
                      {cand.provider_display}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal-500 h-full" style={{ width: `${cand.capability_score}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-700">{cand.capability_score}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${cand.reasoning_score}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-700">{cand.reasoning_score}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${cand.speed_score}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-700">{cand.speed_score}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-center text-xs text-amber-700 font-bold">
                    ${cand.est_cost.toFixed(5)}
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`text-sm font-black px-3 py-1 rounded-lg ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'text-slate-700'
                    }`}>
                      {cand.score}%
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    {cand.exceeds_budget ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Exceeds Budget
                      </span>
                    ) : isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                        <Check className="w-3.5 h-3.5" /> Optimal Fit
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-sans">Evaluated</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
