# Oh-My-OpenCode Repository Analysis

**Analyzed:** 2026-01-25  
**Repository:** `code-yeongyu/oh-my-opencode` (v3.0.1)  
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
[04-practical-guide]     ← APPLY: How to adopt these patterns
    ↓
[05-prompt-engineering]  ← CRAFT: Prompt techniques in detail
    ↓
[06-eval-methodology]    ← VERIFY: Testing and verification methods
    ↓
[07-agents-skills-ref]   ← REFERENCE: Detailed agent/skill examples
```

### Quick Navigation by Goal

| If you want to... | Read this |
|-------------------|-----------|
| Understand the philosophy | [00-core-philosophy.md](./00-core-philosophy.md) |
| See the system architecture | [01-architecture.md](./01-architecture.md) |
| Learn reusable patterns | [02-design-patterns.md](./02-design-patterns.md) |
| Know what NOT to do | [03-anti-patterns.md](./03-anti-patterns.md) |
| Apply these patterns to your project | [04-practical-guide.md](./04-practical-guide.md) |
| Master prompt engineering | [05-prompt-engineering.md](./05-prompt-engineering.md) |
| Implement verification systems | [06-eval-methodology.md](./06-eval-methodology.md) |
| See concrete agent/skill examples | [07-agents-skills-reference/](./07-agents-skills-reference/) |

---

## Document Index

| # | Document | Role | Key Insight |
|---|----------|------|-------------|
| 00 | [Core Philosophy](./00-core-philosophy.md) | WHY | "Human intervention = failure" |
| 01 | [Architecture](./01-architecture.md) | WHAT | Three-layer system: Planning → Orchestration → Workers |
| 02 | [Design Patterns](./02-design-patterns.md) | HOW | 7-section delegation, session continuity, BLOCKING checkpoints |
| 03 | [Anti-Patterns](./03-anti-patterns.md) | AVOID | `as any`, trusting "done", sequential agents |
| 04 | [Practical Guide](./04-practical-guide.md) | APPLY | Step-by-step adoption path for your project |
| 05 | [Prompt Engineering](./05-prompt-engineering.md) | CRAFT | XML tags, mandatory outputs, dynamic generation |
| 06 | [Evaluation Methodology](./06-eval-methodology.md) | VERIFY | Todo Enforcer, Comment Checker, evidence requirements |
| 07 | [Agents & Skills Reference](./07-agents-skills-reference/) | REFERENCE | Full examples of agents and skills |

---

## Three Core Mechanisms (TL;DR)

If you only remember three things:

### 1. BLOCKING Checkpoints
Force the AI to output analysis BEFORE proceeding. Prevents skipping important steps.

### 2. Never Trust "Done"
System verifies completion independently. Agents lie (or are optimistic).

### 3. Complete Context Transfer
Subagents are stateless. Your delegation prompt must include EVERYTHING.

**For details, see [04-practical-guide.md](./04-practical-guide.md).**

---

## Source Files Referenced

| Category | Key Files |
|----------|-----------|
| Philosophy | `docs/ultrawork-manifesto.md` |
| Main Agent | `sisyphus-prompt.md` (738 lines) |
| Verification | `src/hooks/todo-continuation-enforcer.ts` (489 lines) |
| Skills | `src/features/builtin-skills/git-master/SKILL.md` (1100+ lines) |
| Delegation | `src/tools/delegate-task/tools.ts` (1039 lines) |

---

## Summary

Oh-My-OpenCode is not just a tool - it's a **methodology** for building AI agent systems that actually complete work autonomously. The core insight is simple: **don't trust AI agents to self-report completion; build verification into the system itself.**

Start with [00-core-philosophy.md](./00-core-philosophy.md) to understand the "why", then progress through the documents to learn the "how".
