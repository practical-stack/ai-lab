# Pattern: Self-Referential Persistence Loop

**Difficulty:** Intermediate
**Impact:** High
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-5-self-referential-persistence-loop-ralph)

---

## Problem
Agents stop too early, producing partial work and claiming success.

## Solution
Loop that re-invokes the agent with continuation context. Terminates only when a completion token is emitted after peer verification.

## Implementation

### Completion Token
Agent must output `<promise>TOKEN</promise>` only after architect verification approves.

### Loop Logic
```
1. Agent works on task
2. Scan for <promise> token
3. Not found → re-invoke with "Continue working"
4. Found → architect verification
5. Approved → exit loop
6. Rejected → continue loop with feedback
```

### Escape Hatch
Max iterations (100) to prevent infinite loops. Max verification attempts (3) before force-accept.

### State Cleanup
DELETE state files on completion (not `active: false`).

## Verification
- [ ] Loop re-invokes on missing completion token
- [ ] Architect verification gates completion
- [ ] Max iteration limit prevents infinite loops
- [ ] State files deleted (not flagged) on completion

## See Also
- [Evidence-Gated Completion](./03-evidence-gated-completion.md) — Inner verification pattern
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-5-self-referential-persistence-loop-ralph)
