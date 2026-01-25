# AI Lab: LLM Research Workspace

Research workspace for analyzing hyped LLM tools and extracting actionable insights.

## PURPOSE

Research trending topics → Multi-model analysis → Extract reusable artifacts

**Goal**: Turn LLM hype into practical, reusable knowledge (skills, prompts, patterns).

## DIRECTORY STRUCTURE

```
ai-lab/
├── docs/                         # Research documents
│   └── NN-topic-name/
│       ├── README.md             # Topic overview (EN + KO)
│       ├── meta-prompt.md        # Reusable prompt template
│       └── research/             # Multi-model analysis
│           ├── 00-research-prompt.md
│           ├── 01-claude.md
│           ├── 02-gpt.md
│           └── 03-gemini.md
├── .claude/                      # Claude Code artifacts
│   ├── skills/                   # Extracted skills
│   │   └── skill-name/SKILL.md
│   └── commands/                 # Custom commands
├── meta-skill/                   # Meta-level tooling
├── refs/                         # Reference repositories (gitignored)
├── AGENTS.md                     # This file
└── README.md
```

## RESEARCH WORKFLOW

### Phase 1: Research

Create `docs/NN-topic-name/` with:

| File | Purpose |
|------|---------|
| `README.md` | Topic overview, quick reference |
| `README.ko.md` | Korean version (if needed) |
| `meta-prompt.md` | Reusable prompt for the topic |
| `research/00-research-prompt.md` | Initial research prompt |

### Phase 2: Multi-Model Analysis

Run the research prompt against multiple models:

| File | Model |
|------|-------|
| `research/01-claude.md` | Claude (Sonnet/Opus) |
| `research/02-gpt.md` | GPT-4 |
| `research/03-gemini.md` | Gemini |

Compare and synthesize insights.

### Phase 3: Extract Artifacts

Create reusable artifacts from research:

| Artifact Type | Location | When to Use |
|---------------|----------|-------------|
| **Skill** | `.claude/skills/skill-name/` | Domain knowledge for AI assistants |
| **Command** | `.claude/commands/` | User-triggered procedures |
| **Prompt** | `docs/NN-topic/meta-prompt.md` | Reusable prompt templates |
| **Pattern** | Document in README | General best practices |

## CURRENT RESEARCH

| # | Topic | Status | Artifacts |
|---|-------|--------|-----------|
| 01 | Structure Organizer | Done | Skill: `.claude/skills/meta-structure-organizer/` |
| 02 | Naming Convention | Done | Reference: `docs/02-naming-convention/` |

## SKILL PATTERNS

### Naming Convention (kebab-case)

All components use **kebab-case**:

| Component | Directory/File | `name` field |
|-----------|----------------|--------------|
| Skill | `skill-name/SKILL.md` | `skill-name` |
| Agent | `agent-name.md` | `agent-name` |
| Command | `command-name.md` | _(none)_ |

See [`docs/02-naming-convention/`](./docs/02-naming-convention/) for details.

### SKILL.md Structure

```yaml
---
name: skill-name
description: |
  When to use this skill.
  USE WHEN: keyword triggers
  DO NOT USE WHEN: exclusions
---
# Skill Title

[Instructions for the AI]

## Workflow Routing
| Intent | Workflow |
|--------|----------|
| Action A | [workflows/a.md](workflows/a.md) |

## Core Resources
| Resource | Purpose |
|----------|---------|
| [Reference](references/ref.md) | Description |
```

### Skill Directory Layout

```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions
├── workflows/            # Optional: step-by-step procedures
├── references/           # Optional: on-demand documentation
└── assets/               # Optional: templates, images
```

### Key Principles

1. **Concise** - Only add what AI doesn't already know
2. **Progressive disclosure** - Metadata always loaded, body on trigger, references on-demand
3. **Actionable** - Focus on "what to do", not background theory

## REFERENCE REPOSITORIES

Optional reference repos can be cloned to `refs/` (gitignored):

| Repo | Focus |
|------|-------|
| `refs/oh-my-claudecode/` | Claude Code multi-agent orchestration |
| `refs/skills/` | Official Claude skill collection |
| `refs/agent-skills/` | Vercel-focused Claude skills |

## RESEARCH CHECKLIST

When researching a new topic:

- [ ] Create `docs/NN-topic-name/` structure
- [ ] Write initial research prompt
- [ ] Run against Claude, GPT, Gemini
- [ ] Compare and synthesize findings
- [ ] Identify extractable artifacts
- [ ] Create skill/command/prompt as appropriate
- [ ] Update research topics table in README

## CODE CONVENTIONS

### Markdown Files

- **Language**: English primary, Korean (`*.ko.md`) when needed
- **Frontmatter**: YAML for metadata
- **Headings**: Start with `#`, use hierarchy
- **Tables**: For structured comparisons

### Skill Files

- **Frontmatter**: `name` + `description` required
- **Body**: Imperative/infinitive form
- **Size**: Keep SKILL.md under 500 lines, split to references/

## SEE ALSO

- Example research: `docs/01-structure-organizer/`
- Example skill: `.claude/skills/meta-structure-organizer/`
