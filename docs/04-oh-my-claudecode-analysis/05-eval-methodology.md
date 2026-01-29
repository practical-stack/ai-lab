# Evaluation Methodology

**Document:** 05-eval-methodology.md
**Part of:** oh-my-claudecode Analysis
**Source:** `nicobailon/oh-my-claudecode` (v3.7.15)

---

## Verification Systems Overview

| # | System | Purpose | Trigger | Source |
|---|--------|---------|---------|--------|
| 1 | Verification Protocol Module | Reusable 7-check protocol with staleness | Per-completion | `src/features/verification/` |
| 2 | Persistent Mode Stop Handler | Priority cascade: ralph > ultrawork > todos | Stop event | `scripts/persistent-mode.mjs` |
| 3 | Ralph Loop + Architect Verification | Promise-token-gated persistence with peer review | Ralph mode | `src/hooks/ralph/` |
| 4 | Autopilot Phase State Machine | 5-phase lifecycle with signal-based transitions | Autopilot mode | `src/hooks/autopilot/` |
| 5 | Mode Registry | Mutual exclusion for 8 execution modes | Mode activation | `src/hooks/mode-registry/` |
| 6 | Pre-Tool Enforcer | Contextual reminders before tool execution | PreToolUse event | `scripts/pre-tool-enforcer.mjs` |
| 7 | Post-Tool Verifier | Failure detection + remember tag processing | PostToolUse event | `scripts/post-tool-verifier.mjs` |
| 8 | Permission Handler | Auto-approve safe commands, reject dangerous | PermissionRequest | `src/hooks/permission-handler/` |
| 9 | Thinking Block Validator | Prevent API errors from missing thinking blocks | Message transform | `src/hooks/thinking-block-validator/` |
| 10 | Empty Message Sanitizer | Prevent API errors from empty messages | Message transform | `src/hooks/empty-message-sanitizer/` |
| 11 | Session Start Restoration | Restore active modes on session begin | SessionStart | `scripts/session-start.mjs` |
| 12 | Session End Cleanup | Record metrics, cleanup transient state | SessionEnd | `src/hooks/session-end/` |
| 13 | Pre-Compact Checkpoint | Preserve state before context window compaction | PreCompact | `src/hooks/pre-compact/` |
| 14 | Subagent Tracker | Monitor spawned agents with liveness detection | SubagentStart/Stop | `src/hooks/subagent-tracker/` |
| 15 | Todo Continuation | Prevent stopping with incomplete todos | Stop event | `src/hooks/todo-continuation/` |
| 16 | Keyword Detector | Detect mode activation keywords in prompts | UserPromptSubmit | `src/hooks/keyword-detector/` |
| 17 | Doctor Health Checks | Diagnose installation issues | Manual | `skills/doctor/SKILL.md` |

---

## System Details

### 1. Verification Protocol Module

**Purpose:** Reusable verification engine shared across ralph, ultrawork, and autopilot.

**Source:** `src/features/verification/types.ts`, `src/features/verification/index.ts`

**How It Works:**

Seven standard check types:

| Check Type | Evidence Required | Typical Command |
|------------|-------------------|-----------------|
| `build_success` | Exit code 0 | `npm run build` |
| `test_pass` | All tests pass | `npm test` |
| `lint_clean` | No lint errors | `npm run lint` |
| `functionality_verified` | Feature works as specified | Manual or automated |
| `architect_approval` | Architect agent approves | Task delegation |
| `todo_complete` | Zero pending/in-progress tasks | Todo list check |
| `error_free` | No unaddressed errors | `lsp_diagnostics` |

**Protocol lifecycle:**
```
createProtocol(checks, options)
  → createChecklist() — instantiates checks with pending status
  → runVerification() — executes checks (parallel or sequential)
    → For each check:
       → Run verification command
       → Capture output + timestamp
       → checkEvidence() — validate freshness (5-min window)
       → Record pass/fail with evidence
  → validateChecklist() — apply custom validators
  → formatReport() — output markdown/text/json
```

**Evidence freshness detection:**
```typescript
const EVIDENCE_FRESHNESS_WINDOW = 5 * 60 * 1000; // 5 minutes

function isEvidenceStale(evidence: VerificationEvidence): boolean {
  const age = Date.now() - evidence.timestamp;
  return age > EVIDENCE_FRESHNESS_WINDOW;
}
```

**Verification options:**
```typescript
interface VerificationOptions {
  parallel: boolean;     // Run checks concurrently
  failFast: boolean;     // Stop on first failure
  strictMode: boolean;   // Optional check failures = reject
  timeout: number;       // Per-check timeout in ms
}
```

