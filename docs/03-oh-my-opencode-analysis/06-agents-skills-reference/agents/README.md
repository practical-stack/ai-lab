# Core Agents Reference

This directory documents how oh-my-opencode implements its agent system.

---

## Agent Overview

| Agent | Cost | Mode | Model | Primary Role |
|-------|------|------|-------|--------------|
| [Sisyphus](./sisyphus.md) | EXPENSIVE | Primary | claude-opus-4-5 | Main workflow orchestration |
| [Atlas](./atlas.md) | EXPENSIVE | Primary | claude-opus-4-5 | Plan execution orchestration |
| [Sisyphus Junior](./sisyphus-junior.md) | MODERATE | Subagent | (category-based) | Focused task execution |
| [Prometheus](./prometheus.md) | EXPENSIVE | Subagent | claude-opus-4-5 | Strategic planning (interview) |
| [Oracle](./oracle.md) | EXPENSIVE | Read-only | gpt-5.2 | Strategic advisor, debugging |
| [Explore](./explore.md) | FREE | Read-only | gpt-5-nano | Codebase parallel search |
| [Librarian](./librarian.md) | CHEAP | Read-only | big-pickle | External docs/OSS search |
| [Metis](./metis.md) | EXPENSIVE | Read-only | claude-sonnet-4-5 | Intent classification, pre-planning |
| [Momus](./momus.md) | EXPENSIVE | Read-only | claude-sonnet-4-5 | Plan review (4 criteria) |
| [Multimodal Looker](./multimodal-looker.md) | CHEAP | Read-only | claude-sonnet-4-5 | Image/PDF analysis |

---

## Agent Selection Guide

### By Scenario

| Scenario | Agent |
|----------|-------|
| Default orchestration mode | sisyphus |
| "How does X work in our codebase?" | explore |
| "How does this library work?" | librarian |
| "I'm stuck after 2+ failed attempts" | oracle |
| "Plan this complex task" | prometheus |
| "Review this plan before I start" | momus |
| "What's the hidden intent here?" | metis |
| "Execute this work plan" | atlas |
| "Do this specific task" | sisyphus-junior |
| "What's in this screenshot?" | multimodal-looker |

### By Cost Consideration

| Need | Cheap | Moderate | Expensive |
|------|-------|----------|-----------|
| Code search | explore, librarian | - | - |
| Deep analysis | - | - | oracle, metis |
| Planning | - | - | prometheus |
| Plan review | - | - | momus |
| Orchestration | - | - | sisyphus, atlas |
| Task execution | - | sisyphus-junior | - |
| Media analysis | multimodal-looker | - | - |

---

## Key Design Patterns

### 1. Expensive Agents = Read-Only

Oracle, Metis, Momus can ONLY advise. They cannot modify code.

```typescript
const restrictions = createAgentToolRestrictions([
  "write", "edit", "task", "delegate_task",  // All forbidden
])
```

**Why:** Prevents expensive mistakes. Forces deliberate handoff.

### 2. Cheap Agents = Parallel Execution

Explore and Librarian should always run with `run_in_background=true`:

```typescript
delegate_task(subagent_type="explore", run_in_background=true, ...)
delegate_task(subagent_type="librarian", run_in_background=true, ...)
```

**Why:** They're cheap. Fire liberally for parallel reconnaissance.

### 3. Agent Factory Pattern

All agents follow `createXxxAgent()`:

```typescript
export function createOracleAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([...])
  
  return {
    description: "...",
    mode: "subagent" as const,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: ORACLE_SYSTEM_PROMPT,
    thinking: { type: "enabled", budgetTokens: 32000 },
  }
}
```

---

## Common Configuration

| Property | Common Value | Purpose |
|----------|--------------|---------|
| `mode` | `"subagent"` | Not primary orchestrator |
| `temperature` | `0.1` | Deterministic output |
| `thinking` | `{ budgetTokens: 32000 }` | Extended reasoning (expensive agents) |

---

## Reading Order

For studying the agent system:

1. **sisyphus.md** - Primary orchestrator pattern (v3.1+)
2. **oracle.md** - Read-only advisor pattern
3. **explore.md** - Cheap parallel agent pattern
4. **atlas.md** - Plan executor orchestrator pattern
5. **sisyphus-junior.md** - Focused task executor (v3.1+)
6. **prometheus.md** - Interview-based planner (v3.1+)
7. Others as needed
