# Anti-Patterns

**Document:** 03-anti-patterns.md
**Part of:** oh-my-claudecode Analysis
**Source:** `nicobailon/oh-my-claudecode` (v3.7.15)

---

## Anti-Pattern Catalog

| # | Anti-Pattern | Severity | Prevention |
|---|--------------|----------|------------|
| 1 | Premature Completion | Critical | Evidence-gated verification with freshness window |
| 2 | Speculation Without Evidence | Critical | Red flag detection + statistical evidence gates |
| 3 | Recursive Delegation | Critical | Worker preamble + tool blocking |
| 4 | Orchestrator Self-Implementation | High | Path-based write rules + prompt constraints |
| 5 | Hedging Language | High | Metacognitive self-monitoring in prompts |
| 6 | Rubber-Stamp Review | High | Critic calibration backstory |
| 7 | Stale Evidence | High | 5-minute freshness window |
| 8 | Role Drift | High | Capability fences (tool + prompt) |
| 9 | Infinite Retry Loop | Medium | 3-failure circuit breaker |
| 10 | AI Slop Output | Medium | Explicit aesthetic anti-patterns |
| 11 | Token Waste | Medium | Tiered model routing |
| 12 | Stale State Persistence | Medium | Delete-on-complete, not flag-on-complete |
| 13 | Vague Delegation Prompts | High | 7-section structured delegation format |
| 14 | Ask-User-About-Codebase | High | Explore-first, ask-preferences-only |
| 15 | Convergent Design | Medium | Explicit aesthetic diversity requirements |
| 16 | Context Bleed Between Sections | Medium | XML semantic containers as section boundaries |

---

## Critical Anti-Patterns

### 1. Premature Completion

**What It Is:** Agents declare tasks "done" based on their belief that the work is complete, without running verification commands. This is the single most common LLM failure mode. The model generates code, experiences high token-probability confidence, and claims success without empirical proof.

**Severity:** Critical -- This is the most damaging anti-pattern because it produces invisible failures. Downstream agents and the user trust the completion claim, building on a potentially broken foundation. A premature completion in Phase 2 of autopilot can cascade through Phase 3 (QA) and Phase 4 (Validation), wasting the entire pipeline.

**Detection Signals:**
- Agent output ends with a claim like "The feature is implemented" without any command output
- No build/test command appears in the agent's tool usage before the final message
- The completion message uses future-tense or conditional language ("this should work")
- No exit codes, test counts, or lint results appear in the response

**Why It's Bad:**
- Code may not compile, and the agent has no way to know without running the build
- Tests may fail on edge cases the model did not consider
- Functionality may not match the original requirements
- Every downstream consumer (other agents, the user, CI pipelines) inherits a false positive
- In persistent modes like ralph, a false completion emits the `<promise>` token and terminates the loop prematurely

**How to Avoid:**
The Iron Law protocol requires four steps before ANY completion claim. This protocol appears in 5+ files across the codebase (CLAUDE.md, architect.md, executor.md, ralph/SKILL.md, verification/index.ts):

```
1. IDENTIFY what command proves the claim
2. RUN the verification command
3. READ the output — did it actually pass?
4. ONLY THEN make the claim with evidence
```

The verification module defines seven standard checks: `build_success`, `test_pass`, `lint_clean`, `functionality_verified`, `architect_approval`, `todo_complete`, `error_free`. Each check requires specific evidence (exit codes, pass counts, approval tokens).

Additionally, the Mandatory Architect Gate ensures that no task reaches final completion without a peer review from the architect agent running on Opus.

**Enforcement:**
- `src/features/verification/` -- Reusable verification module with `createProtocol()`, `runVerification()`, `validateChecklist()`
- Agent prompts include the Iron Law verbatim in CLAUDE.md, architect.md, executor.md, ralph/SKILL.md
- Mandatory Architect approval gate before final completion (spawned as a separate Task)
- Ralph's `<promise>{{PROMISE}}</promise>` token can only be emitted after Architect verification approves
- Autopilot Phase 4 requires ALL three reviewers (Architect + Security + Code-reviewer) to approve

**Example:**

```
BAD:
"I've implemented the feature. The code looks correct and should work as expected.
All the changes are in place."

GOOD:
"I've implemented the feature. Running verification:
- Build: `npm run build` → exit code 0, 0 errors, 0 warnings
- Tests: `npm test` → 47 passed, 0 failed, 0 skipped
- Lint: `npm run lint` → 0 errors, 0 warnings
- LSP diagnostics: `lsp_diagnostics_directory` → 0 errors in modified files
Feature is complete with verified evidence."
```

---

### 2. Speculation Without Evidence

**What It Is:** Agents make claims about code behavior, bug causes, or system state without reading the actual code or running diagnostics. This includes guessing at root causes, recommending fixes for code the agent has not read, and asserting that systems work in ways the agent has not verified.

**Severity:** Critical -- Speculation compounds. A speculated root cause leads to a speculated fix, which creates a new bug that requires further speculation. The system explicitly treats this as a trust violation: if an agent produces unfounded claims, the entire multi-agent workflow's output quality degrades.

**Detection Signals:**
- Agent recommends a fix without citing a specific `file:line` location
- Analysis contains phrases like "probably," "likely," "I think," "it seems"
- Agent did not use Read, Grep, or LSP tools before making claims about code behavior
- Findings lack supporting data (no grep results, no test output, no file contents)
- Bug analysis jumps directly to solutions without showing the investigation path

**Why It's Bad:**
- Fixes address symptoms, not root causes, leaving the actual bug in place
- Recommendations may not apply to the actual codebase (the model hallucinates API shapes)
- Builds false confidence in incorrect analysis -- the user trusts the agent's authority
- In the scientist agent, ungrounded claims violate the entire research methodology
- Downstream executor agents implement speculated fixes, wasting tokens on wrong solutions

**How to Avoid:**
Three complementary enforcement strategies prevent speculation:

1. **Mandatory context gathering**: The architect agent's Phase 1 requires reading all relevant code before any analysis begins. From `agents/architect.md`: "Before touching any code: Map all affected files and dependencies. Understand existing patterns."

2. **Statistical evidence gates**: The scientist agent requires every finding to have supporting data. From `agents/scientist.md`: every `[FINDING]` must have a `[STAT:*]` evidence marker within 10 lines. The prompt states: "NO SPECULATION WITHOUT EVIDENCE."

3. **File:line citations**: The explore agent's output contract requires precise locations. From `agents/explore.md`: "Your response has FAILED if caller needs to ask 'but where exactly?'" All claims must reference specific file paths and line numbers.

