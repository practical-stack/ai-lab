---
title: "Module 3: Decision Framework"
description: "Practical guide with a two-phase decision tree to determine the core type (Skill or Agent) and whether a Command wrapper is needed"
type: tutorial
tags: [AI, Architecture, BestPractice]
order: 3
depends_on: [./02-relationships.md]
related: [./03-decision-framework.ko.md]
---

# Module 3: Decision Framework

> Determine the core type (Skill or Agent) and whether a Command wrapper is needed

## Learning Objectives

By the end of this module, you will:
- Apply a two-phase decision tree to classify any feature request
- Determine the core type (Skill or Agent) first, then decide if a Command wrapper is justified
- Use checklists to validate your component choice
- Understand the trade-offs between different approaches

---

## 3.1 The Two-Phase Decision Tree

### Phase 1: Determine Core Type

```
                    ┌─────────────────────────┐
                    │    NEW FEATURE REQUEST  │
                    └───────────┬─────────────┘
                                │
                                ▼
                ┌───────────────────────────────────┐
                │ Does it require multi-step        │
                │ planning with dynamic branching?  │
                └───────────┬───────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼ YES                       ▼ NO
      ┌───────────────┐        ┌────────────────────────┐
      │  🤖 AGENT     │        │ Is it domain knowledge │
      │               │        │ or reusable expertise? │
      │ Multi-step    │        └───────────┬────────────┘
      │ reasoning     │                    │
      │ required      │      ┌─────────────┴─────────────┐
      └───────┬───────┘      │                           │
              │              ▼ YES                       ▼ NO
              │      ┌───────────────┐          ┌───────────────┐
              │      │  📚 SKILL     │          │ Embed in      │
              │      │               │          │ existing      │
              │      │ Auto-loaded   │          │ component     │
              │      │ knowledge     │          └───────────────┘
              │      └───────┬───────┘
              │              │
              ▼              ▼
        ┌─────────────────────────┐
        │   Go to Phase 2         │
        └─────────────────────────┘
```

### Phase 2: Need a Command Wrapper?

```
        ┌──────────────────────────────────┐
        │ Does the Skill/Agent need:       │
        │                                  │
        │ • allowed-tools restriction?     │
        │ • Dangerous/irreversible ops     │
        │   requiring explicit trigger?    │
        │ • Structured $ARGUMENTS?         │
        │ • Frequent /shortcut in menu?    │
        └───────────┬──────────────────────┘
                    │
      ┌─────────────┴─────────────┐
      │                           │
      ▼ ANY YES                   ▼ ALL NO
┌───────────────┐        ┌───────────────────┐
│ ⚡ Add COMMAND │        │ Use Skill/Agent   │
│   wrapper     │        │ directly          │
│               │        │ (no Command       │
│ UI + platform │        │  needed)          │
│ constraints   │        └───────────────────┘
└───────────────┘
```

---

## 3.2 Decision Questions in Detail

### Question 1: Multi-step Planning Required?

**Ask yourself:**
- Does the task require multiple iterations based on results?
- Will the approach change based on intermediate findings?
- Is there branching logic (if X then do Y, else do Z)?
- Does it need to adapt to unexpected situations?

| Scenario | Answer | Result |
|----------|--------|--------|
| "Fix this bug by analyzing the error and testing solutions" | YES | Agent |
| "Deploy to production with these settings" | NO | Continue to Q2 |
| "Create a project structure based on language choice" | Maybe | Depends on complexity |

### Question 2: Reusable Across Workflows?

**Ask yourself:**
- Will other agents/commands need this functionality?
- Is this domain knowledge or a specific action?
- Would duplicating this create maintenance problems?

| Scenario | Answer | Result |
|----------|--------|--------|
| "TypeScript coding guidelines" | YES | Continue to Q3 |
| "Deploy THIS specific app" | NO | Continue to Q4 |
| "Code review practices" | YES | Continue to Q3 |

### Question 3: Should Agent Auto-Load?

**Ask yourself:**
- Should the agent "just know" this when relevant?
- Is it context-dependent expertise?
- Would requiring explicit invocation be annoying?

