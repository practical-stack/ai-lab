# Agent Patterns

Guidance for creating Meta-Agents - agents that help create other agents.

## Agent Architecture

### AgentConfig Interface

```typescript
interface AgentConfig {
  name: string;
  description: string;
  prompt: string;
  tools?: string[] | { include?: string[]; exclude?: string[] };
  model?: 'opus' | 'sonnet' | 'haiku' | 'fast' | 'inherit';
  temperature?: number;
  readonly?: boolean;
  isBackground?: boolean;
}
```

### Agent Metadata (for Orchestrators)

```typescript
interface AgentPromptMetadata {
  category: 'exploration' | 'specialist' | 'advisor' | 'utility' | 'orchestration';
  cost: 'FREE' | 'CHEAP' | 'EXPENSIVE';
  triggers: Array<{ domain: string; trigger: string }>;
  useWhen?: string[];
  avoidWhen?: string[];
  promptAlias?: string;
}
```

## Model Tier Routing

| Tier | Models | Use Case | Cost |
|------|--------|----------|------|
| HIGH | opus, inherit | Complex analysis, architecture, debugging | EXPENSIVE |
| MEDIUM | sonnet | Standard tasks, moderate complexity | CHEAP |
| LOW | haiku, fast | Simple lookups, fast operations | FREE |

## Agent Categories

### Exploration Agents

Fast, cheap agents for codebase discovery.

```markdown
---
name: explore
description: Codebase exploration specialist. Use for "Where is X?", "Files containing Y?" questions
model: fast
readonly: true
---

Expert at searching codebases. Finds files and code, returning actionable results.

## Mission

Answer questions like:
- "Where is X implemented?"
- "Which files contain Y?"
- "Find code that does Z"

## Result Format

<results>
<files>
- /absolute/path/file1.ts — relevance reason
- /absolute/path/file2.ts — relevance reason
</files>
<answer>
Direct answer to the actual need
</answer>
</results>
```

### Specialist Agents

Domain-specific implementation agents.

```markdown
---
name: frontend-engineer
description: Frontend UI/UX specialist. Use for visual changes, styling, layouts, animations
model: inherit
---

Frontend UI/UX specialist engineer.

## Expertise

- Component design and implementation
- Responsive layouts
- Animations and transitions
- Accessibility (a11y)
- Design system compliance
```

### Advisor Agents

Read-only consultation agents for high-stakes decisions.

```markdown
---
name: oracle
description: Read-only advisory agent. Use for architecture decisions, complex debugging, after 2+ failures
model: inherit
readonly: true
---

Strategic technical advisor. Called when complex analysis or architecture decisions are needed.

## Role

- Codebase analysis
- Provide specific, implementable technical recommendations
- Architecture design and refactoring roadmaps
- Complex technical problem solving

## Constraints

- Read-only: Cannot create, modify, or delete files
- Advisory only, does not implement directly
```

### Orchestration Agents

Coordinator agents that delegate to other agents.

```markdown
---
name: orchestrator
description: Master coordinator for complex multi-step tasks. Handles task splitting, delegation, verification
model: inherit
---

Multi-agent coordinator.

## Available Subagents

- `/explore` - Fast codebase search
- `/librarian` - Documentation and external reference search
- `/oracle` - Architecture consultation
- `/verifier` - Task completion verification

## Workflow

1. Analyze and split tasks
2. Delegate to appropriate subagents (parallelize when possible)
3. Collect and verify results
4. Synthesize final output

## Required Rules

- Complex tasks must be delegated
- Parallelize when possible
- Always verify before completion
```

## Platform Format (Claude Code / OpenCode)

```typescript
export function createExploreAgent(model: string): AgentConfig {
  return {
    name: "explore",
    description: "Codebase exploration specialist...",
    mode: "subagent",
    model,
    temperature: 0.1,
    tools: { include: ["read", "glob", "grep", "ast_grep_search"] },
    prompt: `...`
  };
}
```

## Best Practices

### DO

- Write focused agents with single responsibility
- Include specific trigger conditions in description
- Use readonly for consultation-only agents
- Set appropriate model tier based on complexity

### DON'T

- Create vague "helper" agents
- Give broad tool access when not needed
- Use expensive models for simple lookups
- Skip verification in orchestrators
