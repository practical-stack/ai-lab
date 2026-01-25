# Prompt Engineering Patterns

**Document:** 04-prompt-engineering.md  
**Part of:** Oh-My-OpenCode Repository Analysis  
**Source:** `sisyphus-prompt.md`, `src/features/builtin-skills/`, `src/hooks/`, `05-eval-methodology.md`

---

## Overview

Oh-My-OpenCode employs sophisticated prompt engineering techniques to control AI agent behavior reliably. This document covers six major patterns plus evaluation mechanisms that ensure agents follow instructions.

---

## Pattern 1: XML Tag Structure (Semantic Sections)

### Description

XML tags create semantic boundaries that help AI models parse and prioritize different types of instructions.

### Tags Used

| Tag | Purpose | Behavioral Effect |
|-----|---------|-------------------|
| `<Role>` | Agent identity | Defines personality, operating mode |
| `<Behavior_Instructions>` | How to act | Main behavioral guidelines |
| `<Constraints>` | Hard rules | Non-negotiable restrictions |
| `<critical_warning>` | Absolute rules | Treated as failure conditions |
| `<parallel_analysis>` | Phase marker | Commands run simultaneously |
| `<style_detection>` | Mandatory output phase | Output required before proceeding |
| `<atomic_planning>` | Commit planning phase | Splitting logic |
| `<skill-instruction>` | Skill content wrapper | Injected by loader |
| `<user-request>` | User's request | After skill instruction |

### Example: Role Definition

```xml
<Role>
You are "Sisyphus" - Powerful AI Agent with orchestration capabilities.

**Why Sisyphus?**: Humans roll their boulder every day. So do you.

**Identity**: SF Bay Area engineer. Work, delegate, verify, ship. No AI slop.

**Core Competencies**:
- Parsing implicit requirements from explicit requests
- Adapting to codebase maturity
- Delegating specialized work to subagents
- Parallel execution for maximum throughput
</Role>
```

### Example: Critical Warning

```xml
<critical_warning>
NEVER use `as any`, `@ts-ignore`, or `@ts-expect-error`.
Type safety is non-negotiable. If you violate this, the entire task fails.
</critical_warning>
```

### Why This Works

1. **Visual Separation**: Tags create clear boundaries between sections
2. **Priority Signaling**: `<critical_warning>` treated more seriously than regular text
3. **Parseability**: AI can identify and extract specific sections
4. **Nesting**: Allows hierarchical instruction structures

---

## Pattern 2: SKILL.md Format (YAML Frontmatter + Markdown Body)

### Description

Skills use YAML frontmatter for machine-readable metadata and Markdown for human/AI-readable instructions.

### Structure

```yaml
---
name: skill-name                    # Required: kebab-case identifier
description: |
  When to use this skill.
  USE WHEN: keyword triggers
  DO NOT USE WHEN: exclusions
mcp:                               # Optional: embedded MCP config
  server-name:
    command: npx
    args: ["@package/name"]
---
# Skill Title

[Markdown instructions for the AI]
```

### Frontmatter Schema

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Unique skill identifier (kebab-case) |
| `description` | Yes | Trigger phrases and usage guidance |
| `mcp` | No | Embedded MCP server configuration |
| `model` | No | Override model for this skill |
| `agent` | No | Agent to use for this skill |
| `allowed-tools` | No | Tool whitelist for this skill |

### Skill Loading (XML Wrapping)

From `src/features/opencode-skill-loader/loader.ts`:

```typescript
const templateContent = `<skill-instruction>
Base directory for this skill: ${resolvedPath}/
File references (@path) in this skill are relative to this directory.

${body.trim()}
</skill-instruction>

<user-request>
$ARGUMENTS
</user-request>`
```

### Real Example: git-master Skill

