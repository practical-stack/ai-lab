# Quick Reference Cheat Sheet

**Purpose:** Copy-paste templates and lookup tables. No explanations - see main docs for details.

---

## Agent Selection Matrix

| Agent | Cost | Mode | Write? | Thinking | Use For |
|-------|------|------|--------|----------|---------|
| atlas | EXPENSIVE | Primary | Delegates | 32k | Orchestration |
| oracle | EXPENSIVE | Read-only | No | 32k | Strategy, debugging |
| metis | EXPENSIVE | Read-only | No | 32k | Pre-planning |
| momus | EXPENSIVE | Read-only | No | 32k | Plan review |
| explore | FREE | Read-only | No | No | Internal code search |
| librarian | CHEAP | Read-only | No | No | External docs/OSS |
| multimodal | CHEAP | Read-only | No | No | Images/PDFs |

---

## Background Execution Rules

```typescript
// CHEAP AGENTS: Always background, always parallel
delegate_task(subagent_type="explore", run_in_background=true, ...)
delegate_task(subagent_type="librarian", run_in_background=true, ...)

// EXPENSIVE AGENTS: Foreground (wait)
delegate_task(subagent_type="oracle", run_in_background=false, ...)

// TASK EXECUTION: Never background
delegate_task(category="quick", run_in_background=false, ...)
```

---

## 7-Section Delegation Template

```markdown
## 1. TASK
[Atomic goal - quote exact checkbox]

## 2. EXPECTED OUTCOME
- [ ] Files: [paths]
- [ ] Behavior: [what it does]
- [ ] Verification: `[command]`

## 3. REQUIRED SKILLS
- [skill]: [why]

## 4. REQUIRED TOOLS
- [tool]: [what for]

## 5. MUST DO
- [exhaustive requirements]

## 6. MUST NOT DO
- Do NOT [forbidden]

## 7. CONTEXT
- Patterns: [reference file:lines]
- Dependencies: [what exists]
```

**Minimum: 30 lines.**

---

## BLOCKING Checkpoint Template

```markdown
## PHASE N: [Name] (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

**THIS PHASE HAS MANDATORY OUTPUT**

### N.1 [Steps]

### N.2 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding. NO EXCEPTIONS.**

```
[OUTPUT TEMPLATE]
=================
Field: [value]
```

**IF YOU SKIP THIS OUTPUT, [consequence]. STOP AND REDO.**
```

---

## Session Continuity

```typescript
// First call
result = delegate_task(category="quick", prompt="...")
// Store: result.session_id = "ses_abc123"

// Follow-up (CORRECT)
delegate_task(session_id="ses_abc123", prompt="Fix: {error}")

// WRONG - loses context
delegate_task(category="quick", prompt="Fix the previous...")
```

---

## Evidence Requirements

| Action | Evidence |
|--------|----------|
| File edit | `lsp_diagnostics` = 0 errors |
| Build | Exit code 0 |
| Tests | All pass |
| Delegation | Verified independently |

---

## Categories for delegate_task

| Category | Best For |
|----------|----------|
| `visual-engineering` | Frontend, UI/UX, styling |
| `ultrabrain` | Complex reasoning, architecture |
| `artistry` | Creative tasks |
| `quick` | Trivial, single file |
| `unspecified-low` | Low effort, misc |
| `unspecified-high` | High effort, misc |
| `writing` | Documentation |

---

## Hard Blocks

| Forbidden | Reason |
|-----------|--------|
| `as any`, `@ts-ignore` | Type safety |
| `catch(e) {}` | Error handling |
| Delete failing tests | Fix code instead |
| Temperature > 0.3 | Determinism |
| Trust "I'm done" | Verify first |
| Sequential cheap agents | Use background |

---

## Git Commit Formula

```
Files changed: N
Minimum commits: ceil(N/3)

3 files  → min 1 commit
5 files  → min 2 commits
10 files → min 4 commits
20 files → min 7 commits
```