**Per-workflow configurations (from `example.ts`):**

| Workflow | Checks | Options |
|----------|--------|---------|
| Ralph | BUILD + TEST + ARCHITECT | Sequential, strict |
| Ultrawork | BUILD + TEST + TODO | Parallel, fail-fast |
| Autopilot QA | BUILD + LINT + TEST | Parallel |
| Autopilot Validation | FUNCTIONALITY + ARCHITECT + ERROR_FREE | Sequential, strict |

**Failure Behavior:** Returns `verdict: 'rejected'` with issue list and recommendations. Consumers (ralph, autopilot) use the rejection to trigger re-work cycles.

---

### 2. Persistent Mode Stop Handler

**Purpose:** Unified stop prevention with priority-based cascade.

**Source:** `scripts/persistent-mode.mjs`

**How It Works:**

Three-level priority cascade on every Stop event:

```
Stop event received
  ↓
Priority 1: Ralph active? (.omc/state/ralph-state.json)
  YES → Block stop. Increment iteration. Inject PRD context.
        Check if PRD all-complete → allow stop.
        Max 100 iterations.
  NO ↓
Priority 2: Ultrawork active + incomplete todos?
  YES → Block stop. Increment reinforcement count.
        Max 10 reinforcements → allow stop with warning.
  NO ↓
Priority 3: Incomplete todos?
  YES → Block stop. Increment continuation count.
        Max 15 continuations → allow stop with warning.
  NO ↓
Allow stop. Clean up notepad entries.
```

**Output contract:**
```typescript
interface HookOutput {
  continue: boolean;  // false = block the stop
  message?: string;   // continuation instruction
  reason?: string;    // human-readable explanation
}
```

**Escape mechanisms:**
- Ralph: 100 iterations max, PRD completion detection
- Ultrawork: 10 reinforcement messages before allowing stop
- Todos: 15 continuation attempts tracked in `.omc/continuation-count.json`

**Failure Behavior:** Any error in the handler → `{continue: true}` (never block on crash).

---

### 3. Ralph Loop + Architect Verification

**Purpose:** Self-referential persistence loop that re-invokes the agent until verified completion.

**Source:** `src/hooks/ralph/loop.ts`, `src/hooks/ralph/verifier.ts`

**How It Works:**

**Loop mechanism (`loop.ts`):**
```
1. Agent works on task
2. Agent outputs <promise>TOKEN</promise> when it believes done
3. detectCompletionPromise() scans session transcript for token
4. If found → enter architect verification
5. If not found → increment iteration, block stop, re-invoke
```

**Architect verification (`verifier.ts`):**
```
1. startVerification() creates .omc/state/ralph-verification.json
2. Architect agent spawned to review work
3. Architect outputs:
   <architect-approved>VERIFIED_COMPLETE</architect-approved>
   OR explains rejection
4. detectArchitectApproval() scans for approval pattern
5. If APPROVED → clearRalphState() + clearVerificationState()
6. If REJECTED → recordArchitectFeedback() → continue loop
7. Max 3 verification attempts → force-accept
```

**State files:**
```json
// .omc/state/ralph-state.json
{
  "active": true,
  "iteration": 3,
  "maxIterations": 100,
  "prompt": "Original task description...",
  "completionPromise": "TASK_ABC123_COMPLETE",
  "startedAt": "2026-01-29T08:00:00Z"
}

// .omc/state/ralph-verification.json
{
  "pending": true,
  "attempts": 1,
  "maxAttempts": 3,
  "feedback": ["Previous attempt: missing test coverage"]
}
```

**PRD Integration:** When `--prd` flag is used, ralph tracks user stories from `.omc/prd.json` and considers completion only when all stories' acceptance criteria pass.

---

### 4. Autopilot Phase State Machine

**Purpose:** 5-phase autonomous execution lifecycle with signal-based transitions.

**Source:** `src/hooks/autopilot/types.ts`, `state.ts`, `enforcement.ts`, `validation.ts`

**Phase lifecycle:**

```
expansion → planning → execution → qa → validation → complete
                                                    ↘ failed
```

**Phase details:**

| Phase | Agents Used | Output | Transition Signal |
|-------|-------------|--------|-------------------|
| expansion | Analyst (Opus) + Architect (Opus) | `.omc/autopilot/spec.md` | Spec written |
| planning | Architect (direct mode) + Critic | `.omc/plans/autopilot-impl.md` | Plan approved |
| execution | Ralph + Ultrawork (parallel) | Implemented code | `EXECUTION_COMPLETE` |
| qa | UltraQA (build/lint/test/fix cycle) | Passing builds | `QA_COMPLETE` |
| validation | 3 parallel Architects (functional + security + quality) | Unanimous approval | All APPROVED |