```yaml
---
name: git-master
description: |
  MUST USE for ANY git operations. Atomic commits, rebase/squash, 
  history search (blame, bisect, log -S).
  
  Triggers: 'commit', 'rebase', 'squash', 'who wrote', 
  'when was X added', 'find the commit that'.
---
# Git Master

## Philosophy
Atomic commits. One logical change per commit. 3+ files = split required.

## Phase 1: Style Detection (BLOCKING)
...
```

---

## Pattern 3: BLOCKING Checkpoints (Mandatory Output Pattern)

### Description

BLOCKING checkpoints force AI to produce intermediate outputs before proceeding. This prevents LLMs from skipping "unimportant" analysis steps.

### Why LLMs Skip Steps

| Behavior | Cause | Consequence |
|----------|-------|-------------|
| Skip analysis | Eager to produce final output | Wrong output based on assumptions |
| Combine phases | Context compression | Lose important intermediate insights |
| Omit verification | Task completion bias | Errors go undetected |

### BLOCKING Pattern Structure

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

| Element | Purpose | Example |
|---------|---------|---------|
| Section header warning | Alert at entry | `(BLOCKING - MUST OUTPUT BEFORE PROCEEDING)` |
| Bold emphasis | Immediate attention | `**THIS PHASE HAS MANDATORY OUTPUT**` |
| Template output block | Show exact format | Pre-formatted template |
| NO EXCEPTIONS | Eliminate edge-case reasoning | "NO EXCEPTIONS" text |
| Consequence warning | Fear of failure | "IF YOU SKIP... STOP AND REDO." |

### Verification Checklist Example

```markdown
## FINAL CHECK BEFORE EXECUTION (BLOCKING)

```
STOP AND VERIFY - Do not proceed until ALL boxes checked:

[] File count check: N files -> at least ceil(N/3) commits?
   - 3 files -> min 1 commit
   - 5 files -> min 2 commits
   - 10 files -> min 4 commits

[] Justification check: For each commit with 3+ files, did I write WHY?

[] Directory split check: Different directories -> different commits?

[] Test pairing check: Each test with its implementation?
```

**HARD STOP CONDITIONS:**
- Making 1 commit from 3+ files -> **WRONG. SPLIT.**
- Making 2 commits from 10+ files -> **WRONG. SPLIT MORE.**
```

---

## Pattern 4: System Directives (Injection Format)

### Description

System-generated messages use a consistent prefix format for programmatic control. These are injected by hooks to modify agent behavior at runtime.

### Format

```typescript
// Standard format
"[SYSTEM DIRECTIVE: OH-MY-OPENCODE - {TYPE}]"

// Examples
"[SYSTEM DIRECTIVE: OH-MY-OPENCODE - TODO CONTINUATION]"
"[SYSTEM DIRECTIVE: OH-MY-OPENCODE - RALPH LOOP]"
```

### Directive Types

| Type | Purpose | Trigger |
|------|---------|---------|
| `TODO_CONTINUATION` | Force work on remaining todos | Session idle with incomplete todos |
| `RALPH_LOOP` | Self-referential loop until done | `/ralph-loop` command |
| `BOULDER_CONTINUATION` | Persistent task continuation | Sisyphus mode |
| `DELEGATION_REQUIRED` | Force delegation to specialist | Task requires expert |
| `SINGLE_TASK_ONLY` | Restrict to one task | Prevent scope creep |
| `COMPACTION_CONTEXT` | Context window management | Approaching token limit |
| `CONTEXT_WINDOW_MONITOR` | Token usage monitoring | Continuous monitoring |
| `PROMETHEUS_READ_ONLY` | Planning mode only | Planning phase |

### Implementation: Todo Continuation

From `src/hooks/todo-continuation-enforcer.ts`:

```typescript
const CONTINUATION_PROMPT = `${createSystemDirective(SystemDirectiveTypes.TODO_CONTINUATION)}

Incomplete tasks remain in your todo list. Continue working on the next pending task.

