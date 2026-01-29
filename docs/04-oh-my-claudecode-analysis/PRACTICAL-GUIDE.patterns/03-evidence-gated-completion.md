# Pattern: Evidence-Gated Completion

**Difficulty:** Beginner
**Impact:** Critical
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-4-evidence-gated-completion)

---

## Problem

LLM agents claim "done" based on belief rather than evidence. They use hedging language and move on without running verification.

## Solution

Require agents to run verification commands and present evidence before claiming completion. Add metacognitive self-monitoring for hedging language.

## Implementation

### Step 1: Add the Iron Law to Every Agent

```markdown
## Verification Protocol

Before saying "done", "fixed", or "complete":
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the verification command
3. READ: Check the output — did it pass?
4. ONLY THEN: Make the claim WITH evidence
```

### Step 2: Add Red Flag Detection

```markdown
Red Flags (STOP and verify):
- Using "should", "probably", "seems to"
- Expressing satisfaction before running verification
- Claiming completion without fresh test/build output
```

### Step 3: Define Evidence-to-Claim Mapping

```markdown
| Claim | Required Evidence |
|-------|-------------------|
| "Fixed" | Test showing it passes now |
| "Implemented" | Build passes + diagnostics clean |
| "Refactored" | All existing tests still pass |
| "Debugged" | Root cause identified with file:line |
```

### Step 4: Add Freshness Window (Optional)

For TypeScript systems:
```typescript
const EVIDENCE_FRESHNESS_WINDOW = 5 * 60 * 1000; // 5 minutes
```

## Verification

- [ ] Every agent prompt includes the Iron Law
- [ ] Red flag language list is present
- [ ] Evidence-to-claim mapping table exists
- [ ] Agents present actual command output when claiming completion

## Common Mistakes

| Mistake | Why Wrong | Correct Approach |
|---------|-----------|------------------|
| Verification at end only | Missed intermediate failures | Verify after each major step |
| No freshness window | Stale evidence accepted | Add 5-minute staleness check |
| Generic "all tests pass" | No actual output shown | Require exact command + output |

## See Also

- [Persistence Loop](./06-persistence-loop.md) — Uses this pattern as inner verification
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-4-evidence-gated-completion)
