import os
import time
import httpx
from typing import Dict, Any, Optional
from app.providers.base_provider import BaseProvider

class OpenAIProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key or os.getenv("OPENAI_API_KEY"))

    async def generate(
        self,
        prompt: str,
        model: str = "gpt-4o-mini",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        simulate_error: bool = False
    ) -> Dict[str, Any]:
        if simulate_error:
            raise RuntimeError(f"Simulated execution error for OpenAI model '{model}'")

        if not self.api_key:
            raise ValueError(f"OpenAI API key (OPENAI_API_KEY) is not configured.")

        start_time = time.time()

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a helpful, expert AI assistant providing detailed and concise responses."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

            if res.status_code != 200:
                raise RuntimeError(f"OpenAI API returned status {res.status_code}: {res.text}")

            data = res.json()
            latency_ms = int((time.time() - start_time) * 1000)

            choice = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            in_tokens = usage.get("prompt_tokens", len(prompt) // 4)
            out_tokens = usage.get("completion_tokens", len(choice) // 4)

            return {
                "text": choice,
                "input_tokens": in_tokens,
                "output_tokens": out_tokens,
                "total_tokens": in_tokens + out_tokens,
                "latency_ms": latency_ms,
                "provider": "openai",
                "provider_display": "OpenAI",
                "model": model
            }
