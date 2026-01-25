---
title: "Module 2: Component Relationships & Contracts"
description: "Understanding how Agent, Skill, Command, and Tool layers work together through hierarchical relationships and contracts"
type: tutorial
tags: [AI, Architecture]
order: 2
depends_on: [./01-fundamentals.en.md]
related: [./02-relationships.ko.md]
---

# Module 2: Component Relationships & Contracts

> Understanding how Agent, Skill, Command, and Tool layers work together

## Learning Objectives

By the end of this module, you will:
- Understand the hierarchical relationship between components
- Know how contracts define interactions between layers
- Be able to design proper interfaces for each component

---

## 2.1 The Hierarchy: Agent → Workflow → Command → Skill → Tool

### Visual Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT LAYER                          │
│  • Receives user intent, sets goals                     │
│  • Performs reasoning and planning                      │
│  • Decides which Skills/Commands to use                 │
│  • Manages tool access                                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              COMMAND/WORKFLOW LAYER                     │
│  • Executes specific procedures                         │
│  • Describes order of Skill and Tool calls              │
│  • Mini-scripts for common workflows                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SKILL LAYER                          │
│  • Provides domain knowledge and checklists             │
│  • Agent loads when specific domain work needed         │
│  • Guides how to use tools properly                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    TOOL LAYER                           │
│  • Executes actual operations (API, CLI, DB)            │
│  • Returns results as JSON or structured output         │
│  • The "hands" of the system                            │
└─────────────────────────────────────────────────────────┘
```

### Why This Structure?

| Principle | Benefit |
|-----------|---------|
| **Separation of Concerns** | Each layer has a clear responsibility |
| **Reusability** | Skills and Commands can be reused across Agents |
| **Modularity** | Change one layer without affecting others |
| **Testability** | Test each layer independently |

### Example Flow

**User:** "Refactor this code to use better error handling"

```
1. AGENT decides: "I need to refactor code" → Plans multi-step approach
2. AGENT loads: "error-handling" SKILL for best practices
3. SKILL provides: Checklist and patterns for error handling
4. AGENT calls: FileRead TOOL to get current code
5. AGENT calls: FileWrite TOOL to apply changes
6. AGENT runs: TestRunner TOOL to verify changes work
7. AGENT reports: Summary of changes to user
```

---

## 2.2 Layer Responsibilities in Detail

### Agent Layer

```yaml
# What the Agent does:
responsibilities:
  - Interpret user intent
  - Create execution plan
  - Load relevant Skills
  - Select appropriate Tools
  - Handle errors and retries
  - Report results

# What the Agent should NOT do:
anti_patterns:
  - Hardcode detailed procedures (use Skills instead)
  - Execute without planning
  - Ignore failure scenarios
```

### Command/Workflow Layer

```yaml
# What Commands do:
responsibilities:
  - Define fixed execution sequences
  - Accept parameters from users
  - Validate inputs
  - Trigger Agent work

# Example: /deploy Command
steps:
  1. Validate environment parameter
  2. Load deployment Skill
  3. Execute deployment tools
  4. Report success/failure
```

### Skill Layer

```yaml
# What Skills do:
responsibilities:
  - Provide domain expertise
  - Define best practices
  - Offer templates and examples
  - Guide tool usage

# What Skills should NOT do:
anti_patterns:
  - Execute tools directly (Agent decides when)
  - Make autonomous decisions
  - Maintain state between uses
```

### Tool Layer

```yaml
# What Tools do:
responsibilities:
  - Execute atomic operations
  - Return structured results
  - Report errors clearly

# Tool examples:
- file_read, file_write
- git_commit, git_push
- api_call, database_query
- run_tests, run_build
```

---

## 2.3 Contracts: Defining Interfaces Between Layers

Each layer needs clear **contracts** - agreements about input/output formats and error handling.

### Agent Contract

```yaml
agent_contract:
  input:
    format: "Natural language or structured JSON"
    example: "Fix bug #123" or {"task": "fix_bug", "issue_id": 123}
  
  output:
    format: "User-facing response with results"
    example: "Fixed bug #123. Changes: [diff]. PR: #456"
  
  error_handling:
    timeout: "Return ERROR_TIMEOUT after {max_time}"
    tool_failure: "Retry up to 3 times, then ask user"
    missing_input: "Return error immediately with missing fields"
