# Oh-My-OpenCode Evaluation Methodology

**Created:** 2026-01-25
**Repository:** `code-yeongyu/oh-my-opencode` (v3.0.1)

---

## Overview

Oh-My-OpenCode doesn't use traditional ML evaluation (accuracy, F1, perplexity). Instead, it implements a **behavioral verification framework** for AI agents that operates at multiple layers:

| Layer | Method | Purpose |
|-------|--------|---------|
| **System-Level** | Todo Continuation Enforcer | Verify task completion (don't trust agent self-reports) |
| **Code Quality** | Comment Checker | Detect AI slop (unnecessary comments, over-abstraction) |
| **Environment** | Doctor Health Checks | Validate installation, configuration, dependencies |
| **Skill-Level** | BLOCKING Checkpoints | Force intermediate outputs before proceeding |
| **Unit Testing** | BDD-style Tests (99 files) | Verify component behavior |

**Core Philosophy**: "Never trust 'I'm done' - verify outputs" (`src/agents/AGENTS.md`)

---

## 1. Todo Continuation Enforcer

### Purpose

Forces agents to complete all tasks by injecting continuation prompts when the session goes idle with incomplete todos.

### Source Reference

**File**: `src/hooks/todo-continuation-enforcer.ts` (489 lines)

### Implementation

```typescript
// src/hooks/todo-continuation-enforcer.ts:44-50
const CONTINUATION_PROMPT = `${createSystemDirective(SystemDirectiveTypes.TODO_CONTINUATION)}

Incomplete tasks remain in your todo list. Continue working on the next pending task.

- Proceed without asking for permission
- Mark each task complete when finished
- Do not stop until all tasks are done`
```

### How It Works

1. **Session Idle Detection**: Hooks into `session.idle` event
2. **Todo State Check**: Fetches current todo list from session
3. **Incomplete Count**: Filters todos that are not `completed` or `cancelled`
4. **Continuation Injection**: If incomplete todos exist, injects continuation prompt

```typescript
// src/hooks/todo-continuation-enforcer.ts:70-72
function getIncompleteCount(todos: Todo[]): number {
  return todos.filter(t => t.status !== "completed" && t.status !== "cancelled").length
}
```

### Safety Checks Before Injection

```typescript
// src/hooks/todo-continuation-enforcer.ts:175-226
// Skip if:
// 1. Session is in recovery mode
if (state?.isRecovering) {
  log(`[${HOOK_NAME}] Skipped injection: in recovery`, { sessionID })
  return
}

// 2. Background tasks are still running
const hasRunningBgTasks = backgroundManager
  ? backgroundManager.getTasksByParentSession(sessionID).some(t => t.status === "running")
  : false

if (hasRunningBgTasks) {
  log(`[${HOOK_NAME}] Skipped injection: background tasks running`, { sessionID })
  return
}

// 3. Agent is in skip list (e.g., prometheus, compaction)
if (agentName && skipAgents.includes(agentName)) {
  log(`[${HOOK_NAME}] Skipped: agent in skipAgents list`, { sessionID, agent: agentName })
  return
}

// 4. Agent lacks write permission
if (!hasWritePermission) {
  log(`[${HOOK_NAME}] Skipped: agent lacks write permission`, { sessionID, agent: agentName })
  return
}
```

### Test Example

**File**: `src/hooks/todo-continuation-enforcer.test.ts`

```typescript
// src/hooks/todo-continuation-enforcer.test.ts:73-96
test("should inject continuation when idle with incomplete todos", async () => {
  // #given - main session with incomplete todos
  const sessionID = "main-123"
  setMainSession(sessionID)

  const hook = createTodoContinuationEnforcer(createMockPluginInput(), {
    backgroundManager: createMockBackgroundManager(false),
  })

  // #when - session goes idle
  await hook.handler({
    event: { type: "session.idle", properties: { sessionID } },
  })

  // #then - countdown toast shown
  await new Promise(r => setTimeout(r, 100))
  expect(toastCalls.length).toBeGreaterThanOrEqual(1)
  expect(toastCalls[0].title).toBe("Todo Continuation")

  // #then - after countdown, continuation injected
  await new Promise(r => setTimeout(r, 2500))
  expect(promptCalls.length).toBe(1)
  expect(promptCalls[0].text).toContain("TODO CONTINUATION")
})
```

---

## 2. Comment Checker

### Purpose

Detects and warns about excessive or unnecessary comments in AI-generated code. Prevents "AI slop" - code that screams "an AI wrote this."

### Source Reference

**File**: `src/hooks/comment-checker/index.ts`
**External Binary**: `@code-yeongyu/comment-checker` (Rust CLI)

### Implementation

```typescript
// src/hooks/comment-checker/index.ts:52-89
"tool.execute.before": async (
  input: { tool: string; sessionID: string; callID: string },
  output: { args: Record<string, unknown> }
): Promise<void> => {
  const toolLower = input.tool.toLowerCase()
  // Only check Write, Edit, MultiEdit tools
  if (toolLower !== "write" && toolLower !== "edit" && toolLower !== "multiedit") {
    return
  }

  const filePath = (output.args.filePath ?? output.args.file_path ?? output.args.path) as string
  const content = output.args.content as string

  // Store pending call for post-execution check
  pendingCalls.set(input.callID, {
    filePath,
    content,
    tool: toolLower,
    sessionID: input.sessionID,
    timestamp: Date.now(),
  })
}
```

### Post-Execution Check

```typescript
// src/hooks/comment-checker/index.ts:91-136
"tool.execute.after": async (
  input: { tool: string; sessionID: string; callID: string },
  output: { title: string; output: string; metadata: unknown }
): Promise<void> => {
  const pendingCall = pendingCalls.get(input.callID)
  if (!pendingCall) return

  pendingCalls.delete(input.callID)

  // Skip if tool execution failed
  const outputLower = output.output.toLowerCase()
  const isToolFailure = 
    outputLower.includes("error:") || 
    outputLower.includes("failed to") ||
    outputLower.includes("could not")
  
  if (isToolFailure) return

  // Run external comment checker CLI
  const cliPath = await cliPathPromise
  if (!cliPath || !existsSync(cliPath)) return
  
  await processWithCli(input, pendingCall, output, cliPath, config?.custom_prompt)
}
```

### Test Example

**File**: `src/hooks/comment-checker/cli.test.ts`

```typescript
// src/hooks/comment-checker/cli.test.ts:48-66
describe("runCommentChecker", () => {
  test("should use getCommentCheckerPathSync for fallback path resolution", async () => {
    // #given runCommentChecker is called without explicit path
    const { runCommentChecker } = await import("./cli")
    
    // #when called with input containing no comments
    const result = await runCommentChecker({
      session_id: "test",
      tool_name: "Write",
      transcript_path: "",
      cwd: "/tmp",
      hook_event_name: "PostToolUse",
      tool_input: { file_path: "/tmp/test.ts", content: "const x = 1" },
    })
    
    // #then should return CheckResult type
    expect(typeof result.hasComments).toBe("boolean")
    expect(typeof result.message).toBe("string")
  })
})
```

### Smart Exceptions

The Comment Checker intelligently ignores:
- **BDD comments**: `#given`, `#when`, `#then`
- **Docstrings**: JSDoc, Python docstrings
- **Directive comments**: `// eslint-disable`, `// @ts-ignore`

---

## 3. Doctor Health Checks

### Purpose

Validates the entire environment before running: installation, configuration, authentication, dependencies, and tools.

### Source Reference

**Directory**: `src/cli/doctor/`
**Types**: `src/cli/doctor/types.ts`
**Checks**: `src/cli/doctor/checks/` (14 check modules)

### Check Categories

```typescript
// src/cli/doctor/types.ts:13-19
export type CheckCategory =
  | "installation"    // OpenCode, plugin installed
  | "configuration"   // Config file valid, Zod schema
  | "authentication"  // Anthropic, OpenAI, Google API keys
  | "dependencies"    // AST-Grep, Comment Checker binaries
  | "tools"           // LSP, MCP servers
  | "updates"         // Version comparison
```

### Check Definition Interface

```typescript
// src/cli/doctor/types.ts:21-27
export interface CheckDefinition {
  id: string
  name: string
  category: CheckCategory
  check: CheckFunction
  critical?: boolean  // If true, failure = exit code 1
}
```

### All Check Definitions

```typescript
// src/cli/doctor/checks/index.ts:24-37
export function getAllCheckDefinitions(): CheckDefinition[] {
  return [
    getOpenCodeCheckDefinition(),        // OpenCode installed?
    getPluginCheckDefinition(),          // Plugin registered?
    getConfigCheckDefinition(),          // Config valid?
    getModelResolutionCheckDefinition(), // Models resolve?
    ...getAuthCheckDefinitions(),        // API keys configured?
    ...getDependencyCheckDefinitions(),  // AST-Grep, Comment Checker?
    getGhCliCheckDefinition(),           // GitHub CLI?
    getLspCheckDefinition(),             // LSP servers?
    ...getMcpCheckDefinitions(),         // MCP servers valid?
    getVersionCheckDefinition(),         // Up to date?
  ]
}
```

### Config Validation Example

```typescript
// src/cli/doctor/checks/config.ts:26-46
export function validateConfig(configPath: string): { valid: boolean; errors: string[] } {
  try {
    const content = readFileSync(configPath, "utf-8")
    const rawConfig = parseJsonc<Record<string, unknown>>(content)
    
    // Zod schema validation
    const result = OhMyOpenCodeConfigSchema.safeParse(rawConfig)

    if (!result.success) {
      const errors = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      )
      return { valid: false, errors }
    }

    return { valid: true, errors: [] }
  } catch (err) {
    return {
      valid: false,
      errors: [err instanceof Error ? err.message : "Failed to parse config"],
    }
  }
}
```

### Check Result Structure

```typescript
// src/cli/doctor/types.ts:1-9
export type CheckStatus = "pass" | "fail" | "warn" | "skip"

export interface CheckResult {
  name: string
  status: CheckStatus
  message: string
  details?: string[]
  duration?: number
}
```

### Test Example

**File**: `src/cli/doctor/runner.test.ts`

```typescript
// src/cli/doctor/runner.test.ts:81-107
describe("determineExitCode", () => {
  it("returns 0 when all pass", () => {
    const results: CheckResult[] = [
      { name: "1", status: "pass", message: "" },
      { name: "2", status: "pass", message: "" },
    ]
    expect(determineExitCode(results)).toBe(0)
  })

  it("returns 0 when only warnings", () => {
    const results: CheckResult[] = [
      { name: "1", status: "pass", message: "" },
      { name: "2", status: "warn", message: "" },
    ]
    expect(determineExitCode(results)).toBe(0)
  })

  it("returns 1 when any failures", () => {
    const results: CheckResult[] = [
      { name: "1", status: "pass", message: "" },
      { name: "2", status: "fail", message: "" },
    ]
    expect(determineExitCode(results)).toBe(1)
  })
})
```

---

## 4. BLOCKING Checkpoints (Skill-Level Verification)

### Purpose

Forces the AI to produce intermediate outputs before proceeding to the next phase. Prevents LLMs from skipping analysis steps.

### Source Reference

**File**: `src/features/builtin-skills/git-master/SKILL.md` (1100+ lines)

### Pattern Structure

```markdown
## PHASE 1: Style Detection (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

<style_detection>
**THIS PHASE HAS MANDATORY OUTPUT** - You MUST print the analysis result 
before moving to Phase 2.

### 1.3 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding to Phase 2. NO EXCEPTIONS.**

```
STYLE DETECTION RESULT
======================
Analyzed: 30 commits from git log

Language: [KOREAN | ENGLISH]
  - Korean commits: N (X%)
  - English commits: M (Y%)

Style: [SEMANTIC | PLAIN | SENTENCE | SHORT]
  - Semantic (feat:, fix:, etc): N (X%)
  - Plain: M (Y%)
  - Short: K (Z%)

Reference examples from repo:
  1. "actual commit message from log"
  2. "actual commit message from log"
  3. "actual commit message from log"

All commits will follow: [LANGUAGE] + [STYLE]
```

**IF YOU SKIP THIS OUTPUT, YOUR COMMITS WILL BE WRONG. STOP AND REDO.**
</style_detection>
```

### Key Elements

| Element | Purpose |
|---------|---------|
| `(BLOCKING - MUST OUTPUT BEFORE PROCEEDING)` | Section header warning |
| `**THIS PHASE HAS MANDATORY OUTPUT**` | Bold emphasis at start |
| Template output block | Exact format expected |
| `NO EXCEPTIONS` | Eliminates edge-case reasoning |
| `IF YOU SKIP... STOP AND REDO.` | Consequence warning |

### Verification Checklist Example

```markdown
## FINAL CHECK BEFORE EXECUTION (BLOCKING)

```
STOP AND VERIFY - Do not proceed until ALL boxes checked:

[] File count check: N files -> at least ceil(N/3) commits?
  - 3 files -> min 1 commit
  - 5 files -> min 2 commits
  - 10 files -> min 4 commits
  - 20 files -> min 7 commits

[] Justification check: For each commit with 3+ files, did I write WHY?

[] Directory split check: Different directories -> different commits?

[] Test pairing check: Each test with its implementation?

[] Dependency order check: Foundations before dependents?
```

**HARD STOP CONDITIONS:**
- Making 1 commit from 3+ files -> **WRONG. SPLIT.**
- Making 2 commits from 10+ files -> **WRONG. SPLIT MORE.**
- Can't justify file grouping in one sentence -> **WRONG. SPLIT.**
```

### Post-Execution Verification

```markdown
## PHASE 6: Verification & Cleanup

<verification>
### 6.1 Post-Commit Verification

```bash
# Check working directory clean
git status

# Review new history
git log --oneline $(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master)..HEAD

# Verify each commit is atomic
# (mentally check: can each be reverted independently?)
```

### 6.3 Final Report

```
COMMIT SUMMARY:
  Strategy: <what was done>
  Commits created: N
  Fixups merged: M
  
HISTORY:
  <hash1> <message1>
  <hash2> <message2>
  ...

NEXT STEPS:
  - git push [--force-with-lease]
  - Create PR if ready
```
</verification>
```

---

## 5. BDD-Style Unit Testing

### Purpose

99 test files using Behavior-Driven Development (BDD) comments for clear test documentation.

### Source Reference

Test files are colocated with source: `*.test.ts` alongside `*.ts`

### BDD Comment Pattern

```typescript
// #given - initial state/preconditions
// #when - action being tested
// #then - expected outcome
```

### Real Example

**File**: `src/hooks/comment-checker/cli.test.ts`

```typescript
describe("comment-checker CLI path resolution", () => {
  describe("lazy initialization", () => {
    // #given module is imported
    // #when COMMENT_CHECKER_CLI_PATH is accessed
    // #then findCommentCheckerPathSync should NOT have been called during import
    
    test("getCommentCheckerPathSync should be lazy - not called on module import", async () => {
      // #given a fresh module import
      const cliModule = await import("./cli")
      
      // #when we import the module
      // (import happens above)
      
      // #then getCommentCheckerPathSync should exist and be callable
      expect(typeof cliModule.getCommentCheckerPathSync).toBe("function")
      
      const result = cliModule.getCommentCheckerPathSync()
      expect(result === null || typeof result === "string").toBe(true)
    })

    test("getCommentCheckerPathSync should cache result after first call", async () => {
      // #given getCommentCheckerPathSync is called once
      const cliModule = await import("./cli")
      const firstResult = cliModule.getCommentCheckerPathSync()
      
      // #when called again
      const secondResult = cliModule.getCommentCheckerPathSync()
      
      // #then should return same cached result
      expect(secondResult).toBe(firstResult)
    })
  })
})
```

### TDD Requirements

From `AGENTS.md`:

```markdown
## TDD (Test-Driven Development)

**MANDATORY.** RED-GREEN-REFACTOR:
1. **RED**: Write test → `bun test` → FAIL
2. **GREEN**: Implement minimum → PASS
3. **REFACTOR**: Clean up → stay GREEN

**Rules:**
- NEVER write implementation before test
- NEVER delete failing tests - fix the code
- Test file: `*.test.ts` alongside source
- BDD comments: `#given`, `#when`, `#then`
```

---

## 6. Evidence Requirements

### Purpose

Defines what constitutes "proof of completion" for different actions.

### Source Reference

**File**: `sisyphus-prompt.md` (Sisyphus system prompt)

### Evidence Matrix

| Action | Required Evidence |
|--------|-------------------|
| File edit | `lsp_diagnostics` clean on changed files |
| Build command | Exit code 0 |
| Test run | Pass (or explicit note of pre-existing failures) |
| Delegation | Agent result received and verified |

**NO EVIDENCE = NOT COMPLETE.**

### Verification Process

From `sisyphus-prompt.md`:

```markdown
### Verification:

Run `lsp_diagnostics` on changed files at:
- End of a logical task unit
- Before marking a todo item complete
- Before reporting completion to user

If project has build/test commands, run them at task completion.
```

### Failure Recovery

```markdown
## Phase 2C - Failure Recovery

### After 3 Consecutive Failures:

1. **STOP** all further edits immediately
2. **REVERT** to last known working state (git checkout / undo edits)
3. **DOCUMENT** what was attempted and what failed
4. **CONSULT** Oracle with full failure context
5. If Oracle cannot resolve → **ASK USER** before proceeding

**Never**: Leave code in broken state, continue hoping it'll work, 
delete failing tests to "pass"
```

---

## 7. Qualitative Evaluation: "Indistinguishable Code"

### Purpose

The ultimate evaluation criterion: Can you tell if a human or AI wrote this code?

### Source Reference

**File**: `docs/ultrawork-manifesto.md`

### Definition

```markdown
## Indistinguishable Code

**Goal: Code written by the agent should be indistinguishable from code 
written by a senior engineer.**

Not "AI-generated code that needs cleanup." Not "a good starting point." 
The actual, final, production-ready code.

This means:
- Following existing codebase patterns exactly
- Proper error handling without being asked
- Tests that actually test the right things
- No AI slop (over-engineering, unnecessary abstractions, scope creep)
- Comments only when they add value

If you can tell whether a commit was made by a human or an agent, 
the agent has failed.
```

### AI Slop Definition

"AI slop" includes:
- Excessive comments explaining obvious code
- Over-abstraction (creating interfaces for single implementations)
- Scope creep (adding unrequested features)
- Generic variable names (`data`, `result`, `temp`)
- Unnecessary helper functions
- Verbose error messages that don't help debugging

---

## Summary: Evaluation Philosophy

| Principle | Implementation |
|-----------|----------------|
| **Don't trust agents** | Todo Continuation Enforcer verifies completion |
| **Detect AI artifacts** | Comment Checker catches AI slop |
| **Validate environment** | Doctor runs 14+ health checks |
| **Force analysis** | BLOCKING checkpoints require intermediate output |
| **Test behavior** | 99 BDD-style test files |
| **Require evidence** | LSP diagnostics, build pass, test pass |
| **Ultimate criterion** | Code indistinguishable from senior engineer |

### Key Insight

Oh-My-OpenCode treats evaluation as a **trust problem**:
- Agents will claim completion prematurely → System verifies via todo state
- Agents will add unnecessary comments → External tool detects and warns
- Agents will skip analysis steps → BLOCKING patterns force output
- Agents will leave broken code → Evidence requirements catch failures

**The system assumes agents lie (or are optimistic). Verification is non-negotiable.**

---

## Appendix: File References

| File | Lines | Purpose |
|------|-------|---------|
| `src/hooks/todo-continuation-enforcer.ts` | 489 | Forces task completion |
| `src/hooks/todo-continuation-enforcer.test.ts` | 200+ | BDD tests for enforcer |
| `src/hooks/comment-checker/index.ts` | 200+ | AI slop detection hook |
| `src/hooks/comment-checker/cli.test.ts` | 69 | BDD tests for comment checker |
| `src/cli/doctor/types.ts` | 114 | Check result types |
| `src/cli/doctor/checks/index.ts` | 38 | Check registry |
| `src/cli/doctor/checks/config.ts` | 123 | Config validation |
| `src/cli/doctor/runner.test.ts` | 154 | BDD tests for doctor |
| `src/features/builtin-skills/git-master/SKILL.md` | 1100+ | BLOCKING pattern examples |
| `docs/ultrawork-manifesto.md` | 198 | Philosophy (indistinguishable code) |
| `sisyphus-prompt.md` | 738 | Evidence requirements |
