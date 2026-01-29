---
title: "Module 1: AI Agent Architecture Fundamentals"
description: "Core concepts of Command, Skill, and Agent - the three pillars of AI coding assistants and when to use each component type"
type: tutorial
tags: [AI, Architecture]
order: 1
related: [./01-fundamentals.ko.md]
---

# Module 1: AI Agent Architecture Fundamentals

> Understanding the Two-Layer Architecture: Core Types (Skill & Agent) + Optional Command Wrapper

## Learning Objectives

By the end of this module, you will:
- Understand the two-layer architecture model (Knowledge Layer + Access Layer)
- Know the core differences between Skill and Agent
- Understand when a Command wrapper is needed (and when it's not)
- Be able to explain the role of each in an AI coding assistant system

---

## 1.1 Architecture Model: Two Layers

AI coding assistants like Claude Code, Cursor, and OpenCode organize their capabilities into two distinct layers:

### Knowledge Layer (Core Types)

| Component | Analogy | Role |
|-----------|---------|------|
| **Skill** | Training/Knowledge | The "how" - domain expertise and procedures |
| **Agent** | Employee | The "who" - intelligent worker with reasoning capability |

### Access Layer (Optional Wrapper)

| Component | Analogy | Role |
|-----------|---------|------|
| **Command** | Work Order with Restrictions | UI entry point + platform constraints over Skill/Agent |

> **Key insight**: Command is NOT a parallel type to Skill/Agent. It is an **access pattern** — a UI + security wrapper placed over Skills or Agents when human entry point and platform constraints are needed.

```
┌─────────────────────────────────────────┐
│  Access Layer (optional)                │
│  ┌───────────────────────────────────┐  │
│  │ Command (UI + constraints)       │  │
│  │ • allowed-tools restriction      │  │
│  │ • $ARGUMENTS validation          │  │
│  │ • /shortcut in menu              │  │
│  └──────────────┬────────────────────┘  │
│                 │ wraps                  │
├─────────────────┼───────────────────────┤
│  Knowledge Layer│(core types)           │
│                 ▼                       │
│  ┌─────────────────┐                   │
│  │   Agent / Skill │                   │
│  │  (Reasoning /   │                   │
│  │   Knowledge)    │                   │
│  └────────┬────────┘                   │
│           │ uses                        │
│  ┌─────────────────┐                   │
│  │     Tools       │                   │
│  └─────────────────┘                   │
└─────────────────────────────────────────┘
```

---

## 1.2 Command: Optional Access Layer Wrapper

### Definition

A **Command** is an optional wrapper that provides a human-triggered entry point with platform constraints over a Skill or Agent. It's like a controlled button that says "do this specific thing with these restrictions."

> **Important**: Commands are NOT always needed. If a Skill can be directly invoked via `@path` or auto-loaded on keywords, and no tool restrictions are required, skip the Command.

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Trigger** | Explicit user invocation (e.g., `/deploy`, `/create-issue`) |
| **Behavior** | Deterministic - follows a fixed procedure |
| **Format** | Markdown file with optional YAML frontmatter |
| **Location** | `.claude/commands/` or similar directory |
| **Purpose** | UI entry point + platform constraints (`allowed-tools`, `$ARGUMENTS`) |

### Example Command

```markdown
---
allowed-tools: Bash(git:*), Bash(npm:*)
description: Fix a GitHub issue following project conventions
---

Fix issue #$1 with priority $2.

Current git status: !`git status`
Follow the coding standards in @CONVENTIONS.md
```

### When Commands ARE Needed

- `allowed-tools` restriction is required (tool sandboxing)
- Dangerous/irreversible operations need explicit human trigger
- Structured `$ARGUMENTS` with validation
- Frequent human shortcut (discoverability in `/` menu)

### When Commands Are NOT Needed

- The Skill can be directly invoked via `@path` or auto-loaded
- No tool restriction is required
- The agent can handle the task automatically
- Adding a Command would just be a thin pass-through with no constraints

### Quick Quiz

**Q1:** A user wants a feature that automatically formats code when they save a file. Should this be a Command?

<details>
<summary>Answer</summary>

**No.** Commands require explicit user invocation. Auto-formatting on save should be a **Skill** that the agent applies automatically when detecting file changes. No Command wrapper is needed since there are no tool restrictions or dangerous ops involved.
</details>

---

## 1.3 Skill: "How to Do It"

### Definition

A **Skill** is packaged domain expertise that shapes how an agent approaches problems. Skills don't execute code directly - they provide knowledge and procedures.

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Trigger** | Auto-loaded based on context/keywords |
| **Behavior** | Provides guidance, not execution |
| **Format** | Folder with `SKILL.md` + supporting files |
| **State** | Stateless - behaves the same each time loaded |

### Skill Structure

```
skills/
└── code-review/
    ├── SKILL.md           # Main skill definition
    ├── workflows/
    │   ├── security.md    # Security review procedure
    │   └── performance.md # Performance review procedure
    └── references/
        └── checklist.md   # Review checklist
```

### Example SKILL.md

```yaml
---
name: code-review
description: |
  Reviews code for security and performance issues.
  USE WHEN: "review code", "check PR", "security audit"
  DO NOT USE WHEN: "write new code", "refactor"
---

## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Security issues | workflows/security.md |
| Performance issues | workflows/performance.md |

## Core Principles

1. Focus on substantive issues, not style nitpicks
2. Always provide specific line references
3. Suggest fixes, not just problems
```

### When to Use Skills

- Domain knowledge that agents should auto-load when relevant
- Reusable procedures across multiple workflows
- Best practices and guidelines
- Knowledge that doesn't require user triggering

### Quick Quiz

**Q2:** A coding style guide that should apply to ALL code changes. Should this be a Skill?

<details>
<summary>Answer</summary>

**Maybe not.** If rules must ALWAYS apply without exception, they should be in the agent's system prompt or as permanent "Rules" (like `.cursorrules`). Skills are for knowledge loaded "when needed", not always-on requirements.
</details>

---

## 1.4 Agent: "Who Performs the Work"

### Definition

An **Agent** is an intelligent work coordinator - an LLM instance with a specific role and goal. Agents reason, plan, and dynamically select tools and skills.

### Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Trigger** | Goal assignment or user request |
| **Behavior** | Autonomous reasoning and planning |
| **Memory** | Maintains context and conversation history |
| **Scope** | Has defined permissions and tool access |

### What Agents Do

1. **Receive goals** from users or parent systems
2. **Plan** how to achieve the goal
3. **Load skills** when specialized knowledge is needed
4. **Call tools** to perform actual work
5. **Reason** through multi-step problems
6. **Spawn sub-agents** for parallel work (when needed)

### Example Agent Definition

```yaml
name: bug-fix-agent
description: "Finds and fixes bugs from issue reports"
capabilities:
  skills: [code-review, testing, debugging]
  tools: [file_search, code_editor, test_runner]
autonomy:
  max_steps: 15
  requires_approval: [push_to_remote, merge_pr]
```

### When to Use Agents

- Task requires dynamic tool selection
- Multi-step reasoning with feedback loops
- Must adapt to unexpected situations
- Outcome depends on intermediate results

### Quick Quiz

**Q3:** A task to "find all TODO comments in the codebase" - does this need an agent?

<details>
<summary>Answer</summary>

**No.** This is a simple, deterministic task that can be done with a single tool (grep/search). No reasoning or planning needed. Could be a simple Command or even just a tool call.
</details>

---

## 1.5 Comparing Components

### Core Types (Knowledge Layer)

| Aspect | Skill | Agent |
|--------|-------|-------|
| **Role** | "How to do it" | "Who does it" |
| **Trigger** | Auto/keyword / `@path` | Goal assignment |
| **Reasoning** | None | Yes (LLM) |
| **Execution** | No execution (knowledge) | Dynamic |
| **State** | Stateless | Has context |
| **Reusability** | High | Low |

### Optional Wrapper (Access Layer)

| Aspect | Command |
|--------|---------|
| **Role** | UI entry point + constraints |
| **Trigger** | Human explicit (`/command`) |
| **Purpose** | `allowed-tools`, dangerous ops, `$ARGUMENTS`, `/` shortcut |
| **Wraps** | Skill or Agent |

### The Key Distinction

```
┌─────────────────────────────────────────────────────────┐
│  Knowledge Layer (core types):                          │
│                                                         │
│  Skill = "How" (knowledge, expertise, no execution)     │
│  Agent = "Who" (reasoning, planning, dynamic choices)   │
│                                                         │
│  Access Layer (optional wrapper):                       │
│                                                         │
│  Command = UI + constraints wrapper over Skill/Agent    │
│  (Only when allowed-tools, dangerous ops, $ARGS needed) │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 1.6 Platform Terminology Mapping

Different platforms use different terms. Here's a mapping:

| Concept | Claude Code | Cursor | OpenCode | GitHub Copilot |
|---------|-------------|--------|----------|----------------|
| Command | `.claude/commands/*.md` | `.cursor/commands/*.md` | `.opencode/commands/*.md` | N/A |
| Skill | `.claude/skills/*/SKILL.md` | `.cursor/rules/*.mdx` | `skills/*/SKILL.md` | N/A |
| Agent | Single agent | Agent mode | Build, Plan modes | Chat-focused |
| Rules | `CLAUDE.md` | `.cursorrules` | `AGENTS.md` | `copilot-instructions.md` |

---

## 1.7 Exercises

### Exercise 1: Classify the Feature

For each feature below, decide: **Command, Skill, or Agent?**

1. Deploy the application to production environment
2. Knowledge about React best practices
3. Analyze a bug report, find the cause, and create a PR fix
4. Generate API documentation from code comments
5. TypeScript coding standards for the project

<details>
<summary>Answers</summary>

1. **Command** - Explicit trigger needed, potentially dangerous operation
2. **Skill** - Domain knowledge, auto-loaded when working with React
3. **Agent** - Multi-step reasoning, adapts based on findings
4. **Command or Agent** - Command if simple, Agent if needs to understand code context
5. **Skill or Rule** - Skill if contextual, Rule if always applied
</details>

### Exercise 2: Design a Feature

**Scenario:** You want to create a feature that reviews pull requests for common issues.

Write down:
1. What component type would this be?
2. What would be the trigger?
3. What skills/tools would it need?
4. What would be the output?

<details>
<summary>Sample Answer</summary>

**Component Type:** Agent (multi-step reasoning required)

**Trigger:** Command like `/review-pr` or auto-triggered on PR creation

**Skills needed:**
- `code-review` - General review practices
- `security` - Security vulnerability checks
- `performance` - Performance anti-patterns

**Tools needed:**
- `file_read` - Read PR diff
- `github_api` - Fetch PR details, post comments
- `search_code` - Find related code

**Output:**
- List of issues with file/line references
- Suggested fixes
- Summary comment on the PR
</details>

---

## Key Takeaways

1. **Skills** are domain knowledge (core type) - "here's how to do it"
2. **Agents** are intelligent workers (core type) - "figure it out and do it"
3. **Commands** are optional wrappers (access layer) - only when `allowed-tools`, dangerous ops, `$ARGUMENTS`, or `/` shortcut needed
4. Most features are best served by a Skill or Agent without a Command wrapper
5. The right choice depends on: reasoning needs, reusability, and whether platform constraints are needed

---

## Next Module

[Module 2: Component Relationships & Contracts](./02-relationships.md) - Learn how Skills, Agents, and Command wrappers work together in a layered system.
