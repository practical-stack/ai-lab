---
title: "Module 4: Practical Design Templates"
description: "Ready-to-use specification templates for Command, Skill, and Agent with required and optional sections for professional-quality designs"
type: tutorial
tags: [AI, Architecture, BestPractice]
order: 4
depends_on: [./03-decision-framework.md]
related: [./04-templates.ko.md]
---

# Module 4: Practical Design Templates

> Ready-to-use specification templates for Command, Skill, and Agent

## Learning Objectives

By the end of this module, you will:
- Use templates to design any component type
- Know what sections are required vs optional
- Create professional-quality specifications

---

## 4.1 Why Templates Matter

Templates ensure:
- **Consistency** across components
- **Completeness** - no missing sections
- **Communication** - team understands design
- **Maintainability** - future developers can understand intent

---

## 4.2 Command Spec Template

### Template

```markdown
# Command: [command-name]

> [One-line description of what this command does]

## Overview

| Property | Value |
|----------|-------|
| **Name** | `/[command-name]` |
| **Version** | 1.0.0 |
| **Owner** | [team/person] |

## Purpose

[2-3 sentences describing the command's goal]

## Out of Scope

- [What this command does NOT do]
- [Limitations users should know]

---

## Input

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `param1` | string | Yes | - | [description] |
| `param2` | string | No | `"default"` | [description] |
| `--flag` | flag | No | false | [description] |

### Input Examples

```
/[command-name] value1 --flag
/[command-name] value1 value2
```

---

## Process

1. **Validation** - [What gets validated first]
2. **Step 2** - [Next action]
3. **Step 3** - [Next action]
4. **Result** - [Final output]

---

## Output

### Success Response

```
✅ [Success message format]
[Additional details]
```

### Failure Response

```
❌ [Error type] - [Error message format]
```

### Artifacts Created

| Artifact | Location | Description |
|----------|----------|-------------|
| [file/log] | [path] | [what it contains] |

---

## Error Handling

| Error Code | Condition | Recovery |
|------------|-----------|----------|
| `INVALID_PARAM` | [when this happens] | [how to recover] |
| `TIMEOUT` | [when this happens] | [how to recover] |
| `PARTIAL_FAIL` | [when this happens] | [how to recover] |

---

## Safety

### Before Execution
- [ ] [Pre-condition check]

### Confirmation Required
- [Dangerous action] → Ask user: "[confirmation question]"

### Rate Limits
- [Any rate limiting rules]

---

## Observability

### Logging
- Tag: `COMMAND=[command-name]`
- Fields: [field1], [field2]

### Metrics
- `[metric_name]` - [what it measures]

---

## Testing

| Test Type | Description |
|-----------|-------------|
| **Unit** | [what to test] |
| **Integration** | [what to test] |
| **Edge Cases** | [what to test] |
```

### Filled Example

```markdown
# Command: deploy

> Deploy the application to a specified environment

## Overview

| Property | Value |
|----------|-------|
| **Name** | `/deploy` |
| **Version** | 1.0.0 |
| **Owner** | DevOps Team |

## Purpose

Deploys the latest code to the specified environment (dev, staging, or prod).
Runs pre-deployment checks and notifies the team upon completion.

## Out of Scope

- Does not provision infrastructure
- Does not handle database migrations (use `/migrate` separately)

---

## Input

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `env` | string | Yes | - | Target environment: `dev`, `staging`, `prod` |
| `--dry-run` | flag | No | false | Simulate without actual deployment |
| `--version` | string | No | latest | Specific version to deploy |

### Input Examples

```
/deploy dev
/deploy prod --dry-run
/deploy staging --version 1.2.3
```

---

## Process

1. **Validate** - Check env is valid, user has permission
2. **Pre-flight** - Run health checks on target environment
3. **Deploy** - Execute deployment script
4. **Verify** - Run smoke tests
5. **Notify** - Send completion message to #deploys channel

---

## Output

### Success Response

```
✅ Deployment to **prod** successful
Version: 1.2.3
Duration: 2m 34s
Health check: All services healthy
```

### Failure Response

```
❌ DEPLOY_FAILED - Health check failed after deployment
Rolled back to previous version (1.2.2)
See logs: /logs/deploy-2024-01-15.log
```

---

## Error Handling

| Error Code | Condition | Recovery |
|------------|-----------|----------|
| `INVALID_ENV` | env not in [dev, staging, prod] | Return error, no action |
| `NO_PERMISSION` | User can't deploy to env | Return error, suggest contact |
| `DEPLOY_TIMEOUT` | Deploy takes > 10 min | Cancel, rollback, alert team |
| `HEALTH_FAILED` | Post-deploy checks fail | Auto-rollback, notify |

---

## Safety

### Before Execution
- [ ] Check CI passed for the version
- [ ] Verify no active incident on target env

### Confirmation Required
- `prod` deployment → Ask: "Deploy to PRODUCTION. Are you sure? (yes/no)"

### Rate Limits
- Max 1 production deployment per hour
- Max 5 staging deployments per hour
```

