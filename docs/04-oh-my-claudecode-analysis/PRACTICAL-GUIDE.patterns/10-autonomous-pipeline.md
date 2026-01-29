# Pattern: Phased Autonomous Pipeline

**Difficulty:** Advanced
**Impact:** High
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-10-phased-autonomous-pipeline-autopilot)

---

## Problem
End-to-end tasks need analysis, planning, implementation, testing, and validation — each requiring different agents.

## Solution
5-phase pipeline that composes existing patterns as building blocks.

## Implementation
| Phase | Purpose | Building Blocks |
|-------|---------|-----------------|
| Expansion | Requirements → spec | Analyst + Architect |
| Planning | Spec → plan | Architect + Critic |
| Execution | Plan → code | Persistence Loop + Parallel Execution |
| QA | Code → tested code | Quality Cycling (build/test/fix repeat) |
| Validation | Tested → approved | Multi-reviewer unanimous approval |

Key: compose existing patterns, don't reimplement them.

## Verification
- [ ] Each phase has clear entry/exit criteria
- [ ] Phase transitions handle failures (rollback)
- [ ] State persists across phases for resume
- [ ] All state files cleaned up on completion

## See Also
- [Persistence Loop](./06-persistence-loop.md) — Used in execution phase
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-10-phased-autonomous-pipeline-autopilot)
