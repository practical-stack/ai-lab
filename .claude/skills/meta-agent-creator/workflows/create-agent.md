# Workflow: Create Agent

Step-by-step workflow for creating a new specialized agent.

## Prerequisites

Before starting:
- Clear understanding of the task domain
- Knowledge of available model tiers
- Target platform (OpenCode / Claude Code)

## Phase 1: DEFINE PURPOSE

**Goal**: Clarify agent's role and responsibilities.

**Questions to Ask**:
1. "What specific tasks should this agent handle?"
2. "When should the orchestrator delegate to this agent?"
3. "What domain expertise is required?"
4. "Should it be read-only or have write access?"

**Deliverables**:
- Clear role definition
- Trigger conditions for delegation
- Required capabilities list
- Access level decision (readonly vs full)

**Exit Criteria**: Can describe the agent's purpose in one sentence.

## Phase 2: CLASSIFY

**Goal**: Determine category and model tier.

**Decision Matrix**:

| If the agent needs... | Category | Model | Cost |
|-----------------------|----------|-------|------|
| Fast codebase search | exploration | haiku/fast | FREE |
| Specific domain implementation | specialist | sonnet/inherit | CHEAP |
| Complex reasoning, architecture | advisor | opus/inherit | EXPENSIVE |
| Simple transformations | utility | haiku/fast | FREE |
| Delegate to other agents | orchestration | sonnet/inherit | CHEAP |

**Deliverables**:
- Category assignment
- Model tier selection
- Cost classification

**Exit Criteria**: Category and model tier selected with justification.

## Phase 3: DESIGN PROMPT

**Goal**: Write effective system prompt.

**Prompt Structure**:

```markdown
## Role
[1-2 sentence identity and expertise]

## Core Capabilities
- [Capability 1]
- [Capability 2]

## Workflow
1. [Step 1]
2. [Step 2]

## Output Format
[Structured output definition]

## Constraints
- [Constraint 1]
- [Constraint 2]
```

**Best Practices**:
- Keep prompts concise (<500 words)
- Use imperative form
- Include specific output format
- Define clear constraints
- Avoid vague instructions

**Exit Criteria**: Complete prompt following the structure above.

## Phase 4: CONFIGURE

**Goal**: Create platform-specific configuration.

### Option A: Use Init Script

```bash
bun scripts/init-agent.ts <agent-name> --path <output-path> --platform opencode
```

### Option B: Manual Configuration

**OpenCode / Claude Code (TypeScript)**

Location: `src/agents/<agent-name>.ts`

```typescript
export function createMyAgent(model: string): AgentConfig {
  return {
    name: "my-agent",
    description: "Agent description for orchestrator selection...",
    mode: "subagent",
    model,
    temperature: 0.1,
    tools: { include: ["read", "glob", "grep"] },
    prompt: `System prompt...`
  };
}
```

**Required Fields**:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent identifier (kebab-case) |
| `description` | Yes | Selection guide for orchestrator |
| `mode` | Yes | Always `"subagent"` |
| `model` | Yes | Model string |
| `temperature` | No | Defaults to 0.1 |
| `tools` | No | Tool whitelist/blacklist |
| `prompt` | Yes | System prompt |

**Exit Criteria**: Complete configuration file with all required fields.

## Phase 5: REGISTER & TEST

**Goal**: Add agent to registry and verify functionality.

**Registration Checklist**:
- [ ] Add to agent definitions/index
- [ ] Update orchestrator's available agents list
- [ ] Add to delegation table if applicable
- [ ] Document trigger conditions

**Testing Protocol**:

1. **Invoke with representative task**
   ```
   Delegate to [agent-name]: [sample task]
   ```

2. **Verify output format matches spec**
   - Check structured output sections
   - Confirm all required fields present

3. **Check tool restrictions are enforced**
   - Verify only whitelisted tools used
   - Confirm readonly enforced if applicable

4. **Test edge cases**
   - Empty input
   - Malformed request
   - Out-of-scope task

**Exit Criteria**: Agent responds correctly to 3+ test cases.

## Validation

Run validation script:

```bash
bun scripts/validate-agent.ts <agent-file>
```

Checks:
- Factory function exists
- Required fields present
- No incomplete TODO items
- Type annotations correct

## Quick Reference

| Phase | Goal | Key Output |
|-------|------|------------|
| 1. DEFINE | Clarify purpose | Role definition |
| 2. CLASSIFY | Select category/model | Category + tier |
| 3. DESIGN | Write prompt | System prompt |
| 4. CONFIGURE | Create config | Agent file |
| 5. REGISTER | Add & test | Working agent |