---

## 4.3 Skill Spec Template

### Template

```markdown
# Skill: [skill-name]

> [One-line description]

---
name: [skill-name]
version: 1.0.0
description: |
  [Detailed description]
  USE WHEN: [trigger keywords/situations]
  DO NOT USE WHEN: [exclusion cases]
---

## Overview

| Property | Value |
|----------|-------|
| **Domain** | [domain area] |
| **Owner** | [team/person] |
| **Related Skills** | [other skills] |

## Folder Structure

```
skills/
└── [skill-name]/
    ├── SKILL.md           # This file
    ├── workflows/
    │   ├── [workflow-1].md
    │   └── [workflow-2].md
    └── references/
        └── [reference].md
```

---

## Workflow Routing

| User Intent | Workflow File | Description |
|-------------|---------------|-------------|
| "[intent 1]" | workflows/[file].md | [what it does] |
| "[intent 2]" | workflows/[file].md | [what it does] |

---

## Trigger Conditions

### Load When
- Keyword: "[keyword1]", "[keyword2]"
- Context: [description of context]

### Do NOT Load When
- [exclusion condition]
- [another exclusion]

---

## Prerequisites

Agent should have access to:
- [Required context/files]
- [Required tools]

---

## Core Guidelines

1. [Guideline 1]
2. [Guideline 2]
3. [Guideline 3]

---

## Success Criteria

The skill is applied successfully when:
- [ ] [Criterion 1]
- [ ] [Criterion 2]

---

## Testing

| Test | Description |
|------|-------------|
| **Trigger Test** | Verify skill loads on "[trigger phrase]" |
| **Negative Test** | Verify skill does NOT load on "[exclusion phrase]" |
| **Content Test** | Verify workflow produces expected output |
```

### Filled Example

```markdown
# Skill: code-review

> Provides guidelines and checklists for reviewing code

---
name: code-review
version: 1.0.0
description: |
  Comprehensive code review expertise for catching bugs, security issues,
  and maintainability problems.
  USE WHEN: "review code", "check PR", "code quality", "review changes"
  DO NOT USE WHEN: "write new code", "refactor" (use coding-guidelines instead)
---

## Overview

| Property | Value |
|----------|-------|
| **Domain** | Code Quality |
| **Owner** | Platform Team |
| **Related Skills** | security-review, testing |

## Folder Structure

```
skills/
└── code-review/
    ├── SKILL.md
    ├── workflows/
    │   ├── general-review.md
    │   ├── security-focus.md
    │   └── performance-focus.md
    └── references/
        └── common-issues.md
```

---

## Workflow Routing

| User Intent | Workflow File | Description |
|-------------|---------------|-------------|
| "Review this PR" | workflows/general-review.md | Full review checklist |
| "Check for security" | workflows/security-focus.md | Security-focused review |
| "Is this performant?" | workflows/performance-focus.md | Performance analysis |

---

## Trigger Conditions

### Load When
- Keywords: "review", "code review", "PR review", "check code"
- Context: User provides diff or asks about code quality

### Do NOT Load When
- User is writing new code (use coding-guidelines)
- User is debugging (use debugging skill)

---

## Core Guidelines

1. **Be specific** - Reference exact file:line for each issue
2. **Prioritize** - Focus on bugs/security over style
3. **Be constructive** - Suggest fixes, not just problems
4. **Explain why** - Help author learn, not just fix

---

## Success Criteria

The skill is applied successfully when:
- [ ] All critical issues identified with file:line references
- [ ] Each issue includes suggested fix
- [ ] Review is organized by severity (critical → minor)
```

---

## 4.4 Agent Spec Template

### Template

```markdown
# Agent: [agent-name]

> [One-line description of the agent's role]

## Overview

| Property | Value |
|----------|-------|
| **Name** | [agent-name] |
| **Version** | 1.0.0 |
| **Model** | [Claude-3, GPT-4, etc.] |
| **Owner** | [team/person] |

## Goal

[2-3 sentences describing what this agent achieves]

## Scope

### In Scope
- [Responsibility 1]
- [Responsibility 2]

### Out of Scope
- [What it does NOT do]
- [Boundaries]

---

## Capabilities

### Skills Used
| Skill | Purpose |
|-------|---------|
| [skill-name] | [why this agent uses it] |

### Tools Available
| Tool | Purpose | Permissions |
|------|---------|-------------|
| [tool-name] | [what it does] | [read/write/execute] |

### Actions

**Can Do:**
- [Autonomous action 1]
- [Autonomous action 2]

**Requires Approval:**
- [Action needing human confirmation]

**Cannot Do:**
- [Prohibited action]

---

## Workflow

### High-Level Process

```
1. [First major step]
   └── [Sub-step if needed]
