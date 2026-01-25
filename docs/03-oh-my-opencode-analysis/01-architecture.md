# Architecture

**Document:** 01-architecture.md  
**Part of:** Oh-My-OpenCode Repository Analysis  
**Source:** `docs/guide/understanding-orchestration-system.md`, `src/agents/`, `src/tools/delegate-task/`

---

## High-Level Overview

Oh-My-OpenCode implements a **three-layer orchestration architecture** that separates planning, execution, and specialized work into distinct components with different models optimized for each role.

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTENT                            │
│                  "ulw add authentication"                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: PLANNING (Prometheus + Metis + Momus)             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │ Prometheus    │  │ Metis         │  │ Momus         │   │
│  │ (Opus 4.5)    │  │ (Sonnet 4.5)  │  │ (Sonnet 4.5)  │   │
│  │ Interview +   │  │ Gap Analysis  │  │ Plan Review   │   │
│  │ Plan Creator  │  │ Pre-Planning  │  │ Validation    │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: EXECUTION (Atlas/Sisyphus Orchestrator)           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Claude Opus 4.5 - Delegates, never writes code directly │ │
│  │ Reads plan → Accumulates wisdom → Delegates → Verifies  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Junior       │  │ explore      │  │ librarian    │
│ (Sonnet 4.5) │  │ (Grok Code)  │  │ (Big Pickle) │
│ Task exec    │  │ Fast grep    │  │ Docs/OSS     │
└──────────────┘  └──────────────┘  └──────────────┘
        ↓                    ↓                    ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ oracle       │  │ frontend     │  │ multimodal   │
│ (GPT-5.2)    │  │ (Gemini 3)   │  │ (Gemini 3)   │
│ READ-ONLY    │  │ UI/UX        │  │ PDF/Image    │
│ Strategic    │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Layer 1: Planning Layer

The planning layer is responsible for understanding user intent, analyzing gaps, and creating comprehensive plans before any code is written.

### Prometheus: The Strategic Planner

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Opus 4.5 |
| **Role** | Interview user, create comprehensive plans |
| **Output** | Plan documents (markdown) |
| **Key Trait** | Never executes, only plans |

**Workflow:**
1. **Interview Phase**: Asks clarifying questions to understand full scope
2. **Gap Analysis**: Identifies what's missing from the request
3. **Plan Creation**: Produces detailed, step-by-step plan
4. **Handoff**: Passes plan to execution layer

**Example Interaction:**
```
User: "Add authentication to my app"

Prometheus: "I'll help you plan authentication. First, some questions:
1. What auth method do you prefer? (JWT, sessions, OAuth)
2. Do you need social login?
3. Where should user data be stored?
4. What routes need protection?"

User: "JWT, no social login, PostgreSQL, /api/* routes"

Prometheus: Creates plan with:
- User model design
- Auth middleware implementation
- Token generation strategy
- Protected route patterns
- Test cases
- Migration steps
```

### Metis: The Gap Analyzer

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Sonnet 4.5 |
| **Role** | Pre-planning analysis, find hidden requirements |
| **Output** | Gap analysis report |
| **Key Trait** | Discovers what user didn't think to ask |

**What Metis Finds:**
- Implicit requirements not stated
- Edge cases not considered
- Integration points with existing code
- Potential conflicts or breaking changes
- Missing infrastructure needs

**Example:**
```
User Request: "Add user profile page"

Metis Analysis:
- Does the user model have all needed fields? → NO, missing avatar, bio
- Is there an existing component library? → YES, use existing components
- Are there existing profile routes? → NO, need to add /profile route
- Is there auth middleware? → YES, reuse existing
- Are there image upload capabilities? → NO, need to add for avatar
```

### Momus: The Plan Critic

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Sonnet 4.5 |
| **Role** | Review plans for completeness and feasibility |
| **Output** | Critique report, approval/rejection |
| **Key Trait** | Ruthlessly evaluates, finds flaws |

**Evaluation Criteria:**
- Is the plan complete?
- Are all edge cases covered?
- Is the scope realistic?
- Are dependencies accounted for?
- Will this integrate cleanly?

**Example Review:**
```
Plan: "Add authentication in 3 steps"

Momus Review:
✗ Missing: Database migration step
✗ Missing: Environment variable setup for JWT secret
✗ Missing: Error handling for expired tokens
✗ Unclear: How will existing endpoints be updated?
✓ Good: Token generation strategy is sound
✓ Good: Test coverage is comprehensive

VERDICT: REVISE - Add missing steps before execution
```

---

## Layer 2: Execution Layer (Orchestrator)

The orchestrator (Sisyphus/Atlas) is the central coordinator that reads plans and delegates work to specialist agents.

### Sisyphus: The Orchestrator

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Opus 4.5 |
| **Role** | Delegate work, coordinate specialists, verify results |
| **Key Trait** | Never writes code directly, only delegates |

**Orchestrator Responsibilities:**

