# Sisyphus Junior Agent

**Cost:** MODERATE  
**Mode:** Subagent (executor)  
**Model:** anthropic/claude-sonnet-4-5  
**Source:** `src/agents/sisyphus-junior.ts`  
**Added:** v3.1+

---

## Overview

Sisyphus Junior is the focused task executor — it receives delegated work from orchestrators (Sisyphus or Atlas) and executes it precisely. Unlike Sisyphus, Junior does NOT delegate to other agents (except explore/librarian via `call_omo_agent`).

**Key Characteristics:**
- Subagent mode (invoked by orchestrator)
- Default model: claude-sonnet-4-5
- Extended thinking: 32k budget (GPT: `reasoningEffort: medium`)
- Tool restrictions: denies `task`/`delegate_task`, allows `call_omo_agent`
- Follows instructions exactly — no autonomous decision-making
- Todo discipline and verification requirements

---

## When to Use

| Scenario | Example |
|----------|---------|
| Delegated code writing | "Add User model to schema" |
| Focused task execution | "Fix type error in auth.ts" |
| Test creation | "Write tests for payment service" |
| Single-scope implementation | Any atomic task from a plan |

## When NOT to Use

- Multi-step orchestration (use Sisyphus/Atlas)
- Architecture decisions (use Oracle)
- Codebase exploration (use Explore)
- External docs lookup (use Librarian)

---

## Implementation

```typescript
export function createSisyphusJuniorAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "task",
    "delegate_task",
  ])
  // Allows call_omo_agent for explore/librarian access

  return {
    description:
      "Focused task executor. Executes specific tasks without delegation capabilities.",
    mode: "subagent" as const,
    model: model || "anthropic/claude-sonnet-4-5",
    temperature: 0.1,
    ...restrictions,
    prompt: JUNIOR_SYSTEM_PROMPT,
    thinking: { type: "enabled", budgetTokens: 32000 },
  }
}
```

---

## System Prompt (Key Sections)

### Core Behavior

```markdown
You are a focused executor. You receive tasks and complete them.

## What You Do:
- Execute the specific task given to you
- Write clean, production-quality code
- Verify your work with diagnostics and tests
- Track progress with todos

## What You DON'T Do:
- Delegate to other agents (you can't)
- Make architectural decisions autonomously
- Add features not explicitly requested
- Skip verification
```

### Todo Discipline

```markdown
## Todo Management
- Create todos BEFORE starting any multi-step task
- Mark in_progress before starting (only ONE at a time)
- Mark completed IMMEDIATELY after finishing
- NEVER batch completions
```

### Verification Requirements

```markdown
## Evidence Requirements
| Action | Evidence |
|--------|----------|
| File edit | lsp_diagnostics clean |
| Build | Exit code 0 |
| Tests | All pass |

NO EVIDENCE = NOT COMPLETE
```

### Concise Style

```markdown
## Communication
- Start work immediately
- No acknowledgments or preamble
- Report results, not process
- One word answers acceptable
```

---

## Tool Access

| Tool Category | Access |
|---------------|--------|
| Read tools (Read, Grep, Glob, LSP) | YES |
| Write tools (Write, Edit) | YES |
| Bash | YES |
| call_omo_agent (explore/librarian) | YES |
| delegate_task | NO (blocked) |
| task | NO (blocked) |

---

## Usage Pattern

```typescript
// Called by Sisyphus or Atlas via delegate_task
delegate_task(
  category: "quick",  // or "unspecified-low", "unspecified-high"
  load_skills: ["git-master"],
  prompt: `
## 1. TASK
Add deleteUser function to src/services/user.ts

## 2. EXPECTED OUTCOME
- Function added with soft delete pattern
- Test added in user.test.ts

## 3. REQUIRED TOOLS
- Read, Edit, Bash

## 4. MUST DO
- Follow existing function patterns
- Add error handling

## 5. MUST NOT DO
- Do NOT modify other files
- Do NOT add dependencies

## 6. CONTEXT
- See createUser (line 45-67) for pattern
`
)
```

---

## Key Differences from Sisyphus

| Aspect | Sisyphus (Orchestrator) | Junior (Executor) |
|--------|------------------------|-------------------|
| **Mode** | Primary | Subagent |
| **Model** | Opus 4.5 | Sonnet 4.5 |
| **Delegation** | Full delegate_task access | No delegation (except call_omo_agent) |
| **Scope** | Full workflow | Single atomic task |
| **Decision-making** | Autonomous | Follows instructions |
| **Cost** | Expensive | Moderate |
