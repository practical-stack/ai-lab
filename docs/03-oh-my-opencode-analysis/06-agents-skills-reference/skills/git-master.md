# Git Master Skill

**Source:** `src/features/builtin-skills/git-master/SKILL.md`  
**Lines:** 1100+ (the most comprehensive skill)

---

## Overview

Git Master is the reference implementation for oh-my-opencode style skills. It combines three specializations:
1. **Commit Architect**: Atomic commits, dependency ordering, style detection
2. **Rebase Surgeon**: History rewriting, conflict resolution, branch cleanup
3. **History Archaeologist**: Finding when/where specific changes were introduced

---

## Frontmatter

```yaml
---
name: git-master
description: |
  MUST USE for ANY git operations. Atomic commits, rebase/squash, history search (blame, bisect, log -S).
  STRONGLY RECOMMENDED: Use with delegate_task(category='quick', load_skills=['git-master'], ...) to save context.
  Triggers: 'commit', 'rebase', 'squash', 'who wrote', 'when was X added', 'find the commit that'.
---
```

---

## Key Pattern 1: Mode Detection Table

```markdown
## MODE DETECTION (FIRST STEP)

| User Request Pattern | Mode | Jump To |
|---------------------|------|---------|
| "commit", "커밋", changes to commit | `COMMIT` | Phase 0-6 |
| "rebase", "리베이스", "squash", "cleanup history" | `REBASE` | Phase R1-R4 |
| "find when", "who changed", "git blame", "bisect" | `HISTORY_SEARCH` | Phase H1-H3 |

**CRITICAL**: Don't default to COMMIT mode. Parse the actual request.
```

---

## Key Pattern 2: Critical Warning Block

```markdown
## CORE PRINCIPLE: MULTIPLE COMMITS BY DEFAULT (NON-NEGOTIABLE)

<critical_warning>
**ONE COMMIT = AUTOMATIC FAILURE**

Your DEFAULT behavior is to CREATE MULTIPLE COMMITS.
Single commit is a BUG in your logic, not a feature.

**HARD RULE:**
```
3+ files changed -> MUST be 2+ commits (NO EXCEPTIONS)
5+ files changed -> MUST be 3+ commits (NO EXCEPTIONS)
10+ files changed -> MUST be 5+ commits (NO EXCEPTIONS)
```

**If you're about to make 1 commit from multiple files, YOU ARE WRONG. STOP AND SPLIT.**
</critical_warning>
```

---

## Key Pattern 3: Parallel Context Gathering

```markdown
## PHASE 0: Parallel Context Gathering (MANDATORY FIRST STEP)

<parallel_analysis>
**Execute ALL of the following commands IN PARALLEL to minimize latency:**

```bash
# Group 1: Current state
git status
git diff --staged --stat
git diff --stat

# Group 2: History context  
git log -30 --oneline
git log -30 --pretty=format:"%s"

# Group 3: Branch context
git branch --show-current
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

**Capture these data points simultaneously:**
1. What files changed (staged vs unstaged)
2. Recent 30 commit messages for style detection
3. Branch position relative to main/master
</parallel_analysis>
```

---

## Key Pattern 4: BLOCKING Style Detection

```markdown
## PHASE 1: Style Detection (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

<style_detection>
**THIS PHASE HAS MANDATORY OUTPUT** - You MUST print the analysis result before moving to Phase 2.

### 1.3 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding to Phase 2. NO EXCEPTIONS.**

```
STYLE DETECTION RESULT
======================
Analyzed: 30 commits from git log

Language: [KOREAN | ENGLISH]
  - Korean commits: N (X%)
  - English commits: M (Y%)

Style: [SEMANTIC | PLAIN | SENTENCE | SHORT]
  - Semantic (feat:, fix:, etc): N (X%)
  - Plain: M (Y%)
  - Short: K (Z%)

Reference examples from repo:
  1. "actual commit message from log"
  2. "actual commit message from log"
  3. "actual commit message from log"

All commits will follow: [LANGUAGE] + [STYLE]
```

**IF YOU SKIP THIS OUTPUT, YOUR COMMITS WILL BE WRONG. STOP AND REDO.**
</style_detection>
```

---

## Key Pattern 5: Mandatory Justification

```markdown
### 3.5 MANDATORY JUSTIFICATION (Before Creating Commit Plan)

