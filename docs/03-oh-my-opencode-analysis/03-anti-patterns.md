# Anti-Patterns

**Document:** 03-anti-patterns.md  
**Part of:** Oh-My-OpenCode Repository Analysis  
**Source:** `AGENTS.md`, `CONTRIBUTING.md`, `src/agents/AGENTS.md`  


---

## Overview

Oh-My-OpenCode explicitly forbids certain patterns and practices. These anti-patterns are documented to prevent common mistakes that undermine the system's philosophy and reliability.

Anti-patterns are divided into two categories:
- **Hard Blocks**: Absolutely forbidden, will cause failures
- **Soft Guidelines**: Discouraged, may work but suboptimal

---

## Hard Blocks (Absolutely Forbidden)

### 1. Type Safety Violations

| Prohibition | Reason | Source |
|-------------|--------|--------|
| `as any` | Bypasses type checking entirely | AGENTS.md |
| `@ts-ignore` | Hides type errors instead of fixing | AGENTS.md |
| `@ts-expect-error` | Same as above, "expected" doesn't make it acceptable | AGENTS.md |

**Why This Matters:**

Type safety is the first line of defense against bugs. Suppressing type errors is like disabling a fire alarm because it's noisy - the underlying problem remains.

**Bad Example:**
```typescript
// BAD: Silencing the type checker
const user = response.data as any  // What if data is null?
// @ts-ignore
user.nonexistentMethod()  // Runtime crash waiting to happen
```

**Good Example:**
```typescript
// GOOD: Proper typing
interface UserResponse {
  data: User | null
  error?: string
}

const response: UserResponse = await api.getUser(id)
if (response.data) {
  response.data.existingMethod()  // Type-safe access
}
```

**What to Do Instead:**
1. Define proper types/interfaces
2. Use type guards for runtime checks
3. Use `unknown` and narrow the type
4. Fix the actual type mismatch

---

### 2. Package Manager Violations

| Prohibition | Reason | Source |
|-------------|--------|--------|
| `npm` | Oh-My-OpenCode uses Bun exclusively | AGENTS.md |
| `yarn` | Same as above | AGENTS.md |
| `@types/node` | Use `bun-types` instead | AGENTS.md |

**Why This Matters:**

Bun is the runtime. Using npm/yarn creates inconsistencies, different lockfiles, and potential compatibility issues.

**Bad Example:**
```bash
# BAD
npm install lodash
yarn add axios
```

**Good Example:**
```bash
# GOOD
bun add lodash
bun add axios
```

---

### 3. Sequential Agent Calls

| Prohibition | Reason | Source |
|-------------|--------|--------|
| Sequential `delegate_task` without `run_in_background` | Blocks unnecessarily, wastes time | AGENTS.md |

**Why This Matters:**

Exploration tasks (explore/librarian) can run in parallel. Running them sequentially wastes wall-clock time.

**Bad Example:**
```typescript
// BAD: Sequential - each waits for previous to complete
const auth = await delegate_task(agent: "explore", prompt: "Find auth...")
const models = await delegate_task(agent: "explore", prompt: "Find models...")
const docs = await delegate_task(agent: "librarian", prompt: "Get docs...")
// Total time: auth + models + docs
```

**Good Example:**
```typescript
// GOOD: Parallel - all run simultaneously
const t1 = delegate_task(agent: "explore", run_in_background: true, prompt: "Find auth...")
const t2 = delegate_task(agent: "explore", run_in_background: true, prompt: "Find models...")
const t3 = delegate_task(agent: "librarian", run_in_background: true, prompt: "Get docs...")

// Collect results when needed
const [auth, models, docs] = await Promise.all([
  background_output(task_id: t1.id),
  background_output(task_id: t2.id),
  background_output(task_id: t3.id)
])
// Total time: max(auth, models, docs)
```

---

### 4. Trusting Agent Self-Reports

| Prohibition | Reason | Source |
|-------------|--------|--------|
| Believing "I'm done" without verification | Agents lie (or are optimistic) | src/agents/AGENTS.md |

**Why This Matters:**

AI agents will claim completion when tasks are partially done. The system must verify independently.

