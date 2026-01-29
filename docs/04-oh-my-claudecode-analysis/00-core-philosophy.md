# Core Philosophy

**Document:** 00-core-philosophy.md
**Part of:** oh-my-claudecode Analysis
**Source:** `nicobailon/oh-my-claudecode` (v3.7.15)

---

## The One-Liner

> "You are a CONDUCTOR, not a performer."

This single sentence, placed at the very top of the main orchestration prompt (`docs/CLAUDE.md:3`), defines the entire system. The main Claude session — running on the most capable model (Opus) — must never write code. It reads, plans, delegates, and verifies. All implementation flows through 32 specialized agents.

---

## The Sisyphus Manifesto

The system is named after Sisyphus — the Greek king condemned to push a boulder uphill for eternity. This is not a metaphor for futile labor. It is a metaphor for **relentless persistence**: the system pushes forward on tasks until they are verifiably complete, never abandoning work prematurely.

Five pillars define the manifesto:

### Pillar 1: Delegation Over Action

> "RULE 1: ALWAYS delegate substantive work to specialized agents"
> — `docs/CLAUDE.md:35`

The orchestrator does not implement. Even a single-line code change routes through `executor-low` (Haiku). This is not about laziness — it is about role clarity. When the orchestrator writes code, it bypasses model routing, skips verification, and loses the specialist prompt guidance that each agent provides.

| Action | Orchestrator Does | Delegated To |
|--------|-------------------|--------------|
| Read files for context | Yes | — |
| Quick status checks | Yes | — |
| Create/update todos | Yes | — |
| Communicate with user | Yes | — |
| Single-line code change | NEVER | executor-low (Haiku) |
| Multi-file changes | NEVER | executor / executor-high |
| Complex debugging | NEVER | architect (Opus) |
| UI/frontend work | NEVER | designer (Sonnet) |
| Documentation | NEVER | writer (Haiku) |
| Deep analysis | NEVER | architect / analyst (Opus) |

### Pillar 2: Evidence Over Claims

> "IRON LAW: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE"
> — `skills/ralph/SKILL.md:143`

This is the most repeated principle in the codebase, appearing in `docs/CLAUDE.md`, `agents/architect.md`, `agents/executor.md`, `skills/ralph/SKILL.md`, and `skills/orchestrate/SKILL.md`. The Iron Law protocol:

| Step | Action | Purpose |
|------|--------|---------|
| 1 | IDENTIFY what command proves the claim | Prevent vague assertions |
| 2 | RUN the verification command | Produce actual evidence |
| 3 | READ the output — did it pass? | Confirm the evidence |
| 4 | ONLY THEN make the claim with evidence | Ground the claim |

Evidence has a **5-minute freshness window**. Stale evidence from earlier in the conversation is rejected because subsequent code changes may have invalidated it.

```
BAD:
"I've implemented the feature. The code looks correct and should work."

GOOD:
"I've implemented the feature. Verification:
- Build: npm run build → exit code 0 ✓
- Tests: npm test → 47 passed, 0 failed ✓
- Lint: npm run lint → no errors ✓
- Diagnostics: lsp_diagnostics → 0 errors ✓"
```

### Pillar 3: Specialists Over Generalists

The system maintains 32 agents across 12 domains, each with a role-specific prompt, tool restrictions, and model tier:

| Domain | LOW (Haiku) | MEDIUM (Sonnet) | HIGH (Opus) |
|--------|-------------|-----------------|-------------|
| Analysis | architect-low | architect-medium | architect |
| Execution | executor-low | executor | executor-high |
| Search | explore | explore-medium | explore-high |
| Frontend | designer-low | designer | designer-high |
| Data Science | scientist-low | scientist | scientist-high |
| Testing | — | qa-tester | qa-tester-high |
| Security | security-reviewer-low | — | security-reviewer |
| Planning | — | — | planner |
| Critique | — | — | critic |

Each tier has different behavioral budgets:
- **LOW (Haiku)**: "Limit exploration to 5 files. Escalate if complexity exceeds expectations."
- **MEDIUM (Sonnet)**: "Explore up to 20 files. Escalate for system-wide refactoring."
- **HIGH (Opus)**: "Full codebase exploration. No escalation needed."

This routing saves ~47% on token costs versus using Opus for everything.

### Pillar 4: Persistence Over Abandonment

> "You are BOUND to your task list. Do not stop until EVERY task is COMPLETE."
> — `docs/CLAUDE.md:530`

LLM agents naturally stop too early. They produce partial work, feel satisfied, and claim success. The system fights this with multiple persistence mechanisms:

| Mechanism | Trigger | Behavior |
|-----------|---------|----------|
| Ralph loop | "don't stop", "must complete" | Re-invokes agent until `<promise>` token emitted after architect approval |
| Ultrawork | "ulw", "ultrawork" | Blocks stop while todos remain incomplete (max 10 reinforcements) |
| Todo continuation | Stop with pending todos | Injects continuation message (max 15 attempts) |
| Autopilot | "build me", "I want a" | 5-phase pipeline that composes ralph + ultrawork + ultraqa |

Each mechanism has escape hatches to prevent infinite loops (ralph: 100 iterations, ultrawork: 10 reinforcements, todos: 15 continuations).