| Responsibility | Description |
|----------------|-------------|
| **Plan Reading** | Understands the full plan from Layer 1 |
| **Wisdom Accumulation** | Gathers context from explore/librarian agents |
| **Task Delegation** | Assigns atomic tasks to Junior agents |
| **Result Verification** | Checks that delegated work meets requirements |
| **Progress Tracking** | Maintains todo list, ensures completion |

**Why Orchestrator Doesn't Write Code:**

1. **Context Preservation**: Writing code pollutes context with implementation details
2. **Optimal Model Usage**: Junior (cheaper) model is sufficient for code writing
3. **Quality Control**: Orchestrator can objectively verify Junior's output
4. **Delegation Practice**: Forces proper task decomposition

**Delegation Example:**
```typescript
// Orchestrator's perspective
// I need to add a user model to the database

// 1. First, gather context (parallel)
delegate_task(agent="explore", prompt="Find existing model patterns...")
delegate_task(agent="explore", prompt="Find database connection code...")
delegate_task(agent="librarian", prompt="Find Prisma best practices...")

// 2. Wait for results, accumulate wisdom
// explore: "Models use @prisma/client, defined in prisma/schema.prisma"
// librarian: "Use relations for connected models"

// 3. Delegate implementation
delegate_task(agent="junior", prompt=`
TASK: Add User model to Prisma schema
CONTEXT: Existing models in prisma/schema.prisma follow pattern X
MUST DO: Add id, email, passwordHash, createdAt, updatedAt
MUST NOT: Modify existing models
`)

// 4. Verify result
// Junior completes → Orchestrator checks → LSP diagnostics → Tests pass
```

---

## Layer 3: Worker Agents

Specialized agents that perform specific types of work.

### Junior: The Task Executor

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Sonnet 4.5 |
| **Role** | Execute delegated tasks, write code |
| **Key Trait** | Focused execution, no autonomous decision-making |

**Junior's Constraints:**
- Only does what's explicitly asked
- Doesn't make architectural decisions
- Follows existing patterns exactly
- Reports completion status

### Explore: The Codebase Searcher

| Attribute | Value |
|-----------|-------|
| **Model** | Grok Code |
| **Role** | Fast pattern search in codebase |
| **Key Trait** | Cheap, fast, parallel execution |

**Use Cases:**
- Find existing patterns to follow
- Locate files that need modification
- Discover dependencies
- Search for related code

**Usage Pattern:**
```typescript
// Fire multiple explores in parallel
delegate_task(agent="explore", run_in_background=true, 
  prompt="Find all authentication middleware")
delegate_task(agent="explore", run_in_background=true, 
  prompt="Find user model definition")
delegate_task(agent="explore", run_in_background=true, 
  prompt="Find route protection patterns")

// Continue working, collect results later
const results = await background_output(task_ids)
```

### Librarian: The Documentation Expert

| Attribute | Value |
|-----------|-------|
| **Model** | Big Pickle |
| **Role** | External documentation lookup, OSS examples |
| **Key Trait** | Access to external knowledge |

**Use Cases:**
- Official library documentation
- Best practices from OSS projects
- API reference lookup
- Framework-specific patterns

**Example:**
```typescript
delegate_task(agent="librarian", 
  prompt="Find JWT implementation examples in Express.js from official docs and popular OSS")

// Returns:
// - Official jsonwebtoken docs
// - Passport-jwt examples
// - Production patterns from well-known repos
```

### Oracle: The Strategic Advisor

| Attribute | Value |
|-----------|-------|
| **Model** | GPT-5.2 (Expensive) |
| **Role** | High-IQ reasoning, architecture advice |
| **Key Trait** | READ-ONLY - cannot write code |

**Why Read-Only:**
1. **Cost Control**: Prevents expensive mistakes
2. **Deliberate Handoff**: Forces orchestrator to translate advice into action
3. **Quality Assurance**: Separates thinking from doing

**When to Consult Oracle:**
| Situation | Action |
|-----------|--------|
| 2+ failed fix attempts | Consult Oracle |
| Complex architecture decisions | Consult Oracle |
| Unfamiliar code patterns | Consult Oracle |
| Security/performance concerns | Consult Oracle |

**Example:**
```typescript
// Orchestrator is stuck on a bug
delegate_task(agent="oracle", prompt=`
I've tried to fix this authentication bug twice:
- First attempt: Changed token validation → still fails
- Second attempt: Updated middleware order → still fails
Error: "Token expired" even with fresh tokens

Help me understand the root cause.
`)

// Oracle responds with analysis, orchestrator implements fix
```

### Frontend Engineer: UI/UX Specialist

| Attribute | Value |
|-----------|-------|
| **Model** | Gemini 3 |
| **Role** | Frontend implementation, styling, components |
| **Key Trait** | Optimized for visual/UI work |

### Multimodal Looker: Visual Analyzer

| Attribute | Value |
|-----------|-------|
| **Model** | Gemini 3 |
| **Role** | Analyze PDFs, images, diagrams |
| **Key Trait** | Can process visual inputs |

---

## Key Architectural Decisions