- Proceed without asking for permission
- Mark each task complete when finished
- Do not stop until all tasks are done`

// Hook injects this when session goes idle with incomplete todos
"session.idle": async (input) => {
  const todos = await getTodos(input.sessionID)
  const incomplete = todos.filter(t => t.status !== "completed")
  
  if (incomplete.length > 0) {
    await injectMessage(CONTINUATION_PROMPT)
  }
}
```

### Why Consistent Format Matters

1. **Filtering**: Can identify system messages vs user messages
2. **Priority**: System directives take precedence
3. **Debugging**: Clear source of each directive
4. **Composability**: Multiple directives can coexist

---

## Pattern 5: Dynamic Prompt Generation

### Description

Prompts are dynamically built from available resources (agents, skills, tools, categories) rather than hardcoded.

### Implementation

From `src/agents/sisyphus.ts`:

```typescript
function buildDynamicSisyphusPrompt(
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[]
): string {
  return `
<Role>
You are Sisyphus...
</Role>

<Available_Agents>
${availableAgents.map(a => `- ${a.name}: ${a.description}`).join('\n')}
</Available_Agents>

<Available_Categories>
${availableCategories.map(c => `| ${c.name} | ${c.model} | ${c.useCase} |`).join('\n')}
</Available_Categories>

<Available_Skills>
${availableSkills.map(s => `- ${s.name}: ${s.description}`).join('\n')}
</Available_Skills>

<Behavior_Instructions>
...
</Behavior_Instructions>
  `
}
```

### Generated Sections

| Section | Content | Purpose |
|---------|---------|---------|
| Available Agents | Agent names + descriptions | Know what can be delegated |
| Available Categories | Categories + models + use cases | Know routing options |
| Available Skills | Skills + triggers | Know what knowledge exists |
| Full System Prompt | Complete behavioral spec | Define agent behavior |

### Why Dynamic Generation

| Benefit | Explanation |
|---------|-------------|
| **Accuracy** | Prompt matches actual capabilities |
| **Extensibility** | Add skills/agents without editing prompts |
| **Deployment Flexibility** | Different deployments have different resources |
| **Single Source of Truth** | No mismatch between code and prompt |

---

## Pattern 6: BDD Comments for Testing

### Description

Tests use BDD (Behavior-Driven Development) comments that are preserved even through AI generation, ensuring test clarity.

### Format

```typescript
// #given - initial state/preconditions
// #when - action being tested
// #then - expected outcome
```

### Real Example

From `src/hooks/todo-continuation-enforcer.test.ts`:

```typescript
describe("Todo Continuation Enforcer", () => {
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
})
```

### Why BDD Comments

| Benefit | Explanation |
|---------|-------------|
| **Readability** | Clear structure for any reader |
| **AI Preservation** | Comment Checker ignores BDD comments |
| **Documentation** | Tests document behavior |
| **Consistency** | Same format across all tests |

---

## Evaluation: How Oh-My-OpenCode Verifies Prompt Compliance

Oh-My-OpenCode doesn't just write good prompts—it verifies that agents follow them. See [05-eval-methodology.md](./05-eval-methodology.md) for complete details.

### Evaluation Layers

| Layer | Method | What It Catches |
|-------|--------|-----------------|
| **System-Level** | Todo Continuation Enforcer | Incomplete task claims |
| **Code Quality** | Comment Checker | AI slop (excessive comments) |
| **Environment** | Doctor Health Checks | Configuration issues |
| **Skill-Level** | BLOCKING Checkpoints | Skipped analysis phases |
| **Unit Testing** | BDD-style Tests | Component behavior |

### Todo Continuation Enforcer

**Purpose:** Verify task completion independent of agent claims.

**How It Works:**
```typescript
// 1. Session goes idle
"session.idle": async (input) => {
  // 2. Check todo state (independent verification)
  const todos = await getTodos(input.sessionID)
  const incomplete = todos.filter(t => t.status !== "completed")
  
  // 3. Safety checks
  if (state?.isRecovering) return  // Skip in recovery
  if (hasRunningBgTasks) return    // Wait for background tasks
  if (skipAgents.includes(agent)) return  // Some agents exempt
  
  // 4. Inject continuation if incomplete
  if (incomplete.length > 0) {
    await injectPrompt(CONTINUATION_PROMPT)
  }
}
```

