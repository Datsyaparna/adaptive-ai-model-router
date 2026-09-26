from typing import Dict, Any, List, Optional
from app.config.models import get_model_catalog
from app.intelligence.request_analyzer import analyze_request
from app.router.scoring import calculate_model_scores, generate_routing_rationale

def route_request(
    prompt: str,
    objective: str = "balanced",
    max_budget: Optional[float] = None,
    simulated_failures: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Orchestrates request intelligence, model evaluation, dynamic scoring, and selection decision."""
    simulated_failures = simulated_failures or []

    # 1. Request Intelligence Analysis
    intelligence = analyze_request(prompt)

    # 2. Fetch Catalog
    all_models = get_model_catalog()

    # 3. Filter out explicitly simulated failure models if any
    candidate_models = [m for m in all_models if m["id"] not in simulated_failures and m["provider"] not in simulated_failures]

    # If all models failed or excluded, use full catalog to prevent crash
    if not candidate_models:
        candidate_models = all_models

    # 4. Dynamic Scoring
    scored_candidates = calculate_model_scores(
        models=candidate_models,
        intelligence=intelligence,
        objective=objective,
        max_budget=max_budget
    )

    selected_candidate = scored_candidates[0] if scored_candidates else None

    if not selected_candidate:
        raise ValueError("No viable models found in catalog.")

    # 5. Generate Rationale
    rationale = generate_routing_rationale(
        selected_model=selected_candidate,
        all_candidates=scored_candidates,
        intelligence=intelligence,
        objective=objective,
        max_budget=max_budget
    )

    # 6. Primary model vs Fallback chain setup
    fallback_chain = [c["id"] for c in scored_candidates[1:]]

    return {
        "request_prompt": prompt,
        "objective": objective,
        "max_budget": max_budget,
        "intelligence": intelligence,
        "scored_candidates": scored_candidates,
        "selected_model": selected_candidate,
        "rationale": rationale,
        "fallback_chain": fallback_chain
    }
