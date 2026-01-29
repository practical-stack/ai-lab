---
title: "AI Agent Architecture Course"
description: "Comprehensive learning path for mastering Skill and Agent design (with optional Command wrappers) in AI coding assistants like Claude Code, Cursor, and OpenCode"
type: index
tags: [AI, Architecture, BestPractice]
related: [./README.ko.md]
---

# AI Agent Architecture Course

> A comprehensive learning path for mastering Skill and Agent design (with optional Command wrappers) in AI coding assistants

## Course Overview

This course teaches you how to design and implement AI agent architectures for coding assistants like Claude Code, Cursor, and OpenCode. The architecture follows a **two-layer model**: core types (Skill and Agent) on the knowledge layer, with an optional Command wrapper on the access layer. Synthesized from multi-model research (meta-prompt responses from Claude, GPT, Gemini), it provides practical, actionable guidance.

## Who This Is For

- **AI/ML Engineers** building agent-based systems
- **Platform Engineers** designing developer tools
- **DevOps/SRE** implementing automation with AI
- **Anyone** working with AI coding assistants

## Prerequisites

- Basic understanding of AI/LLM concepts
- Familiarity with at least one AI coding assistant
- Programming experience (any language)

---

## Course Modules

| # | Module | Duration | Description |
|---|--------|----------|-------------|
| 1 | [Fundamentals](./01-fundamentals.md) | 20 min | Core concepts: Command, Skill, Agent |
| 2 | [Relationships](./02-relationships.md) | 25 min | How components work together |
| 3 | [Decision Framework](./03-decision-framework.md) | 20 min | When to build what |
| 4 | [Design Templates](./04-templates.md) | 30 min | Ready-to-use spec formats |
| 5 | [Real Examples](./05-examples.md) | 35 min | Complete implementations |
| 6 | [Anti-patterns](./06-anti-patterns.md) | 25 min | Mistakes to avoid |

**Total Time:** ~2.5 hours

---

## Learning Path

### Beginner Track (Modules 1-3)

If you're new to AI agent architecture:

```
Module 1: Fundamentals
    │
    │  Learn: What are Commands, Skills, Agents?
    │  Practice: Classify feature requests
    │
    ▼
Module 2: Relationships
    │
    │  Learn: How components interact
    │  Practice: Design contracts
    │
    ▼
Module 3: Decision Framework
    │
    │  Learn: When to build what
    │  Practice: Apply decision tree
    │
    ▼
Ready to implement!
```

### Practitioner Track (Modules 4-6)

If you're ready to build:

```
Module 4: Design Templates
    │
    │  Get: Spec templates for each component
    │  Do: Fill out for your use case
    │
    ▼
Module 5: Real Examples
    │
    │  Study: Complete implementations
    │  Do: Design your own workflow
    │
    ▼
Module 6: Anti-patterns
    │
    │  Learn: Common mistakes
    │  Get: Guardrails checklist
    │
    ▼
Production-ready!
```

---

## Quick Reference

### Architecture Model

**Knowledge Layer (Core Types):**

| Component | Role | Trigger | Example |
|-----------|------|---------|---------|
| **Skill** | "How to do it" | Auto-loaded / `@path` | React best practices |
| **Agent** | "Who does it" | Goal assignment | Bug-fix agent |

**Access Layer (Optional Wrapper):**

| Component | Role | Trigger | Example |
|-----------|------|---------|---------|
| **Command** | UI + constraints | Human `/command` | `/deploy prod` |

> Command is NOT a parallel type — it wraps Skills/Agents when `allowed-tools`, dangerous ops, structured `$ARGUMENTS`, or `/` shortcut is needed.

### Quick Decision Tree

```
Phase 1 — Core Type:
  Multi-step planning needed?
    → YES: Agent
    → NO: Domain knowledge?
        → YES: Skill
        → NO: Embed in existing

Phase 2 — Need Command Wrapper?
  Need allowed-tools, dangerous ops guard,
  structured $ARGUMENTS, or /shortcut?
    → YES: Add Command wrapper
    → NO: Use Skill/Agent directly
```

### File Locations

| Platform | Commands | Skills | Agents |
|----------|----------|--------|--------|
| Claude Code | `.claude/commands/` | `.claude/skills/` | Subagent via Task |
| Cursor | `.cursor/commands/` | `.cursor/skills/` | `.cursor/agents/` |
| OpenCode | `.opencode/commands/` | `skills/` | `agents/*.md` |

---

## Exercises

Each module includes exercises. Here are the key ones:

### From Module 1
> Classify these features: Command, Skill, or Agent?
> - Deploy to production
> - React best practices knowledge
> - Analyze bug and create PR fix

### From Module 3
> Apply the decision tree to:
> - "Auto-add JSDoc comments"
> - "Delete old test fixtures"
> - "Help follow microservices patterns"

### From Module 5
> Design your own:
> - Documentation generator system
> - Code migration tool

---

## Source Materials

This course synthesizes multi-model research responses:

| Source | Description |
|--------|-------------|
| [Research Prompt](../research/00-research-prompt.md) | Original meta-prompt used for research |
| [Claude Research](../research/01-claude.md) | Claude's response - AI coding assistant patterns |
| [GPT Research](../research/02-gpt/) | GPT's response - Comprehensive taxonomy (6 parts) |
| [Gemini Research](../research/03-gemini.md) | Gemini's response - Enterprise perspective |

> **Note:** These are responses generated by running the meta-prompt against each AI model, not primary sources from the models themselves.

---

## Extracted Artifacts

The research produced practical artifacts:

| Artifact | Location | Purpose |
|----------|----------|---------|
| **Structure Organizer Skill** | `.claude/skills/meta-structure-organizer/` | Helps decide component type |
| **Learning Course** | This folder | Educational content |
| **Meta-prompt** | `../meta-prompt.md` | Reusable prompt template |

---

## Certificate of Completion

After completing all modules:

- [ ] Module 1: Fundamentals quiz passed
- [ ] Module 2: Contract design exercise completed
- [ ] Module 3: Decision tree applied to 5+ scenarios
- [ ] Module 4: At least one spec filled out
- [ ] Module 5: Own workflow designed
- [ ] Module 6: Anti-pattern checklist reviewed

**Congratulations!** You're now equipped to design AI agent architectures.

---

## Feedback

Found an issue or have suggestions?
- Open an issue in the repository
- Or update the content directly

---

## Version

- **v1.0.0** - Initial release (January 2026)
- Synthesized from multi-model research (Claude, GPT, Gemini responses to meta-prompt)
