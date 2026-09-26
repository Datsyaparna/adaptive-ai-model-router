import type { QualityResult } from '../types';
import { ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface QualityCheckCardProps {
  quality: QualityResult | null;
}

export const QualityCheckCard: React.FC<QualityCheckCardProps> = ({ quality }) => {
  if (!quality) return null;

  return (
    <div className="glass-panel p-6 mb-8 border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 tracking-wider uppercase text-base">POST-EXECUTION QUALITY CHECK</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
          quality.all_passed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          {quality.all_passed ? '✓ QUALITY VERIFIED PASS' : '⚠️ WARNING REVIEW'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {quality.checks.map((check) => (
          <div
            key={check.id}
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              check.passed ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            {check.passed ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block text-slate-900 mb-0.5">{check.name}</span>
              <span className="text-[11px] text-slate-600 font-sans leading-tight block font-medium">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
