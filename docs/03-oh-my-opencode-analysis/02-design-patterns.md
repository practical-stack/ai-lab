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

## Pattern 8: Multi-Source Skill Loading

### Description

Skills are loaded from 6 sources with explicit merge priority, enabling extensibility without modifying core code. Config entries can override/patch skill metadata, tool allowlists, and descriptions.

### Location

`src/features/opencode-skill-loader/` (loader.ts, merger.ts, types.ts)

### Structure

```typescript
// Merge priority (lowest → highest)
const SCOPE_PRIORITY = [
  "builtin",          // Built-in skills shipped with oh-my-opencode
  "config",           // Global config overrides
  "user",             // User-level skills (~/.config/)
  "opencode",         // OpenCode project skills (.opencode/skills/)
  "project",          // Claude project skills (.claude/skills/)
  "opencode-project", // OpenCode project-specific overrides
]

// Sources scanned for skill files
const SKILL_SOURCES = [
  ".opencode/skills/",   // OpenCode project directory
  ".claude/skills/",     // Claude project directory
  "~/.config/opencode/", // OpenCode global config
  "~/.claude/",          // Claude user config
]

// Each skill resolves to: SKILL.md, {dirname}.md, or top-level .md
// Content wrapped in XML template:
const template = `<skill-instruction>
Base directory for this skill: ${resolvedPath}/
${body.trim()}
</skill-instruction>

<user-request>
$ARGUMENTS
</user-request>`
```

### Key Types

| Type | Purpose |
|------|---------|
| `SkillScope` | Source priority level (builtin, config, user, etc.) |
| `SkillMetadata` | Parsed frontmatter (name, description, mcp, model) |
| `LoadedSkill` | Fully resolved skill with content and metadata |
| `MergeSkillsOptions` | Enable/disable filters, config overrides |

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Extensibility** | Users add skills without modifying core |
| **Override control** | Project beats user beats builtin |
| **Single resolution** | One merged skill map, no ambiguity |
| **Backward compat** | Claude `.claude/skills/` format supported alongside native |

### Anti-Pattern

```typescript
// BAD: Hardcoded skills, no override mechanism
const skills = [gitMaster, playwright, frontendUiUx]  // Can't extend or override

// GOOD: Layered loading with merge priority
const skills = mergeSkills({
  builtin: discoverBuiltinSkills(),
  config: loadConfigOverrides(),
  user: discoverUserSkills(),
  project: discoverProjectSkills(),
})
```

---

## Pattern 9: Skill-Embedded MCP

### Description

Skills can declare MCP (Model Context Protocol) servers via YAML frontmatter `mcp:` field or a `mcp.json` file in the skill directory. The `SkillMcpManager` lazily creates MCP clients per session/skill/server with connection pooling and idle reaping.

### Location

`src/features/skill-mcp-manager/` (manager.ts, types.ts, env-cleaner.ts)

### Structure

```yaml
# In SKILL.md frontmatter
---
name: my-skill
description: Skill with embedded MCP server
mcp:
  my-server:
    command: npx
    args: ["@package/mcp-server"]
    env:
      API_KEY: "${API_KEY}"
---
```

```typescript
// Or via mcp.json in skill directory
// skill-name/mcp.json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["@package/mcp-server"]
    }
  }
}

// SkillMcpManager lifecycle
class SkillMcpManager {
  // Lazy creation with cache key: `${sessionId}:${skillName}:${serverName}`
  async getOrCreateClient(key: string): Promise<McpClient> {
    if (this.cache.has(key)) return this.cache.get(key)
    
    // Pending-connection guard prevents races
    if (this.pending.has(key)) return this.pending.get(key)
    
    const client = this.createClient(config)
    this.cache.set(key, client)
    return client
  }
  
  // Idle reaping (5 min)
  private reapIdleClients() { /* cleanup unused connections */ }
  
  // Auto-reconnect on transient errors
  private handleDisconnect(key: string) { /* reconnect logic */ }
}
```

