---
title: "Claude Code Skill Activation Reliability"
description: "A practical course on measuring and improving Claude Code skill activation rates using hooks, sandboxed evals, and the forced-eval commitment mechanism"
type: index
tags: [AI, Testing, BestPractice]
related: [./README.ko.md]
---

# Claude Code Skill Activation Reliability

> Measure and fix the 50% skill activation problem with hooks, sandboxed evals, and a commitment mechanism

## Course Overview

Claude Code skills are powerful — but unreliable. Even with skills properly configured, Claude skips them roughly half the time, jumping straight to implementation without loading domain knowledge. This course teaches you why that happens and how to fix it.

You'll learn the full pipeline: understanding the activation-vs-selection distinction, configuring hook mechanisms, building a sandboxed evaluation harness with Daytona, analyzing results across ~250 invocations, and deploying the winning solution (forced-eval hook: 100% activation, 0% false positives). The research cost $5.59 total and produced actionable, reproducible findings.

This course is based on empirical research by Scott Spence, testing five different hook configurations against Claude Code's `claude -p` CLI in isolated Daytona sandboxes.

## Who This Is For

- **Claude Code users** who've noticed skills don't always activate
- **AI tool builders** designing skill/plugin systems for LLMs
- **Prompt engineers** interested in commitment mechanisms and structured prompting
- **DevOps engineers** wanting to build reproducible LLM evaluation pipelines

## Prerequisites

- Basic Claude Code usage (skills, `.claude/settings.json`)
- Familiarity with shell scripting (bash)
- Understanding of JSON/JSONL formats
- Optional: TypeScript and Docker/sandbox knowledge (for Module 3)

---

## Course Modules

| # | Module | Duration | Description |
|---|--------|----------|-------------|
| 1 | [The Problem & Baseline](./01-problem-and-baseline.en.md) | 20 min | Why skills fail to activate, keyword vs semantic matching, model differences |
| 2 | [Hook Configurations](./02-hook-configurations.en.md) | 25 min | Five hook approaches dissected: from no-op to forced-eval to LLM-eval |
| 3 | [The Eval Harness](./03-eval-harness.en.md) | 30 min | Building reproducible LLM evals with Daytona sandboxes and JSONL parsing |
| 4 | [Results & Analysis](./04-results-analysis.en.md) | 25 min | Data-driven comparison across configs, false positive analysis, variance |
| 5 | [Implementation Guide](./05-implementation-guide.en.md) | 20 min | Step-by-step forced-eval setup for your own projects |

**Total Time:** ~2 hours

---

## Learning Path

### Quick Fix Track (Modules 1, 2, 5)

If you just want to fix skill activation now:

```
Module 1: The Problem
    │
    │  Learn: Why skills don't activate
    │  Understand: Activation ≠ Selection
    │
    ▼
Module 2: Hook Configurations
    │
    │  Learn: What forced-eval does
    │  Compare: 5 approaches
    │
    ▼
Module 5: Implementation Guide
    │
    │  Do: Set up forced-eval hook
    │  Test: Verify activation
    │
    ▼
Skills always activate!
```

### Deep Dive Track (All Modules)

If you want to understand the methodology and build your own evals:

```
Module 1: The Problem & Baseline
    │
    ▼
Module 2: Hook Configurations
    │
    ▼
Module 3: The Eval Harness
    │
    │  Build: Daytona sandbox pipeline
    │  Parse: JSONL stream output
    │
    ▼
Module 4: Results & Analysis
    │
    │  Analyze: 250+ invocations
    │  Compare: Standard vs edge cases
    │
    ▼
Module 5: Implementation Guide
    │
    ▼
Build your own LLM evals!
```

---

## Quick Reference

### The Core Problem

| Aspect | Finding |
|--------|---------|
| **Baseline activation** | ~50-55% (Sonnet 4.5) |
| **Haiku activation** | ~0% (too small for skills) |
| **Root cause** | Keyword matching, not semantic understanding |
| **Key insight** | Activation ≠ Selection (always picks correctly *when* it activates) |

### Hook Comparison

| Config | Activation | False Positives | Latency | Verdict |
|--------|-----------|-----------------|---------|---------|
| none | 50-55% | N/A | 8.7s | Baseline |
| simple | 50-59% | N/A | 8.6s | No improvement |
| **forced-eval** | **100%** | **0%** | 10.7s | **Winner** |
| llm-eval | 100% | 80% (edge) | 6.4s | Fast but hallucinates |
| type-prompt | 41-55% | N/A | 9.6s | Useless |

### The Winning Solution

```bash
# .claude/hooks/force-eval.sh
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE
Step 1 - EVALUATE: For each skill, state [skill-name] - YES/NO - [reason]
Step 2 - ACTIVATE: Call Skill() for YES skills
Step 3 - IMPLEMENT: Only after Step 2 complete
CRITICAL: You MUST call Skill() in Step 2. Do NOT skip to implementation.
EOF
```

---

## Source Materials

| Source | Description |
|--------|-------------|
| [Research Article](https://scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals) | Scott Spence's original research (Feb 2026) |
| [svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) | Reference implementation with hooks |
| [Research Notes](../research/) | Local research analysis |

---

## Key Terminology

| Term | Definition |
|------|------------|
| **Skill** | Reusable domain knowledge loaded by Claude Code via `Skill()` tool |
| **Activation** | Whether Claude calls `Skill()` at all |
| **Selection** | Which skill Claude picks (always correct when activated) |
| **Hook** | Script triggered by Claude Code events (e.g., `UserPromptSubmit`) |
| **Forced-eval** | 3-step commitment mechanism: evaluate → activate → implement |
| **Daytona** | Sandboxed development environment for reproducible testing |
| **JSONL** | Line-delimited JSON format used by `claude -p --output-format stream-json` |

---

## Version

- **v1.0.0** — Initial release (February 2026)
- Based on empirical research: ~250 invocations, $5.59 total cost