**Signal detection (`enforcement.ts`):**
Scans session transcript for 8 signal patterns:
- `EXECUTION_COMPLETE`, `QA_COMPLETE`, `VALIDATION_APPROVED`
- `PHASE_TRANSITION:*`, `AUTOPILOT_CANCEL`
- Phase-specific completion markers

**Phase transitions with rollback (`state.ts`):**
```typescript
async function transitionRalphToUltraQA(state: AutopilotState) {
  // 1. Save current state as rollback point
  // 2. Clear ralph state files
  // 3. Clear ultrawork state files
  // 4. Initialize ultraqa state
  // 5. If any step fails → restore from rollback
}
```

**Validation protocol (`validation.ts`):**
```
Round N (max 3 rounds):
  1. Spawn 3 parallel architect agents:
     - Functional reviewer (does it work?)
     - Security reviewer (any vulnerabilities?)
     - Quality reviewer (code quality?)
  2. Collect verdicts: APPROVED or REJECTED with issues
  3. ALL 3 must APPROVED → complete
  4. ANY REJECTED → fix issues → retry (up to 3 rounds)
  5. 3 rounds failed → mark as failed
```

**Configuration (from `types.ts`):**
```typescript
const DEFAULT_CONFIG: AutopilotConfig = {
  maxIterations: 10,
  maxQaCycles: 5,
  maxValidationRounds: 3,
  pauseAfterExpansion: false,
  pauseAfterPlanning: false,
  skipQa: false,
  skipValidation: false,
};
```

**State file:** `.omc/state/autopilot-state.json` with full phase history, timestamps, and sub-mode states.

---

### 5. Mode Registry

**Purpose:** Centralized mutual exclusion ensuring conflicting modes cannot run simultaneously.

**Source:** `src/hooks/mode-registry/index.ts`

**Managed modes (8):**

| Mode | Exclusive | State Detection |
|------|-----------|-----------------|
| autopilot | Yes | `.omc/state/autopilot-state.json` |
| ultrapilot | Yes | `.omc/state/ultrapilot-state.json` |
| swarm | Yes | `.omc/state/swarm-active.marker` |
| pipeline | Yes | `.omc/state/pipeline-state.json` |
| ralph | No | `.omc/state/ralph-state.json` |
| ultrawork | No | `.omc/state/ultrawork-state.json` |
| ultraqa | No | `.omc/state/ultraqa-state.json` |
| ecomode | No | `.omc/state/ecomode-state.json` |

**Mutual exclusion rules:**
- Exclusive modes (autopilot, ultrapilot, swarm, pipeline) cannot coexist with each other
- Non-exclusive modes (ralph, ultrawork, ultraqa, ecomode) can coexist with exclusive modes
- `canStartMode(mode)` checks for conflicts before activation

**Stale detection:** State files older than 1 hour are auto-removed as stale markers.

**Design constraint:** File-based detection only — no imports from mode modules to prevent circular dependencies.

---

### 6. Pre-Tool Enforcer

**Purpose:** Inject contextual reminders before tool execution.

**Source:** `scripts/pre-tool-enforcer.mjs`

**Trigger:** `PreToolUse` lifecycle event

**Behavior:**
- Injects current todo status as prefix
- Provides tool-specific guidance (e.g., "verify build output" before Bash)
- Runs delegation enforcement via omc-orchestrator (warns when orchestrator writes to source files)

---

### 7. Post-Tool Verifier

**Purpose:** Process tool outputs for failure detection and memory extraction.

**Source:** `scripts/post-tool-verifier.mjs`

**Trigger:** `PostToolUse` lifecycle event

**Behavior:**
- Detects bash failures via regex patterns (exit codes, error keywords)
- Processes `<remember>` and `<remember priority>` tags into notepad files
- Tracks session statistics (tool calls, agents spawned, time)
- Generates contextual messages per tool type

---

### 8. Permission Handler

**Purpose:** Auto-approve safe commands to reduce user friction, reject dangerous ones.

**Source:** `src/hooks/permission-handler/index.ts`

**Trigger:** `PermissionRequest` for Bash tool

**Safe command patterns (auto-approved):**
- `git status`, `git log`, `git diff`
- `npm test`, `npm run lint`, `npm run build`
- `ls`, `cat`, `head`, `tail`
- `python3 --version`, `pip list`

**Dangerous patterns (rejected):**
- Commands containing shell metacharacters: `; & | $ \` ( ) { } [ ]`
- Pipe chains that could be injection vectors

**Mode-aware:** Checks active mode state for context-appropriate decisions.

