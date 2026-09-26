import os
import time
import httpx
from typing import Dict, Any, Optional
from app.providers.base_provider import BaseProvider

class GeminiProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"))

    async def generate(
        self,
        prompt: str,
        model: str = "gemini-3.8-flash",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        simulate_error: bool = False
    ) -> Dict[str, Any]:
        if simulate_error:
            raise RuntimeError(f"Simulated execution error for Google Gemini model '{model}'")

        if not self.api_key:
            raise ValueError("Google Gemini API key (GOOGLE_API_KEY / GEMINI_API_KEY) is not configured.")

        # Map display model to exact Gemini API model identifier
        model_id = model
        if model == "gemini-1.5-pro":
            model_id = "gemini-1.5-pro"
        elif model == "gemini-1.5-flash":
            model_id = "gemini-1.5-flash"

        start_time = time.time()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={self.api_key}"

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature
            }
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(url, json=payload)

            if res.status_code != 200:
                # If gemini-1.5-flash model name fails, try fallback model identifier gemini-3.8-flash
                if "not found" in res.text.lower() and model_id == "gemini-1.5-flash":
                    alt_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={self.api_key}"
                    res = await client.post(alt_url, json=payload)
                
                if res.status_code != 200:
                    raise RuntimeError(f"Gemini API returned status {res.status_code}: {res.text}")

            data = res.json()
            latency_ms = int((time.time() - start_time) * 1000)

            candidates = data.get("candidates", [])
            text_result = ""
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    text_result = parts[0].get("text", "")

            usage = data.get("usageMetadata", {})
            in_tokens = usage.get("promptTokenCount", len(prompt) // 4)
            out_tokens = usage.get("candidatesTokenCount", len(text_result) // 4)

            return {
                "text": text_result,
                "input_tokens": in_tokens,
                "output_tokens": out_tokens,
                "total_tokens": in_tokens + out_tokens,
                "latency_ms": latency_ms,
                "provider": "google",
                "provider_display": "Google Gemini",
                "model": model
            }
