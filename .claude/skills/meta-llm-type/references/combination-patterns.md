# Combination Patterns

Most real-world features require **multiple component types** working together. This reference defines common combination patterns and when to use them.

## Architecture Model

```
Knowledge Layer:  Skill (knowledge)  |  Agent (reasoning)
Access Layer:     Command (optional UI + constraints wrapper)
```

**Key insight:** Command is NOT a parallel type to Skill/Agent. It is an **access pattern** — a UI + security wrapper placed over Skills or Agents when human entry point and platform constraints (allowed-tools, model, $ARGUMENTS) are needed.

---

## Pattern Overview

| Pattern | Structure | Complexity | Use When |
|---------|-----------|------------|----------|
| **Command + Agent** | Entry → Executor | Medium | User triggers complex multi-step work |
| **Agent + Skills** | Executor + Knowledge | Medium | Agent needs domain expertise |
| **Command + Skills** | Entry + Knowledge | Low | Procedure needs domain knowledge |
| **Full Stack** | Command → Agent → Skills → Tools | High | Complete feature implementation |

---

## Pattern 1: Command + Agent

**Structure:**
```
⚡ COMMAND: /feature-name (Entry Point)
    ↓
🤖 AGENT: feature-agent (Executor)
```

**When to Use:**
- User explicitly triggers complex work
- Multi-step planning required after trigger
- Dynamic branching based on input

**Example:**
```
/fix-bug → bug-fix-agent
/deploy → deployment-agent
/review-pr → code-review-agent
```

**Decision Criteria:**
| Aspect | Check |
|--------|-------|
| Human trigger required? | ✅ Yes |
| Multi-step planning? | ✅ Yes |
| Dynamic branching? | ✅ Yes |

---

## Pattern 2: Agent + Skills

**Structure:**
```
🤖 AGENT: feature-agent (Executor)
    ↓
📚 SKILL: domain-skill-1 (Knowledge)
📚 SKILL: domain-skill-2 (Knowledge)
```

**When to Use:**
- Agent needs domain expertise to execute
- Knowledge is reusable across multiple agents
- Keeping agent prompt concise

**Example:**
```
bug-fix-agent loads:
  - debugging skill
  - testing skill
  - coding-guidelines skill
```

**Decision Criteria:**
| Aspect | Check |
|--------|-------|
| Agent needs specialized knowledge? | ✅ Yes |
| Knowledge reusable elsewhere? | ✅ Yes |
| Avoid bloating agent prompt? | ✅ Yes |

---

## Pattern 3: Command + Skills (Command as Wrapper)

**Structure:**
```
⚡ COMMAND: /feature-name (Entry Point + Constraints)
     ↓
📚 SKILL: domain-skill (Knowledge)
```

**When to Use:**
- Skill needs platform-level constraints
- Tool sandboxing required (`allowed-tools`)
- Dangerous/irreversible operation
- Structured `$ARGUMENTS` validation needed
- Frequent human shortcut

**Example:**
```
/deploy (with allowed-tools: Bash(docker:*)) loads: deploy-skill
/lint-code (with structured args) loads: linting-rules skill
```

**Decision Criteria:**
| Aspect | Check |
|--------|-------|
| Skill exists? | ✅ Yes |
| Needs platform constraints? | ✅ Yes |
| Tool restriction needed? | ✅ Yes (or dangerous ops, or structured args) |
| No Command wrapper needed? | ❌ No - add wrapper |

**Anti-pattern:** Command wrapping a Skill without adding ANY platform constraints. If no constraints are needed, use the Skill directly.

---

## Pattern 4: Full Stack

**Structure:**
```
⚡ COMMAND: /feature-name (Entry Point)
    ↓
🤖 AGENT: feature-agent (Orchestration)
    ↓
📚 SKILL: skill-1 (Knowledge)
📚 SKILL: skill-2 (Knowledge)
    ↓
🔧 TOOL: tool-1 (Execution)
🔧 TOOL: tool-2 (Execution)
```

**When to Use:**
- Complete feature requiring all component types
- User triggers → Agent plans → Skills inform → Tools execute

**Example:**
```
/init-project
    → project-init-agent
        → scaffold skill
        → ci skill
            → file_write, git_init
```

**Decision Criteria:**
| Aspect | Check |
|--------|-------|
| Human trigger required? | ✅ Yes |
| Multi-step planning? | ✅ Yes |
| Multiple domains of expertise? | ✅ Yes |
| File/system operations needed? | ✅ Yes |

---

## Combination Decision Flow

```
[Feature Request]
       │
       ▼
┌─────────────────────────────────────┐
│ PHASE 1: Determine Core Type        │
│ Does it need multi-step planning?   │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ 🤖 AGENT (core type)
       │
       ▼ NO
┌─────────────────────────────────────┐
│ Does it need domain knowledge?      │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ 📚 SKILL (core type)
       │
       ▼ NO
       Embed in existing component
       
       ═══════════════════════════════════════
       
┌─────────────────────────────────────┐
│ PHASE 2: Determine if Command       │
│ Wrapper is Needed                   │
│ Does it need platform constraints?  │
│ (allowed-tools, dangerous ops,      │
│  structured args, frequent shortcut)│
└─────────────────────────────────────┘
       │
       ├── YES ──▶ ⚡ COMMAND (wrapper)
       │          Add Command layer over Skill/Agent
       │
       ▼ NO
       Use Skill or Agent directly
```