```

### Command Contract

```yaml
command_contract:
  input:
    parameters: "Defined in argument-hint"
    validation: "Type and value constraints"
    example: "/deploy prod --dry-run"
  
  output:
    success: "✅ Deployment to {env} successful"
    failure: "❌ Deployment failed - {reason}"
  
  error_handling:
    invalid_input: "Return INVALID_ARGS immediately"
    timeout: "Return after defined limit with state"
    partial_failure: "Report what succeeded and what failed"
```

### Skill Contract

```yaml
skill_contract:
  trigger:
    conditions: "Keywords or context patterns"
    example: "USE WHEN: 'code review', 'security check'"
  
  content:
    format: "Markdown with structured sections"
    sections: ["Workflow Routing", "Guidelines", "Examples"]
  
  error_handling:
    load_failure: "Agent continues without skill"
    content_error: "Report skill name with error"
```

### Tool Contract

```yaml
tool_contract:
  input:
    format: "JSON Schema defined parameters"
    example: {"file_path": "/src/app.ts", "content": "..."}
  
  output:
    success: {"status": "ok", "result": {...}}
    failure: {"status": "error", "code": "FILE_NOT_FOUND", "message": "..."}
  
  constraints:
    timeout: "30 seconds default"
    permissions: "Defined per agent"
```

---

## 2.4 Practical Example: How Layers Interact

### Scenario: Creating a New GitHub Issue

```
┌─────────────────────────────────────────────────────────────┐
│ USER: "/create-issue Fix login timeout bug"                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ COMMAND: create-issue.md                                    │
│ ────────────────────────                                    │
│ Input: $1 = "Fix login timeout bug"                         │
│ Action: Invoke Agent with task                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ AGENT: Plans the workflow                                   │
│ ─────────────────────────                                   │
│ 1. Load "github-workflow" skill                             │
│ 2. Create issue with proper labels                          │
│ 3. Optionally create linked branch                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SKILL: github-workflow/SKILL.md                             │
│ ───────────────────────────────                             │
│ Provides:                                                   │
│ - Issue title conventions (feat:, fix:, etc.)               │
│ - Label recommendations                                     │
│ - Branch naming patterns                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ TOOL: gh_issue_create                                       │
│ ─────────────────────                                       │
│ Input: {"title": "fix: Login timeout bug",                  │
│         "labels": ["bug", "auth"],                          │
│         "body": "..."}                                      │
│ Output: {"issue_number": 123, "url": "..."}                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ RESULT: "Created issue #123: fix: Login timeout bug"        │
│         "URL: https://github.com/org/repo/issues/123"       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2.5 Operations: Versioning, Testing, and Observability

### Versioning Strategy

```yaml
versioning:
  skills:
    location: "SKILL.md frontmatter"
    format: "version: 1.0.0"
    changelog: "Keep CHANGELOG.md in skill folder"
  
  commands:
    location: "Command file header"
    format: "# Version: 1.0.0"
  
  agents:
    location: "Agent definition"
    format: "version: 1.0.0"

compatibility:
  rule: "Increment major version for breaking changes"
  example: "Skill v2.0 if input format changes"
```

### Testing Strategy

| Layer | Test Type | Example |
|-------|-----------|---------|
| **Tool** | Unit test | `test_file_read()` returns correct content |
| **Skill** | Content test | Skill loads without errors, has required sections |
| **Command** | Integration test | `/deploy dev` produces expected output |
| **Agent** | Scenario test | Full workflow from input to result |

### Observability Requirements

