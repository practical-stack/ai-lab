# Oh-My-OpenCode Core Skills

This directory contains detailed documentation of core skills from oh-my-opencode.

## Skill Overview

| Skill | Domain | Key Pattern |
|-------|--------|-------------|
| [git-master](./git-master.md) | Git Operations | Multiple BLOCKING phases, mandatory justification, formula-based rules |
| [dev-browser](./dev-browser.md) | Browser Automation | Persistent page state, incremental workflow loop |
| [agent-browser](./agent-browser.md) | Browser Automation | CLI commands, snapshot-based refs |
| [frontend-ui-ux](./frontend-ui-ux.md) | UI/UX Design | Bold aesthetic direction, anti-AI-slop |

---

## Skill Structure Pattern

All skills follow a consistent structure:

```markdown
---
name: skill-name
description: |
  MUST USE for [trigger scenarios].
  Triggers: "keyword1", "keyword2", "keyword3"
---

# Role: [Identity]

[Mission statement]

---

## MODE DETECTION (FIRST STEP)

| Request Pattern | Mode | Jump To |
|-----------------|------|---------|
| "pattern A" | `MODE_A` | Phase A1-A3 |
| "pattern B" | `MODE_B` | Phase B1-B3 |

---

## CORE PRINCIPLE (NON-NEGOTIABLE)

<critical_warning>
**[PRINCIPLE] = AUTOMATIC FAILURE**

[What NOT to do]

**HARD RULE:**
[Exact criteria for success]
</critical_warning>

---

## PHASE 1: [Phase Name] (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

**THIS PHASE HAS MANDATORY OUTPUT**

### 1.1 [Steps]

### 1.2 MANDATORY OUTPUT (BLOCKING)

```
[EXACT OUTPUT TEMPLATE]
```

**IF YOU SKIP THIS OUTPUT, [CONSEQUENCE]. STOP AND REDO.**

---

## PHASE N: ...

---

## FINAL CHECK BEFORE DELIVERY (BLOCKING)

```
STOP AND VERIFY - Do not deliver until ALL checked:
[] [Checklist item 1]
[] [Checklist item 2]
```

---

## Anti-Patterns (AUTOMATIC FAILURE)

1. **NEVER [action]** - [reason]
2. **NEVER [action]** - [reason]
```

---

## Key Skill Patterns

### 1. BLOCKING Checkpoints

Force intermediate outputs to prevent skipping analysis:

```markdown
## PHASE 1: Analysis (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

**MANDATORY OUTPUT:**
```
ANALYSIS RESULT
===============
[Template]
```

**IF YOU SKIP THIS OUTPUT, YOUR WORK WILL BE WRONG. STOP AND REDO.**
```

### 2. Mode Detection Table

Route to correct workflow based on request:

```markdown
## MODE DETECTION (FIRST STEP)

| Request Pattern | Mode | Jump To |
|-----------------|------|---------|
| "review PR" | `PR_REVIEW` | Phase PR1-PR4 |
| "review file" | `FILE_REVIEW` | Phase F1-F3 |
```

### 3. Critical Warning Block

Non-negotiable rules with consequence awareness:

```markdown
<critical_warning>
**SUPERFICIAL = AUTOMATIC FAILURE**

Your DEFAULT behavior is to find REAL issues.
"Looks good", "Consider..." = FAILURE.

**If you're about to write "Consider...", YOU ARE WRONG. STOP.**
</critical_warning>
```

### 4. Anti-Patterns Section

Explicit prohibitions at the end:

```markdown
## Anti-Patterns (AUTOMATIC FAILURE)

1. **NEVER write "Looks good to me"** without evidence
2. **NEVER suggest without specifics**
3. **NEVER skip files** - analyze ALL changes
4. **NEVER miss the MANDATORY OUTPUT** phases
```

---

## Skill Checklist

When creating a skill, ensure you have:

- [ ] **Frontmatter** with `name` and `description` (with triggers)
- [ ] **Role/Identity** statement
- [ ] **Mode Detection Table** for request routing
- [ ] **`<critical_warning>`** block for non-negotiable rules
- [ ] **`(BLOCKING - MUST OUTPUT...)`** for analysis phases
- [ ] **Exact output templates** showing what to produce
- [ ] **`IF YOU SKIP...`** warnings after each template
- [ ] **`FINAL CHECK BEFORE DELIVERY`** section
- [ ] **Anti-Patterns** section listing explicit prohibitions

---

## See Also

- [../README.md](../README.md) - Reference directory overview
- [../../02-design-patterns.md](../../02-design-patterns.md) - Pattern explanations
- [../../04-practical-guide.md](../../04-practical-guide.md) - How to apply patterns
- [../../05-prompt-engineering.md](../../05-prompt-engineering.md) - Prompt techniques