### Key Types

| Type | Purpose |
|------|---------|
| `SkillMcpConfig` | MCP server declaration from frontmatter |
| `SkillMcpClientInfo` | Active client with metadata |
| `SkillMcpServerContext` | Server connection context |

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **On-demand** | No upfront cost; clients created when skill is used |
| **Shared cache** | Avoid duplicate connections across invocations |
| **Bounded cleanup** | Idle reaping (5 min) prevents connection leaks |
| **Resilience** | Auto-reconnect on transient "not connected" errors |

### Anti-Pattern

```typescript
// BAD: Eager creation, no reuse
function loadSkill(skill) {
  const client = new McpClient(skill.mcp)  // Created every time
  await client.connect()                    // No cache, no cleanup
}

// GOOD: Lazy pool with reaping
const client = await mcpManager.getOrCreateClient(cacheKey)
// Reused across calls, auto-cleaned when idle
```

---

## Pattern 10: Boulder State Persistence

### Description

Plan execution state persists in `.sisyphus/boulder.json`, enabling crash recovery and cross-session continuity. Progress is computed on-demand by counting markdown checkboxes in the plan file.

### Location

`src/features/boulder-state/` (storage.ts, types.ts, constants.ts)

### Structure

```typescript
// .sisyphus/boulder.json
interface BoulderState {
  activePlanPath: string      // e.g., ".sisyphus/plans/auth-feature.md"
  startTime: string           // ISO timestamp
  sessionIds: string[]        // All sessions that worked on this plan
  planName: string            // Human-readable plan name
}

// Progress computed from plan file (not stored)
interface PlanProgress {
  total: number               // Total checkboxes in plan
  completed: number           // Checked checkboxes [x]
  percentage: number          // Derived: completed/total * 100
}

// Helpers
function readBoulderState(): BoulderState | null
function writeBoulderState(state: BoulderState): void
function clearBoulderState(): void
function appendSessionId(sessionId: string): void
function findPlanFiles(): string[]  // Scans .sisyphus/plans/
```

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Crash recovery** | State survives process restarts |
| **Simplicity** | JSON file, no database needed |
| **Computed views** | Progress derived on-demand from checkbox counts |
| **Multi-session** | Session IDs track which sessions contributed |

### Anti-Pattern

```typescript
// BAD: In-memory only state
let currentPlan = null  // Lost on crash

// GOOD: File-backed persistence
writeBoulderState({ activePlanPath, startTime, sessionIds, planName })
// Survives crashes, context window limits, session switches
```

---

## Pattern 11: Metadata-Driven Prompt Assembly

### Description

System prompts are dynamically generated from structured metadata objects rather than static strings. Each agent declares its cost, triggers, use/avoid scenarios via `AgentPromptMetadata`, which feeds into auto-generated prompt sections. This builds upon Pattern 5 (Dynamic Prompt Generation) with a concrete, typed implementation.

### Location

`src/agents/dynamic-agent-prompt-builder.ts`, `src/agents/sisyphus.ts`, `src/agents/atlas.ts`

### Structure

```typescript
// Each agent declares structured metadata
interface AgentPromptMetadata {
  name: string
  cost: "FREE" | "CHEAP" | "MODERATE" | "EXPENSIVE"
  triggers: DelegationTrigger[]
  useWhen: string[]
  avoidWhen: string[]
}

// Triggers map signals to appropriate agents
interface DelegationTrigger {
  signal: string        // e.g., "External library mentioned"
  action: string        // e.g., "fire librarian background"
}

// Builder generates markdown fragments from metadata
function buildDynamicPrompt(ctx: {
  agents: AgentPromptMetadata[]
  tools: AvailableTool[]
  skills: AvailableSkill[]
  categories: AvailableCategory[]
}): string {
  return `
