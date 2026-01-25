# Command Best Practices

Patterns and anti-patterns for Claude Code slash commands.

## Security Best Practices

### Tool Scoping

**Always scope Bash commands:**

```yaml
# Bad - too permissive
allowed-tools: Bash

# Good - scoped to specific commands
allowed-tools: Bash(git:*), Bash(npm:run)
```

Common patterns:
| Need | Pattern |
|------|---------|
| Git operations | `Bash(git:*)` |
| npm scripts | `Bash(npm:*)` |
| Docker commands | `Bash(docker:*)` |
| Kubernetes | `Bash(kubectl:*)`, `Bash(helm:*)` |
| File operations | `Read`, `Write`, `Edit` (not Bash) |

### Destructive Commands

For commands with irreversible effects:

```yaml
---
description: Delete all test data
disable-model-invocation: true
allowed-tools: Bash(rm:*)
---

**WARNING: This will permanently delete data.**

Confirm by typing the environment name: $1
```

Requirements:
- Set `disable-model-invocation: true`
- Include explicit warning
- Require confirmation
- Log actions

---

## Structure Best Practices

### Argument Documentation

If `argument-hint` is present, include `## Arguments` section:

```markdown
---
argument-hint: [file-path] [--fix]
---

## Arguments

$ARGUMENTS

- **file-path** (required): Path to file or directory
- **--fix** (optional): Auto-fix issues
```

### Output Examples

Always include output examples:

```markdown
## Output

### Success
```
Command completed: [result]
```

### Failure
```
Error: [error-code]
Reason: [explanation]
Fix: [suggestion]
```
```

### Pipeline Structure

For multi-phase commands:

```markdown
## Pipeline Overview

```
Phase 1: VALIDATE
  └─ Check prerequisites
Phase 2: EXECUTE
  └─ Main operation
Phase 3: VERIFY
  └─ Confirm results
```

## Instructions

### Phase 1: VALIDATE
[validation steps]

### Phase 2: EXECUTE
[execution steps]

### Phase 3: VERIFY
[verification steps]
```

---

## Skill Integration Pattern

### Loading Skills

Use `@` syntax to reference skills:

```markdown
## Instructions

1. Read @.claude/skills/skill-name/SKILL.md
2. Apply the [specific workflow]
3. Use reference @.claude/skills/skill-name/references/detail.md if needed
```

### Pipeline Ownership Principle

```
⚡ COMMAND: Orchestrates flow, decides what to use when
    ↓
📚 SKILL: Provides domain knowledge (read-only, no side effects)
    ↓
🔧 TOOL: Executes actual operations
```

**Command responsibilities:**
- Define the pipeline phases
- Decide which skills to load
- Handle errors and branching
- Provide user feedback

**Skill responsibilities:**
- Provide domain knowledge
- Define patterns and templates
- Reference other resources (declaratively)
- Never orchestrate or execute

### Anti-Pattern: Hardcoded Knowledge

```markdown
# Bad - hardcoded domain knowledge
Use semantic versioning:
- MAJOR: breaking changes
- MINOR: new features
- PATCH: bug fixes

# Good - extracted to skill
Follow versioning guidelines in @.claude/skills/versioning/SKILL.md
```

---

## Agent Relationship

### When to Delegate to Agent

Commands should delegate to agents when:
- Multi-step **dynamic** planning required
- LLM reasoning needed for decisions
- Iteration based on results

```markdown
## Instructions

For complex analysis, delegate to oracle agent:

1. Gather context: [context gathering steps]
2. Consult oracle for: [specific question]
3. Apply recommendations
```

### When NOT to Use Agent

Keep as command when:
- Fixed procedure
- Mechanical transformation
- No judgment required

---

## Common Anti-Patterns

### 1. Over-Permissive Tools

```yaml
# Bad
allowed-tools: Bash, Write

# Good
allowed-tools: Bash(git:*), Write
```

### 2. Missing Argument Documentation

```markdown
# Bad
---
argument-hint: [file] [mode]
---
Process the file.

# Good
---
argument-hint: [file] [mode]
---
## Arguments
- **file**: Path to process
- **mode**: Processing mode (fast|thorough)
```

### 3. Skill Doing Orchestration

```markdown
# Bad (in SKILL.md)
Load the validation skill: @.claude/skills/validator/SKILL.md
Then run /validate-command

# Good (in SKILL.md)
For validation patterns, see [validator reference](../validator/references/patterns.md)
```

### 4. Missing Safety Section

```markdown
# Bad - destructive command without safety
Delete files matching $1

# Good
## Safety

| Action | Requirement |
|--------|-------------|
| Delete files | Show preview, require confirmation |
| Production paths | Block unless --force |
```

### 5. Monolithic Commands

```markdown
# Bad - 500+ line command with everything

# Good - split concerns
- /command → entry point, orchestration
- @skill → domain knowledge
- @reference → detailed documentation
```

---

## Testing Commands

### Manual Testing Checklist

- [ ] Run with valid arguments
- [ ] Run with missing required arguments
- [ ] Run with invalid arguments
- [ ] Verify tool restrictions work
- [ ] Check output format matches spec
- [ ] Test error handling paths

### Dry Run Support

For commands with side effects:

```markdown
---
argument-hint: [target] [--dry-run]
---

## Instructions

If `--dry-run`:
  - Show what would be done
  - Do not execute

If not `--dry-run`:
  - Confirm actions
  - Execute
```
