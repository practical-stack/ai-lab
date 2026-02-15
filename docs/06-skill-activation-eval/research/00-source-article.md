---
title: "Source: Measuring Claude Code Skill Activation With Sandboxed Evals"
description: "Original article by Scott Spence on evaluating skill activation hooks in Claude Code"
type: reference
tags: [AI, Claude, Skills, Testing]
order: 0
---

# Source Article Analysis

> **Author**: Scott Spence
> **Published**: February 8, 2026
> **URL**: https://scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals

## Background

This is the second iteration of Scott Spence's skill activation research. The first round used the Claude Messages API with Haiku 4.5 to simulate Claude Code behavior. This round runs actual `claude -p` commands inside isolated Daytona sandboxes against Sonnet 4.5.

## Experiment Design

### Environment

- **Runtime**: Daytona sandboxes (isolated per config)
- **Model**: Sonnet 4.5 (upgraded from Haiku 4.5)
- **Binary**: Actual Claude Code (`claude -p`)
- **Test cases**: 22 standard + 24 hard prompts
- **Measurement**: 20s window for `Skill()` tool_use events in JSONL stream
- **Cost**: $5.59 total (~250 invocations)

### Five Hook Configurations

#### 1. None (Control)
No hook. Baseline measurement of Sonnet 4.5's natural skill activation behavior.

#### 2. Simple
One-line echo: "If the prompt matches skill keywords, use Skill()." Minimal intervention.

#### 3. Forced-Eval (Winner)
Multi-step bash script using `UserPromptSubmit` hook:

```bash
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Step 1 - EVALUATE (do this in your response):
For each skill in <available_skills>, state: [skill-name] - YES/NO - [reason]

Step 2 - ACTIVATE (do this immediately after Step 1):
IF any skills are YES → Use Skill(skill-name) tool for EACH relevant skill NOW
IF no skills are YES → State "No skills needed" and proceed

Step 3 - IMPLEMENT:
Only after Step 2 is complete, proceed with implementation.

CRITICAL: You MUST call Skill() tool in Step 2. Do NOT skip to implementation.
The evaluation (Step 1) is WORTHLESS unless you ACTIVATE (Step 2) the skills.
EOF
```

#### 4. LLM-Eval
Calls Haiku 3.5 via API to pre-classify which skills match the prompt, then tells Claude to activate those specific ones. Faster but prone to hallucination.

#### 5. Type-Prompt (New)
Uses Claude Code's native `type: "prompt"` hook mechanism instead of shell script. Delivers similar instructions to forced-eval through the built-in system.

## Results

### Run 1: Standard Prompts (22 test cases)

| Config | Activation | Correct | Avg Latency |
|--------|-----------|---------|-------------|
| none | 55% (12/22) | 55% (12/22) | 8.7s |
| simple | 59% (13/22) | 59% (13/22) | 8.6s |
| forced-eval | 100% (22/22) | 100% (22/22) | 10.7s |
| llm-eval | 100% (22/22) | 100% (22/22) | 6.4s |
| type-prompt | 55% (12/22) | 55% (12/22) | 9.6s |

### Run 2: Confirmation

| Config | Run 1 Correct | Run 2 Correct |
|--------|--------------|--------------|
| none | 55% (12/22) | 50% (11/22) |
| simple | 59% (13/22) | 50% (11/22) |
| forced-eval | 100% (22/22) | 100% (22/22) |
| llm-eval | 100% (22/22) | 100% (22/22) |
| type-prompt | 55% (12/22) | 41% (9/22) |

### Hard Prompts: Forced-Eval vs LLM-Eval (24 test cases)

Includes 5 non-Svelte prompts (correct answer = "no skill needed"):

| Metric | forced-eval | llm-eval |
|--------|-------------|----------|
| Overall accuracy | 75% (18/24) | 67% (16/24) |
| True negatives | 100% (5/5) | 20% (1/5) |
| False positives | 0 | 4 |

## Key Insights

### 1. Baseline improvement: 0% → 55%
Sonnet 4.5 activates skills ~55% of the time without any hook, compared to ~0% for Haiku 4.5. This is a model capability difference.

### 2. Activation ≠ Selection
Activation and correctness columns are always identical. Claude never picks the wrong skill — it just sometimes doesn't think to check.

### 3. Claude does keyword matching, not semantic matching
| Prompt style | Baseline activation |
|-------------|-------------------|
| Has explicit keyword (`$state`, `command()`) | ~100% |
| Generic phrasing ("How do form actions work?") | ~20-40% |
| Indirect/conceptual ("My component re-renders too much") | ~0% |

### 4. Forced-eval: commitment mechanism works both ways
- Forces activation when skills match
- Forces restraint when they don't (zero false positives)
- The YES/NO evaluation step creates explicit commitment

### 5. LLM-eval: fast but hallucinates
- 40% faster than forced-eval (6.4s vs 10.7s)
- Perfect on domain-matching prompts
- Recommends skills 80% of the time even when nothing matches
- Small models hallucinate skill names that don't exist

### 6. type-prompt hook is useless
Native `type: "prompt"` hook performs identically to no hook. The prompt gets deprioritized as background noise in the system-reminder.

## Harness Architecture

```
TypeScript orchestrator (@daytonaio/sdk)
    │
    ├── For each hook config:
    │   ├── Create Daytona sandbox with ANTHROPIC_API_KEY
    │   ├── Upload skills (tar'd + extracted)
    │   ├── Upload hook scripts + settings.json
    │   ├── Upload monitor script
    │   │
    │   ├── For each test case (22):
    │   │   ├── Run: timeout -k 5 20 claude -p "$QUERY" \
    │   │   │       --output-format stream-json --verbose \
    │   │   │       --max-turns 1 --allowedTools Skill \
    │   │   │       --permission-mode bypassPermissions
    │   │   └── Parse JSONL for tool_use name="Skill"
    │   │
    │   └── Aggregate results
    │
    └── Tear down sandboxes
```

## Cost Breakdown

| Model | Cost | Purpose |
|-------|------|---------|
| Sonnet 4.5 | $5.20 | Sandbox test runs (`claude -p`) |
| Haiku 4.5 | $0.34 | Harness orchestration |
| Haiku 3.5 | $0.04 | llm-eval pre-classification |
| **Total** | **$5.59** | ~250 invocations |

## References

- [Article URL](https://scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals)
- [Previous article: How to Make Claude Code Skills Activate Reliably](https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably)
- [First discovery: Skills Don't Auto-Activate](https://scottspence.com/posts/claude-code-skills-dont-auto-activate)
- [Hook implementation: svelte-claude-skills repo](https://github.com/spences10/svelte-claude-skills)
