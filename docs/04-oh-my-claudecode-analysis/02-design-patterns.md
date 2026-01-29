# Design Patterns

**Document:** 02-design-patterns.md
**Part of:** oh-my-claudecode Analysis
**Source:** `nicobailon/oh-my-claudecode` (v3.7.15)

---

## Pattern Catalog

| # | Pattern | Problem | Impact |
|---|---------|---------|--------|
| 1 | Capability Fence | Agents use tools they shouldn't | High |
| 2 | Worker Preamble | Workers recursively spawn agents | High |
| 3 | Tiered Model Routing | Expensive models used for simple tasks | High |
| 4 | Evidence-Gated Completion | Agents claim "done" without verification | Critical |
| 5 | Self-Referential Persistence Loop | Agents abandon complex tasks | High |
| 6 | File Ownership Partitioning | Parallel agents create merge conflicts | High |
| 7 | Atomic Task Claiming | Multiple agents duplicate the same work | Medium |
| 8 | Multi-Agent Consensus Loop | Single-perspective plans have blind spots | High |
| 9 | Priority-Based Context Injection | Static prompts lack file-specific context | Medium |
| 10 | Phased Autonomous Pipeline | Complex tasks need different agent types per phase | High |
| 11 | Intent-Triggered Skill Activation | Users must learn commands | Medium |
| 12 | Structured Agent Communication | Unstructured text causes information loss | Medium |

---

## Pattern Details

### Pattern 1: Capability Fence

**Problem:** LLM agents use any available tool, even when their role should be advisory-only. An "architect" agent will start editing files instead of analyzing. The root cause is that LLMs are trained to be helpful, and "helpful" defaults to "do the thing" rather than "advise about the thing."

**Solution:** Dual enforcement at two independent layers: (1) disable tools via YAML frontmatter (`disallowedTools: Write, Edit`) so the tool call physically fails, and (2) include explicit "FORBIDDEN ACTIONS" in the prompt body so the model understands *why* and does not waste tokens attempting blocked calls.

**Implementation:**

```yaml
# agents/architect.md frontmatter
---
name: architect
model: opus
disallowedTools: Write, Edit, NotebookEdit
---
```

```markdown
# Architect prompt body
<Critical_Constraints>
BLOCKED ACTIONS:
- Write tool: BLOCKED
- Edit tool: BLOCKED
- Any file modification: BLOCKED
You are a STRATEGIC CONSULTANT, not an implementer.
</Critical_Constraints>
```

The explore agent adds `Task` to its disallowed list (preventing delegation), and contrastive identity tables reinforce boundaries:

```markdown
| What You ARE           | What You ARE NOT    |
|------------------------|---------------------|
| Strategic consultant   | Code writer         |
| Architecture reviewer  | Bug fixer           |
```

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Agents stay in their designated role | Architect starts editing files, bypassing code review |
| Model tier optimization preserved | Read-only Opus agent wastes tokens on edits Sonnet could do |
| Orchestration integrity maintained | Agents self-implement instead of reporting back |
| Tool call budget not wasted | Model spends tokens trying forbidden tools, hitting errors, retrying |

**Anti-Pattern (What Happens Without It):**

The architect notices a bug in the code it is reading and silently fixes it. This bypasses model routing (Opus used for a simple edit), the verification protocol (no build/test run), and the orchestrator's task tracking (no record of the change). The fix introduces a subtle regression that nobody catches.

**When to Use:**
- Any agent that should be read-only (architects, critics, reviewers, planners)
- Agents that should not delegate (executors, scientists)
- Any role where the model's "helpfulness" tendency conflicts with role constraints

