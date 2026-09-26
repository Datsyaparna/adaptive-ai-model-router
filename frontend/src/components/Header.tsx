import React from 'react';
import { Cpu, Key, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  envStatus: {
    OPENAI_API_KEY: boolean;
    ANTHROPIC_API_KEY: boolean;
    GOOGLE_API_KEY: boolean;
  };
  onResetMetrics: () => void;
}

export const Header: React.FC<HeaderProps> = ({ envStatus, onResetMetrics }) => {
  return (
    <header className="glass-panel p-4 mb-8 border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-600 rounded-xl shadow-md text-white flex-shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                ADAPTIVE AI MODEL ROUTER
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Smart Orchestrator
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium italic mt-0.5">
              "Don't send every request to the same model. Let the request determine the model."
            </p>
          </div>
        </div>

        {/* API Keys Status & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono">
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-sans font-medium">Provider Keys:</span>
            
            <span className={`inline-flex items-center gap-1.5 font-semibold ${envStatus.OPENAI_API_KEY ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${envStatus.OPENAI_API_KEY ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              OpenAI
            </span>
            
            <span className="text-slate-300">|</span>

            <span className={`inline-flex items-center gap-1.5 font-semibold ${envStatus.ANTHROPIC_API_KEY ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${envStatus.ANTHROPIC_API_KEY ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              Anthropic
            </span>

            <span className="text-slate-300">|</span>

            <span className={`inline-flex items-center gap-1.5 font-semibold ${envStatus.GOOGLE_API_KEY ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${envStatus.GOOGLE_API_KEY ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              Gemini
            </span>
          </div>

          <button
            onClick={onResetMetrics}
            className="btn-secondary text-xs py-2 px-3.5 hover:text-emerald-700 transition-colors"
            title="Reset execution metrics store"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Metrics
          </button>
        </div>
      </div>
    </header>
  );
};
