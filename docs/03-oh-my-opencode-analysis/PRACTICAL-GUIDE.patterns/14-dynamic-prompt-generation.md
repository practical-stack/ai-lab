# Pattern 14: Dynamic Prompt Generation

**Effort:** 2-3 days | **Impact:** High | **Level:** Full System  
**Source:** [04-prompt-engineering.md](../04-prompt-engineering.md)

---

## The Problem

Hardcoded prompts become stale:
- New agents added but not in prompt
- Skills created but agent doesn't know about them
- Categories changed but prompt has old list
- Mismatch between code and prompt causes confusion

---

## The Solution

Build prompts dynamically from available resources at runtime.

---

## Architecture

```
Available Resources:
├── Agents (from registry)
├── Skills (from loader)
├── Categories (from config)
└── Tools (from tool registry)
        ↓
Prompt Generator
        ↓
Complete System Prompt:
<Role>...</Role>
<Available_Agents>...</Available_Agents>
<Available_Categories>...</Available_Categories>
<Available_Skills>...</Available_Skills>
<Behavior_Instructions>...</Behavior_Instructions>
```

---

## Implementation

### Resource Types

```typescript
interface AvailableAgent {
  name: string
  description: string
  model: string
  capabilities: string[]
}

interface AvailableSkill {
  name: string
  description: string
  triggers: string[]
}

interface AvailableCategory {
  name: string
  model: string
  useCase: string
}

interface AvailableTool {
  name: string
  description: string
}
```

### Prompt Generator

```typescript
function buildDynamicPrompt(
  availableAgents: AvailableAgent[],
  availableSkills: AvailableSkill[],
  availableCategories: AvailableCategory[],
  availableTools: AvailableTool[]
): string {
  return `
<Role>
You are "Sisyphus" - Powerful AI Agent with orchestration capabilities.

**Identity**: SF Bay Area engineer. Work, delegate, verify, ship. No AI slop.

**Core Competencies**:
- Parsing implicit requirements from explicit requests
- Delegating specialized work to the right subagents
- Parallel execution for maximum throughput
</Role>

<Available_Agents>
| Agent | Description | When to Use |
|-------|-------------|-------------|
${availableAgents.map(a => 
  `| ${a.name} | ${a.description} | ${a.capabilities.join(', ')} |`
).join('\n')}
</Available_Agents>

<Available_Categories>
| Category | Model | Use Case |
|----------|-------|----------|
${availableCategories.map(c => 
  `| ${c.name} | ${c.model} | ${c.useCase} |`
).join('\n')}
</Available_Categories>

<Available_Skills>
${availableSkills.map(s => 
  `- **${s.name}**: ${s.description}
  Triggers: ${s.triggers.join(', ')}`
).join('\n\n')}
</Available_Skills>

<Available_Tools>
${availableTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}
</Available_Tools>

<Behavior_Instructions>
${BEHAVIOR_INSTRUCTIONS}
</Behavior_Instructions>

<Constraints>
${CONSTRAINTS}
</Constraints>
  `.trim()
}
```

### Resource Loaders

```typescript
// Load agents from registry
function loadAvailableAgents(): AvailableAgent[] {
  const agentFiles = glob.sync('src/agents/*.ts')
  
  return agentFiles.map(file => {
    const agent = require(file)
    return {
      name: agent.name,
      description: agent.description,
      model: agent.model,
      capabilities: agent.capabilities
    }
  })
}

// Load skills from skill loader
function loadAvailableSkills(): AvailableSkill[] {
  const skillDirs = glob.sync('.claude/skills/*/SKILL.md')
  
  return skillDirs.map(path => {
    const content = readFileSync(path, 'utf-8')
    const { data } = matter(content)  // Parse frontmatter
    
    return {
      name: data.name,
      description: data.description,
      triggers: extractTriggers(data.description)
    }
  })
}

// Load categories from config
function loadAvailableCategories(): AvailableCategory[] {
  const config = loadConfig()
  
  return Object.entries(config.categories).map(([name, cfg]) => ({
    name,
    model: cfg.model,
    useCase: cfg.description
  }))
}
```

### Usage

