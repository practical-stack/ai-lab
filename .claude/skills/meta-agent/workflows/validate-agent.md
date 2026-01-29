# Validate Agent

Validate agent files against the agent specification and best practices. Reports issues and optionally fixes them.

## Triggers

- "validate agent", "check agent", "organize agent"
- "validate all agents", "agent audit"

## Input

- **agent-path** (optional): Path to agent file or directory
  - Single file: `.claude/agents/my-agent.md` or `src/agents/my-agent.ts`
  - Directory: `.claude/agents/` or `src/agents/`
- **--fix**: Auto-fix issues with confirmation
- **--all**: Validate all agents in standard locations
- Default (no args): Show usage help

## Workflow

### Phase 1: DISCOVER

1. Determine scope:
   - If `--all`: Search standard agent locations:
     - `.claude/agents/**/*.md`
     - `src/agents/**/*.ts`
     - `.opencode/agents/**/*.md`
   - If directory: `glob("{path}/**/*.{md,ts}")`
   - If file: validate that single file
   - If empty: show usage help

2. List files to validate:
   ```
   Found N agent(s) to validate:
   - .claude/agents/oracle.md
   - src/agents/explorer.ts
   ```

### Phase 2: VALIDATE

For each agent file, check against these rules:

**Configuration Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| `name` present | ERROR | Required, kebab-case |
| `description` present | ERROR | Required for orchestrator selection |
| `mode` is "subagent" | ERROR | Required for subagents |
| `model` valid | WARNING | Match tier to complexity |
| `prompt` present | ERROR | Required system prompt |

**Category Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| Category matches purpose | WARNING | exploration/specialist/advisor/utility/orchestration |
| Model tier appropriate | WARNING | haiku for fast, sonnet for balanced, opus for complex |
| Tool set minimal | WARNING | Only necessary tools |

**Prompt Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| Prompt length | WARNING | < 500 words recommended |
| Clear role definition | INFO | Agent knows its purpose |
| Output format specified | INFO | Agent knows expected output |

**Anti-Pattern Checks:**

| Check | Severity | Rule |
|-------|----------|------|
| Vague description | WARNING | Orchestrator can't decide |
| Too many tools | WARNING | Security risk |
| Generic "helper" | WARNING | No clear purpose |
| Missing readonly for advisors | WARNING | Security for read-only agents |

> **Note:** The `validate-agent.ts` script can also run these checks programmatically:
> ```bash
> bun scripts/validate-agent.ts <agent-file>
> ```

### Phase 3: REPORT

Generate report for each file:

```markdown
## Agent Validation Report

### File: .claude/agents/my-agent.md

| Check | Status | Details |
|-------|--------|---------|
| name | Pass | kebab-case, valid |
| description | Warning | Too vague, add triggers |
| mode | Pass | "subagent" |
| model tier | Pass | Matches complexity |
| prompt length | Pass | 320 words |
| tool set | Warning | Consider removing Write |

**Summary:**
- 4 Pass
- 2 Warnings
- 0 Errors

### Recommendations

1. Improve description:
   ```yaml
   description: |
     Security auditor for code review.
     Triggers: "security review", "vulnerability scan"
   ```

2. Scope tools:
   ```yaml
   tools: { include: ["read", "grep", "glob"] }
   ```
```

For `--all`, include an overall summary:

```
## Overall Summary
- Files checked: N
- Pass: X
- Warnings: Y
- Errors: Z
```

### Phase 4: FIX (if --fix)

For each fixable issue:

1. Show proposed fix with before/after
2. Wait for confirmation
3. Apply changes

## Safety

| Action | Requirement |
|--------|-------------|
| Read agents | Always allowed |
| Modify agents | Only with `--fix` + confirmation |
| Delete | Never |
