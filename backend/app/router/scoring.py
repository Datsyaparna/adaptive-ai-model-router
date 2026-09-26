from typing import Dict, Any, List, Optional
import math

OBJECTIVE_WEIGHTS = {
    "lowest_cost": {
        "cost": 0.65,
        "speed": 0.15,
        "capability": 0.10,
        "reasoning": 0.10
    },
    "lowest_latency": {
        "cost": 0.10,
        "speed": 0.65,
        "capability": 0.15,
        "reasoning": 0.10
    },
    "highest_quality": {
        "cost": 0.05,
        "speed": 0.05,
        "capability": 0.50,
        "reasoning": 0.40
    },
    "balanced": {
        "cost": 0.30,
        "speed": 0.20,
        "capability": 0.25,
        "reasoning": 0.25
    }
}

def calculate_model_scores(
    models: List[Dict[str, Any]],
    intelligence: Dict[str, Any],
    objective: str = "balanced",
    max_budget: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Calculates dynamic routing scores and evaluation details for all candidate models."""
    if objective not in OBJECTIVE_WEIGHTS:
        objective = "balanced"

    weights = OBJECTIVE_WEIGHTS[objective]

    est_input_tokens = intelligence.get("estimated_input_tokens", 100)
    est_output_tokens = intelligence.get("estimated_output_tokens", 300)
    req_reasoning = intelligence.get("reasoning_requirement", 0.5)
    req_complexity = intelligence.get("complexity", 0.5)

    # 1. First pass: compute estimated costs for all models
    model_evals = []
    costs = []

    for m in models:
        cost = (est_input_tokens * m["cost_per_input_token"]) + (est_output_tokens * m["cost_per_output_token"])
        costs.append(cost)
        model_evals.append({
            "model": m,
            "est_cost": cost,
            "id": m["id"],
            "name": m["name"],
            "provider": m["provider"],
            "provider_display": m["provider_display"]
        })

    max_cost = max(costs) if costs and max(costs) > 0 else 1.0
    min_cost = min(costs) if costs else 0.0

    scored_candidates = []

    for item in model_evals:
        m = item["model"]
        cost = item["est_cost"]

        # Cost Score (normalized higher is cheaper)
        if max_cost == min_cost:
            cost_score = 1.0
        else:
            cost_score = 1.0 - ((cost - min_cost) / (max_cost - min_cost))

        # Speed score directly from metadata
        speed_score = m.get("speed_score", 0.8)

        # Capability score
        capability_score = m.get("capability_score", 0.8)

        # Reasoning match
        model_reasoning = m.get("reasoning_score", 0.8)
        reasoning_diff = req_reasoning - model_reasoning
        if reasoning_diff > 0:
            # Penalize models lacking required reasoning
            reasoning_score = max(0.0, 1.0 - (reasoning_diff * 2.0))
        else:
            reasoning_score = 1.0

        # Raw score computation
        raw_score = (
            (weights["cost"] * cost_score) +
            (weights["speed"] * speed_score) +
            (weights["capability"] * capability_score) +
            (weights["reasoning"] * reasoning_score)
        )

        # Context check
        context_window = m.get("context_window", 128000)
        exceeds_context = est_input_tokens > context_window
        if exceeds_context:
            raw_score *= 0.1

        # Budget constraint check
        exceeds_budget = False
        if max_budget is not None and max_budget > 0:
            if cost > max_budget:
                exceeds_budget = True
                # Severe penalty for exceeding user budget
                raw_score *= 0.15

        final_score_pct = round(max(0.0, min(100.0, raw_score * 100.0)), 1)

        scored_candidates.append({
            "id": m["id"],
            "name": m["name"],
            "provider": m["provider"],
            "provider_display": m["provider_display"],
            "score": final_score_pct,
            "est_cost": cost,
            "capability_score": int(m["capability_score"] * 100),
            "reasoning_score": int(m["reasoning_score"] * 100),
            "speed_score": int(m["speed_score"] * 100),
            "context_window": m["context_window"],
            "cost_score_normalized": round(cost_score, 2),
            "reasoning_match": round(reasoning_score, 2),
            "exceeds_context": exceeds_context,
            "exceeds_budget": exceeds_budget,
            "is_configured": m.get("is_configured", False)
        })

    # Sort candidates by final score descending
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    return scored_candidates

def generate_routing_rationale(
    selected_model: Dict[str, Any],
    all_candidates: List[Dict[str, Any]],
    intelligence: Dict[str, Any],
    objective: str,
    max_budget: Optional[float] = None
) -> Dict[str, Any]:
    """Generates explicit positive decision factors and specific rejection reasons for candidate models."""
    objective_labels = {
        "lowest_cost": "Lowest Cost",
        "lowest_latency": "Lowest Latency",
        "highest_quality": "Highest Quality",
        "balanced": "Balanced Optimization"
    }

    selected_factors = []

    # 1. Reasoning alignment
    req_reasoning = intelligence.get("reasoning_requirement", 0.5)
    sel_reasoning = selected_model["reasoning_score"] / 100.0
    if sel_reasoning >= req_reasoning:
        selected_factors.append(f"✓ Strong reasoning capability ({int(sel_reasoning*100)}% vs {int(req_reasoning*100)}% required)")
    else:
        selected_factors.append(f"✓ Acceptable reasoning trade-off for current objective")

    # 2. Objective alignment
    selected_factors.append(f"✓ Optimal score under '{objective_labels.get(objective, objective)}' objective")

    # 3. Cost factor
    sel_cost = selected_model["est_cost"]
    selected_factors.append(f"✓ Estimated cost (${sel_cost:.5f}) within target threshold")

    # 4. Latency / Speed factor
    sel_speed = selected_model["speed_score"]
    if sel_speed >= 85:
        selected_factors.append(f"✓ Fast response speed rating ({sel_speed}/100)")
    else:
        selected_factors.append(f"✓ Response speed acceptable for task complexity")

    # 5. Budget factor
    if max_budget:
        if sel_cost <= max_budget:
            selected_factors.append(f"✓ Strictly compliant with user budget constraint (${max_budget:.4f})")
        else:
            selected_factors.append(f"⚠️ Lowest cost available but exceeds budget constraint (${sel_cost:.5f} > ${max_budget:.4f})")

    # Rejection factors for other candidate models
    rejected_details = []
    for cand in all_candidates:
        if cand["id"] == selected_model["id"]:
            continue

        reasons = []
        # Compare cost
        if cand["est_cost"] > sel_cost * 1.5:
            cost_diff_pct = int(((cand["est_cost"] - sel_cost) / (sel_cost if sel_cost > 0 else 1.0)) * 100)
            reasons.append(f"Higher estimated cost (+{cost_diff_pct}% vs selected model)")
        elif cand["est_cost"] < sel_cost and objective != "lowest_cost":
            reasons.append("Lower cost, but lower quality/reasoning capability score")

        # Compare reasoning
        cand_reasoning = cand["reasoning_score"] / 100.0
        if req_reasoning > 0.8 and cand_reasoning < 0.8:
            reasons.append(f"Insufficient reasoning capability ({int(cand_reasoning*100)}% vs {int(req_reasoning*100)}% required)")

        # Compare speed
        if objective == "lowest_latency" and cand["speed_score"] < selected_model["speed_score"]:
            reasons.append(f"Slower latency rating ({cand['speed_score']} vs {selected_model['speed_score']})")

        # Objective mismatch
        if not reasons:
            reasons.append(f"Lower aggregate score ({cand['score']}/100 under {objective_labels.get(objective)})")

        if cand.get("exceeds_budget"):
            reasons.insert(0, f"Exceeds user maximum budget threshold (${cand['est_cost']:.4f} > ${max_budget:.4f})")

        rejected_details.append({
            "id": cand["id"],
            "name": cand["name"],
            "provider": cand["provider_display"],
            "score": cand["score"],
            "reasons": reasons
        })

    return {
        "selected_model_id": selected_model["id"],
        "selected_model_name": selected_model["name"],
        "objective_used": objective_labels.get(objective, objective),
        "positive_factors": selected_factors,
        "candidate_rejections": rejected_details
    }
