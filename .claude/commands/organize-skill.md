---
description: Validate and organize skills with best practices and spec
allowed-tools: Read, Glob, Write
argument-hint: [skill-path] [--fix] [--all]
---

# Organize Skill

Validate skill files against skill specification and best practices. Reports issues and optionally fixes them.

## Arguments

$ARGUMENTS

- **skill-path** (optional): Path to skill directory or SKILL.md
  - Single skill: `.claude/skills/my-skill/` or `.claude/skills/my-skill/SKILL.md`
  - Default: show usage help if omitted
- **--fix**: Auto-fix issues with confirmation
- **--all**: Validate all skills in `.claude/skills/`

## Usage Examples

```bash
# Validate single skill
/organize-skill .claude/skills/my-skill/

# Validate all skills
/organize-skill --all

# Validate and fix
/organize-skill .claude/skills/meta-command/ --fix
```

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│  /organize-skill (COMMAND - Orchestrator)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: DISCOVER                                          │
│  Find skill directories to validate                         │
│                                                             │
│  Phase 2: VALIDATE                                          │
│  📚 meta-skill skill                                        │
│  Check each skill against spec                              │
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
   - If `--all`: `glob(".claude/skills/*/SKILL.md")`
   - If directory: look for `SKILL.md` in that directory
   - If file: validate that SKILL.md
   - If empty: show usage help

2. List skills to validate:
   ```
   Found N skill(s) to validate:
   - .claude/skills/meta-command/SKILL.md
   - .claude/skills/meta-skill/SKILL.md
   ```

### Phase 2: VALIDATE

1. Read @.claude/skills/meta-skill/SKILL.md for validation rules

2. For each skill, check:

   **Frontmatter Checks:**
   | Check | Severity | Rule |
   |-------|----------|------|
   | `name` present | ERROR | Required, kebab-case, matches directory |
   | `description` present | ERROR | Required, includes triggers |
   | Triggers in description | WARNING | USE WHEN / DO NOT USE WHEN pattern |

   **Structure Checks:**
   | Check | Severity | Rule |
   |-------|----------|------|
   | SKILL.md exists | ERROR | Required |
   | SKILL.md < 500 lines | WARNING | Split to references if exceeded |
   | Directory name matches `name` | ERROR | Must be identical |
   | References linked | WARNING | All refs mentioned in SKILL.md |

   **Content Checks:**
   | Check | Severity | Rule |
   |-------|----------|------|
   | No TODO placeholders | WARNING | All placeholders resolved |
   | Workflow routing table | INFO | Recommended for multi-workflow skills |
   | Quick reference section | INFO | Recommended |

   **Anti-Pattern Checks:**
   | Check | Severity | Rule |
   |-------|----------|------|
   | Imperative orchestration | ERROR | No "Load skill X", "Run /command" |
   | Verbose description | WARNING | Be concise, focus on triggers |
   | Duplicated content | WARNING | Single source of truth |
   | Deeply nested refs | WARNING | Keep references 1 level deep |

   **Script Checks (if scripts/ exists):**
   | Check | Severity | Rule |
   |-------|----------|------|
   | Scripts executable | WARNING | Test all scripts |
   | Scripts documented | INFO | Usage in SKILL.md |

### Phase 3: REPORT

Generate report for each skill:

```markdown
## Skill Organization Report

### Skill: meta-command

| Check | Status | Details |
|-------|--------|---------|
| name | ✅ Pass | Matches directory |
| description | ✅ Pass | Has USE WHEN triggers |
| SKILL.md size | ✅ Pass | 164 lines |
| References linked | ✅ Pass | 3 refs, all linked |
| No imperative | ✅ Pass | Declarative only |
| Quick reference | ✅ Pass | Present |

**Summary:**
- 6 Pass
- 0 Warnings
- 0 Errors

### Structure
```
meta-command/
├── SKILL.md (164 lines)
└── references/
    ├── official-spec.md
    ├── best-practices.md
    └── examples.md
```
```

### Phase 4: FIX (if --fix)

For each fixable issue:

1. Show proposed fix with before/after
2. Wait for confirmation
3. Apply changes

Common fixes:
- Rename directory to match `name`
- Add missing trigger keywords
- Link unlinked references
- Remove imperative instructions

## Output

### Success (no issues)

```
## Skill Organization Report

✅ All N skills pass validation

No issues found.
```

### Issues Found

```
## Skill Organization Report

### Summary
- Skills checked: N
- Pass: X
- Warnings: Y
- Errors: Z

[Detailed per-skill reports]

### Quick Fixes

Run `/organize-skill --all --fix` to auto-fix Y issues.
```

## Safety

| Action | Requirement |
|--------|-------------|
| Read skills | Always allowed |
| Modify skills | Only with `--fix` + confirmation |
| Delete | Never |

## Key Principle

**This command validates organization.** The skill provides spec knowledge.

```
⚡ COMMAND: Orchestrates validation
    ↓
📚 SKILL: Provides skill spec and patterns
    ↓
🔧 TOOL: Read files, optionally Write fixes
```

## Validation Checklist Summary

### Frontmatter
- [ ] `name`: kebab-case, max 64 chars, matches directory
- [ ] `description`: includes triggers, purpose, when NOT to use

### Structure
- [ ] SKILL.md exists and < 500 lines
- [ ] References in `references/` directory
- [ ] All references linked from SKILL.md

### Content
- [ ] No TODO placeholders
- [ ] Declarative only (no "Load skill X")
- [ ] Quick reference for key patterns

### Progressive Disclosure
- [ ] Level 1 (~100 words): name + description
- [ ] Level 2 (<5k words): SKILL.md body
- [ ] Level 3: references/, scripts/, assets/

## Related

- Spec reference: @.claude/skills/meta-skill/SKILL.md
- Workflow patterns: @.claude/skills/meta-skill/references/workflows.md
- Structure organizer: @.claude/commands/organize-llm-structure.md
