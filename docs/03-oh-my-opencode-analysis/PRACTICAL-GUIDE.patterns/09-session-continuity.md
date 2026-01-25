# Pattern 09: Session Continuity

**Effort:** 2 hours | **Impact:** Medium | **Level:** Foundation  
**Source:** [02-design-patterns.md](../02-design-patterns.md)

---

## The Problem

Starting fresh for follow-ups:
- Wastes ~70% tokens repeating context
- Loses what the agent already learned
- Agent re-reads files it already processed
- Slower iteration cycles

---

## The Solution

Store and reuse `session_id` for all follow-up work.

---

## How It Works

```typescript
// Initial delegation - get session_id
const result = await delegate_task({
  category: "quick",
  prompt: "Add User model to database..."
})
// result.session_id = "ses_abc123"

// Follow-up - use session_id
await delegate_task({
  session_id: "ses_abc123",  // Continue existing session
  prompt: "Fix: Missing email field validation"
})
// Agent has FULL context from previous work
```

---

## When to Use Session Continuity

| Scenario | Action |
|----------|--------|
| Task failed | `session_id="{id}", prompt="Fix: {specific error}"` |
| Need follow-up | `session_id="{id}", prompt="Also: {question}"` |
| Verification failed | `session_id="{id}", prompt="Failed: {error}. Fix."` |
| Related work | Same `session_id` for same topic |
| Multi-turn conversation | Always use `session_id` instead of new task |

---

## Examples

### Example 1: Fix Failed Task

```typescript
// Initial task
const result = await delegate_task({
  category: "quick",
  prompt: "Add deleteUser function..."
})
// session_id = "ses_abc123"

// Task failed - continue with session
await delegate_task({
  session_id: "ses_abc123",
  prompt: "Fix: TypeScript error on line 45 - 'id' is possibly undefined"
})
// Agent knows the context, just fixes the specific error
```

### Example 2: Add Related Feature

```typescript
// Initial task
const result = await delegate_task({
  category: "quick",
  prompt: "Add user registration endpoint..."
})
// session_id = "ses_def456"

// Related follow-up
await delegate_task({
  session_id: "ses_def456",
  prompt: "Also add email verification for registration"
})
// Agent understands the existing registration flow
```

### Example 3: Verification Failed

```typescript
// Initial task completed
const result = await delegate_task({...})
// session_id = "ses_ghi789"

// Run verification
const tests = await bash("bun test")
// Tests failed!

// Continue session to fix
await delegate_task({
  session_id: "ses_ghi789",
  prompt: `Tests failed with error:
${tests.stderr}

Fix the failing tests.`
})
```

---

## Benefits

| Starting Fresh | Using session_id |
|----------------|------------------|
| Re-reads all files | Already has file contents |
| Re-explores patterns | Already knows patterns |
| No memory of attempts | Knows what was tried |
| Full context setup | Minimal additional tokens |
| ~100% tokens | ~30% tokens for follow-up |

---

## Implementation Pattern

```typescript
class SessionManager {
  private sessions: Map<string, string> = new Map()
  
  async delegate(topic: string, prompt: string) {
    const existingSession = this.sessions.get(topic)
    
    const result = await delegate_task({
      ...(existingSession ? { session_id: existingSession } : {}),
      prompt
    })
    
    // Store session for future use
    this.sessions.set(topic, result.session_id)
    
    return result
  }
}

// Usage
const manager = new SessionManager()

// First call - creates new session
await manager.delegate("auth-feature", "Add login endpoint")

// Second call - continues session
await manager.delegate("auth-feature", "Fix: add rate limiting")

// Different topic - new session
await manager.delegate("dashboard", "Create dashboard page")
```

---

## When NOT to Use

| Situation | Use New Session Instead |
|-----------|------------------------|
| Completely unrelated task | New session |
| Different agent type needed | New session |
| Previous session corrupted | New session |
| Need fresh perspective | New session |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Not storing session_id | Always capture and store |
| Starting fresh for every call | Check if related to existing topic |
| Using wrong session | Track topics to sessions |
| Losing session_id | Persist sessions appropriately |

---

## Adoption Checklist

- [ ] Track session_id from every delegation
- [ ] Create topic → session mapping
- [ ] Use session_id for all follow-ups
- [ ] Never start fresh when continuation is possible
- [ ] Persist session mapping for longer workflows

---

## See Also

- [05-delegation-prompt.md](./05-delegation-prompt.md) - What to include in prompts
- [11-todo-continuation.md](./11-todo-continuation.md) - System-level continuation
- [10-category-skill-system.md](./10-category-skill-system.md) - Category selection
