import os
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config.models import get_model_catalog, reload_env
from app.router.routing_engine import route_request
from app.providers.provider_factory import execute_with_fallback
from app.evaluation.quality_checker import evaluate_quality
from app.metrics.metrics import metrics_store

reload_env()

app = FastAPI(
    title="Adaptive AI Model Router API",
    description="Dynamic AI model selection, intelligence scoring, and execution engine.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequestSchema(BaseModel):
    prompt: str
    objective: str = "balanced"
    max_budget: Optional[float] = None
    simulated_failures: Optional[List[str]] = []

class ExecuteRequestSchema(RouteRequestSchema):
    pass

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Adaptive AI Model Router API",
        "tagline": "Don't send every request to the same model. Let the request determine the model."
    }

@app.get("/api/models")
def list_models():
    """Returns catalog of models with pricing, scores, and configured API status."""
    reload_env()
    openai_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    anthropic_key = (os.getenv("ANTHROPIC_API_KEY") or "").strip()
    google_key = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()

    return {
        "catalog": get_model_catalog(),
        "env_status": {
            "OPENAI_API_KEY": bool(openai_key and len(openai_key) > 5),
            "ANTHROPIC_API_KEY": bool(anthropic_key and len(anthropic_key) > 5),
            "GOOGLE_API_KEY": bool(google_key and len(google_key) > 5)
        }
    }

@app.get("/api/presets")
def get_presets():
    return {
        "presets": [
            {
                "id": "simple",
                "label": "SIMPLE",
                "title": "Summarize Paragraph",
                "prompt": "Summarize this paragraph into three concise bullet points: Quantum computing leverages quantum mechanics principles like superposition and entanglement to perform complex computation exponential times faster than classical binary supercomputers for specific encryption and simulation tasks.",
                "expected_ideal": "Gemini 1.5 Flash / GPT-4o Mini",
                "badge": "Low Complexity"
            },
            {
                "id": "medium",
                "label": "MEDIUM",
                "title": "Python Code Review",
                "prompt": "Review this Python authentication function and identify potential security vulnerabilities and performance improvements:\n\n```python\ndef login(user_id, password):\n    user = db.query(f'SELECT * FROM users WHERE id = {user_id}')\n    if user and user.password == password:\n        return generate_token(user)\n    return None\n```",
                "expected_ideal": "Claude 3.5 Haiku / GPT-4o Mini",
                "badge": "Medium Complexity"
            },
            {
                "id": "complex",
                "label": "COMPLEX",
                "title": "System Architecture Redesign",
                "prompt": "Analyze this software architecture and recommend a scalable redesign with trade-offs: We have a monolithic Django app handling 50k requests/sec connected to a single MySQL instance. During flash sales, the database connection pool exhausts and HTTP 500 errors surge.",
                "expected_ideal": "Claude 3.5 Sonnet / GPT-4o",
                "badge": "High Complexity & Reasoning"
            }
        ]
    }

@app.post("/api/route")
def api_route_request(req: RouteRequestSchema):
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    try:
        routing_result = route_request(
            prompt=req.prompt,
            objective=req.objective,
            max_budget=req.max_budget,
            simulated_failures=req.simulated_failures
        )
        return routing_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/execute")
async def api_execute_request(req: ExecuteRequestSchema):
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    reload_env()

    routing_result = route_request(
        prompt=req.prompt,
        objective=req.objective,
        max_budget=req.max_budget,
        simulated_failures=req.simulated_failures
    )

    execution_result = await execute_with_fallback(
        ranked_candidates=routing_result["scored_candidates"],
        prompt=req.prompt,
        simulated_failure_ids=req.simulated_failures
    )

    quality_result = evaluate_quality(
        prompt=req.prompt,
        response_text=execution_result["text"],
        intelligence=routing_result["intelligence"]
    )

    metrics_record = metrics_store.record_execution(
        routing_data=routing_result,
        execution_result=execution_result,
        quality_result=quality_result
    )

    return {
        "routing": routing_result,
        "execution": execution_result,
        "quality": quality_result,
        "metrics_record": metrics_record,
        "summary_metrics": metrics_store.get_summary()
    }

@app.get("/api/metrics")
def get_metrics():
    return metrics_store.get_summary()

@app.post("/api/reset-metrics")
def reset_metrics():
    metrics_store.history.clear()
    return {"status": "cleared"}
