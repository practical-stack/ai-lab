# Core Philosophy

**Document:** 00-core-philosophy.md  
**Part of:** Oh-My-OpenCode Repository Analysis  
**Source:** `docs/ultrawork-manifesto.md`, `src/agents/AGENTS.md`

---

## The One-Liner

> "Human intervention is a failure signal - agents should complete work without babysitting, producing code indistinguishable from a senior engineer's."

This single sentence encapsulates the entire philosophy of Oh-My-OpenCode. Every design decision, every constraint, every pattern flows from this core belief.

---

## Fundamental Beliefs

### 1. Human Intervention = Failure

| Aspect | Description |
|--------|-------------|
| **Core Claim** | When you find yourself fixing AI's half-finished code, that's not "human-AI collaboration." That's the AI failing to do its job. |
| **Source** | `docs/ultrawork-manifesto.md` |
| **Implication** | The system is designed to minimize the need for human correction, not to "assist" humans. |

**Example of Failure:**
```
User: "Add authentication to the app"
AI: "I've started implementing auth. You'll need to finish the token validation."
      ↑ THIS IS FAILURE - The AI should have completed the entire task
```

**Example of Success:**
```
User: "Add authentication to the app"
AI: Implements complete auth system with:
    - User model
    - JWT token generation/validation
    - Middleware
    - Tests
    - Documentation
    User only reviews and approves.
```

### 2. Indistinguishable Code

| Aspect | Description |
|--------|-------------|
| **Core Claim** | Code written by the agent should be indistinguishable from code written by a senior engineer. |
| **Source** | `docs/ultrawork-manifesto.md` |
| **Implication** | Not "AI-generated code that needs cleanup." The actual, final, production-ready code. |

**What "Indistinguishable" Means:**

| Criterion | Good (Indistinguishable) | Bad (AI Slop) |
|-----------|--------------------------|---------------|
| **Patterns** | Follows existing codebase patterns exactly | Introduces new patterns without reason |
| **Error Handling** | Proper error handling without being asked | Generic try/catch or no handling |
| **Tests** | Tests that actually test the right things | Tests that only check happy path |
| **Comments** | Comments only when they add value | Excessive obvious comments |
| **Abstractions** | Appropriate level of abstraction | Over-engineering, unnecessary interfaces |

**Anti-Pattern: AI Slop**

```typescript
// BAD: AI Slop - excessive comments, generic naming
// This function gets the user by their ID
// It takes an id parameter and returns a user object
// If the user is not found, it returns null
async function getUser(id: string) {
  // Get the data from the database
  const data = await db.query(...)
  // Return the result
  return data
}

// GOOD: Indistinguishable from senior engineer
async function getUserById(id: string): Promise<User | null> {
  return db.users.findUnique({ where: { id } })
}
```

### 3. Separation of Planning and Execution

| Aspect | Description |
|--------|-------------|
| **Core Claim** | Traditional AI agents often mix planning and execution, leading to context pollution, goal drift, and AI slop. |
| **Source** | `docs/guide/understanding-orchestration-system.md` |
| **Implication** | Oh-My-OpenCode separates these into distinct layers with different agents. |

**Problems with Mixed Planning/Execution:**

| Problem | Description | Example |
|---------|-------------|---------|
| **Context Pollution** | Execution details contaminate planning context | Debugging logs mixed with architecture decisions |
| **Goal Drift** | Agent loses sight of original goal while executing | Starts adding unrelated features mid-task |
| **AI Slop** | Quality degrades as context window fills | Later code is worse than earlier code |
| **Token Waste** | Repeating planning context in execution | Re-explaining the goal every function |

**Oh-My-OpenCode's Solution:**

```
LAYER 1: PLANNING (Prometheus/Metis/Momus)
├── Understands the full scope
├── Creates detailed plan
├── Reviews for gaps
└── Outputs: Plan document (not code)

LAYER 2: EXECUTION (Sisyphus/Junior)
├── Reads the plan
├── Executes step by step
├── Stays focused on current step
└── Outputs: Working code
```

### 4. Token Efficiency with Productivity Trade-off

| Aspect | Description |
|--------|-------------|
| **Core Claim** | Higher token usage is acceptable if it significantly increases productivity. |
| **Source** | `docs/ultrawork-manifesto.md` |
| **Implication** | Don't optimize for tokens if it sacrifices output quality. |

**The Trade-off Matrix:**

| Approach | Token Cost | Productivity | Net Value |
|----------|------------|--------------|-----------|
| Single agent, minimal prompting | Low | Low (needs human fixes) | Low |
| Multi-agent with parallelization | High | Very High (complete output) | **High** |
| Extensive context + verification | Medium-High | High (fewer errors) | **High** |

**Example: Parallel Exploration**

