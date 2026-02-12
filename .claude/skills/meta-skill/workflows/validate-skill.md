# Validate Skill

Validate skill files against Anthropic's official skill specification and project best practices. Reports issues and optionally fixes them.

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
| `name` present | ERROR | Required, kebab-case, max 64 chars, matches directory |
| `name` not reserved | ERROR | Must not contain "claude" or "anthropic" |
| `description` present | ERROR | Required, includes triggers |
| `description` length | WARNING | Under 1024 characters |
| `description` no XML | ERROR | No angle brackets (`<` or `>`) |
| Trigger phrases in desc | WARNING | Include what users would actually say |
| Negative triggers | INFO | Recommended: "Do NOT use for..." |

**Structure Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| SKILL.md exists | ERROR | Exact case: `SKILL.md` |
| No README.md | ERROR | Must not exist in skill folder |
| SKILL.md < 500 lines | WARNING | Split to references if exceeded |
| Directory name matches `name` | ERROR | Must be identical |
| References linked | WARNING | All refs mentioned in SKILL.md |
| No deeply nested refs | WARNING | Keep references 1 level deep |

**Content Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| No TODO placeholders | WARNING | All placeholders resolved |
| Examples section | INFO | Recommended if skill has user-facing triggers |
| Troubleshooting section | INFO | Recommended if skill involves MCP/scripts |
| Workflow routing table | INFO | Project convention (not in Anthropic spec) — for multi-workflow skills |

**Anti-Pattern Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| Excessive orchestration (3+) | WARNING | 3+ unrelated skill invocations suggest Command/Agent |
| Verbose description | WARNING | Be concise, focus on triggers |
| Duplicated content | WARNING | Single source of truth |
| Verbose instructions | WARNING | Claude may ignore overly verbose instructions |

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
| name | Pass | kebab-case, matches directory |
| name not reserved | Pass | No reserved prefixes |
| description | Pass | Has trigger phrases, under 1024 chars |
| description no XML | Pass | No angle brackets |
| SKILL.md exists | Pass | Exact case match |
| No README.md | Pass | Not present |
| SKILL.md size | Pass | 164 lines |
| Examples section | Pass | 2 examples found |
| References linked | Pass | 3 refs, all linked |
| No excessive orchestration | Pass | Declarative only |

**Summary:**
- 10 Pass
- 0 Warnings
- 0 Errors
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
- Remove README.md from skill folder
- Link unlinked references
- Truncate description over 1024 chars
- Remove XML brackets from frontmatter

## Safety

| Action | Requirement |
|--------|-------------|
| Read skills | Always allowed |
| Modify skills | Only with `--fix` + confirmation |
| Delete | Never (except README.md removal with confirmation) |

## Validation Checklist Summary

### Frontmatter
- [ ] `name`: kebab-case, max 64 chars, matches directory
- [ ] `name`: no "claude" or "anthropic" (reserved)
- [ ] `description`: [What] + [When], under 1024 chars
- [ ] `description`: no XML angle brackets
- [ ] `description`: includes trigger phrases users would say

### Structure
- [ ] `SKILL.md` exists (exact case)
- [ ] No `README.md` in skill folder
- [ ] SKILL.md under 500 lines
- [ ] References in `references/` directory (1 level deep)
- [ ] All references linked from SKILL.md

### Content
- [ ] No TODO placeholders
- [ ] Examples section (recommended for user-facing skills)
- [ ] Troubleshooting section (recommended for MCP/script skills)
- [ ] No excessive orchestration (3+ unrelated invocations)

### Progressive Disclosure
- [ ] Level 1 (~100 words): name + description (frontmatter)
- [ ] Level 2 (<5k words): SKILL.md body
- [ ] Level 3: references/, scripts/, assets/
