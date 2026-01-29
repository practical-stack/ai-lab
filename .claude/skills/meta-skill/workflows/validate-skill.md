# Validate Skill

Validate skill files against the skill specification and best practices. Reports issues and optionally fixes them.

## Triggers

- "validate skill", "check skill", "organize skill"
- "validate all skills", "skill audit"

## Input

- **skill-path** (optional): Path to skill directory or SKILL.md
  - Single skill: `.claude/skills/my-skill/` or `.claude/skills/my-skill/SKILL.md`
- **--fix**: Auto-fix issues with confirmation
- **--all**: Validate all skills in `.claude/skills/`
- Default (no args): Show usage help

## Workflow

### Phase 1: DISCOVER

1. Determine scope:
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

For each skill, check against these rules:

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
| Excessive orchestration (3+) | WARNING | 3+ unrelated skill invocations suggest Command/Agent |
| Verbose description | WARNING | Be concise, focus on triggers |
| Duplicated content | WARNING | Single source of truth |
| Deeply nested refs | WARNING | Keep references 1 level deep |

**Script Checks (if scripts/ exists):**

| Check | Severity | Rule |
|-------|----------|------|
| Scripts executable | WARNING | Test all scripts |
| Scripts documented | INFO | Usage in SKILL.md |

> **Note:** The `validate-skill.ts` script can also run these checks programmatically:
> ```bash
> bun scripts/validate-skill.ts <skill-folder>
> ```

### Phase 3: REPORT

Generate report for each skill:

```markdown
## Skill Validation Report

### Skill: meta-command

| Check | Status | Details |
|-------|--------|---------|
| name | Pass | Matches directory |
| description | Pass | Has USE WHEN triggers |
| SKILL.md size | Pass | 164 lines |
| References linked | Pass | 3 refs, all linked |
| No excessive orchestration | Pass | Declarative only |
| Quick reference | Pass | Present |

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

For `--all`, include an overall summary:

```
## Overall Summary
- Skills checked: N
- Pass: X
- Warnings: Y
- Errors: Z
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
- Simplify excessive orchestration

## Safety

| Action | Requirement |
|--------|-------------|
| Read skills | Always allowed |
| Modify skills | Only with `--fix` + confirmation |
| Delete | Never |

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
- [ ] No excessive orchestration (3+ unrelated skill invocations)
- [ ] Quick reference for key patterns

### Progressive Disclosure
- [ ] Level 1 (~100 words): name + description
- [ ] Level 2 (<5k words): SKILL.md body
- [ ] Level 3: references/, scripts/, assets/
