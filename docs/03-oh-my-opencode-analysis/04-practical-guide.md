# Practical Guide: Applying Oh-My-OpenCode Patterns

**Document:** 04-practical-guide.md  
**Part of:** Oh-My-OpenCode Repository Analysis  
**Purpose:** Step-by-step guide to adopting these patterns in your own projects

---

## Overview

This document transforms the patterns from [02-design-patterns.md](./02-design-patterns.md) into actionable steps you can implement today. Unlike the other documents that explain WHAT the patterns are, this guide shows you HOW to adopt them.

---

## Adoption Path: Start Here

### Level 1: Quick Wins (1 day)

Patterns you can implement immediately with minimal setup:

| Pattern | Effort | Impact | How |
|---------|--------|--------|-----|
| BLOCKING Checkpoints | 1 hour | High | Add mandatory output templates to prompts |
| Evidence Requirements | 30 min | High | Always verify: LSP clean, build pass, tests pass |
| Explicit MUST NOT | 15 min | Medium | Add forbidden actions to every prompt |

### Level 2: Foundation (1 week)

Patterns that require some infrastructure:

| Pattern | Effort | Impact | How |
|---------|--------|--------|-----|
| Hierarchical AGENTS.md | 2-3 hours | High | Create per-module documentation |
| 7-Section Delegation | 1 hour | High | Use template for all subagent prompts |
| Session Continuity | 2 hours | Medium | Track and reuse session_ids |

### Level 3: Full System (2+ weeks)

Patterns that need significant infrastructure:

| Pattern | Effort | Impact | How |
|---------|--------|--------|-----|
| Todo Continuation Enforcer | 1-2 days | Very High | Build hook to verify completion |
| Multi-Agent Architecture | 1 week | Very High | Separate planning from execution |
| Comment Checker | 1 day | Medium | Build or integrate AI slop detection |

---

## Pattern 1: BLOCKING Checkpoints

**Effort:** 1 hour | **Impact:** High

### The Problem

AI agents skip analysis phases and jump straight to execution, producing low-quality work.

### The Solution

Mark phases as BLOCKING - the agent MUST output specific information before proceeding.

### Implementation Template

