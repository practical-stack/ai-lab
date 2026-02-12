# Writing Effective Skills

Guidelines for writing the description field and instruction body. Based on [Anthropic's official skill guide](../../../docs/05-anthropic-skills-guide/04-writing-instructions.md) with project-specific extensions.

## Degrees of Freedom

> **Note**: This framework is a project-level guideline, not from Anthropic's official spec. The official guide covers this implicitly under "Be Specific and Actionable."

Match instruction specificity to the task's fragility and variability.

| Level | When to Use | Implementation |
|-------|-------------|----------------|
| **High** | Multiple valid approaches, context-dependent decisions | Text instructions only |
| **Medium** | Preferred pattern exists, some variation acceptable | Pseudocode or parameterized scripts |
| **Low** | Fragile operations, consistency critical, specific sequence required | Specific scripts with minimal parameters |

Think of Claude as exploring a path: a **narrow bridge with cliffs** needs specific guardrails (low freedom), while an **open field** allows many routes (high freedom).

**Examples**:
- **High freedom**: "Generate a summary of the analysis results" — many valid formats
- **Medium freedom**: "Use this template but adapt sections as needed" — preferred structure
- **Low freedom**: "Run `scripts/validate.py --strict` — must execute exactly" — deterministic

## The Description Field

The description is the first level of progressive disclosure — it determines **when** Claude loads your skill.

**Write natural prose**, not structured labels. Weave trigger phrases into 1-3 sentences:
- ✅ `"Guide for creating effective skills. Use when users want to create a new skill or update an existing skill."`
- ❌ `"Creates skills.\nUSE WHEN:\n- 'create a skill'\nDO NOT USE WHEN:\n- Creating agents"`

For good/bad examples, see [frontmatter-spec.md](frontmatter-spec.md#description-required) and [official-examples.md](official-examples.md).

## SKILL.md Body Structure

**There is no universal template.** Design the body around your skill's domain. Anthropic's official skills each have unique structures tailored to their purpose.

**Patterns observed from official skills:**

- **Simple reference** (33-74 lines): overview → details → usage. E.g., `internal-comms`, `brand-guidelines`
- **Tool-based** (~96 lines): decision tree → examples → best practices. E.g., `webapp-testing`
- **Multi-step workflow** (~350 lines): stages with clear transitions. E.g., `doc-coauthoring`
- **Creative/generative** (~400 lines): philosophy → process → technical requirements → resources. E.g., `algorithmic-art`
- **Builder/creator** (~350 lines): core principles → anatomy → step-by-step. E.g., `skill-creator`

**One possible structure** (not prescriptive — adapt to your domain):

```markdown
# Skill Name

[Brief intro — what this skill does]

## [Domain-Appropriate Section 1]
[Content]

## [Domain-Appropriate Section 2]
[Content]

## Reference Files
- [link to reference if applicable]
```

## Best Practices

### Be Specific and Actionable

**Good:**
```text
Run `python scripts/validate.py --input {filename}` to check data format.
If validation fails, common issues include:
- Missing required fields (add them to the CSV)
- Invalid date formats (use YYYY-MM-DD)
```

**Bad:**
```text
Validate the data before proceeding.
```

### Reference Bundled Resources Clearly

```text
Before writing queries, consult `references/api-patterns.md` for:
- Rate limiting guidance
- Pagination patterns
- Error codes and handling
```

### Use Progressive Disclosure

Keep `SKILL.md` focused on core instructions. Move detailed documentation to `references/` and link to it. See SKILL.md's "Progressive Disclosure Patterns" section for the 3-level loading system.

### Include Error Handling

```markdown
## Common Issues

### MCP Connection Failed
If you see "Connection refused":
1. Verify MCP server is running: Check Settings > Extensions
2. Confirm API key is valid
3. Try reconnecting: Settings > Extensions > [Your Service] > Reconnect
```

### Put Critical Instructions at the Top

Claude processes instructions sequentially. If something is critical:
- Place it near the beginning of SKILL.md
- Use `## Important` or `## Critical` headers
- Repeat key points if needed

### Avoid Verbose Instructions

Claude may ignore overly verbose instructions. Keep it concise:
- Use bullet points and numbered lists
- One idea per paragraph
- Move detailed reference to `references/`

### Handle Model "Laziness"

For critical validations, bundle a script that performs checks programmatically rather than relying on language instructions. Code is deterministic; language interpretation isn't.

```markdown
## Performance Notes
- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps
```

Note: Adding this to user prompts is more effective than in SKILL.md.
