import time
import uuid
from typing import Dict, Any, List

class MetricsStore:
    def __init__(self):
        self.history: List[Dict[str, Any]] = []

    def record_execution(
        self,
        routing_data: Dict[str, Any],
        execution_result: Dict[str, Any],
        quality_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        req_id = str(uuid.uuid4())[:8]
        ts = time.strftime("%Y-%m-%d %H:%M:%S")

        sel_model = routing_data["selected_model"]
        intel = routing_data["intelligence"]
        objective = routing_data["objective"]

        in_tokens = execution_result.get("input_tokens", 0)
        out_tokens = execution_result.get("output_tokens", 0)
        total_tokens = in_tokens + out_tokens

        latency_ms = execution_result.get("latency_ms", 0)
        actual_cost = execution_result.get("estimated_cost", 0.0)

        # Calculate Baseline Savings against static flagship model (Claude 3.5 Sonnet / GPT-4o)
        # Static baseline model pricing: $3.00 / 1M in ($0.000003), $15.00 / 1M out ($0.000015)
        baseline_cost = (in_tokens * 0.000003) + (out_tokens * 0.000015)

        cost_diff = max(0.0, baseline_cost - actual_cost)
        savings_pct = round((cost_diff / baseline_cost * 100.0), 1) if baseline_cost > 0 else 0.0

        record = {
            "id": req_id,
            "timestamp": ts,
            "prompt": routing_data["request_prompt"],
            "task_type": intel.get("task_type", "general"),
            "complexity": intel.get("complexity", 0.5),
            "reasoning_req": intel.get("reasoning_requirement", 0.5),
            "objective": objective,
            "selected_model": sel_model["name"],
            "selected_model_id": sel_model["id"],
            "selected_provider": sel_model["provider_display"],
            "routing_score": sel_model["score"],
            "input_tokens": in_tokens,
            "output_tokens": out_tokens,
            "total_tokens": total_tokens,
            "latency_ms": latency_ms,
            "actual_cost": actual_cost,
            "baseline_cost": baseline_cost,
            "cost_savings_usd": cost_diff,
            "cost_savings_pct": savings_pct,
            "fallback_triggered": execution_result.get("fallback_triggered", False),
            "fallback_reason": execution_result.get("fallback_reason"),
            "execution_mode": execution_result.get("execution_mode", "live"),
            "quality_status": quality_result.get("status", "PASS"),
            "all_candidates": [c["name"] for c in routing_data["scored_candidates"]]
        }

        self.history.append(record)
        return record

    def get_summary(self) -> Dict[str, Any]:
        if not self.history:
            return {
                "total_requests": 0,
                "total_tokens": 0,
                "total_cost_usd": 0.0,
                "total_baseline_cost_usd": 0.0,
                "total_savings_usd": 0.0,
                "avg_savings_pct": 0.0,
                "avg_latency_ms": 0,
                "fallback_count": 0,
                "has_baseline": False,
                "history": []
            }

        total_reqs = len(self.history)
        total_tokens = sum(r["total_tokens"] for r in self.history)
        total_cost = sum(r["actual_cost"] for r in self.history)
        total_baseline = sum(r["baseline_cost"] for r in self.history)
        total_savings = sum(r["cost_savings_usd"] for r in self.history)
        avg_savings_pct = round((total_savings / total_baseline * 100.0), 1) if total_baseline > 0 else 0.0
        avg_latency = int(sum(r["latency_ms"] for r in self.history) / total_reqs)
        fallbacks = sum(1 for r in self.history if r["fallback_triggered"])

        return {
            "total_requests": total_reqs,
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 6),
            "total_baseline_cost_usd": round(total_baseline, 6),
            "total_savings_usd": round(total_savings, 6),
            "avg_savings_pct": avg_savings_pct,
            "avg_latency_ms": avg_latency,
            "fallback_count": fallbacks,
            "has_baseline": True,
            "history": self.history[-10:]  # Recent 10 requests
        }

metrics_store = MetricsStore()
