# Architecture

**Document:** 01-architecture.md
**Part of:** oh-my-claudecode Analysis
**Source:** `nicobailon/oh-my-claudecode` (v3.7.15)

---

## System Overview

oh-my-claudecode implements a **hook-driven orchestration architecture** that transforms Claude Code from a single-agent CLI into a multi-agent system with 32 specialized agents, 37 skills, and 15 custom tools — all without forking or modifying Claude Code itself.

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code CLI                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Plugin Manifest Layer                 │  │
│  │         .claude-plugin/plugin.json                │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      ↓                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Session Assembly Layer                   │  │
│  │     src/index.ts → createSisyphusSession()        │  │
│  │  [Config + Agents + MCP + Hooks + System Prompt]  │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      ↓                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Hooks   │  │  Agents  │  │ Features │  │ Tools  │  │
│  │  (20+    │  │  (32     │  │ (model   │  │ (LSP,  │  │
│  │  modules)│  │  defs)   │  │ routing, │  │  AST,  │  │
│  │          │  │          │  │ verify,  │  │  REPL) │  │
│  │          │  │          │  │ state)   │  │        │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └──────────────┴─────────────┴────────────┘       │
│                      ↓                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Orchestration Layer                      │  │
│  │   CLAUDE.md (system prompt) + Skills + Commands   │  │
│  │   [Intent Detection → Skill Activation →          │  │
│  │    Agent Delegation → Verification]               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Key architectural insight:** The system operates as a plugin to Claude Code, not a standalone application. All orchestration is achieved through three extension points: shell hooks (lifecycle interception), markdown agents (Task tool delegation), and an in-process MCP server (custom tools). This constraint shapes every design decision.

---

## Source Directory Tree

```
src/ (327 TypeScript files)
├── index.ts (402 lines) — createSisyphusSession() entry point
│
├── agents/ (21 files)
│   ├── definitions.ts (491 lines) — 32 agent registry
│   ├── prompt-generator.ts (202 lines) — Composable prompt assembly
│   ├── preamble.ts — Worker anti-recursion guard (wrapWithPreamble)
│   ├── types.ts — AgentConfig interface + tier enums
│   └── prompt-sections/ — Modular prompt section builders
│       ├── agent-registry.ts — Agent table for system prompt
│       ├── trigger-table.ts — Keyword → skill mapping table
│       ├── delegation-matrix.ts — Task type → agent routing
│       ├── tool-catalog.ts — Available MCP tools listing
│       └── workflow-rules.ts — Execution rules + verification
│
├── hooks/ (119 files) — Largest module
│   ├── index.ts (801 lines) — Master export hub
│   ├── bridge.ts — Shell-to-TypeScript dispatcher (15 hook types)
│   ├── autopilot/ — 5-phase state machine (INIT→PLAN→EXECUTE→VERIFY→COMPLETE)
│   ├── ralph/ — Persistence loop + architect verification
│   ├── mode-registry/ — Mutual exclusion for 8 execution modes
│   ├── keyword-detector/ — Magic keyword detection
│   ├── rules-injector/ — Directory-proximity rule injection
│   ├── context-injector/ — AGENTS.md context injection
│   ├── thinking-block-validator/ — API error prevention
│   ├── empty-message-sanitizer/ — Message format safety
│   ├── permission-handler/ — Auto-approve safe commands
│   ├── subagent-tracker/ — Agent monitoring
│   ├── background-notification/ — Background task alerts
│   ├── session-end/ — Metrics + cleanup
│   ├── pre-compact/ — Checkpoint before compaction
│   └── todo-continuation/ — Stop prevention for pending tasks
│
├── features/ (49 files)
│   ├── model-routing/ — 4-stage complexity-based routing
│   ├── delegation-categories/ — Semantic task categorization (5 categories)
│   ├── verification/ — Reusable protocol with 7 checks
│   ├── state-manager/ — Unified .omc/state/ paths with legacy migration
│   ├── boulder-state/ — Plan persistence (Sisyphus's boulder)
│   ├── task-decomposer/ — Task → subtask partitioning (7-step pipeline)
│   ├── notepad-wisdom/ — Plan-scoped learnings/decisions/issues
│   ├── context-injector/ — Priority-based context accumulation
│   └── background-agent/ — Background task management
│
├── tools/ (18 files)
│   ├── lsp/ — 12 LSP tools (hover, definition, references, symbols, etc.)
│   ├── diagnostics/ — tsc/LSP directory checking (auto/tsc/lsp strategies)
│   ├── ast-tools.ts — ast-grep search/replace (16 languages)
│   └── python-repl/ — Persistent Python session
│
├── mcp/ (4 files)
│   ├── omc-tools-server.ts — In-process MCP server (15 tools)
│   └── servers.ts — External MCP server configs
│
├── hud/ (25 files) — Real-time status display
│   Terminal statusline showing active mode, agent count, progress
│
├── analytics/ (18 files) — Usage tracking + cost analysis
│   Token counts, model usage, delegation patterns, session metrics
│
├── cli/ (12 files) — CLI commands
│   setup, doctor, hud, skill management
│
├── __tests__/ (41 files) — Test suite
│   Unit tests for hooks, features, agents, tools
│
└── (config, compatibility, platform, shared, utils, installer, lib)
    Supporting modules for cross-platform, configuration, utilities
```

