# Agents & Skills Reference

**Part of:** Oh-My-OpenCode Repository Analysis  
**Purpose:** Detailed examples of agents and skills with full source code analysis

---

## What's in This Directory

This directory contains **reference documentation** - detailed analysis of how oh-my-opencode implements its agents and skills. Use this when you need concrete examples to follow.

---

## Quick Navigation

### Agents

Agents are specialized LLM configurations for specific roles.

| Agent | Cost | Role | When to Use |
|-------|------|------|-------------|
| [Atlas](./agents/atlas.md) | EXPENSIVE | Orchestrator | Coordinate complex multi-step tasks |
| [Oracle](./agents/oracle.md) | EXPENSIVE | Strategic advisor | Deep debugging, architecture decisions |
| [Explore](./agents/explore.md) | FREE | Codebase search | Find patterns in YOUR codebase |
| [Librarian](./agents/librarian.md) | CHEAP | External docs | Find patterns in EXTERNAL repos/docs |
| [Metis](./agents/metis.md) | EXPENSIVE | Pre-planning | Analyze requests before execution |
| [Momus](./agents/momus.md) | EXPENSIVE | Plan review | Validate plans for completeness |
| [Multimodal](./agents/multimodal-looker.md) | CHEAP | Vision | Analyze images, PDFs, diagrams |

### Skills

Skills are specialized instruction sets that inject domain knowledge.

| Skill | Domain | Key Pattern |
|-------|--------|-------------|
| [Git Master](./skills/git-master.md) | Git operations | Multiple BLOCKING phases, formula-based rules |
| [Frontend UI/UX](./skills/frontend-ui-ux.md) | Design | Bold aesthetic direction, anti-AI-slop |
| [Dev Browser](./skills/dev-browser.md) | Browser automation | Persistent page state |
| [Agent Browser](./skills/agent-browser.md) | Browser CLI | Snapshot-based refs |

### Reference Matrix

[reference-matrix.md](./reference-matrix.md) - Quick lookup tables for agent selection, delegation templates, and common patterns.

---

## How to Use This Reference

### For Agent Selection

1. Start with the **Agents Overview** in [agents/README.md](./agents/README.md)
2. Use the cost/role matrix to choose the right agent
3. Read individual agent docs for usage patterns

### For Skill Creation

1. Study **git-master** as the reference implementation
2. Copy the structure: Mode Detection → BLOCKING Phases → Anti-Patterns
3. Use [skills/README.md](./skills/README.md) checklist

### For Template Copying

1. Go to [reference-matrix.md](./reference-matrix.md)
2. Copy the 6-section delegation template
3. Copy the BLOCKING checkpoint template

---

## Key Patterns Demonstrated

These are the patterns from [02-design-patterns.md](../02-design-patterns.md) shown in practice:

| Pattern | Best Example |
|---------|--------------|
| BLOCKING Checkpoints | [git-master](./skills/git-master.md) Phase 1 |
| Mode Detection Table | [git-master](./skills/git-master.md) |
| 6-Section Delegation | [atlas](./agents/atlas.md) |
| Read-Only Expensive Agents | [oracle](./agents/oracle.md) |
| Parallel Cheap Agents | [explore](./agents/explore.md) |
| Anti-Patterns Section | All skills |

---

## Reading Order

If studying the full system:

```
1. agents/README.md     ← Agent system overview
2. oracle.md            ← Read-only advisor pattern
3. explore.md           ← Cheap parallel agent pattern
4. atlas.md             ← Orchestrator pattern

5. skills/README.md     ← Skill structure pattern
6. git-master.md        ← Reference implementation (MOST IMPORTANT)
7. frontend-ui-ux.md    ← Identity-based skill pattern
```

---

## See Also

- [../02-design-patterns.md](../02-design-patterns.md) - Pattern explanations
- [../04-practical-guide.md](../04-practical-guide.md) - How to apply these patterns
- [../05-prompt-engineering.md](../05-prompt-engineering.md) - Prompt techniques
