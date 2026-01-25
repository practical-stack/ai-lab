# Workflow: Create a New Command

Step-by-step guide for creating a new Claude Code slash command.

## Prerequisites

- Clear understanding of what the command should do
- Know which tools are needed
- Identify if skills are required

## Phase 1: DEFINE Purpose

### 1.1 Answer Key Questions

| Question | Your Answer |
|----------|-------------|
| What does this command do? | |
| What problem does it solve? | |
| What inputs does it need? | |
| What outputs does it produce? | |
| Does it have side effects? | |

### 1.2 Choose Command Name

**Naming Convention:** `kebab-case`

| Pattern | Use Case | Examples |
|---------|----------|----------|
| `verb-noun` | Action on target | `create-user`, `deploy-app` |
| `action` | Simple operations | `build`, `test`, `lint` |
| `category/name` | Grouped commands | `git/commit`, `db/migrate` |

### 1.3 Write Description

- Keep under 80 characters
- Start with verb
- Describe what, not how

```yaml
# Good
description: Deploy application to specified environment

# Bad (too long, describes how)
description: This command will connect to the server and run the deployment script to update the application
```

**Output:** Command name + description

---

## Phase 2: CLASSIFY Category

### 2.1 Select Category

| Category | Characteristics | Tools Needed |
|----------|-----------------|--------------|
| `orchestrator` | Multi-phase, loads skills | Read, Write, Glob |
| `action` | Executes specific task | Bash(cmd:*), Write |
| `query` | Gathers information | Read, Grep, Glob |
| `generator` | Creates files/content | Write, Read |
| `interactive` | Needs user input | Question, Read, Write |

### 2.2 Determine Tool Restrictions

**Security First:** Only include necessary tools.

```yaml
# Orchestrator
allowed-tools: Read, Write, Glob

# Action (git operations)
allowed-tools: Bash(git:*), Read

# Query
allowed-tools: Read, Grep, Glob

# Generator
allowed-tools: Write, Read

# Interactive
allowed-tools: Question, Read, Write
```

### 2.3 Model Selection (Optional)

| Model | When to Use |
|-------|-------------|
| `haiku` | Simple formatting, quick tasks |
| `sonnet` | Standard operations (default) |
| `opus` | Complex reasoning, architecture decisions |

### 2.4 Safety Flags

```yaml
# For destructive commands
disable-model-invocation: true
```

**Output:** Category + allowed-tools + optional model

---

## Phase 3: DESIGN Structure

### 3.1 Create File

```bash
# Location
.claude/commands/{name}.md

# For grouped commands
.claude/commands/{category}/{name}.md
```

### 3.2 Write Frontmatter

```yaml
---
description: Brief purpose description
allowed-tools: Tool1, Tool2
argument-hint: [required] [--optional]
---
```

### 3.3 Define Arguments (if any)

```markdown
## Arguments

$ARGUMENTS

- **required-arg** (required): What it is
- **--optional-flag** (optional): What it does, default value
```

### 3.4 Write Instructions

Choose structure based on category:

**Simple Command:**
```markdown
## Instructions

1. First step
2. Second step
3. Third step
```

**Orchestrator Command:**
```markdown
## Pipeline Overview

```
Phase 1: DISCOVER
  └─ Find targets
Phase 2: PROCESS
  └─ Apply changes
Phase 3: REPORT
  └─ Show results
```

## Instructions

### Phase 1: DISCOVER

[Steps]

### Phase 2: PROCESS

[Steps]

### Phase 3: REPORT

[Steps]
```

### 3.5 Add Output Examples

```markdown
## Output

### Success
```
✅ Operation completed
- Result: [details]
```

### Failure
```
❌ Operation failed: [error_code]
- Reason: [explanation]
- Fix: [suggestion]
```
```

### 3.6 Add Safety Section (for side effects)

```markdown
## Safety

| Check | Action |
|-------|--------|
| Production deployment | Require explicit confirmation |
| Destructive operation | Preview first, confirm |
| Missing dependencies | Warn and abort |
```

**Output:** Complete command file draft

---

## Phase 4: INTEGRATE Skills

### 4.1 Identify Domain Knowledge

Does the command need specialized knowledge?

| Knowledge Type | Extract to Skill? |
|----------------|-------------------|
| One-time use | No, inline it |
| Reusable patterns | Yes |
| Complex domain | Yes |
| Simple procedure | No |

### 4.2 Add Skill References

```markdown
## Instructions

### Phase 1: VALIDATE

1. Read @.claude/skills/meta-command/SKILL.md
2. Apply validation rules from skill
```

### 4.3 Verify Pipeline Ownership

```
⚡ COMMAND: Makes decisions, orchestrates
    ↓
📚 SKILL: Provides knowledge (never orchestrates)
    ↓
🔧 TOOL: Executes operations
```

**Check:** Skills should never say "Load skill X" or "Run /command"

**Output:** Command with skill integration

---

## Phase 5: TEST

### 5.1 Basic Validation

```bash
# Check file exists
ls .claude/commands/{name}.md

# Run the command
/{name}
/{name} --help  # if supported
```

### 5.2 Test Scenarios

| Scenario | Test | Expected |
|----------|------|----------|
| Valid input | `/{name} valid-arg` | Success output |
| Missing required | `/{name}` | Error with guidance |
| Invalid input | `/{name} bad-input` | Clear error message |
| Edge cases | Various | Graceful handling |

### 5.3 Tool Restriction Test

Try to use a tool not in `allowed-tools`:
- Should be blocked or warn

### 5.4 Validate with /organize-command

```bash
/organize-command .claude/commands/{name}.md
```

Fix any reported issues.

**Output:** Working, validated command

---

## Checklist Summary

### Before Creating
- [ ] Clear purpose defined
- [ ] Name follows conventions
- [ ] Category selected
- [ ] Tools identified

### After Creating
- [ ] Frontmatter complete
- [ ] Arguments documented
- [ ] Instructions clear
- [ ] Output examples present
- [ ] Safety section (if needed)
- [ ] Skills properly referenced
- [ ] Tested with valid input
- [ ] Tested with invalid input
- [ ] Validated with /organize-command

---

## Quick Template

Copy this to start:

```markdown
---
description: [Brief purpose]
allowed-tools: Read, Write
argument-hint: [arg] [--flag]
---

# [Command Name]

[Brief description]

## Arguments

$ARGUMENTS

- **arg**: Description
- **--flag**: Description (default: value)

## Instructions

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Output

### Success
```
✅ [Success message]
```

### Failure
```
❌ [Error message]
```
```
