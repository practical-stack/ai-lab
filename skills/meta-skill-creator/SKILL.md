---
name: meta-skill-creator
description: Create new Claude Code or OpenCode skills following best practices. Use when building reusable AI capabilities, packaging domain expertise, or scaffolding skill directories.
---

# Meta Skill Creator

Create well-structured skills for Claude Code and OpenCode following established patterns.

## When to Use

- Creating a new skill from scratch
- Converting ad-hoc prompts into reusable skills
- Packaging domain expertise into shareable format
- Setting up skill directory structure

## Skill Structure

### Claude Code Skills
```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions
├── scripts/              # Optional: executable automation
├── references/           # Optional: on-demand documentation
└── assets/               # Optional: templates, images
```

### OpenCode Skills
Skills in OpenCode are loaded from `.opencode/skills/` or registered via plugins.

## SKILL.md Format

```yaml
---
name: skill-name                    # Required: kebab-case identifier
description: When to use this skill # Required: trigger phrases + purpose
disable-model-invocation: false     # Optional: user-only trigger
---

# Skill Title

Instructions for the AI agent...
```

## Best Practices

1. **Concise Instructions**: Context window is shared. Only add what Claude doesn't know.
2. **Progressive Disclosure**: 
   - Metadata always loaded
   - Body loads on trigger
   - References load on-demand
3. **Degrees of Freedom**: Match specificity to task fragility
4. **Self-Documenting**: Skill name and description should make purpose clear

## Creation Workflow

1. **Define Purpose**: What problem does this skill solve?
2. **Identify Triggers**: What phrases should activate this skill?
3. **Draft Instructions**: Write clear, imperative instructions
4. **Add Scripts** (if needed): Automate repetitive tasks
5. **Test**: Verify skill activates correctly and produces expected results

## Example: Creating a Code Review Skill

```yaml
---
name: code-review
description: Review code for best practices, security issues, and performance. Use when reviewing PRs, auditing code quality, or preparing for code review.
---

# Code Review

When reviewing code, systematically check:

1. **Correctness**: Does the code do what it claims?
2. **Security**: Are there vulnerabilities?
3. **Performance**: Are there obvious bottlenecks?
4. **Maintainability**: Is the code readable and well-structured?
5. **Test Coverage**: Are edge cases covered?

Provide specific, actionable feedback with line references.
```

## Output

After creation, the skill will be available at:
- Claude Code: `skills/<skill-name>/SKILL.md`
- OpenCode: `.opencode/skills/<skill-name>/SKILL.md`
