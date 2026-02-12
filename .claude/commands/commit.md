---
description: Analyze git status and create purpose-based atomic commits
allowed-tools: Bash, Read, Write, TodoWrite, TodoRead
argument-hint: "[scope] [--dry-run]"
---

# Git Commit Command

Create atomic, purpose-based commits from current changes.

## Arguments

$ARGUMENTS

- **scope** (optional): Limit to specific path(s)
- **--dry-run** (optional): Preview commits without executing

## Instructions

Load the **git-master** skill and execute in COMMIT mode:

1. **Context Gathering** (parallel):
   - `git status` - all changed files
   - `git diff --staged --stat` + `git diff --stat` - change overview
   - `git branch --show-current` - branch context

2. **Commit Message Format**: `type(scope): description`
   - `type`: feat, fix, refactor, docs, test, chore, style, perf, ci, build
   - `scope`: module or area affected (e.g., auth, ui, config, skill)
   - `description`: concise summary of the change
   - Example: `feat(auth): add OAuth2 login`
   - Example: `fix(ui): correct button alignment`
   - Example: `docs(skill): update meta-skill reference`

3. **Purpose-Based Grouping**:
   - Group by **logical purpose**, NOT by file count or directory
   - Same feature/fix/refactor = same commit (even if 10+ files)
   - Different purposes = different commits (even if same directory)
   - Pair tests with implementation
   - Output commit plan with justifications

4. **Execution** (unless --dry-run):
   - Stage and commit each group in dependency order
   - Add Sisyphus attribution footer
   - Verify clean working directory after

## Commit Rules (NON-NEGOTIABLE)

| Rule | Enforcement |
|------|-------------|
| Same purpose = same commit | Even if 10+ files across directories |
| Different purposes = different commits | Even if in same directory |
| Test + implementation = same commit | Always |
| Format: `type(scope): description` | Always use this format |

### Anti-Pattern: Over-Splitting

**WRONG**: 3 files → 3 commits (splitting by file)
**WRONG**: 2 directories → 2 commits (splitting by directory)
**CORRECT**: 1 feature → 1 commit (grouping by purpose)

## Safety

| Action | Requirement |
|--------|-------------|
| NEVER skip hooks | No `--no-verify` |
| NEVER amend pushed commits | Unless explicitly requested |
| NEVER commit sensitive files | Warn on .env, credentials |

## Output

### Success
```
COMMIT SUMMARY
==============
Created N commits:

1. abc1234 feat(auth): add OAuth2 login
   - src/auth/oauth.ts
   - src/auth/oauth.test.ts

2. def5678 fix(ui): correct button alignment
   - src/components/Button.tsx
```

### Dry Run
```
COMMIT PLAN (dry-run)
=====================
Would create N commits:

COMMIT 1: feat(auth): add OAuth2 login
  - src/auth/oauth.ts
  - src/auth/oauth.test.ts
  Justification: implementation + test

COMMIT 2: fix(ui): correct button alignment
  - src/components/Button.tsx
  Justification: independent UI fix
```