---

### 9. Thinking Block Validator

**Purpose:** Prevent API errors when using extended-thinking models.

**Source:** `src/hooks/thinking-block-validator/index.ts`

**Trigger:** `experimental.chat.messages.transform` hook

**Problem:** Extended-thinking models (Claude Sonnet 4, Opus 4) require assistant messages to start with a thinking block before content blocks. Missing blocks cause API errors.

**Fix:** Detects models requiring thinking blocks, scans messages, and prepends synthetic thinking blocks when missing. Uses previous thinking content when available, or a default placeholder.

---

### 10. Empty Message Sanitizer

**Purpose:** Prevent API errors from empty message content.

**Source:** `src/hooks/empty-message-sanitizer/index.ts`

**Trigger:** `experimental.chat.messages.transform` hook

**Problem:** The API requires all messages to have non-empty content.

**Fix:** Scans all messages, injects placeholder text for empty content, marks injected content as synthetic. Skips the final assistant message (allowed to be empty).

---

### 11. Session Start Restoration

**Purpose:** Restore active execution modes when a new session begins.

**Source:** `scripts/session-start.mjs`

**Trigger:** `SessionStart` lifecycle event

**Behavior:**
1. Check HUD installation status
2. Scan for active mode state files (ultrawork, ralph, autopilot, etc.)
3. For each active mode → inject `<session-restore>` message with context
4. Load notepad priority context
5. Restore todo continuation state

---

### 12. Session End Cleanup

**Purpose:** Record metrics and clean up transient state.

**Source:** `src/hooks/session-end/index.ts`

**Trigger:** `SessionEnd` lifecycle event

**Behavior:**
- `recordSessionMetrics()` — duration, agents spawned, modes used
- `cleanupTransientState()` — remove tracking files, stale checkpoints (>24h), temp files
- `exportSessionSummary()` — write to `.omc/sessions/`

---

### 13. Pre-Compact Checkpoint

**Purpose:** Preserve critical state before context window compaction.

**Source:** `src/hooks/pre-compact/index.ts`

**Trigger:** `PreCompact` lifecycle event

