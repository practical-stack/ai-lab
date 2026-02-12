---
name: {{SKILL_NAME}}
description: |
  [What it does in 1-2 sentences]. Use when user asks to [specific trigger phrases].
  Do NOT use for [exclusion cases].

  USE WHEN:
  - "[trigger phrase 1]", "[trigger phrase 2]"

  DO NOT USE WHEN:
  - [Exclusion 1]
# --- Optional fields ---
# license: MIT
# compatibility: [environment requirements]
# allowed-tools: "Bash(python:*) WebFetch"
# metadata:
#   author: [Your Name]
#   version: 1.0.0
---

# {{SKILL_TITLE}}

## Instructions

### Step 1: [First Major Step]

[Clear explanation of what happens.]

```bash
# Script call if applicable
bun scripts/example.ts --input [INPUT]
```

Expected output: [describe what success looks like]

### Step 2: [Second Major Step]

[Explanation and actions.]

## Examples

### Example 1: [Common scenario]

**User says:** "[trigger phrase]"

**Actions:**
1. [First action]
2. [Second action]

**Result:** [Concrete outcome]

### Example 2: [Edge case or alternative scenario]

**User says:** "[alternative trigger phrase]"

**Actions:**
1. [Action]

**Result:** [Outcome]

## Troubleshooting

**Error:** [Common error message]
**Cause:** [Why it happens]
**Solution:** [How to fix]

**Error:** [Another common error]
**Cause:** [Why it happens]
**Solution:** [How to fix]

## References

- [references/guide.md](references/guide.md) — Detailed reference documentation
- [scripts/example.ts](scripts/example.ts) — Example automation script

---

**Delete unnecessary directories or files.** Not all skills need scripts/, references/, and assets/.
