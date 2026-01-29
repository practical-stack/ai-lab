# Pattern: Priority-Based Context Injection

**Difficulty:** Advanced
**Impact:** Medium
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-9-priority-based-context-injection)

---

## Problem
Static system prompts lack file-specific context. Agents need location-aware instructions.

## Solution
Dynamic injection of context based on file proximity and priority levels.

## Implementation
Two systems work together:
1. **Context Collector** — Priority-based accumulator (critical > high > normal > low), deduplicates by source:id
2. **Rules Finder** — Walks directory tree upward, finds `.claude/rules/` files, matches by glob pattern

Rules sorted by directory distance (closest wins). Content-hash deduplication prevents repetition. Consumed on read (cleared after injection).

## Verification
- [ ] Rules closer to working file take priority
- [ ] Same rule not injected twice
- [ ] Context cleared after injection
- [ ] Multiple priority levels supported

## See Also
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-9-priority-based-context-injection)
