# Design Patterns & Wisdom

**Document:** 02-design-patterns.md  
**Part of:** Oh-My-OpenCode Repository Analysis  
**Source:** `sisyphus-prompt.md`, `src/tools/delegate-task/`, `src/features/builtin-skills/`

---

## Overview

Oh-My-OpenCode implements several recurring patterns that embody its core philosophy. These patterns solve common problems in AI agent orchestration and are designed for reusability.

---

## Pattern 1: `createXXX()` Factory Pattern

### Description

All modules use factory functions for instantiation, enabling dependency injection, testability, and consistent initialization.

### Location

Found in all modules: agents, hooks, tools, features

### Structure

```typescript
// Standard factory pattern
export function createOracleAgent(
  config: OracleConfig,
  dependencies: OracleDependencies
): OracleAgent {
  // Validate inputs
  validateConfig(config)
  
  // Initialize with dependencies
  const agent: OracleAgent = {
    name: "oracle",
    model: config.model,
    systemPrompt: buildSystemPrompt(config),
    
    async invoke(input: string): Promise<string> {
      return dependencies.llm.complete(this.systemPrompt, input)
    }
  }
  
  return agent
}
```

### Examples from Codebase

| Factory | File | Purpose |
|---------|------|---------|
| `createOracleAgent()` | `src/agents/oracle.ts` | Oracle agent instance |
| `createTodoContinuationEnforcer()` | `src/hooks/todo-continuation-enforcer.ts` | Completion enforcer hook |
| `createBackgroundManager()` | `src/features/background-agent/manager.ts` | Background task manager |
| `createDelegateTaskTool()` | `src/tools/delegate-task/tools.ts` | Task delegation tool |

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Testability** | Easy to inject mocks for dependencies |
| **Consistency** | All modules follow same creation pattern |
| **Encapsulation** | Internal state hidden behind interface |
| **Configuration** | Clear separation of config from runtime |

### Anti-Pattern

```typescript
// BAD: Direct instantiation with hidden dependencies
const oracle = new OracleAgent()  // Where does LLM come from?
oracle.init(config)               // Two-phase init is error-prone

// GOOD: Factory with explicit dependencies
const oracle = createOracleAgent(config, { llm, logger })
```

---

## Pattern 2: Hierarchical AGENTS.md Documentation

### Description

Each module has its own AGENTS.md file that documents the module for AI agents. This creates a self-documenting codebase where AI agents can understand any module by reading its local documentation.

### Location

9 AGENTS.md files across the codebase

### Structure

```markdown
# Module Name

## Purpose
What this module does and why it exists.

## Key Files
| File | Purpose |
|------|---------|
| `main.ts` | Entry point |
| `utils.ts` | Helper functions |

## Extension Points
How to extend or modify this module.

## Constraints
What agents must NOT do when working with this module.
```

### Examples from Codebase

| File | Content |
|------|---------|
| `AGENTS.md` (root) | Project overview, philosophy, global constraints |
| `src/agents/AGENTS.md` | Agent system architecture, adding new agents |
| `src/hooks/AGENTS.md` | Hook lifecycle, creating new hooks |
| `src/tools/AGENTS.md` | Tool registry, creating new tools |

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Locality** | AI reads relevant docs without full codebase scan |
| **Maintainability** | Docs live with code, updated together |
| **Scalability** | Each module is self-contained |
| **Onboarding** | New (AI) agents understand quickly |

### How AI Agents Use It

```typescript
// When exploring a new module, AI reads:
// 1. Root AGENTS.md for project context
// 2. Module AGENTS.md for specific guidelines
// 3. Related files mentioned in AGENTS.md

// This provides complete context without reading entire codebase
```

---

## Pattern 3: 7-Section Delegation Prompt (CRITICAL)

### Description

Every delegation to a subagent MUST include seven specific sections. This ensures subagents have complete context since they are stateless and know nothing except what you tell them.

### Location

`sisyphus-prompt.md`

### Structure

```markdown
1. TASK: Atomic, specific goal (one action per delegation)
2. EXPECTED OUTCOME: Concrete deliverables with success criteria
3. REQUIRED SKILLS: Which skills to load
4. REQUIRED TOOLS: Explicit tool whitelist
5. MUST DO: Exhaustive requirements - leave NOTHING implicit
6. MUST NOT DO: Forbidden actions - anticipate rogue behavior
7. CONTEXT: File paths, existing patterns, constraints
```

### Example: Complete Delegation

```typescript
delegate_task(
  category: "quick",
  load_skills: ["git-master"],
  prompt: `
### 1. TASK
Add a User model to the Prisma schema.

### 2. EXPECTED OUTCOME
- User model added to prisma/schema.prisma
- Fields: id (uuid), email (unique), passwordHash, createdAt, updatedAt
- LSP diagnostics clean
- Schema valid (prisma validate passes)

### 3. REQUIRED SKILLS
- git-master: For atomic commit after changes

### 4. REQUIRED TOOLS
- Read: To read existing schema
- Edit: To modify schema
- Bash: To run prisma validate

