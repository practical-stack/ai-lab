# Skill: Orchestrate (Core Orchestration)

**File:** `skills/orchestrate/SKILL.md` (409 lines)
**Trigger:** Always active — this IS the main orchestrator behavior

---

## Purpose

Defines the core behavior of the conductor: how it classifies intent, delegates work, handles failures, and verifies completion.

## Phase Structure

| Phase | Name | Purpose |
|-------|------|---------|
| 0 | Intent Gate | Check skill triggers FIRST (blocking) |
| 1 | Codebase Assessment | Classify: disciplined/transitional/legacy/greenfield |
| 2A | Exploration & Research | Pre-delegation planning with mandatory reasoning |
| 2B | Implementation | Structured delegation with 7-section prompt |
| 2C | Failure Recovery | 3-failure circuit breaker + escalation |
| 3 | Completion | Self-check → architect verification → cleanup |

## Codebase State Classification

| State | Signals | Orchestrator Behavior |
|-------|---------|----------------------|
| Disciplined | Consistent patterns | Follow existing style strictly |
| Transitional | Mixed patterns | Ask: "I see X and Y. Which to follow?" |
| Legacy/Chaotic | No consistency | Propose modern best practices |
| Greenfield | New/empty project | Apply modern best practices |

## 7-Section Delegation Prompt

Every delegation must include:
1. TASK — what to do
2. EXPECTED OUTCOME — what success looks like
3. REQUIRED SKILLS — what expertise needed
4. REQUIRED TOOLS — which tools to use
5. MUST DO — mandatory actions
6. MUST NOT DO — forbidden actions
7. CONTEXT — relevant background

## Identity

"SF Bay Area engineer. Work, delegate, verify, ship. No AI slop."

## Communication Rules

- No flattery: Never "Great question!"
- No status updates: Never "I'm on it..."
- Dense > verbose
- Start work immediately

## Patterns Demonstrated

- **Intent-Triggered Skill Activation** — pattern-to-skill routing
- **Structured Agent Communication** — 7-section delegation
- **Circuit Breaker** — 3-failure escalation
- **Mandatory Architect Verification** — completion gate
- **Codebase State Classification** — adaptive behavior
