# Pattern: Multi-Agent Consensus Loop

**Difficulty:** Intermediate
**Impact:** High
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-8-multi-agent-consensus-loop-ralplan)

---

## Problem
Single-agent plans have blind spots. Self-critique is unreliable.

## Solution
Three agents (Planner, Architect, Critic) iterate until the Critic approves.

## Implementation
```
1. Planner creates plan
2. Architect answers strategic questions
3. Critic reviews → OKAY or REJECT with feedback
4. If REJECT → Planner refines with feedback (goto 1)
5. Max 5 iterations → force-approve with warning
```

The Critic's review is MANDATORY and cannot be skipped.

### Calibration
Use backstory to set strictness: "Plans from this author average 7 rejections."

## Verification
- [ ] All three roles participate in the loop
- [ ] Critic cannot be bypassed
- [ ] Max iteration limit exists
- [ ] Rejection feedback reaches the Planner

## See Also
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-8-multi-agent-consensus-loop-ralplan)
