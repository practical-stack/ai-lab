# Skill: Autopilot

**File:** `skills/autopilot/SKILL.md` (186 lines)
**Trigger:** "autopilot", "build me", "I want a", "create me", "make me"

---

## Purpose

Full autonomous execution from high-level idea to verified working code. Composes ralph (persistence), ultrawork (parallelism), and ultraqa (quality cycling) into a 5-phase pipeline.

## Phase Pipeline

```
Phase 0: Expansion (Analyst + Architect → spec.md)
    ↓
Phase 1: Planning (Architect + Critic → plan.md)
    ↓
Phase 2: Execution (Ralph + Ultrawork → code)
    ↓
Phase 3: QA (UltraQA build/lint/test cycle, max 5)
    ↓
Phase 4: Validation (3 parallel reviewers, ALL must approve)
    ↓
Complete (cleanup all state files)
```

## Key Design Decision

Autopilot does NOT implement its own execution. It composes existing patterns:
- Ralph provides persistence (don't stop until done)
- Ultrawork provides parallelism (multiple agents simultaneously)
- UltraQA provides quality cycling (build/test/fix repeat)

This composability means improvements to any sub-pattern automatically improve autopilot.

## State Management

- State: `.omc/state/autopilot-state.json`
- On completion: deletes ALL state files (autopilot, ralph, ultrawork, ultraqa)
- Resume: re-run `/oh-my-claudecode:autopilot`

## Patterns Demonstrated

- **Phased Autonomous Pipeline** — 5-phase lifecycle
- **Composition over reimplementation** — builds on ralph + ultrawork + ultraqa
- **Multi-agent validation** — 3 parallel reviewers with unanimous approval
- **State cleanup** — delete files, don't flag as inactive
