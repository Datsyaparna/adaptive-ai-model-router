import { useState, useEffect } from 'react';
import type {
  CatalogModel,
  DemoPreset,
  RoutingPayload,
  ExecutionResult,
  QualityResult,
  SummaryMetrics
} from './types';

import { Header } from './components/Header';
import { DemoPresets } from './components/DemoPresets';
import { ObjectiveSelector } from './components/ObjectiveSelector';
import { PipelineAnimation } from './components/PipelineAnimation';
import { RequestIntelligenceCard } from './components/RequestIntelligenceCard';
import { ModelArenaTable } from './components/ModelArenaTable';
import { WinningModelSpotlight } from './components/WinningModelSpotlight';
import { WhyThisModelCard } from './components/WhyThisModelCard';
import { ExecutionResultCard } from './components/ExecutionResultCard';
import { QualityCheckCard } from './components/QualityCheckCard';
import { MetricsDashboard } from './components/MetricsDashboard';

import { Play, Sliders, AlertTriangle, RefreshCw, Cpu, Zap } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export function App() {
  const [, setCatalog] = useState<CatalogModel[]>([]);
  const [envStatus, setEnvStatus] = useState({
    OPENAI_API_KEY: false,
    ANTHROPIC_API_KEY: false,
    GOOGLE_API_KEY: false
  });
  const [presets, setPresets] = useState<DemoPreset[]>([]);
  const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics | null>(null);

  // Form inputs
  const [promptText, setPromptText] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [objective, setObjective] = useState<string>('balanced');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [simulatedFailures, setSimulatedFailures] = useState<string[]>([]);

  // Workflow states
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRecalculatingObj, setIsRecalculatingObj] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [objShiftNotice, setObjShiftNotice] = useState<string | null>(null);

  // Payload results
  const [routingResult, setRoutingResult] = useState<RoutingPayload | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);

  // Fetch initial app metadata
  useEffect(() => {
    fetchModels();
    fetchPresets();
    fetchMetrics();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/models`);
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.catalog || []);
        setEnvStatus(data.env_status || {});
      }
    } catch (err) {
      console.error("Failed to connect to backend API:", err);
      setErrorMsg("Backend server offline. Please ensure FastAPI app is running at http://localhost:8000.");
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/presets`);
      if (res.ok) {
        const data = await res.json();
        const pList = data.presets || [];
        setPresets(pList);
        if (pList.length > 0) {
          const defaultP = pList.find((p: DemoPreset) => p.id === 'medium') || pList[0];
          setPromptText(defaultP.prompt);
          setActivePresetId(defaultP.id);
        }
      }
    } catch (err) {
      console.error("Failed to load presets:", err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/metrics`);
      if (res.ok) {
        const data = await res.json();
        setSummaryMetrics(data);
      }
    } catch (err) {
      console.error("Failed to load metrics:", err);
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setPromptText(preset.prompt);
    setActivePresetId(preset.id);
    setErrorMsg(null);
    setObjShiftNotice(null);
  };

  const handleResetMetrics = async () => {
    try {
      await fetch(`${API_BASE}/api/reset-metrics`, { method: 'POST' });
      fetchMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSimulatedFailure = (providerId: string) => {
    setSimulatedFailures(prev =>
      prev.includes(providerId) ? prev.filter(p => p !== providerId) : [...prev, providerId]
    );
  };

  // Re-run routing calculation when Objective changes
  const handleObjectiveChange = async (newObj: string) => {
    setObjective(newObj);
    if (!promptText.trim()) return;

    setIsRecalculatingObj(true);
    try {
      const budgetVal = maxBudget.trim() ? parseFloat(maxBudget) : null;
      const res = await fetch(`${API_BASE}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          objective: newObj,
          max_budget: budgetVal,
          simulated_failures: simulatedFailures
        })
      });
      if (res.ok) {
        const data: RoutingPayload = await res.json();
        const prevWinner = routingResult?.selected_model.name;
        const newWinner = data.selected_model.name;

        setRoutingResult(data);

        if (prevWinner && prevWinner !== newWinner) {
          setObjShiftNotice(`⚡ Dynamic Routing Shift: Objective '${newObj.replace('_', ' ')}' shifted model selection from ${prevWinner} ➔ ${newWinner}!`);
        } else {
          setObjShiftNotice(`⚡ Recalculated Model Arena scores under '${newObj.replace('_', ' ')}' objective.`);
        }
      }
    } catch (err) {
      console.error("Failed to recalculate routing:", err);
    } finally {
      setIsRecalculatingObj(false);
    }
  };

  // Main Route & Execute Action
  const handleExecuteRequest = async () => {
    if (!promptText.trim()) {
      setErrorMsg("Please enter a request prompt or select a demo preset.");
      return;
    }

    setErrorMsg(null);
    setObjShiftNotice(null);
    setIsProcessing(true);
    setPipelineStep(1);

    const budgetVal = maxBudget.trim() ? parseFloat(maxBudget) : null;

    try {
      await new Promise(r => setTimeout(r, 200));
      setPipelineStep(2);

      await new Promise(r => setTimeout(r, 250));
      setPipelineStep(3);

      await new Promise(r => setTimeout(r, 200));
      setPipelineStep(4);

      setPipelineStep(5);
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          objective: objective,
          max_budget: budgetVal,
          simulated_failures: simulatedFailures
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "API Execution failed");
      }

      const data = await res.json();

      setRoutingResult(data.routing);
      setExecutionResult(data.execution);
      setQualityResult(data.quality);
      setSummaryMetrics(data.summary_metrics);

      setPipelineStep(6);
    } catch (err: any) {
      console.error("Execution error:", err);
      setErrorMsg(err.message || "Execution error occurred");
      setPipelineStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Header envStatus={envStatus} onResetMetrics={handleResetMetrics} />

      <main className="max-w-7xl mx-auto px-4">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs text-rose-700 underline hover:text-rose-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Objective Shift Toast Notice */}
        {objShiftNotice && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-mono font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{objShiftNotice}</span>
            </div>
            <button
              onClick={() => setObjShiftNotice(null)}
              className="text-emerald-700 hover:text-emerald-950 underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Input Control Panel */}
        <div className="glass-panel p-6 mb-6">
          <DemoPresets
            presets={presets}
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" /> Enter AI Request Prompt
              </label>
              <span className="text-xs text-slate-400 font-mono">{promptText.length} chars</span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value);
                setActivePresetId(null);
              }}
              placeholder="Enter any Python code, architecture question, summarization task, or complex reasoning prompt..."
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y"
            />
          </div>

          <ObjectiveSelector
            currentObjective={objective}
            onChangeObjective={handleObjectiveChange}
            isRecalculating={isRecalculatingObj}
          />

          {/* Guardrails & Failure Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 mb-5 text-xs">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Sliders className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="flex-1">
                <label className="font-bold text-slate-700 block mb-0.5">Max Request Budget Limit (USD)</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.005"
                    min="0"
                    placeholder="e.g. 0.03 (Optional Budget Guardrail)"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-amber-800 block mb-1">Simulate Provider Failure (Fallback Routing Demo)</span>
              <div className="flex items-center gap-4 flex-wrap text-slate-700 font-mono">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulatedFailures.includes('openai')}
                    onChange={() => toggleSimulatedFailure('openai')}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Simulate OpenAI Outage</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulatedFailures.includes('anthropic')}
                    onChange={() => toggleSimulatedFailure('anthropic')}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Simulate Anthropic Outage</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleExecuteRequest}
              disabled={isProcessing}
              className="btn-primary text-sm py-2.5 px-6 shadow-md"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Routing & Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  ROUTE & EXECUTE REQUEST
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Pipeline Flow Animation */}
        <PipelineAnimation
          currentStep={pipelineStep}
          selectedModelName={routingResult?.selected_model.name}
        />

        {/* Dashboard Results (rendered once routed) */}
        {routingResult && (
          <>
            {/* 1. Winning Model Spotlight */}
            <WinningModelSpotlight
              selectedModel={routingResult.selected_model}
              rationale={routingResult.rationale}
              objective={objective}
            />

            {/* 2. Request Intelligence Card */}
            <RequestIntelligenceCard intelligence={routingResult.intelligence} />

            {/* 3. Model Arena Comparison Matrix */}
            <ModelArenaTable
              candidates={routingResult.scored_candidates}
              selectedModelId={routingResult.selected_model.id}
            />

            {/* 4. Why Was This Model Selected? Rationale Card */}
            <WhyThisModelCard rationale={routingResult.rationale} />

            {/* 5. LLM Execution Result & Output */}
            <ExecutionResultCard execution={executionResult} />

            {/* 6. Post-Execution Quality Check */}
            <QualityCheckCard quality={qualityResult} />
          </>
        )}

        {/* Aggregate Live Metrics Dashboard */}
        <MetricsDashboard metrics={summaryMetrics} />
      </main>
    </div>
  );
}
export default App;
