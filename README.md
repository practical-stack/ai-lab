# AI-REF

> Reference workspace for studying AI agent and skill patterns to build meta-level tooling.

## What is this?

A collection of AI agent/skill repositories aggregated for pattern analysis. The goal is to create:

- **Meta-Skills**: Skills that help create better skills
- **Meta-Agents**: Agents that help create better agents

## Directory Structure

```
ai-ref/
├── meta-skill-en/        ← Your work (English version)
├── meta-skill-ko/        ← Your work (Korean version)
├── AGENTS.md
├── README.md
└── refs/                 ← Reference repositories (gitignored)
    ├── oh-my-opencode/
    ├── oh-my-claudecode/
    ├── skills/
    ├── agent-skills/
    ├── plugins-for-claude-natives/
    └── claude-cookbooks/
```

## Quick Start

```bash
# Reference repos are in refs/ folder
cd refs/oh-my-opencode && bun install && bun test
cd refs/oh-my-claudecode && npm install && npm test
cd refs/claude-cookbooks && make install && make test
```

## Reference Repositories (in refs/)

| Project | Description | Tech Stack |
|---------|-------------|------------|
| [oh-my-opencode](./refs/oh-my-opencode/) | Multi-agent orchestration for OpenCode | Bun, TypeScript |
| [oh-my-claudecode](./refs/oh-my-claudecode/) | Multi-agent orchestration for Claude Code | Node.js, TypeScript |
| [skills](./refs/skills/) | Official Claude skill collection | Markdown, Python |
| [agent-skills](./refs/agent-skills/) | Vercel-focused Claude skills | Markdown, Bash |
| [plugins-for-claude-natives](./refs/plugins-for-claude-natives/) | Claude Code plugins | Mixed |
| [claude-cookbooks](./refs/claude-cookbooks/) | Claude examples and patterns | Python, Jupyter |

## Key Patterns Discovered

### Skill Architecture

```
skill-name/
├── SKILL.md          # Frontmatter (name, description) + instructions
├── scripts/          # Executable automation (bash/python)
├── references/       # On-demand documentation
└── assets/           # Templates, images, fonts
```

**Progressive Disclosure**: Only skill metadata loads initially. Body loads on trigger. References load on-demand.

### Agent Architecture

```typescript
{
  name: "agent-name",
  description: "When to use",
  prompt: "System prompt",
  tools: ["Read", "Edit", ...],
  model: "opus" | "sonnet" | "haiku"
}
```

**Model Routing**: Opus for complex reasoning, Sonnet for standard tasks, Haiku for fast lookups.

## Existing Meta-Tools

### skill-creator

Located at `refs/skills/skills/skill-creator/`, this is already a meta-skill that:
- Guides skill creation process
- Provides `init_skill.py` for scaffolding
- Provides `package_skill.py` for distribution
- Documents best practices for skill design

### Orchestrator Agents

Both `oh-my-opencode` and `oh-my-claudecode` implement orchestrator agents that:
- Delegate to specialist agents
- Manage parallel execution
- Verify task completion
- Route to appropriate model tiers

## Development Goals

1. **Extract** - Identify common patterns across all repos
2. **Generalize** - Create reusable templates and generators
3. **Automate** - Build meta-skills/agents that scaffold new ones
4. **Validate** - Create testing/linting for skill/agent quality

## For AI Agents

See [AGENTS.md](./AGENTS.md) for:
- Build/test commands for each project
- Code conventions and anti-patterns
- Skill and agent pattern details
- Meta-development workflow

## Related Projects

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) - Anthropic's CLI for Claude
- [OpenCode](https://opencode.ai/) - AI coding assistant framework
- [Model Context Protocol](https://modelcontextprotocol.io/) - Standardized AI tool integration

## License

Each subfolder maintains its own license. See individual repositories for details.
