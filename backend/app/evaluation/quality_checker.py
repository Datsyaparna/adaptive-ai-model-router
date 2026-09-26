from typing import Dict, Any, List

def evaluate_quality(prompt: str, response_text: str, intelligence: Dict[str, Any]) -> Dict[str, Any]:
    """Lightweight quality check evaluating output existence, non-emptiness, task criteria, and structural formatting."""
    checks: List[Dict[str, Any]] = []

    # 1. Non-empty check
    has_text = bool(response_text and len(response_text.strip()) > 20)
    checks.append({
        "id": "non_empty",
        "name": "Response Generated & Non-Empty",
        "passed": has_text,
        "detail": f"Output length: {len(response_text)} characters" if has_text else "Response was empty or truncated."
    })

    # 2. Task requirement check
    task_type = intelligence.get("task_type", "general_query")
    prompt_lower = prompt.lower()
    res_lower = response_text.lower()

    task_passed = False
    task_detail = "Task context verified."

    if task_type in ["code_review", "code_generation"]:
        # Expect code blocks or key code structural elements
        has_code_syntax = "```" in response_text or "def " in response_text or "function" in response_text or "vulnerability" in res_lower
        task_passed = has_code_syntax
        task_detail = "Detected technical review / code block structures." if has_code_syntax else "No code structures found in output."
    elif task_type == "summarization":
        # Expect concise response / bullet points
        has_bullets = "-" in response_text or "*" in response_text or "1." in response_text or len(response_text) < 1500
        task_passed = has_bullets
        task_detail = "Structured points / concise summary confirmed." if has_bullets else "Summary format check missed bullet patterns."
    elif task_type == "architecture_design":
        has_arch_terms = any(term in res_lower for term in ["architecture", "scale", "system", "trade-off", "design", "component"])
        task_passed = has_arch_terms
        task_detail = "Architectural design concepts addressed." if has_arch_terms else "Missing core system design terms."
    else:
        task_passed = has_text
        task_detail = "General response requirements satisfied."

    checks.append({
        "id": "task_addressed",
        "name": "Task Requirements Addressed",
        "passed": task_passed,
        "detail": task_detail
    })

    # 3. Output format validation
    format_passed = True
    format_detail = "Markdown & text layout valid."
    if "```" in prompt and "```" not in response_text:
        format_passed = False
        format_detail = "Prompt contained code block but response lacked formatted code block."

    checks.append({
        "id": "output_format",
        "name": "Output Format Validation",
        "passed": format_passed,
        "detail": format_detail
    })

    all_passed = all(c["passed"] for c in checks)

    return {
        "status": "PASS" if all_passed else "WARNING",
        "all_passed": all_passed,
        "checks": checks
    }
