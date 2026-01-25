# Pattern 11: Todo Continuation Enforcer

**Effort:** 1-2 days | **Impact:** Very High | **Level:** Full System  
**Source:** [05-eval-methodology.md](../05-eval-methodology.md)

---

## The Problem

Agents claim "I'm done" when todos remain incomplete. They:
- Forget earlier tasks
- Get optimistic about completion
- Stop when encountering difficulty
- Miss edge cases

---

## The Solution

Build a hook that checks todo state and injects continuation prompts automatically.

**Core Principle**: The SYSTEM verifies completion, not the agent.

---

## Architecture

```
Agent says: "I'm done!"
        ↓
Session Idle Event fires
        ↓
Todo Continuation Enforcer:
├── Check: All todos complete? 
│   └── No → Inject continuation prompt
├── Check: Background tasks running?
│   └── Yes → Wait, don't inject
├── Check: In recovery mode?
│   └── Yes → Skip injection
└── Check: Agent in skip list?
    └── Yes → Skip injection
        ↓
Agent receives: "Incomplete tasks remain. Continue."
        ↓
Agent continues working
```

---

## Implementation

### Core Hook

```typescript
const HOOK_NAME = "TodoContinuationEnforcer"

const CONTINUATION_PROMPT = `[SYSTEM DIRECTIVE: TODO CONTINUATION]

Incomplete tasks remain in your todo list. Continue working on the next pending task.

- Proceed without asking for permission
- Mark each task complete when finished
- Do not stop until all tasks are done`

// Hook into session idle event
async function onSessionIdle(session: Session) {
  const { sessionID } = session
  
  // Safety checks
  if (await isRecovering(sessionID)) {
    log(`[${HOOK_NAME}] Skipped: in recovery mode`)
    return
  }
  
  if (await hasRunningBackgroundTasks(sessionID)) {
    log(`[${HOOK_NAME}] Skipped: background tasks running`)
    return
  }
  
  const agentName = await getAgentName(sessionID)
  if (SKIP_AGENTS.includes(agentName)) {
    log(`[${HOOK_NAME}] Skipped: agent in skip list`)
    return
  }
  
  // Check todo state
  const todos = await getTodos(sessionID)
  const incomplete = todos.filter(t => 
    t.status !== "completed" && t.status !== "cancelled"
  )
  
  if (incomplete.length > 0) {
    log(`[${HOOK_NAME}] Injecting continuation: ${incomplete.length} incomplete`)
    await injectPrompt(sessionID, CONTINUATION_PROMPT)
  }
}
```

### Helper Functions

```typescript
function getIncompleteCount(todos: Todo[]): number {
  return todos.filter(t => 
    t.status !== "completed" && t.status !== "cancelled"
  ).length
}

const SKIP_AGENTS = [
  "prometheus",      // Planning agent - doesn't do todos
  "momus",          // Review agent - doesn't do todos
  "compaction",     // System agent
]

async function hasRunningBackgroundTasks(sessionID: string): Promise<boolean> {
  const tasks = await backgroundManager.getTasksBySession(sessionID)
  return tasks.some(t => t.status === "running")
}
```

---

## Continuation Prompt Variants

### Standard Continuation

```
[SYSTEM DIRECTIVE: TODO CONTINUATION]

Incomplete tasks remain in your todo list. Continue working on the next pending task.

- Proceed without asking for permission
- Mark each task complete when finished
- Do not stop until all tasks are done
```

### With Countdown (Optional)

```typescript
async function injectWithCountdown(sessionID: string) {
  // Show countdown toast
  await showToast({
    title: "Todo Continuation",
    message: "Continuing in 3 seconds...",
    countdown: 3
  })
  
  // Wait for countdown
  await sleep(3000)
  
  // Inject continuation
  await injectPrompt(sessionID, CONTINUATION_PROMPT)
}
```

---

## Safety Checks Explained

| Check | Purpose | Skip If |
|-------|---------|---------|
| Recovery mode | Don't interrupt error recovery | `state.isRecovering === true` |
| Background tasks | Wait for async work | Any task has `status === "running"` |
| Skip agents | Some agents don't do todos | Agent in `SKIP_AGENTS` list |
| Write permission | Can't continue read-only agents | Agent lacks write tools |

---

## Testing

```typescript
describe("Todo Continuation Enforcer", () => {
  test("should inject continuation when idle with incomplete todos", async () => {
    // #given - session with incomplete todos
    const sessionID = "main-123"
    mockTodos([
      { id: "1", content: "Task 1", status: "completed" },
      { id: "2", content: "Task 2", status: "pending" }  // Incomplete!
    ])
    
    // #when - session goes idle
    await hook.onSessionIdle({ sessionID })
    
    // #then - continuation injected
    expect(injectPrompt).toHaveBeenCalledWith(
      sessionID,
      expect.stringContaining("TODO CONTINUATION")
    )
  })
  
  test("should not inject when all todos complete", async () => {
    // #given - session with all todos complete
    mockTodos([
      { id: "1", content: "Task 1", status: "completed" },
      { id: "2", content: "Task 2", status: "completed" }
    ])
    
    // #when - session goes idle
    await hook.onSessionIdle({ sessionID: "test" })
    
    // #then - no injection
    expect(injectPrompt).not.toHaveBeenCalled()
  })
  
  test("should skip when background tasks running", async () => {
    // #given - incomplete todos but background task running
    mockTodos([{ id: "1", status: "pending" }])
    mockBackgroundTasks([{ status: "running" }])
    
    // #when - session goes idle
    await hook.onSessionIdle({ sessionID: "test" })
    
    // #then - no injection
    expect(injectPrompt).not.toHaveBeenCalled()
  })
})
```

---

## Integration Points

### Event Registration

```typescript
// Register hook with session system
sessionManager.on("session.idle", async (event) => {
  await todoContinuationEnforcer.onSessionIdle(event)
})
```

### Todo System Integration

```typescript
// Todo system must expose:
interface TodoSystem {
  getTodos(sessionID: string): Promise<Todo[]>
}

interface Todo {
  id: string
  content: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
}
```

---

## Key Design Points

1. **Independent verification**: Check todo state, not agent claims
2. **Automatic injection**: No human needed to keep agent working
3. **Safety checks**: Skip when inappropriate (recovery, background tasks)
4. **Persistence**: Agent can't escape by claiming completion
5. **Non-blocking**: Uses session idle, doesn't interrupt active work

---

## Adoption Checklist

- [ ] Implement todo state tracking
- [ ] Build session idle detection
- [ ] Create continuation prompt
- [ ] Add safety checks (recovery, background, skip list)
- [ ] Add logging for debugging
- [ ] Write tests for all scenarios

---

## See Also

- [02-evidence-requirements.md](./02-evidence-requirements.md) - What counts as complete
- [06-planning-execution.md](./06-planning-execution.md) - Todo-based execution
- [../05-eval-methodology.md](../05-eval-methodology.md) - Full evaluation methodology
