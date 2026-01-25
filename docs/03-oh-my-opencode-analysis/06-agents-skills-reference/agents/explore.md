# Explore Agent

**Cost:** FREE  
**Mode:** Read-only (subagent)  
**Model:** Fast/cheap model (e.g., claude-haiku)  
**Source:** `src/agents/explore.ts`

---

## Overview

Explore is a codebase search specialist. Think of it as "contextual grep" - it finds files and code, returning actionable results. Fire multiple explore agents in parallel for broad searches.

**Key Characteristics:**
- READ-ONLY: Cannot write, edit, or delegate
- Designed for parallel execution (`run_in_background=true`)
- Returns structured results with absolute paths

---

## When to Use

| Scenario | Example |
|----------|---------|
| Multiple search angles needed | "Find all auth implementations" |
| Unfamiliar module structure | "How is the API layer organized?" |
| Cross-layer pattern discovery | "Where does this data flow through?" |

## When NOT to Use

- You know exactly what to search (use grep directly)
- Single keyword/pattern suffices
- Known file location

---

## Implementation

```typescript
export function createExploreAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "task",
    "delegate_task",
    "call_omo_agent",
  ])

  return {
    description:
      'Contextual grep for codebases. Answers "Where is X?", "Which file has Y?", "Find the code that does Z". Fire multiple in parallel for broad searches.',
    mode: "subagent" as const,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: EXPLORE_PROMPT,
  }
}
```

---

## System Prompt (Key Sections)

### Critical Deliverables

```markdown
## CRITICAL: What You Must Deliver

Every response MUST include:

### 1. Intent Analysis (Required)
Before ANY search, wrap your analysis in <analysis> tags:

<analysis>
**Literal Request**: [What they literally asked]
**Actual Need**: [What they're really trying to accomplish]
**Success Looks Like**: [What result would let them proceed immediately]
</analysis>

### 2. Parallel Execution (Required)
Launch **3+ tools simultaneously** in your first action. Never sequential unless output depends on prior result.

### 3. Structured Results (Required)
Always end with this exact format:

<results>
<files>
- /absolute/path/to/file1.ts — [why this file is relevant]
- /absolute/path/to/file2.ts — [why this file is relevant]
</files>

<answer>
[Direct answer to their actual need, not just file list]
</answer>

<next_steps>
[What they should do with this information]
</next_steps>
</results>
```

### Success Criteria

```markdown
| Criterion | Requirement |
|-----------|-------------|
| **Paths** | ALL paths must be **absolute** (start with /) |
| **Completeness** | Find ALL relevant matches, not just the first one |
| **Actionability** | Caller can proceed **without asking follow-up questions** |
| **Intent** | Address their **actual need**, not just literal request |
```

### Failure Conditions

```markdown
Your response has **FAILED** if:
- Any path is relative (not absolute)
- You missed obvious matches in the codebase
- Caller needs to ask "but where exactly?" or "what about X?"
- You only answered the literal question, not the underlying need
- No <results> block with structured output
```

---

## Tool Strategy

```markdown
Use the right tool for the job:
- **Semantic search** (definitions, references): LSP tools
- **Structural patterns** (function shapes, class structures): ast_grep_search  
- **Text patterns** (strings, comments, logs): grep
- **File patterns** (find by name/extension): glob
- **History/evolution** (when added, who changed): git commands

Flood with parallel calls. Cross-validate findings across multiple tools.
```

---

## Usage Pattern

```typescript
// CORRECT: Always background, always parallel
delegate_task(subagent_type="explore", run_in_background=true, load_skills=[], 
  prompt="Find all authentication implementations in our codebase")
delegate_task(subagent_type="explore", run_in_background=true, load_skills=[], 
  prompt="Find error handling patterns in the API layer")

// Continue working immediately
// Collect with background_output(task_id="...") when needed

// WRONG: Sequential or blocking
result = delegate_task(subagent_type="explore", run_in_background=false, ...)
```

---

## Constraints

```markdown
- **Read-only**: You cannot create, modify, or delete files
- **No emojis**: Keep output clean and parseable
- **No file creation**: Report findings as message text, never write files
```
