# Pattern: Tiered Model Routing

**Difficulty:** Intermediate
**Impact:** High
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-3-tiered-model-routing)

---

## Problem
Using the most capable model for every task wastes tokens (~$15/MTok for Opus vs $0.25 for Haiku).

## Solution
Create LOW/MEDIUM/HIGH agent variants. Route by task complexity using signal extraction + scoring.

## Implementation

### Agent Variants
For each role, create 3 variants with tier-specific behavioral instructions:
- **LOW (Haiku):** "Limit to 5 files. Escalate if complex."
- **MEDIUM (Sonnet):** "Up to 20 files. Escalate for system-wide changes."
- **HIGH (Opus):** "Full exploration. No escalation needed."

### Routing Decision
```
score >= 8 → HIGH (Opus)
score >= 4 → MEDIUM (Sonnet)
score < 4  → LOW (Haiku)
```

### Signal Weights
Architecture keywords: +3, Simple keywords: -2, System-wide impact: +3, Per-failure: +2

## Verification
- [ ] Each agent role has 3 tier variants
- [ ] Routing logic selects tier before delegation
- [ ] Tier instructions adapt agent behavior appropriately
- [ ] Cost savings measurable (~47% reported)

## See Also
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-3-tiered-model-routing)
