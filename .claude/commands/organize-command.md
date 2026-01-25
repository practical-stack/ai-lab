---
description: Validate and organize commands with official Claude Code spec
allowed-tools: Read, Glob, Write
argument-hint: [command-path] [--fix] [--all]
---

# Organize Command

Validate command files against official Claude Code specification. Reports issues and optionally fixes them.

## Arguments

$ARGUMENTS

- **command-path** (optional): Path to command file or directory
  - Single file: `.claude/commands/my-command.md`
  - Directory: `.claude/commands/git/`
  - Default: current command if omitted
- **--fix**: Auto-fix issues with confirmation
- **--all**: Validate all commands in `.claude/commands/`

## Usage Examples

```bash
# Validate single command
/organize-command .claude/commands/my-command.md

# Validate all commands
/organize-command --all

# Validate and fix
/organize-command .claude/commands/git/ --fix
```

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│  /organize-command (COMMAND - Orchestrator)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: DISCOVER                                          │
│  Find command files to validate                             │
│                                                             │
│  Phase 2: VALIDATE                                          │
│  📚 meta-command skill                                      │
│  Check each command against spec                            │
│                                                             │
│  Phase 3: REPORT                                            │
│  Generate organization report                                  │
│                                                             │
│  Phase 4: FIX (if --fix)                                    │
│  Apply fixes with confirmation                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Instructions

### Phase 1: DISCOVER

1. Parse arguments to determine scope:
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

1. Read @.claude/skills/meta-command/SKILL.md for validation rules

2. For each command file, check:

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
   | Proper hierarchy | INFO | Command → Skill → Tool |

### Phase 3: REPORT

Generate report for each file:

```markdown
## Command Organization Report

### File: .claude/commands/example.md

| Check | Status | Details |
|-------|--------|---------|
| description | ✅ Pass | Present |
| allowed-tools | ⚠️ Warning | `Bash` too broad → use `Bash(git:*)` |
| argument-hint | ✅ Pass | Matches ## Arguments |
| ## Instructions | ✅ Pass | Present |
| ## Output | ❌ Missing | Add output examples |
| Skill references | ✅ Pass | All exist |

**Summary:**
- 4 Pass
- 1 Warning
- 1 Missing

### Recommendations

1. Scope `allowed-tools`:
   ```yaml
   allowed-tools: Bash(git:*), Read
   ```

2. Add output section:
   ```markdown
   ## Output
   
   ### Success
   [expected output]
   ```
```

For `--all`, show summary:

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
   ✅ Fixed N issues in M files
   
   Manual review needed:
   - [FILL: ...] placeholders require your input
   ```

## Output

### Success (no issues)

```
## Command Organization Report

✅ All N commands pass validation

No issues found.
```

### Issues Found

```
## Command Organization Report

### Summary
- Files checked: N
- Pass: X
- Warnings: Y
- Errors: Z

[Detailed per-file reports]

### Quick Fixes

Run `/organize-command --all --fix` to auto-fix Y issues.
```

### Fix Applied

```
✅ Applied N fixes

Files modified:
- .claude/commands/file1.md (2 fixes)
- .claude/commands/file2.md (1 fix)

Verify changes with: git diff .claude/commands/
```

## Safety

| Action | Requirement |
|--------|-------------|
| Read commands | Always allowed |
| Modify commands | Only with `--fix` + confirmation |
| Delete | Never |

## Key Principle

**This command validates organization.** The skill provides spec knowledge.

```
⚡ COMMAND: Orchestrates validation, decides what to check
    ↓
📚 SKILL: Provides official spec rules and patterns
    ↓
🔧 TOOL: Read files, optionally Write fixes
```

## Related

- Spec reference: @.claude/skills/meta-command/SKILL.md
- Structure organizer: @.claude/commands/organize-llm-structure.md
- Official examples: @.claude/skills/meta-command/references/examples.md