${buildToolSelectionTable(ctx.tools)}
${buildDelegationMatrix(ctx.agents)}
${buildKeyTriggers(ctx.agents)}
${buildCategoryTable(ctx.categories)}
${buildSkillTable(ctx.skills)}
${buildOracleSection(ctx.agents)}
  `
}

// Tool names categorized for prompt economy
// lsp_* → "LSP tools", ast_grep_* → "AST-grep", etc.
```

### Relationship to Pattern 5

Pattern 5 described the *concept* of dynamic prompt generation. Pattern 11 shows the *implementation*: structured metadata objects that feed typed builder functions, producing markdown fragments that compose into complete system prompts.

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Accuracy** | Prompt always matches actual available capabilities |
| **Extensibility** | Add agents/skills without editing prompt templates |
| **Deployment flexibility** | Different deployments produce different prompts |
| **Single source of truth** | Agent metadata drives both runtime behavior and prompt content |
| **Prompt economy** | Tool categorization compresses content for token efficiency |

---

## Pattern 12: State-Driven Orchestration (Tmux Subagents)

### Description

Tmux-based parallel agent orchestration using a "state-first" flow: query external state → decide with pure functions → execute actions → update cache only after success. This separates concerns between state observation, decision logic, and effectful execution.

### Location

`src/features/tmux-subagent/` (manager.ts, decision-engine.ts, action-executor.ts, pane-state-querier.ts)

### Structure

```typescript
// State-first flow: Query → Decide → Execute → Update

// 1. QUERY: Get real tmux state
const panes: TmuxPaneInfo[] = await paneStateQuerier.queryPanes()

// 2. DECIDE: Pure function, no side effects
const decision: SpawnDecision = decisionEngine.decide({
  currentPanes: panes,
  requestedSession: newSession,
  capacity: capacityConfig,
})
// Decision types: split existing pane, evict oldest, replace idle, reject

// 3. EXECUTE: Perform tmux operations
const result = await actionExecutor.execute(decision.action)

// 4. UPDATE: Only after successful execution
if (result.success) {
  sessionCache.update(result.paneId, newSession)
}

// Key types
interface TrackedSession { sessionId: string; paneId: string; startTime: number }
interface WindowState { panes: TmuxPaneInfo[]; capacity: CapacityConfig }
interface SpawnDecision { action: PaneAction; reason: string }
```

### Decision Engine Logic

| Scenario | Decision |
|----------|----------|
| Available capacity | Split existing pane |
| At capacity, idle panes exist | Evict oldest idle pane |
| At capacity, no idle panes | Replace oldest pane |
| Session already tracked | Reuse existing pane |

### Why This Pattern

| Benefit | Explanation |
|---------|-------------|
| **Predictability** | Pure decision functions are easily testable |
| **Resilience** | Cache only updated after tmux confirms success |
| **Scalability** | Grid capacity computed dynamically |
| **Observability** | Each step (query, decide, execute) is independently auditable |

### Anti-Pattern

```typescript
// BAD: Optimistic state mutation
sessionCache.add(newSession)      // Updated before tmux confirms
await tmux.splitPane()            // What if this fails? Cache is wrong

// GOOD: State-first flow
const decision = decide(queryState())
const result = await execute(decision)
if (result.success) updateCache()  // Only on confirmed success
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
| Multi-Source Skill Loading | "Layered config with explicit priority — project beats user beats builtin" |
| Skill-Embedded MCP | "Lazy resource pool with idle reaping — on-demand, cached, auto-cleaned" |
| Boulder State Persistence | "File-backed state survives crashes — simple JSON, computed views" |
| Metadata-Driven Prompt Assembly | "Prompts built from structured metadata, not static strings" |
| State-Driven Orchestration | "Query → Decide → Execute → Update — pure decisions, confirmed mutations" |

---

## See Also

- [03-anti-patterns.md](./03-anti-patterns.md) - What violates these patterns
- [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) - How to adopt these patterns
- [04-prompt-engineering.md](./04-prompt-engineering.md) - Prompt patterns in detail
- [06-agents-skills-reference/](./06-agents-skills-reference/) - Concrete examples