### 5. MUST DO
- Follow existing model naming convention (PascalCase)
- Use same id pattern as other models (uuid)
- Include @map for snake_case database columns
- Add @@map for table name

### 6. MUST NOT DO
- Do NOT modify existing models
- Do NOT run migrations (only schema change)
- Do NOT add relations yet (separate task)
- Do NOT change prisma client config

### 7. CONTEXT
File: prisma/schema.prisma
Existing models: Post, Comment (follow their pattern)
Database: PostgreSQL
Prisma version: 5.x
`
)
```

### Why This Pattern

| Section | Purpose | Without It |
|---------|---------|------------|
| TASK | Clear atomic goal | Agent does wrong thing |
| EXPECTED OUTCOME | Success criteria | Agent stops early |
| REQUIRED SKILLS | Load needed knowledge | Agent lacks expertise |
| REQUIRED TOOLS | Tool whitelist | Agent uses wrong tools |
| MUST DO | Explicit requirements | Agent skips important steps |
| MUST NOT DO | Forbidden actions | Agent goes rogue |
| CONTEXT | File/pattern info | Agent reinvents patterns |

### Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Vague TASK | "Add user stuff" | "Add User model with fields X, Y, Z" |
| Missing MUST NOT | Agent refactors unrelated code | "Do NOT modify other files" |
| No CONTEXT | Agent creates incompatible patterns | "Follow pattern in existing models" |
| Multiple tasks | Agent confusion, incomplete work | One TASK per delegation |

---

## Pattern 4: Session Continuity

### Description

When delegating to subagents, always store and reuse `session_id` for follow-up work. This preserves full conversation context and saves ~70% tokens.

### Location

`delegate_task` tool in `src/tools/delegate-task/`

### Structure

```typescript
// First delegation
const result1 = delegate_task(
  category: "quick",
  prompt: "Add User model..."
)
// result1 includes: { session_id: "ses_abc123", output: "..." }

// Follow-up delegation (REUSES CONTEXT)
const result2 = delegate_task(
  session_id: "ses_abc123",  // <-- Continues previous session
  prompt: "Fix: Type error on line 42"
)
// Subagent has FULL context from first delegation
```

### When to Use

| Scenario | Action |
|----------|--------|
| Task failed/incomplete | `session_id="{id}", prompt="Fix: {specific error}"` |
| Need follow-up on result | `session_id="{id}", prompt="Also: {question}"` |
| Multi-turn with same agent | Always use `session_id` |
| Verification failed | `session_id="{id}", prompt="Failed verification: {error}. Fix."` |

### Benefits

| Benefit | Explanation |
|---------|-------------|
| **Token savings** | ~70% less tokens than fresh context |
| **Context preservation** | Subagent remembers what it tried |
| **Faster resolution** | No re-explaining the problem |
| **Better fixes** | Agent knows what didn't work |

### Anti-Pattern

```typescript
// BAD: Starting fresh loses all context
delegate_task(category: "quick", prompt: "Fix the type error in auth.ts...")
// Agent doesn't know what was already tried, may repeat mistakes

// GOOD: Resume preserves everything
delegate_task(session_id: "ses_abc123", prompt: "Fix: Type error on line 42")
// Agent knows the full history and can build on it
```

---

## Pattern 5: Background Task Pattern

### Description

Fire cheap exploration agents (explore/librarian) liberally in background, continue working, collect results when needed.

### Location

`src/features/background-agent/manager.ts`

### Structure

```typescript
// 1. Fire multiple agents in parallel
const task1 = delegate_task(agent: "explore", run_in_background: true,
  prompt: "Find auth middleware patterns...")
const task2 = delegate_task(agent: "explore", run_in_background: true,
  prompt: "Find user model location...")
const task3 = delegate_task(agent: "librarian", run_in_background: true,
  prompt: "Get JWT best practices...")

// 2. Continue working on other things...
// (The agents run in parallel)

// 3. Collect results when needed
const authPatterns = await background_output(task_id: task1.id)
const userModel = await background_output(task_id: task2.id)
const jwtDocs = await background_output(task_id: task3.id)

// 4. Before final answer, cancel any remaining
background_cancel(all: true)
```

### When to Use

| Situation | Action |
|-----------|--------|
| Need context from multiple angles | Fire parallel explore agents |
| External library involved | Fire librarian for docs |
| Unknown codebase structure | Fire explore to discover |
| Time-sensitive decision | Fire now, collect later |

### Key Rules

1. **Explore/Librarian = Cheap, fire liberally**
2. **Always run_in_background=true** for explore/librarian
3. **Continue working** while they run
4. **Cancel before final answer** to clean up

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Parallelism** | Multiple searches run simultaneously |
| **Time efficiency** | Don't wait for each search |
| **Comprehensive context** | Get info from multiple angles |
| **Cost effective** | Cheap agents for reconnaissance |

---

## Pattern 6: Phase-Based Workflow

### Description

Complex tasks are broken into phases with clear entry/exit criteria. Each phase must complete before the next begins.

### Location

`sisyphus-prompt.md`, skill files

### Structure

