---
title: "Skill Activation Eval"
description: "Research on measuring and improving Claude Code skill activation reliability using sandboxed evaluations and hook mechanisms"
type: index
tags: [AI, Claude, Skills, Testing]
order: 6
related: [./README.ko.md]
---

# Skill Activation Eval

> Measuring and improving Claude Code skill activation reliability through sandboxed evaluations

## Problem Statement

Claude Code skills don't auto-activate reliably. Even when skills are properly configured, Claude often skips them and proceeds directly to implementation. This research explores hook mechanisms that force explicit skill evaluation before acting.

## Key Findings

| Hook Config | Activation Rate | False Positive Rate | Latency |
|-------------|----------------|---------------------|---------|
| None (baseline) | ~50-55% | N/A | 8.7s |
| Simple echo | ~50-59% | N/A | 8.6s |
| **Forced-eval** | **100%** | **0%** | 10.7s |
| LLM-eval | 100% | 80% (non-matching) | 6.4s |
| Type-prompt | ~41-55% | N/A | 9.6s |

**Winner: Forced-eval hook** — 100% activation, zero false positives, no API key required.

## Core Mechanism: Forced-Eval Hook

```
Step 1 - EVALUATE: For each skill, state YES/NO with reason
Step 2 - ACTIVATE: Call Skill() for all YES skills
Step 3 - IMPLEMENT: Only proceed after activation complete
```

This "commitment mechanism" works bidirectionally:
- Forces activation when skills match
- Forces restraint when they don't (prevents hallucination)

## Quick Reference

### Decision: Which Hook?

| Scenario | Recommendation |
|----------|---------------|
| Straightforward prompts on Sonnet 4.5+ | May not need a hook (50%+ baseline) |
| Reliability required | **Forced-eval** (100%, 0 false positives) |
| Speed priority, domain-specific queries only | LLM-eval (faster, but hallucinates on edge cases) |
| Native prompt hook | Don't bother (same as no hook) |

### Key Insight: Activation ≠ Selection

Claude's problem is purely about **activation** (calling `Skill()` at all), not **selection** (picking the right skill). When it does activate, it always picks correctly.

## Contents

| File | Description |
|------|-------------|
| [`research/`](./research/) | Source article and analysis |
| [`learning/`](./learning/) | Structured learning modules |

## Source

- [Measuring Claude Code Skill Activation With Sandboxed Evals](https://scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals) — Scott Spence, February 8, 2026
- [svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) — Reference implementation with hooks
