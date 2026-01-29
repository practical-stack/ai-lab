# Pattern: Intent-Triggered Skill Activation

**Difficulty:** Intermediate
**Impact:** Medium
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-11-intent-triggered-skill-activation)

---

## Problem
Users must learn commands to use the system effectively.

## Solution
Include a pattern-to-skill routing table in the orchestrator prompt. The LLM itself is the router.

## Implementation
```markdown
| Pattern Detected | Action |
|------------------|--------|
| "build me", "I want a" | Activate autopilot |
| "don't stop" | Activate persistence loop |
| UI/frontend work | Activate design sensibility |
| Broad/vague request | Start planning interview |
```

Conflict resolution: explicit keywords > generic keywords > config defaults.

## Verification
- [ ] Routing table covers common user intents
- [ ] Conflict resolution is explicit
- [ ] Silent activations don't confuse users
- [ ] Magic keywords are documented as optional shortcuts

## See Also
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-11-intent-triggered-skill-activation)
