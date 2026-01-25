# Combination Patterns

Most real-world features require **multiple component types** working together. This reference defines common combination patterns and when to use them.

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

## Pattern 3: Command + Skills

**Structure:**
```
⚡ COMMAND: /feature-name (Entry Point)
    ↓
📚 SKILL: domain-skill (Knowledge)
```

**When to Use:**
- Fixed procedure with domain knowledge
- No dynamic planning needed
- Knowledge is reusable

**Example:**
```
/lint-code loads: linting-rules skill
/format loads: formatting-standards skill
```

**Decision Criteria:**
| Aspect | Check |
|--------|-------|
| Human trigger required? | ✅ Yes |
| Fixed procedure? | ✅ Yes |
| Domain knowledge needed? | ✅ Yes |
| No dynamic branching? | ✅ Yes |

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
│ Does it need domain knowledge?      │
└─────────────────────────────────────┘
       │
       ├── NO ──▶ Single component (Command/Agent)
       │
       ▼ YES
┌─────────────────────────────────────┐
│ Does it need multi-step planning?   │
└─────────────────────────────────────┘
       │
       ├── NO ──▶ Command + Skills
       │
       ▼ YES
┌─────────────────────────────────────┐
│ Does user need to trigger it?       │
└─────────────────────────────────────┘
       │
       ├── NO ──▶ Agent + Skills
       │
       ▼ YES
       Full Stack (Command → Agent → Skills)
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

### Anti-Pattern 2: Command Contains Logic

❌ **Wrong:**
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