2. [Second major step]
3. [Continue...]
```

### Decision Points

| Condition | Action |
|-----------|--------|
| [If X happens] | [Do Y] |
| [If A and B] | [Do C] |

---

## Input/Output

### Input Format
```json
{
  "field1": "description",
  "field2": "description"
}
```

### Output Format
```json
{
  "result": "description",
  "details": {}
}
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| [Error type] | [Response] |
| [Max retries exceeded] | [What happens] |
| [Timeout] | [What happens] |

---

## Constraints

### Resource Limits
- Max steps: [N]
- Timeout: [M seconds]
- Max sub-agents: [X]

### Safety Rules
- [Rule 1]
- [Rule 2]

---

## Observability

### Logging
- Tag: `AGENT=[agent-name]`
- Key events: [list]

### Metrics
- [metric_name] - [description]

---

## Testing

| Test Type | Scenario |
|-----------|----------|
| **Happy Path** | [Normal flow test] |
| **Error Case** | [What to test] |
| **Edge Case** | [Unusual but valid scenario] |
```

### Filled Example

```markdown
# Agent: bug-fix-agent

> Analyzes bug reports, finds root causes, and creates fix PRs

## Overview

| Property | Value |
|----------|-------|
| **Name** | bug-fix-agent |
| **Version** | 1.0.0 |
| **Model** | Claude-3-Opus |
| **Owner** | Engineering Platform |

## Goal

Automate the bug fixing process from report to PR, reducing developer toil
and time-to-fix for common bug patterns.

## Scope

### In Scope
- Analyze bug reports and reproduce issues
- Search codebase for root cause
- Create and test fixes
- Open draft PRs with clear descriptions

### Out of Scope
- Infrastructure/DevOps issues
- UI/UX bugs (use ui-bug-agent)
- Merging PRs (requires human review)

---

## Capabilities

### Skills Used
| Skill | Purpose |
|-------|---------|
| debugging | Error analysis techniques |
| coding-guidelines | Ensure fix follows standards |
| testing | Write/run tests for fix |

### Tools Available
| Tool | Purpose | Permissions |
|------|---------|-------------|
| file_search | Find relevant code | Read |
| file_edit | Apply fixes | Write (src/ only) |
| test_runner | Verify fixes | Execute |
| github_api | Create PRs | Create draft PRs only |

### Actions

**Can Do:**
- Read any file in repository
- Edit source code files
- Run tests locally
- Create draft PRs

**Requires Approval:**
- Push to remote branches
- Add new dependencies

**Cannot Do:**
- Merge PRs
- Delete files
- Modify production configs

---

## Workflow

```
1. UNDERSTAND - Parse bug report
   └── Ask clarifying questions if needed
2. REPRODUCE - Attempt to trigger the bug
   └── If can't reproduce, request more info
3. INVESTIGATE - Find root cause
   └── Use file_search, read logs
4. FIX - Apply minimal fix
   └── Follow coding-guidelines skill
5. VERIFY - Run tests
   └── If tests fail, iterate (max 2 times)
6. PR - Create draft PR
   └── Include bug cause and fix explanation
7. REPORT - Summarize to user
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Can't reproduce | Ask for steps, env details. Fail after 2 attempts. |
| Can't find cause | Report investigation findings, suggest manual debug. |
| Tests fail after fix | Retry fix (max 2). Then create WIP PR with notes. |
| Timeout | Save progress, report partial findings. |

---

## Constraints

### Resource Limits
- Max steps: 15
- Timeout: 10 minutes
- Max sub-agents: 2 (for parallel investigation)

### Safety Rules
- Never modify test assertions to make tests pass
- Always explain what the bug was and why fix works
- Must run tests before claiming fix is complete
```

---

## 4.5 Template Quick Reference

### Minimal Command

```markdown
# Command: /[name]

**Purpose:** [one line]

**Input:** `[parameters]`

**Output:** [expected result]

**Errors:** [main error cases]
```

### Minimal Skill

```yaml
---
name: [skill-name]
description: |
  [what it does]
  USE WHEN: [triggers]
---

## Workflow Routing
| Intent | File |
|--------|------|
| [x] | workflows/[x].md |
```

### Minimal Agent

```yaml
name: [agent-name]
goal: [what it achieves]
skills: [list]
tools: [list]
constraints:
  max_steps: N
  requires_approval: [dangerous actions]
```

---

## Key Takeaways

1. **Use templates** - They ensure consistency and completeness
2. **Fill all required sections** - Even if brief
3. **Be specific** - Vague specs lead to vague implementations
4. **Include error handling** - The happy path isn't enough
5. **Document constraints** - Limits prevent runaway agents

---

## Next Module

[Module 5: Real-World Examples](./05-examples.md) - See complete implementations of Commands, Skills, and Agents.
