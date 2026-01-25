# Pattern 01: BLOCKING Checkpoints

**Effort:** 1 hour | **Impact:** High | **Level:** Quick Win  
**Source:** [04-prompt-engineering.md](../04-prompt-engineering.md)

---

## The Problem

AI agents skip analysis phases and jump straight to execution, producing low-quality work based on assumptions.

**Example of the problem:**
```
User: "Refactor the auth module"
Agent: [Immediately starts changing files without understanding current structure]
Result: Breaking changes, missed dependencies, incomplete refactor
```

---

## The Solution

Mark phases as BLOCKING - the agent MUST output specific information before proceeding.

---

## Implementation Template

```markdown
## PHASE N: [Name] (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

<phase_tag>
**THIS PHASE HAS MANDATORY OUTPUT**

### N.1 [Steps to execute]

[What the agent should do]

### N.2 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding. NO EXCEPTIONS.**

```
[EXACT OUTPUT TEMPLATE]
=======================
Field 1: [value]
Field 2: [value]
Analysis: [what you found]
Decision: [what you'll do next]
```

**IF YOU SKIP THIS OUTPUT, [specific consequence]. STOP AND REDO.**
</phase_tag>
```

---

## Key Elements

| Element | Purpose | Example |
|---------|---------|---------|
| Section header warning | Alert at entry | `(BLOCKING - MUST OUTPUT BEFORE PROCEEDING)` |
| Bold emphasis | Immediate attention | `**THIS PHASE HAS MANDATORY OUTPUT**` |
| Template output block | Show exact format | Pre-formatted template |
| NO EXCEPTIONS | Eliminate edge-case reasoning | "NO EXCEPTIONS" text |
| Consequence warning | Fear of failure | "IF YOU SKIP... STOP AND REDO." |

---

## Real Examples

### Example 1: Code Review

```markdown
## PHASE 1: Initial Analysis (BLOCKING - MUST OUTPUT BEFORE REVIEWING)

<initial_analysis>
**THIS PHASE HAS MANDATORY OUTPUT**

### 1.1 Read all changed files
- Open each file in the PR
- Note file count and types
- Identify the main change

### 1.2 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before Phase 2. NO EXCEPTIONS.**

```
INITIAL ANALYSIS
================
Files changed: N
File types: [list]
Main change: [one sentence]
Risk areas: [list potential issues to investigate]
```

**IF YOU SKIP THIS, YOU WILL MISS CRITICAL ISSUES. STOP AND REDO.**
</initial_analysis>
```

### Example 2: Git Commit Style Detection

```markdown
## PHASE 1: Style Detection (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

<style_detection>
**THIS PHASE HAS MANDATORY OUTPUT**

### 1.1 Analyze existing commits
```bash
git log --oneline -30
```

### 1.2 MANDATORY OUTPUT (BLOCKING)

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

Reference examples from repo:
  1. "actual commit message from log"
  2. "actual commit message from log"
  3. "actual commit message from log"

All commits will follow: [LANGUAGE] + [STYLE]
```

**IF YOU SKIP THIS OUTPUT, YOUR COMMITS WILL BE WRONG. STOP AND REDO.**
</style_detection>
```

### Example 3: Verification Checklist

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
```

**HARD STOP CONDITIONS:**
- Making 1 commit from 3+ files -> **WRONG. SPLIT.**
- Making 2 commits from 10+ files -> **WRONG. SPLIT MORE.**
```

---

## Why This Works

1. **Forces Explicit Output**: LLMs can't "think" they did analysis - they must prove it
2. **Creates Paper Trail**: You can verify the analysis was done correctly
3. **Prevents Shortcuts**: The consequence warning activates loss aversion
4. **Sets Expectations**: Template shows exactly what format is expected

---

## Adoption Checklist

- [ ] Identify phases where agents skip analysis
- [ ] Create mandatory output template for each phase
- [ ] Add XML tags for semantic structure
- [ ] Add "IF YOU SKIP..." warning with specific consequence
- [ ] Test with real prompts to verify compliance
- [ ] Iterate on template format based on output quality

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Template too vague | Include exact fields with `[placeholder]` values |
| No consequence stated | Add specific failure mode: "commits will be wrong" |
| Missing "NO EXCEPTIONS" | Add it - prevents edge-case reasoning |
| Template too complex | Keep to 5-10 fields maximum |

---

## See Also

- [04-xml-tag-structure.md](./04-xml-tag-structure.md) - How to use XML tags
- [02-evidence-requirements.md](./02-evidence-requirements.md) - What counts as completion
- [../04-prompt-engineering.md](../04-prompt-engineering.md) - Full prompt engineering details
