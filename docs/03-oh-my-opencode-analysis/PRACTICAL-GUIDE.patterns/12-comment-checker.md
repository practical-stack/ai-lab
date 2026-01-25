# Pattern 12: Comment Checker (AI Slop Detection)

**Effort:** 1 day | **Impact:** Medium | **Level:** Full System  
**Source:** [05-eval-methodology.md](../05-eval-methodology.md)

---

## The Problem

AI-generated code often has excessive, obvious comments that mark it as "AI slop":

```typescript
// BAD: AI slop
// This function is used to get the user by their ID
// It takes an id parameter of type string
// It returns a Promise that resolves to a User object
async function getUserById(id: string): Promise<User | null> {
  // First, we need to get the data from the database
  const data = await db.query(...)
  // Then, we return the result
  return data
}
```

---

## The Solution

Build a tool that detects and warns about unnecessary comments in AI-generated code.

---

## Architecture

```
Agent writes file (Write/Edit tool)
        ↓
Post-execution hook fires
        ↓
Comment Checker:
├── Extract comments from file
├── Analyze each comment
├── Flag: Obvious? Redundant? Over-explaining?
└── Generate warning message
        ↓
Warning shown to agent
        ↓
Agent fixes (or continues with awareness)
```

---

## Implementation

### Hook Integration

```typescript
const commentCheckerHook = {
  name: "CommentChecker",
  
  // Store pending calls for post-execution check
  "tool.execute.before": async (input, output) => {
    const toolLower = input.tool.toLowerCase()
    
    // Only check Write/Edit tools
    if (!["write", "edit", "multiedit"].includes(toolLower)) {
      return
    }
    
    // Store for post-execution
    pendingCalls.set(input.callID, {
      filePath: output.args.filePath,
      content: output.args.content,
      tool: toolLower,
      sessionID: input.sessionID
    })
  },
  
  "tool.execute.after": async (input, output) => {
    const pendingCall = pendingCalls.get(input.callID)
    if (!pendingCall) return
    
    pendingCalls.delete(input.callID)
    
    // Skip if tool failed
    if (output.output.toLowerCase().includes("error:")) {
      return
    }
    
    // Run comment checker
    const result = await runCommentChecker(pendingCall)
    
    if (result.hasExcessiveComments) {
      await showWarning(input.sessionID, result.message)
    }
  }
}
```

### Comment Detection Logic

```typescript
interface CommentCheckResult {
  hasExcessiveComments: boolean
  message: string
  flaggedComments: FlaggedComment[]
}

interface FlaggedComment {
  line: number
  comment: string
  reason: "obvious" | "redundant" | "over_explaining"
}

async function runCommentChecker(input: {
  filePath: string
  content: string
}): Promise<CommentCheckResult> {
  const comments = extractComments(input.content, input.filePath)
  const flagged: FlaggedComment[] = []
  
  for (const comment of comments) {
    // Skip smart exceptions
    if (isBddComment(comment)) continue
    if (isDocstring(comment)) continue
    if (isDirective(comment)) continue
    
    // Check for AI slop patterns
    if (isObviousComment(comment)) {
      flagged.push({ ...comment, reason: "obvious" })
    } else if (isRedundantComment(comment)) {
      flagged.push({ ...comment, reason: "redundant" })
    } else if (isOverExplaining(comment)) {
      flagged.push({ ...comment, reason: "over_explaining" })
    }
  }
  
  return {
    hasExcessiveComments: flagged.length > 0,
    message: formatWarning(flagged),
    flaggedComments: flagged
  }
}
```

---

## Smart Exceptions

The Comment Checker should NOT flag these:

### BDD Comments
```typescript
// #given - initial state
// #when - action
// #then - assertion
```

### Docstrings / JSDoc
```typescript
/**
 * Gets a user by their ID.
 * @param id - The user's unique identifier
 * @returns The user or null if not found
 */
```

