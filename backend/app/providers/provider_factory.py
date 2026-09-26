import time
import asyncio
from typing import Dict, Any, List, Optional
from app.providers.openai_provider import OpenAIProvider
from app.providers.anthropic_provider import AnthropicProvider
from app.providers.gemini_provider import GeminiProvider

class DemonstrationFallbackProvider:
    """Fallback execution provider used when live keys are unconfigured or live providers fail."""
    async def generate(self, prompt: str, model_info: Dict[str, Any], reason: str) -> Dict[str, Any]:
        start = time.time()
        await asyncio.sleep(0.3) # Simulate realistic network latency
        latency_ms = int((time.time() - start) * 1000) + 180

        model_name = model_info["name"]
        provider_display = model_info["provider_display"]

        # Generate realistic demonstration response tailored to request
        if "security" in prompt.lower() or "auth" in prompt.lower() or "python" in prompt.lower():
            text = (
                f"### [{provider_display} {model_name} Security Review Output]\n\n"
                "**Identified Vulnerabilities & Key Recommendations:**\n"
                "1. **Insecure Password Hashing**: The current implementation uses weak digest algorithms. Migrate to `bcrypt` or `argon2id` with proper salting.\n"
                "2. **Missing Token Expiration**: Ensure JWT claims include `exp` and `nbf` to mitigate replay attacks.\n"
                "3. **SQL Injection Vulnerability**: Parameterize all dynamic queries using SQLAlchemy or psycopg2 parameter binding.\n"
                "4. **CORS & Rate Limiting**: Implement strict Origin checks and add Redis-backed rate limiting on auth endpoints.\n\n"
                "**Refactored Snippet:**\n"
                "```python\n"
                "from passlib.context import CryptContext\n"
                "pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')\n\n"
                "def verify_password(plain_password, hashed_password):\n"
                "    return pwd_context.verify(plain_password, hashed_password)\n"
                "```"
            )
        elif "architecture" in prompt.lower() or "design" in prompt.lower() or "system" in prompt.lower():
            text = (
                f"### [{provider_display} {model_name} Architectural Recommendation]\n\n"
                "**Scalable System Redesign Architecture:**\n"
                "1. **Decoupled Event-Driven Layer**: Introduce Kafka/RabbitMQ message queues to handle async workload spikes.\n"
                "2. **Read/Write DB Splitting**: Implement PostgreSQL primary-replica topology with Redis caching layer (95% cache hit ratio).\n"
                "3. **API Gateway & Microservices**: Migrate monolithic API to containerized ECS/K8s services with Envoy proxy sidecars.\n"
                "4. **Trade-offs**: Slightly increased operational complexity and eventual consistency latency, balanced by 10x throughput capacity."
            )
        else:
            text = (
                f"### [{provider_display} {model_name} Executive Summary]\n\n"
                f"Summary of request:\n"
                f"- Primary Task: Process user input with high precision.\n"
                f"- Key Insight: Adaptive routing matched this prompt to **{model_name}** based on complexity and cost parameters.\n"
                f"- Recommendation: Proceed with current configuration for optimal cost-performance ratio."
            )

        in_tokens = max(15, len(prompt) // 4)
        out_tokens = max(40, len(text) // 4)

        # Calculate estimated cost based on catalog pricing
        cost = (in_tokens * model_info.get("cost_per_input_token", 0.000001)) + (out_tokens * model_info.get("cost_per_output_token", 0.000004))

        return {
            "text": text,
            "input_tokens": in_tokens,
            "output_tokens": out_tokens,
            "total_tokens": in_tokens + out_tokens,
            "latency_ms": latency_ms,
            "estimated_cost": cost,
            "provider": model_info["provider"],
            "provider_display": provider_display,
            "model": model_info["id"],
            "model_name": model_name,
            "is_demonstration": True,
            "fallback_info": reason
        }

async def execute_with_fallback(
    ranked_candidates: List[Dict[str, Any]],
    prompt: str,
    simulated_failure_ids: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Tries primary model provider execution. On error/missing key, automatically cascades to secondary candidate models."""
    simulated_failure_ids = simulated_failure_ids or []
    fallback_history = []
    fallback_triggered = False
    fallback_reason = None
    primary_model = ranked_candidates[0]

    for index, cand in enumerate(ranked_candidates):
        model_id = cand["id"]
        provider_type = cand["provider"]
        model_name = cand["name"]

        # Check for simulated failure
        if model_id in simulated_failure_ids or provider_type in simulated_failure_ids:
            fail_msg = f"Simulated provider failure/timeout for '{cand['name']}'"
            fallback_history.append({
                "model_id": model_id,
                "model_name": model_name,
                "provider": cand["provider_display"],
                "reason": fail_msg,
                "status": "FAILED"
            })
            fallback_triggered = True
            fallback_reason = fail_msg
            continue

        # Try live execution
        try:
            res = None
            if provider_type == "openai":
                p = OpenAIProvider()
                res = await p.generate(prompt=prompt, model=model_id)
            elif provider_type == "anthropic":
                p = AnthropicProvider()
                res = await p.generate(prompt=prompt, model=model_id)
            elif provider_type == "google":
                p = GeminiProvider()
                res = await p.generate(prompt=prompt, model=model_id)

            if res:
                # Add calculated cost
                in_t = res["input_tokens"]
                out_t = res["output_tokens"]
                cost = (in_t * cand.get("cost_per_input_token", 0.000001)) + (out_t * cand.get("cost_per_output_token", 0.000004))
                res["estimated_cost"] = cost
                res["actual_cost"] = cost
                res["model_name"] = model_name
                res["fallback_triggered"] = fallback_triggered
                res["fallback_reason"] = fallback_reason
                res["fallback_history"] = fallback_history
                res["primary_model_name"] = primary_model["name"]
                res["execution_mode"] = "live_api"
                return res

        except Exception as err:
            err_str = str(err)
            fallback_triggered = True
            fallback_reason = err_str
            fallback_history.append({
                "model_id": model_id,
                "model_name": model_name,
                "provider": cand["provider_display"],
                "reason": err_str,
                "status": "FAILED"
            })

    # If all live providers fail or are unconfigured, use Demonstration Fallback Engine on top ranked candidate
    demo_provider = DemonstrationFallbackProvider()
    fallback_reason_summary = fallback_reason or "All live API keys unconfigured in local environment"
    res = await demo_provider.generate(prompt, primary_model, fallback_reason_summary)
    res["fallback_triggered"] = fallback_triggered or True
    res["fallback_reason"] = fallback_reason_summary
    res["fallback_history"] = fallback_history
    res["primary_model_name"] = primary_model["name"]
    res["execution_mode"] = "demo_fallback"
    return res
