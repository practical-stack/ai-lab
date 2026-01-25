# Command Examples

Real-world examples from official sources and best practices.

## Simple Commands

### Code Review Command

```markdown
---
description: Review code for quality and issues
allowed-tools: Read, Bash(git:*)
---

Review the code in this repository for:

1. Code quality issues
2. Potential bugs
3. Performance concerns
4. Security vulnerabilities

Focus on recently changed files:
!`git diff --name-only HEAD~5`
```

### Security Review Command

```markdown
---
description: Review code for security vulnerabilities
allowed-tools: Read, Grep
model: sonnet
---

Perform a security review focusing on:

1. **Input Validation**: Check all user inputs
2. **Authentication**: Review auth mechanisms
3. **Secrets**: Search for hardcoded credentials
4. **SQL Injection**: Check database queries
5. **XSS**: Review output encoding

Start with: @src/
```

---

## Commands with Arguments

### Deploy Command

```markdown
---
description: Deploy application to environment
argument-hint: [app-name] [environment] [version]
allowed-tools: Bash(kubectl:*), Bash(helm:*), Read
model: sonnet
disable-model-invocation: true
---

# Deploy Command

Deploy $1 to $2 using version $3.

## Arguments

$ARGUMENTS

- **app-name**: Application name
- **environment**: Target (staging, production)
- **version**: Version tag

## Pre-checks

Current context: !`kubectl config current-context`

## Instructions

1. Validate $2 configuration
2. Check version $3 exists
3. Execute deployment
4. Verify rollout

## Safety

| Check | Action |
|-------|--------|
| Production | Require explicit confirmation |
```

### Analyze Command

```markdown
---
description: Analyze code quality using plugin tools
argument-hint: [file-path]
allowed-tools: Bash(node:*), Read
---

Analyze @$1 using quality checker:

!`node scripts/analyze.js $1`

Report findings with severity levels.
```

---

## Interactive Commands

### Interactive Setup

```markdown
---
description: Interactive plugin setup
allowed-tools: AskUserQuestion, Write
---

# Interactive Plugin Setup

## Step 1: Gather Info

Ask user:
1. Plugin name?
2. Description?
3. Target platform?

## Step 2: Generate Config

Based on answers, create configuration.

## Step 3: Confirm

Show preview, ask for confirmation before writing.
```

---

## Commands with Skills

### Git Commit Command

```markdown
---
description: Analyze git status and create purpose-based atomic commits
allowed-tools: Bash, Read, Write, TodoWrite, TodoRead
argument-hint: "[scope] [--dry-run]"
---

# Git Commit Command

Create atomic, purpose-based commits.

## Arguments

$ARGUMENTS

- **scope** (optional): Limit to path(s)
- **--dry-run** (optional): Preview only

## Instructions

Load the **git-master** skill and execute in COMMIT mode:

1. **Context Gathering** (parallel):
   - `git status`
   - `git diff --staged --stat` + `git diff --stat`
   - `git log -30 --oneline`

2. **Style Detection**:
   - Analyze last 30 commits
   - Detect: SEMANTIC/PLAIN/SHORT

3. **Purpose-Based Grouping**:
   - Group by logical purpose
   - Pair tests with implementation

4. **Execution** (unless --dry-run)
```

### Structure Organizer Command

```markdown
---
description: Organize a feature into the right LLM structure
allowed-tools: Read, Write, Glob
argument-hint: <feature-description>
---

# LLM Structure Organizer

## Feature Request

$ARGUMENTS

## Instructions

### Phase 1: DIAGNOSE

1. Read @.claude/skills/meta-structure-organizer/SKILL.md
2. **Analyze** using @.claude/skills/meta-structure-organizer/workflows/analyze.md
3. **Generate spec** using @.claude/skills/meta-structure-organizer/workflows/generate-spec.md

### Phase 2: CREATE

Based on diagnosis:

| Diagnosis | Skill | Location |
|-----------|-------|----------|
| COMMAND | N/A | `.claude/commands/` |
| SKILL | meta-skill-creator | `.claude/skills/` |
| AGENT | meta-agent-creator | `src/agents/` |

## Key Principle

Command owns the pipeline. Skills provide knowledge only.
```

---

## Command Patterns Summary

### Minimal Command

```markdown
---
description: Brief purpose
---

Instructions here.
```

### Standard Command

```markdown
---
description: Purpose description
allowed-tools: Tool1, Tool2
argument-hint: [arg1] [--flag]
---

# Title

## Arguments
- **arg1**: Description
- **--flag**: Description

## Instructions
[Steps]

## Output
[Examples]
```

### Full Command

```markdown
---
description: Purpose
allowed-tools: Tool1, Bash(cmd:*)
argument-hint: [required] [--optional]
model: sonnet
disable-model-invocation: true
---

# Title

## Arguments

$ARGUMENTS

- **required**: Description
- **--optional**: Description

## Pipeline Overview

```
Phase 1 → Phase 2 → Phase 3
```

## Instructions

### Phase 1: Name
[Steps]

### Phase 2: Name
[Steps]

## Output

### Success
[Format]

### Failure
[Format]

## Safety

| Check | Action |
|-------|--------|
| Risk | Mitigation |

## Key Principle

[Important note about design]
```