---

## Component Quantity Guidelines

| Component | Recommended | Maximum | Notes |
|-----------|-------------|---------|-------|
| Command | 1 | 1 | Single entry point per feature |
| Agent | 1 | 2 | Sub-agent for delegation only |
| Skills | 1-3 | 5 | Extract if reusable elsewhere |
| Tools | As needed | - | Defined by platform |

---

## Anti-Patterns

### Anti-Pattern 1: Skill Does Everything

❌ **Wrong:**
```
📚 SKILL: do-everything
  - Plans work
  - Makes decisions
  - Executes actions
```

✅ **Correct:**
```
🤖 AGENT: executor
    ↓
📚 SKILL: domain-knowledge (inform only)
```

### Anti-Pattern 2: Command Contains Logic (or wraps without constraints)

❌ **Wrong - Command with embedded logic:**
```
⚡ COMMAND: /deploy
  - if staging then...
  - else if prod then...
  - handle rollback...
```

✅ **Correct:**
```
⚡ COMMAND: /deploy (entry only)
     ↓
🤖 AGENT: deploy-agent (handles all logic)
```

❌ **Wrong - Command wrapping Skill without constraints:**
```
⚡ COMMAND: /organize-skill
     ↓
📚 SKILL: meta-skill
(No tool restriction, not dangerous, no structured args)
→ This Command adds nothing. Use Skill directly.
```

✅ **Correct:**
```
📚 SKILL: meta-skill (invoked directly)
(No Command wrapper needed - no platform constraints)
```

### Anti-Pattern 3: Agent Has Hardcoded Knowledge

❌ **Wrong:**
```
🤖 AGENT: reviewer
  - (500 lines of code review rules embedded)
```

✅ **Correct:**
```
🤖 AGENT: reviewer (concise)
    ↓
📚 SKILL: code-review-rules (extracted knowledge)
```

### Anti-Pattern 4: Unintentional Skill Coupling

> **Note**: The Claude Code platform officially supports Skill → Skill invocation via the `Skill` tool. The guidance below is a **project convention** for managing complexity, not a platform limitation.

#### When Skill → Skill Invocation Is Appropriate

Skills CAN invoke other skills when:
- **Hierarchical composition**: A parent skill delegates a well-defined sub-task (e.g., `ralplan` → `plan`)
- **Setup/teardown**: A skill invokes another for initialization (e.g., `omc-setup` → `hud`)
- **Clear dependency direction**: The invocation graph is acyclic and intentional

#### When to Prefer Declarative References

For **knowledge-oriented skills** in this project, prefer declarative references over imperative invocations to avoid coupling:

```markdown
## Related Resources
- Skill creation patterns: see `meta-skill-creator/references/`
- Frontmatter schema: see `doc-frontmatter/references/schema.md`
```

#### Anti-Pattern: Hidden Spaghetti Dependencies

❌ **Wrong — skill calls multiple unrelated skills without clear purpose:**
```markdown
## Next Steps
Load skill: meta-skill-creator
Use skill: doc-frontmatter
Use skill: llm-repo-analysis
Run /create-llm-structure
```

✅ **Correct — intentional composition with clear dependency:**
```markdown
When invoked, delegate frontmatter generation to `doc-frontmatter`:
Invoke Skill: doc-frontmatter
```

**Key Distinction:**

| Pattern | Example | Guidance |
|---------|---------|----------|
| Intentional composition | Parent skill → child skill (clear purpose) | ✅ Allowed |
| Declarative reference | "See X for patterns" | ✅ Preferred for knowledge |
| Spaghetti invocation | Skill calls 3+ unrelated skills | ⚠️ Reconsider — may need Command/Agent |

**Why This Matters:**
- Excessive skill-to-skill coupling creates hidden dependency graphs
- If a skill needs to orchestrate 3+ other skills, consider using a **Command** (deterministic pipeline) or **Agent** (dynamic reasoning)
- Keep the invocation graph shallow and intentional

---

## Combination Output Template

When diagnosing a feature, output combination recommendation:

```markdown
## Recommended Combination

### Architecture Diagram
```
⚡ COMMAND: /command-name (Entry Point)
    ↓
🤖 AGENT: agent-name (Orchestration)
    ↓
📚 SKILL: skill-1 (Knowledge Domain 1)
📚 SKILL: skill-2 (Knowledge Domain 2)
    ↓
🔧 TOOL: tool-1, tool-2 (Execution)
```

### Component Summary

| Component | Name | Purpose |
|-----------|------|---------|
| Command | /command-name | User entry point |
| Agent | agent-name | Reasoning & orchestration |
| Skill | skill-1 | Domain expertise 1 |
| Skill | skill-2 | Domain expertise 2 |

### Why This Combination?

1. [Reason for Command/no Command]
2. [Reason for Agent/no Agent]
3. [Reason for each Skill]
```
