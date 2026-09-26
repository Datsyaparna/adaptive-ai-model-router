import React from 'react';
import type { Rationale } from '../types';
import { CheckCircle2, XCircle, Award } from 'lucide-react';

interface WhyThisModelCardProps {
  rationale: Rationale | null;
}

export const WhyThisModelCard: React.FC<WhyThisModelCardProps> = ({ rationale }) => {
  if (!rationale) return null;

  return (
    <div className="glass-panel p-6 mb-8 border-l-4 border-l-emerald-600 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 tracking-wider uppercase text-base">WHY WAS THIS MODEL SELECTED?</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono border border-emerald-200 font-bold">
          Scoring Engine: Objective = {rationale.objective_used}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selected Model Positive Factors */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Selected Model ({rationale.selected_model_name}) Decision Factors
          </h4>
          <ul className="space-y-2 text-sm text-slate-800 font-sans">
            {rationale.positive_factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 font-bold flex-shrink-0 mt-0.5">✓</span>
                <span className="text-slate-800 text-xs font-semibold leading-relaxed">{factor.replace(/^✓\s*/, '')}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Rejected Candidate Models Rationale */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" />
            Candidate Rejection Factors & Trade-offs
          </h4>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {rationale.candidate_rejections.map((cand) => (
              <div key={cand.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-rose-300 transition-colors">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-xs text-slate-900">{cand.name} <span className="text-[10px] text-slate-500 font-mono">({cand.provider})</span></span>
                  <span className="text-xs text-rose-700 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Score: {cand.score}%</span>
                </div>
                <ul className="space-y-1">
                  {cand.reasons.map((r, rIdx) => (
                    <li key={rIdx} className="text-[11px] text-rose-800 flex items-start gap-1.5 font-mono">
                      <span className="text-rose-600 font-bold">✗</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
