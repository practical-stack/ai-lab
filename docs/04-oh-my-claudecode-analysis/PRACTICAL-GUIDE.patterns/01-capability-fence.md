# Pattern: Capability Fence

**Difficulty:** Beginner
**Impact:** High
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-1-capability-fence)

---

## Problem

LLM agents use any tool available to them, even when their role should be advisory-only. An architect agent starts editing files. A reviewer starts implementing fixes.

## Solution

Dual enforcement: disable tools at the infrastructure level AND explain the restriction in the prompt.

## Implementation

### Step 1: Define Tool Restrictions

In your agent definition, specify which tools are blocked:
```yaml
---
name: my-reviewer
disallowedTools: Write, Edit
---
```

### Step 2: Mirror in the Prompt

Add an explicit forbidden actions section:
```markdown
FORBIDDEN ACTIONS (will be blocked):
- Write tool: BLOCKED
- Edit tool: BLOCKED
- Any file modification: BLOCKED

You are READ-ONLY. Analyze and recommend, never modify.
```

### Step 3: Add Contrastive Identity

Define what the agent IS and IS NOT:
```markdown
| What You ARE | What You ARE NOT |
|---|---|
| Advisor | Implementer |
| Analyst | Editor |
| Reviewer | Fixer |
```

## Verification

- [ ] Agent definition has `disallowedTools` field
- [ ] Prompt includes FORBIDDEN ACTIONS section
- [ ] Prompt includes IS/IS NOT table
- [ ] Agent cannot use blocked tools (test by requesting it)

## Common Mistakes

| Mistake | Why Wrong | Correct Approach |
|---------|-----------|------------------|
| Prompt-only restriction | Model can ignore prompts | Add `disallowedTools` |
| Tool-only restriction | Agent confused by failures | Explain in prompt |
| Forgetting contrastive identity | Agent drifts to implementation | Add IS/IS NOT table |

## See Also

- [Worker Preamble](./02-worker-preamble.md) — Complements this pattern for workers
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-1-capability-fence)
