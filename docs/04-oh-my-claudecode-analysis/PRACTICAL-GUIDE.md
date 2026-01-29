# Practical Guide: Applying oh-my-claudecode Patterns

**Document:** PRACTICAL-GUIDE.md
**Part of:** oh-my-claudecode Analysis
**Purpose:** Complete synthesis of all patterns into actionable adoption steps

---

## Overview

This guide synthesizes insights from ALL analysis documents into actionable steps. Read the numbered documents (00-05) first to understand the "why", then use this guide for the "how."

**Prerequisite Reading:**
- [00-core-philosophy.md](./00-core-philosophy.md) — WHY these patterns exist
- [01-architecture.md](./01-architecture.md) — WHAT the system looks like
- [02-design-patterns.md](./02-design-patterns.md) — HOW patterns work

---

## Adoption Path

### Level 1: Quick Wins

Start here. Immediate impact with minimal effort.

| # | Pattern | Impact | Guide |
|---|---------|--------|-------|
| 1 | Capability Fence | High | [01-capability-fence.md](./PRACTICAL-GUIDE.patterns/01-capability-fence.md) |
| 2 | Worker Preamble | High | [02-worker-preamble.md](./PRACTICAL-GUIDE.patterns/02-worker-preamble.md) |
| 3 | Evidence-Gated Completion | Critical | [03-evidence-gated-completion.md](./PRACTICAL-GUIDE.patterns/03-evidence-gated-completion.md) |
| 4 | Structured Output Templates | Medium | [04-structured-output.md](./PRACTICAL-GUIDE.patterns/04-structured-output.md) |

### Level 2: Foundation

Build the infrastructure for reliable multi-agent operations.

| # | Pattern | Impact | Guide |
|---|---------|--------|-------|
| 5 | Tiered Model Routing | High | [05-tiered-routing.md](./PRACTICAL-GUIDE.patterns/05-tiered-routing.md) |
| 6 | Self-Referential Persistence Loop | High | [06-persistence-loop.md](./PRACTICAL-GUIDE.patterns/06-persistence-loop.md) |
| 7 | Multi-Agent Consensus Loop | High | [07-consensus-loop.md](./PRACTICAL-GUIDE.patterns/07-consensus-loop.md) |
| 8 | Intent-Triggered Activation | Medium | [08-intent-activation.md](./PRACTICAL-GUIDE.patterns/08-intent-activation.md) |

### Level 3: Full System

Complete the system with advanced patterns.

| # | Pattern | Impact | Guide |
|---|---------|--------|-------|
| 9 | File Ownership Partitioning | High | [09-file-ownership.md](./PRACTICAL-GUIDE.patterns/09-file-ownership.md) |
| 10 | Phased Autonomous Pipeline | High | [10-autonomous-pipeline.md](./PRACTICAL-GUIDE.patterns/10-autonomous-pipeline.md) |
| 11 | Atomic Task Claiming | Medium | [11-task-claiming.md](./PRACTICAL-GUIDE.patterns/11-task-claiming.md) |
| 12 | Priority Context Injection | Medium | [12-context-injection.md](./PRACTICAL-GUIDE.patterns/12-context-injection.md) |

---

## Decision Framework

| Problem | Pattern |
|---------|---------|
| Agent modifies files it shouldn't | [Capability Fence](./PRACTICAL-GUIDE.patterns/01-capability-fence.md) |
| Worker spawns sub-agents recursively | [Worker Preamble](./PRACTICAL-GUIDE.patterns/02-worker-preamble.md) |
| Agent claims "done" without proof | [Evidence-Gated Completion](./PRACTICAL-GUIDE.patterns/03-evidence-gated-completion.md) |
| Expensive model used for simple tasks | [Tiered Model Routing](./PRACTICAL-GUIDE.patterns/05-tiered-routing.md) |
| Agent stops before task is complete | [Persistence Loop](./PRACTICAL-GUIDE.patterns/06-persistence-loop.md) |
| Parallel agents create merge conflicts | [File Ownership](./PRACTICAL-GUIDE.patterns/09-file-ownership.md) |
| Multiple agents duplicate work | [Task Claiming](./PRACTICAL-GUIDE.patterns/11-task-claiming.md) |
| Single-perspective planning blind spots | [Consensus Loop](./PRACTICAL-GUIDE.patterns/07-consensus-loop.md) |
| Static prompt lacks file context | [Context Injection](./PRACTICAL-GUIDE.patterns/12-context-injection.md) |
| Complex task needs end-to-end automation | [Autonomous Pipeline](./PRACTICAL-GUIDE.patterns/10-autonomous-pipeline.md) |
| Users must learn commands | [Intent Activation](./PRACTICAL-GUIDE.patterns/08-intent-activation.md) |
| Agents pass unstructured data | [Structured Output](./PRACTICAL-GUIDE.patterns/04-structured-output.md) |

---

## Quick Start: Minimal Viable Adoption

If you only have 30 minutes, implement these three patterns:

### 1. Capability Fence

Add `disallowedTools` to your agent definitions and mirror the restriction in the prompt:
```yaml
---
name: my-reviewer
disallowedTools: Write, Edit
---
YOU ARE READ-ONLY. You analyze but never modify.
FORBIDDEN: Write tool, Edit tool.
```

### 2. Worker Preamble

Prepend this to every worker task:
```
CONTEXT: You are a WORKER agent, not an orchestrator.
- Complete ONLY the task below
- Use tools directly
- Do NOT spawn sub-agents
TASK:
```

### 3. Evidence-Gated Completion

Add this to every agent's prompt:
```markdown
Before saying "done":
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the command
3. READ: Did it actually pass?
4. ONLY THEN: Claim completion with evidence

Red Flags (STOP and verify):
- Using "should", "probably", "seems to"
- Claiming completion without fresh output
```

**These three changes will transform agent reliability immediately.**

---

## Summary: The 80/20 Rule

| Priority | Patterns | Expected Outcome |
|----------|----------|------------------|
| **Do First** | Capability Fence, Worker Preamble, Evidence-Gated Completion | Reliable agent behavior, no role drift |
| **Do Second** | Tiered Routing, Persistence Loop, Consensus Loop | Cost optimization, task completion, quality planning |
| **Full Adoption** | File Ownership, Pipeline, Task Claiming, Context Injection | Enterprise-grade multi-agent orchestration |

---

## Pattern Index

For detailed implementation of each pattern, see [PRACTICAL-GUIDE.patterns/](./PRACTICAL-GUIDE.patterns/).

---

## See Also

- [README.md](./README.md) — Analysis overview
- [00-core-philosophy.md](./00-core-philosophy.md) — Philosophy behind patterns
- [01-architecture.md](./01-architecture.md) — System architecture
- [02-design-patterns.md](./02-design-patterns.md) — Pattern details
