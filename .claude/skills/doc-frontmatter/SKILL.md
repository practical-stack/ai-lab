---
name: doc-frontmatter
description: |
  Generate and validate YAML frontmatter for docs folder documents.
  Triggers: "add frontmatter", "update frontmatter", "generate frontmatter",
  "validate frontmatter", "document metadata"
---

# Doc Frontmatter

Generate and validate YAML frontmatter for docs folder documents.

## Quick Reference

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Document title (from H1 or filename) |
| `description` | Yes | 50-160 char summary |
| `type` | Yes | `tutorial`, `guide`, `reference`, `explanation`, `adr`, `troubleshooting`, `pattern`, `index` |
| `tags` | No | Max 5 tags from controlled vocabulary |
| `order` | No | Numeric order (from filename prefix like `00-`) |

**Full schema, types, and tags** → [schema.md](references/schema.md)

## Workflows

### 1. Add frontmatter to a document

1. Read document content
2. Extract `title` from first H1 or derive from filename
3. Generate `description` from first paragraph (50-160 chars)
4. Determine `type` based on content patterns (see schema.md)
5. Select relevant `tags` (max 5) from controlled vocabulary
6. Insert frontmatter block at document top

### 2. Update existing frontmatter

1. Parse existing frontmatter
2. Fill missing required fields
3. Validate values against schema

### 3. Validate folder

```bash
bun scripts/validate-frontmatter.ts docs/
```

### 4. Auto-generate for single file

```bash
bun scripts/generate-frontmatter.ts docs/path/to/file.md
# Use --dry-run to preview without writing
```

## Resources

| Resource | Purpose |
|----------|---------|
| [schema.md](references/schema.md) | **Source of Truth** - Complete schema, types, tags definitions |
| `scripts/generate-frontmatter.ts` | Auto-generate frontmatter from document content |
| `scripts/validate-frontmatter.ts` | Validate frontmatter against schema |
