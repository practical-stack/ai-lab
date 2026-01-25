# Workflow: Analyze Repository

Step-by-step workflow for analyzing an LLM agent/plugin repository.

## Phase 0: Setup

### 0.1 Access Repository

```bash
# If remote URL
git clone <repo-url> refs/<repo-name>

# If local path
cd <path>
```

### 0.2 Initial Exploration

Gather structural overview:

```bash
# Directory structure
find . -type f -name "*.md" | head -50
find . -type f -name "*.ts" -o -name "*.tsx" | head -50

# Key files
ls -la README.md AGENTS.md CLAUDE.md 2>/dev/null
ls -la src/ docs/ skills/ agents/ commands/ hooks/ 2>/dev/null
```

### 0.3 Identify Entry Points

| Priority | File Pattern | Purpose |
|----------|--------------|---------|
| 1 | `*-prompt.md`, `system*.md` | Main agent prompt |
| 2 | `AGENTS.md`, `CLAUDE.md` | Agent instructions |
| 3 | `README.md`, `docs/` | Project overview |
| 4 | `package.json`, `pyproject.toml` | Dependencies & structure |

---

## Phase 1: Philosophy Extraction (→ 00-core-philosophy.md)

### 1.1 Find Philosophy Statements

Search for belief indicators:

```bash
# Strong beliefs
grep -ri "never\|always\|must\|critical" --include="*.md" | head -30

# Anti-patterns
grep -ri "do not\|don't\|avoid\|anti-pattern" --include="*.md" | head -30

# Failure conditions
grep -ri "fail\|error\|wrong\|block" --include="*.md" | head -30
```

### 1.2 Extract Core Beliefs

For each finding, categorize:

| Category | Question | Example |
|----------|----------|---------|
| **Trust** | What does the system trust/distrust? | "Never trust self-reported completion" |
| **Human Role** | How should humans interact? | "Human intervention = failure" |
| **Quality** | What defines quality? | "Indistinguishable from senior engineer" |
| **Completion** | How is "done" defined? | "Evidence required, not claims" |

### 1.3 Output Format

```markdown
# Core Philosophy

## The One-Liner
> "[Single sentence capturing the core belief]"

## Core Beliefs
| Belief | Evidence | Implication |
|--------|----------|-------------|
| [Belief 1] | [Quote from source] | [How it affects design] |

## Design Principles
1. [Principle 1]
2. [Principle 2]
...
```

---

## Phase 2: Architecture Analysis (→ 01-architecture.md)

### 2.1 Identify Layers

```bash
# Agent definitions
find . -name "*agent*.md" -o -name "*agent*.ts" | head -20

# Skills/Knowledge
find . -name "*skill*" -o -name "*knowledge*" | head -20

# Tools/Execution
find . -name "*tool*.ts" -o -name "*execute*" | head -20

# Hooks/Verification
find . -name "*hook*" -o -name "*verify*" | head -20
```

### 2.2 Map System Layers

| Layer | Components | Responsibility |
|-------|------------|----------------|
| **Planning** | [identify] | Strategic decisions |
| **Orchestration** | [identify] | Task coordination |
| **Execution** | [identify] | Actual work |
| **Verification** | [identify] | Quality checks |

### 2.3 Data Flow Analysis

Trace how information flows:
1. User request → Entry point
2. Entry point → Orchestrator
3. Orchestrator → Workers
4. Workers → Verification
5. Verification → Response

### 2.4 Output Format

```markdown
# Architecture

## System Overview
[ASCII diagram of layers]

## Layer Analysis
### Planning Layer
- Components: [list]
- Responsibility: [description]
- Key Files: [paths]

### Orchestration Layer
...

## Data Flow
[Numbered flow description]
```

---

## Phase 3: Pattern Extraction (→ 02-design-patterns.md)

### 3.1 Identify Reusable Patterns

Load [pattern-recognition.md](../references/pattern-recognition.md) and search for:

| Pattern Category | Search Terms | Files |
|-----------------|--------------|-------|
| Delegation | `delegate`, `task`, `prompt` | `*.ts`, `*.md` |
| Verification | `verify`, `check`, `evidence` | `hooks/`, `*.ts` |
| Progressive Disclosure | `AGENTS.md`, `skill`, `reference` | `*.md` |
| Blocking Checkpoints | `BLOCKING`, `MANDATORY`, `STOP` | `*.md` |

### 3.2 Document Each Pattern

For each identified pattern:

```markdown
## Pattern: [Name]

### Problem
[What problem does this solve?]

### Solution
[How does it solve it?]

### Implementation
[Code/prompt example from repo]

### When to Use
[Applicability criteria]
```

---

## Phase 4: Anti-Pattern Analysis (→ 03-anti-patterns.md)

### 4.1 Find Explicit Anti-Patterns

```bash
grep -ri "don't\|do not\|never\|anti-pattern\|wrong\|bad" --include="*.md" | head -50
```

### 4.2 Categorize Anti-Patterns

| Category | Examples | Severity |
|----------|----------|----------|
| **Type Safety** | `as any`, `@ts-ignore` | Critical |
| **Verification** | Empty catch, trusting "done" | Critical |
| **Architecture** | Tight coupling, god objects | High |
| **Communication** | Vague prompts, missing context | Medium |

### 4.3 Extract Enforcement Mechanisms

How does the system prevent anti-patterns?
- Pre-commit hooks?
- Runtime checks?
- Prompt-level constraints?

---

## Phase 5: Prompt Engineering Analysis (→ 04-prompt-engineering.md)

### 5.1 Analyze Main Prompt Structure

Read the main agent prompt and identify:

| Element | Example | Purpose |
|---------|---------|---------|
| **XML Tags** | `<critical>`, `<blocking>` | Structure & emphasis |
| **Tables** | Decision matrices | Quick reference |
| **Phases** | "Phase 1: ...", "Phase 2: ..." | Sequential workflow |
| **Mandatory Outputs** | "You MUST output..." | Blocking checkpoints |

### 5.2 Document Prompt Techniques

For each technique found:
- What is it?
- Why is it used?
- Example from the repo
- When to apply it yourself

---

## Phase 6: Verification Systems (→ 05-eval-methodology.md)

### 6.1 Find Verification Mechanisms

```bash
find . -name "*hook*" -o -name "*check*" -o -name "*verify*" -o -name "*enforcer*"
```

### 6.2 Document Each Mechanism

| Mechanism | Trigger | What it Checks | Failure Action |
|-----------|---------|----------------|----------------|
| [Name] | [When] | [What] | [Consequence] |

---

## Phase 7: Reference Examples (→ 06-agents-skills-reference/)

### 7.1 Select Representative Examples

Choose 2-3 examples each of:
- Agents (different types/purposes)
- Skills (different domains)

### 7.2 Document with Structure

For each example:
- Purpose
- Key Features
- Notable Implementation Details
- Patterns Demonstrated

---

## Phase 8: Synthesis (→ PRACTICAL-GUIDE.md)

### 8.1 Identify Top Patterns

From all analysis, identify:
- 3-5 "Quick Win" patterns (high impact, low effort)
- 5-7 "Foundation" patterns (medium effort)
- 3-5 "Advanced" patterns (high effort)

### 8.2 Create Adoption Path

Map patterns to adoption levels:
1. **Level 1**: What to do in first day
2. **Level 2**: What to do in first week
3. **Level 3**: Full system implementation

### 8.3 Generate Pattern Guides

For each pattern, create `PRACTICAL-GUIDE.patterns/NN-pattern-name.md` with:
- Problem addressed
- Solution overview
- Step-by-step implementation
- Example code/prompts
- Verification checklist
