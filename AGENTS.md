# Oh My PStack: Meta Skill & Agent Development Workspace

This workspace aggregates AI agent/skill repositories to study patterns and create **meta-skills** (skills that create skills) and **meta-agents** (agents that create agents).

## PURPOSE

Study existing implementations → Extract patterns → Build meta-level tooling

**Goal**: Create skills and agents that help build better skills and agents.

## DIRECTORY STRUCTURE

```
oh-my-pstack/
├── .claude-plugin/       ← Claude Code plugin manifest
├── .opencode/            ← OpenCode plugin
├── skills/               ← Shared skills (both platforms)
├── agents/               ← Shared agent definitions
├── meta-skill-en/        ← Your work (meta-skill development)
├── meta-skill-ko/        ← Your work (meta-skill development)
├── AGENTS.md             ← This file
├── README.md
└── refs/                 ← Reference repositories (gitignored)
    ├── oh-my-opencode/
    ├── oh-my-claudecode/
    ├── skills/
    ├── agent-skills/
    ├── plugins-for-claude-natives/
    └── claude-cookbooks/
```

## REFERENCE REPOSITORIES

Each folder in `refs/` is an independent git repo with its own history:

| Repo | Runtime | Focus | Key Patterns |
|------|---------|-------|--------------|
| `refs/oh-my-opencode/` | Bun | OpenCode orchestration | Agent definitions, multi-model routing, hooks |
| `refs/oh-my-claudecode/` | Node.js | Claude Code orchestration | Tiered agents, model routing, state management |
| `refs/skills/` | - | Official skill collection | **Has `skill-creator`** - existing meta-skill |
| `refs/agent-skills/` | - | Vercel-focused skills | Skill packaging patterns |
| `refs/plugins-for-claude-natives/` | - | Claude Code plugins | Plugin architecture |
| `refs/claude-cookbooks/` | Python/uv | Jupyter notebooks | Examples, patterns |

## SKILL PATTERNS (from analysis)

### SKILL.md Structure
```yaml
---
name: skill-name           # Required: kebab-case
description: When to use   # Required: triggers + purpose
---
# Skill Title
[Markdown instructions]
```

### Skill Directory Layout
```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions
├── scripts/              # Optional: executable code (bash/python)
├── references/           # Optional: docs loaded on-demand  
└── assets/               # Optional: templates, images, fonts
```

### Key Principles (from `skill-creator`)
1. **Concise is key** - Context window is shared; only add what Claude doesn't know
2. **Progressive disclosure** - Metadata always loaded, body on trigger, references on-demand
3. **Degrees of freedom** - Match specificity to task fragility

## AGENT PATTERNS (from analysis)

### Agent Definition Structure (oh-my-claudecode)
```typescript
interface AgentConfig {
  name: string;           // e.g., "architect", "explore"
  description: string;    // When to use this agent
  prompt: string;         // System prompt (or loaded from .md)
  tools: string[];        // Allowed tools: ['Read', 'Glob', 'Edit', ...]
  model: 'opus' | 'sonnet' | 'haiku';
}
```

### Model Tier Routing
| Tier | Model | Use Case |
|------|-------|----------|
| HIGH | opus | Complex analysis, architecture, debugging |
| MEDIUM | sonnet | Standard tasks, moderate complexity |
| LOW | haiku | Simple lookups, fast operations |

### Agent Categories
| Type | Examples | Purpose |
|------|----------|---------|
| Orchestrators | sisyphus, atlas | Coordinate work, delegate |
| Specialists | architect, designer, writer | Domain expertise |
| Explorers | explore, librarian, researcher | Search and research |
| Executors | executor | Direct implementation |

## EXISTING META-TOOLS

### `skill-creator` (refs/skills/skills/skill-creator/)
Already implements meta-skill pattern:
- Guides skill creation process
- Includes `init_skill.py` and `package_skill.py` scripts
- Progressive disclosure documentation

### Orchestrator Patterns (refs/oh-my-*/src/agents/)
Study how orchestrators delegate to specialists - same pattern applies to meta-agents.

## BUILD / TEST COMMANDS

### oh-my-opencode (Bun)
```bash
cd refs/oh-my-opencode
bun run build && bun test
bun test src/file.test.ts  # Single test
```

### oh-my-claudecode (Node.js)
```bash
cd refs/oh-my-claudecode
npm run build && npm run test:run
npx vitest run src/path/to/file.test.ts
```

### claude-cookbooks (Python)
```bash
cd refs/claude-cookbooks
make install && make check && make test
```

## CODE CONVENTIONS

### TypeScript
- **Naming**: kebab-case files, `createXXX` factories, PascalCase types
- **Imports**: External alphabetical, then internal relative
- **Errors**: Always handle explicitly, never empty catch
- **Forbidden**: `as any`, `@ts-ignore`, empty catch blocks

### Skill Files
- **Frontmatter**: Only `name` + `description` in YAML
- **Body**: Imperative/infinitive form instructions
- **Size**: Keep SKILL.md under 500 lines, split to references/

## META-DEVELOPMENT WORKFLOW

### Creating a Meta-Skill
1. Study existing skills in `refs/skills/`, `refs/agent-skills/`, `refs/oh-my-*/skills/`
2. Identify patterns that can be generalized
3. Use `skill-creator` as template
4. Include scripts that automate repetitive creation tasks

### Creating a Meta-Agent
1. Study agent definitions in `refs/oh-my-*/src/agents/`
2. Analyze orchestrator patterns (delegation, verification)
3. Define agent config with appropriate model tier
4. Create prompt that guides agent creation

## PATTERN EXTRACTION CHECKLIST

When studying a repo:
- [ ] How are skills/agents defined? (structure, fields)
- [ ] What's the naming convention? (files, exports)
- [ ] How does delegation work? (prompts, tools)
- [ ] What validation exists? (schemas, tests)
- [ ] What's reusable as meta-tooling?

## KEY FILES TO STUDY

| Purpose | Location |
|---------|----------|
| Skill creation guide | `refs/skills/skills/skill-creator/SKILL.md` |
| Skill template | `refs/skills/template/SKILL.md` |
| Agent definitions | `refs/oh-my-claudecode/src/agents/definitions.ts` |
| Orchestrator prompts | `refs/oh-my-claudecode/skills/orchestrate/SKILL.md` |
| Agent council (multi-AI) | `refs/plugins-for-claude-natives/plugins/agent-council/` |
| Background agents | `refs/oh-my-opencode/src/features/background-agent/` |

## SEE ALSO

- `refs/oh-my-opencode/AGENTS.md` - Full OpenCode implementation details
- `refs/oh-my-claudecode/AGENTS.md` - Full ClaudeCode implementation details
- `refs/agent-skills/AGENTS.md` - Skill packaging guide
- `refs/skills/skills/skill-creator/SKILL.md` - Meta-skill reference implementation