| Scenario | Answer | Result |
|----------|--------|--------|
| "React best practices when writing React code" | YES | **Skill** |
| "A complex deployment procedure" | NO | **Command** |
| "Logging standards when adding logs" | YES | **Skill** |

### Question 4: Platform Constraints Required? (Phase 2)

After determining the core type (Skill or Agent), ask whether a **Command wrapper** is justified:

**Sub-questions:**
- Does it need `allowed-tools` restriction (tool sandboxing)?
- Is this a dangerous/irreversible operation requiring explicit human trigger?
- Does it need structured `$ARGUMENTS` with validation?
- Should it appear as a `/shortcut` in the command menu for discoverability?

| Scenario | Constraint Needed? | Result |
|----------|-------------------|--------|
| "Deploy to production" | YES (dangerous op, `allowed-tools`) | **Skill + Command wrapper** |
| "Generate API docs" | NO (agent can handle) | **Skill only** (no Command) |
| "Format code on save" | NO (auto-loaded) | **Skill only** (no Command) |
| "Delete old test fixtures" | YES (destructive, needs confirmation) | **Skill + Command wrapper** |

---

## 3.3 The Design Selection Checklist

For each feature, go through this checklist:

### Checklist Questions

| # | Question | If YES → |
|---|----------|----------|
| 1 | **High reusability?** | Lean toward Skill |
| 2 | **External side effects/risks?** | Require Command with confirmation |
| 3 | **Must human trigger directly?** | Must be Command |
| 4 | **Deterministic stability needed?** | Specify in Skill/Command (not Agent free reasoning) |
| 5 | **Multi-step planning/branching?** | Needs Agent |
| 6 | **Security/permission boundaries?** | Isolate as separate Agent or Command |
| 7 | **High execution cost?** | Command with explicit approval |

### Applying the Checklist

**Example: "Automatic PR review for security issues"**

| Question | Answer | Implication |
|----------|--------|-------------|
| High reusability? | YES | Could be Skill |
| Side effects? | YES (posts comments) | Needs confirmation |
| Human trigger? | NO (auto on PR) | Not Command |
| Deterministic? | NO (varies by code) | Agent reasoning needed |
| Multi-step? | YES (scan, analyze, report) | Agent |
| Security boundaries? | YES (repo access) | Scoped permissions |
| High cost? | Medium | OK with limits |

**Result: Agent** with `security-review` skill loaded, triggered by PR events, with comment posting requiring confirmation.

---

## 3.4 Quick Decision Cheat Sheet

### Use a TOOL when:
- Operation is atomic and deterministic
- Single API call or command
- No reasoning required
- Pure execution

### Use a SKILL when:
- Domain expertise needed
- Agent should auto-load when relevant
- Knowledge, not execution
- Reusable across workflows

### Add a COMMAND wrapper when:
- Only when platform constraints needed (`allowed-tools`, dangerous ops, structured `$ARGUMENTS`)
- User must explicitly trigger a dangerous/irreversible operation
- Tool sandboxing via `allowed-tools` is required
- Structured `$ARGUMENTS` with validation needed
- Frequent `/` shortcut for discoverability
- **NOT needed** when Skill/Agent can be directly invoked without restrictions

### Use an AGENT when:
- Dynamic tool selection needed
- Multi-step reasoning required
- Must adapt to unexpected situations
- Feedback loops needed

### Don't create a new component when:
- It can be added to existing agent/command
- It's a one-off operation
- Overhead outweighs benefit

---

## 3.5 Common Boundary Cases (Q&A)

### Q1: "Can a Command call multiple Skills?"

**A: Yes!** A Command can load multiple Skills as part of its procedure.

```markdown
# /release Command
1. Load "testing" skill → Run pre-release checks
2. Load "deployment" skill → Deploy to production
3. Load "notification" skill → Send announcements
```

### Q2: "If a Skill has LLM prompts, is it an Agent?"

**A: No.** Skills are instructions, Agents are execution entities.
- Skill: "Here's how to analyze security issues"
- Agent: "I will now analyze security issues using this skill"

### Q3: "Can multiple Agents share one Skill?"

**A: Yes!** Skills are designed to be shared.
- `logging` skill → Used by dev agent, test agent, deploy agent
- Each agent uses it within their own permission scope