```yaml
logging:
  format: "[LAYER=X] [ID=trace-123] action=Y result=Z time=1.2s"
  
  examples:
    - "[AGENT=bug-fix] [ID=abc123] action=load_skill skill=debugging"
    - "[TOOL=file_read] [ID=abc123] action=read path=/src/app.ts status=ok"
    - "[COMMAND=deploy] [ID=abc123] action=complete result=success"

metrics:
  - success_rate_per_agent
  - avg_response_time
  - skill_usage_count
  - tool_failure_rate

alerting:
  - "Error rate > 5% → PagerDuty"
  - "Response time > 30s → Slack"
```

---

## 2.6 When the Structure Breaks Down

### Anti-patterns to Avoid

| Anti-pattern | Problem | Solution |
|--------------|---------|----------|
| **Agent does everything** | Bloated prompt, confusion | Modularize into Skills |
| **Skill executes directly** | Side effects without Agent control | Skills guide, don't execute |
| **No contracts** | Implicit assumptions cause bugs | Define I/O and error handling |
| **No versioning** | Breaking changes surprise users | Semantic versioning |
| **No logging** | Can't debug problems | Structured logs with trace IDs |

### Example: Proper vs Improper Separation

**Bad: Agent hardcodes everything**
```markdown
# Agent System Prompt (1000+ lines!)
You are a bug fixer. When fixing bugs:
1. First run git status...
2. Then search for the error...
3. Then apply this exact fix pattern...
[hundreds more lines]
```

**Good: Agent uses Skills**
```markdown
# Agent System Prompt (concise)
You are a bug fixer. Use the "debugging" skill when analyzing bugs.
Follow the "coding-guidelines" skill when making changes.

# Skills loaded dynamically based on need
# Each skill is a separate, maintainable file
```

---

## 2.7 Exercises

### Exercise 1: Map the Contract

For the following feature, define the contracts for each layer:

**Feature:** A code review command that reviews a PR for security issues

<details>
<summary>Sample Answer</summary>

```yaml
# Command Contract
command:
  name: "/review-security"
  input: "PR number or URL"
  output: "Security review report"
  errors: ["INVALID_PR", "NO_ACCESS", "TIMEOUT"]

# Skill Contract
skill:
  name: "security-review"
  triggers: ["security", "vulnerability", "CVE"]
  content: "Security checklist, common vulnerabilities, fix patterns"

# Tool Contracts
tools:
  - name: "github_get_pr"
    input: {"pr_number": int}
    output: {"diff": string, "files": list}
  
  - name: "code_search"
    input: {"pattern": string, "file_type": string}
    output: {"matches": list}
```
</details>

### Exercise 2: Design the Logging

What log entries would you expect for this flow:
1. User runs `/create-project MyApp`
2. Agent loads scaffold skill
3. Agent creates files
4. Error: directory already exists
5. Agent reports error to user

<details>
<summary>Sample Answer</summary>

```
[INFO][COMMAND=create-project][ID=xyz789] input="MyApp" started
[INFO][AGENT=project-init][ID=xyz789] planning started
[INFO][AGENT=project-init][ID=xyz789] loading skill=scaffold
[INFO][SKILL=scaffold][ID=xyz789] loaded successfully
[INFO][TOOL=file_create][ID=xyz789] action=mkdir path=/projects/MyApp
[ERROR][TOOL=file_create][ID=xyz789] error=DIRECTORY_EXISTS path=/projects/MyApp
[INFO][AGENT=project-init][ID=xyz789] handling error=DIRECTORY_EXISTS
[INFO][COMMAND=create-project][ID=xyz789] completed status=failed error="Directory already exists"
```
</details>

---

## Key Takeaways

1. **Hierarchy matters**: Agent → Command → Skill → Tool, each with distinct responsibilities
2. **Contracts prevent chaos**: Define input/output/errors for every layer
3. **Operations are essential**: Versioning, testing, logging, and monitoring
4. **Separation of concerns**: Don't put everything in one layer
5. **Log everything**: You can't debug what you can't see

---

## Next Module

[Module 3: Decision Framework](./03-decision-framework.en.md) - Learn when to build a Command vs Skill vs Agent with practical decision trees.
