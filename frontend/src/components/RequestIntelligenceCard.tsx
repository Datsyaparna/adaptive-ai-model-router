import React from 'react';
import type { RequestIntelligence } from '../types';
import { Brain, Code, FileText, Cpu, Calculator, HelpCircle } from 'lucide-react';

interface RequestIntelligenceCardProps {
  intelligence: RequestIntelligence | null;
}

export const RequestIntelligenceCard: React.FC<RequestIntelligenceCardProps> = ({ intelligence }) => {
  if (!intelligence) return null;

  const getTaskBadge = (type: string) => {
    switch (type) {
      case 'code_review':
        return { label: 'Code Review', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Code };
      case 'code_generation':
        return { label: 'Code Generation', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: Code };
      case 'architecture_design':
        return { label: 'Architecture & System Design', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Cpu };
      case 'summarization':
        return { label: 'Summarization & Extraction', color: 'bg-teal-50 text-teal-800 border-teal-200', icon: FileText };
      case 'complex_reasoning':
        return { label: 'Complex Math & Logic', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Calculator };
      default:
        return { label: 'General Query', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: HelpCircle };
    }
  };

  const badge = getTaskBadge(intelligence.task_type);
  const TaskIcon = badge.icon;

  const renderGauge = (label: string, value: number, colorClass: string) => {
    const pct = Math.round(value * 100);
    return (
      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-700 font-semibold">{label}</span>
          <span className="font-mono font-bold text-slate-900">{pct}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 mb-8 border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
        <div className="flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 tracking-wider uppercase text-base">REQUEST INTELLIGENCE MATRIX</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.color}`}>
          <TaskIcon className="w-3.5 h-3.5" />
          <span>{badge.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {renderGauge("Complexity Rating", intelligence.complexity, "bg-gradient-to-r from-teal-500 to-emerald-500")}
        {renderGauge("Reasoning Requirement", intelligence.reasoning_requirement, "bg-gradient-to-r from-indigo-500 to-purple-500")}
        {renderGauge("Context Window Fit", intelligence.context_requirement, "bg-gradient-to-r from-emerald-500 to-teal-500")}
        {renderGauge("Expected Output Size", intelligence.expected_output_complexity, "bg-gradient-to-r from-amber-500 to-orange-500")}
        {renderGauge("Latency Sensitivity", intelligence.latency_sensitivity, "bg-gradient-to-r from-rose-500 to-pink-500")}
        {renderGauge("Cost Sensitivity", intelligence.cost_sensitivity, "bg-gradient-to-r from-emerald-500 to-indigo-500")}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Estimated Token Budget: <strong className="text-slate-800 font-bold">{intelligence.estimated_input_tokens}</strong> input / <strong className="text-slate-800 font-bold">{intelligence.estimated_output_tokens}</strong> output</span>
        <span className="text-[11px] text-slate-400 font-sans">Analysis Engine: Heuristic LLM Classifier</span>
      </div>
    </div>
  );
};