```typescript
// EXPENSIVE IN TOKENS, BUT VALUABLE
delegate_task(agent="explore", run_in_background=true, prompt="Find auth patterns...")
delegate_task(agent="explore", run_in_background=true, prompt="Find error handling...")
delegate_task(agent="librarian", run_in_background=true, prompt="Get JWT docs...")

// These run in parallel - 3x the tokens, but:
// - Faster wall-clock time
// - More comprehensive context
// - Better final output
```

### 5. Never Trust Agent Self-Reports

| Aspect | Description |
|--------|-------------|
| **Core Claim** | NEVER trust "I'm done" - verify outputs. |
| **Source** | `src/agents/AGENTS.md` |
| **Implication** | System must verify completion independently, not rely on agent claims. |

**Why Agents "Lie":**

| Reason | Description | Mitigation |
|--------|-------------|------------|
| **Optimistic Completion** | Agent believes task is done when it's partially done | Todo Continuation Enforcer |
| **Context Window Limits** | Agent forgets earlier requirements | Explicit checklists |
| **Cognitive Shortcuts** | Agent skips "unimportant" steps | BLOCKING checkpoints |
| **Misunderstanding Scope** | Agent completes different task than requested | Verification requirements |

**Verification Architecture:**

```
Agent says: "I'm done!"
                ↓
Todo Continuation Enforcer checks:
├── All todos marked complete? No → Inject continuation prompt
├── Background tasks running? Yes → Wait
├── LSP diagnostics clean? No → Force fixes
└── Build passing? No → Force fixes
                ↓
Only then: Actually complete
```

---

## The Ultrawork Manifesto Summary

From `docs/ultrawork-manifesto.md`, the five pillars:

### Pillar 1: Human Intervention = Bottleneck

> "Repeated 3x for emphasis"

The manifesto literally repeats this concept three times. Any time a human needs to:
- Fix incomplete code
- Clarify requirements mid-task
- Manually test something
- Clean up AI artifacts

...the system has failed.

### Pillar 2: Indistinguishable Code

AI output must match senior engineer quality:
- Proper naming conventions
- Appropriate abstraction levels
- Complete error handling
- Meaningful tests
- Documentation where needed

### Pillar 3: Token Cost vs Productivity

Spend tokens for 10-100x productivity gains:

| Investment | Return |
|------------|--------|
| Parallel exploration agents | Faster context gathering |
| Comprehensive prompts | Fewer iterations |
| Multi-model orchestration | Right tool for each task |
| Extensive verification | No human fixes needed |

### Pillar 4: Minimize Human Cognitive Load

User expresses intent, agent handles everything:

```
User Input: "Add dark mode to the settings page"

Agent Handles:
├── Reading existing theme implementation
├── Understanding component patterns
├── Implementing toggle component
├── Adding theme context/state
├── Updating relevant components
├── Adding persistence
├── Writing tests
├── Updating documentation
└── Creating PR

User Output: Reviews PR, approves or requests changes
```

### Pillar 5: Predictable, Continuous, Delegatable

Work like a compiler: markdown in, working code out.

| Property | Description |
|----------|-------------|
| **Predictable** | Same input → same quality output |
| **Continuous** | Never stops with partial work |
| **Delegatable** | Can hand off to specialists |

---

## Practical Implications

### For Agent Design

1. **Agents must have completion criteria** - Not "work until reasonable," but "work until X, Y, Z verified"
2. **Agents must be verifiable** - External systems check their work
3. **Agents must delegate** - No single agent tries to do everything

### For Prompt Engineering

1. **Be exhaustive** - Include ALL requirements, even "obvious" ones
2. **Include constraints** - What the agent must NOT do
3. **Define success** - Explicit criteria for completion

### For System Architecture

1. **Separate concerns** - Planning ≠ Execution ≠ Verification
2. **Trust but verify** - Every claim needs evidence
3. **Fail loudly** - When things go wrong, stop and report

---

## Key Quotes from Source

| Quote | Source | Context |
|-------|--------|---------|
| "When you find yourself fixing the AI's half-finished code... that's the AI failing to do its job." | `ultrawork-manifesto.md` | Defining failure |
| "Code written by the agent should be indistinguishable from code written by a senior engineer." | `ultrawork-manifesto.md` | Quality standard |
| "Traditional AI agents often mix planning and execution, leading to context pollution, goal drift, and AI slop." | `understanding-orchestration-system.md` | Separation rationale |
| "Higher token usage is acceptable if it significantly increases productivity." | `ultrawork-manifesto.md` | Token trade-off |
| "NEVER trust 'I'm done' - verify outputs" | `src/agents/AGENTS.md` | Trust model |

---

## See Also

- [01-architecture.md](./01-architecture.md) - How these philosophies manifest in system design
- [02-design-patterns.md](./02-design-patterns.md) - Patterns that implement these beliefs
- [03-anti-patterns.md](./03-anti-patterns.md) - What violates these principles
- [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) - How to apply these philosophies to your project
- [05-eval-methodology.md](./05-eval-methodology.md) - How the system verifies adherence
