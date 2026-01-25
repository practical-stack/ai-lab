---
title: "Component Architect"
description: "Diagnose whether a feature request should be implemented as Command, Skill, or Agent for AI coding assistants."
type: index
tags: [Architecture, AI, BestPractice]
order: 1
related: [./README.ko.md]
used_by: [/.claude/skills/meta-structure-organizer/SKILL.md, /.claude/commands/organize-llm-structure.md]
---

# Component Architect

> Diagnose whether a feature request should be implemented as **Command**, **Skill**, or **Agent**

This tool provides a systematic approach to component type selection for AI coding assistants (Claude Code, OpenCode, Cursor).

## Quick Reference

| Component | Trigger | Reasoning | Execution | Use When |
|-----------|---------|-----------|-----------|----------|
| **Command** | Human `/command` | None | Fixed procedure | Explicit user trigger needed |
| **Skill** | Auto-load on keywords | None | No execution (knowledge) | Domain expertise to share |
| **Agent** | Goal assigned | LLM decides | Dynamic, iterative | Multi-step planning required |

## Decision Tree

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
┌─────────────────────────────────────┐
│ Must human explicitly trigger it?   │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ ⚡ COMMAND
       │
       ▼ NO
       Embed in existing component
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

- [Research Prompt](./research/00-research-prompt.en.md) - Original research prompt
- [Claude Research](./research/01-claude.en.md) - Claude's analysis
- [GPT-4 Research](./research/02-gpt/) - GPT-4's comprehensive taxonomy (multi-file)
- [Gemini Research](./research/03-gemini.en.md) - Gemini's enterprise architecture view
