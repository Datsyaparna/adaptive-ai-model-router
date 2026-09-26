import os
import time
import httpx
from typing import Dict, Any, Optional
from app.providers.base_provider import BaseProvider

class AnthropicProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key or os.getenv("ANTHROPIC_API_KEY"))

    async def generate(
        self,
        prompt: str,
        model: str = "claude-3-5-sonnet-20241022",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        simulate_error: bool = False
    ) -> Dict[str, Any]:
        if simulate_error:
            raise RuntimeError(f"Simulated execution error for Anthropic model '{model}'")

        if not self.api_key:
            raise ValueError("Anthropic API key (ANTHROPIC_API_KEY) is not configured.")

        # Map display models to exact API string if needed
        model_id = model
        if model == "claude-3-5-sonnet":
            model_id = "claude-3-5-sonnet-20241022"
        elif model == "claude-3-5-haiku":
            model_id = "claude-3-5-haiku-20241022"

        start_time = time.time()

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        payload = {
            "model": model_id,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)

            if res.status_code != 200:
                raise RuntimeError(f"Anthropic API returned status {res.status_code}: {res.text}")

            data = res.json()
            latency_ms = int((time.time() - start_time) * 1000)

            content_blocks = data.get("content", [])
            text_result = content_blocks[0]["text"] if content_blocks else ""
            usage = data.get("usage", {})

            in_tokens = usage.get("input_tokens", len(prompt) // 4)
            out_tokens = usage.get("output_tokens", len(text_result) // 4)

            return {
                "text": text_result,
                "input_tokens": in_tokens,
                "output_tokens": out_tokens,
                "total_tokens": in_tokens + out_tokens,
                "latency_ms": latency_ms,
                "provider": "anthropic",
                "provider_display": "Anthropic",
                "model": model
            }
