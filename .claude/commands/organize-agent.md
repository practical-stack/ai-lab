---
description: Validate and organize agents with best practices and spec
allowed-tools: Read, Glob, Write
argument-hint: [agent-path] [--fix] [--all]
---

# Organize Agent

Validate agent files against agent specification and best practices. Reports issues and optionally fixes them.

## Arguments

$ARGUMENTS

- **agent-path** (optional): Path to agent file or directory
  - Single file: `.claude/agents/my-agent.md` or `src/agents/my-agent.ts`
  - Directory: `.claude/agents/` or `src/agents/`
  - Default: show usage help if omitted
- **--fix**: Auto-fix issues with confirmation
- **--all**: Validate all agents in standard locations

## Usage Examples

```bash
# Validate single agent
/organize-agent .claude/agents/my-agent.md

# Validate all agents
/organize-agent --all

# Validate and fix
/organize-agent src/agents/ --fix
```

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│  /organize-agent (COMMAND - Orchestrator)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: DISCOVER                                          │
│  Find agent files to validate                               │
│                                                             │
│  Phase 2: VALIDATE                                          │
│  📚 meta-agent skill                                        │
│  Check each agent against spec                              │
│                                                             │
│  Phase 3: REPORT                                            │
│  Generate organization report                                  │
│                                                             │
│  Phase 4: FIX (if --fix)                                    │
│  Apply fixes with confirmation                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Instructions

### Phase 1: DISCOVER

1. Parse arguments to determine scope:
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

1. Read @.claude/skills/meta-agent/SKILL.md for validation rules

2. For each agent file, check:

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

### Phase 3: REPORT

Generate report for each file:

```markdown
## Agent Organization Report

### File: .claude/agents/my-agent.md

| Check | Status | Details |
|-------|--------|---------|
| name | ✅ Pass | kebab-case, valid |
| description | ⚠️ Warning | Too vague, add triggers |
| mode | ✅ Pass | "subagent" |
| model tier | ✅ Pass | Matches complexity |
| prompt length | ✅ Pass | 320 words |
| tool set | ⚠️ Warning | Consider removing Write |

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

### Phase 4: FIX (if --fix)

For each fixable issue:

1. Show proposed fix with before/after
2. Wait for confirmation
3. Apply changes

## Output

### Success (no issues)

```
## Agent Organization Report

✅ All N agents pass validation

No issues found.
```

### Issues Found

```
## Agent Organization Report

### Summary
- Files checked: N
- Pass: X
- Warnings: Y
- Errors: Z

[Detailed per-file reports]

### Quick Fixes

Run `/organize-agent --all --fix` to auto-fix Y issues.
```

## Safety

| Action | Requirement |
|--------|-------------|
| Read agents | Always allowed |
| Modify agents | Only with `--fix` + confirmation |
| Delete | Never |

## Key Principle

**This command validates organization.** The skill provides spec knowledge.

```
⚡ COMMAND: Orchestrates validation
    ↓
📚 SKILL: Provides agent spec and patterns
    ↓
🔧 TOOL: Read files, optionally Write fixes
```

## Related

- Spec reference: @.claude/skills/meta-agent/SKILL.md
- Agent patterns: @.claude/skills/meta-agent/references/agent-patterns.md
- Structure organizer: @.claude/commands/organize-llm-structure.md
