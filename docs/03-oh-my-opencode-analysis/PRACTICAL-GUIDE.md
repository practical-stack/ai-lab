# Practical Guide: Applying Oh-My-OpenCode Patterns

**Document:** PRACTICAL-GUIDE.md  
**Part of:** Oh-My-OpenCode Repository Analysis  
**Purpose:** Complete synthesis of all patterns into actionable adoption steps

---

## Overview

This guide synthesizes insights from ALL analysis documents into actionable steps. Read the numbered documents (00-06) first to understand the "why", then use this guide for the "how".

**Prerequisite Reading:**
- [00-core-philosophy.md](./00-core-philosophy.md) - WHY these patterns exist
- [01-architecture.md](./01-architecture.md) - WHAT the system looks like  
- [02-design-patterns.md](./02-design-patterns.md) - HOW patterns work in detail
- [03-anti-patterns.md](./03-anti-patterns.md) - WHAT to avoid

---

## Adoption Path

### Level 1: Quick Wins (1 day)

Start here. Immediate impact with minimal effort.

| Pattern | Effort | Impact | Guide |
|---------|--------|--------|-------|
| BLOCKING Checkpoints | 1 hour | High | [PRACTICAL-GUIDE.patterns/01-blocking-checkpoints.md](./PRACTICAL-GUIDE.patterns/01-blocking-checkpoints.md) |
| Evidence Requirements | 30 min | High | [PRACTICAL-GUIDE.patterns/02-evidence-requirements.md](./PRACTICAL-GUIDE.patterns/02-evidence-requirements.md) |
| Anti-Pattern Awareness | 15 min | Medium | [PRACTICAL-GUIDE.patterns/03-anti-pattern-awareness.md](./PRACTICAL-GUIDE.patterns/03-anti-pattern-awareness.md) |
| XML Tag Structure | 30 min | Medium | [PRACTICAL-GUIDE.patterns/04-xml-tag-structure.md](./PRACTICAL-GUIDE.patterns/04-xml-tag-structure.md) |

### Level 2: Foundation (1 week)

Build the infrastructure for reliable AI agents.

| Pattern | Effort | Impact | Guide |
|---------|--------|--------|-------|
| 7-Section Delegation | 1 hour | High | [PRACTICAL-GUIDE.patterns/05-delegation-prompt.md](./PRACTICAL-GUIDE.patterns/05-delegation-prompt.md) |
| Planning vs Execution | 2-3 hours | Very High | [PRACTICAL-GUIDE.patterns/06-planning-execution.md](./PRACTICAL-GUIDE.patterns/06-planning-execution.md) |
| Hierarchical AGENTS.md | 2-3 hours | High | [PRACTICAL-GUIDE.patterns/07-hierarchical-agents.md](./PRACTICAL-GUIDE.patterns/07-hierarchical-agents.md) |
| SKILL.md Format | 2 hours | Medium | [PRACTICAL-GUIDE.patterns/08-skill-format.md](./PRACTICAL-GUIDE.patterns/08-skill-format.md) |
| Session Continuity | 2 hours | Medium | [PRACTICAL-GUIDE.patterns/09-session-continuity.md](./PRACTICAL-GUIDE.patterns/09-session-continuity.md) |

### Level 3: Full System (2+ weeks)

Complete the system with advanced patterns.

| Pattern | Effort | Impact | Guide |
|---------|--------|--------|-------|
| Category + Skill System | 3-5 days | Very High | [PRACTICAL-GUIDE.patterns/10-category-skill-system.md](./PRACTICAL-GUIDE.patterns/10-category-skill-system.md) |
| Todo Continuation Enforcer | 1-2 days | Very High | [PRACTICAL-GUIDE.patterns/11-todo-continuation.md](./PRACTICAL-GUIDE.patterns/11-todo-continuation.md) |
| Comment Checker | 1 day | Medium | [PRACTICAL-GUIDE.patterns/12-comment-checker.md](./PRACTICAL-GUIDE.patterns/12-comment-checker.md) |
| Doctor Health Checks | 1-2 days | Medium | [PRACTICAL-GUIDE.patterns/13-doctor-health-checks.md](./PRACTICAL-GUIDE.patterns/13-doctor-health-checks.md) |
| Dynamic Prompt Generation | 2-3 days | High | [PRACTICAL-GUIDE.patterns/14-dynamic-prompt-generation.md](./PRACTICAL-GUIDE.patterns/14-dynamic-prompt-generation.md) |

---

## Decision Framework

When you encounter a problem, use this table to find the right pattern:

