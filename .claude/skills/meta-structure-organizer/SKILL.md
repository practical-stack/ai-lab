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
| [Boundary Cases](references/boundary-cases.md) | 10 common confusions |
| [Templates](references/templates/) | Spec templates for each type |

## Next Steps (After Diagnosis)

After diagnosing the component type, use the appropriate creation skill:

| Diagnosis | Next Action | Creation Skill |
|-----------|-------------|----------------|
| ⚡ **COMMAND** | Use spec template directly | [templates/command.yaml](references/templates/command.yaml) |
| 📚 **SKILL** | Load meta-skill-creator | [meta-skill-creator](../meta-skill-creator/SKILL.md) |
| 🤖 **AGENT** | Load meta-agent-creator | [meta-agent-creator](../meta-agent-creator/SKILL.md) |

> **Note**: This skill diagnoses *what* type to use. The creation skills guide *how* to build it.

## Platform Support

| Platform | Commands | Skills | Agents |
|----------|----------|--------|--------|
| **Claude Code** | `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` | Subagent via Task |
| **OpenCode** | `.opencode/commands/*.md` | `skills/*/SKILL.md` | `agents/*.md` |
| **Cursor** | `.cursor/commands/*.md` | `.cursor/rules/*.mdx` | Agent mode |
