---
name: meta-command
description: |
  Guide for creating and validating Claude Code slash commands.
  
  USE WHEN:
  - "create a command", "new command", "make a command"
  - "command spec", "command format", "frontmatter"
  - "allowed-tools", "argument-hint"
  - "validate command", "check command", "organize command", "command audit"
  
  DO NOT USE WHEN:
  - Creating skills or agents (use meta-skill, meta-agent)
  - General markdown formatting
---

# Meta-Command

A meta-skill for creating and validating Claude Code slash commands.
Supports Claude Code and OpenCode platforms.

> **Output Language**: All generated command content will be in **English**.

## Workflow Routing

| Intent | Reference |
|--------|-----------|
| Create a new command (full process) | [workflows/create-command.md](workflows/create-command.md) |
| Validate existing command(s) | [workflows/validate-command.md](workflows/validate-command.md) |
| Official field specification | [references/official-spec.md](references/official-spec.md) |
| Best practices & patterns | [references/best-practices.md](references/best-practices.md) |
| Real-world examples | [references/examples.md](references/examples.md) |

## Quick Start

### Create a New Command

1. Determine command category (see below)
2. Create file: `.claude/commands/{name}.md`
3. Add frontmatter + content
4. Test with `/command-name`

### Validate Commands

See [workflows/validate-command.md](workflows/validate-command.md) for the full validation workflow.

## Command Categories

Choose the appropriate category based on purpose:

| Category | Purpose | Tools | Examples |
|----------|---------|-------|----------|
| `orchestrator` | Multi-phase pipeline | Read, Write, Glob | /organize-*, /create-* |
| `action` | Execute specific task | Bash(cmd:*), Write | /deploy, /build |
| `query` | Gather information | Read, Grep, Glob | /search, /analyze |
| `generator` | Create files/content | Write, Read | /init-*, /scaffold |
| `interactive` | User input workflow | Question, Read, Write | /setup, /configure |

## Command Creation Workflow (5 Phases)

| Phase | Goal | Key Output |
|-------|------|------------|
| 1. DEFINE | Clarify purpose | Name + description |
| 2. CLASSIFY | Select category | Category + tools |
| 3. DESIGN | Write structure | Frontmatter + body |
| 4. INTEGRATE | Add skill references | @skill links |
| 5. TEST | Validate | Working command |

### Phase 1: DEFINE

Questions to answer:
- What does this command do?
- Who triggers it? (always human)
- What inputs does it need?
- What outputs does it produce?

### Phase 2: CLASSIFY

Select category and determine:
- `allowed-tools` based on category
- `model` if specific reasoning needed
- `disable-model-invocation` for destructive commands

### Phase 3: DESIGN

Write the command file:

```markdown
---
description: Brief purpose (shown in command list)
allowed-tools: Tool1, Tool2, Bash(cmd:*)
argument-hint: [required] [--optional]
---

# Command Title

## Arguments
$ARGUMENTS
- **required**: Description
- **--optional**: Description

## Instructions
[Step-by-step procedure]

## Output
### Success
[Format]
### Failure
[Format]

## Safety
| Check | Action |
|-------|--------|
| Risk | Mitigation |
```

### Phase 4: INTEGRATE

Add skill references for domain knowledge:

```markdown
## Instructions

1. Read @.claude/skills/meta-command/SKILL.md
2. Apply validation rules from skill
```

**Key Principle**: Command orchestrates the pipeline; Skills provide domain knowledge. Skills can also invoke other skills via the `Skill` tool when composition is intentional.

### Phase 5: TEST

- Run command with valid arguments
- Run with missing/invalid arguments
- Verify tool restrictions work
- Check output format

## Frontmatter Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `description` | **Yes** | string | Brief description shown in command list |
| `allowed-tools` | No | string/array | Tool restrictions |
| `argument-hint` | No | string | Placeholder: `[arg1] [--flag]` |
| `model` | No | string | `haiku`, `sonnet`, `opus` |
| `disable-model-invocation` | No | boolean | Prevent programmatic invocation |

### Tool Scoping Patterns

| Need | Pattern |
|------|---------|
| Git operations | `Bash(git:*)` |
| npm scripts | `Bash(npm:*)` |
| Docker | `Bash(docker:*)` |
| All bash (not recommended) | `Bash` |

## Dynamic Content Syntax

| Syntax | Purpose | Example |
|--------|---------|---------|
| `$ARGUMENTS` | All arguments as string | `Review $ARGUMENTS` |
| `$1`, `$2`, ... | Positional arguments | `Deploy $1 to $2` |
| `@path/to/file` | File reference | `@.claude/skills/skill/SKILL.md` |
| `` !`command` `` | Embedded bash | `` !`git status` `` |

## Command Structure Template

```markdown
---
description: Brief purpose description
allowed-tools: Tool1, Tool2, Bash(cmd:*)
argument-hint: [required-arg] [--optional-flag]
---

# Command Title

Brief explanation of what this command does.

## Arguments

$ARGUMENTS

- **required-arg**: Description
- **--optional-flag**: Description

## Pipeline Overview (for orchestrator commands)

```
Phase 1: ACTION
  └─ Description
Phase 2: ACTION
  └─ Description
```

## Instructions

### Phase 1: Name

[Steps, skill references]

### Phase 2: Name

[Steps]

## Output

### Success
```
[Expected output format]
```

### Failure
```
[Error format with suggestions]
```

## Safety

| Check | Action |
|-------|--------|
| [Safety concern] | [How to handle] |

## Key Principle

[Important design note]

## Related

- @.claude/skills/relevant-skill/SKILL.md
- @.claude/commands/related-command.md
```

## Relationship Patterns

### Command + Skill

```
⚡ COMMAND: Orchestrates flow
    ↓
📚 SKILL: Provides knowledge (read-only)
    ↓
🔧 TOOL: Executes operations
```

### Command + Agent

For complex reasoning, commands can delegate:

```markdown
## Instructions

For complex analysis, consult oracle agent:
1. Gather context
2. Delegate reasoning to oracle
3. Apply recommendations
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Missing `description` | Not discoverable | Add meaningful description |
| `allowed-tools: Bash` | Too permissive | Use `Bash(cmd:*)` pattern |
| Hardcoded domain knowledge | Not reusable | Extract to skill |
| Missing output examples | Unclear expectations | Add Output section |
| No safety section | Risk of damage | Add Safety for side effects |
| Excessive skill coupling | Review needed | If 3+ skills invoked, consider Command/Agent |

## Validation Checklist

### Frontmatter
- [ ] `description` present and meaningful
- [ ] `allowed-tools` properly scoped
- [ ] `argument-hint` if command takes args
- [ ] `disable-model-invocation: true` for destructive

### Structure
- [ ] `## Arguments` if `argument-hint` present
- [ ] `## Instructions` with clear steps
- [ ] `## Output` with examples
- [ ] `## Safety` for side effects

### Integration
- [ ] Skills use `@.claude/skills/...` syntax
- [ ] Referenced skills exist
- [ ] Pipeline ownership respected

## Platform Support

| Platform | Location | Status |
|----------|----------|--------|
| Claude Code | `.claude/commands/` | Full Support |
| OpenCode | `.opencode/commands/` | Full Support |