**Enforcement:**
- Architect prompt: "Red Flags: Expressing confidence without citing file:line evidence"
- Scientist prompt: "NO SPECULATION WITHOUT EVIDENCE" + inline marker format `[STAT:name]`
- Explore prompt: failure condition if locations are imprecise
- Executor prompt: "Map all affected files and dependencies" before Phase 2 execution

**Example:**

```
BAD:
"The error is probably in the authentication middleware.
Try adding a null check. The JWT validation likely returns
undefined when the token expires."

GOOD:
"The error originates at src/middleware/auth.ts:47 where
`req.user.id` is accessed without a null guard. Reading
src/utils/jwt.ts:23-31 confirms that `verifyToken()` returns
`null` on expiry (line 28: `return null`), but the middleware
at auth.ts:45 does not check for this case before destructuring.

Root cause: missing null check between jwt.ts:28 (null return)
and auth.ts:47 (unconditional access).

Fix: Add guard at auth.ts:46: `if (!req.user) return res.status(401).json({...})`"
```

---

### 3. Recursive Delegation

**What It Is:** A worker agent spawned by the orchestrator attempts to spawn its own sub-agents, creating an uncontrolled chain of delegations. This happens because the global system prompt (CLAUDE.md) instructs the model to "always delegate," and workers inherit this instruction unless explicitly overridden.

**Severity:** Critical -- Without containment, a single user request can spawn an exponentially growing tree of agents. Each agent costs tokens, and the results from deeply nested agents may never propagate back to the orchestrator. This is the multi-agent equivalent of a fork bomb.

**Detection Signals:**
- A worker agent's output contains `Task(subagent_type=...)` calls
- Agent trace shows more than 2 levels of nesting
- Token usage spikes unexpectedly on a simple task
- Results from delegated work are missing or incomplete (lost in nested context)
- Worker agents produce orchestration-style output ("I'll delegate this to...") instead of direct work

**Why It's Bad:**
- Uncontrolled cost multiplication -- each layer multiplies token usage
- Infinite recursion potential if no depth limit exists
- No accountability -- work disappears into nested agents whose output is never collected
- Results may never propagate back to the orchestrator (context window overflow in nested agents)
- Violates the conductor/performer model: workers should perform, not conduct

**How to Avoid:**
Two complementary mechanisms prevent recursive delegation:

1. **Worker preamble** prepended to every spawned task (from `src/agents/preamble.ts`):
```
CONTEXT: You are a WORKER agent, not an orchestrator.
RULES:
- Complete ONLY the task described below
- Use tools directly (Read, Write, Edit, Bash, etc.)
- Do NOT spawn sub-agents
- Do NOT call TaskCreate or TaskUpdate
- Report your results with absolute file paths
TASK:
```

2. **Tool blocking** via YAML frontmatter for agents that must never delegate:
```yaml
disallowedTools: Task  # in executor frontmatter
```

The preamble is the prompt-level enforcement. The `disallowedTools` is the infrastructure-level enforcement. Together they make recursive delegation both instructionally forbidden and physically impossible.

**Enforcement:**
- `src/agents/preamble.ts` -- Worker preamble function `wrapWithPreamble()`
- Executor prompt: "BLOCKED ACTIONS: Task tool: BLOCKED (no delegation)"
- Scientist prompt: "NEVER delegate to other agents"
- Explorer prompt: "Agent threads always have their cwd reset between bash calls" (solo execution context)
- The `<Critical_Constraints>` XML section in executor agents explicitly lists blocked tools

**Example:**

```
BAD (worker agent output):
"This requires changes across multiple files. I'll delegate:
- Task(subagent_type='executor-low', prompt='Update auth.ts')
- Task(subagent_type='executor-low', prompt='Update routes.ts')
Let me coordinate these sub-tasks..."

GOOD (worker agent output):
"Implementing changes directly across both files:
1. Reading auth.ts... [uses Read tool]
2. Editing auth.ts:47 to add null guard... [uses Edit tool]
3. Reading routes.ts... [uses Read tool]
4. Editing routes.ts:12 to update import... [uses Edit tool]
Changes complete. Both files modified."
```

---

## High-Severity Anti-Patterns

### 4. Orchestrator Self-Implementation

**What It Is:** The main orchestrator (running on Opus, the most expensive model) writes source code directly instead of delegating to an executor agent. This breaks the fundamental conductor/performer separation that underpins the entire system.

**Severity:** High -- This is not Critical because the code change itself may be correct. The severity is High because it systematically degrades the system: it bypasses model routing (wasting Opus tokens on simple edits), skips the verification protocol, forgoes specialist prompt guidance, and undermines the delegation audit trail.

**Detection Signals:**
- The orchestrator uses Write or Edit tools on `.ts`, `.py`, `.go`, or other source files
- No Task tool calls precede source file modifications
- The delegation audit log at `.omc/logs/delegation-audit.jsonl` shows warnings
- The `pre-tool-use` hook fires a delegation enforcement warning

**Why It's Bad:**
- Bypasses the model routing system: uses $15/MTok Opus for edits that Haiku ($0.25/MTok) could handle
- Skips the verification protocol that executor agents are prompted to follow
- No specialist prompt guidance (executor prompts include code quality rules, testing reminders)
- Inconsistent code quality since the orchestrator prompt is optimized for coordination, not coding
- Breaks the audit trail that tracks which agent made which change

**How to Avoid:**
Path-based write rules in CLAUDE.md define what the orchestrator may and may not write:

Allowed paths (direct write OK): `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`

Warned paths (should delegate): `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.rs`, `.java`, `.c`, `.cpp`, `.h`, `.svelte`, `.vue`

The delegation matrix explicitly maps every action to its delegatee:
```
| Single-line code change | NEVER do directly | executor-low |
| Multi-file changes      | NEVER do directly | executor / executor-high |
```

From CLAUDE.md: "RULE 3: NEVER do code changes directly -- delegate to executor"

**Enforcement:**
- `pre-tool-use` hook fires delegation enforcement warnings when the orchestrator writes source files
- Soft enforcement via delegation audit log at `.omc/logs/delegation-audit.jsonl`
- Prompt: "RULE 3: NEVER do code changes directly -- delegate to executor"
- Even single-line changes route through `executor-low` (Haiku tier)
- The delegation matrix table in CLAUDE.md maps every action type, leaving no ambiguity

**Example:**

```
BAD (orchestrator directly edits):
[Orchestrator reads the file, then uses Edit tool]
"I'll fix this typo in src/utils/format.ts:12"
→ Edit(file_path="src/utils/format.ts", old_string="...", new_string="...")

GOOD (orchestrator delegates):
"Delegating the fix to executor-low."
→ Task(subagent_type="oh-my-claudecode:executor-low",
       model="haiku",
       prompt="Fix the typo in src/utils/format.ts:12.
               Change 'formated' to 'formatted'.")
```