### Comment Checker

**Purpose:** Detect and warn about AI slop (excessive comments).

**How It Works:**
```typescript
// Hook into file write operations
"tool.execute.after": async (input, output) => {
  // Only check Write/Edit tools
  if (!["write", "edit"].includes(input.tool.toLowerCase())) return
  
  // Skip if tool failed
  if (output.output.includes("error:")) return
  
  // Run external comment checker CLI
  const result = await runCommentChecker({
    file_path: input.args.filePath,
    content: input.args.content
  })
  
  if (result.hasExcessiveComments) {
    await showWarning(result.message)
  }
}
```

**Smart Exceptions:**
- BDD comments (`#given`, `#when`, `#then`)
- Docstrings (JSDoc, Python docstrings)
- Directive comments (`// eslint-disable`, `// @ts-ignore`)

### Doctor Health Checks

**Purpose:** Validate entire environment before running.

**Check Categories:**
```typescript
type CheckCategory =
  | "installation"    // OpenCode, plugin installed
  | "configuration"   // Config file valid
  | "authentication"  // API keys configured
  | "dependencies"    // AST-Grep, Comment Checker binaries
  | "tools"           // LSP, MCP servers
  | "updates"         // Version comparison
```

### Evidence Requirements

| Action | Required Evidence | How Verified |
|--------|-------------------|--------------|
| File edit | `lsp_diagnostics` clean | Tool call after edit |
| Build | Exit code 0 | Bash tool result |
| Tests | Pass | Bash tool result |
| Delegation | Result verified | Orchestrator checks |

---

## TypeScript vs Markdown Decision Matrix

When should a skill be inline TypeScript vs separate SKILL.md?

| Criteria | TypeScript (`skills.ts`) | Separate SKILL.md |
|----------|--------------------------|-------------------|
| Length | < 100 lines | > 100 lines |
| Complexity | Simple template | Multi-phase workflow |
| MCP Config | Inline in object | Frontmatter or `mcp.json` |
| Updates | Rare, stable | Frequent iteration |
| Sharing | Internal only | May be extracted |

### Examples

| Skill | Format | Reason |
|-------|--------|--------|
| `playwright` | TypeScript | Short, stable |
| `agent-browser` | TypeScript | Command reference, ~150 lines |
| `git-master` | SKILL.md | 1100+ lines, complex phases |
| `frontend-ui-ux` | SKILL.md | Detailed workflow, iterating |

### Migration Pattern

```
Start: Inline in TypeScript
  ↓
Exceeds 200 lines?
  → Extract to SKILL.md
  
Has BLOCKING checkpoints?
  → Extract to SKILL.md
  
Needs sharing/versioning?
  → Extract to SKILL.md
```

---

## Summary: Prompt Engineering Principles

| Principle | Implementation | Effect |
|-----------|----------------|--------|
| **Semantic Structure** | XML tags | Clear priority, parseability |
| **Machine Metadata** | YAML frontmatter | Automated processing |
| **Forced Outputs** | BLOCKING checkpoints | No skipped analysis |
| **Runtime Control** | System directives | Programmatic behavior modification |
| **Accurate Context** | Dynamic generation | Prompt matches capabilities |
| **Clear Testing** | BDD comments | Readable, preserved tests |
| **Independent Verification** | Evaluation hooks | Don't trust, verify |

---

## See Also

- [02-design-patterns.md](./02-design-patterns.md) - 7-section delegation prompt pattern
- [03-anti-patterns.md](./03-anti-patterns.md) - What prompts should prevent
- [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) - How to apply these prompt patterns
- [05-eval-methodology.md](./05-eval-methodology.md) - Complete evaluation methodology details
- [06-agents-skills-reference/](./06-agents-skills-reference/) - Concrete examples
