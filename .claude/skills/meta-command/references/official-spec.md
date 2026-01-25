# Official Command Specification

Complete reference for Claude Code slash command frontmatter fields.

> Source: `anthropics/claude-code` via Context7

## Frontmatter Fields

All frontmatter fields are optional. The frontmatter block must be at the very top of the file.

### description

**Type:** String  
**Required:** Recommended  
**Purpose:** Brief description shown in command list and help

```yaml
description: Review code for security issues
```

Best practices:
- Keep concise (under 80 characters)
- Start with verb (Review, Generate, Deploy)
- Describe what, not how

---

### allowed-tools

**Type:** String or Array  
**Required:** No  
**Default:** Inherits from conversation permissions  
**Purpose:** Restricts which tools the command can use

#### Formats

Single tool:
```yaml
allowed-tools: Read
```

Multiple tools (comma-separated):
```yaml
allowed-tools: Read, Write, Edit
```

Multiple tools (array):
```yaml
allowed-tools:
  - Read
  - Write
  - Bash(git:*)
```

#### Tool Patterns

| Pattern | Meaning |
|---------|---------|
| `Read` | Specific tool by name |
| `Bash` | All bash commands (not recommended) |
| `Bash(git:*)` | Only git commands |
| `Bash(npm:*)` | Only npm commands |
| `Bash(kubectl:*)` | Only kubectl commands |
| `"*"` | All tools (not recommended) |

Best practices:
- Always scope Bash: `Bash(git:*)` instead of `Bash`
- List only tools actually needed
- Security-sensitive commands should have minimal tools

---

### argument-hint

**Type:** String  
**Required:** No  
**Purpose:** Placeholder shown in UI for expected arguments

```yaml
argument-hint: [file-path] [--dry-run]
```

Conventions:
- `[required-arg]` - Required argument
- `[--optional]` - Optional flag
- `<type>` - Type hint
- `...` - Multiple values

Examples:
```yaml
argument-hint: [app-name] [environment] [version]
argument-hint: [file-path] [--fix]
argument-hint: [query...]
```

---

### model

**Type:** String  
**Required:** No  
**Default:** Inherits from conversation  
**Purpose:** Specifies which Claude model executes the command

**Values:**
- `haiku` - Fastest, cheapest
- `sonnet` - Balanced
- `opus` - Most capable

```yaml
model: sonnet
```

Use cases:
- `haiku`: Simple formatting, quick lookups
- `sonnet`: Code review, standard tasks
- `opus`: Complex reasoning, architecture decisions

---

### disable-model-invocation

**Type:** Boolean  
**Required:** No  
**Default:** false  
**Purpose:** Prevents programmatic invocation by Claude

```yaml
disable-model-invocation: true
```

Use when:
- Destructive operations (delete, deploy to prod)
- Operations requiring human judgment
- Authorization/approval workflows

---

## Dynamic Content Syntax

### Argument Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$ARGUMENTS` | All arguments as raw string | `Review $ARGUMENTS` |
| `$1` | First argument | `Deploy $1 to staging` |
| `$2` | Second argument | `Deploy $1 to $2` |
| `$N` | Nth argument | `$3`, `$4`, etc. |

### File References

Include file content at parse time:

```markdown
Review the code in @src/main.ts
```

Reference skill documentation:
```markdown
Follow guidelines in @.claude/skills/skill-name/SKILL.md
```

### Embedded Bash

Execute bash at parse time and include output:

```markdown
Current branch: !`git branch --show-current`
Recent commits: !`git log -5 --oneline`
```

Use for:
- Dynamic context gathering
- Pre-flight checks
- Environment information

---

## Complete Example

```markdown
---
description: Deploy application to environment
argument-hint: [app-name] [environment] [version]
allowed-tools: Bash(kubectl:*), Bash(helm:*), Read
model: sonnet
disable-model-invocation: true
---

# Deploy Command

Deploy $1 to $2 environment using version $3.

## Arguments

$ARGUMENTS

- **app-name**: Application to deploy
- **environment**: Target environment (staging, production)
- **version**: Version tag to deploy

## Pre-deployment Checks

- Current cluster: !`kubectl cluster-info --context $2`
- Verify version exists: !`git tag -l $3`

## Instructions

1. Validate environment configuration for $2
2. Check cluster status
3. Execute helm deployment
4. Verify rollout status

## Output

### Success
```
Deployed $1 v$3 to $2
Status: Running
Pods: 3/3 healthy
```

### Failure
```
Deployment failed: [reason]
Rollback initiated
```

## Safety

| Check | Action |
|-------|--------|
| Production deploy | Require explicit confirmation |
| Version mismatch | Abort and warn |
```

---

## Field Validation Rules

| Field | Validation |
|-------|------------|
| `description` | Non-empty string, < 200 chars |
| `allowed-tools` | Valid tool names, proper Bash patterns |
| `argument-hint` | Matches argument usage in body |
| `model` | One of: haiku, sonnet, opus |
| `disable-model-invocation` | Boolean only |
