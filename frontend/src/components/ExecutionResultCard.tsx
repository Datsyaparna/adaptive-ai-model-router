import React from 'react';
import type { ExecutionResult } from '../types';
import { Play, AlertTriangle, CheckCircle2, Clock, Coins, Hash, Cpu } from 'lucide-react';

interface ExecutionResultCardProps {
  execution: ExecutionResult | null;
}

export const ExecutionResultCard: React.FC<ExecutionResultCardProps> = ({ execution }) => {
  if (!execution) return null;

  return (
    <div className="glass-panel p-6 mb-8 border border-slate-200 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3.5 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <Play className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 tracking-wider uppercase text-base">LLM EXECUTION OUTPUT</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-emerald-800 flex items-center gap-1.5 font-bold">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            Model: {execution.model_name} ({execution.provider_display})
          </span>
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
            execution.execution_mode === 'live_api' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {execution.execution_mode === 'live_api' ? '⚡ LIVE API EXECUTION' : '🛡️ FALLBACK DEMO ENGINE'}
          </span>
        </div>
      </div>

      {/* Fallback Alert Banner */}
      {execution.fallback_triggered && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>FALLBACK ROUTING TRIGGERED & AUTOMATICALLY RECOVERED</span>
          </div>
          <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800">
            <div className="flex items-center gap-2 text-amber-900 mb-1 flex-wrap font-semibold">
              <span>Primary ({execution.primary_model_name})</span>
              <span>➔</span>
              <span className="text-rose-600 font-bold">PROVIDER TIMEOUT / ERROR</span>
              <span>➔</span>
              <span className="text-emerald-700 font-bold">SMART ROUTER CASCADE</span>
              <span>➔</span>
              <span className="text-emerald-800 font-bold">Fallback Model ({execution.model_name})</span>
              <span>➔</span>
              <span className="text-emerald-700 font-bold">SUCCESS</span>
            </div>
            <p className="text-slate-600">Reason: <span className="text-amber-800 font-semibold">{execution.fallback_reason}</span></p>
          </div>
        </div>
      )}

      {/* Code / Text Output Box */}
      <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800 text-slate-100 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto mb-4 font-normal shadow-inner">
        {execution.text}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <Hash className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">TOTAL TOKENS</span>
            <span className="font-bold text-slate-900">{execution.total_tokens}</span>
            <span className="text-[10px] text-slate-400 ml-1">({execution.input_tokens} in / {execution.output_tokens} out)</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">LATENCY</span>
            <span className="font-bold text-slate-900">{execution.latency_ms} ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Coins className="w-4 h-4 text-amber-600" />
          <div>
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">ESTIMATED COST</span>
            <span className="font-bold text-amber-800">${execution.estimated_cost.toFixed(6)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">STATUS</span>
            <span className="font-bold text-emerald-700">PASS (200 OK)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