### Decision 1: Separation of Planning and Execution

| Aspect | Rationale |
|--------|-----------|
| **Why** | Prevents context pollution and goal drift |
| **Trade-off** | More tokens, but higher quality output |
| **Implementation** | Layer 1 produces plan, Layer 2 executes plan |

**Problem it Solves:**
```
WITHOUT SEPARATION:
User: "Add authentication"
Agent: Starts coding → Gets confused about scope → Adds unrelated features
       → Forgets original goal → Produces messy, incomplete code

WITH SEPARATION:
Layer 1: Creates detailed plan with all requirements
Layer 2: Executes plan step by step, stays focused
Result: Clean, complete implementation matching requirements
```

### Decision 2: Multi-Model Orchestration

| Aspect | Rationale |
|--------|-----------|
| **Why** | Different models excel at different tasks |
| **Trade-off** | Increased complexity, but optimal results per domain |
| **Implementation** | Categories route to domain-optimized models |

**Model Selection Logic:**
```typescript
switch(task.domain) {
  case "planning": return "claude-opus-4.5"      // Best reasoning
  case "coding": return "claude-sonnet-4.5"     // Good balance
  case "search": return "grok-code"             // Fast, cheap
  case "frontend": return "gemini-3"            // UI optimized
  case "strategic": return "gpt-5.2"            // Deep analysis
}
```

### Decision 3: Expensive Agents are READ-ONLY

| Aspect | Rationale |
|--------|-----------|
| **Why** | Oracle can advise but not write, preventing expensive mistakes |
| **Trade-off** | Can't fix code directly, must delegate |
| **Implementation** | Oracle has no write tools, only analysis |

### Decision 4: Cheap Agents Run in Background

| Aspect | Rationale |
|--------|-----------|
| **Why** | Explore/librarian fire liberally for parallel research |
| **Trade-off** | Token cost, but fast context gathering |
| **Implementation** | `run_in_background=true` for explore/librarian |

### Decision 5: Todo Continuation Enforcer

| Aspect | Rationale |
|--------|-----------|
| **Why** | System forces agent to continue if todos remain |
| **Trade-off** | Agents can't "lie" about being done |
| **Implementation** | Hook injects continuation prompts when session idles |

### Decision 6: Category-Based Delegation

| Aspect | Rationale |
|--------|-----------|
| **Why** | Tasks routed to domain-optimized models |
| **Trade-off** | Configuration complexity, but right model for right task |
| **Implementation** | `delegate_task(category="...")` |

### Decision 7: Hierarchical AGENTS.md

| Aspect | Rationale |
|--------|-----------|
| **Why** | Each module has its own knowledge base |
| **Trade-off** | Documentation overhead, but AI agents stay informed |
| **Implementation** | 9 AGENTS.md files across codebase |

---

## Module Boundaries

| Module | Lines (LOC) | Purpose | Extension Points |
|--------|-------------|---------|------------------|
| `src/agents/` | 10 agents | Agent definitions | `agentSources` in utils.ts |
| `src/hooks/` | 31 hooks | Lifecycle interception | `createXXXHook()` factory |
| `src/tools/` | 20+ tools | Agent capabilities | `builtinTools` object |
| `src/features/` | Background, skills, Claude compat | Core functionality | Loaders, managers |
| `src/mcp/` | 3 MCPs | External services | `createBuiltinMcps()` |
| `src/config/` | Zod schemas | Type-safe configuration | Schema validation |

### Source File Overview

```
src/
├── agents/                    # Agent definitions
│   ├── AGENTS.md             # Agent system documentation
│   ├── sisyphus.ts           # Main orchestrator
│   ├── junior.ts             # Task executor
│   ├── oracle.ts             # Strategic advisor
│   ├── explore.ts            # Codebase searcher
│   ├── librarian.ts          # Documentation expert
│   └── utils.ts              # Agent utilities
│
├── hooks/                     # Lifecycle hooks
│   ├── AGENTS.md             # Hook system documentation
│   ├── todo-continuation-enforcer.ts  # Forces completion
│   ├── comment-checker/      # AI slop detection
│   └── ...                   # Other hooks
│
├── tools/                     # Agent capabilities
│   ├── AGENTS.md             # Tool system documentation
│   ├── delegate-task/        # Category delegation
│   └── ...                   # Other tools
│
├── features/                  # Core functionality
│   ├── background-agent/     # Background task management
│   ├── builtin-skills/       # Skill definitions
│   └── opencode-skill-loader/ # Skill loading system
│
└── config/                    # Configuration
    └── schema.ts             # Zod config schemas
```

---

## See Also

- [00-core-philosophy.md](./00-core-philosophy.md) - Philosophy behind these decisions
- [02-design-patterns.md](./02-design-patterns.md) - Patterns used in implementation
- [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) - How to apply this architecture
- [04-prompt-engineering.md](./04-prompt-engineering.md) - How prompts structure agent behavior
- [06-agents-skills-reference/](./06-agents-skills-reference/) - Detailed agent implementations
