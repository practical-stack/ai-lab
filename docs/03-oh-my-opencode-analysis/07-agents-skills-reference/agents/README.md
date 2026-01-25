# Core Agents Reference

This directory documents how oh-my-opencode implements its agent system.

---

## Agent Overview

| Agent | Cost | Mode | Primary Role |
|-------|------|------|--------------|
| [Atlas](./atlas.md) | EXPENSIVE | Primary | Task orchestration |
| [Oracle](./oracle.md) | EXPENSIVE | Read-only | Strategic advisor, debugging |
| [Explore](./explore.md) | FREE | Read-only | Codebase parallel search |
| [Librarian](./librarian.md) | CHEAP | Read-only | External docs/OSS search |
| [Metis](./metis.md) | EXPENSIVE | Read-only | Intent classification, pre-planning |
| [Momus](./momus.md) | EXPENSIVE | Read-only | Plan review (4 criteria) |
| [Multimodal Looker](./multimodal-looker.md) | CHEAP | Read-only | Image/PDF analysis |

---

## Agent Selection Guide

### By Scenario

| Scenario | Agent |
|----------|-------|
| "How does X work in our codebase?" | explore |
| "How does this library work?" | librarian |
| "I'm stuck after 2+ failed attempts" | oracle |
| "Review this plan before I start" | momus |
| "What's the hidden intent here?" | metis |
| "Execute this todo list" | atlas |
| "What's in this screenshot?" | multimodal-looker |

### By Cost Consideration

| Need | Cheap | Expensive |
|------|-------|-----------|
| Code search | explore, librarian | - |
| Deep analysis | - | oracle, metis |
| Plan review | - | momus |
| Orchestration | - | atlas |
| Media analysis | multimodal-looker | - |

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

1. **oracle.md** - Read-only advisor pattern
2. **explore.md** - Cheap parallel agent pattern
3. **atlas.md** - Orchestrator pattern (most complex)
4. Others as needed
