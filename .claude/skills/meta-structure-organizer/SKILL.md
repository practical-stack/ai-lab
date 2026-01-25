---
name: meta-structure-organizer
description: |
  Organize features into the right structure: Command, Skill, or Agent.
  
  USE WHEN: 
  - "should this be a skill?"
  - "command or agent?"
  - "how to structure this feature"
  - "what type should this be"
  - "skill vs command"
  - structure/architecture decisions
  
  DO NOT USE WHEN:
  - Actually implementing (use the generated spec instead)
  - General coding tasks unrelated to structure design
---

# Structure Organizer

Organize features into the right structure: **Command**, **Skill**, or **Agent** for AI coding assistants.

## Quick Reference

| Component | Trigger | Reasoning | Execution | Use When |
|-----------|---------|-----------|-----------|----------|
| **Command** | Human `/command` | None | Fixed procedure | Explicit user trigger needed |
| **Skill** | Auto-load on keywords | None | No execution (knowledge) | Domain expertise to share |
| **Agent** | Goal assigned | LLM decides | Dynamic, iterative | Multi-step planning required |

## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Analyze a feature request | [workflows/analyze.md](workflows/analyze.md) |
| Generate spec template | [workflows/generate-spec.md](workflows/generate-spec.md) |

## Core Resources

| Resource | Purpose |
|----------|---------|
| [Decision Tree](references/decision-tree.md) | Primary decision logic |
| [Criteria Matrix](references/criteria.md) | Detailed comparison criteria |
| [Boundary Cases](references/boundary-cases.md) | 12 common confusions |
| [Combination Patterns](references/combination-patterns.md) | Multi-component architectures |
| [Templates](references/templates/) | Spec templates for each type |

## Combination Patterns

Most real features need **multiple component types**. Common patterns:

| Pattern | Structure | Use When |
|---------|-----------|----------|
| **Command + Agent** | Entry → Executor | User triggers complex work |
| **Agent + Skills** | Executor + Knowledge | Agent needs domain expertise |
| **Command + Skills** | Entry + Knowledge | Procedure needs domain knowledge |
| **Full Stack** | Command → Agent → Skills → Tools | Complete feature |

See [combination-patterns.md](references/combination-patterns.md) for details.

## Output

This skill outputs:
1. **Diagnosis** - Component type (Command / Skill / Agent / Combination)
2. **Spec Template** - Filled template from `references/templates/`
3. **Rationale** - Why this type, why not others

> **Note**: This skill diagnoses *what* type to use. Implementation is handled by the calling Command.

## Platform Support

| Platform | Commands | Skills | Agents |
|----------|----------|--------|--------|
| **Claude Code** | `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` | Subagent via Task |
| **OpenCode** | `.opencode/commands/*.md` | `skills/*/SKILL.md` | `agents/*.md` |
| **Cursor** | `.cursor/commands/*.md` | `.cursor/rules/*.mdx` | Agent mode |