---

## AGENTS.md Distribution Map

The codebase uses a hierarchical documentation system where AI agents discover context through proximity-based `AGENTS.md` files. Nine files form a knowledge tree:

```
oh-my-claudecode/
├── AGENTS.md              — System overview: plugin structure, entry points,
│                            key directories, build/test commands
├── agents/
│   └── AGENTS.md          — Agent subsystem: markdown format, frontmatter
│                            fields, prompt patterns, tier behaviors
├── skills/
│   └── AGENTS.md          — Skills subsystem: skill format, activation
│                            triggers, slash command mapping
├── src/
│   ├── agents/
│   │   └── AGENTS.md      — Agent infrastructure: definitions.ts registry,
│   │                        prompt-generator composition, preamble guard
│   ├── features/
│   │   └── AGENTS.md      — Feature modules: model routing pipeline,
│   │                        state manager API, verification protocol
│   ├── hooks/
│   │   └── AGENTS.md      — Hook subsystem: bridge architecture, hook
│   │                        types, registration pattern, lifecycle
│   ├── tools/
│   │   └── AGENTS.md      — Tool subsystem: LSP client, ast-grep,
│   │                        Python REPL, MCP tool registration
│   └── hud/
│       └── AGENTS.md      — HUD subsystem: statusline components,
│                            refresh protocol, layout engine
└── docs/
    └── AGENTS.md          — Documentation subsystem: doc structure,
                             writing conventions, cross-references
```

**Injection mechanism:** The `context-injector` hook detects which directory the agent is working in, walks up the tree to find the nearest `AGENTS.md`, and injects its content into the conversation. This gives every agent automatic domain knowledge without loading all 9 files.

---

## Layer Analysis

### Plugin Manifest Layer

**Purpose:** Declares the plugin identity to Claude Code's plugin system.

**Components:**

| Component | File | Responsibility |
|-----------|------|----------------|
| Plugin manifest | `.claude-plugin/plugin.json` | Plugin name, version (3.7.15), skill/agent directories, MCP server config |

**Key detail:** The manifest points Claude Code to the `skills/`, `agents/`, and `commands/` directories, and configures the in-process MCP server that exposes custom tools. This is the only file Claude Code reads directly — everything else is bootstrapped from here.

---

### Session Assembly Layer

**Purpose:** Assembles all system components into a single `SisyphusSession` configuration object.

**Components:**

