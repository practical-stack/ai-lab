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

**Structure:** `[What it does]` + `[When to use it]` + `[Key capabilities]`

For good/bad description examples, see [frontmatter-spec.md](frontmatter-spec.md#description-required).

## Recommended SKILL.md Body Structure

```markdown
---
name: your-skill
description: [...]
---

# Your Skill Name

## Instructions

### Step 1: [First Major Step]
Clear explanation of what happens.

python scripts/fetch_data.py --project-id PROJECT_ID

Expected output: [describe what success looks like]

(Add more steps as needed)

## Examples

### Example 1: [common scenario]
User says: "Set up a new marketing campaign"
Actions:
1. Fetch existing campaigns via MCP
2. Create new campaign with provided parameters
Result: Campaign created with confirmation link

## Troubleshooting

**Error:** [Common error message]
**Cause:** [Why it happens]
**Solution:** [How to fix]
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
