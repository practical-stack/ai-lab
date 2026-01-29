# Agents & Skills Reference

**Document:** 06-agents-skills-reference
**Part of:** oh-my-claudecode Analysis
**Source:** `nicobailon/oh-my-claudecode` (v3.7.15)

---

## Overview

This directory contains detailed reference documentation for representative agents and skills from the oh-my-claudecode system.

## Agent Deep-Dives

| Agent | Role | Model | Key Technique |
|-------|------|-------|---------------|
| [architect](./agents/architect.md) | Read-only strategic advisor | Opus | Capability fence + circuit breaker |
| [executor](./agents/executor.md) | Focused task implementer | Sonnet | Worker preamble + todo obsession |
| [planner](./agents/planner.md) | Strategic planning consultant | Opus | Interview workflow + contrastive identity |
| [designer](./agents/designer.md) | UI/UX designer-developer | Sonnet | Anti-AI-slop aesthetic direction |

## Skill Deep-Dives

| Skill | Purpose | Key Pattern |
|-------|---------|-------------|
| [autopilot](./skills/autopilot.md) | Full autonomous execution | 5-phase pipeline composing ralph + ultrawork + ultraqa |
| [ralph](./skills/ralph.md) | Persistent execution loop | Promise-token-gated completion with architect verification |
| [orchestrate](./skills/orchestrate.md) | Core orchestration behavior | Intent gate + delegation protocol + architect verification |

## Cross-Reference Matrix

| Feature | architect | executor | planner | designer |
|---------|-----------|----------|---------|----------|
| Write tools | BLOCKED | Allowed | BLOCKED | Allowed |
| Task tool | Allowed | BLOCKED | BLOCKED | Allowed |
| Verification | Performs it | Must pass it | N/A | Must pass it |
| Identity metaphor | Oracle | Sisyphus-Jr | Prometheus | Designer-coder |
| Circuit breaker | Yes (3 failures) | No | No | No |
| Todo obsession | No | NON-NEGOTIABLE | No | No |