| Problem | Pattern |
|---------|---------|
| Agents skip analysis | [BLOCKING Checkpoints](./PRACTICAL-GUIDE.patterns/01-blocking-checkpoints.md) |
| Incomplete work claimed as done | [Evidence Requirements](./PRACTICAL-GUIDE.patterns/02-evidence-requirements.md) |
| Common coding mistakes | [Anti-Pattern Awareness](./PRACTICAL-GUIDE.patterns/03-anti-pattern-awareness.md) |
| Hard-to-parse prompts | [XML Tag Structure](./PRACTICAL-GUIDE.patterns/04-xml-tag-structure.md) |
| Poor subagent output | [7-Section Delegation](./PRACTICAL-GUIDE.patterns/05-delegation-prompt.md) |
| Context pollution / goal drift | [Planning vs Execution](./PRACTICAL-GUIDE.patterns/06-planning-execution.md) |
| Agent doesn't know codebase | [Hierarchical AGENTS.md](./PRACTICAL-GUIDE.patterns/07-hierarchical-agents.md) |
| Need domain expertise in skills | [SKILL.md Format](./PRACTICAL-GUIDE.patterns/08-skill-format.md) |
| Wasted tokens on follow-ups | [Session Continuity](./PRACTICAL-GUIDE.patterns/09-session-continuity.md) |
| Wrong model for task | [Category + Skill System](./PRACTICAL-GUIDE.patterns/10-category-skill-system.md) |
| "I'm done" lies | [Todo Continuation](./PRACTICAL-GUIDE.patterns/11-todo-continuation.md) |
| AI-looking code (slop) | [Comment Checker](./PRACTICAL-GUIDE.patterns/12-comment-checker.md) |
| Environment issues | [Doctor Health Checks](./PRACTICAL-GUIDE.patterns/13-doctor-health-checks.md) |
| Stale prompts | [Dynamic Prompt Generation](./PRACTICAL-GUIDE.patterns/14-dynamic-prompt-generation.md) |

---

## Quick Start: Minimal Viable Adoption

If you only have 30 minutes, do these three things:

### 1. Add BLOCKING to Your Main Prompt (15 min)

```markdown
## Analysis Phase (BLOCKING)

**MANDATORY OUTPUT:**
```
ANALYSIS
========
Request: [what was asked]
Scope: [what files/areas]
Approach: [how you'll do it]
```

**IF YOU SKIP THIS, YOUR WORK WILL BE WRONG.**
```

### 2. Add Evidence Requirements (5 min)

```markdown
## Completion Checklist
- [ ] LSP diagnostics clean
- [ ] Build passes
- [ ] Tests pass

**NOT COMPLETE WITHOUT ALL CHECKED.**
```

### 3. Add MUST NOT Section (10 min)

```markdown
## MUST NOT
- Do NOT use `as any` or `@ts-ignore`
- Do NOT modify files outside scope
- Do NOT skip verification
- Do NOT claim done without evidence
```

**These three changes will transform your AI agent quality immediately.**

---

## Summary: The 80/20 Rule

| Priority | Patterns | Total Impact |
|----------|----------|--------------|
| **Do First** | BLOCKING, Evidence, 7-Section Delegation | Transform quality |
| **Do Second** | Anti-Patterns, Planning/Execution, AGENTS.md | Build foundation |
| **Full Adoption** | Category+Skill, Todo Continuation, Comment Checker | Complete system |

---

## What's New in v3.1.3

This guide is based on **v3.1.3** of Oh-My-OpenCode, which introduced several new patterns and features:

- **Multi-Source Skill Loading** - Merge skills from multiple sources (builtin, config, user, project)
- **Skill-Embedded MCP** - Declare MCPs directly within skill frontmatter
- **Boulder State Persistence** - Track plan progress across sessions
- **Metadata-Driven Prompt Assembly** - Dynamically generate system prompts from configuration
- **State-Driven Orchestration** - Maintain orchestrator state for complex workflows

All patterns in this guide apply to v3.1.3. Refer to [02-design-patterns.md](./02-design-patterns.md) for architectural details.

---

## Pattern Index

For detailed implementation of each pattern, see [PRACTICAL-GUIDE.patterns/](./PRACTICAL-GUIDE.patterns/).

---

## See Also

- [README.md](./README.md) - Analysis overview
- [00-core-philosophy.md](./00-core-philosophy.md) - Philosophy behind patterns
- [01-architecture.md](./01-architecture.md) - System architecture
- [02-design-patterns.md](./02-design-patterns.md) - Pattern theory
- [03-anti-patterns.md](./03-anti-patterns.md) - What to avoid
- [04-prompt-engineering.md](./04-prompt-engineering.md) - Prompt techniques
- [05-eval-methodology.md](./05-eval-methodology.md) - Verification systems
- [06-agents-skills-reference/](./06-agents-skills-reference/) - Concrete examples
