---
name: meta-llm-type
description: |
  Diagnose features into the right LLM component type: Skill, Agent, or Command wrapper.
  
  USE WHEN: 
  - "should this be a skill?"
  - "command or agent?"
  - "what type should this be"
  - "skill vs command"
  - "diagnose this feature"
  - structure/architecture decisions for LLM components
  
  DO NOT USE WHEN:
  - Actually implementing (use the generated spec instead)
  - General coding tasks unrelated to structure design
---

# Structure Organizer

Organize features into the right structure: **Command**, **Skill**, or **Agent** for AI coding assistants.

## Quick Reference

### Core Types (Knowledge Layer)

| Component | Trigger | Reasoning | Execution | Use When |
|-----------|---------|-----------|-----------|----------|
| **Skill** | Auto-load on keywords / direct `@path` | None | No execution (knowledge) | Domain expertise to share |
| **Agent** | Goal assigned | LLM decides | Dynamic, iterative | Multi-step planning required |

### Optional Wrapper (Access Layer)

| Component | Trigger | Purpose | Use When |
|-----------|---------|---------|----------|
| **Command** | Human `/command` | UI entry point + constraints over Skill/Agent | `allowed-tools` restriction, dangerous ops, structured `$ARGUMENTS`, frequent shortcut |

> **Key insight**: Command is NOT a parallel type to Skill/Agent. It is an **access pattern** — a UI + security wrapper placed over Skills or Agents when human entry point and platform constraints are needed.

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

## Architecture Model

```
Knowledge Layer:  Skill (knowledge)  |  Agent (reasoning)
Access Layer:     Command (optional UI + constraints wrapper)
```

### Common Patterns

| Pattern | Structure | Use When |
|---------|-----------|----------|
| **Skill only** | Direct invocation via `@path` or keywords | Most cases — knowledge is self-sufficient |
| **Agent + Skills** | Executor + Knowledge | Agent needs domain expertise |
| **Command wrapping Skill** | Entry + Knowledge + Constraints | Tool restriction or frequent human shortcut needed |
| **Command wrapping Agent** | Entry → Executor | User triggers dangerous/complex work |
| **Full Stack** | Command → Agent → Skills → Tools | Critical ops needing all layers |

See [combination-patterns.md](references/combination-patterns.md) for details.

## Output

This skill outputs:
1. **Diagnosis** - Core type (Skill / Agent) + whether Command wrapper is needed
2. **Spec Template** - Filled template from `references/templates/`
3. **Rationale** - Why this type, why not others, and why Command wrapper is or isn't needed

> **Note**: This skill diagnoses *what* type to use. Implementation is handled by the calling Command.

## Platform Support

| Platform | Commands | Skills | Agents |
|----------|----------|--------|--------|
| **Claude Code** | `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` | Subagent via Task |
| **OpenCode** | `.opencode/commands/*.md` | `skills/*/SKILL.md` | `agents/*.md` |
| **Cursor** | `.cursor/commands/*.md` | `.cursor/rules/*.mdx` | Agent mode |
