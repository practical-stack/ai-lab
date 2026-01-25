# Criteria Matrix

Detailed comparison criteria for component type selection.

## Primary Criteria

| Criteria | Command | Skill | Agent |
|----------|---------|-------|-------|
| **Trigger** | Human `/command` | Auto-load on keywords | Goal assigned |
| **Reasoning** | None (fixed procedure) | None (guidance only) | Yes (LLM decides) |
| **Execution** | Deterministic steps | No execution | Dynamic, iterative |
| **State** | Stateless | Stateless | Maintains memory |
| **Side Effects** | Yes (with confirm) | None | Yes |
| **Reusability** | Medium (UI shortcut) | High (across agents) | Low (specialized) |
| **Planning** | Predefined | N/A | Dynamic |

## Scoring Guide

For each criterion, score the feature:

### 1. Multi-step Planning
- **0** = Single step, fixed procedure
- **1** = Multiple steps, but predetermined order
- **2** = Dynamic steps, order depends on results

> Score 2 → Agent

### 2. Dynamic Branching
- **0** = No branching, linear flow
- **1** = Simple if/else branches
- **2** = Complex branching based on LLM judgment

> Score 2 → Agent

### 3. LLM Reasoning Required
- **0** = Pure execution, no judgment
- **1** = Minor interpretation needed
- **2** = Significant reasoning/judgment

> Score 2 → Agent

### 4. Auto-load on Context
- **0** = Only when explicitly called
- **1** = Sometimes helpful in context
- **2** = Should always load when relevant

> Score 2 → Skill

### 5. Reusable Knowledge
- **0** = One-time use
- **1** = Reused occasionally
- **2** = Core expertise used everywhere

> Score 2 → Skill

### 6. Human Must Trigger
- **0** = Can run automatically
- **1** = Prefer explicit trigger
- **2** = Must have explicit trigger

> Score 2 → Command

### 7. Dangerous Side Effects
- **0** = Read-only, safe
- **1** = Minor side effects
- **2** = Critical/irreversible actions

> Score 2 → Command (with confirmation)

## Score Interpretation

| Highest Scores In | Result |
|-------------------|--------|
| Criteria 1, 2, 3 | 🤖 AGENT |
| Criteria 4, 5 | 📚 SKILL |
| Criteria 6, 7 | ⚡ COMMAND |
| Mixed / All Low | Embed in existing component |