```markdown
## Phase 0: Intent Gate
Entry: User request received
Action: Classify request type, check for ambiguity
Exit: Clear understanding of task

## Phase 1: Assessment
Entry: Task classified
Action: Evaluate codebase state, identify patterns
Exit: Know what patterns to follow

## Phase 2A: Exploration
Entry: Assessment complete
Action: Gather context via explore/librarian
Exit: Have all needed information

## Phase 2B: Implementation
Entry: Context gathered
Action: Create todos, delegate work, verify
Exit: All todos complete, diagnostics clean

## Phase 3: Completion
Entry: Implementation done
Action: Final verification, cleanup
Exit: Task complete with evidence
```

### Example: Git Commit Workflow

From `git-master` skill:

```markdown
## Phase 1: Style Detection (BLOCKING)
- Analyze 30 recent commits
- Detect language (Korean/English)
- Detect style (semantic/plain)
- OUTPUT: Style detection result (MANDATORY)

## Phase 2: Analysis
- Review staged changes
- Count files, understand scope
- Identify logical groupings

## Phase 3: Planning (BLOCKING)
- Plan commit splits
- Verify atomic rule compliance
- OUTPUT: Commit plan (MANDATORY)

## Phase 4: Execution
- Execute commits in order
- Handle any failures

## Phase 5: Verification
- Verify clean working directory
- Review new history
- OUTPUT: Final report
```

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Prevents drift** | Clear boundaries keep agent on track |
| **Enables verification** | Each phase produces checkable output |
| **Supports recovery** | Can restart from any phase |
| **Documents progress** | User sees where agent is |

---

## Pattern 7: Category + Skill System

### Description

Tasks are delegated using a combination of categories (domain-optimized model presets) and skills (specialized knowledge injection).

### Location

`src/tools/delegate-task/tools.ts`

### Structure

```typescript
delegate_task(
  category: "visual-engineering",  // Selects frontend-optimized model
  load_skills: ["frontend-ui-ux", "playwright"],  // Injects specialized knowledge
  prompt: "..."
)
```

### Categories (Model Presets)

| Category | Model | Use Case |
|----------|-------|----------|
| `visual-engineering` | Gemini 3 Pro | Frontend, UI/UX, styling |
| `ultrabrain` | GPT-5.2 Codex | Deep reasoning, complex problems |
| `quick` | Claude Haiku 4.5 | Trivial tasks, simple changes |
| `writing` | Gemini 3 Flash | Documentation, prose |
| `unspecified-low` | Default | General low-effort tasks |
| `unspecified-high` | Default | General high-effort tasks |

### Skills (Knowledge Injection)

| Skill | Purpose |
|-------|---------|
| `git-master` | Atomic commits, rebase, history search |
| `playwright` | Browser automation, testing |
| `frontend-ui-ux` | Designer mindset, component patterns |

### Selection Protocol

1. **Select Category**: Match task domain to category
2. **Evaluate ALL Skills**: For each skill, ask "Does this domain overlap with my task?"
3. **Justify Omissions**: If omitting a potentially relevant skill, explain why

### Example

```typescript
// Task: Add dark mode toggle to settings page

// Category: visual-engineering (frontend work)
// Skills: 
//   - frontend-ui-ux (YES - UI component design)
//   - playwright (NO - not testing, just implementing)

delegate_task(
  category: "visual-engineering",
  load_skills: ["frontend-ui-ux"],
  prompt: "Add dark mode toggle component to settings page..."
)
```

---

## Naming Conventions

| Component | Convention | Example |
|-----------|------------|---------|
| Directories | kebab-case | `delegate-task/`, `background-agent/` |
| Factories | `createXXX()` | `createOracleAgent()`, `createAtlasHook()` |
| Hooks | `createXXXHook()` | `createTodoContinuationEnforcer()` |
| Test files | `*.test.ts` | `tools.test.ts` alongside `tools.ts` |
| Metadata | `XXX_PROMPT_METADATA` | `ORACLE_PROMPT_METADATA` |
| Config files | `.json`/`.jsonc` | `oh-my-opencode.json` |
| Skills | kebab-case | `git-master`, `frontend-ui-ux` |
| Agents | lowercase | `oracle`, `explore`, `junior` |

---

## Summary: Pattern Wisdom

| Pattern | Key Wisdom |
|---------|------------|
| Factory Pattern | "Explicit dependencies enable testable, consistent code" |
| Hierarchical AGENTS.md | "Each module is self-documenting for AI agents" |
| 7-Section Delegation | "Subagents are stateless - ALL context must be explicit" |
| Session Continuity | "Pass session_id for follow-ups - saves ~70% tokens" |
| Background Tasks | "Fire explore/librarian liberally, collect results later" |
| Phase-Based Workflow | "Clear phases prevent cognitive drift" |
| Category + Skill | "Right model + right knowledge = optimal results" |

---

## See Also

- [03-anti-patterns.md](./03-anti-patterns.md) - What violates these patterns
- [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) - How to adopt these patterns
- [04-prompt-engineering.md](./04-prompt-engineering.md) - Prompt patterns in detail
- [06-agents-skills-reference/](./06-agents-skills-reference/) - Concrete examples
