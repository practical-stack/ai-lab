# Pattern 08: SKILL.md Format

**Effort:** 2 hours | **Impact:** Medium | **Level:** Foundation  
**Source:** [04-prompt-engineering.md](../04-prompt-engineering.md)

---

## The Problem

AI skills need:
- Structured metadata for automated loading
- Human-readable instructions
- Clear trigger conditions
- Optional MCP server configuration

---

## The Solution

Use YAML frontmatter for machine-readable metadata and Markdown body for instructions.

---

## Structure

```yaml
---
name: skill-name                    # Required: kebab-case identifier
description: |
  When to use this skill.
  USE WHEN: keyword triggers
  DO NOT USE WHEN: exclusions
mcp:                               # Optional: embedded MCP config
  server-name:
    command: npx
    args: ["@package/name"]
---
# Skill Title

[Markdown instructions for the AI]
```

---

## Frontmatter Schema

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Unique skill identifier (kebab-case) |
| `description` | Yes | Trigger phrases and usage guidance |
| `mcp` | No | Embedded MCP server configuration |
| `model` | No | Override model for this skill |
| `agent` | No | Agent to use for this skill |
| `allowed-tools` | No | Tool whitelist for this skill |

---

## Skill Directory Layout

```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions
├── workflows/            # Optional: step-by-step procedures
│   ├── create.md
│   └── update.md
├── references/           # Optional: on-demand documentation
│   └── api-reference.md
└── assets/               # Optional: templates, images
    └── template.ts
```

---

## Real Example: git-master

```yaml
---
name: git-master
description: |
  MUST USE for ANY git operations. Atomic commits, rebase/squash, 
  history search (blame, bisect, log -S).
  
  USE WHEN:
  - 'commit', 'rebase', 'squash'
  - 'who wrote', 'when was X added'
  - 'find the commit that'
  
  DO NOT USE WHEN:
  - Simple file operations (use regular tools)
  - Non-git version control
---
# Git Master

## Philosophy
Atomic commits. One logical change per commit. 3+ files = split required.

## Phase 1: Style Detection (BLOCKING)

<style_detection>
**THIS PHASE HAS MANDATORY OUTPUT**

### 1.1 Analyze existing commits
```bash
git log --oneline -30
```

### 1.2 MANDATORY OUTPUT (BLOCKING)
[output template...]
</style_detection>

## Phase 2: Planning
[...]

## Phase 3: Execution
[...]
```

---

## Skill Loading (How It Works)

When a skill is loaded, the system wraps it in XML:

```xml
<skill-instruction>
Base directory for this skill: /path/to/skill/
File references (@path) in this skill are relative to this directory.

[SKILL.md body content here]
</skill-instruction>

<user-request>
[User's actual request here]
</user-request>
```

---

## Progressive Disclosure

Skills use three levels of detail:

| Level | When Loaded | Content |
|-------|-------------|---------|
| **Metadata** | Always | Frontmatter (name, description) |
| **Body** | On trigger | SKILL.md instructions |
| **References** | On demand | Files in `references/` |

This saves tokens by only loading what's needed.

---

## Workflow Routing

For complex skills with multiple workflows:

```markdown
## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Create new X | [workflows/create.md](workflows/create.md) |
| Update existing X | [workflows/update.md](workflows/update.md) |
| Delete X | [workflows/delete.md](workflows/delete.md) |

Identify the intent first, then follow the appropriate workflow.
```

---

## Reference Files

For detailed documentation that's not always needed:

```markdown
## Core Resources

| Resource | Purpose |
|----------|---------|
| [API Reference](references/api.md) | Full API documentation |
| [Error Codes](references/errors.md) | Error handling guide |

Load references only when needed for the specific task.
```

---

## When to Split from TypeScript

| Criteria | Keep in TypeScript | Extract to SKILL.md |
|----------|-------------------|---------------------|
| Length | < 100 lines | > 100 lines |
| Complexity | Simple template | Multi-phase workflow |
| BLOCKING phases | None | Has BLOCKING checkpoints |
| Updates | Rare, stable | Frequent iteration |
| Sharing | Internal only | May be extracted/shared |

**Migration Pattern:**
```
Start: Inline in TypeScript
  ↓
Exceeds 200 lines? → Extract to SKILL.md
Has BLOCKING checkpoints? → Extract to SKILL.md
Needs sharing/versioning? → Extract to SKILL.md
```

---

## Key Principles

1. **Concise** - Only add what AI doesn't already know
2. **Progressive disclosure** - Metadata always, body on trigger, references on-demand
3. **Actionable** - Focus on "what to do", not background theory
4. **Size limit** - Keep SKILL.md under 500 lines (split to references/)

---

## Adoption Checklist

- [ ] Create skill directory structure
- [ ] Add YAML frontmatter with name and description
- [ ] Include USE WHEN and DO NOT USE WHEN triggers
- [ ] Add workflow routing if multiple paths
- [ ] Move detailed docs to references/
- [ ] Keep SKILL.md under 500 lines

---

## See Also

- [04-xml-tag-structure.md](./04-xml-tag-structure.md) - XML wrapping details
- [01-blocking-checkpoints.md](./01-blocking-checkpoints.md) - BLOCKING pattern in skills
- [../04-prompt-engineering.md](../04-prompt-engineering.md) - Full prompt engineering
