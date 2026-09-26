from typing import Dict, Any, List
import os
from pathlib import Path
from dotenv import load_dotenv

def reload_env():
    """Forces reloading of .env file from disk on every check."""
    app_dir = Path(__file__).resolve().parent # app/
    backend_dir = app_dir.parent             # backend/
    root_dir = backend_dir.parent            # build demo/

    env_paths = [
        backend_dir / ".env",
        root_dir / ".env",
        Path.cwd() / ".env",
        Path.cwd() / "backend" / ".env"
    ]
    for p in env_paths:
        if p.exists():
            load_dotenv(dotenv_path=p, override=True)

MODEL_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "provider": "openai",
        "provider_display": "OpenAI",
        "capability_score": 0.96,
        "reasoning_score": 0.95,
        "speed_score": 0.72,
        "cost_per_input_token": 0.0000025,  # $2.50 per 1M
        "cost_per_output_token": 0.0000100, # $10.00 per 1M
        "context_window": 128000,
        "api_key_env": "OPENAI_API_KEY",
        "description": "Flagship multimodal model with supreme reasoning and high precision."
    },
    {
        "id": "gpt-4o-mini",
        "name": "GPT-4o Mini",
        "provider": "openai",
        "provider_display": "OpenAI",
        "capability_score": 0.78,
        "reasoning_score": 0.74,
        "speed_score": 0.95,
        "cost_per_input_token": 0.00000015, # $0.15 per 1M
        "cost_per_output_token": 0.00000060, # $0.60 per 1M
        "context_window": 128000,
        "api_key_env": "OPENAI_API_KEY",
        "description": "Ultra-fast, light-weight cost-efficient model for quick tasks."
    },
    {
        "id": "claude-3-5-sonnet",
        "name": "Claude 3.5 Sonnet",
        "provider": "anthropic",
        "provider_display": "Anthropic",
        "capability_score": 0.98,
        "reasoning_score": 0.98,
        "speed_score": 0.68,
        "cost_per_input_token": 0.0000030,  # $3.00 per 1M
        "cost_per_output_token": 0.0000150, # $15.00 per 1M
        "context_window": 200000,
        "api_key_env": "ANTHROPIC_API_KEY",
        "description": "SOTA code analysis, reasoning, and complex task handling."
    },
    {
        "id": "claude-3-5-haiku",
        "name": "Claude 3.5 Haiku",
        "provider": "anthropic",
        "provider_display": "Anthropic",
        "capability_score": 0.82,
        "reasoning_score": 0.80,
        "speed_score": 0.94,
        "cost_per_input_token": 0.0000008,  # $0.80 per 1M
        "cost_per_output_token": 0.0000040, # $4.00 per 1M
        "context_window": 200000,
        "api_key_env": "ANTHROPIC_API_KEY",
        "description": "High speed, lightweight model with strong intelligence per dollar."
    },
    {
        "id": "gemini-1.5-pro",
        "name": "Gemini 1.5 Pro",
        "provider": "google",
        "provider_display": "Google Gemini",
        "capability_score": 0.94,
        "reasoning_score": 0.92,
        "speed_score": 0.75,
        "cost_per_input_token": 0.00000125, # $1.25 per 1M
        "cost_per_output_token": 0.0000050,  # $5.00 per 1M
        "context_window": 1000000,
        "api_key_env": "GOOGLE_API_KEY",
        "description": "Massive 1M+ context window with strong reasoning capabilities."
    },
    {
        "id": "gemini-1.5-flash",
        "name": "Gemini 1.5 Flash",
        "provider": "google",
        "provider_display": "Google Gemini",
        "capability_score": 0.80,
        "reasoning_score": 0.76,
        "speed_score": 0.98,
        "cost_per_input_token": 0.000000075, # $0.075 per 1M
        "cost_per_output_token": 0.00000030, # $0.30 per 1M
        "context_window": 1000000,
        "api_key_env": "GOOGLE_API_KEY",
        "description": "Lightning-fast responses with lowest cost per token."
    }
]

def get_model_catalog() -> List[Dict[str, Any]]:
    """Returns the model catalog with dynamic environment availability status."""
    reload_env()
    catalog = []
    for m in MODEL_CATALOG:
        m_copy = dict(m)
        env_var = m_copy.get("api_key_env")
        if env_var == "GOOGLE_API_KEY":
            val = (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or "").strip()
        else:
            val = (os.getenv(env_var) or "").strip()
        m_copy["is_configured"] = bool(val and len(val) > 5)
        catalog.append(m_copy)
    return catalog
