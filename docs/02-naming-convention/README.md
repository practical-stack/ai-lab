# Naming Convention

> Naming conventions for **Skill**, **Agent**, and **Command** in Claude Code / OpenCode ecosystems

This document summarizes naming patterns observed across 6 reference repositories.

## Quick Reference

| Component | Directory/File Pattern | Frontmatter `name` | Example |
|-----------|------------------------|-------------------|---------|
| **Skill** | `skill-name/SKILL.md` | `skill-name` | `frontend-ui-ux/SKILL.md` |
| **Agent** | `agent-name.md` | `agent-name` | `code-reviewer.md` |
| **Command** | `command-name.md` | _(none, uses filename)_ | `review-pr.md` |

## The Rule: kebab-case

```
kebab-case
├── lowercase only
├── words-separated-by-hyphens
├── no_underscores
├── no PascalCase
└── no camelCase
```

**All repositories consistently use `kebab-case`. No exceptions observed.**

---

## 1. Skill Naming

### Structure

```
skills/
└── skill-name/
    ├── SKILL.md          # Required (uppercase)
    ├── scripts/          # Optional
    ├── references/       # Optional
    └── assets/           # Optional
```

### Frontmatter

```yaml
---
name: skill-name          # kebab-case, matches directory
description: |
  When to use this skill.
  USE WHEN: trigger phrases
  DO NOT USE WHEN: exclusions
---
```

### Examples (Observed)

| Repository | Directory | `name` field |
|------------|-----------|--------------|
| skills (Anthropic) | `skill-creator` | `skill-creator` |
| skills | `web-artifacts-builder` | `web-artifacts-builder` |
| skills | `doc-coauthoring` | `doc-coauthoring` |
| agent-skills (Vercel) | `react-best-practices` | `vercel-react-best-practices` |
| oh-my-claudecode | `frontend-ui-ux` | `frontend-ui-ux` |
| oh-my-claudecode | `git-master` | `git-master` |
| oh-my-claudecode | `cancel-ralph` | `cancel-ralph` |
| plugins-for-claude-natives | `tech-decision` | `tech-decision` |
| plugins-for-claude-natives | `session-wrap` | `session-wrap` |

---

## 2. Agent Naming

### Structure

```
agents/
├── agent-name.md
├── agent-name-low.md      # Tier variant (optional)
├── agent-name-high.md     # Tier variant (optional)
└── ...
```

### Frontmatter

```yaml
---
name: agent-name          # kebab-case, matches filename
description: One-line description of agent purpose
model: sonnet             # or opus, haiku, etc.
tools: Read, Grep, Glob   # Tool whitelist
---
```

### Examples (Observed)

| Repository | File | `name` field |
|------------|------|--------------|
| oh-my-claudecode | `explore.md` | `explore` |
| oh-my-claudecode | `architect.md` | `architect` |
| oh-my-claudecode | `executor-high.md` | `executor-high` |
| oh-my-claudecode | `qa-tester.md` | `qa-tester` |
| plugins-for-claude-natives | `tradeoff-analyzer.md` | `tradeoff-analyzer` |
| plugins-for-claude-natives | `doc-updater.md` | `doc-updater` |
| plugins-for-claude-natives | `codebase-explorer.md` | `codebase-explorer` |
| claude-cookbooks | `code-reviewer.md` | `code-reviewer` |
| claude-cookbooks | `financial-analyst.md` | `financial-analyst` |

### Tier Variants

When agents have model-tier variants, append suffix:

| Base Agent | Low Tier | Medium Tier | High Tier |
|------------|----------|-------------|-----------|
| `executor` | `executor-low` | `executor` | `executor-high` |
| `designer` | `designer-low` | `designer` | `designer-high` |
| `architect` | `architect-low` | `architect-medium` | `architect` |

---

## 3. Command Naming

### Structure

```
commands/
├── command-name.md
└── ...
```

### Frontmatter

```yaml
---
description: What this command does
allowed-tools: Read, Grep, Bash(git:*)   # Optional tool restrictions
---
```

**Note:** Commands do NOT have a `name` field. The filename becomes the slash command.

### Examples (Observed)

| Repository | File | Invoked As |
|------------|------|------------|
| oh-my-claudecode | `deepsearch.md` | `/deepsearch` |
| oh-my-claudecode | `analyze.md` | `/analyze` |
| oh-my-claudecode | `cancel-ralph.md` | `/cancel-ralph` |
| oh-my-claudecode | `ralph-init.md` | `/ralph-init` |
| claude-cookbooks | `review-pr.md` | `/review-pr` |
| claude-cookbooks | `notebook-review.md` | `/notebook-review` |
| plugins-for-claude-natives | `wrap.md` | `/wrap` |

---

## 4. Analyzed Repositories

| Repository | Focus | Location |
|------------|-------|----------|
| `skills` | Anthropic official skills | `refs/skills/` |
| `agent-skills` | Vercel skills (React, Deploy) | `refs/agent-skills/` |
| `oh-my-claudecode` | Claude Code orchestration | `refs/oh-my-claudecode/` |
| `oh-my-opencode` | OpenCode orchestration | `refs/oh-my-opencode/` |
| `plugins-for-claude-natives` | Community plugins | `refs/plugins-for-claude-natives/` |
| `claude-cookbooks` | Anthropic cookbook examples | `refs/claude-cookbooks/` |

---

## 5. Summary

### Naming Pattern

```
Component Type    Directory/File           name Field
─────────────────────────────────────────────────────
Skill             kebab-case/SKILL.md      kebab-case
Agent             kebab-case.md            kebab-case
Command           kebab-case.md            (none)
```

### Key Rules

1. **Always kebab-case** - No exceptions across all repositories
2. **SKILL.md is uppercase** - The only uppercase filename
3. **Commands have no name field** - Filename = command name
4. **Agent tiers use suffixes** - `-low`, `-medium`, `-high`
5. **name matches directory/filename** - Consistency is mandatory

## Contents

| File | Description |
|------|-------------|
| [`research/00-raw-analysis.md`](./research/00-raw-analysis.md) | Raw data from repository analysis |

## See Also

- [Agent Skills Spec](https://agentskills.io/specification) - Official specification
- [Claude Code Skills Guide](https://support.claude.com/en/articles/12512198-creating-custom-skills) - Anthropic documentation
