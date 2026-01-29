# Skill: Ralph (Self-Referential Persistence Loop)

**File:** `skills/ralph/SKILL.md` (222 lines)
**Trigger:** "ralph", "don't stop", "must complete", "don't stop until done"

---

## Purpose

Persistent execution loop that re-invokes the agent until completion is verified by an architect agent. Named after the Sisyphus metaphor — relentlessly pushing forward.

## Loop Mechanism

```
Iteration N:
  1. Agent works on task
  2. Agent believes done → outputs <promise>TOKEN</promise>
  3. Runtime scans transcript for promise token
     NOT FOUND → increment iteration, re-invoke (goto 1)
     FOUND → enter architect verification

Architect Verification:
  4. Spawn architect agent to review work
  5. Architect outputs:
     <architect-approved>VERIFIED_COMPLETE</architect-approved>
     → Clean up state files → EXIT LOOP
     OR rejection with feedback
     → Record feedback → continue loop (goto 1)
  6. Max 3 verification attempts → force-accept
```

## Zero Tolerance Policy

- No scope reduction
- No partial completion
- No premature stopping
- NO TEST DELETION (to make tests pass)

## State Files

| File | Content |
|------|---------|
| `.omc/state/ralph-state.json` | Active, iteration, prompt, promise token |
| `.omc/state/ralph-verification.json` | Pending, attempts, architect feedback |

On completion: DELETE both files (not set `active: false`).

## Patterns Demonstrated

- **Self-Referential Persistence Loop** — promise-token-gated completion
- **Evidence-Gated Completion** — architect verification required
- **State hygiene** — file deletion over flag deactivation
- **Escape hatch** — 100 iteration max, 3 verification attempts max