| Component | File | Lines | Key Function | Responsibility |
|-----------|------|-------|--------------|----------------|
| Session factory | `src/index.ts` | 402 | `createSisyphusSession()` | Main entry point, wires everything together |
| Agent registry | `src/agents/definitions.ts` | 491 | `getAgentDefinitions()` | 32 agent definitions with markdown prompts |
| Prompt generator | `src/agents/prompt-generator.ts` | 202 | `buildSystemPrompt()` | Composable section assembly |
| Config loader | `src/config/` | ~150 | `loadConfig()` | User/project config from `~/.claude/.omc-config.json` |

**Key patterns:**
- **Dynamic prompt loading**: Agent prompts are loaded from `/agents/*.md` markdown files at session creation, not hardcoded in TypeScript
- **Composable prompt assembly**: The system prompt is built from sections (header, agent registry, trigger tables, delegation matrix, workflow rules, verification checklist)
- **MCP server integration**: External MCP servers (Exa search, Context7 docs, Playwright) and the in-process omc-tools server are merged into the session config

**Session assembly sequence:** `loadConfig()` → `getAgentDefinitions()` (32 agents from markdown) → `buildSystemPrompt()` (compose CLAUDE.md sections) → `configureMcpServers()` (in-process + external) → `registerHooks()` (all modules via bridge) → return `SisyphusSession`.

---

### Hook Layer

**Purpose:** Intercepts Claude Code lifecycle events and processes them through TypeScript logic.

**Components:**

| Component | File | Lines | Responsibility |
|-----------|------|-------|----------------|
| Hook exports | `src/hooks/index.ts` | 801 | Master export hub for 20+ hook modules |
| Shell-to-TS bridge | `src/hooks/bridge.ts` | ~200 | `processHook(hookType, input)` dispatches to 15 hook types |
| Shell scripts | `hooks/*.sh` | ~50 each | Claude Code native hooks that invoke the TypeScript bridge |

**Hook types and their functions:**

| Hook Type | Trigger | Function |
|-----------|---------|----------|
| `keyword-detector` | Prompt submit | Detect magic keywords (autopilot, ralph, ulw, etc.) |
| `stop-continuation` | Session stop | Check if ralph/ultrawork/autopilot should prevent stopping |
| `ralph` | Loop iteration | Re-invoke agent with continuation context |
| `persistent-mode` | Prompt submit | Restore active execution mode after compaction |
| `session-start` | Session begin | Initialize state, restore modes |
| `session-end` | Session end | Cleanup state files, collect metrics |
| `pre-tool-use` | Before tool call | Delegation enforcement (warn on direct source writes) |
| `post-tool-use` | After tool call | Track task completion, verify results |
| `autopilot` | Phase transition | Manage autopilot's 5-phase state machine |
| `subagent-start/stop` | Agent lifecycle | Track spawned agents |
| `pre-compact` | Before compaction | Preserve critical context |
| `rules-injector` | File access | Inject proximity-based rules for current file |
| `context-injector` | Prompt submit | Inject AGENTS.md and gathered context |
| `thinking-block-validator` | Pre-API call | Strip invalid thinking blocks |
| `empty-message-sanitizer` | Pre-API call | Prevent empty messages |

**Key pattern — Bridge architecture:** Shell scripts pipe JSON to a Node.js process (`processHook()`), enabling complex TypeScript processing while conforming to Claude Code's shell-based hook system.

**Hook execution order (prompt submit):** keyword-detector → persistent-mode → context-injector → rules-injector → thinking-block-validator → empty-message-sanitizer.

---

### Agent Layer

**Purpose:** Define 32 specialized agents with role-specific prompts, tool restrictions, and model tiers.

**Components:**

| Component | File | Lines | Key Function | Responsibility |
|-----------|------|-------|--------------|----------------|
| Agent definitions | `src/agents/definitions.ts` | 491 | `getAgentDefinitions()` | Registry of all 32 agents |
| Prompt templates | `agents/*.md` | 36 files | — | Markdown prompts with YAML frontmatter |
| Base template | `agents/templates/base-agent.md` | ~80 | — | Mustache-style template for agent structure |
| Tier instructions | `agents/templates/tier-instructions.md` | ~60 | — | LOW/MEDIUM/HIGH behavioral differentiation |
| Worker preamble | `src/agents/preamble.ts` | ~40 | `wrapWithPreamble()` | Anti-recursion guard prepended to worker tasks |

