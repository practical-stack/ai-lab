# Pattern: Worker Preamble

**Difficulty:** Beginner
**Impact:** High
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-2-worker-preamble-anti-recursion-guard)

---

## Problem

Workers inherit the global system prompt that says "delegate everything." They try to spawn sub-agents, creating recursive delegation chains.

## Solution

Prepend a short preamble to every worker task that overrides the global delegation instruction.

## Implementation

### Step 1: Create the Preamble

```typescript
const WORKER_PREAMBLE = `CONTEXT: You are a WORKER agent, not an orchestrator.
RULES:
- Complete ONLY the task described below
- Use tools directly (Read, Write, Edit, Bash, etc.)
- Do NOT spawn sub-agents
- Do NOT call TaskCreate or TaskUpdate
- Report your results with absolute file paths
TASK:
`;
```

### Step 2: Prepend to Every Delegation

```typescript
function delegateToWorker(task: string, agent: string) {
  return spawnAgent({
    agent,
    prompt: WORKER_PREAMBLE + task,
  });
}
```

### Step 3: Block the Task Tool

For maximum safety, also block the Task tool:
```yaml
disallowedTools: Task
```

## Verification

- [ ] Every worker delegation includes the preamble
- [ ] Workers cannot spawn sub-agents (test by requesting delegation)
- [ ] Worker Task tool is blocked via agent definition

## Common Mistakes

| Mistake | Why Wrong | Correct Approach |
|---------|-----------|------------------|
| Preamble in agent definition only | Global prompt overrides it | Prepend at call site |
| No Task tool blocking | Worker can still technically delegate | Add `disallowedTools: Task` |
| Preamble too far from task | Model may ignore distant instructions | Place immediately before task |

## See Also

- [Capability Fence](./01-capability-fence.md) — Broader tool restriction pattern
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-2-worker-preamble-anti-recursion-guard)
