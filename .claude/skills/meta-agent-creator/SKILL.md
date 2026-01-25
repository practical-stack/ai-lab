---
name: meta-agent-creator
description: |
  Guide for creating specialized AI agents (subagents). Use when users want to create
  a new agent, define agent configurations, or need guidance on agent architecture.
  Triggers: "create an agent", "new agent", "make a subagent", "agent template"
---

# Meta-Agent Creator

A meta-skill that helps create new specialized agents for multi-agent orchestration systems.
Supports Claude Code and OpenCode platforms.

> **Output Language**: All generated agent content (prompts, descriptions) will be in **English**.

## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Create a new agent (full process) | [workflows/create-agent.md](workflows/create-agent.md) |

## Core Resources

| Resource | Purpose |
|----------|---------|
| [Agent Patterns](references/agent-patterns.md) | Architecture guidance, interfaces |
| [Agent Templates](references/agent-templates.md) | Ready-to-use agent examples |

## Quick Start

### Create a New Agent

```bash
# Initialize a new agent
bun scripts/init-agent.ts <agent-name> --path <output-directory> --platform <platform>

# Examples
bun scripts/init-agent.ts security-auditor --path src/agents --platform opencode
bun scripts/init-agent.ts data-analyst --path .claude/agents --platform claude-code
```

### Validate Agent

```bash
bun scripts/validate-agent.ts <agent-file>

# Examples
bun scripts/validate-agent.ts src/agents/my-agent.ts
bun scripts/validate-agent.ts .claude/agents/my-agent.ts
```

## Agent Categories

Choose the appropriate category based on agent purpose:

| Category | Purpose | Model Tier | Examples |
|----------|---------|------------|----------|
| `exploration` | Fast search, codebase discovery | LOW (haiku/fast) | explore, searcher |
| `specialist` | Domain-specific implementation | MEDIUM (sonnet) | frontend, backend |
| `advisor` | Read-only consultation | HIGH (opus) | oracle, architect |
| `utility` | General helpers | LOW (haiku/fast) | writer, formatter |
| `orchestration` | Multi-agent coordination | MEDIUM (sonnet) | orchestrator |

## Agent Creation Workflow (5 Phases)

For the complete step-by-step guide, see [workflows/create-agent.md](workflows/create-agent.md).

| Phase | Goal | Key Output |
|-------|------|------------|
| 1. DEFINE | Clarify purpose | Role definition |
| 2. CLASSIFY | Select category/model | Category + tier |
| 3. DESIGN | Write prompt | System prompt |
| 4. CONFIGURE | Create config | Agent file |
| 5. REGISTER | Add & test | Working agent |

## Platform Configurations

### OpenCode / Claude Code Agent Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent identifier (kebab-case) |
| `description` | Yes | Selection guide for orchestrator |
| `mode` | Yes | Always `"subagent"` |
| `model` | Yes | Model string |
| `temperature` | No | Defaults to 0.1 |
| `tools` | No | Tool whitelist/blacklist |
| `prompt` | Yes | System prompt |

### Example Configuration

```typescript
export function createMyAgent(model: string): AgentConfig {
  return {
    name: "my-agent",
    description: "Agent description...",
    mode: "subagent",
    model,
    temperature: 0.1,
    tools: { include: ["read", "glob", "grep"] },
    prompt: `System prompt...`
  };
}
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Vague description | Orchestrator can't decide | Include specific triggers |
| Too many tools | Security risk | Minimal tool set |
| Long prompts | Slower, harder to maintain | Keep under 500 words |
| Generic "helper" | No clear purpose | Single responsibility |
| Missing readonly | Security for advisors | Set readonly: true |
| Wrong model tier | Cost or quality issues | Match tier to complexity |
