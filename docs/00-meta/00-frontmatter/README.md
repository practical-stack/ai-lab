---
title: "Frontmatter System"
description: "Source of Truth, learning order, and quick start guide for the YAML frontmatter system used in docs folder documentation."
type: index
tags: [Documentation, Frontmatter]
---

# Frontmatter System

[한국어](./README.ko.md)

A YAML frontmatter system for writing documentation in the docs folder.

---

## Source of Truth

> **The skill reference below is the Source of Truth for Schema, Tags, and Types definitions.**
> 
> **[/.ai-agents/skills/docs-update-frontmatter/references/schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)**

---

## Document Structure

| # | Document | Description |
|:-:|----------|-------------|
| 0 | [00-requirement.md](./00-requirement.md) | **Requirements** - Why this system is needed |
| 1 | [01-adr.md](./01-adr.md) | **ADR** - Why it was designed this way |
| - | [research/](./research/) | Research Materials - DeepSearch process |

---

## Quick Start

```yaml
---
# Required
title: "Document Title"
description: "50-160 character core summary"
type: guide    # tutorial|guide|reference|explanation|adr|troubleshooting|pattern|index

# Optional
tags: [React, API]                    # Max 5
order: 0                              # Match filename prefix

# Relationships (when dependencies exist)
depends_on: [./prerequisite-doc.md]   # Prerequisite documents
related: [./related-doc.md]           # Related documents
used_by: [/.ai-agents/xxx.md]         # Where this document is used
---
```

**Detailed Schema, Tags, Types**: See [schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)

---

## Learning Order

```
schema.md (What exists and how to use it)
    ↓
00-requirement.md (Why it's needed)
    ↓
01-adr.md (Why it was designed this way)
```
