# Pattern 02: Evidence Requirements

**Effort:** 30 minutes | **Impact:** High | **Level:** Quick Win  
**Source:** [05-eval-methodology.md](../05-eval-methodology.md)

---

## The Problem

Agents claim completion when tasks are partially done or broken.

**Example of the problem:**
```
Agent: "Done! I've implemented the new feature."
Reality: 
- Build fails with 3 type errors
- Tests don't pass
- Missing edge case handling
```

---

## The Solution

Define what constitutes "evidence of completion" and require it for every task.

**Core Principle:** NO EVIDENCE = NOT COMPLETE

---

## Evidence Matrix

| Action | Required Evidence | How to Verify |
|--------|-------------------|---------------|
| File edit | `lsp_diagnostics` shows 0 errors | Run LSP check on changed files |
| Build | Exit code 0 | `npm run build` or equivalent |
| Tests | All pass | `npm test` or equivalent |
| Delegation | Result verified | Check delegated work independently |

---

## Implementation

### Add to Task Prompts

```markdown
## Evidence Requirements (ALL required for completion)

| Action | Required Evidence |
|--------|-------------------|
| File edit | `lsp_diagnostics` shows 0 errors on changed files |
| Build | `npm run build` exits with code 0 |
| Tests | `npm test` shows all tests pass |
| Delegation | Result received AND independently verified |

**NO EVIDENCE = NOT COMPLETE.**
```

### Verification Process

```markdown
### Verification:

Run `lsp_diagnostics` on changed files at:
- End of a logical task unit
- Before marking a todo item complete
- Before reporting completion to user

If project has build/test commands, run them at task completion.
```

### Verification Script Template

```bash
#!/bin/bash
# verify-completion.sh

set -e  # Exit on first error

echo "=== VERIFICATION START ==="

echo "1. Checking LSP diagnostics..."
# Your LSP check command here
# Example: npx tsc --noEmit

echo "2. Running build..."
npm run build

echo "3. Running tests..."
npm test

echo "=== ALL CHECKS PASSED ==="
```

---

## Failure Recovery Protocol

When verification fails:

### After 1-2 Failures:
1. Fix the specific error
2. Re-run verification
3. Continue if pass

### After 3 Consecutive Failures:
1. **STOP** all further edits immediately
2. **REVERT** to last known working state
3. **DOCUMENT** what was attempted and what failed
4. **CONSULT** higher-level agent or user
5. Do NOT continue hoping it will work

### Never:
- Leave code in broken state
- Continue making changes when verification fails
- Delete failing tests to "pass"
- Skip verification "just this once"

---

## Real Example

```typescript
// After making changes to user.ts
async function verifyCompletion() {
  // 1. Check LSP diagnostics
  const diagnostics = await lsp_diagnostics(['src/services/user.ts'])
  if (diagnostics.errors.length > 0) {
    throw new Error(`Diagnostics not clean: ${diagnostics.errors}`)
  }
  
  // 2. Check build
  const build = await bash('npm run build')
  if (build.exitCode !== 0) {
    throw new Error(`Build failed: ${build.stderr}`)
  }
  
  // 3. Check tests
  const tests = await bash('npm test src/services/user.test.ts')
  if (tests.exitCode !== 0) {
    throw new Error(`Tests failed: ${tests.stderr}`)
  }
  
  // Only now is the task complete
  console.log('All evidence collected. Task complete.')
}
```

---

## Handling Pre-existing Failures

Sometimes you'll find failures that existed before your changes:

```markdown
## When Pre-existing Failures Exist

1. **Document them**: "Note: found N pre-existing lint errors unrelated to my changes"
2. **Don't fix unless asked**: Your scope is your task
3. **Verify your changes don't add new failures**: Compare before/after
4. **Report completion with caveat**: "Done. Note: 3 pre-existing test failures remain."
```

---

## Adoption Checklist

- [ ] Add evidence requirements section to your task prompts
- [ ] Define what verification commands to run for your project
- [ ] Create verification script if helpful
- [ ] Establish failure recovery protocol
- [ ] Never mark complete without evidence

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Only checking at the end | Check after each logical unit |
| Ignoring LSP diagnostics | Always run LSP on changed files |
| Skipping tests "because they're slow" | Tests are evidence, not optional |
| Trusting agent's "I verified" claim | Run verification yourself |

---

## See Also

- [01-blocking-checkpoints.md](./01-blocking-checkpoints.md) - Force analysis before execution
- [11-todo-continuation.md](./11-todo-continuation.md) - System-level verification
- [../05-eval-methodology.md](../05-eval-methodology.md) - Full evaluation methodology
