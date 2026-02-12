# Skills Catalog

**Generated:** 2026-02-12 | **Commit:** 4a2d0ba

Extracted skills from ai-lab research. Each skill follows the standard structure.

## SKILL INDEX

| Skill | Triggers | Purpose |
|-------|----------|---------|
| [doc-frontmatter](doc-frontmatter/) | "frontmatter", "add frontmatter" | Generate/validate YAML frontmatter for docs |
| [learning-content-creator](learning-content-creator/) | "create learning content", "research to learning" | Transform research into structured learning content |
| [llm-repo-analysis](llm-repo-analysis/) | "analyze this LLM repo", "extract patterns from" | Deep analysis of LLM repos → structured documentation |
| [meta-agent](meta-agent/) | "create an agent", "validate agent" | Guide for creating and validating AI agents |
| [meta-command](meta-command/) | "create a command", "validate command" | Guide for creating and validating commands |
| [meta-prompt-engineer](meta-prompt-engineer/) | "write a prompt", "create prompt", "meta-prompt" | Generate high-quality prompts using proven techniques |
| [meta-session-wrapper](meta-session-wrapper/) | "wrap this session", "extract workflow" | Extract reusable patterns from completed sessions |
| [meta-skill](meta-skill/) | "create a skill", "validate skill" | Guide for creating and validating AI skills |
| [meta-llm-type](meta-llm-type/) | "should this be a skill?", "diagnose this feature" | Diagnose features into Skill/Agent/Command type |

## STRUCTURE PATTERN

```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions
├── workflows/            # Optional: step-by-step procedures
├── references/           # Optional: on-demand documentation
├── scripts/              # Optional: validation/generation scripts
└── assets/               # Optional: templates
```

## FRONTMATTER FORMAT

```yaml
---
name: skill-name          # kebab-case, matches directory
description: Natural prose describing what it does. Use when [triggers woven
  into sentences]. No structured labels like "USE WHEN:" — write 1-3 sentences.
---
```

## SEE ALSO

- Root [AGENTS.md](../../AGENTS.md) for full skill patterns
- [docs/02-naming-convention/](../../docs/02-naming-convention/) for naming rules
