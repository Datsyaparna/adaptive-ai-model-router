import React from 'react';
import type { SummaryMetrics } from '../types';
import { TrendingUp, Coins, Zap, Hash, History } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: SummaryMetrics | null;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  if (!metrics || metrics.total_requests === 0) {
    return (
      <div className="glass-panel p-6 mb-8 text-center text-slate-500 text-xs border border-slate-200 bg-white">
        <TrendingUp className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <span>No execution metrics captured yet. Run a request to visualize cost optimization.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 mb-8 border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 tracking-wider uppercase text-base">SYSTEM METRICS & COST SAVINGS AGGREGATOR</h3>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono border border-emerald-200 font-bold">
          {metrics.avg_savings_pct}% Cost Savings vs Unrouted Baseline
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold block uppercase font-sans">Requests Handled</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">{metrics.total_requests}</div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold block uppercase font-sans flex items-center gap-1">
            <Hash className="w-3 h-3 text-emerald-600" /> Total Tokens
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{metrics.total_tokens.toLocaleString()}</div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold block uppercase font-sans flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-600" /> Optimized Cost
          </span>
          <div className="text-2xl font-black text-amber-800 font-mono mt-1">${metrics.total_cost_usd.toFixed(6)}</div>
          <span className="text-[10px] text-slate-500 font-mono block font-semibold">Baseline: ${metrics.total_baseline_cost_usd.toFixed(6)}</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-emerald-700 font-bold block uppercase font-sans">Total Saved USD</span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">+${metrics.total_savings_usd.toFixed(6)}</div>
          <span className="text-[10px] text-emerald-800 font-mono font-bold block">{metrics.avg_savings_pct}% Reduction</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] text-slate-500 font-bold block uppercase font-sans flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-600" /> Avg Latency
          </span>
          <div className="text-2xl font-black text-indigo-700 font-mono mt-1">{metrics.avg_latency_ms} ms</div>
          <span className="text-[10px] text-amber-700 font-mono block font-bold">Fallbacks: {metrics.fallback_count}</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <History className="w-4 h-4 text-slate-500" /> Recent Request Routing Log
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Task Type</th>
                <th className="p-2.5">Objective</th>
                <th className="p-2.5">Selected Model</th>
                <th className="p-2.5 text-center">Score</th>
                <th className="p-2.5 text-right">Tokens</th>
                <th className="p-2.5 text-right">Latency</th>
                <th className="p-2.5 text-right">Cost</th>
                <th className="p-2.5 text-right">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {metrics.history.slice().reverse().map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="p-2.5 text-slate-400">{rec.id}</td>
                  <td className="p-2.5 font-sans font-medium text-slate-800">{rec.task_type}</td>
                  <td className="p-2.5 capitalize text-emerald-800 font-bold">{rec.objective.replace('_', ' ')}</td>
                  <td className="p-2.5 font-sans font-bold text-slate-900">{rec.selected_model}</td>
                  <td className="p-2.5 text-center font-extrabold text-emerald-700">{rec.routing_score}%</td>
                  <td className="p-2.5 text-right">{rec.total_tokens}</td>
                  <td className="p-2.5 text-right">{rec.latency_ms}ms</td>
                  <td className="p-2.5 text-right text-amber-800 font-bold">${rec.actual_cost.toFixed(6)}</td>
                  <td className="p-2.5 text-right text-emerald-700 font-extrabold">+{rec.cost_savings_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