---

### 5. Hedging Language

**What It Is:** Agents use words like "should," "probably," "seems to," "likely," and "I think" when describing work outcomes. These words are not stylistic choices -- they are diagnostic signals indicating the agent has not actually verified its claims.

**Severity:** High -- Hedging language is the leading indicator of Premature Completion (anti-pattern #1). When an agent says "this should work," it is revealing that it has not run the code. The severity is High rather than Critical because hedging itself does not cause failures -- it signals that verification was skipped, and the skipped verification is what causes failures.

**Detection Signals:**
- Agent output contains "should," "probably," "seems to," "likely," "I believe," "I think"
- Completion claims are phrased conditionally ("this should fix the issue")
- No build/test output accompanies the hedged claim
- Agent expresses satisfaction ("looks good") before running any verification command

**Why It's Bad:**
- Signals that the agent is operating on belief, not evidence
- Creates a false impression of confidence that downstream consumers may not question
- Downstream agents and the user may not notice the hedge buried in otherwise confident prose
- In persistent modes (ralph, autopilot), hedged completions can terminate loops prematurely
- Violates the Evidence Over Claims principle (core philosophy #3)

**How to Avoid:**
The system teaches agents to treat their own hedging as a metacognitive diagnostic signal. When an agent detects itself hedging, it should stop and verify rather than continue. From multiple agent prompts:

```markdown
Red Flags (STOP and verify):
- Using "should", "probably", "seems to"
- Expressing satisfaction before running verification
- Claiming completion without fresh test/build output
```

This is a metacognitive prompt pattern: the model monitors its own language generation and uses certain tokens as triggers for behavioral redirection.

**Enforcement:**
- Present in architect.md, executor.md, CLAUDE.md -- three independent reinforcement points
- The verification protocol requires actual command output, not verbal assurance
- The Iron Law's step 4 ("ONLY THEN make the claim with evidence") makes hedging structurally unnecessary
- Architect peer review catches hedging in executor output during the approval gate

**Example:**

```
BAD:
"I've updated the database migration. The schema changes
should be backward-compatible and the existing queries
will probably continue to work. The migration seems to
handle the edge cases correctly."

GOOD:
"I've updated the database migration. Verification:
- Migration up: `npx prisma migrate dev` → applied successfully
- Migration down: `npx prisma migrate reset` → rolled back cleanly
- Existing queries: ran test suite → 156 passed, 0 failed
- Edge case (null values): added test at tests/migration.test.ts:45 → passed
Schema changes are backward-compatible (verified)."
```

---

### 6. Rubber-Stamp Review

**What It Is:** A reviewer agent (critic, architect, or code-reviewer) approves plans or code without genuine critical analysis. The agent produces surface-level affirmations like "Looks good!" or "OKAY" without identifying real issues. This defeats the purpose of the multi-agent review gate.

**Severity:** High -- The Mandatory Architect Gate is the system's last line of defense against premature completion. If the gate rubber-stamps, every upstream anti-pattern becomes undetectable. The severity is High because it silently disables quality assurance rather than causing direct failures.

**Detection Signals:**
- Reviewer output is shorter than 3 sentences
- Review contains no specific file references or line numbers
- Approval is given without mentioning any concerns, trade-offs, or risks
- Review takes noticeably less time than the work being reviewed
- Verdict lacks the structured justification format (the critic requires structured OKAY/REJECT with reasoning)

**Why It's Bad:**
- The verification gate becomes a meaningless formality
- Defects pass through to the user as "approved" work
- Creates a false sense of quality assurance -- the user believes work was reviewed
- In ralplan, rubber-stamping short-circuits the consensus loop (designed for 3-7 iterations)
- Undermines the entire multi-agent architecture: if review adds no value, the review agent is pure cost

**How to Avoid:**
The critic agent uses a calibration backstory that sets an appropriately strict review bar without numeric scoring parameters:

```
You are reviewing a first-draft work plan from an author with ADHD.
Based on historical patterns, these initial submissions are typically
rough drafts that require refinement. Plans from this author average
7 rejections before receiving an OKAY.
```

This backstory achieves two goals: (1) it primes the model to expect imperfection, countering the LLM tendency toward agreeable output, and (2) it sets a concrete statistical anchor ("7 rejections") that calibrates strictness without being a rigid threshold.

Additionally, the critic's verdict format requires structured justification:
- OKAY must include what was verified and any remaining risks
- REJECT must include specific feedback items that the planner must address
- A bare "OKAY" with no justification is structurally invalid

**Enforcement:**
- `agents/critic.md` -- Calibrated strictness via backstory narrative
- Ralplan skill: "CRITICAL: This phase MUST execute. The Critic is the gatekeeper."
- Critic verdict format enforces structured justification, not just OKAY/REJECT
- Autopilot Phase 4 requires ALL THREE reviewers to approve (Architect + Security + Code-reviewer), reducing the probability of unanimous rubber-stamping
- The ralplan loop iterates up to 5 times, providing multiple chances to catch issues

**Example:**

```
BAD:
"OKAY. The plan looks comprehensive and well-structured.
Good job on the implementation details."

GOOD:
"REJECT.

Issues found:
1. Missing error handling: The API endpoint at step 3 has no
   fallback for 429 rate-limit responses. Add retry with
   exponential backoff.
2. Race condition risk: Steps 4 and 5 modify the user session
   concurrently. These must be serialized or use optimistic locking.
3. Missing rollback: Step 6 (database migration) has no rollback
   plan if the migration fails mid-execution.

The plan requires these three items addressed before re-review."
```

---

### 7. Stale Evidence

**What It Is:** Agents reference verification evidence from earlier in the conversation, after subsequent code changes have potentially invalidated it. The agent points to a passing test run from 20 minutes ago, ignoring the three file edits made since then.

**Severity:** High -- Stale evidence creates a specific and insidious failure mode unique to LLM agents. Unlike human developers who re-run tests instinctively after changes, LLMs treat all in-context information as equally valid regardless of temporal ordering. A test that passed before a refactor is treated as proof the refactor works.

**Detection Signals:**
- Agent cites verification results without running a new command
- Significant time gap between the last verification command and the completion claim
- Multiple file edits occurred between the cited evidence and the current claim
- Agent says "as we verified earlier" or "the tests passed previously"

**Why It's Bad:**
- Evidence from 10 minutes ago may be completely invalidated by subsequent edits
- The agent cannot distinguish "this test passed before my changes" from "this test passes with my changes"
- Creates false confidence that compounds: stale evidence supports premature completion
- In multi-step workflows (ralph iterations, autopilot phases), evidence from Phase 2 is irrelevant in Phase 4

**How to Avoid:**
The verification module enforces a 5-minute evidence freshness window:

```typescript
// src/features/verification/index.ts
const EVIDENCE_FRESHNESS_WINDOW = 5 * 60 * 1000; // 5 minutes
```

Evidence collected more than 5 minutes ago is rejected by the verification module. Agents must re-run verification commands to produce fresh evidence. The window is deliberately conservative -- 5 minutes is enough for a single round of edits but short enough to catch most staleness.

Agent prompts reinforce this with emphasis on the word "fresh": "FRESH verification evidence" appears in multiple agent files. The Iron Law's structure also implicitly prevents staleness: steps 1-3 (identify, run, read) must be performed immediately before step 4 (claim).

**Enforcement:**
- `src/features/verification/index.ts` -- Programmatic staleness detection with 5-minute window
- Agent prompts emphasize "FRESH" verification evidence
- The Iron Law's sequential structure (identify → run → read → claim) prevents interleaving old evidence
- Ralph's re-invocation loop passes context that includes "re-verify after changes"

**Example:**

```
BAD:
"All tests passed earlier in our session (47 passed, 0 failed).
Since I only made minor changes to the utility function,
the feature is complete."

GOOD:
"I made changes to src/utils/format.ts after the last test run.
Re-running verification with fresh evidence:
- Build: `npm run build` → exit code 0 (ran just now)
- Tests: `npm test` → 47 passed, 0 failed (ran just now)
- Affected test: `npm test -- format.test.ts` → 12 passed (ran just now)
All evidence is fresh. Feature is complete."
```

---

### 8. Role Drift

**What It Is:** An agent gradually shifts from its assigned role to performing functions outside its specialization. An architect starts writing code. An explorer starts fixing bugs. A planner starts implementing. A scientist starts giving opinions without data.

**Severity:** High -- Role drift undermines the specialist system that justifies the multi-agent architecture. If agents drift into each other's roles, the system degrades to a single-agent model running on the wrong model tier with the wrong prompt. The severity is High because the work produced may still be correct, but it bypasses the quality and cost controls that the role system provides.

**Detection Signals:**
- An architect agent uses Write or Edit tools (it should be read-only)
- An explorer agent modifies files instead of reporting findings
- A planner agent starts implementing steps instead of producing a plan
- An agent's output format does not match its role's expected output structure
- Tool usage patterns do not match the agent's defined capability set

**Why It's Bad:**
- Bypasses the specialist system -- each role has prompt guidance tuned for its task
- Uses the wrong model tier -- an architect running on Opus should not do Haiku-level edits
- Produces lower quality results (the agent's prompt is not optimized for the drifted task)
- Breaks the orchestration model -- the orchestrator cannot predict what each agent will do
- Violates the conductor/performer separation at the agent level

**How to Avoid:**
Dual enforcement prevents role drift:

1. **Tool restrictions** in YAML frontmatter physically block forbidden actions:
```yaml
# agents/architect.md frontmatter
disallowedTools: Write, Edit
```

2. **Identity reinforcement** in prompts uses contrastive definitions stated 5+ times in different formulations:
```markdown
| What You ARE          | What You ARE NOT   |
|-----------------------|--------------------|
| Strategic consultant  | Code writer        |
| Requirements gatherer | Task executor      |
```

The prompt also uses XML semantic containers like `<Role>`, `<Critical_Constraints>`, and `<Operational_Phases>` to reinforce role boundaries through document structure.

Neither enforcement alone is sufficient. Tool restrictions without prompt explanation leave the agent confused about why its actions fail. Prompt constraints without tool restrictions are unreliable -- models occasionally ignore instructions under pressure. Together they create reliable behavioral boundaries.

**Enforcement:**
- Tool blocking via `disallowedTools` in frontmatter makes drift physically impossible for restricted actions
- Identity prompts stated 5+ times in different formulations (anti-drift redundancy)
- Contrastive identity tables ("What You ARE / What You ARE NOT") clarify boundaries
- XML semantic containers (`<Role>`, `<Critical_Constraints>`) reinforce role boundaries structurally
- The orchestrator's delegation matrix prevents sending the wrong task to the wrong agent

**Example:**

```
BAD (architect agent drifts into implementation):
"The authentication module needs refactoring. Here's the fix:
[uses Edit tool to modify src/auth/middleware.ts]
I've updated the middleware to use async/await instead of callbacks."

GOOD (architect agent stays in role):
"The authentication module needs refactoring. Analysis:

Current state: src/auth/middleware.ts uses callback-based JWT
verification (lines 23-45). This creates pyramid-of-doom nesting
at depth 4 when combined with the database lookup at line 38.

Recommendation: Refactor to async/await. The executor should:
1. Convert verifyToken() at line 23 to async
2. Replace the callback chain (lines 28-45) with try/catch
3. Update the 3 callers in src/routes/*.ts

Risk: The error handling at line 42 has a side effect (logging).
Ensure the catch block preserves this behavior."
```

---

## Medium-Severity Anti-Patterns

### 9. Infinite Retry Loop

**What It Is:** An agent encounters an error, tries a fix, gets the same error (or a new error from the bad fix), tries the same approach again, and loops indefinitely. The agent lacks the metacognitive awareness to recognize it is stuck.

**Severity:** Medium -- The severity is Medium rather than High because the loop is bounded by context window limits (the agent will eventually run out of tokens). However, before that limit, the agent wastes significant tokens on futile retries. The 3-failure circuit breaker elevates this from a systemic risk to a contained nuisance.

**Detection Signals:**
- Agent applies the same edit pattern more than twice
- Error messages repeat across consecutive tool outputs
- Agent's "fix" creates a new error that triggers another fix attempt
- Token usage climbs steadily without progress toward the goal
- Agent does not reference previous failed attempts when trying new approaches

**Why It's Bad:**
- Wastes tokens on identical failing approaches
- May corrupt the codebase by layering bad fixes on top of each other
- Delays resolution -- the time spent looping could have been spent escalating
- In persistent modes (ralph), the loop persists across iterations, compounding waste
- The agent's context window fills with failed attempts, reducing space for productive work

**How to Avoid:**
The 3-failure circuit breaker provides a hard stop:

```
After 3 consecutive failures on the same issue:
1. STOP all further edits immediately
2. REVERT to last known working state (git checkout or undo)
3. DOCUMENT what was attempted and what failed
4. CONSULT Architect with full failure context
5. If Architect cannot resolve → ASK USER
```

This implements progressive escalation: self → specialist agent → Architect → user. The escalation path ensures that failures eventually reach an entity capable of resolving them, rather than looping at the wrong abstraction level.

**Enforcement:**
- `agents/architect.md` -- Circuit breaker instructions in the recovery protocol
- `skills/orchestrate/SKILL.md` -- Escalation path definition
- Ralph skill: iteration counter with max iterations prevents infinite loop at the workflow level
- Autopilot Phase 3 (QA): max 5 cycles before forcing completion with warnings

**Example:**

```
BAD:
Attempt 1: Add type assertion → TypeError persists
Attempt 2: Add type assertion (same fix) → TypeError persists
Attempt 3: Add different type assertion → New error: 'unknown' not assignable
Attempt 4: Revert and add type assertion → TypeError persists
[continues indefinitely]

GOOD:
Attempt 1: Add type assertion → TypeError persists
Attempt 2: Cast to intermediate type → TypeError persists
Attempt 3: Use type guard function → TypeError persists
CIRCUIT BREAKER: 3 consecutive failures on TypeError at line 47.
Reverting to last working state.

Escalating to Architect with context:
- File: src/api/handler.ts:47
- Error: TS2345 - Argument of type 'Request' not assignable to 'AuthRequest'
- Attempted: type assertion, intermediate cast, type guard
- Hypothesis: The types diverged after the auth refactor in PR #234
```

---

### 10. AI Slop Output

**What It Is:** Agents produce generic, cookie-cutter output that is recognizably AI-generated. For code: unnecessary comments on every line, over-engineered abstractions, boilerplate error messages. For design: purple gradients, Inter font, predictable card layouts, rounded corners everywhere. For communication: "Great question!", "I'd be happy to help!", "Let me break this down."

**Severity:** Medium -- AI slop does not break functionality, which is why the severity is Medium. However, it degrades the user experience and signals that the system is not genuinely intelligent. For frontend work specifically, slop-quality design undermines user trust in the entire output.

**Detection Signals:**
- Every function has a JSDoc comment restating the function name ("Gets the user" for `getUser()`)
- UI designs use the same color palette across all generated components
- Communication starts with filler phrases before substantive content
- Error messages are generic ("Something went wrong") instead of actionable
- Variable names are overly verbose (`userDataObjectInstance` instead of `user`)

**Why It's Bad:**
- Makes output look machine-generated, reducing user trust
- Unnecessary comments add maintenance burden without information value
- Generic designs fail to meet the specific aesthetic requirements of real projects
- Verbose communication wastes the user's reading time
- Over-engineering creates complexity that must be maintained but provides no benefit

**How to Avoid:**
The system combats AI slop through explicit anti-pattern lists in specialist prompts.

Designer agents have aesthetic anti-patterns:
```markdown
Anti-Patterns (NEVER):
- Generic fonts (Inter, Roboto, Arial)
- Purple gradients on white (AI slop)
- Predictable layouts
- Converging on common choices across generations
```

Communication style rules in the orchestrate skill:
```markdown
No Flattery: Never start with "Great question!"
No Status Updates: Never start with "I'm on it..."
Dense > verbose.
Start immediately. No acknowledgments.
```

Code quality is enforced through the executor prompt's output format requirements, which demand dense, purposeful output rather than padded responses.

**Enforcement:**
- Designer agent prompts: explicit list of banned aesthetic choices
- Orchestrate skill: communication anti-patterns in style rules
- Executor prompt: "Dense > verbose" as a general output principle
- Writer agent: concise documentation guidelines (no boilerplate, no filler)

**Example:**

```
BAD (design):
[Every component uses: Inter font, #6366f1 purple gradient,
white background, rounded-xl corners, shadow-md, card layout]

GOOD (design):
"Component A: Geist Mono, dark theme, sharp edges, minimal chrome
Component B: Playfair Display, warm palette, generous whitespace
Component C: JetBrains Mono, terminal aesthetic, green-on-black"

BAD (communication):
"Great question! I'd be happy to help you with that.
Let me break this down step by step. First, I want to
acknowledge that this is a complex topic..."

GOOD (communication):
"The auth middleware fails because `verifyToken()` returns null
on expired JWTs but the handler at line 47 assumes non-null.
Fix: add a null guard before the destructuring assignment."
```

---

### 11. Token Waste

**What It Is:** Using expensive models (Opus at $15/MTok) for tasks that a cheaper model (Haiku at $0.25/MTok) could handle equally well. This includes delegating simple file lookups to Opus agents, running basic linting through high-tier models, or failing to specify the model parameter and defaulting to the most expensive option.

**Severity:** Medium -- Token waste does not affect correctness, which limits its severity. However, it directly impacts cost. The system reports ~47% cost reduction from proper tiered routing. Failing to route correctly eliminates this optimization entirely.

**Detection Signals:**
- Task delegation calls lack an explicit `model` parameter
- Simple lookups ("What does this function return?") route to Opus
- File read/grep operations use Sonnet or Opus agents
- The model routing pipeline is bypassed by hardcoded model selections
- Cost per session is consistently higher than expected for the task complexity

**Why It's Bad:**
- Opus costs 60x more than Haiku ($15 vs $0.25 per million tokens)
- Simple tasks do not benefit from Opus-level reasoning
- Wasted budget reduces the number of total tasks the user can run
- Sets a bad precedent -- agents learn to over-provision model capacity
- The 3-tier system exists specifically to prevent this waste

**How to Avoid:**
Always pass the `model` parameter explicitly when delegating. Use the complexity scoring system:

| Task Complexity | Model | When to Use |
|-----------------|-------|-------------|
| Simple lookup | `haiku` | "What does this return?", "Find definition of X" |
| Standard work | `sonnet` | "Add error handling", "Implement feature" |
| Complex reasoning | `opus` | "Debug race condition", "Refactor architecture" |

The model routing pipeline (15+ signals, weighted scoring, priority-based rules) automates this when the orchestrator routes through it. But explicit model specification in delegation calls provides additional control.

Ecomode (`/ecomode` or "eco" keyword) provides a token-conscious execution mode that defaults all delegations to the lowest viable tier.

**Enforcement:**
- CLAUDE.md: "ALWAYS pass `model` parameter explicitly when delegating!"
- `src/features/model-routing/` -- Automated 4-stage routing pipeline
- Agent agent selection guide in CLAUDE.md maps every task type to its optimal agent and model
- Ecomode skill forces token-efficient routing as a global override
- Tier-specific behavioral instructions adapt prompts to model capabilities (Haiku limited to 5 files, etc.)

**Example:**

```
BAD:
Task(subagent_type="oh-my-claudecode:architect",
     prompt="Find the definition of formatDate()")
# Opus ($15/MTok) used for a simple grep task

GOOD:
Task(subagent_type="oh-my-claudecode:explore",
     model="haiku",
     prompt="Find the definition of formatDate() in the codebase")
# Haiku ($0.25/MTok) used for a simple lookup — 60x cheaper
```

---

### 12. Stale State Persistence

**What It Is:** Setting state files to `active: false` or `completed: true` instead of deleting them when a workflow completes. Future sessions may read the stale state file and incorrectly attempt to resume a completed workflow.

**Severity:** Medium -- The severity is Medium because stale state typically causes a false resume attempt that fails quickly rather than corrupting data. However, it confuses users and wastes the first few turns of a new session on unnecessary recovery logic.

**Detection Signals:**
- `.omc/state/` directory contains state files for completed workflows
- A new session begins with "Resuming previous ralph loop..." for a task that was finished
- State files have `active: false` instead of being absent
- Multiple state files exist for the same workflow type (e.g., two ralph-state.json variants)

**Why It's Bad:**
- Future sessions misinterpret completed workflows as in-progress
- The `session-start` hook reads state files to restore modes -- stale files trigger false restores
- Users see confusing "resuming..." messages for work that was already done
- In autopilot, stale phase state can cause the pipeline to restart from a completed phase
- The `stop-continuation` hook checks state files to decide if stopping is allowed -- stale files block legitimate stops

**How to Avoid:**
Delete state files on successful completion, never set flags:

```bash
# Correct: delete the file entirely
rm -f .omc/state/ralph-state.json

# Wrong: set active to false (file still exists, can be misread)
# { "active": false, "iterations": 7, "task": "..." }
```

From `skills/ralph/SKILL.md`: "IMPORTANT: Delete state files on successful completion, not set active to false."

The `StateManager` in `src/features/state-manager/` provides standard paths and lifecycle methods. The `delete()` method should be called on completion, not `write({ active: false })`.

**Enforcement:**
- `skills/ralph/SKILL.md` -- Explicit instruction to delete, not flag
- `src/features/state-manager/` -- Standard state lifecycle with `delete()` method
- `session-end` hook includes cleanup logic for orphaned state files
- Legacy migration in StateManager moves old-path files to standard paths, cleaning up inconsistencies
- The cancel skill (`/cancel --force`) clears ALL state files as a recovery mechanism

**Example:**

```
BAD:
// On ralph completion:
StateManager.write('.omc/state/ralph-state.json', {
  active: false,
  iterations: 7,
  task: "refactor auth module"
});
// Next session: "Detected ralph state. Resuming refactor auth module..."

GOOD:
// On ralph completion:
StateManager.delete('.omc/state/ralph-state.json');
// Next session: clean start, no confusion
```

---

### 13. Vague Delegation Prompts

**What It Is:** Delegating to agents without structured context in the prompt. Instead of providing a comprehensive task description, the orchestrator sends a terse one-liner like "fix the auth bug" without specifying expected outcome, constraints, or context. The agent then misunderstands the task, produces wrong output, or asks clarifying questions that waste a round-trip.

**Severity:** High -- Vague delegation is the root cause of many downstream failures. An agent that receives "fix the auth bug" has no idea which auth bug, what file, what the expected behavior is, or what constraints apply. The severity is High because it wastes the entire delegation (agent tokens + orchestrator tokens for re-delegation) and can cascade if the vaguely-instructed agent produces subtly wrong output that passes review.

**Detection Signals:**
- Delegation prompts are fewer than 3 sentences
- The prompt lacks file paths, function names, or specific locations
- No expected outcome is stated ("fix it" without defining "fixed")
- The prompt does not mention constraints or forbidden approaches
- The agent asks clarifying questions instead of producing work
- The agent produces output that does not match what the orchestrator intended

**Why It's Bad:**
- Agents misunderstand requirements and produce wrong output
- Wasted tokens on the failed delegation plus the re-delegation
- Clarifying questions add latency (a full round-trip through the orchestrator)
- Subtly wrong output may pass review if the reviewer also lacks context
- Violates the structured communication pattern (Design Pattern #12)

**How to Avoid:**
The orchestrate skill defines a 7-section delegation format that ensures every agent receives comprehensive context:

```
1. TASK: What specifically needs to be done
2. EXPECTED OUTCOME: What success looks like (specific, measurable)
3. REQUIRED SKILLS: What expertise is needed
4. REQUIRED TOOLS: What tools the agent should use
5. MUST DO: Non-negotiable requirements
6. MUST NOT DO: Explicitly forbidden approaches
7. CONTEXT: Background information, related files, prior decisions
```

This structure eliminates ambiguity by forcing the orchestrator to think through each aspect of the delegation before sending it. The "MUST NOT DO" section is particularly important for preventing agents from taking destructive or wasteful approaches.

**Enforcement:**
- `skills/orchestrate/SKILL.md` -- Delegation format template
- The structured agent communication pattern (Design Pattern #12) defines inter-agent protocols
- Pipeline stages pass structured `pipeline_context` JSON between stages
- The delegation categories system (`src/features/delegation-categories/`) auto-maps task semantics to model tier, temperature, and thinking budget

**Example:**

```
BAD:
Task(subagent_type="oh-my-claudecode:executor",
     prompt="Fix the auth bug")

GOOD:
Task(subagent_type="oh-my-claudecode:executor",
     model="sonnet",
     prompt="""
TASK: Fix the null pointer exception in JWT token validation
EXPECTED OUTCOME: The auth middleware handles expired tokens gracefully,
  returning 401 with a JSON error body instead of crashing
REQUIRED TOOLS: Read, Edit, Bash (for running tests)
MUST DO:
  - Add null guard at src/middleware/auth.ts:47
  - Add test case for expired token scenario
  - Run `npm test` and verify all tests pass
MUST NOT DO:
  - Do not modify the JWT library itself
  - Do not change the token expiry duration
CONTEXT: The bug was reported in issue #234. The crash occurs when
  verifyToken() at src/utils/jwt.ts:23 returns null on expired tokens,
  but auth.ts:47 destructures the result without checking.
""")
```

---

### 14. Ask-User-About-Codebase

**What It Is:** The planner anti-pattern of asking users questions about their codebase structure, technology stack, or implementation details instead of exploring the codebase directly. The user should not need to answer "What framework are you using?" when the agent can read `package.json` in 2 seconds.

**Severity:** High -- This anti-pattern degrades the user experience from "autonomous AI assistant" to "interactive questionnaire." The severity is High because it violates the core philosophy of zero-learning-curve and autonomous operation. Every question about the codebase signals a failure to use available tools.

**Detection Signals:**
- Planning interview asks "What framework/language are you using?"
- Agent asks about file structure that could be discovered via `ls` or `find`
- Questions about existing implementation that could be answered by reading code
- The user responds to a codebase question with frustration ("just look at the code")
- Multiple questions in sequence about facts that are all discoverable via exploration

**Why It's Bad:**
- Wastes user time answering questions the system can answer itself
- Signals incompetence -- the user expected an autonomous system, not a survey
- Delays task completion while waiting for user responses
- Creates a bad first impression that undermines trust in the system's capabilities
- The answers may be inaccurate (user misremembers, gives outdated info)
- Violates the "Human intervention signals failure" core belief

**How to Avoid:**
The plan skill explicitly separates two categories of information:

1. **Codebase facts** -- discovered via agents (explore, architect). Never ask the user.
   - Technology stack, frameworks, libraries
   - File structure, module organization
   - Existing patterns, coding conventions
   - Test setup, build configuration

2. **User preferences** -- asked via `AskUserQuestion` tool. Always ask the user.
   - Design preferences (dark/light theme, layout style)
   - Feature priorities (which feature first?)
   - Scope decisions (MVP or full implementation?)
   - Trade-off preferences (speed vs thoroughness?)

The broad request detection system triggers exploration before planning:
```
When BROAD REQUEST detected:
1. Invoke `explore` agent to understand codebase
2. Optionally invoke `architect` for guidance
3. THEN invoke `plan` skill with gathered context
4. Plan skill asks ONLY user-preference questions
```

**Enforcement:**
- Plan skill instructions explicitly separate codebase facts from user preferences
- Broad request detection triggers exploration before planning begins
- The `AskUserQuestion` tool provides structured UI for preference questions only
- Explore agents exist at all three tiers (haiku/sonnet/opus) specifically for codebase discovery

**Example:**

```
BAD (asking user about codebase):
"Before I start planning, I have some questions:
1. What framework is this project using?
2. Is there an existing test setup?
3. What's the project structure?
4. Do you have a database?
5. What authentication method are you using?"

GOOD (exploring, then asking preferences):
[Orchestrator delegates to explore agent]
[Explore agent reads package.json, tsconfig.json, src/ structure]

"I've analyzed the codebase:
- Next.js 14 with App Router, TypeScript, Prisma ORM
- PostgreSQL database with 12 existing models
- Jest test suite with 89% coverage
- JWT-based auth with refresh tokens

Now for your preferences:
1. Should the new feature follow the existing card-based UI,
   or would you prefer a different layout?
2. Do you want full CRUD or read-only for the initial version?"
```

---

### 15. Convergent Design

**What It Is:** AI agents converging on the same mediocre aesthetic choices across all generated components. Every UI looks the same: Inter font, purple-to-blue gradient, white cards with rounded corners, shadow-md, 8px gap. The model collapses toward the statistical average of its training data, producing "AI slop" that is recognizably machine-generated.

**Severity:** Medium -- Convergent design does not break functionality, which limits severity. However, it produces output that looks generic and unpolished. For users building real products, convergent design means their application looks identical to every other AI-generated UI. The severity is Medium because the designer agents include specific countermeasures.

**Detection Signals:**
- Multiple generated components share the same font, color scheme, and layout
- The design defaults to light theme with purple accent color
- Card-based layouts appear in every component regardless of content type
- Typography choices are always "safe" fonts (Inter, Roboto, system-ui)
- No component uses dark theme, monospace fonts, or unconventional layouts
- Generated dashboards all look interchangeable

**Why It's Bad:**
- Products look generic and indistinguishable from other AI output
- Fails to match the specific aesthetic needs of the project
- Creates a homogeneous portfolio if the user generates multiple components
- Undermines user trust in the system's creative capabilities
- The statistical average is mediocre by definition -- standout design requires intentional deviation

**How to Avoid:**
The designer agents explicitly combat convergence through mandatory diversity requirements. From the designer prompt:

```markdown
No design should be the same. Vary between light and dark themes,
different fonts, different aesthetics.
```

The explicit anti-pattern list bans the most common convergence targets:
```markdown
Anti-Patterns (NEVER):
- Generic fonts (Inter, Roboto, Arial)
- Purple gradients on white (AI slop)
- Predictable layouts
- Converging on common choices across generations
```

Additionally, the designer-high (Opus tier) agent uses the `visual-engineering` delegation category, which sets temperature to 0.7 -- higher than the standard 0.3 -- to encourage creative variation.

**Enforcement:**
- Designer agent prompts: banned aesthetic choices and mandatory variation
- `visual-engineering` delegation category: temperature 0.7 for creative tasks
- Designer-high (Opus): full creative latitude with explicit diversity instructions
- The frontend-ui-ux skill silently activates on UI work, injecting design sensibility rules

**Example:**

```
BAD (convergent):
Component A: Inter, #6366f1 gradient, white bg, rounded-xl, shadow-md
Component B: Inter, #6366f1 gradient, white bg, rounded-xl, shadow-md
Component C: Inter, #6366f1 gradient, white bg, rounded-xl, shadow-md
[All three look identical]

GOOD (divergent):
Component A: Geist Mono, dark theme (#0a0a0a), sharp edges, cyan accents,
  terminal-inspired layout with monospace data tables
Component B: Playfair Display, warm cream (#faf7f2), serif headings,
  generous whitespace, editorial magazine layout
Component C: Space Grotesk, dark navy (#1a1a2e), glassmorphism cards,
  neon pink accents, asymmetric grid
[Each has a distinct identity]
```

---

### 16. Context Bleed Between Sections

**What It Is:** Without clear structural boundaries in agent prompts, instructions from one section bleed into another. A constraint defined for "Phase 1: Analysis" gets applied during "Phase 2: Execution." A communication style rule meant for user-facing output gets applied to inter-agent messages. The model cannot distinguish where one instruction set ends and another begins.

**Severity:** Medium -- Context bleed rarely causes catastrophic failures, which limits its severity. However, it produces subtle behavioral incorrectness: an agent applies the wrong rule at the wrong time, producing output that is slightly off. The severity is Medium because the XML semantic container system provides structural mitigation.

**Detection Signals:**
- Agent applies Phase 1 constraints during Phase 2 execution
- Communication style rules appear in inter-agent technical messages
- An agent's behavior does not match the phase it is currently in
- Instructions from the "MUST NOT DO" section of one task affect a different task
- Role identity from one section contradicts role identity in another

**Why It's Bad:**
- The model applies wrong-phase instructions, producing subtly incorrect behavior
- Constraints meant for one context leak into another, over-constraining the agent
- Without clear boundaries, prompt authors cannot predict which instructions will interact
- Debug difficulty is high -- context bleed produces "close but wrong" output that is hard to diagnose
- As prompts grow longer, bleed probability increases quadratically with section count

**How to Avoid:**
The system uses custom XML tags as semantic containers that create clear structural boundaries between instruction sections:

```xml
<Role>
  You are an executor agent...
</Role>

<Critical_Constraints>
  BLOCKED ACTIONS:
  - Task tool: BLOCKED (no delegation)
  - Agent spawning: BLOCKED
</Critical_Constraints>

<Operational_Phases>
  ## Phase 1: Deep Analysis
  Before touching any code...

  ## Phase 2: Structured Execution
  Execute ONE step at a time...
</Operational_Phases>

<Output_Format>
  ## Changes Made
  - `file1.ts:42-55`: [what changed and why]
</Output_Format>
```

Each XML tag creates a semantic boundary that the model interprets as a context switch. Instructions inside `<Critical_Constraints>` are understood as constraints, not as operational steps. Instructions inside `<Operational_Phases>` are understood as sequential workflow, not as identity.

This is more effective than markdown headers alone because XML tags are semantically typed (the tag name conveys the section's purpose), whereas markdown headers are visually typed (the `##` conveys hierarchy but not semantics).

**Enforcement:**
- Agent prompt templates use XML semantic containers (`<Role>`, `<Critical_Constraints>`, `<Operational_Phases>`, `<Output_Format>`, `<Quality_Standards>`)
- The base agent template at `agents/templates/base-agent.md` defines the standard section structure
- Mustache-style template rendering preserves XML structure during prompt assembly
- The `<Tier_Identity>` tag differentiates LOW/MEDIUM/HIGH behavioral expectations
- Worker preamble uses its own section (`CONTEXT: You are a WORKER agent`) to create a boundary against the global prompt

**Example:**

```
BAD (flat markdown, no boundaries):
# Agent Instructions
You are an architect. Never write code.
## Phase 1
Analyze the codebase and produce findings.
## Phase 2
Implement the recommended changes.
[Model confusion: "Never write code" bleeds into Phase 2,
but Phase 2 says "implement" -- contradictory instructions]

GOOD (XML semantic containers):
<Role>
You are an architect. Your role is analysis and recommendation.
</Role>

<Critical_Constraints>
FORBIDDEN ACTIONS:
- Write tool: BLOCKED
- Edit tool: BLOCKED
</Critical_Constraints>

<Operational_Phases>
## Phase 1: Analysis
Analyze the codebase and produce findings with file:line citations.

## Phase 2: Recommendation
Produce a structured recommendation for the executor agent to implement.
</Operational_Phases>

[Clear: Role section defines identity, Constraints define hard limits,
Phases define workflow -- no bleed between sections]
```

---

## Enforcement Mechanisms Summary

| # | Anti-Pattern | Mechanism | Type | Scope |
|---|--------------|-----------|------|-------|
| 1 | Premature Completion | Verification protocol + Iron Law + Architect gate | Runtime check + workflow gate | Per-completion |
| 2 | Speculation Without Evidence | Statistical evidence gates + file:line citations | Prompt pattern + output format | Per-agent |
| 3 | Recursive Delegation | Worker preamble + `disallowedTools: Task` | Prompt injection + infrastructure | Per-invocation |
| 4 | Orchestrator Self-Implementation | Path-based write rules + pre-tool-use hook | Soft warning + delegation audit | Orchestrator |
| 5 | Hedging Language | Red flag self-monitoring + verification protocol | Metacognitive prompt | Per-agent |
| 6 | Rubber-Stamp Review | Calibration backstory + structured verdict format | Prompt narrative + output format | Critic agent |
| 7 | Stale Evidence | 5-minute freshness window in verification module | Runtime check | Per-evidence |
| 8 | Role Drift | Tool restrictions + contrastive identity tables | Infrastructure + prompt redundancy | Per-agent |
| 9 | Infinite Retry Loop | 3-failure circuit breaker + escalation path | Prompt pattern + workflow | Per-task |
| 10 | AI Slop Output | Banned aesthetic lists + communication style rules | Explicit anti-pattern list | Per-agent |
| 11 | Token Waste | Model routing pipeline + explicit `model` parameter | Automated + manual routing | Per-delegation |
| 12 | Stale State Persistence | Delete-on-complete + StateManager lifecycle | Convention + cleanup hooks | Per-mode |
| 13 | Vague Delegation Prompts | 7-section delegation format + delegation categories | Prompt template + semantics | Per-delegation |
| 14 | Ask-User-About-Codebase | Explore-first flow + fact/preference separation | Workflow design | Planning phase |
| 15 | Convergent Design | Banned aesthetics + temperature 0.7 + diversity mandate | Prompt + model config | Designer agents |
| 16 | Context Bleed Between Sections | XML semantic containers + typed section tags | Prompt structure | Per-agent prompt |

---

## Cross-Cutting Observations

### Dual Enforcement Principle

Every anti-pattern in this catalog is addressed through at least two independent mechanisms -- typically one at the prompt level and one at the infrastructure level. This mirrors the Capability Fence pattern (Design Pattern #1): neither enforcement alone is sufficient because prompts can be ignored and infrastructure alone leaves the model confused.

### Severity Correlations

The three Critical anti-patterns (Premature Completion, Speculation Without Evidence, Recursive Delegation) share a common trait: they produce outputs that appear correct but are fundamentally unverified or uncontrolled. Critical severity is reserved for anti-patterns where the failure mode is invisible -- the system looks like it is working while producing unreliable results.

High-severity anti-patterns (Orchestrator Self-Implementation, Hedging Language, Rubber-Stamp Review, Stale Evidence, Role Drift, Vague Delegation, Ask-User-About-Codebase) share a different trait: they degrade the quality or efficiency of the system without producing outright failures. The system still produces output, but the output is lower quality, more expensive, or slower than it should be.

Medium-severity anti-patterns (Infinite Retry Loop, AI Slop, Token Waste, Stale State, Convergent Design, Context Bleed) are bounded in their impact. Each has a natural containment mechanism (context window limits, user visual inspection, session boundaries) that prevents escalation to critical failure.

### The Meta-Pattern

The deepest insight from this catalog: **LLM anti-patterns are fundamentally different from traditional software anti-patterns.** Traditional anti-patterns (God Object, Spaghetti Code) are structural -- they exist in the code and can be detected by static analysis. LLM anti-patterns are behavioral -- they exist in the model's output tendencies and can only be detected through runtime monitoring, metacognitive prompting, and structural enforcement. This is why every anti-pattern in this system requires both a prompt-level response (shaping the model's tendencies) and an infrastructure-level response (constraining the model's capabilities).