**Behavior:** Creates checkpoint with:
- Active mode states (which modes are running)
- Todo summary (what's pending)
- Wisdom export from notepad files
- Saves to `.omc/state/checkpoints/`

---

### 14. Subagent Tracker

**Purpose:** Comprehensive monitoring of all spawned agents.

**Source:** `src/hooks/subagent-tracker/index.ts`

**Trigger:** `SubagentStart` and `SubagentStop` lifecycle events

**Behavior:**
- Records agent info with parent mode context on start
- Records completion/failure status on stop
- File-based locking (5-second timeout with stale detection) for concurrent access
- Stale agent detection (5-minute threshold)
- Eviction of old completed agents (max 100 entries)

**State:** `.omc/state/subagent-tracking.json`

---

### 15. Todo Continuation

**Purpose:** Prevent stopping when tasks remain incomplete.

**Source:** `src/hooks/todo-continuation/index.ts`, `hooks/stop-continuation.sh`

**Trigger:** `Stop` event (lowest priority in cascade)

**Behavior:** Scans todo lists for non-completed/non-cancelled items. Returns `{continue: false}` to block stop with todo count message. Escape after 15 attempts.

---

### 16. Keyword Detector

**Purpose:** Detect mode activation keywords in user prompts.

**Source:** `src/hooks/keyword-detector/`

**Trigger:** `UserPromptSubmit` event

**Priority order:** ralph > ultrawork > ultrathink > search > analyze

**Behavior:** Strips code blocks before matching. Case-insensitive with word boundaries. On detection, writes activation state files for the corresponding mode.

---

### 17. Doctor Health Checks

**Purpose:** Diagnose and fix installation issues.

**Source:** `skills/doctor/SKILL.md`

**Checks performed:**

| Check | What It Looks For | Auto-Fix |
|-------|-------------------|----------|
| Plugin version | Mismatch between installed and latest | Update |
| Legacy hooks | Old hook scripts in settings.json | Remove |
| CLAUDE.md config | Outdated orchestration instructions | Update |
| Stale cache | Old plugin cache files | Clear |
| Legacy curl content | Files from old curl-based installation | Remove |
| Bash scripts | Deprecated shell hook scripts | Remove |

---

## Hook Lifecycle Summary

```
SessionStart
  → session-start.mjs: Restore modes, HUD check, notepad context
  ↓
User types prompt
  → keyword-detector: Detect mode keywords
  → skill-injector: Inject skill context
  → context-injector: Inject AGENTS.md
  ↓
For each tool call:
  → pre-tool-enforcer: Todo status + tool guidance + delegation check
  → permission-handler: Auto-approve safe commands
  → [tool executes]
  → post-tool-verifier: Failure detection + remember tags + stats
  ↓
For subagent spawns:
  → subagent-tracker(start): Record agent + parent mode
  → [agent executes]
  → subagent-tracker(stop): Record completion/failure
  ↓
Stop attempt:
  → persistent-mode: Priority cascade (ralph > ultrawork > todos)
  → If blocked → inject continuation message
  → If allowed → proceed to session end
  ↓
Context window compaction:
  → pre-compact: Checkpoint modes + todos + wisdom
  ↓
SessionEnd
  → session-end: Record metrics, cleanup state, export summary
```

---

## State File Architecture

| File | Owner | Content |
|------|-------|---------|
| `.omc/state/ralph-state.json` | Ralph loop | Active, iteration, prompt, promise token |
| `.omc/state/ralph-verification.json` | Ralph verifier | Pending, attempts, architect feedback |
| `.omc/state/ultrawork-state.json` | Ultrawork mode | Active, reinforcement count, prompt |
| `.omc/state/autopilot-state.json` | Autopilot | Active, phase, all sub-phase states |
| `.omc/state/ultraqa-state.json` | UltraQA | Active, cycle count, goal type |
| `.omc/state/ultrapilot-state.json` | Ultrapilot | Active, workers, ownership map |
| `.omc/state/pipeline-state.json` | Pipeline | Active, stages, current stage |
| `.omc/state/ecomode-state.json` | Ecomode | Active, token budget |
| `.omc/state/swarm-active.marker` | Swarm | Marker file (SQLite check) |
| `.omc/state/subagent-tracking.json` | Subagent tracker | Agent list, totals |
| `.omc/state/checkpoints/` | Pre-compact | Checkpoint snapshots |
| `.omc/continuation-count.json` | Todo continuation | Escape counter |
| `~/.claude/.session-stats.json` | Post-tool verifier | Session statistics |

**State hygiene rule:** Delete files on completion, never set `active: false`. This prevents stale state from being misread by future sessions.

---

## Test Coverage

| Test File | What It Tests | Location |
|-----------|---------------|----------|
| `hooks.test.ts` | Keyword detection, todo continuation, hook output format, mutual exclusion | `src/__tests__/` |
| `validation.test.ts` | Autopilot verdict recording, round management, retry logic, formatting | `src/hooks/autopilot/__tests__/` |
| `cancel.test.ts` | Autopilot cancellation | `src/hooks/autopilot/__tests__/` |
| `state.test.ts` | Autopilot state transitions | `src/hooks/autopilot/__tests__/` |
| `transition.test.ts` | Phase transition logic with rollback | `src/hooks/autopilot/__tests__/` |
| `summary.test.ts` | Autopilot summary generation | `src/hooks/autopilot/__tests__/` |
| `prompts.test.ts` | Autopilot prompt generation | `src/hooks/autopilot/__tests__/` |
| `swarm.test.ts` | Swarm coordination, task claiming | `src/__tests__/` |
| `think-mode.test.ts` | Thinking block validation | `src/__tests__/` |
| `analytics.test.ts` | Usage tracking | `src/__tests__/` |
| `rate-limit-wait.test.ts` | Rate limit handling | `src/__tests__/` |

**Coverage gaps:**
- No integration tests for full hook lifecycle flow
- No tests for `persistent-mode.mjs` escape mechanisms
- Verification module has example code but no test suite
- Shell script hooks (bash) have no tests

---

## Cross-Cutting Observations

### The Verification Paradox

The `src/features/verification/` module provides a clean, typed, reusable verification protocol. However, actual verification in the system is done ad-hoc in `ralph/verifier.ts` (transcript scanning for approval tokens) and `autopilot/validation.ts` (parallel architect spawning). The module exists as an architectural ideal that the codebase has not fully adopted.

### The Dual Implementation Problem

Both bash scripts (`hooks/*.sh`) and Node.js scripts (`scripts/*.mjs`) implement the same logic independently. The Node.js versions have escape mechanisms (max reinforcements, continuation counts) that the bash versions lack. The `hooks.json` configuration only references Node.js scripts, but the bash scripts still exist in the repository, creating potential confusion.

### State as the Universal Coordination Mechanism

Since hooks run as separate processes (invoked by Claude Code on each event), they cannot share in-memory state. The `.omc/state/` directory serves as a shared-memory abstraction, with JSON files acting as inter-process communication channels. This is both the system's greatest architectural strength (survives session restarts) and its greatest fragility (file system as database).
