import React from 'react';
import type { ScoredCandidate, Rationale } from '../types';
import { Award, Zap, DollarSign, Brain, CheckCircle2 } from 'lucide-react';

interface WinningModelSpotlightProps {
  selectedModel: ScoredCandidate;
  rationale: Rationale;
  objective: string;
}

export const WinningModelSpotlight: React.FC<WinningModelSpotlightProps> = ({
  selectedModel,
  rationale,
  objective
}) => {
  if (!selectedModel) return null;

  const getObjectiveLabel = (obj: string) => {
    switch (obj) {
      case 'lowest_cost': return 'Lowest Cost Optimization';
      case 'highest_quality': return 'Highest Quality & Reasoning';
      case 'lowest_latency': return 'Lowest Latency & Speed';
      default: return 'Balanced Performance Optimization';
    }
  };

  return (
    <div className="glass-panel p-6 mb-8 border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 shadow-md relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-emerald-700" /> WINNING MODEL SELECTED BY SMART ROUTER
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Objective: <strong className="text-slate-900 capitalize">{objective.replace('_', ' ')}</strong>
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {selectedModel.name}
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-sans">
              {selectedModel.provider_display}
            </span>
          </h2>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-xl border border-emerald-300 shadow-sm">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">ROUTING MATCH SCORE</span>
            <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight">{selectedModel.score}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5 text-xs font-mono">
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
          <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">REASONING RATING</span>
            <span className="font-extrabold text-slate-800 text-sm">{selectedModel.reasoning_score}/100</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
          <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">SPEED RATING</span>
            <span className="font-extrabold text-slate-800 text-sm">{selectedModel.speed_score}/100</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
          <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">EST. COST PER RUN</span>
            <span className="font-extrabold text-amber-700 text-sm">${selectedModel.est_cost.toFixed(5)} <span className="text-[9px] text-slate-400 font-normal">(ESTIMATED)</span></span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
          <Award className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">CAPABILITY MATCH</span>
            <span className="font-extrabold text-teal-700 text-sm">{selectedModel.capability_score}/100</span>
          </div>
        </div>
      </div>

      {/* Decision Factor Preview */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-sans shadow-sm">
        <span className="font-bold text-slate-700 block mb-2 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          DECISION FACTORS UNDER {getObjectiveLabel(objective).toUpperCase()}:
        </span>
        <div className="flex flex-wrap gap-2">
          {rationale.positive_factors.map((factor, idx) => (
            <span key={idx} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200 text-[11px] font-semibold flex items-center gap-1.5">
              <span>{factor}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
