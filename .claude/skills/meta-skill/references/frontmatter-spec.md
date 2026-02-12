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

- **Format**: Natural prose, 1-3 sentences — NOT structured labels or bullet lists
- **Structure**: `[What it does]` + `[When to use it]` woven into natural sentences
- **Max length**: 1024 characters
- **Must include**: Specific trigger phrases users would actually say, embedded in prose
- **No XML angle brackets** (`<` or `>`) — security restriction
- **No structured labels**: Avoid `USE WHEN:`, `DO NOT USE WHEN:`, or bullet-list triggers

```yaml
# Good - natural prose with triggers woven in (Anthropic official style)
description: Guide for creating effective skills. This skill should be used
  when users want to create a new skill (or update an existing skill) that
  extends Claude's capabilities with specialized knowledge, workflows, or
  tool integrations.

# Good - natural prose with file types
description: Toolkit for interacting with and testing local web applications
  using Playwright. Supports verifying frontend functionality, debugging UI
  behavior, capturing browser screenshots, and viewing browser logs.

# Good - negative trigger when confusion is realistic
description: "Use this skill whenever the user wants to create, read, edit,
  or manipulate Word documents (.docx files). Do NOT use for PDFs,
  spreadsheets, Google Docs, or general coding tasks."

# Bad - structured labels instead of prose
description: |
  Creates skills for AI agents.
  USE WHEN:
  - "create a skill"
  - "new skill"
  DO NOT USE WHEN:
  - Creating agents

# Bad - too vague
description: Helps with projects.

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