**Agent taxonomy (32 agents across 15 domains):**

| Domain | LOW (Haiku) | MEDIUM (Sonnet) | HIGH (Opus) |
|--------|-------------|-----------------|-------------|
| Analysis | architect-low | architect-medium | architect |
| Execution | executor-low | executor | executor-high |
| Search | explore | explore-medium | explore-high |
| Frontend | designer-low | designer | designer-high |
| Research | researcher-low | researcher | — |
| Data Science | scientist-low | scientist | scientist-high |
| Testing | — | qa-tester | qa-tester-high |
| Build | build-fixer-low | build-fixer | — |
| Security | security-reviewer-low | — | security-reviewer |
| Code Review | code-reviewer-low | — | code-reviewer |
| TDD | tdd-guide-low | tdd-guide | — |
| Docs | writer | — | — |
| Visual | — | vision | — |
| Planning | — | — | planner |
| Critique | — | — | critic |
| Pre-Planning | — | — | analyst |

**Key patterns:**
- **Capability Fence**: Agents like `architect` have `disallowedTools: Write, Edit` in frontmatter — both prompt and infrastructure enforce role constraints
- **Worker Preamble**: Every spawned worker gets a preamble overriding the global "delegate everything" instruction with "work alone, no delegation"
- **Mythological personas**: Architect = Oracle, Planner = Prometheus, Executor = Sisyphus-Junior — cultural associations prime the model's behavior
- **Three-tier cost model**: Each domain has up to 3 tiers, allowing the model router to select the cheapest agent capable of the task

---

### Feature Layer

**Purpose:** Self-contained modules providing cross-cutting capabilities used by hooks, agents, and the session assembly layer.

**Components:**

