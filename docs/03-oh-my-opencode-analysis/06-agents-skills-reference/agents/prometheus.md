# Prometheus Agent

**Cost:** EXPENSIVE  
**Mode:** Subagent (planner)  
**Model:** anthropic/claude-opus-4-5  
**Source:** `src/agents/prometheus-prompt.ts`  
**Added:** v3.1+

---

## Overview

Named after the Greek Titan who gave fire (knowledge) to humanity, Prometheus creates comprehensive work plans through an interview-driven workflow. It never executes — only plans. Plans are stored as markdown files in `.sisyphus/plans/`.

**Key Characteristics:**
- Subagent mode (invoked by orchestrator)
- Extended thinking enabled
- Interview-based planning workflow
- Integrates with Metis (pre-planning) and Momus (review)
- Permissions: allows `edit`, `bash`, `webfetch`, `question`
- Outputs structured plan documents

---

## When to Use

| Scenario | Purpose |
|----------|---------|
| Non-trivial task (2+ steps) | Create structured work plan |
| Unclear scope | Interview to clarify requirements |
| Complex feature | Break down into atomic tasks with dependencies |
| Architecture decisions | Plan before executing |

## When NOT to Use

- Trivial single-file changes
- Tasks with clear, simple scope
- When user explicitly says "just do it"

---

## Implementation

```typescript
// Prometheus is defined via prompt + permissions (no factory wrapper)
const prometheusConfig = {
  model: "anthropic/claude-opus-4-5",
  mode: "subagent" as const,
  temperature: 0.1,
  permissions: {
    allow: ["edit", "bash", "webfetch", "question"],
  },
  prompt: PROMETHEUS_PROMPT,
  thinking: { type: "enabled", budgetTokens: 32000 },
}
```

---

## Workflow

```
User Request
    ↓
┌─────────────────────────────────┐
│  Phase 1: INTERVIEW              │
│  Ask clarifying questions        │
│  Understand full scope           │
│  Identify constraints            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Phase 2: METIS CONSULTATION     │
│  Invoke Metis for gap analysis   │
│  Identify hidden requirements    │
│  Get directives for planning     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Phase 3: PLAN GENERATION        │
│  Create structured work plan     │
│  Define tasks with dependencies  │
│  Include success criteria        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Phase 4: MOMUS REVIEW           │
│  Submit plan for review          │
│  Address critique                │
│  Iterate until OKAY              │
└─────────────────────────────────┘
    ↓
Final Plan → .sisyphus/plans/{name}.md
```

---

## Plan Output Format

```markdown
# Plan: [Feature Name]

## TL;DR
- Category + Skills recommendation for execution
- Key approach summary

## Overview
[What will be built and why]

## Prerequisites
- [ ] [Prerequisite 1]

## Tasks

### Task 1: [Name]
- **Category**: [quick | unspecified-high | visual-engineering | ...]
- **Skills**: [git-master, frontend-ui-ux, ...]
- **File**: [path]
- **Action**: [create/modify/delete]
- **Description**: [what to do]
- **Success Criteria**: [how to verify]
- **Dependencies**: [previous tasks]

### Task 2: [Name]
...

## Edge Cases
- [Edge case]: [handling]

## Verification
- [ ] All tasks complete
- [ ] Build passes
- [ ] Tests pass
```

---

## Session Continuity (CRITICAL)

Prometheus uses multi-turn conversations. The session_id must be preserved:

```typescript
// First call - starts interview
result = delegate_task(
  subagent_type: "prometheus",
  prompt: "Plan authentication feature for my Express app"
)
// result.session_id = "ses_abc123"

// Prometheus asks questions, user answers
delegate_task(
  session_id: "ses_abc123",
  prompt: "JWT, PostgreSQL, /api/* routes need protection"
)

// Prometheus creates plan, Momus reviews
// Eventually: plan written to .sisyphus/plans/
```

---

## Integration with Other Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| Pre-planning | Metis | Gap analysis, hidden requirements |
| Planning | Prometheus | Interview + plan creation |
| Review | Momus | Plan critique and validation |
| Execution | Atlas/Sisyphus | Execute the finalized plan |

---

## Key Constraints

```markdown
## What Prometheus MUST Do:
- Interview before planning (don't assume)
- Consult Metis for gap analysis
- Submit to Momus for review
- Iterate until Momus says OKAY
- Include category + skills recommendations per task
- Write plan to .sisyphus/plans/

## What Prometheus MUST NOT Do:
- Execute code
- Make implementation decisions without user input
- Skip the review loop
- Create vague tasks without success criteria
```

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|--------------|
| Skipping interview | Missing requirements surface during execution |
| Vague task descriptions | Executor doesn't know what to do |
| No success criteria | Can't verify completion |
| Skipping Momus review | Plan has gaps that cause rework |
| Not specifying category/skills | Wrong model for the task |
