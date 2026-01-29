# Criteria Matrix

Detailed comparison criteria for component type selection.

## Core Type Criteria (Skill vs Agent)

| Criteria | Skill | Agent |
|----------|-------|-------|
| **Trigger** | Auto-load on keywords | Goal assigned |
| **Reasoning** | None (guidance only) | Yes (LLM decides) |
| **Execution** | No execution | Dynamic, iterative |
| **State** | Stateless | Maintains memory |
| **Side Effects** | None | Yes |
| **Reusability** | High (across agents) | Low (specialized) |
| **Planning** | N/A | Dynamic |

## Command Wrapper Criteria

Command is an **optional access layer** placed over Skill or Agent when platform constraints are needed.

| Criteria | Justified? |
|----------|-----------|
| **Tool Restriction** | ✅ Yes - `allowed-tools` sandboxing needed |
| **Dangerous Operations** | ✅ Yes - Irreversible/critical actions |
| **Structured Arguments** | ✅ Yes - `$ARGUMENTS` validation required |
| **Frequent Shortcut** | ✅ Yes - Common human entry point |
| **No Platform Constraints** | ❌ No - Use Skill/Agent directly |

## Scoring Guide

### Phase 1: Determine Core Type

For each criterion, score the feature:

#### 1. Multi-step Planning
- **0** = Single step, fixed procedure
- **1** = Multiple steps, but predetermined order
- **2** = Dynamic steps, order depends on results

> Score 2 → Agent

#### 2. Dynamic Branching
- **0** = No branching, linear flow
- **1** = Simple if/else branches
- **2** = Complex branching based on LLM judgment

> Score 2 → Agent

#### 3. LLM Reasoning Required
- **0** = Pure execution, no judgment
- **1** = Minor interpretation needed
- **2** = Significant reasoning/judgment

> Score 2 → Agent

#### 4. Auto-load on Context
- **0** = Only when explicitly called
- **1** = Sometimes helpful in context
- **2** = Should always load when relevant

> Score 2 → Skill

#### 5. Reusable Knowledge
- **0** = One-time use
- **1** = Reused occasionally
- **2** = Core expertise used everywhere

> Score 2 → Skill

### Phase 2: Determine if Command Wrapper Needed

#### 6. Tool Restriction Needed
- **0** = No tool sandboxing required
- **1** = Minor tool restrictions
- **2** = Significant `allowed-tools` restriction needed

> Score 2 → Add Command wrapper

#### 7. Dangerous Side Effects
- **0** = Read-only, safe
- **1** = Minor side effects
- **2** = Critical/irreversible actions

> Score 2 → Add Command wrapper

#### 8. Structured Arguments Required
- **0** = No argument validation needed
- **1** = Simple arguments
- **2** = Complex `$ARGUMENTS` validation required

> Score 2 → Add Command wrapper

#### 9. Frequent Human Shortcut
- **0** = Rarely used
- **1** = Occasionally useful
- **2** = Common entry point in `/` menu

> Score 2 → Add Command wrapper

## Score Interpretation

| Highest Scores In | Result |
|-------------------|--------|
| Criteria 1, 2, 3 | 🤖 AGENT (core type) |
| Criteria 4, 5 | 📚 SKILL (core type) |
| Criteria 6, 7, 8, 9 | ⚡ COMMAND (wrapper layer) |
| Mixed / All Low | Embed in existing component |