**Bad Example:**
```typescript
// BAD: Trusting the agent
const result = await delegate_task(prompt: "Add feature X")
if (result.includes("Done")) {
  reportSuccess()  // But is it actually done?
}
```

**Good Example:**
```typescript
// GOOD: Verify independently
const result = await delegate_task(prompt: "Add feature X")

// Check actual state
const diagnostics = await lsp_diagnostics(changedFiles)
const buildResult = await bash("bun run build")
const testResult = await bash("bun test")

if (diagnostics.clean && buildResult.exitCode === 0 && testResult.exitCode === 0) {
  reportSuccess()  // Now we have evidence
}
```

---

### 5. Empty Catch Blocks

| Prohibition | Reason | Source |
|-------------|--------|--------|
| `catch(e) {}` or `catch {}` | Error handling must be explicit | AGENTS.md |

**Why This Matters:**

Empty catch blocks swallow errors, making debugging impossible. If an error occurs, you'll never know.

**Bad Example:**
```typescript
// BAD: Swallowing errors
try {
  await riskyOperation()
} catch (e) {
  // Silently fail - what could go wrong?
}
```

**Good Example:**
```typescript
// GOOD: Handle or rethrow
try {
  await riskyOperation()
} catch (error) {
  if (error instanceof NetworkError) {
    logger.warn("Network failed, retrying...", error)
    return retry(riskyOperation)
  }
  // Unknown error - rethrow
  throw error
}
```

---

### 6. Deleting Failing Tests

| Prohibition | Reason | Source |
|-------------|--------|--------|
| Removing tests to make builds pass | Fix the code, not the test | AGENTS.md |

**Why This Matters:**

Tests exist to catch bugs. Deleting them doesn't fix bugs, it hides them.

**Bad Example:**
```typescript
// BAD: Test fails, delete it
// test("should validate email", () => {
//   expect(validateEmail("bad")).toBe(false)  // This was failing, so I deleted it
// })
```

**Good Example:**
```typescript
// GOOD: Test fails, fix the code
function validateEmail(email: string): boolean {
  // Fixed: was returning true for invalid emails
  return EMAIL_REGEX.test(email)
}

test("should validate email", () => {
  expect(validateEmail("bad")).toBe(false)  // Now passes
})
```

---

### 7. High Temperature for Code Agents

| Prohibition | Reason | Source |
|-------------|--------|--------|
| Temperature > 0.3 for code generation | Code agents need determinism | AGENTS.md |

**Why This Matters:**

Higher temperature = more randomness = inconsistent code. Same prompt should produce same (quality) code.

**Bad Example:**
```typescript
// BAD: High temperature for code
const response = await llm.complete({
  prompt: "Write a function to validate email",
  temperature: 0.9  // Too random for code
})
```

**Good Example:**
```typescript
// GOOD: Low temperature for determinism
const response = await llm.complete({
  prompt: "Write a function to validate email",
  temperature: 0.1  // Consistent output
})
```

---

### 8. Giant Commits

| Prohibition | Reason | Source |
|-------------|--------|--------|
| 3+ files in one commit | Atomic commits always | CONTRIBUTING.md |

**Why This Matters:**

Atomic commits enable:
- Easy reverts
- Clear history
- Code review efficiency
- Bisect debugging

**Bad Example:**
```bash
# BAD: Kitchen sink commit
git add .
git commit -m "Add auth, fix bugs, update styles, refactor utils"
# 47 files changed - good luck reviewing this
```

**Good Example:**
```bash
# GOOD: Atomic commits
git add src/auth/
git commit -m "feat(auth): add JWT token generation"

git add src/auth/middleware.ts
git commit -m "feat(auth): add auth middleware for protected routes"

git add src/auth/auth.test.ts
git commit -m "test(auth): add tests for JWT validation"
```

---

### 9. Direct Publishing

| Prohibition | Reason | Source |
|-------------|--------|--------|
| `bun publish` directly | GitHub Actions only | AGENTS.md |

**Why This Matters:**

Publishing should go through CI/CD for:
- Version consistency
- Changelog generation
- Release notes
- Audit trail

**Bad Example:**
```bash
# BAD: Direct publish
bun publish --access public
# No CI checks, no version bump, no changelog
```