### Q4: "Similar Commands - combine or keep separate?"

**A: Usually combine** with parameters.

| Bad | Good |
|-----|------|
| `/build-api`, `/build-ui`, `/build-worker` | `/build [api\|ui\|worker]` |
| `/deploy-dev`, `/deploy-prod` | `/deploy [dev\|prod]` |

### Q5: "Always-applied rules - Skill or something else?"

**A: Not a Skill.** Use permanent rules.

| Type | Location |
|------|----------|
| Always-on rules | `CLAUDE.md`, `.cursorrules`, system prompt |
| Contextual knowledge | Skill (loaded when relevant) |

---

## 3.6 Decision Tree Practice

### Practice Scenario 1

**Feature:** "Automatically add JSDoc comments to functions without documentation"

Work through the decision tree:

<details>
<summary>Answer</summary>

1. **Multi-step planning with branching?** → Maybe (needs to analyze each function)
2. **Reusable?** → YES (applies to any JS/TS code)
3. **Auto-load when relevant?** → YES (when editing JS/TS files)

**Result: Skill** called `jsdoc-generator`

But wait - if it needs to actually modify files, the Agent will use the skill to guide HOW to add comments, then use tools to actually add them.

Final answer: **Skill** (for the knowledge/patterns) + Agent uses it
</details>

### Practice Scenario 2

**Feature:** "Delete all test fixtures older than 30 days"

<details>
<summary>Answer</summary>

1. **Multi-step planning?** → NO (deterministic: find old files, delete)
2. **Reusable?** → Maybe (could be reused)
3. **Human trigger required?** → YES (destructive operation!)

**Result: Command** `/cleanup-fixtures`

- Requires explicit user trigger
- Should include confirmation step
- Could include `--dry-run` option
</details>

### Practice Scenario 3

**Feature:** "Help developers follow the company's microservices architecture patterns"

<details>
<summary>Answer</summary>

1. **Multi-step planning?** → NO (it's knowledge, not planning)
2. **Reusable?** → YES (applies to all microservice work)
3. **Auto-load when relevant?** → YES (when working on service architecture)

**Result: Skill** called `microservices-architecture`

Contains:
- Service design patterns
- Communication patterns (REST, gRPC, events)
- Data ownership principles
- Example folder structures
</details>

### Practice Scenario 4

**Feature:** "Analyze a bug report, reproduce it, find the root cause, and create a fix"

<details>
<summary>Answer</summary>

1. **Multi-step planning?** → YES (analyze → reproduce → investigate → fix)
2. **Dynamic branching?** → YES (different bugs need different approaches)
3. **Adapts to findings?** → YES (investigation reveals next steps)

**Result: Agent** called `bug-fix-agent`

Uses skills: `debugging`, `testing`, `coding-guidelines`
Uses tools: `file_read`, `test_runner`, `code_search`, `file_edit`
</details>

---

## 3.7 Decision Matrix Summary

| Feature Type | Core Type | Command Wrapper? | Key Indicator |
|--------------|-----------|-------------------|---------------|
| Domain expertise | Skill | No | "Knowledge about X" |
| Automated reasoning task | Agent | No | "Figure out how to X" |
| Dangerous user action | Skill/Agent | **Yes** | "Destructive/irreversible op needing explicit trigger" |
| Tool-restricted operation | Skill/Agent | **Yes** | "Needs `allowed-tools` sandboxing" |
| Parameterized shortcut | Skill/Agent | **Yes** | "Needs structured `$ARGUMENTS`" |
| Single operation | Tool | No | "Just do X" |
| Always-applied rules | Rules file | No | "Always follow X" |
| Reusable procedure | Skill workflow | No | "Steps to do X" |

---

## Key Takeaways

1. **Start with the decision tree** - Follow the questions in order
2. **Use the checklist** - Validate your choice with specific criteria
3. **When in doubt, start simpler** - You can always promote later
4. **Combine components** - Most features use multiple component types
5. **Avoid over-engineering** - Not everything needs a new component

---

## Next Module

[Module 4: Practical Design Templates](./04-templates.md) - Learn to write specification documents for Skills, Agents, and Command wrappers.
