export interface CatalogModel {
  id: string;
  name: string;
  provider: string;
  provider_display: string;
  capability_score: number;
  reasoning_score: number;
  speed_score: number;
  cost_per_input_token: number;
  cost_per_output_token: number;
  context_window: number;
  api_key_env: string;
  description: string;
  is_configured: boolean;
}

export interface RequestIntelligence {
  task_type: string;
  complexity: number;
  reasoning_requirement: number;
  context_requirement: number;
  expected_output_complexity: number;
  latency_sensitivity: number;
  cost_sensitivity: number;
  estimated_input_tokens: number;
  estimated_output_tokens: number;
  analysis_method: string;
}

export interface ScoredCandidate {
  id: string;
  name: string;
  provider: string;
  provider_display: string;
  score: number;
  est_cost: number;
  capability_score: number;
  reasoning_score: number;
  speed_score: number;
  context_window: number;
  cost_score_normalized: number;
  reasoning_match: number;
  exceeds_context: boolean;
  exceeds_budget: boolean;
  is_configured: boolean;
}

export interface CandidateRejection {
  id: string;
  name: string;
  provider: string;
  score: number;
  reasons: string[];
}

export interface Rationale {
  selected_model_id: string;
  selected_model_name: string;
  objective_used: string;
  positive_factors: string[];
  candidate_rejections: CandidateRejection[];
}

export interface RoutingPayload {
  request_prompt: string;
  objective: string;
  max_budget: number | null;
  intelligence: RequestIntelligence;
  scored_candidates: ScoredCandidate[];
  selected_model: ScoredCandidate;
  rationale: Rationale;
  fallback_chain: string[];
}

export interface FallbackHistoryItem {
  model_id: string;
  model_name: string;
  provider: string;
  reason: string;
  status: string;
}

export interface ExecutionResult {
  text: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  estimated_cost: number;
  actual_cost?: number;
  provider: string;
  provider_display: string;
  model: string;
  model_name: string;
  fallback_triggered: boolean;
  fallback_reason: string | null;
  fallback_history: FallbackHistoryItem[];
  primary_model_name: string;
  execution_mode: string;
}

export interface QualityCheckItem {
  id: string;
  name: string;
  passed: boolean;
  detail: string;
}

export interface QualityResult {
  status: string;
  all_passed: boolean;
  checks: QualityCheckItem[];
}

export interface MetricRecord {
  id: string;
  timestamp: string;
  prompt: string;
  task_type: string;
  complexity: number;
  reasoning_req: number;
  objective: string;
  selected_model: string;
  selected_model_id: string;
  selected_provider: string;
  routing_score: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  actual_cost: number;
  baseline_cost: number;
  cost_savings_usd: number;
  cost_savings_pct: number;
  fallback_triggered: boolean;
  fallback_reason?: string;
  execution_mode: string;
  quality_status: string;
  all_candidates: string[];
}

export interface SummaryMetrics {
  total_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  total_baseline_cost_usd: number;
  total_savings_usd: number;
  avg_savings_pct: number;
  avg_latency_ms: number;
  fallback_count: number;
  has_baseline: boolean;
  history: MetricRecord[];
}

export interface DemoPreset {
  id: string;
  label: string;
  title: string;
  prompt: string;
  expected_ideal: string;
  badge: string;
}
