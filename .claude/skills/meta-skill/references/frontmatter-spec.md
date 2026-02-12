# YAML Frontmatter Specification

Complete specification for SKILL.md frontmatter based on Anthropic's official skill guide.

## Required Fields

### name (required)

- **Format**: kebab-case only
- **Constraints**: No spaces, no capitals, max 64 characters
- **Must match** the skill folder name exactly
- **Reserved**: Must not contain "claude" or "anthropic" (reserved by Anthropic)

```yaml
# Correct
name: my-awesome-skill

# Wrong
name: My Awesome Skill    # spaces and capitals
name: my_awesome_skill    # underscores
name: claude-helper       # reserved prefix
```

### description (required)

- **Structure**: `[What it does]` + `[When to use it]` + `[Key capabilities]`
- **Max length**: 1024 characters
- **Must include**: Specific trigger phrases users would actually say
- **No XML angle brackets** (`<` or `>`) — security restriction

```yaml
# Good - specific and actionable
description: |
  Analyzes Figma design files and generates developer handoff documentation.
  Use when user uploads .fig files, asks for "design specs",
  "component documentation", or "design-to-code handoff".

# Good - includes negative triggers
description: |
  Advanced data analysis for CSV files. Use for statistical modeling,
  regression, clustering. Do NOT use for simple data exploration
  (use data-viz skill instead).

# Bad - too vague
description: Helps with projects.

# Bad - missing triggers
description: Creates sophisticated multi-page documentation systems.

# Bad - too technical, no user triggers
description: Implements the Project entity model with hierarchical relationships.
```

## Optional Fields

### license

```yaml
license: MIT              # Common: MIT, Apache-2.0
```

### compatibility

- 1-500 characters
- Environment requirements: intended product, system packages, network access

```yaml
compatibility: Requires Node.js 18+ and access to GitHub API
```

### allowed-tools

Restrict tool access for security.

```yaml
allowed-tools: "Bash(python:*) Bash(npm:*) WebFetch"
```

### metadata

Custom key-value pairs for additional information.

```yaml
metadata:
  author: Company Name
  version: 1.0.0
  mcp-server: server-name
  category: productivity
  tags: [project-management, automation]
  documentation: https://example.com/docs
  support: support@example.com
```

## Complete Example

```yaml
---
name: project-setup
description: |
  Sets up complete project workspaces including pages, databases, and templates.
  Use when user says "set up a project", "create workspace", "initialize project",
  or "new project setup". Do NOT use for simple file creation.
license: MIT
compatibility: Requires Notion MCP server connection
allowed-tools: "Bash(python:*) WebFetch"
metadata:
  author: ProjectHub
  version: 1.0.0
  mcp-server: notion
  category: productivity
  tags: [project-management, setup]
---
```

## Security Rules

| Rule | Detail |
|------|--------|
| No XML brackets | `<` and `>` forbidden in frontmatter (appears in system prompt) |
| No code execution | YAML uses safe parsing |
| Reserved names | "claude" and "anthropic" prefixes reserved by Anthropic |
| Max description | 1024 characters |

**Why these restrictions**: Frontmatter appears in Claude's system prompt. Malicious content could inject instructions.

## Validation

Run the validation script to check frontmatter compliance:

```bash
bun scripts/validate-skill.ts <skill-folder>
```