**NON-NEGOTIABLE: Before finalizing your commit plan, you MUST:**

FOR EACH planned commit with 3+ files:
  1. List all files in this commit
  2. Write ONE sentence explaining why they MUST be together
  3. If you can't write that sentence -> SPLIT

TEMPLATE:
"Commit N contains [files] because [specific reason they are inseparable]."

VALID reasons:
  VALID: "implementation file + its direct test file"
  VALID: "type definition + the only file that uses it"
  VALID: "migration + model change (would break without both)"

INVALID reasons (MUST SPLIT instead):
  INVALID: "all related to feature X" (too vague)
  INVALID: "part of the same PR" (not a reason)
  INVALID: "they were changed together" (not a reason)
```

---

## Key Pattern 6: BLOCKING Commit Plan

```markdown
### 3.9 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding to Phase 4. NO EXCEPTIONS.**

```
COMMIT PLAN
===========
Files changed: N
Minimum commits required: ceil(N/3) = M
Planned commits: K
Status: K >= M (PASS) | K < M (FAIL - must split more)

COMMIT 1: [message in detected style]
  - path/to/file1.py
  - path/to/file1_test.py
  Justification: implementation + its test

COMMIT 2: [message in detected style]
  - path/to/file2.py
  Justification: independent utility function

Execution order: Commit 1 -> Commit 2 -> Commit 3
```

**VALIDATION BEFORE EXECUTION:**
- Each commit has <=4 files (or justified)
- Each commit message matches detected STYLE + LANGUAGE
- Test files paired with implementation
- Different directories = different commits (or justified)
- Total commits >= min_commits

**IF ANY CHECK FAILS, DO NOT PROCEED. REPLAN.**
```

---

## Key Pattern 7: Final Check Before Execution

```markdown
## FINAL CHECK BEFORE EXECUTION (BLOCKING)

```
STOP AND VERIFY - Do not proceed until ALL boxes checked:

[] File count check: N files -> at least ceil(N/3) commits?
  - 3 files -> min 1 commit
  - 5 files -> min 2 commits
  - 10 files -> min 4 commits

[] Justification check: For each commit with 3+ files, did I write WHY?

[] Directory split check: Different directories -> different commits?

[] Test pairing check: Each test with its implementation?

[] Dependency order check: Foundations before dependents?
```

**HARD STOP CONDITIONS:**
- Making 1 commit from 3+ files -> **WRONG. SPLIT.**
- Making 2 commits from 10+ files -> **WRONG. SPLIT MORE.**
- Can't justify file grouping in one sentence -> **WRONG. SPLIT.**
```

---

## Anti-Patterns

```markdown
## Anti-Patterns (AUTOMATIC FAILURE)

1. **NEVER make one giant commit** - 3+ files MUST be 2+ commits
2. **NEVER default to semantic commits** - detect from git log first
3. **NEVER separate test from implementation** - same commit always
4. **NEVER group by file type** - group by feature/module
5. **NEVER rewrite pushed history** without explicit permission
6. **NEVER leave working directory dirty** - complete all changes
7. **NEVER skip JUSTIFICATION** - explain why files are grouped
8. **NEVER use vague grouping reasons** - "related to X" is NOT valid
```

---

## Multi-Mode Structure

Git Master demonstrates how to handle multiple modes in one skill:

| Mode | Phases | Trigger |
|------|--------|---------|
| **COMMIT** | Phase 0-6 | "commit", "커밋" |
| **REBASE** | Phase R1-R4 | "rebase", "squash" |
| **HISTORY_SEARCH** | Phase H1-H3 | "find when", "who changed" |

Each mode has its own complete phase sequence with BLOCKING checkpoints.

---

## Usage

```typescript
// Recommended: Delegate with skill loaded
delegate_task(
  category="quick",
  load_skills=["git-master"],
  prompt="Commit all changes following the repo's existing style..."
)
```

---

## Why This Skill Matters

Git Master is the **reference implementation** for oh-my-opencode patterns:

1. **Multiple BLOCKING phases** with mandatory output templates
2. **Parallel context gathering** for efficiency
3. **Hard rules with formulas** (file count → minimum commits)
4. **Mandatory justification** for grouping decisions
5. **Mode detection table** for request routing
6. **Final check before execution** preventing premature completion
7. **Anti-patterns section** with explicit prohibitions

If you're creating a new skill, study git-master first.