**Good Example:**
```bash
# GOOD: Use release workflow
git tag v1.2.3
git push origin v1.2.3
# GitHub Actions handles the rest
```

---

### 10. Prometheus Writing Code

| Prohibition | Reason | Source |
|-------------|--------|--------|
| Prometheus agent calling Write/Edit tools | Prometheus is a planner only — enforced by `prometheus-md-only` hook | src/agents/AGENTS.md |

**Why This Matters:**

Prometheus exists to create plans, not execute them. If it writes code, it bypasses the delegation chain and produces unverified output.

**Bad Example:**
```typescript
// BAD: Prometheus writes code directly
// (Blocked by prometheus-md-only hook at PreToolUse)
await write("src/feature/index.ts", code)  // BLOCKED
await edit("src/utils.ts", ...)             // BLOCKED
```

**Good Example:**
```markdown
// GOOD: Prometheus outputs a plan
## Task 1: Add feature module
- Create src/feature/index.ts with [specific requirements]
- Follow pattern in src/existing/index.ts:10-30
- Delegate to sisyphus-junior for execution
```

---

### 11. Subagent Asking Questions

| Prohibition | Reason | Source |
|-------------|--------|--------|
| Subagents using question/clarification tools | Subagents should execute, not ask — enforced by `subagent-question-blocker` hook | src/hooks/subagent-question-blocker |

**Why This Matters:**

Subagents receive complete context via the 6-section delegation prompt. If they need to ask questions, the delegation prompt was incomplete. Asking blocks the workflow.

**Bad Example:**
```typescript
// BAD: Subagent asks instead of executing
question("Should I use X or Y for this implementation?")
// Blocks parent orchestrator, wastes time
```

**Good Example:**
```typescript
// GOOD: Subagent picks the pattern matching existing code
const existingPattern = await grep("similar implementation")
// Follows established pattern without asking
await write("src/feature.ts", codeFollowingPattern)
```

---

### 12. Overwriting Notepad

| Prohibition | Reason | Source |
|-------------|--------|--------|
| Overwriting notepad files instead of appending | Notepad is append-only knowledge base; overwrite loses accumulated wisdom | Atlas agent prompt |

**Why This Matters:**

The notepad (`.sisyphus/notepads/`) accumulates learnings, decisions, and issues across multiple delegations. Overwriting destroys institutional knowledge that subsequent subagents need.

**Bad Example:**
```typescript
// BAD: Overwrite entire notepad
await write(".sisyphus/notepads/plan/learnings.md", newContent)
// Previous learnings from 5 delegations: GONE
```

**Good Example:**
```typescript
// GOOD: Append new findings
await edit(".sisyphus/notepads/plan/learnings.md", {
  oldString: "",  // Append at end
  newString: "\n## Delegation 6 Findings\n- Convention: use camelCase for handlers\n"
})
```

---

## Soft Guidelines (Discouraged)

These are not forbidden but generally indicate suboptimal approaches.

### 1. Sequential Bash Commands

**Discouraged:**
```bash
# BAD: Sequential with newlines
mkdir src/feature
touch src/feature/index.ts
npm install dependency
```

**Better:**
```bash
# GOOD: Chained with &&
mkdir src/feature && touch src/feature/index.ts && bun add dependency
```

**Best:**
```typescript
// EVEN BETTER: Delegate to specialized agent
delegate_task(category: "quick", prompt: "Set up new feature module...")
```

---

### 2. File Operations in Code Logic

**Discouraged:**
```typescript
// BAD: File ops in code
fs.mkdirSync("src/feature")
fs.writeFileSync("src/feature/index.ts", content)
```

**Better:**
```typescript
// GOOD: Use bash tool for file ops
await bash("mkdir -p src/feature")
await write("src/feature/index.ts", content)
```

---

### 3. Heavy Computation in PreToolUse Hooks

**Discouraged:**
```typescript
// BAD: Heavy work in hook
"tool.execute.before": async (input) => {
  // This runs before EVERY tool call
  await analyzeEntireCodebase()  // Slow!
  await fetchExternalDocs()      // Network!
}
```