### Pillar 5: Autonomy Over Assistance

> "The promise vs reality gap: We wanted autonomous coding, we got interactive tutoring."
> — `seminar/notes.md:27`

The system is designed to shift LLM agents from interactive assistants to autonomous orchestrators. Users describe what they want; the system figures out how. Zero learning curve:

| When User Says... | System Automatically... |
|-------------------|------------------------|
| "build me a todo app" | Activates autopilot (full autonomous pipeline) |
| "fix all the TypeScript errors" | Activates ultrawork (parallel execution) |
| "don't stop until done" | Activates ralph (persistence loop) |
| "plan the new API" | Starts planning interview |
| Broad/vague request | Explores codebase, then starts planning |
| UI/frontend work | Silently activates design sensibility |

---

## Core Beliefs

| # | Belief | Evidence | Implication |
|---|--------|----------|-------------|
| 1 | The orchestrator must never implement | "NEVER do code changes directly" (docs/CLAUDE.md) | All source changes through executor agents |
| 2 | Completion claims require proof | "Iron Law" in 5+ files | Every "done" backed by fresh command output |
| 3 | Specialists outperform generalists | 32 agents × 3 tiers | Right model for right task |
| 4 | Human intervention signals failure | "No manual intervention required" (autopilot) | Self-correction before asking for help |
| 5 | Hedging language reveals uncertainty | "Red Flags: 'should', 'probably'" (architect.md) | Model monitors its own language as diagnostic |
| 6 | Persistence beats abandonment | "BOUND to your task list" (CLAUDE.md) | Loops continue until verification passes |
| 7 | Prompt constraints alone are unreliable | Dual enforcement: prompt + tool restrictions | Infrastructure enforces what prompts request |
| 8 | Stale state causes confusion | "Delete state files, don't set active:false" (ralph) | Clean deletion over flag-based deactivation |
| 9 | Reviews must be genuinely critical | Critic "averages 7 rejections" calibration | Backstory narrative prevents rubber-stamping |
| 10 | AI output defaults to mediocrity | "purple gradients = AI slop" (designer-high.md) | Explicit anti-patterns for generic output |

---

## Philosophy in Practice

| Principle | Implementation | Where |
|-----------|----------------|-------|
| Conductor identity | System prompt + path-based write rules | `docs/CLAUDE.md`, `src/hooks/omc-orchestrator/` |
| Evidence over claims | Verification module with 7 checks + 5-min freshness | `src/features/verification/` |
| Smart routing | 4-stage pipeline: signals → scoring → rules → decision | `src/features/model-routing/` |
| Zero learning curve | Pattern-to-skill routing tables | `skills/orchestrate/SKILL.md` |
| Self-correction | Circuit breaker + ralph loop + ultraqa cycling | `agents/architect.md`, `skills/ralph/SKILL.md` |
| Specialist delegation | 32 agents with role-specific tools + prompts | `agents/*.md`, `src/agents/definitions.ts` |
| Dual enforcement | Tool blocking (`disallowedTools`) + prompt constraints | `agents/architect.md` frontmatter |
| Persistence | Stop hook cascade: ralph > ultrawork > todos | `scripts/persistent-mode.mjs` |
| Anti-mediocrity | Explicit aesthetic anti-patterns in designer prompts | `agents/designer.md`, `agents/designer-high.md` |
| State hygiene | Delete files on completion, not flag-based | `skills/ralph/SKILL.md` cleanup section |

---

## Contrast with Conventional Approaches

| Conventional LLM Agent | oh-my-claudecode | Why Different |
|------------------------|------------------|---------------|
| Single agent does everything | 32 specialized agents with role separation | Specialists produce higher quality; cost routing saves tokens |
| Agent claims "done" when it thinks it's done | Mandatory verification protocol with evidence | LLMs habitually claim completion prematurely |
| Same model for all tasks | 3-tier routing (Haiku/Sonnet/Opus) | Simple tasks don't need expensive models (~47% savings) |
| User must learn commands | Intent detection activates workflows automatically | Zero friction for new users |
| Agent stops when stuck | Ralph loop persists until verification passes | Complex tasks require persistence, not best-effort |
| Trust agent's self-assessment | Architect peer review gates completion | Self-assessment is unreliable in LLMs |
| Prompt-only constraints | Dual enforcement: prompt + tool restrictions | Prompts alone can be ignored by the model |
| Stateless between turns | State files persist plans, modes, and progress | Enables session resumption and multi-turn workflows |
| Single-perspective planning | Planner → Architect → Critic consensus loop | Multiple agents catch different blind spots |
| Generic output style | Explicit anti-patterns ("AI slop") + persona diversity | Prevents convergence on mediocre defaults |

---

## The Belief Hierarchy

The system's beliefs form a priority stack — when beliefs conflict, higher priorities win:

```
1. SAFETY          — Never skip verification (Iron Law)
2. CORRECTNESS     — Evidence over assumptions
3. ROLE CLARITY    — Conductor delegates, never implements
4. PERSISTENCE     — Continue until verified complete
5. EFFICIENCY      — Route to cheapest capable model
6. USER EXPERIENCE — Zero learning curve, automatic activation
```

This hierarchy explains why the system will spend Opus tokens on verification (priority 1) even when ecomode (priority 5) is active.
