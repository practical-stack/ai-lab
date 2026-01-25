# Analysis Dimensions

Each dimension maps to a document in the output structure. This reference details what to extract for each.

## Dimension 00: Core Philosophy

**Output:** `00-core-philosophy.md`  
**Role:** WHY

### What to Extract

| Element | Source Signals | Questions to Answer |
|---------|----------------|---------------------|
| **Core Belief** | "never", "always", "must" statements | What fundamental truth drives this system? |
| **Trust Model** | Verification systems, completion checks | What does the system trust/distrust? |
| **Human Role** | Automation level, intervention patterns | How should humans interact? |
| **Quality Definition** | Success criteria, anti-patterns | What does "good enough" mean? |
| **Completion Model** | Evidence requirements, done conditions | How is "done" defined? |

### Source File Priorities

1. Main agent prompt (`*-prompt.md`, `system.md`)
2. Philosophy docs (`manifesto.md`, `philosophy.md`)
3. README / Contributing guides
4. Anti-pattern definitions

### Example Extraction

**Source:** "Human intervention is a failure signal - agents should complete work without babysitting"

**Extracted:**
- Core Belief: Autonomous completion
- Trust Model: Don't trust self-reported completion
- Human Role: Oversight, not operation
- Quality: Indistinguishable from senior engineer

---

## Dimension 01: Architecture

**Output:** `01-architecture.md`  
**Role:** WHAT

### What to Extract

| Element | Source Signals | Questions to Answer |
|---------|----------------|---------------------|
| **Layers** | Directory structure, file organization | What are the system's layers? |
| **Components** | Class/function definitions | What are the key components? |
| **Data Flow** | Function calls, event chains | How does information flow? |
| **Integration Points** | APIs, hooks, events | Where does the system connect? |

### Common LLM Architecture Patterns

| Pattern | Indicators | Characteristics |
|---------|------------|-----------------|
| **Three-Layer** | Planning/Orchestration/Execution | Clear separation of concerns |
| **Multi-Agent** | Multiple agent configs | Specialized agents for tasks |
| **Hierarchical Knowledge** | Nested AGENTS.md | Progressive disclosure |
| **Plugin System** | Skills/Commands directories | Extensible capabilities |

### Source File Priorities

1. `src/` or main source directory structure
2. Configuration files
3. Agent definitions
4. Tool registrations

---

## Dimension 02: Design Patterns

**Output:** `02-design-patterns.md`  
**Role:** HOW

### What to Extract

| Element | Source Signals | Questions to Answer |
|---------|----------------|---------------------|
| **Reusable Patterns** | Repeated structures | What patterns appear multiple times? |
| **Implementation Recipes** | Step-by-step sections | How do they implement X? |
| **Integration Patterns** | Combination of components | How do parts work together? |

### LLM-Specific Pattern Categories

| Category | Patterns to Look For |
|----------|---------------------|
| **Prompt Structure** | XML tags, phases, mandatory outputs |
| **Delegation** | 7-section prompts, session continuity |
| **Verification** | Evidence requirements, blocking checkpoints |
| **Knowledge Management** | Progressive disclosure, skill loading |
| **Error Handling** | Retry logic, graceful degradation |

### Source File Priorities

1. Main agent prompt (largest pattern source)
2. Skill definitions
3. Delegation logic
4. Hook implementations

---

## Dimension 03: Anti-Patterns

**Output:** `03-anti-patterns.md`  
**Role:** AVOID

### What to Extract

| Element | Source Signals | Questions to Answer |
|---------|----------------|---------------------|
| **Explicit Prohibitions** | "never", "don't", "avoid" | What's explicitly forbidden? |
| **Enforcement Mechanisms** | Hooks, checks, validators | How are anti-patterns prevented? |
| **Failure Conditions** | Error cases, blocking rules | What triggers failure? |

### Common LLM Anti-Pattern Categories

