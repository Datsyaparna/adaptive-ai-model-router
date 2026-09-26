import re
from typing import Dict, Any, List

def analyze_request_heuristics(prompt: str) -> Dict[str, Any]:
    """Analyze request using measurable features instead of hardcoded profiles."""
    cleaned = prompt.strip()
    char_count = len(cleaned)
    words = cleaned.split()
    word_count = len(words)

    # --- Measurable feature extraction ---
    
    # 1. Input length features
    estimated_input_tokens = max(10, int(word_count * 1.35))
    input_length_score = min(1.0, estimated_input_tokens / 4000.0)  # normalize to ~4k tokens

    # 2. Code detection and measurement
    code_blocks = re.findall(r'```[\s\S]*?```', cleaned)
    inline_code = re.findall(r'`[^`\n]+`', cleaned)
    code_chars = sum(len(b) for b in code_blocks) + sum(len(c) for c in inline_code)
    code_ratio = min(1.0, code_chars / max(1, char_count))
    has_code = code_ratio > 0.05 or bool(code_blocks)

    # 3. Instruction/constraint counting
    # Imperative verbs, numbered lists, explicit constraints
    instruction_patterns = [
        r'\b(must|should|require|ensure|avoid|use|implement|create|design|build|write|generate|produce)\b',
        r'\b(do not|don\'t|never|always|exactly|precisely|specifically)\b',
        r'^\s*[\d\-•]\s',  # numbered/bulleted lists
        r'\b(constraint|requirement|condition|rule|guideline)\b',
    ]
    instruction_count = sum(len(re.findall(p, cleaned, re.IGNORECASE | re.MULTILINE)) for p in instruction_patterns)
    instruction_complexity = min(1.0, instruction_count / 10.0)  # normalize: 10+ instructions = max

    # 4. Question counting
    question_count = cleaned.count('?')
    question_complexity = min(1.0, question_count / 5.0)  # 5+ questions = max

    # 5. Structured output requirements
    structured_phrases = [
        'json', 'yaml', 'xml', 'csv',
        'return as', 'output as', 'in the form of', 'as a list', 'as an array',
        'key-value', 'dictionary', 'object', 'markdown', 'bullet points',
        'as a table', 'table format', 'tabular format', 'schema', 'structure'
    ]
    structured_score = min(1.0, sum(1 for k in structured_phrases if k in cleaned.lower()) / 3.0)

    # 6. Multi-step / reasoning indicators
    reasoning_keywords = [
        'step', 'phase', 'stage', 'first', 'then', 'next', 'finally', 'after',
        'analyze', 'evaluate', 'compare', 'contrast', 'reason', 'explain why',
        'trade-off', 'tradeoff', 'pros and cons', 'advantages', 'disadvantages',
        'algorithm', 'proof', 'derive', 'optimize', 'complexity', 'architecture',
        'design pattern', 'refactor', 'debug', 'root cause', 'investigate'
    ]
    reasoning_hits = sum(1 for k in reasoning_keywords if k in cleaned.lower())
    reasoning_indicator = min(1.0, reasoning_hits / 8.0)  # 8+ indicators = max

    # 7. Context complexity (references to external systems, dependencies, domain depth)
    context_keywords = [
        'api', 'database', 'service', 'microservice', 'system', 'platform',
        'infrastructure', 'deployment', 'kubernetes', 'docker', 'cloud', 'aws', 'gcp', 'azure',
        'redis', 'kafka', 'postgres', 'mysql', 'mongodb', 'elasticsearch',
        'authentication', 'authorization', 'security', 'encryption', 'compliance',
        'legacy', 'migration', 'integration', 'dependency', 'coupling', 'scalability'
    ]
    context_hits = sum(1 for k in context_keywords if k in cleaned.lower())
    context_complexity = min(1.0, context_hits / 10.0)  # 10+ context refs = max

    # 8. Domain-specific task classification (still heuristic, but feature-driven)
    prompt_lower = cleaned.lower()
    
    # Architecture/system design indicators
    arch_score = 0.0
    arch_keywords = ['architecture', 'system design', 'scalability', 'microservices', 
                     'distributed', 'redesign', 'trade-off', 'tradeoff', 'bottleneck']
    if any(re.search(rf'\b{re.escape(k)}\b', prompt_lower) for k in arch_keywords):
        arch_score += 0.5
    if context_complexity > 0.5:
        arch_score += 0.3
    if reasoning_indicator > 0.5:
        arch_score += 0.2
    arch_score = min(1.0, arch_score)

    # Code-related indicators
    code_review_score = 0.0
    if has_code:
        code_review_score += 0.4
    code_review_keywords = ['review', 'security', 'vulnerability', 'bug', 'refactor', 'audit']
    if any(re.search(rf'\b{re.escape(k)}\b', prompt_lower) for k in code_review_keywords):
        code_review_score += 0.4
    if instruction_complexity > 0.3:
        code_review_score += 0.2
    code_review_score = min(1.0, code_review_score)

    code_gen_score = 0.0
    if has_code:
        code_gen_score += 0.3
    code_gen_keywords = ['write', 'create', 'implement', 'generate', 'build', 'function', 'class', 'api']
    if any(re.search(rf'\b{re.escape(k)}\b', prompt_lower) for k in code_gen_keywords):
        code_gen_score += 0.4
    if structured_score > 0.3:
        code_gen_score += 0.3
    code_gen_score = min(1.0, code_gen_score)

    # Summarization indicators
    summary_score = 0.0
    summary_keywords = ['summarize', 'summary', 'bullet points', 'tl;dr', 'extract', 'key points', 'brief']
    if any(re.search(rf'\b{re.escape(k)}\b', prompt_lower) for k in summary_keywords):
        summary_score += 0.6
    if question_count == 0 and instruction_count < 3 and not has_code:
        summary_score += 0.2
    if input_length_score > 0.5:
        summary_score += 0.2
    summary_score = min(1.0, summary_score)

    # Complex reasoning indicators
    reasoning_score = reasoning_indicator
    reasoning_strong_keywords = ['proof', 'algorithm', 'complexity', 'math', 'solve', 'derive', 'logic']
    if any(re.search(rf'\b{re.escape(k)}\b', prompt_lower) for k in reasoning_strong_keywords):
        reasoning_score = max(reasoning_score, 0.7)

    # --- Determine primary task type from feature scores ---
    task_scores = {
        "architecture_design": arch_score,
        "code_review": code_review_score,
        "code_generation": code_gen_score,
        "summarization": summary_score,
        "complex_reasoning": reasoning_score,
    }
    task_type = max(task_scores, key=task_scores.get)
    primary_score = task_scores[task_type]

    # Fallback to general_query if no strong signal
    if primary_score < 0.3:
        task_type = "general_query"

    # --- Compute normalized profile from features ---
    
    # Task-type base profiles (provide meaningful floors for each category)
    task_base = {
        "architecture_design":     {"complexity": 0.85, "reasoning": 0.90, "output": 0.80, "context": 0.70},
        "code_review":             {"complexity": 0.75, "reasoning": 0.85, "output": 0.70, "context": 0.50},
        "code_generation":         {"complexity": 0.70, "reasoning": 0.75, "output": 0.75, "context": 0.40},
        "summarization":           {"complexity": 0.35, "reasoning": 0.30, "output": 0.40, "context": 0.20},
        "complex_reasoning":       {"complexity": 0.80, "reasoning": 0.95, "output": 0.70, "context": 0.30},
        "general_query":           {"complexity": 0.40, "reasoning": 0.45, "output": 0.50, "context": 0.25},
    }
    base = task_base.get(task_type, task_base["general_query"])

    # Complexity: base + feature adjustments
    complexity = min(1.0, base["complexity"] + 0.15 * (
        input_length_score + instruction_complexity + context_complexity + code_ratio
    ))

    # Reasoning requirement: base + feature adjustments
    reasoning_requirement = min(1.0, base["reasoning"] + 0.10 * (
        reasoning_indicator + instruction_complexity + question_complexity
    ))

    # Context complexity: base + feature
    context_complexity_norm = min(1.0, base["context"] + 0.20 * context_complexity)

    # Output complexity: base + feature adjustments
    est_output_tokens = max(50, min(2000, int(
        100 + word_count * 1.5 +
        instruction_count * 30 +
        reasoning_hits * 40 +
        (500 if structured_score > 0.5 else 0)
    )))
    output_complexity = min(1.0, base["output"] + 0.15 * (
        structured_score + min(1.0, est_output_tokens / 1000.0) + reasoning_indicator
    ))

    # Instruction complexity: already computed (but ensure minimum for task types)
    instruction_complexity_norm = max(instruction_complexity, 0.3 if task_type in ("architecture_design", "code_generation", "code_review") else 0.1)

    # Sensitivity estimates (for routing objectives)
    latency_sensitivity = max(0.1, 1.0 - 0.5 * complexity - 0.3 * reasoning_requirement)
    cost_sensitivity = max(0.1, 1.0 - 0.4 * complexity - 0.3 * reasoning_requirement - 0.2 * structured_score)

    # Context requirement for routing (token budget awareness)
    context_requirement = min(1.0, max(0.1, estimated_input_tokens / 8000.0))

    return {
        "task_type": task_type,
        "complexity": round(complexity, 2),
        "reasoning_requirement": round(reasoning_requirement, 2),
        "context_requirement": round(context_requirement, 2),
        "context_complexity": round(context_complexity_norm, 2),
        "output_complexity": round(output_complexity, 2),
        "instruction_complexity": round(instruction_complexity_norm, 2),
        "estimated_input_tokens": estimated_input_tokens,
        "estimated_output_tokens": est_output_tokens,
        "analysis_method": "feature_based_heuristics",
        # Debug features (optional, for observability)
        "_features": {
            "input_length_score": round(input_length_score, 2),
            "code_ratio": round(code_ratio, 2),
            "instruction_count": instruction_count,
            "question_count": question_count,
            "structured_score": round(structured_score, 2),
            "reasoning_indicator": round(reasoning_indicator, 2),
            "context_complexity_raw": round(context_complexity, 2),
            "task_scores": {k: round(v, 2) for k, v in task_scores.items()},
        }
    }