```typescript
// On startup or when resources change
const prompt = buildDynamicPrompt(
  loadAvailableAgents(),
  loadAvailableSkills(),
  loadAvailableCategories(),
  loadAvailableTools()
)

// Use the prompt
await startSession({ systemPrompt: prompt })
```

---

## Generated Sections

### Available Agents Section

```xml
<Available_Agents>
| Agent | Description | When to Use |
|-------|-------------|-------------|
| oracle | Strategic advisor (READ-ONLY) | Complex decisions, debugging |
| explore | Fast code search | Find patterns in codebase |
| librarian | Documentation expert | External docs, OSS examples |
| junior | Task executor | Delegated implementation |
| frontend | UI/UX specialist | Component design, styling |
</Available_Agents>
```

### Available Categories Section

```xml
<Available_Categories>
| Category | Model | Use Case |
|----------|-------|----------|
| visual-engineering | gemini-3 | Frontend, UI/UX, design |
| ultrabrain | claude-opus | Complex reasoning, architecture |
| quick | claude-haiku | Trivial tasks, single file |
| writing | claude-sonnet | Documentation, prose |
</Available_Categories>
```

### Available Skills Section

```xml
<Available_Skills>
- **git-master**: Git operations, atomic commits, history search
  Triggers: commit, rebase, squash, blame, bisect

- **playwright**: Browser automation and testing
  Triggers: browser, e2e test, screenshot, automation

- **frontend-ui-ux**: Component design and styling
  Triggers: component, UI, UX, responsive, accessibility
</Available_Skills>
```

---

## Benefits

| Benefit | Explanation |
|---------|-------------|
| **Accuracy** | Prompt matches actual capabilities |
| **Extensibility** | Add skills/agents without editing prompts |
| **Deployment Flexibility** | Different deployments have different resources |
| **Single Source of Truth** | No mismatch between code and prompt |
| **Maintainability** | One place to update resource definitions |

---

## Refresh Strategies

### On Startup

```typescript
// Generate once at startup
const systemPrompt = buildDynamicPrompt(/*...*/)
```

### On Resource Change

```typescript
// Watch for changes
watcher.on('change', (path) => {
  if (isSkillFile(path) || isAgentFile(path)) {
    refreshPrompt()
  }
})
```

### On Demand

```typescript
// Regenerate when explicitly requested
function refreshPrompt() {
  currentPrompt = buildDynamicPrompt(
    loadAvailableAgents(),
    loadAvailableSkills(),
    loadAvailableCategories(),
    loadAvailableTools()
  )
}
```

---

## Testing

```typescript
describe("Dynamic Prompt Generation", () => {
  test("includes all available agents", () => {
    const agents = [
      { name: "oracle", description: "Strategic advisor", ... },
      { name: "explore", description: "Code search", ... }
    ]
    
    const prompt = buildDynamicPrompt(agents, [], [], [])
    
    expect(prompt).toContain("oracle")
    expect(prompt).toContain("explore")
    expect(prompt).toContain("Strategic advisor")
  })
  
  test("includes all available skills", () => {
    const skills = [
      { name: "git-master", description: "Git operations", triggers: ["commit"] }
    ]
    
    const prompt = buildDynamicPrompt([], skills, [], [])
    
    expect(prompt).toContain("git-master")
    expect(prompt).toContain("Git operations")
    expect(prompt).toContain("commit")
  })
  
  test("generates valid XML structure", () => {
    const prompt = buildDynamicPrompt([], [], [], [])
    
    expect(prompt).toContain("<Role>")
    expect(prompt).toContain("</Role>")
    expect(prompt).toContain("<Available_Agents>")
    expect(prompt).toContain("</Available_Agents>")
  })
})
```

---

## Adoption Checklist

- [ ] Identify dynamic sections of your prompt
- [ ] Create resource loader for each type (agents, skills, etc.)
- [ ] Build prompt generator function
- [ ] Choose refresh strategy (startup, watch, on-demand)
- [ ] Add tests for generated prompt structure
- [ ] Monitor for resource changes in development

---

## See Also

- [04-xml-tag-structure.md](./04-xml-tag-structure.md) - XML structure for prompts
- [08-skill-format.md](./08-skill-format.md) - Skill metadata format
- [10-category-skill-system.md](./10-category-skill-system.md) - Category configuration
