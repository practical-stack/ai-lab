# Pattern 03: Anti-Pattern Awareness

**Effort:** 15 minutes | **Impact:** Medium | **Level:** Quick Win  
**Source:** [03-anti-patterns.md](../03-anti-patterns.md)

---

## The Problem

Agents make common mistakes that undermine code quality and reliability. Without explicit prohibitions, they'll take shortcuts.

---

## The Solution

Explicitly list forbidden patterns in every prompt. Create two categories:
1. **Hard Blocks** - Absolutely forbidden, will cause failures
2. **AI Slop** - Detect and remove, marks code as AI-generated

---

## Hard Blocks (Absolutely Forbidden)

### Type Safety Violations

| Prohibition | Reason | Alternative |
|-------------|--------|-------------|
| `as any` | Bypasses type checking entirely | Define proper types |
| `@ts-ignore` | Hides errors instead of fixing | Fix the type error |
| `@ts-expect-error` | Same as above | Use type guards |

**Example:**
```typescript
// BAD
const user = response.data as any
// @ts-ignore
user.nonexistentMethod()

// GOOD
interface UserResponse {
  data: User | null
}
const response: UserResponse = await api.getUser(id)
if (response.data) {
  response.data.existingMethod()
}
```

### Error Handling

| Prohibition | Reason | Alternative |
|-------------|--------|-------------|
| `catch(e) {}` (empty) | Swallows errors silently | Handle or rethrow |
| `catch(e) { console.log(e) }` | Not proper handling | Log + recover or rethrow |

**Example:**
```typescript
// BAD
try {
  await riskyOperation()
} catch (e) {
  // Silently fail
}

// GOOD
try {
  await riskyOperation()
} catch (error) {
  if (error instanceof NetworkError) {
    logger.warn("Network failed, retrying...", error)
    return retry(riskyOperation)
  }
  throw error  // Unknown error - rethrow
}
```

### Testing

| Prohibition | Reason | Alternative |
|-------------|--------|-------------|
| Deleting failing tests | Hides bugs instead of fixing | Fix the code |
| Skipping tests to "make it pass" | Same as above | Fix the code |

### Agent Behavior

| Prohibition | Reason | Alternative |
|-------------|--------|-------------|
| Sequential agent calls | Wastes time | Use `run_in_background: true` |
| Trusting "I'm done" | Agents lie/are optimistic | Verify independently |

### LLM Configuration

| Prohibition | Reason | Alternative |
|-------------|--------|-------------|
| Temperature > 0.3 for code | Too random, inconsistent | Use 0.1-0.3 |

### Git

| Prohibition | Reason | Alternative |
|-------------|--------|-------------|
| 3+ files in one commit | Not atomic | Split into atomic commits |

---

## AI Slop Patterns (Detect and Remove)

"AI slop" = code patterns that make it obvious an AI wrote the code.

| Pattern | Example | Fix |
|---------|---------|-----|
| Excessive comments | `// This function gets a user` | Remove obvious comments |
| Over-abstraction | Interface for single implementation | Use concrete type |
| Scope creep | Adding unrequested features | Stick to requirements |
| Generic names | `data`, `result`, `temp` | Use descriptive names |
| Unnecessary helpers | Extra function for one-liner | Inline the code |
| Verbose errors | Full stack trace in user message | Log details, show user-friendly message |

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

// GOOD: Self-documenting code
async function getUserById(id: string): Promise<User | null> {
  return db.users.findUnique({ where: { id } })
}
```

---

## Implementation Template

Add this to every agent prompt:

```markdown
## MUST NOT (Hard Blocks)

- Do NOT use `as any`, `@ts-ignore`, or `@ts-expect-error`
- Do NOT write empty catch blocks `catch(e) {}`
- Do NOT delete failing tests to make builds pass
- Do NOT run explore/librarian agents sequentially (use background)
- Do NOT claim "done" without verification evidence
- Do NOT use temperature > 0.3 for code generation
- Do NOT put 3+ unrelated files in one commit

## AI Slop (Detect and Remove)

- Remove comments that state the obvious
- Don't create abstractions for single implementations
- Don't add features not explicitly requested
- Use descriptive variable names, not generic ones
- Keep code concise - don't add unnecessary helpers
```

---

## Quick Reference Card

```
HARD BLOCKS:
  Type: as any | @ts-ignore | @ts-expect-error
  Error: catch(e) {} (empty)
  Test: Deleting failing tests
  Agent: Sequential calls without background
  Trust: "I'm done" without evidence
  LLM: Temperature > 0.3 for code
  Git: 3+ files in one commit

AI SLOP:
  Comments: Obvious, excessive
  Abstraction: Over-engineering
  Scope: Feature creep
  Names: Generic (data, result, temp)
  Helpers: Unnecessary functions
```

---

## Adoption Checklist

- [ ] Add MUST NOT section to your main agent prompt
- [ ] Include specific prohibitions for your tech stack
- [ ] Add AI slop detection guidance
- [ ] Review agent output for anti-patterns
- [ ] Create feedback loop for new anti-patterns discovered

---

## See Also

- [../03-anti-patterns.md](../03-anti-patterns.md) - Complete anti-pattern catalog
- [12-comment-checker.md](./12-comment-checker.md) - Automated AI slop detection
- [02-evidence-requirements.md](./02-evidence-requirements.md) - Verification requirements