| Component | Directory | Files | Key Export | Responsibility |
|-----------|-----------|-------|------------|----------------|
| Model routing | `src/features/model-routing/` | 6 | `routeModel()` | 4-stage pipeline: signals → scoring → rules → decision |
| Delegation categories | `src/features/delegation-categories/` | 4 | `categorize()` | Semantic task categorization (5 categories) |
| Verification | `src/features/verification/` | 5 | `createProtocol()` | Reusable protocol with 7 standard checks + staleness detection |
| State manager | `src/features/state-manager/` | 3 | `StateManager` | Unified `.omc/state/` paths with legacy migration |
| Boulder state | `src/features/boulder-state/` | 4 | `BoulderState` | Plan persistence across sessions (Sisyphus's boulder) |
| Task decomposer | `src/features/task-decomposer/` | 5 | `decompose()` | 7-step pipeline for breaking tasks into parallel subtasks |
| Notepad wisdom | `src/features/notepad-wisdom/` | 6 | `addLearning()` | Plan-scoped wisdom capture (learnings, decisions, issues) |
| Context injector | `src/features/context-injector/` | 4 | `registerContext()` | Priority-based context accumulation and injection |
| Background agent | `src/features/background-agent/` | 3 | `BackgroundManager` | Background task management and result collection |

**Model routing pipeline (detail):**

```
User prompt
    ↓
Signal Extraction (15+ signals)
  ├── Lexical: architecture/debugging/simple keywords
  ├── Structural: file count, cross-file dependencies, impact scope
  └── Context: failure history, domain specificity
    ↓
Weighted Scoring
  architecture keywords → +3, simple keywords → -2
  system-wide impact → +3, per failure → +2
    ↓
Rules Engine (priority-ordered, first match wins)
  priority 100: explicit model override
  priority 90:  orchestrator fixed to Opus
  priority 75-85: agent-specific adaptive rules
  priority 45-70: task-based routing
  priority 0:   default to Sonnet
    ↓
Routing Decision
  score >= 8 → HIGH (Opus)
  score >= 4 → MEDIUM (Sonnet)
  score < 4  → LOW (Haiku)
```

**Delegation categories:**

| Category | Tier | Temperature | Thinking | Use For |
|----------|------|-------------|----------|---------|
| `visual-engineering` | HIGH | 0.7 | high | UI/UX, frontend, design systems |
| `ultrabrain` | HIGH | 0.3 | max | Complex reasoning, architecture, deep debugging |
| `artistry` | MEDIUM | 0.9 | medium | Creative solutions, brainstorming |
| `quick` | LOW | 0.1 | low | Simple lookups, basic operations |
| `writing` | MEDIUM | 0.5 | medium | Documentation, technical writing |

---

### Tool Layer

**Purpose:** Provide IDE-like capabilities to agents via MCP protocol.

**Components:**

| Component | File | Lines | Responsibility |
|-----------|------|-------|----------------|
| LSP client | `src/tools/lsp/` | ~600 | 12 tools: hover, goto definition, find references, document symbols, workspace symbols, diagnostics, diagnostics-directory, servers, prepare-rename, rename, code actions, code action resolve |
| AST tools | `src/tools/ast-tools.ts` | ~200 | Structural code search and replace via ast-grep (16 languages) |
| Python REPL | `src/tools/python-repl/` | ~150 | Persistent Python session for data analysis |
| Directory diagnostics | `src/tools/diagnostics/` | ~180 | Project-wide type checking (tsc strategy preferred, LSP fallback) |
| MCP server | `src/mcp/omc-tools-server.ts` | ~300 | In-process MCP server exposing all 15 tools as `mcp__omc-tools__*` |

---

## Data Flow

### Flow 1: User Prompt → Skill Activation → Agent Delegation → Result

```
User prompt
    → keyword-detector hook (detect "autopilot", "ralph", etc.)
    → context-injector hook (inject AGENTS.md, rules)
    → Orchestrator (CLAUDE.md system prompt)
    → Intent classification (pattern-to-skill routing table)
    → Skill activation (e.g., autopilot, ultrawork)
    → Task decomposition (if parallel execution)
    → Model routing (signals → scoring → rules → tier)
    → Agent delegation via Task tool
    → Worker executes with restricted tools
    → Verification protocol
    → Architect approval gate
    → Result to user
```

### Flow 2: Model Routing Decision

```
Task description
    → extractSignals(): lexical + structural + context
    → scoreSignals(): weighted sum
    → evaluateRules(): priority-ordered, first match
    → RoutingDecision { tier, model, confidence, reasoning }
```

### Flow 3: Verification

```
Work completed
    → createProtocol(checks: [build, test, lint, ...])
    → createChecklist()
    → runVerification() (parallel or sequential)
    → For each check: run command → capture output → check staleness
    → validateChecklist() → approved | rejected | incomplete
    → If rejected → fix and re-verify
    → If approved → completion allowed
```

### Flow 4: State Persistence

```
Mode activation (ralph, autopilot, ultrawork, etc.)
    → StateManager.write('.omc/state/{mode}-state.json', state)
    → State survives across conversation turns
    → On session restart: StateManager.read() → restore mode
    → On completion: delete state file (not set active: false)
    → Legacy migration: check old paths → move to standard path
```

### Flow 5: Hook Lifecycle

```
Session Start
    → session-start hook: restore modes, initialize state
    ↓
Conversation Loop
    → prompt-submit: keyword detection + context injection
    → pre-tool-use: delegation enforcement (warn on direct writes)
    → [tool execution]
    → post-tool-use: task tracking, verification
    ↓
Session Stop Attempt
    → stop-continuation: check ralph/ultrawork/autopilot state
    → If persistent mode active + pending tasks → prevent stop
    → If complete → allow stop
    ↓
Session End
    → session-end: cleanup state files, collect metrics
```

---

## Module Boundaries and Extension Points

| Module | Files | Purpose | Extension Points |
|--------|-------|---------|------------------|
| `src/agents/` | 21 | Agent definitions + dynamic prompts | Add `agents/*.md` file + register in `definitions.ts` |
| `src/hooks/` | 119 | Lifecycle interception | Add handler in `bridge.ts` dispatch + export from `index.ts` |
| `src/features/` | 49 | Cross-cutting capabilities | Self-contained module with `index.ts` export |
| `src/tools/` | 18 | Agent capabilities via MCP | Register tool in `omc-tools-server.ts` |
| `src/mcp/` | 4 | External MCP server configs | Add server config to `servers.ts` |
| `src/hud/` | 25 | Real-time status display | Add component to HUD layout |
| `src/analytics/` | 18 | Usage tracking + cost | Add metric collector |
| `src/cli/` | 12 | CLI commands | Add command handler |
| `src/__tests__/` | 41 | Test suite | Mirror source structure |
| `skills/` | 37 | Skill definitions (markdown) | Add `skills/*.md` file |
| `commands/` | 31 | Slash commands (markdown) | Add `commands/*.md` file |
| `agents/` | 36 | Agent prompts (markdown) | Add `agents/*.md` + register |

**Module dependency direction:**

```
hooks/ ──→ features/ ──→ (no internal deps)
  │              │
  ↓              ↓
agents/ ←── tools/ ──→ mcp/
  │
  ↓
prompt-generator → (output: CLAUDE.md sections)
```

Features are intentionally dependency-free — they export pure functions and classes that hooks and tools consume. This prevents circular dependencies and allows features to be tested in isolation.

---

## Integration Points

| Point | Input | Output | Protocol |
|-------|-------|--------|----------|
| Claude Code → Plugin | Plugin manifest | Session config | `.claude-plugin/plugin.json` |
| Shell → TypeScript | Hook event (JSON stdin) | Hook result (JSON stdout) | `processHook(type, input)` |
| Orchestrator → Agent | Task description + model | Agent result | Claude `Task` tool |
| Agent → Tools | Tool call params | Tool results | MCP protocol |
| Feature → State | State object | Persisted JSON | `.omc/state/*.json` |
| Rules → Context | File path | Matching rules | Glob-based `.claude/rules/` matching |
| Context → Prompt | AGENTS.md path | Injected content | Proximity-based directory walk |
| Analytics → Disk | Usage metrics | JSON log | `.omc/analytics/*.json` |

---

## Architectural Decisions

### Decision 1: Markdown-Defined Agents (Not TypeScript)

| Aspect | Detail |
|--------|--------|
| **Choice** | Agent prompts stored as markdown files with YAML frontmatter |
| **Alternative** | Hardcoded TypeScript prompt strings |
| **Why** | Enables non-developers (prompt engineers, domain experts) to edit agent behavior without touching TypeScript. Markdown is reviewable, diffable, and version-controlled. |
| **Trade-off** | Runtime file I/O at session creation; no compile-time validation of prompt content. Mitigated by TypeScript registry that validates frontmatter fields. |
| **Evidence** | `agents/*.md` (36 files) loaded by `definitions.ts` at session start |

### Decision 2: Shell Hook Bridge (Not Pure TypeScript)

| Aspect | Detail |
|--------|--------|
| **Choice** | Shell scripts (`hooks/*.sh`) that pipe JSON to a Node.js bridge (`bridge.ts`) |
| **Alternative** | Pure TypeScript hooks registered programmatically |
| **Why** | Claude Code's plugin system requires shell-based hooks. The bridge pattern allows writing hook logic in TypeScript while conforming to the shell interface. |
| **Trade-off** | Process spawn overhead per hook invocation; JSON serialization cost. Acceptable because hooks fire at conversation-level frequency (seconds), not request-level (milliseconds). |
| **Evidence** | `src/hooks/bridge.ts` dispatches to 15 hook types |

### Decision 3: File-Based State (Not In-Memory)

| Aspect | Detail |
|--------|--------|
| **Choice** | JSON files in `.omc/state/` for all mode and session state |
| **Alternative** | In-memory state within the plugin process |
| **Why** | Hooks execute as separate processes (spawned by shell scripts), so in-memory state would not persist across hook invocations. File-based state survives process boundaries and session restarts. |
| **Trade-off** | Filesystem I/O for every state read/write; potential race conditions with concurrent hooks. Mitigated by atomic write (write-to-temp + rename) and the mode-registry's mutual exclusion. |
| **Evidence** | `src/features/state-manager/` with `.omc/state/*.json` pattern |

### Decision 4: SQLite for Swarm (Not File Locking)

| Aspect | Detail |
|--------|--------|
| **Choice** | SQLite database for swarm task coordination |
| **Alternative** | JSON files with OS-level file locking |
| **Why** | Swarm mode runs N concurrent agents claiming tasks from a shared pool. ACID transactions prevent double-claiming. File locking is unreliable across platforms and doesn't support atomic "claim first unclaimed" queries. |
| **Trade-off** | SQLite dependency; more complex setup. Justified by the correctness guarantee for multi-agent coordination. |
| **Evidence** | Swarm skill uses SQLite for pending/claimed/done task status |

### Decision 5: Mode Registry as File-Only (Not Module Imports)

| Aspect | Detail |
|--------|--------|
| **Choice** | Mode registry reads/writes state files without importing mode modules |
| **Alternative** | Registry imports autopilot, ralph, ultrawork modules directly |
| **Why** | Prevents circular dependencies. Modes depend on hooks, hooks depend on the registry, and if the registry imported modes, the cycle would be: mode → hook → registry → mode. File-based decoupling breaks the cycle. |
| **Trade-off** | No compile-time guarantee that registered mode names match actual implementations. Mitigated by test coverage and runtime validation. |
| **Evidence** | `src/hooks/mode-registry/` uses only file I/O, no mode imports |

### Decision 6: Dual Hook Implementations (Bash + Node.js)

| Aspect | Detail |
|--------|--------|
| **Choice** | Shell scripts for Claude Code interface + Node.js for logic |
| **Alternative** | Single-language implementation (all bash or all Node.js) |
| **Why** | Cross-platform compatibility. Claude Code's hook system is shell-based (works on macOS and Linux). Complex logic (JSON parsing, state management, async operations) is impractical in bash. The dual approach gives shell compatibility with TypeScript capability. |
| **Trade-off** | Two languages to maintain; debugging requires understanding both layers. Mitigated by keeping shell scripts minimal (just piping) and concentrating all logic in TypeScript. |
| **Evidence** | `hooks/*.sh` (thin wrappers) + `src/hooks/bridge.ts` (all logic) |

### Decision 7: Standalone Verification Module

| Aspect | Detail |
|--------|--------|
| **Choice** | Verification protocol as an independent feature module |
| **Alternative** | Verification logic embedded in each mode (ralph, ultrawork, autopilot) |
| **Why** | Three execution modes (ralph, ultrawork, autopilot) all need completion verification with the same checks (build, test, lint, architect approval). Extracting it avoids triplication and ensures consistent verification behavior. |
| **Trade-off** | Additional abstraction layer; modes must conform to verification API. Justified by DRY principle and the critical importance of consistent completion checks. |
| **Evidence** | `src/features/verification/` with 7 standard checks, consumed by 3 modes |

---

## Key Statistics

| Metric | Value |
|--------|-------|
| TypeScript source files | 327 |
| Agent definitions | 32 (12 base + tiered variants) |
| Agent prompt files | 36 markdown files |
| Skills | 37 |
| Commands | 31 |
| Hook modules | 20+ (119 files total) |
| MCP tools exposed | 15 (12 LSP + 2 AST + 1 REPL) |
| Feature modules | 9 |
| Test files | 41 |
| AGENTS.md files | 9 (hierarchical) |
| Markdown documentation | 161 files |
| Lines in largest module | hooks/index.ts (801 lines) |
| Lines in agent registry | definitions.ts (491 lines) |
| Lines in entry point | index.ts (402 lines) |