def validate_intelligence_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    """Ensures intelligence fields exist and are within valid bounds [0.0, 1.0]."""
    def clamp(val, default=0.5):
        try:
            v = float(val)
            return max(0.0, min(1.0, v))
        except (ValueError, TypeError):
            return default

    return {
        "task_type": str(data.get("task_type", "general_query")),
        "complexity": clamp(data.get("complexity"), 0.5),
        "reasoning_requirement": clamp(data.get("reasoning_requirement"), 0.5),
        "context_requirement": clamp(data.get("context_requirement"), 0.2),
        "context_complexity": clamp(data.get("context_complexity"), 0.5),
        "expected_output_complexity": clamp(data.get("output_complexity"), 0.5),
        "output_complexity": clamp(data.get("output_complexity"), 0.5),
        "instruction_complexity": clamp(data.get("instruction_complexity"), 0.5),
        "latency_sensitivity": clamp(data.get("latency_sensitivity"), 0.5),
        "cost_sensitivity": clamp(data.get("cost_sensitivity"), 0.5),
        "estimated_input_tokens": int(data.get("estimated_input_tokens", 100)),
        "estimated_output_tokens": int(data.get("estimated_output_tokens", 300)),
        "analysis_method": str(data.get("analysis_method", "heuristic"))
    }

def analyze_request(prompt: str) -> Dict[str, Any]:
    """Analyzes request prompt using feature-based heuristic engine with JSON validation."""
    raw = analyze_request_heuristics(prompt)
    return validate_intelligence_payload(raw)