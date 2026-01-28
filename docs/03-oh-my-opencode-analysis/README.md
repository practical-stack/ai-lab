# Oh-My-OpenCode Repository Analysis

**Analyzed:** 2026-01-28  
**Repository:** `code-yeongyu/oh-my-opencode` (v3.1.3)  
**Depth Level:** Deep

---

## The One-Liner

> "Human intervention is a failure signal - agents should complete work without babysitting, producing code indistinguishable from a senior engineer's."

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
[06-agents-skills-ref]   ← REFERENCE: Detailed agent/skill examples
    ↓
[PRACTICAL-GUIDE]        ← APPLY: Synthesis of all patterns
    ↓
[PRACTICAL-GUIDE.patterns/] ← IMPLEMENT: Step-by-step pattern guides
```

### Quick Navigation by Goal

| If you want to... | Read this |
|-------------------|-----------|
| Understand the philosophy | [00-core-philosophy.md](./00-core-philosophy.md) |
| See the system architecture | [01-architecture.md](./01-architecture.md) |
| Learn reusable patterns | [02-design-patterns.md](./02-design-patterns.md) |
| Know what NOT to do | [03-anti-patterns.md](./03-anti-patterns.md) |
| Master prompt engineering | [04-prompt-engineering.md](./04-prompt-engineering.md) |
| Implement verification systems | [05-eval-methodology.md](./05-eval-methodology.md) |
| See concrete agent/skill examples | [06-agents-skills-reference/](./06-agents-skills-reference/) |
| Apply patterns to your project | [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) |
| Get step-by-step implementation | [PRACTICAL-GUIDE.patterns/](./PRACTICAL-GUIDE.patterns/) |

---

## Document Index

| # | Document | Role | Key Insight |
|---|----------|------|-------------|
| 00 | [Core Philosophy](./00-core-philosophy.md) | WHY | "Human intervention = failure" |
| 01 | [Architecture](./01-architecture.md) | WHAT | Three-layer system: Planning → Orchestration → Workers |
| 02 | [Design Patterns](./02-design-patterns.md) | HOW | 7-section delegation, session continuity, BLOCKING checkpoints |
| 03 | [Anti-Patterns](./03-anti-patterns.md) | AVOID | `as any`, trusting "done", sequential agents |
| 04 | [Prompt Engineering](./04-prompt-engineering.md) | CRAFT | XML tags, mandatory outputs, dynamic generation |
| 05 | [Evaluation Methodology](./05-eval-methodology.md) | VERIFY | Todo Enforcer, Comment Checker, evidence requirements |
| 06 | [Agents & Skills Reference](./06-agents-skills-reference/) | REFERENCE | Full examples of agents and skills |
| - | [Practical Guide](./PRACTICAL-GUIDE.md) | APPLY | Step-by-step adoption path |
| - | [Pattern Index](./PRACTICAL-GUIDE.patterns/) | IMPLEMENT | 14 detailed pattern guides |

---

## Three Core Mechanisms (TL;DR)

If you only remember three things:

### 1. BLOCKING Checkpoints
Force the AI to output analysis BEFORE proceeding. Prevents skipping important steps.

### 2. Never Trust "Done"
System verifies completion independently. Agents lie (or are optimistic).

### 3. Complete Context Transfer
Subagents are stateless. Your delegation prompt must include EVERYTHING.

**For implementation details, see [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md).**

---

## Source Files Referenced

| Category | Key Files |
|----------|-----------|
| Philosophy | `docs/ultrawork-manifesto.md` |
| Main Agent | `sisyphus-prompt.md` (auto-generated) |
| Verification | `src/hooks/todo-continuation-enforcer.ts` |
| Skills | `src/features/builtin-skills/git-master/SKILL.md` (1100+ lines) |
| Delegation | `src/tools/delegate-task/tools.ts` |
| Agents | `src/agents/*.ts` (10 agent factories) |
| Hooks | `src/hooks/` (32+ TypeScript hooks) |
| Tools | `src/tools/` (12+ tool modules) |
| MCPs | `src/mcp/` (websearch, context7, grep_app) |

---

## Summary

Oh-My-OpenCode is not just a tool - it's a **methodology** for building AI agent systems that actually complete work autonomously. The core insight is simple: **don't trust AI agents to self-report completion; build verification into the system itself.**

Start with [00-core-philosophy.md](./00-core-philosophy.md) to understand the "why", then progress through the documents to learn the "how", and finally use [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) to apply the patterns.
