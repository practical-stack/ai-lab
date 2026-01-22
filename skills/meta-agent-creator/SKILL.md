---
name: meta-agent-creator
description: Create new AI agent definitions for Claude Code or OpenCode. Use when defining specialized subagents, configuring model routing, or building multi-agent systems.
---

# Meta Agent Creator

Create well-structured agent definitions for Claude Code and OpenCode multi-agent systems.

## When to Use

- Defining a new specialized subagent
- Configuring agent capabilities and tool access
- Setting up model routing for different tasks
- Building orchestrated multi-agent workflows

## Agent Definition Structure

### Claude Code Agents
```
agents/
└── agent-name.md         # Agent description and capabilities
```

### OpenCode Agents (TypeScript)
```typescript
{
  name: "agent-name",
  description: "When to use this agent",
  prompt: "System prompt defining behavior",
  tools: { include: ["Read", "Glob", "Grep"] },
  model: "anthropic/claude-sonnet-4-5"
}
```

## Agent Categories

| Category | Purpose | Example Agents |
|----------|---------|----------------|
| **Orchestrators** | Coordinate work, delegate tasks | sisyphus, atlas |
| **Specialists** | Domain expertise | architect, designer, writer |
| **Explorers** | Search and research | explore, librarian, researcher |
| **Executors** | Direct implementation | executor, qa-tester |

## Model Tier Guidelines

| Tier | Models | Use Case |
|------|--------|----------|
| **HIGH** | Opus, GPT-5.2 | Complex reasoning, architecture, debugging |
| **MEDIUM** | Sonnet, Gemini Pro | Standard tasks, implementation |
| **LOW** | Haiku, Grok | Fast lookups, simple operations |

## Best Practices

1. **Single Responsibility**: Each agent should excel at one thing
2. **Clear Triggers**: Description should indicate when to use
3. **Tool Constraints**: Limit tools to what's actually needed
4. **Model Matching**: Route to appropriate model tier for task complexity

## Agent Definition Template

### Claude Code (Markdown)
```markdown
---
description: What this agent specializes in
capabilities: ["task1", "task2", "task3"]
---

# Agent Name

Detailed description of the agent's role and expertise.

## Capabilities
- Specific task the agent excels at
- Another specialized capability

## When to Use
- Scenario 1
- Scenario 2

## Context
Additional context for effective use.
```

### OpenCode (TypeScript)
```typescript
export const createMyAgent = (): AgentDefinition => ({
  name: "my-agent",
  description: "Specialized for X tasks. Use when Y.",
  prompt: `You are an expert in X...`,
  tools: {
    include: ["Read", "Edit", "Glob", "Grep", "Bash"]
  },
  model: "anthropic/claude-sonnet-4-5",
  temperature: 0.1
});
```

## Creation Workflow

1. **Identify Need**: What specialized capability is missing?
2. **Define Scope**: What should this agent do (and NOT do)?
3. **Select Model**: Match complexity to model tier
4. **Configure Tools**: Minimum necessary tool access
5. **Write Prompt**: Clear, focused system instructions
6. **Test Delegation**: Verify orchestrator routes correctly

## Output

After creation, the agent will be available at:
- Claude Code: `agents/<agent-name>.md`
- OpenCode: Registered in agent definitions
