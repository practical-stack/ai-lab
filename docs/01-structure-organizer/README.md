---
title: "Component Architect"
description: "Determine the core type (Skill or Agent) and whether a Command wrapper is needed for AI coding assistant features."
type: index
tags: [Architecture, AI, BestPractice]
order: 1
related: [./README.ko.md]
used_by: [/.claude/skills/meta-llm-type/SKILL.md, /.claude/commands/diagnose-llm-type.md]
---

# Component Architect

> Determine the core type (Skill or Agent) and whether a Command wrapper is needed

This tool provides a systematic approach to component type selection for AI coding assistants (Claude Code, OpenCode, Cursor).

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

## Decision Tree

### Phase 1: Determine Core Type

```
[Feature Request]
       │
       ▼
┌─────────────────────────────────────┐
│ Multi-step planning with dynamic    │
│ branching/iteration needed?         │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ 🤖 AGENT
       │
       ▼ NO
┌─────────────────────────────────────┐
│ Domain knowledge that agent should  │
│ auto-load when relevant?            │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ 📚 SKILL
       │
       ▼ NO
       Embed in existing component
```

### Phase 2: Need a Command Wrapper?

```
┌─────────────────────────────────────┐
│ Does the Skill/Agent need:          │
│                                     │
│ • allowed-tools restriction?        │
│ • Dangerous/irreversible ops guard? │
│ • Structured $ARGUMENTS?            │
│ • Frequent /shortcut in menu?       │
└─────────────────────────────────────┘
       │
       ├── ANY YES ──▶ ⚡ Add COMMAND wrapper
       │
       ▼ ALL NO
       Use Skill/Agent directly (no Command needed)
```

## Contents

| File | Description |
|------|-------------|
| [`meta-prompt.md`](./meta-prompt.md) | Full meta-prompt (English) - copy to AI |
| [`meta-prompt.ko.md`](./meta-prompt.ko.md) | Full meta-prompt (Korean) - copy to AI |
| [`research/`](./research/) | Background research and references |

## Usage

1. **Copy** the meta-prompt file content
2. **Paste** into your AI assistant (Claude, GPT, etc.)
3. **Describe** your feature request
4. **Receive** diagnosis + filled spec template

### Example

**Input:**
> "I want to create a feature that automatically reviews code for security vulnerabilities when a PR is created"

**Output:**
```
## Diagnosis: 🤖 AGENT

### Reasoning:
1. ✅ Multi-step planning (review → analyze → suggest → comment)
2. ✅ Dynamic branching (different vulnerabilities need different fixes)
3. ✅ Requires LLM reasoning to understand code context

[Full Agent Spec Template...]
```

## Platform Support

| Platform | Commands | Skills | Agents |
|----------|----------|--------|--------|
| **Claude Code** | `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` | Subagent via Task |
| **OpenCode** | `.opencode/commands/*.md` | `skills/*/SKILL.md` | `agents/*.md` |
| **Cursor** | `.cursor/commands/*.md` | `.cursor/rules/*.mdx` | Agent mode |

## See Also

- [Research Prompt](./research/00-research-prompt.md) - Original research prompt
- [Claude Research](./research/01-claude.md) - Claude's analysis
- [GPT-4 Research](./research/02-gpt/) - GPT-4's comprehensive taxonomy (multi-file)
- [Gemini Research](./research/03-gemini.md) - Gemini's enterprise architecture view
