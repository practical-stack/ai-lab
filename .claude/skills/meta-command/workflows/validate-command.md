# Validate Command

Validate command files against the official Claude Code specification. Reports issues and optionally fixes them.

## Triggers

- "validate command", "check command", "organize command"
- "validate all commands", "command audit"

## Input

- **command-path** (optional): Path to command file or directory
  - Single file: `.claude/commands/my-command.md`
  - Directory: `.claude/commands/git/`
- **--fix**: Auto-fix issues with confirmation
- **--all**: Validate all commands in `.claude/commands/`
- Default (no args): Show usage help

## Workflow

### Phase 1: DISCOVER

1. Determine scope:
   - If `--all`: `glob(".claude/commands/**/*.md")`
   - If directory: `glob("{path}/**/*.md")`
   - If file: validate that single file
   - If empty: show usage help

2. List files to validate:
   ```
   Found N command(s) to validate:
   - .claude/commands/file1.md
   - .claude/commands/file2.md
   ```

### Phase 2: VALIDATE

For each command file, check against these rules:

**Frontmatter Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| `description` present | ERROR | Required for discoverability |
| `allowed-tools` scoped | WARNING | Prefer `Bash(cmd:*)` over `Bash` |
| `argument-hint` matches body | WARNING | If hint exists, `## Arguments` should too |
| `model` valid | ERROR | Must be haiku/sonnet/opus |
| `disable-model-invocation` for destructive | INFO | Recommended for delete/deploy |

**Structure Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| `## Arguments` if hint exists | WARNING | Document arguments |
| `## Instructions` or workflow | INFO | Recommended |
| `## Output` examples | INFO | Recommended |
| `## Safety` for side effects | WARNING | Required if tools include Write/Bash |

**Skill Integration Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| Skills use `@` syntax | INFO | Use `@.claude/skills/...` |
| Referenced skills exist | ERROR | Validate paths |
| No hardcoded domain knowledge | WARNING | Extract to skill |

**Relationship Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| Command owns pipeline | WARNING | Skills shouldn't orchestrate |
| Proper hierarchy | INFO | Command -> Skill -> Tool |

### Phase 3: REPORT

Generate report for each file:

```markdown
## Command Validation Report

### File: .claude/commands/example.md

| Check | Status | Details |
|-------|--------|---------|
| description | Pass | Present |
| allowed-tools | Warning | `Bash` too broad -> use `Bash(git:*)` |
| argument-hint | Pass | Matches ## Arguments |
| ## Instructions | Pass | Present |
| ## Output | Missing | Add output examples |
| Skill references | Pass | All exist |

**Summary:**
- 4 Pass
- 1 Warning
- 1 Missing
```

For `--all`, include an overall summary:

```markdown
## Overall Summary

| File | Pass | Warn | Error |
|------|------|------|-------|
| file1.md | 5 | 1 | 0 |
| file2.md | 4 | 2 | 1 |

**Total: 2 files, 9 pass, 3 warnings, 1 error**
```

### Phase 4: FIX (if --fix)

For each fixable issue:

1. Show proposed fix:
   ```markdown
   ### Proposed Fix: example.md

   **Issue:** Missing description

   **Before:**
   ```yaml
   ---
   allowed-tools: Read
   ---
   ```

   **After:**
   ```yaml
   ---
   description: [FILL: Brief description of command purpose]
   allowed-tools: Read
   ---
   ```

   Apply this fix? (y/n)
   ```

2. Wait for confirmation before each file modification

3. After fixes:
   ```
   Fixed N issues in M files

   Manual review needed:
   - [FILL: ...] placeholders require your input
   ```

## Safety

| Action | Requirement |
|--------|-------------|
| Read commands | Always allowed |
| Modify commands | Only with `--fix` + confirmation |
| Delete | Never |
