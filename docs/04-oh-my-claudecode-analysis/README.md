# oh-my-claudecode Analysis

**Analyzed:** 2026-01-29
**Repository:** `nicobailon/oh-my-claudecode` (v3.7.15)
**Depth Level:** Deep

---

## The One-Liner

> "Transform Claude Code from a solo performer into a conductor of 32 specialized agents — delegating everything, verifying everything, stopping never."

---

## How to Read This Analysis

This analysis is designed for **progressive learning**:

### Learning Path

```
START HERE
    ↓
[00-core-philosophy]     ← WHY: The beliefs that drive everything
    ↓
[01-architecture]        ← WHAT: How the system is structured
    ↓
[02-design-patterns]     ← HOW: Patterns to implement yourself
    ↓
[03-anti-patterns]       ← AVOID: What NOT to do
    ↓
[04-prompt-engineering]  ← CRAFT: Prompt techniques in detail
    ↓
[05-eval-methodology]    ← VERIFY: Testing and verification methods
    ↓
[06-reference]           ← REFERENCE: Detailed agent/skill examples
    ↓
[PRACTICAL-GUIDE]        ← APPLY: Synthesis of all patterns
```

### Quick Navigation by Goal

| If you want to... | Read this |
|---|---|
| Understand the philosophy | [00-core-philosophy.md](./00-core-philosophy.md) |
| See the system architecture | [01-architecture.md](./01-architecture.md) |
| Learn reusable patterns | [02-design-patterns.md](./02-design-patterns.md) |
| Know what NOT to do | [03-anti-patterns.md](./03-anti-patterns.md) |
| Master prompt engineering | [04-prompt-engineering.md](./04-prompt-engineering.md) |
| Implement verification | [05-eval-methodology.md](./05-eval-methodology.md) |
| See concrete examples | [06-agents-skills-reference/](./06-agents-skills-reference/) |
| Apply patterns | [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) |

---

## Document Index

| # | Document | Role | Key Insight |
|---|----------|------|-------------|
| 00 | [Core Philosophy](./00-core-philosophy.md) | WHY | You are a conductor, not a performer — delegate everything, verify everything |
| 01 | [Architecture](./01-architecture.md) | WHAT | Plugin-based orchestration layering hooks, agents, features, and tools |
| 02 | [Design Patterns](./02-design-patterns.md) | HOW | 12 LLM-specific patterns from capability fences to consensus loops |
| 03 | [Anti-Patterns](./03-anti-patterns.md) | AVOID | 16 anti-patterns: premature completion, speculation, recursive delegation |
| 04 | [Prompt Engineering](./04-prompt-engineering.md) | CRAFT | 15 techniques: XML containers, decision tables, calibration backstory |
| 05 | [Evaluation Methodology](./05-eval-methodology.md) | VERIFY | 17 verification systems across the hook lifecycle |
| 06 | [Reference](./06-agents-skills-reference/) | REFERENCE | Deep-dives on 4 agents and 3 skills |
| - | [Practical Guide](./PRACTICAL-GUIDE.md) | APPLY | 3-level adoption path with 12 pattern guides |

---

## Three Core Mechanisms (TL;DR)

### 1. Delegation-First Orchestration

The main Claude session never writes code directly. It delegates all substantive work to 32 specialized agents across 3 model tiers (Haiku/Sonnet/Opus), routing by task complexity. This is enforced through both prompt instructions and tool restrictions.

### 2. Evidence-Gated Verification

No agent can claim "done" without fresh verification evidence. The Iron Law protocol requires: identify the verification command, run it, read the output, then — and only then — make the claim. Evidence has a 5-minute freshness window. Mandatory Architect approval gates all completions.

### 3. Persistent Execution Modes

Multiple execution strategies (autopilot, ralph, ultrawork, ultrapilot, swarm, pipeline, ecomode) provide different approaches to complex tasks. State files persist across conversation turns and sessions, enabling resumption after interruptions.

---

## Source Files Referenced

| Category | Key Files |
|----------|-----------|
| Main Orchestration Prompt | `docs/CLAUDE.md` |
| Agent Definitions | `agents/*.md` (36 files), `src/agents/definitions.ts` |
| Skills | `skills/*/SKILL.md` (37 directories) |
| Commands | `commands/*.md` (31 files) |
| Hook System | `src/hooks/index.ts`, `hooks/*.sh` |
| Feature Modules | `src/features/` (model-routing, verification, state-manager, etc.) |
| MCP Tools | `src/tools/` (LSP, AST, Python REPL), `src/mcp/omc-tools-server.ts` |
| Entry Point | `src/index.ts` — `createSisyphusSession()` |
| Plugin Manifest | `.claude-plugin/plugin.json` |

---

## Summary

oh-my-claudecode is a multi-agent orchestration plugin that transforms Claude Code's single-agent model into a coordinated system of 32 specialized agents. Its core innovation is treating the main LLM session as a conductor that delegates all work, routes tasks to cost-appropriate model tiers, and enforces evidence-based verification before claiming completion. The system's 37 skills provide execution strategies ranging from fully autonomous pipelines to token-efficient parallel processing, all backed by persistent state management that survives session interruptions.

Start with [00-core-philosophy.md](./00-core-philosophy.md) to understand the "why", then progress through the documents to learn the "how."