**Better:**
```typescript
// GOOD: Lightweight checks only
"tool.execute.before": async (input) => {
  // Quick validation only
  if (input.tool === "Write") {
    validatePath(input.args.path)
  }
}
```

---

### 4. Separating Test from Implementation

**Discouraged:**
```bash
# BAD: Implementation in one commit, tests in another
git commit -m "feat: add email validation"
# Later...
git commit -m "test: add email validation tests"
```

**Better:**
```bash
# GOOD: Test and implementation together
git commit -m "feat: add email validation with tests"
```

---

## AI Slop Detection

"AI slop" refers to code patterns that make it obvious an AI wrote the code. The Comment Checker tool specifically detects these.

### Common AI Slop Patterns

| Pattern | Example | Fix |
|---------|---------|-----|
| Excessive comments | `// This function gets a user` | Remove obvious comments |
| Over-abstraction | Interface for single implementation | Use concrete type |
| Scope creep | Adding unrequested features | Stick to requirements |
| Generic names | `data`, `result`, `temp` | Use descriptive names |
| Verbose error messages | Full stack trace in user message | Log details, show user-friendly message |

**AI Slop Example:**
```typescript
// BAD: AI slop everywhere
// This function is used to get the user by their ID
// It takes an id parameter of type string
// It returns a Promise that resolves to a User object or null if not found
async function getUserById(id: string): Promise<User | null> {
  // First, we need to get the data from the database
  const data = await db.query(...)
  // Then, we return the result
  return data
}
```

**Clean Code Example:**
```typescript
// GOOD: Self-documenting code
async function getUserById(id: string): Promise<User | null> {
  return db.users.findUnique({ where: { id } })
}
```

---

## Verification Requirements

No task is complete without evidence. These are mandatory, not optional.

| Action | Required Evidence |
|--------|-------------------|
| File edit | `lsp_diagnostics` clean on changed files |
| Build command | Exit code 0 |
| Test run | Pass (or explicit note of pre-existing failures) |
| Delegation | Agent result received AND verified |

**NO EVIDENCE = NOT COMPLETE**

```typescript
// Every task completion must include:
const diagnostics = await lsp_diagnostics(changedFiles)
assert(diagnostics.errors.length === 0, "Diagnostics not clean")

const build = await bash("bun run build")
assert(build.exitCode === 0, "Build failed")

const tests = await bash("bun test")
assert(tests.exitCode === 0, "Tests failed")

// Only now is the task complete
```

---

## Failure Recovery Protocol

When things go wrong, follow this protocol:

### After 3 Consecutive Failures:

1. **STOP** all further edits immediately
2. **REVERT** to last known working state
3. **DOCUMENT** what was attempted and what failed
4. **CONSULT** Oracle with full failure context
5. If Oracle cannot resolve → **ASK USER**

### Never:

- Leave code in broken state
- Continue hoping it'll work
- Delete failing tests to "pass"
- Shotgun debug (random changes)

---

## Summary

| Category | Key Anti-Patterns |
|----------|-------------------|
| **Type Safety** | `as any`, `@ts-ignore`, `@ts-expect-error` |
| **Package Manager** | npm, yarn, @types/node |
| **Agent Calls** | Sequential without background |
| **Trust** | Believing "I'm done" without verification |
| **Error Handling** | Empty catch blocks |
| **Testing** | Deleting failing tests |
| **LLM Config** | Temperature > 0.3 for code |
| **Git** | Giant commits (3+ files) |
| **Publishing** | Direct `bun publish` |
| **Code Quality** | AI slop (excessive comments, over-abstraction) |
| **Role Violation** | Prometheus writing code (v3.1+) |
| **Workflow Blocking** | Subagents asking questions instead of executing (v3.1+) |
| **Knowledge Loss** | Overwriting notepad instead of appending (v3.1+) |

---

## See Also

- [00-core-philosophy.md](./00-core-philosophy.md) - Why these anti-patterns violate core beliefs
- [02-design-patterns.md](./02-design-patterns.md) - What to do instead
- [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) - How to adopt the correct patterns
- [05-eval-methodology.md](./05-eval-methodology.md) - How violations are detected
