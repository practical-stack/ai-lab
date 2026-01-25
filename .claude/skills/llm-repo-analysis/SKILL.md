---
name: llm-repo-analysis
description: |
  Deep analysis of LLM agent/plugin repositories to extract architecture, patterns, and insights.
  
  USE WHEN:
  - "analyze this LLM repo"
  - "extract patterns from [repo]"
  - "create documentation like oh-my-opencode-analysis"
  - "repository deep dive"
  - "understand this AI agent codebase"
  
  DO NOT USE WHEN:
  - General code review (not LLM-specific)
  - Simple file exploration
  - Non-LLM repositories
---

# LLM Repository Analysis

Deep analysis framework for LLM agent/plugin repositories. Produces structured documentation covering philosophy, architecture, patterns, and practical implementation guides.

## Output Structure

Analysis produces `docs/NN-topic-name/` with:

| # | Document | Role | Key Question |
|---|----------|------|--------------|
| 00 | core-philosophy.md | WHY | What beliefs drive the system? |
| 01 | architecture.md | WHAT | How is it structured? |
| 02 | design-patterns.md | HOW | What patterns can I reuse? |
| 03 | anti-patterns.md | AVOID | What should I NOT do? |
| 04 | prompt-engineering.md | CRAFT | What prompt techniques are used? |
| 05 | eval-methodology.md | VERIFY | How does it verify completion? |
| 06 | agents-skills-reference/ | REFERENCE | Concrete implementation examples |
| - | PRACTICAL-GUIDE.md | APPLY | Step-by-step adoption path |
| - | PRACTICAL-GUIDE.patterns/ | IMPLEMENT | Detailed pattern guides |

## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Analyze a repository | [workflows/analyze-repository.md](workflows/analyze-repository.md) |
| Generate documentation | [workflows/generate-documentation.md](workflows/generate-documentation.md) |

## Core Resources

| Resource | Purpose |
|----------|---------|
| [Analysis Dimensions](references/analysis-dimensions.md) | What to look for in each dimension |
| [Pattern Recognition](references/pattern-recognition.md) | LLM-specific patterns to identify |
| [Output Templates](references/output-templates.md) | Document structure templates |

## Quick Reference: What to Look For

### Primary Analysis Targets

| Category | Files to Find | What to Extract |
|----------|---------------|-----------------|
| **Main Agent** | `*-prompt.md`, `system.md`, `agent.md` | Core behavior, philosophy, constraints |
| **Skills** | `skills/*/SKILL.md`, `*.skill` | Domain knowledge patterns |
| **Commands** | `commands/*.md` | User-triggered procedures |
| **Hooks/Verification** | `hooks/`, `*-enforcer.ts` | Completion verification systems |
| **Delegation** | `delegate*.ts`, `task*.ts` | Multi-agent orchestration |
| **Configuration** | `*.json`, `*.yaml`, `config/` | Model selection, tool configs |

### Philosophy Extraction Signals

Look for statements that reveal beliefs:

| Signal | Example | Dimension |
|--------|---------|-----------|
| "never", "always", "must" | "never trust self-reported completion" | Core belief |
| "human intervention" | "human intervention is a failure signal" | Design philosophy |
| Anti-pattern blocks | "MUST NOT", "BLOCKING" | Quality constraints |
| Failure conditions | "IF... THEN FAIL" | Verification standards |

### Architecture Pattern Signals

| Pattern | Signal | Indicator |
|---------|--------|-----------|
| **Multi-agent** | Multiple agent configs | Orchestration system |
| **Hierarchical** | `AGENTS.md` at multiple levels | Progressive disclosure |
| **Category+Skill** | Category selection + skill loading | Dynamic expertise injection |
| **Session Continuity** | `session_id` usage | Stateful conversations |

## Analysis Depth Levels

| Depth | Effort | Output |
|-------|--------|--------|
| **Quick** | 1-2 hours | README + 00-core-philosophy only |
| **Standard** | 4-6 hours | README + 00-03 documents |
| **Deep** | 1-2 days | Full 00-06 + PRACTICAL-GUIDE |

## Key Principle

**Extract the "WHY" before the "WHAT".**

Most repositories document what they do. Your job is to extract:
1. The beliefs that drive the design
2. The patterns that make it work
3. The anti-patterns they explicitly avoid
4. The verification mechanisms that ensure quality

> Focus on what's UNIQUE and REUSABLE, not obvious implementation details.