**Related Patterns:** [Worker Preamble](#pattern-2-worker-preamble-anti-recursion-guard), [Tiered Model Routing](#pattern-3-tiered-model-routing), [Structured Agent Communication](#pattern-12-structured-agent-communication)

**Source:** `agents/architect.md`, `agents/explore.md`, `agents/critic.md`, `agents/planner.md`

---

### Pattern 2: Worker Preamble (Anti-Recursion Guard)

**Problem:** When an orchestrator spawns a worker, the worker inherits the global system prompt (CLAUDE.md) that says "You are a CONDUCTOR, not a performer" and "ALWAYS delegate substantive work." The worker then tries to spawn sub-agents, creating uncontrolled recursive delegation.

**Solution:** Prepend a preamble to every worker task that overrides the global delegation instruction via position-priority (appearing first in the prompt) and direct contradiction ("You are a WORKER agent, not an orchestrator").

**Implementation:**

```typescript
// src/agents/preamble.ts
export const WORKER_PREAMBLE = `CONTEXT: You are a WORKER agent, not an orchestrator.
RULES:
- Complete ONLY the task described below
- Use tools directly (Read, Write, Edit, Bash, etc.)
- Do NOT spawn sub-agents
- Do NOT call TaskCreate or TaskUpdate
- Report your results with absolute file paths
TASK:
`;

export function wrapWithPreamble(taskPrompt: string): string {
  return WORKER_PREAMBLE + taskPrompt;
}
```

Agent definitions reinforce this in their own prompts:

```markdown
# agents/executor.md
<Tier_Identity>
Executor (Medium Tier) - Standard Task Executor
Work ALONE - no delegation.
**Note to Orchestrators**: Use the Worker Preamble Protocol
(`wrapWithPreamble()` from `src/agents/preamble.ts`).
</Tier_Identity>

<Critical_Constraints>
BLOCKED ACTIONS:
- Task tool: BLOCKED (no delegation)
- Agent spawning: BLOCKED
You work ALONE. Execute directly.
</Critical_Constraints>
```

The preamble works because of prompt position priority: instructions appearing earlier in the context window have stronger influence than those appearing later.

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Single level of delegation maintained | Workers spawn sub-workers creating cost explosion |
| Predictable execution depth | Uncontrolled recursion -- A spawns B spawns C spawns D |
| Results propagate back to orchestrator | Nested agents lose results in the delegation chain |
| Token budget remains bounded | Each delegation level multiplies token consumption |

**Anti-Pattern (What Happens Without It):**

The orchestrator delegates "Implement user authentication" to an executor. The executor reads CLAUDE.md and spawns an explore agent, then an architect, then another executor. That nested executor tries to delegate again. Result: 5-10 agents spawned, token cost multiplied 3-5x, results never propagate back, top-level task times out.

**When to Use:**
- Any hierarchical multi-agent system where workers inherit orchestrator-level instructions
- Systems where the global prompt instructs delegation behavior

**Related Patterns:** [Capability Fence](#pattern-1-capability-fence), [Structured Agent Communication](#pattern-12-structured-agent-communication)

**Source:** `src/agents/preamble.ts`, `agents/executor.md`, `agents/executor-high.md`, `agents/executor-low.md`

---

### Pattern 3: Tiered Model Routing

**Problem:** Using Opus (~$15/MTok) for every sub-task wastes tokens. A simple file lookup does not need Opus-level reasoning. Manual model selection by the orchestrator (itself an LLM) is unreliable.

**Solution:** A 4-stage automated routing pipeline: signal extraction, weighted scoring, rules engine evaluation, and routing decision. Every agent exists in LOW (Haiku), MEDIUM (Sonnet), HIGH (Opus) variants.

**Implementation:**

**Stage 1 -- Signal Extraction** (15+ indicators across three categories):

| Category | Signals | Weight |
|----------|---------|--------|
| Lexical | Architecture keywords ("refactor", "migrate", "redesign") | +3 each |
| Lexical | Debugging keywords ("race condition", "memory leak") | +3 each |
| Lexical | Simple keywords ("find", "lookup", "what is") | -2 each |
| Structural | Cross-file dependencies, import chains | +2 |
| Structural | System-wide impact scope | +3 |
| Context | Per previous failure on same task | +2 each |
| Context | Security/performance domain | +2 |
| Context | Explicit model override | Overrides all |

**Stage 2 -- Rules Engine** (priority-ordered, first match wins):

```
priority 100: explicit model override
priority  90: orchestrator fixed to Opus
priority  85: agent-specific adaptive rules
priority  75: domain-specific rules (security → Opus)
priority  45: task-based routing
priority   0: default to Sonnet
```

**Stage 3 -- Routing Decision:**

| Score | Tier | Behavioral Instructions |
|-------|------|-------------------------|
| >= 8 | HIGH (Opus) | "Full codebase exploration. No escalation needed." |
| >= 4 | MEDIUM (Sonnet) | "Up to 20 files. Escalate to HIGH if system-wide refactoring needed." |
| < 4 | LOW (Haiku) | "Limit to 5 files. Escalate to MEDIUM if complexity exceeds expectations." |

Tier-specific instructions from `agents/templates/tier-instructions.md` are injected into agent prompts, adapting behavior to model capability.

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| ~47% cost reduction (reported) | Every task uses Opus at $15/MTok |
| Appropriate reasoning depth per task | Simple lookups overthought; complex tasks underthought |
| Automatic escalation via failure history | Failed Haiku attempts stay at Haiku |
| Behavioral adaptation per tier | All models given identical instructions |

**Anti-Pattern (What Happens Without It):**

A user runs "autopilot: build a full-stack app" generating 30 sub-tasks. Without routing, all 30 use Opus: ~$22.50. With routing (lookups on Haiku, implementation on Sonnet, architecture on Opus): ~$12, a 47% reduction.

**When to Use:**
- Multi-model systems with varying task complexity
- Cost optimization for autonomous multi-task workflows

**Related Patterns:** [Evidence-Gated Completion](#pattern-4-evidence-gated-completion) (failure triggers re-routing), [Phased Autonomous Pipeline](#pattern-10-phased-autonomous-pipeline-autopilot), [Capability Fence](#pattern-1-capability-fence)

**Source:** `src/features/model-routing/`, `agents/templates/tier-instructions.md`, `src/agents/definitions.ts`

---

### Pattern 4: Evidence-Gated Completion

**Problem:** LLMs claim "done" without verifying. They use hedging language ("should work") and move on. This is the single most common LLM failure mode: the model generates code, feels confident, and declares success. Downstream agents trust the claim.

**Solution:** A reusable `VerificationProtocol` with typed evidence checks, a 5-minute freshness window, and a mandatory Architect approval gate. No agent can claim completion without passing verification with fresh evidence.

**Implementation:**

Seven standard check types:

| Check Type | Evidence Required |
|------------|-------------------|
| `build_success` | Exit code 0 from build command |
| `test_pass` | All tests pass (or pre-existing failures documented) |
| `lint_clean` | No lint errors introduced |
| `functionality_verified` | Feature works as specified |
| `architect_approval` | Architect agent reviews and approves |
| `todo_complete` | Zero pending/in-progress tasks |
| `error_free` | No unaddressed errors (`lsp_diagnostics`) |

```typescript
// src/features/verification/index.ts
interface VerificationCheck {
  type: string;
  status: 'pass' | 'fail' | 'skipped';
  evidence: string;
  timestamp: number;
}

const EVIDENCE_FRESHNESS_WINDOW = 5 * 60 * 1000; // 5 minutes

function isEvidenceFresh(check: VerificationCheck): boolean {
  return Date.now() - check.timestamp < EVIDENCE_FRESHNESS_WINDOW;
}
```

Evidence-to-claim mapping enforced in agent prompts:

| Claim | Required Evidence |
|-------|-------------------|
| "Fixed" | Test showing it passes now |
| "Implemented" | `lsp_diagnostics` clean + build exit 0 |
| "Refactored" | All existing tests still pass |
| "Debugged" | Root cause identified with file:line |

Metacognitive self-monitoring embedded in agent prompts:

```markdown
## Iron Law: NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
Red Flags (STOP and verify):
- Using "should", "probably", "seems to"
- Expressing satisfaction before verification
- Claiming completion without fresh evidence
```

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Completion claims backed by evidence | Agent says "done," code doesn't compile |
| Stale evidence rejected automatically | Agent cites test results from before its changes |
| Downstream agents can trust results | Cascading failures from unverified work |
| Self-monitoring catches hedging language | "Should work" passes as completion unchallenged |

**Anti-Pattern (What Happens Without It):**

An executor outputs: "I've implemented authentication. The code looks correct and should work." The orchestrator trusts this and moves on. In QA, the build fails -- a missing import was never caught. Two phases of work are wasted.

**When to Use:**
- Any LLM workflow producing claims about real-world state
- Multi-agent pipelines where downstream agents depend on upstream correctness

**Related Patterns:** [Self-Referential Persistence Loop](#pattern-5-self-referential-persistence-loop-ralph), [Multi-Agent Consensus Loop](#pattern-8-multi-agent-consensus-loop-ralplan), [Phased Autonomous Pipeline](#pattern-10-phased-autonomous-pipeline-autopilot)

**Source:** `src/features/verification/index.ts`, `skills/ralph/SKILL.md`, `agents/architect.md`, `agents/executor.md`

---

### Pattern 5: Self-Referential Persistence Loop (Ralph)

**Problem:** LLM agents stop too early. They complete partial work, encounter a tricky edge case, and claim success. The model has no mechanism to re-invoke itself. Tasks requiring 5 iterations of try-fix-verify get one iteration.

**Solution:** A loop where the agent is re-invoked with its own previous context. The loop terminates only when a completion token (`<promise>{{PROMISE}}</promise>`) is emitted after Architect verification approves.

**Implementation:**

```
Ralph Loop:
  ┌─────────────────────────────────────────┐
  │ 1. Invoke agent with task + context     │
  │ 2. Agent works toward completion        │
  │ 3. Verification Sub-Loop:               │
  │    a. Run build/test/lint checks        │
  │    b. Check evidence freshness          │
  │    c. Spawn Architect for review        │
  │    d. If REJECTED → fix → goto (a)     │
  │    e. If APPROVED → continue            │
  │ 4. Emit: <promise>{{PROMISE}}</promise> │
  │ 5. Runtime detects promise → EXIT LOOP  │
  │                                         │
  │ If no promise detected:                 │
  │ 6. Re-invoke: "Continue working."       │
  │ 7. → goto step 2                        │
  └─────────────────────────────────────────┘
```

State tracked in JSON:

```json
// .omc/state/ralph-state.json
{
  "active": true,
  "taskDescription": "Implement user authentication with JWT",
  "iteration": 3,
  "maxIterations": 10,
  "startTime": "2025-01-15T10:30:00Z",
  "lastIterationTime": "2025-01-15T10:45:00Z"
}
```

Promise detection and state management:

```typescript
// src/hooks/ralph/index.ts (conceptual)
function handleRalphIteration(output: string, state: RalphState):
  'continue' | 'complete' {
  if (/<promise>.*<\/promise>/.test(output)) {
    deleteStateFile('.omc/state/ralph-state.json'); // DELETE, not set active: false
    return 'complete';
  }
  if (state.iteration >= state.maxIterations) return 'complete'; // Force-exit
  state.iteration++;
  writeStateFile('.omc/state/ralph-state.json', state);
  return 'continue';
}
```

The `stop-continuation` hook prevents premature session termination while ralph is active.

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Tasks complete fully, not partially | Agent does 60% and claims "done" |
| Self-correction across iterations | No persistence through failures |
| Verification mandatory, not optional | Skipping verification has no consequence |
| State survives context window limits | Long tasks lost when context exceeds limit |
| Graceful degradation via max iterations | Infinite loops without iteration cap |

**Anti-Pattern (What Happens Without It):**

A refactoring task requires modifying 15 files. The agent completes 8, encounters a type error cascade in file 9, and outputs: "I've refactored the module. Some edge cases may need additional work." Without ralph, this is the final output. With ralph, the loop re-invokes the agent until all 15 files are done and verified.

**When to Use:**
- Tasks requiring guaranteed completion, not best-effort
- Complex multi-step work where partial results are insufficient

**Related Patterns:** [Evidence-Gated Completion](#pattern-4-evidence-gated-completion), [Phased Autonomous Pipeline](#pattern-10-phased-autonomous-pipeline-autopilot)

**Source:** `skills/ralph/SKILL.md`, `src/hooks/ralph/`, `.omc/state/ralph-state.json`, `src/hooks/stop-continuation/`

---

### Pattern 6: File Ownership Partitioning

**Problem:** Multiple agents modifying files in parallel create conflicts. LLM agents have no merge capability. If two agents both modify `src/index.ts`, the second write overwrites the first.

**Solution:** Static file partitioning where a coordinator assigns exclusive ownership before parallel execution. Shared files are deferred to a sequential integration phase.

**Implementation:**

Three-category file classification:

| Category | Description | Handling |
|----------|-------------|----------|
| **Exclusive** | Owned by exactly one worker | Full read/write access |
| **Shared** | Config files (package.json, tsconfig) | Deferred to integration phase |
| **Boundary** | Files importing across ownership boundaries | Read-all, write-by-owner after analysis |

```json
// .omc/state/ultrapilot-ownership.json
{
  "workers": [
    { "id": "worker-1", "ownedFiles": ["src/components/**", "src/pages/**"] },
    { "id": "worker-2", "ownedFiles": ["src/api/**", "src/models/**"] },
    { "id": "worker-3", "ownedFiles": ["src/utils/**", "tests/**"] }
  ],
  "sharedFiles": ["package.json", "tsconfig.json", "src/index.ts"],
  "integrationQueue": []
}
```

Three-phase execution flow:

```
Phase 1: Decomposition → subtasks → file assignment → ownership map
Phase 2: Parallel Execution (workers operate on exclusive files)
Phase 3: Integration (sequential)
  1. Collect results from all workers
  2. Process shared files (package.json, index.ts)
  3. Resolve boundary imports
  4. Run verification protocol
```

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| No write conflicts between parallel agents | Second write overwrites first |
| Clear accountability per worker | Bug in file -- ownership map identifies responsible worker |
| Shared files handled safely in sequence | Config file corruption from concurrent writes |
| Parallelism without merge tooling | Would require git-level merge capability LLMs lack |

**Anti-Pattern (What Happens Without It):**

Three agents work concurrently. Agent A updates `src/index.ts` to export a component. Agent B also updates `src/index.ts` to export an API route. Agent B's write overwrites Agent A's export. The component exists but is unreachable. The build passes (no error on unused code) but the feature silently fails.

**When to Use:**
- Parallel LLM execution where agents modify files (ultrapilot, swarm)
- Tasks with clear module boundaries (frontend/backend/API/tests)

**Related Patterns:** [Atomic Task Claiming](#pattern-7-atomic-task-claiming-sqlite-swarm), [Phased Autonomous Pipeline](#pattern-10-phased-autonomous-pipeline-autopilot)

**Source:** `skills/ultrapilot/SKILL.md`, `.omc/state/ultrapilot-ownership.json`

---

### Pattern 7: Atomic Task Claiming (SQLite Swarm)

**Problem:** Multiple agents reading a shared task pool simultaneously may both claim the same task. Work is duplicated or partially done by each. If an agent dies mid-task, the task must be recoverable.

**Solution:** SQLite provides ACID-compliant task claiming via `BEGIN IMMEDIATE` transactions. Lease-based ownership with heartbeat monitoring auto-releases tasks from dead agents.

**Implementation:**

```sql
-- .omc/state/swarm-tasks.db
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | claimed | done | failed
  agent_id TEXT,
  claimed_at DATETIME,
  heartbeat_at DATETIME,
  result TEXT,
  error TEXT
);
```

Atomic claim with compare-and-swap:

```sql
BEGIN IMMEDIATE;  -- Acquires RESERVED lock
SELECT id, description FROM tasks WHERE status = 'pending' LIMIT 1;
UPDATE tasks SET status = 'claimed', agent_id = ?, claimed_at = datetime('now'),
  heartbeat_at = datetime('now')
  WHERE id = ? AND status = 'pending';  -- CAS guard
COMMIT;
```

Heartbeat protocol (every 60 seconds):

```sql
UPDATE tasks SET heartbeat_at = datetime('now')
  WHERE id = :task_id AND agent_id = :agent_id;
```

Stale claim cleanup (periodic):

```sql
UPDATE tasks SET status = 'pending', agent_id = NULL
  WHERE status = 'claimed'
    AND heartbeat_at < datetime('now', '-5 minutes');
```

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| No duplicate work between agents | Two agents claim same task, work done twice |
| Dead agents don't block progress | Crashed agent's task stuck "claimed" forever |
| ACID prevents race conditions | JSON file read-modify-write has TOCTOU race |
| Progress tracking is a SQL query | Manual counting across agent outputs |
| Failed tasks return to pool automatically | Failed tasks permanently lost |

**Anti-Pattern (What Happens Without It):**

Agent A reads `tasks.json`, sees task #5 pending. Between read and write, Agent B also reads `tasks.json` and sees task #5 pending. Both work on it. This is the classic TOCTOU race condition. SQLite's `BEGIN IMMEDIATE` eliminates it by acquiring a write lock before reading.

**When to Use:**
- Dynamic task lists discovered at runtime
- When agents may fail and tasks must be recoverable
- Swarm-style execution with 3+ concurrent agents

**Related Patterns:** [File Ownership Partitioning](#pattern-6-file-ownership-partitioning), [Self-Referential Persistence Loop](#pattern-5-self-referential-persistence-loop-ralph)

**Source:** `skills/swarm/SKILL.md`, `.omc/state/swarm-tasks.db`

---

### Pattern 8: Multi-Agent Consensus Loop (Ralplan)

**Problem:** A single agent produces plans with blind spots. Self-critique is unreliable because the same biases that produced the plan also evaluate it. True critical review requires a separate agent with a different prompt and calibrated strictness.

**Solution:** Three agents (Planner, Architect, Critic) iterate in a structured loop until the Critic approves. The Critic is the mandatory gatekeeper -- no shortcircuiting is permitted.

**Implementation:**

```
Ralplan Consensus Loop:
  Iteration N (max 5):
  1. PLANNER creates/refines plan
     Input: task + Critic feedback (if N > 1)
  2. ARCHITECT answers strategic questions
     Input: plan + ARCHITECT_QUESTIONs
  3. CRITIC reviews plan + answers
     Output: [OKAY] or [REJECT] with feedback

  If [REJECT] → feedback to Planner, goto 1 (N+1)
  If [OKAY] → plan approved, exit loop
  If N == 5 → force-approve with warning
```

The Critic's calibration backstory (avoids numeric thresholds which models follow too literally):

```markdown
# agents/critic.md
You are reviewing a first-draft work plan from an author with ADHD.
Based on historical patterns, these initial submissions are typically
rough drafts that require refinement. Plans from this author average
7 rejections before receiving an OKAY.
```

Structured communication between agents:

```markdown
# Planner → Architect
ARCHITECT_QUESTION: Should the API use REST or GraphQL?

# Architect → Planner
ARCHITECT_ANSWER: REST is preferred. Existing routes follow Express patterns.

# Critic → Planner (on rejection)
CRITIC_FEEDBACK:
  Verdict: [REJECT]
  Missing: Error handling strategy for API failures
  Weak: Testing strategy lacks integration coverage
  Approved: API route structure is well-designed
```

Critic verdict format requires structured justification:

```markdown
[OKAY] or [REJECT]
## Verdict Justification
- APPROVED items: [what passed]
- REJECTED items: [what must be fixed]
- MISSING items: [what was not addressed]
```

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Genuine multi-perspective review | Single agent's blind spots pass unchallenged |
| Calibrated strictness via narrative | Numeric thresholds produce rubber-stamps or infinite rejection |
| Structured feedback enables improvement | Vague "try again" provides no direction |
| Max 5 iterations prevents infinite loops | Perfectionist critic rejects indefinitely |
| Architect provides grounded context | Planner makes assumptions disconnected from codebase |

**Anti-Pattern (What Happens Without It):**

A single Planner produces a plan that assumes a database structure not matching the actual schema, proposes an API pattern inconsistent with existing routes, and is missing error handling. With ralplan, the Architect catches the schema assumption and the Critic catches missing error handling. The plan goes through 3 iterations and emerges significantly more robust.

**When to Use:**
- High-stakes planning where quality matters more than speed
- Plans that will be executed autonomously (errors are expensive post-execution)

**Related Patterns:** [Evidence-Gated Completion](#pattern-4-evidence-gated-completion), [Structured Agent Communication](#pattern-12-structured-agent-communication), [Capability Fence](#pattern-1-capability-fence)

**Source:** `commands/ralplan.md`, `agents/critic.md`, `agents/planner.md`, `agents/architect.md`

---

### Pattern 9: Priority-Based Context Injection

**Problem:** The system prompt is static, but agents need file-specific context. A file in `src/api/` needs API conventions; a file in `src/components/` needs React guidelines. Hardcoding all conventions wastes tokens and dilutes relevance.

**Solution:** Two complementary systems: (1) a **Context Collector** with priority-based accumulation and deduplication, and (2) a **Rules Injector** that walks the directory tree from the working file upward, finding `.claude/rules/` files sorted by proximity.

**Implementation:**

Context Collector with four priority levels:

```typescript
// src/features/context-injector/index.ts (conceptual)
interface ContextEntry {
  source: string;      // "rules-injector", "agents-md", "user"
  id: string;          // "api-conventions", "react-patterns"
  priority: 'critical' | 'high' | 'normal' | 'low';
  content: string;
  contentHash: string; // SHA-256 for deduplication
}
```

Deduplication logic prevents repeated injection:
- **Source:id dedup**: Same source and id pair -- skip (first-added wins)
- **Content-hash dedup**: Same content from different sources -- skip

Rules Injector directory walk:

```typescript
// src/hooks/rules-injector/index.ts (conceptual)
function findMatchingRules(filePath: string): RuleFile[] {
  let currentDir = path.dirname(filePath);
  const rules: RuleFile[] = [];
  while (currentDir !== projectRoot) {
    const rulesDir = path.join(currentDir, '.claude', 'rules');
    if (fs.existsSync(rulesDir)) {
      for (const ruleFile of readRuleFiles(rulesDir)) {
        if (matchesGlob(filePath, ruleFile.globPattern)) {
          rules.push({ ...ruleFile, distance: directoryDistance(currentDir, filePath) });
        }
      }
    }
    currentDir = path.dirname(currentDir);
  }
  return rules.sort((a, b) => a.distance - b.distance); // Closer = higher priority
}
```

Injection strategies: `prepend` (before prompt), `append` (after prompt), or `wrap` (with `<injected-context>` tags). Context is consumed on read (cleared after injection) to prevent staleness.

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Agents get relevant conventions for current file | Same static prompt regardless of context |
| Token budget spent on relevant context only | All conventions loaded every time |
| Closer rules override distant ones (specificity) | No mechanism for specific overrides |
| Deduplication prevents bloat | Same content injected 5 times in one session |
| Context cleared after use prevents staleness | Old context lingers across turns |

**Anti-Pattern (What Happens Without It):**

An agent working on `src/api/routes/users.ts` needs: "Use Zod for validation. Return standardized error objects." Without injection, the agent gets no guidance and invents its own patterns, or gets ALL project conventions wasting 2000+ tokens on irrelevant React component guidelines.

**When to Use:**
- Projects with per-directory coding conventions
- Systems where context relevance varies by working file

**Related Patterns:** [Tiered Model Routing](#pattern-3-tiered-model-routing), [Capability Fence](#pattern-1-capability-fence)

**Source:** `src/features/context-injector/`, `src/hooks/rules-injector/`, `src/hooks/context-injector/`

---

### Pattern 10: Phased Autonomous Pipeline (Autopilot)

**Problem:** End-to-end tasks require analysis, planning, implementation, testing, and validation -- each needing different specialist agents. Orchestrating these phases manually defeats the purpose of an autonomous system.

**Solution:** A 5-phase pipeline where each phase composes existing execution patterns. Autopilot does not implement its own execution logic -- it sequences ralph (persistence), ultrawork (parallelism), and ultraqa (quality cycling).

**Implementation:**

| Phase | Name | Agents | Output | State File |
|-------|------|--------|--------|------------|
| 0 | Expansion | Analyst + Architect | `.omc/autopilot/spec.md` | - |
| 1 | Planning | Architect + Critic (ralplan) | `.omc/plans/autopilot-impl.md` | - |
| 2 | Execution | Ralph + Ultrawork (ultrapilot) | Implemented code | `.omc/state/ultrapilot-ownership.json` |
| 3 | QA | UltraQA (max 5 cycles) | Passing build + tests | `.omc/state/ultraqa-state.json` |
| 4 | Validation | Architect + Security + Code-reviewer | Final approval (ALL must approve) | `.omc/state/autopilot-state.json` |

Composability diagram:

```
Phase 0: Expansion → analyst + architect → spec.md
Phase 1: Planning → ralplan (Pattern 8) → plan.md
Phase 2: Execution → ultrapilot (Pattern 6) with ralph (Pattern 5) per worker
Phase 3: QA → ultraqa cycling (build → fix → verify, max 5 cycles)
Phase 4: Validation → ALL must approve:
  ├── architect → architecture review
  ├── security-reviewer → security audit
  └── code-reviewer → code quality
  If ANY rejects → return to Phase 2
```

State persistence per phase:

```json
// .omc/state/autopilot-state.json
{
  "phase": 2,
  "phases": {
    "0": { "status": "complete", "artifact": ".omc/autopilot/spec.md" },
    "1": { "status": "complete", "artifact": ".omc/plans/autopilot-impl.md" },
    "2": { "status": "in_progress", "workers": 3, "completed": 1 },
    "3": { "status": "pending" },
    "4": { "status": "pending" }
  }
}
```

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Right specialist per phase | Single agent does analysis, planning, and implementation poorly |
| Phase failures don't lose prior work | Start from scratch on any failure |
| Composable: reuses ralph, ultrawork, ultraqa | Reimplements persistence, parallelism, QA from scratch |
| State enables session resumption | Session timeout loses all progress |
| Multi-reviewer validation catches different defect types | Single reviewer has blind spots |

**Anti-Pattern (What Happens Without It):**

User says "Build me a task management API." Without autopilot, the orchestrator immediately starts coding without a spec, writes sequentially without parallelism, skips testing as context window fills, declares completion without review. Result: compiles but has no input validation, no authentication, no tests.

**When to Use:**
- End-to-end autonomous execution from idea to verified code
- Tasks requiring multiple specialist types
- Projects where quality must be validated, not assumed

**Related Patterns:** [Self-Referential Persistence Loop](#pattern-5-self-referential-persistence-loop-ralph), [File Ownership Partitioning](#pattern-6-file-ownership-partitioning), [Multi-Agent Consensus Loop](#pattern-8-multi-agent-consensus-loop-ralplan), [Evidence-Gated Completion](#pattern-4-evidence-gated-completion)

**Source:** `skills/autopilot/SKILL.md`, `.omc/state/autopilot-state.json`, `src/hooks/autopilot/`

---

### Pattern 11: Intent-Triggered Skill Activation

**Problem:** Users must learn commands to use the system. Requiring `/oh-my-claudecode:autopilot` instead of "build me a todo app" creates friction. The goal is zero learning curve.

**Solution:** The orchestrator prompt includes a pattern-to-skill routing table mapping natural language to skill activations, with a conflict resolution priority stack for ambiguous input.

**Implementation:**

Full routing table (19 entries):

| Pattern Detected | Skill | Activation |
|------------------|-------|------------|
| "autopilot", "build me", "I want a" | `autopilot` | Announced |
| Broad/vague request | `plan` (after `explore`) | Detected |
| "don't stop", "ralph" | `ralph` | Announced |
| "ulw", "ultrawork" | `ultrawork` | Always |
| "eco", "ecomode", "efficient", "budget" | `ecomode` | Always |
| "fast", "parallel" (no explicit keyword) | Config default | Config-dependent |
| "ultrapilot", "parallel build" | `ultrapilot` | Announced |
| "swarm", "coordinated agents" | `swarm` | Announced |
| "pipeline", "chain agents" | `pipeline` | Announced |
| "plan this", "plan the" | `plan` | Announced |
| "ralplan" | `ralplan` | Announced |
| UI/component/styling work | `frontend-ui-ux` | Silent |
| Git/commit work | `git-master` | Silent |
| "analyze", "debug", "investigate" | `analyze` | Announced |
| "search", "find in codebase" | `deepsearch` | Announced |
| "research", "statistics" | `research` | Announced |
| "tdd", "test first" | `tdd` | Announced |
| "setup mcp" | `mcp-setup` | Announced |
| "stop", "cancel", "abort" | `cancel` | Immediate |

Conflict resolution priority stack:

| Priority | Rule |
|----------|------|
| 1 (highest) | Both `ulw` and `eco` present -- ecomode wins (more restrictive) |
| 2 | Single explicit keyword -- that mode wins |
| 3 | Generic "fast"/"parallel" -- reads `~/.claude/.omc-config.json` default |
| 4 (lowest) | No config -- defaults to ultrawork |

Broad request detection triggers automatic planning when input uses vague verbs ("improve", "enhance"), mentions no specific file, or touches 3+ unrelated areas.

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Zero learning curve for new users | Must read docs to learn commands |
| Natural language drives workflow selection | Must remember exact keywords |
| Conflict resolution is deterministic | Ambiguous input unpredictable |
| Silent skills activate contextually | Must manually load frontend-ui-ux |
| Broad requests get proper planning | Vague requests attempted immediately, fail |

**Anti-Pattern (What Happens Without It):**

A user says "I want to build a dashboard with charts." Without intent detection, the system waits for a command. The user must discover `/oh-my-claudecode:autopilot`, learn its syntax, and invoke it manually. With intent detection, "I want to build" triggers autopilot automatically.

**When to Use:**
- Systems targeting zero-learning-curve experiences
- Multiple execution modes that could confuse users

**Related Patterns:** [Phased Autonomous Pipeline](#pattern-10-phased-autonomous-pipeline-autopilot), [Multi-Agent Consensus Loop](#pattern-8-multi-agent-consensus-loop-ralplan)

**Source:** `skills/orchestrate/SKILL.md`, `docs/CLAUDE.md`, `src/hooks/keyword-detector/`, `~/.claude/.omc-config.json`

---

### Pattern 12: Structured Agent Communication

**Problem:** Agents passing unstructured text lose information. "I found several authentication files" gives the downstream architect no file paths, no count, no completeness signal. Unstructured communication is the LLM equivalent of stringly-typed interfaces.

**Solution:** Define structured communication formats per inter-agent protocol: labeled fields, XML sections, inline markers, or JSON payloads.

**Implementation:**

**Ralplan Protocol** -- labeled fields:

```markdown
ARCHITECT_QUESTION: Should the API use REST or GraphQL?
ARCHITECT_ANSWER: REST. Existing routes follow Express patterns.
CRITIC_FEEDBACK:
  Verdict: [REJECT]
  Missing: Error handling for network failures
  Approved: Database schema design
```

**Pipeline Protocol** -- JSON context:

```json
{
  "pipeline_context": {
    "original_task": "Refactor auth module",
    "previous_stages": [
      { "agent": "explore", "files_found": ["src/auth/jwt.ts"] },
      { "agent": "architect", "recommendations": ["extract refresh service"] }
    ],
    "current_stage": { "agent": "executor", "task": "Implement recommendations" }
  }
}
```

**Explore Protocol** -- XML-wrapped output:

```xml
<results>
  <files>
    <file path="src/auth/jwt.ts" relevance="high">JWT token handling</file>
    <file path="src/config/auth.ts" relevance="medium">Auth config</file>
  </files>
  <answer>Auth system uses JWT tokens in jwt.ts, validated in middleware.ts.</answer>
  <next_steps>Read jwt.ts for token creation logic.</next_steps>
</results>
```

**Ralph Protocol** -- completion signal token:

```markdown
# Work in progress (no promise = loop continues)
Completed 8 of 15 files. Continuing...

# Verified completion (promise = loop exits)
<promise>All files refactored and verified</promise>
```

**Scientist Protocol** -- inline markers:

```markdown
[FINDING] Token refresh rate increased 300% since v2.1
[STAT:refresh_rate_v2.0] 12/hour  [STAT:refresh_rate_v2.1] 48/hour
[LIMITATION] Data covers only 7 days post-release
```

**Critic Protocol** -- fixed verdict format:

```markdown
[REJECT]
- REJECTED: No error handling for database failures
- MISSING: No migration plan for existing data
- APPROVED: API route structure is well-organized
```

**Why This Pattern:**

| Benefit | Without It |
|---------|-----------|
| Downstream agents can parse output programmatically | Guessing at meaning, misinterpretation |
| Information completeness is verifiable | No way to check if explore found 0 or 10 files |
| Protocol violations are detectable | No way to know if agent skipped required sections |
| Different protocols fit different interaction types | One-size-fits-all format either too rigid or too loose |

**Anti-Pattern (What Happens Without It):**

Explore returns: "I found several authentication-related files in the project." The architect cannot extract: How many files? What paths? Which are relevant? Is the search complete? With structured XML output, exact paths, relevance scores, and completeness are explicit.

**When to Use:**
- Any time agents pass information to other agents
- Multi-stage pipelines where each stage builds on the previous

**Related Patterns:** [Multi-Agent Consensus Loop](#pattern-8-multi-agent-consensus-loop-ralplan), [Self-Referential Persistence Loop](#pattern-5-self-referential-persistence-loop-ralph), [Phased Autonomous Pipeline](#pattern-10-phased-autonomous-pipeline-autopilot)

**Source:** `agents/explore.md`, `agents/scientist.md`, `agents/critic.md`, `commands/ralplan.md`, `skills/pipeline/SKILL.md`

---

## Cross-Cutting Insight

The architectural insight connecting all 12 patterns: **LLM agents require dual enforcement -- prompt-level AND infrastructure-level.** Every pattern enforces behavior through both the prompt (what the model is told) and infrastructure (what the model can physically do). Neither alone is sufficient.

| Pattern | Prompt Enforcement | Infrastructure Enforcement |
|---------|-------------------|---------------------------|
| Capability Fence | "FORBIDDEN ACTIONS" in prompt | `disallowedTools` in frontmatter |
| Worker Preamble | "You are a WORKER, not an orchestrator" | Preamble prepended via `wrapWithPreamble()` |
| Tiered Routing | Tier-specific behavioral instructions | 4-stage scoring pipeline selects model |
| Evidence-Gated | "Iron Law" + red flag self-monitoring | Verification module with freshness check |
| Ralph Loop | Promise token as completion signal | Hook detects token and controls loop |
| File Ownership | Workers told which files they own | Ownership map prevents cross-writes |
| Atomic Claiming | Agents instructed to claim before working | SQLite `BEGIN IMMEDIATE` prevents races |
| Consensus Loop | Critic calibration backstory | Max 5 iterations as hard limit |
| Context Injection | Rules content injected into prompt | Directory walker + deduplication logic |
| Autopilot Pipeline | Phase descriptions guide behavior | State machine controls phase transitions |
| Intent Activation | Routing table maps phrases to skills | Keyword detector hook intercepts input |
| Structured Communication | Output format in agent prompts | Downstream parsers expect specific formats |

The second key insight: **state management for stateless agents.** LLM agents have no memory between invocations. Every pattern includes explicit state persistence (JSON files, SQLite databases, `.omc/state/`) enabling resumption, cancellation, and progress tracking. State files are deleted on completion (not flagged inactive) to prevent stale state confusion.

The third insight: **composition over reimplementation.** Autopilot does not implement its own persistence -- it uses ralph. It does not implement its own parallelism -- it uses ultrapilot. It does not implement its own quality cycling -- it uses ultraqa. Each pattern is a reusable building block, and higher-level patterns compose lower-level ones rather than reimplementing their functionality.