### Directive Comments
```typescript
// eslint-disable-next-line
// @ts-ignore (legitimate use)
// TODO: implement caching
// FIXME: race condition
```

### Implementation of Exceptions

```typescript
function isBddComment(comment: Comment): boolean {
  const bddPatterns = ['#given', '#when', '#then']
  return bddPatterns.some(p => comment.text.includes(p))
}

function isDocstring(comment: Comment): boolean {
  return comment.text.startsWith('/**') || comment.text.startsWith('"""')
}

function isDirective(comment: Comment): boolean {
  const directives = [
    'eslint-disable',
    '@ts-ignore',
    '@ts-expect-error',
    'TODO:',
    'FIXME:',
    'NOTE:',
    'HACK:'
  ]
  return directives.some(d => comment.text.includes(d))
}
```

---

## AI Slop Detection Rules

### Obvious Comments

Comments that state what the code already says:

```typescript
// BAD: Obvious
const user = await getUser(id)  // Get the user

// The code is self-documenting - remove comment
const user = await getUser(id)
```

### Redundant Comments

Comments that repeat type information:

```typescript
// BAD: Redundant
// Takes a string id and returns a User or null
async function getUserById(id: string): Promise<User | null>

// Type signature already says this - remove comment
async function getUserById(id: string): Promise<User | null>
```

### Over-explaining

Multiple comments for simple operations:

```typescript
// BAD: Over-explaining
// First, we need to validate the input
// Check if the id is a valid string
// Make sure it's not empty
if (!id || typeof id !== 'string') {
  throw new Error('Invalid id')
}

// One comment or none is enough
if (!id || typeof id !== 'string') {
  throw new Error('Invalid id')
}
```

---

## Warning Message Format

```typescript
function formatWarning(flagged: FlaggedComment[]): string {
  const byReason = groupBy(flagged, 'reason')
  
  let message = '⚠️ AI Slop Detected:\n\n'
  
  if (byReason.obvious?.length) {
    message += `Obvious comments (${byReason.obvious.length}):\n`
    for (const c of byReason.obvious.slice(0, 3)) {
      message += `  Line ${c.line}: "${c.comment.slice(0, 50)}..."\n`
    }
  }
  
  if (byReason.redundant?.length) {
    message += `\nRedundant comments (${byReason.redundant.length}):\n`
    // ...
  }
  
  message += '\nConsider removing these to match senior engineer quality.'
  
  return message
}
```

---

## Testing

```typescript
describe("Comment Checker", () => {
  test("should flag obvious comments", async () => {
    const result = await runCommentChecker({
      filePath: "test.ts",
      content: `
const user = await getUser(id)  // Get the user
`
    })
    
    expect(result.hasExcessiveComments).toBe(true)
    expect(result.flaggedComments[0].reason).toBe("obvious")
  })
  
  test("should not flag BDD comments", async () => {
    const result = await runCommentChecker({
      filePath: "test.ts",
      content: `
// #given - a user exists
// #when - we delete the user
// #then - user should be gone
`
    })
    
    expect(result.hasExcessiveComments).toBe(false)
  })
  
  test("should not flag JSDoc", async () => {
    const result = await runCommentChecker({
      filePath: "test.ts",
      content: `
/**
 * Gets a user by ID.
 * @param id - User ID
 */
`
    })
    
    expect(result.hasExcessiveComments).toBe(false)
  })
})
```

---

## Adoption Checklist

- [ ] Create comment extraction logic for your languages
- [ ] Define exception patterns (BDD, docstrings, directives)
- [ ] Implement AI slop detection rules
- [ ] Hook into file write operations
- [ ] Format helpful warning messages
- [ ] Test with real AI-generated code

---

## See Also

- [03-anti-pattern-awareness.md](./03-anti-pattern-awareness.md) - Full anti-pattern list
- [02-evidence-requirements.md](./02-evidence-requirements.md) - Code quality verification
- [../05-eval-methodology.md](../05-eval-methodology.md) - Full evaluation methodology