```markdown
## PHASE N: [Name] (BLOCKING - MUST OUTPUT BEFORE PROCEEDING)

**THIS PHASE HAS MANDATORY OUTPUT**

### N.1 [Steps to execute]

[What the agent should do]

### N.2 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding. NO EXCEPTIONS.**

```
[EXACT OUTPUT TEMPLATE]
=======================
Field 1: [value]
Field 2: [value]
Analysis: [what you found]
Decision: [what you'll do next]
```

**IF YOU SKIP THIS OUTPUT, [specific consequence]. STOP AND REDO.**
```

### Real Example: Code Review

```markdown
## PHASE 1: Initial Analysis (BLOCKING - MUST OUTPUT BEFORE REVIEWING)

**THIS PHASE HAS MANDATORY OUTPUT**

### 1.1 Read all changed files
- Open each file in the PR
- Note file count and types
- Identify the main change

### 1.2 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before Phase 2. NO EXCEPTIONS.**

```
INITIAL ANALYSIS
================
Files changed: N
File types: [list]
Main change: [one sentence]
Risk areas: [list potential issues to investigate]
```

**IF YOU SKIP THIS, YOU WILL MISS CRITICAL ISSUES. STOP AND REDO.**
```

### Adoption Checklist

- [ ] Identify phases where agents skip analysis
- [ ] Create mandatory output template for each
- [ ] Add "IF YOU SKIP..." warning
- [ ] Test with real prompts

---

## Pattern 2: 7-Section Delegation Prompt

**Effort:** 1 hour | **Impact:** High

### The Problem

Subagents are stateless - they know NOTHING except what you tell them. Incomplete prompts = incomplete work.

### The Solution

Always include all 7 sections in delegation prompts.

### Implementation Template

```markdown
## 1. TASK
[Quote exact goal. Be obsessively specific. One action only.]

## 2. EXPECTED OUTCOME
- [ ] Files: [exact paths created/modified]
- [ ] Behavior: [what it should do]
- [ ] Verification: `[command]` passes

## 3. REQUIRED SKILLS
- [skill-1]: [why needed]
- [skill-2]: [why needed]

## 4. REQUIRED TOOLS
- [tool-1]: [what to use it for]
- [tool-2]: [what to use it for]

## 5. MUST DO
- [Exhaustive list of requirements]
- [Leave NOTHING implicit]
- [Include obvious things]

## 6. MUST NOT DO
- Do NOT [forbidden action 1]
- Do NOT [forbidden action 2]
- Do NOT [anticipate rogue behavior]

## 7. CONTEXT
- File patterns: [existing conventions]
- Dependencies: [what previous tasks built]
- Constraints: [technical limitations]
```

### Minimum Length Rule

**If your delegation prompt is under 30 lines, it's TOO SHORT.**

### Real Example

```markdown
## 1. TASK
Add a "deleteUser" function to src/services/user.ts

## 2. EXPECTED OUTCOME
- [ ] Files: src/services/user.ts modified
- [ ] Function: deleteUser(id: string): Promise<void>
- [ ] Verification: `bun test src/services/user.test.ts` passes

## 3. REQUIRED SKILLS
- None required

## 4. REQUIRED TOOLS
- Read: To read existing user.ts
- Edit: To add the function
- Bash: To run tests

## 5. MUST DO
- Follow existing function patterns in user.ts
- Add proper error handling (throw UserNotFoundError)
- Soft delete (set deletedAt) not hard delete
- Add corresponding test in user.test.ts
- Use same naming convention as getUser, updateUser

## 6. MUST NOT DO
- Do NOT modify other files
- Do NOT add new dependencies
- Do NOT change existing functions
- Do NOT use hard delete (we need audit trail)

## 7. CONTEXT
- Pattern: See createUser (line 45-67) for reference
- Database: Using Prisma, soft delete pattern
- Tests: BDD style with #given, #when, #then
```

### Adoption Checklist

- [ ] Create template file for delegation prompts
- [ ] Review existing delegations for missing sections
- [ ] Add minimum length check to your workflow
- [ ] Include concrete file paths and line numbers

---

## Pattern 3: Evidence Requirements

**Effort:** 30 minutes | **Impact:** High

### The Problem

Agents claim completion when tasks are partially done or broken.

### The Solution

Define what constitutes "evidence of completion" and require it.

### Implementation

Add this to every task completion:

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

### Verification Script Template

```bash
#!/bin/bash
# verify-completion.sh

echo "Checking LSP diagnostics..."
# Your LSP check here

echo "Running build..."
npm run build || { echo "BUILD FAILED"; exit 1; }

echo "Running tests..."
npm test || { echo "TESTS FAILED"; exit 1; }

echo "All checks passed!"
```

### Adoption Checklist

- [ ] Define evidence requirements for your project
- [ ] Add verification step to all task completions
- [ ] Never mark complete without evidence

---

## Pattern 4: Hierarchical AGENTS.md

**Effort:** 2-3 hours | **Impact:** High

### The Problem

AI agents don't know your codebase. Reading every file wastes tokens.

### The Solution

Each module has its own AGENTS.md explaining itself to AI.

### Implementation

Create this structure:

```
project/
├── AGENTS.md                 # Project overview, global rules
├── src/
│   ├── auth/
│   │   ├── AGENTS.md         # Auth module specifics
│   │   └── ...
│   ├── database/
│   │   ├── AGENTS.md         # Database module specifics
│   │   └── ...
```

### Module AGENTS.md Template

```markdown
# [Module Name]

## Purpose
What this module does and why it exists.

## Key Files

| File | Purpose |
|------|---------|
| main.ts | Entry point |
| types.ts | Type definitions |
| utils.ts | Helper functions |

## Patterns to Follow
- [Pattern 1]: When adding new [X], follow [file:lines]
- [Pattern 2]: Error handling uses [approach]

## Constraints (MUST NOT)
- Do NOT [forbidden action] - [reason]
- Do NOT [forbidden action] - [reason]

## Extension Points
How to add new functionality:
1. [Step 1]
2. [Step 2]

## Testing
- Tests in `*.test.ts` alongside source
- Run: `npm test src/[module]`
```

### Adoption Checklist

- [ ] Create root AGENTS.md with project overview
- [ ] Identify 3-5 key modules
- [ ] Create AGENTS.md for each module
- [ ] Include patterns AND constraints

---

## Pattern 5: Session Continuity

**Effort:** 2 hours | **Impact:** Medium

### The Problem

Starting fresh for follow-ups wastes ~70% tokens and loses context.

### The Solution

Store and reuse session_id for all follow-up work.

### Implementation

```typescript
// Store session_id from every delegation
const result = await delegate_task({
  category: "quick",
  prompt: "Add User model..."
})
// result.session_id = "ses_abc123"

// For follow-ups, ALWAYS use session_id
await delegate_task({
  session_id: "ses_abc123",  // Continue session
  prompt: "Fix: Missing email field"
})
```

### When to Use Session Continuity

| Scenario | Action |
|----------|--------|
| Task failed | `session_id="{id}", prompt="Fix: {error}"` |
| Need follow-up | `session_id="{id}", prompt="Also: {question}"` |
| Verification failed | `session_id="{id}", prompt="Failed: {error}. Fix."` |
| Related work | Same `session_id` for same topic |

### Adoption Checklist

- [ ] Track session_id from every delegation
- [ ] Use session_id for all follow-ups
- [ ] Never start fresh when continuation is possible

---

## Pattern 6: Todo Continuation Enforcer

**Effort:** 1-2 days | **Impact:** Very High

### The Problem

Agents claim "I'm done" when todos remain incomplete.

### The Solution

Build a hook that checks todo state and injects continuation prompts.

### Conceptual Implementation

```typescript
// Hook into session idle event
onSessionIdle(async (session) => {
  const todos = await getTodos(session.id)
  const incomplete = todos.filter(t => 
    t.status !== "completed" && t.status !== "cancelled"
  )
  
  if (incomplete.length > 0) {
    // Inject continuation prompt
    await injectPrompt(`
      [SYSTEM DIRECTIVE: TODO CONTINUATION]
      
      Incomplete tasks remain in your todo list.
      Continue working on the next pending task.
      
      - Proceed without asking for permission
      - Mark each task complete when finished
      - Do not stop until all tasks are done
    `)
  }
})
```

### Key Design Points

1. **Independent verification**: Check todo state, not agent claims
2. **Automatic injection**: No human needed to keep agent working
3. **Safety checks**: Skip if in recovery, background tasks running
4. **Persistence**: Agent can't escape by claiming completion

### Adoption Checklist

- [ ] Implement todo state tracking
- [ ] Build session idle detection
- [ ] Create continuation prompt injection
- [ ] Add safety checks (recovery mode, background tasks)

---

## Decision Framework

When adopting patterns, use this decision table:

| Situation | Pattern to Apply First |
|-----------|------------------------|
| Agents skip analysis | BLOCKING Checkpoints |
| Incomplete work | Evidence Requirements |
| Poor subagent output | 7-Section Delegation |
| Repeated context | Session Continuity |
| "I'm done" lies | Todo Continuation Enforcer |
| Unfamiliar codebase | Hierarchical AGENTS.md |

---

## Quick Start: Minimal Viable Adoption

If you only have time for 3 things:

### 1. Add BLOCKING to Your Main Prompt (15 min)

```markdown
## Analysis Phase (BLOCKING)

**MANDATORY OUTPUT:**
```
ANALYSIS
========
Request: [what was asked]
Scope: [what files/areas]
Approach: [how you'll do it]
```

**IF YOU SKIP THIS, YOUR WORK WILL BE WRONG.**
```

### 2. Add Evidence Requirements (5 min)

```markdown
## Completion Checklist
- [ ] LSP diagnostics clean
- [ ] Build passes
- [ ] Tests pass
- [ ] Changes verified manually

**NOT COMPLETE WITHOUT ALL CHECKED.**
```

### 3. Add MUST NOT Section (10 min)

```markdown
## MUST NOT
- Do NOT use `as any` or `@ts-ignore`
- Do NOT modify files outside scope
- Do NOT skip verification
- Do NOT claim done without evidence
```

---

## Summary: The 80/20 of Oh-My-OpenCode

| Pattern | Effort | Impact | Priority |
|---------|--------|--------|----------|
| BLOCKING Checkpoints | Low | High | **Do first** |
| Evidence Requirements | Low | High | **Do first** |
| 7-Section Delegation | Low | High | **Do first** |
| MUST NOT Section | Low | Medium | Do second |
| Hierarchical AGENTS.md | Medium | High | Do second |
| Session Continuity | Medium | Medium | Do third |
| Todo Continuation | High | Very High | Full adoption |

**Start with the first three. They'll transform your AI agent quality immediately.**

---

## See Also

- [02-design-patterns.md](./02-design-patterns.md) - Detailed pattern explanations
- [05-prompt-engineering.md](./05-prompt-engineering.md) - Prompt techniques
- [06-eval-methodology.md](./06-eval-methodology.md) - Verification systems
- [07-agents-skills-reference/](./07-agents-skills-reference/) - Concrete examples