| Category | Common Anti-Patterns |
|----------|---------------------|
| **Type Safety** | `as any`, `@ts-ignore`, untyped responses |
| **Verification** | Empty catch, trusting "done", no evidence |
| **Communication** | Vague prompts, missing context, AI slop |
| **Architecture** | God agent, tight coupling, no separation |
| **Testing** | Deleting tests to pass, skipping verification |

### Source File Priorities

1. Main agent prompt (MUST NOT sections)
2. Linting/hook configurations
3. Pre-commit hooks
4. Code review guidelines

---

## Dimension 04: Prompt Engineering

**Output:** `04-prompt-engineering.md`  
**Role:** CRAFT

### What to Extract

| Element | Source Signals | Questions to Answer |
|---------|----------------|---------------------|
| **Structure Techniques** | XML tags, markdown formatting | How is the prompt structured? |
| **Emphasis Techniques** | CAPS, bold, repetition | How is importance conveyed? |
| **Flow Control** | Phases, decision trees | How is execution ordered? |
| **Output Control** | Templates, formats, examples | How is output shaped? |

### Prompt Engineering Technique Categories

| Category | Techniques to Identify |
|----------|----------------------|
| **Structural** | XML tags, nested sections, tables |
| **Behavioral** | Phases, blocking checkpoints, gates |
| **Output** | Templates, mandatory outputs, formats |
| **Defensive** | MUST NOT, anti-patterns, failure conditions |
| **Dynamic** | Conditional loading, template generation |

### Source File Priorities

1. Main agent prompt
2. Skill definitions
3. Command templates
4. Hook messages

---

## Dimension 05: Evaluation Methodology

**Output:** `05-eval-methodology.md`  
**Role:** VERIFY

### What to Extract

| Element | Source Signals | Questions to Answer |
|---------|----------------|---------------------|
| **Verification Systems** | Hooks, checkers, validators | What verifies completion? |
| **Evidence Requirements** | Completion criteria | What proof is needed? |
| **Failure Responses** | Error handling, recovery | What happens on failure? |
| **Quality Gates** | Blocking conditions | What prevents progression? |

### Common Verification Mechanisms

| Type | Purpose | Example |
|------|---------|---------|
| **Todo Continuation** | Ensure all tasks complete | Loop until todos done |
| **Comment Checker** | Prevent AI slop | Check for unnecessary comments |
| **Diagnostic Runner** | Code quality | LSP errors, build status |
| **Evidence Collector** | Proof of work | Screenshots, logs, outputs |
| **Health Checks** | Environment status | Doctor-style diagnostics |

### Source File Priorities

1. Hook implementations (`hooks/`, `*-enforcer.ts`)
2. Pre-commit configurations
3. CI/CD pipelines
4. Test configurations

---

## Dimension 06: Reference Examples

**Output:** `06-agents-skills-reference/`  
**Role:** REFERENCE

### What to Extract

| Element | Source Signals | Questions to Answer |
|---------|----------------|---------------------|
| **Agent Examples** | Agent definitions | How are agents structured? |
| **Skill Examples** | Skill directories | How are skills organized? |
| **Command Examples** | Command files | How are commands defined? |
| **Integration Examples** | Combination usage | How do components work together? |

### Selection Criteria

Choose examples that:
1. Demonstrate unique patterns
2. Are well-documented
3. Show different complexity levels
4. Cover different domains

### Documentation Format

For each example:
- Purpose and use case
- Key structural elements
- Notable implementation choices
- Patterns demonstrated
- Potential improvements

---

## Synthesis Dimension: Practical Guide

**Output:** `PRACTICAL-GUIDE.md` + `PRACTICAL-GUIDE.patterns/`  
**Role:** APPLY

### What to Synthesize

| Level | Criteria | Output |
|-------|----------|--------|
| **Quick Wins** | High impact, <2 hours effort | 3-5 patterns |
| **Foundation** | Medium effort, infrastructure | 5-7 patterns |
| **Full System** | High effort, complete adoption | 3-5 patterns |

### Pattern Guide Requirements

Each pattern guide must include:
1. Problem statement
2. Solution overview
3. Step-by-step implementation
4. Verification checklist
5. Common mistakes
6. Related patterns
