# Pattern Recognition Guide

Reference for identifying LLM-specific patterns during repository analysis.

## Search Strategy

### Phase 1: Structural Scan

```bash
# Find main prompt files
find . -name "*prompt*.md" -o -name "*system*.md" -o -name "*agent*.md"

# Find skill/command definitions
find . -name "SKILL.md" -o -name "*.skill"
find . -path "*commands*.md"

# Find hooks/verification
find . -name "*hook*" -o -name "*enforcer*" -o -name "*check*"

# Find configuration
find . -name "*.json" -o -name "*.yaml" -o -name "*.toml" | grep -i config
```

### Phase 2: Content Analysis

```bash
# Philosophy indicators
grep -ri "never\|always\|must\|critical\|blocking" --include="*.md"

# Anti-pattern indicators
grep -ri "don't\|do not\|avoid\|wrong\|bad\|anti" --include="*.md"

# Verification indicators
grep -ri "verify\|check\|evidence\|proof\|complete" --include="*.md"

# Delegation indicators
grep -ri "delegate\|task\|agent\|session" --include="*.md" --include="*.ts"
```

---

## Pattern Catalog

### Prompt Structure Patterns

#### 1. XML Tag Structure

**Signal:** `<tag>...</tag>` in prompts

**Variants:**
| Tag Type | Purpose | Example |
|----------|---------|---------|
| `<critical>` | Emphasis | `<critical>Never use as any</critical>` |
| `<phase_N>` | Workflow | `<phase_1>...</phase_1>` |
| `<context>` | Information | `<context>Project info</context>` |
| `<output>` | Format | `<output format="json">` |

**What to Document:**
- Tag naming conventions
- Nesting patterns
- Purpose of each tag type

#### 2. Blocking Checkpoint

**Signal:** "BLOCKING", "MANDATORY OUTPUT", "MUST output before proceeding"

**Structure:**
```markdown
## Phase N (BLOCKING)

**MANDATORY OUTPUT:**
```
[Required output format]
```

**IF YOU SKIP THIS, [consequence]**
```

**What to Document:**
- Where checkpoints are placed
- Required output format
- Consequence of skipping

#### 3. Decision Table

**Signal:** `| Condition | Action |` table structure

**Purpose:** Quick reference for conditional logic

**What to Document:**
- Decision criteria
- Action mappings
- Default behaviors

---

### Delegation Patterns

#### 1. 7-Section Delegation Prompt

**Signal:** Structured delegation with multiple sections

**Structure:**
```
1. TASK: [Specific goal]
2. EXPECTED OUTCOME: [Deliverables]
3. REQUIRED TOOLS: [Tool whitelist]
4. MUST DO: [Requirements]
5. MUST NOT DO: [Prohibitions]
6. CONTEXT: [Background info]
7. OUTPUT FORMAT: [Expected format]
```

**What to Document:**
- Which sections are used
- Section ordering
- Mandatory vs optional sections

#### 2. Session Continuity

**Signal:** `session_id` parameter usage

**Pattern:**
```typescript
// First call returns session_id
const result = await delegate({...});

// Follow-up uses session_id
await delegate({
  session_id: result.session_id,
  prompt: "Continue with..."
});
```

**What to Document:**
- When session_id is passed
- How context is preserved
- Token savings achieved

#### 3. Category + Skill System

**Signal:** Category selection combined with skill loading

**Pattern:**
```typescript
delegate_task({
  category: "visual-engineering",
  load_skills: ["frontend-ui-ux", "playwright"],
  prompt: "..."
});
```

**What to Document:**
- Available categories
- Skill selection criteria
- Category-skill combinations

---

### Verification Patterns

#### 1. Evidence Requirements

**Signal:** Explicit proof requirements before completion

**Structure:**
```markdown
## Evidence Requirements

| Action | Required Evidence |
|--------|-------------------|
| File edit | LSP diagnostics clean |
| Build | Exit code 0 |
| Test | All pass |

**NO EVIDENCE = NOT COMPLETE**
```

**What to Document:**
- Evidence types
- Verification methods
- Failure handling

#### 2. Todo Continuation Loop

**Signal:** Hook that prevents premature completion

**Pattern:**
```typescript
// Hook checks todo status
if (incompleteTodos > 0) {
  injectReminder("You have N incomplete todos...");
  continueLoop();
}
```

**What to Document:**
- Trigger conditions
- Reminder message
- Loop termination

#### 3. Comment Checker

**Signal:** Detection and removal of AI-typical comments

**Pattern:**
```typescript
// Checks for patterns like:
// - "This function..."
// - "Here we..."
// - Excessive inline comments
```

**What to Document:**
- Detection patterns
- Handling action
- Configuration options

---

### Knowledge Management Patterns

#### 1. Hierarchical AGENTS.md

**Signal:** AGENTS.md files at multiple directory levels

**Structure:**
```
project/
├── AGENTS.md           # Root level
├── src/
│   └── AGENTS.md       # Module level
└── src/feature/
    └── AGENTS.md       # Feature level
```

**What to Document:**
- Inheritance model
- Override behavior
- Loading priority

#### 2. SKILL.md Format

**Signal:** Standardized skill file structure

**Structure:**
```markdown
---
name: skill-name
description: |
  USE WHEN: [triggers]
  DO NOT USE WHEN: [exclusions]
---

# Skill Title

## Quick Reference
[Essential info]

## Workflow Routing
[Links to workflows]

## Core Resources
[Links to references]
```

**What to Document:**
- Frontmatter fields
- Required sections
- Progressive disclosure

#### 3. Progressive Disclosure

**Signal:** Content loaded on-demand, not upfront

**Levels:**
| Level | When Loaded | Content |
|-------|-------------|---------|
| 1 | Always | Frontmatter only |
| 2 | On trigger | SKILL.md body |
| 3 | On demand | References, workflows |

**What to Document:**
- Loading triggers
- Size limits per level
- Reference linking patterns

---

### Error Handling Patterns

#### 1. Failure Recovery Protocol

**Signal:** Explicit recovery steps after failures

**Structure:**
```markdown
## After N Consecutive Failures

1. STOP all edits
2. REVERT to known good state
3. DOCUMENT what failed
4. CONSULT [escalation path]
5. If unresolved → ASK USER
```

**What to Document:**
- Failure thresholds
- Recovery steps
- Escalation paths

#### 2. Graceful Degradation

**Signal:** Fallback behaviors when primary approach fails

**Pattern:**
- Try optimal approach
- Fall back to simpler approach
- Log degradation
- Continue with reduced capability

**What to Document:**
- Degradation triggers
- Fallback options
- User notification

---

## Pattern Extraction Checklist

For each identified pattern:

- [ ] Pattern name and category
- [ ] Signal (how to recognize it)
- [ ] Purpose (what problem it solves)
- [ ] Structure (how it's implemented)
- [ ] Example (actual code/prompt from repo)
- [ ] When to use (applicability)
- [ ] Related patterns (connections)
- [ ] Implementation effort (hours/days)
