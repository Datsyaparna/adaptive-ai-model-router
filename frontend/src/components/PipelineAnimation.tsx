import React from 'react';
import { FileInput, Brain, Swords, CheckCircle2, Play, BarChart2, ArrowRight } from 'lucide-react';

interface PipelineAnimationProps {
  currentStep: number;
  selectedModelName?: string;
}

export const PIPELINE_STEPS = [
  { step: 1, label: '1. REQUEST', desc: 'Input Received', icon: FileInput },
  { step: 2, label: '2. INTELLIGENCE', desc: 'Task Metrics', icon: Brain },
  { step: 3, label: '3. MODEL ARENA', desc: 'Catalog Matrix', icon: Swords },
  { step: 4, label: '4. DECISION', desc: 'Why This Model?', icon: CheckCircle2 },
  { step: 5, label: '5. LLM RUN', desc: 'Provider Call', icon: Play },
  { step: 6, label: '6. METRICS', desc: 'Cost & Savings', icon: BarChart2 }
];

export const PipelineAnimation: React.FC<PipelineAnimationProps> = ({ currentStep, selectedModelName }) => {
  if (currentStep === 0) return null;

  return (
    <div className="glass-panel p-5 mb-8 border border-slate-200 bg-white shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            SMART ROUTING PIPELINE EXECUTION FLOW
          </span>
        </div>
        {selectedModelName && currentStep >= 4 && (
          <div className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="text-slate-500">Target Model:</span>
            <span className="text-emerald-900 font-bold">{selectedModelName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 py-1">
        {PIPELINE_STEPS.map((stepItem, idx) => {
          const Icon = stepItem.icon;
          const isActive = currentStep === stepItem.step;
          const isDone = currentStep > stepItem.step;

          let cardStyle = "bg-slate-50 border-slate-200 text-slate-500";
          let iconStyle = "text-slate-400";

          if (isActive) {
            cardStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-400 shadow-sm";
            iconStyle = "text-emerald-600 animate-spin";
          } else if (isDone) {
            cardStyle = "bg-slate-100 border-slate-200 text-slate-800";
            iconStyle = "text-emerald-600";
          }

          return (
            <div key={stepItem.step} className="relative flex flex-col items-center">
              <div className={`w-full p-3 rounded-xl border text-center transition-all duration-300 flex flex-col items-center gap-1.5 ${cardStyle}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${iconStyle}`} />
                  <span className="font-extrabold text-[11px] uppercase tracking-wider">{stepItem.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-sans leading-tight">{stepItem.desc}</span>
                {isDone && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">PASSED ✓</span>}
                {isActive && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 animate-pulse">RUNNING...</span>}
              </div>

              {idx < PIPELINE_STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className={`w-4 h-4 ${isDone ? 'text-emerald-600' : 'text-slate-300'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
