---
title: "Documentation System Meta Information"
description: "Frontmatter schema, tag controlled vocabulary, type definitions, and authoring guide for docs folder documentation."
type: index
tags: [Documentation, Frontmatter]
used_by: [/.claude/skills/doc-frontmatter/SKILL.md]
---

# Documentation System Meta Information

[한국어](./README.ko.md)

Schema, tags, and guides for writing documentation in the docs folder.

---

## Folder Structure

```
00-meta/
└── 00-frontmatter/              # Frontmatter System
    ├── 00-guide.md              # Application Guide
    ├── 01-schema.md             # Schema Definition (Source of Truth)
    ├── 02-tags.md               # Tag List (Source of Truth)
    ├── 03-types.md              # Type Definition (Source of Truth)
    ├── 04-requirement.md        # Requirements
    ├── 05-adr.md                # Architecture Decision Record
    └── research/                # Research Materials
```

---

## Document List

| Document | Description | Purpose |
|----------|-------------|---------|
| [00-guide.md](./00-frontmatter/00-guide.md) | Frontmatter Application Guide | Reference when writing docs |
| [01-schema.md](./00-frontmatter/01-schema.md) | Frontmatter Schema Definition | **Source of Truth** |
| [02-tags.md](./00-frontmatter/02-tags.md) | Tags Controlled Vocabulary | **Source of Truth** |
| [03-types.md](./00-frontmatter/03-types.md) | Document Type Definition | **Source of Truth** |
| [04-requirement.md](./00-frontmatter/04-requirement.md) | System Requirements Definition | Background understanding |
| [05-adr.md](./00-frontmatter/05-adr.md) | Architecture Decision Record (ADR) | Design rationale |

---

## Source of Truth

| Item | Document |
|------|----------|
| Frontmatter Field Definition | [01-schema.md](./00-frontmatter/01-schema.md) |
| Available Tags | [02-tags.md](./00-frontmatter/02-tags.md) |
| Document Types | [03-types.md](./00-frontmatter/03-types.md) |

---

## Quick Reference

### Required Fields

```yaml
---
title: "Document Title"
description: "50-160 character core summary"
type: guide  # tutorial | guide | reference | explanation | adr | troubleshooting | pattern | index
---
```

### Recommended Fields

```yaml
tags: [React, API]  # Select from 02-tags.md, max 5
order: 0            # Match filename prefix
```

---

## Research Materials

[research/](./00-frontmatter/research/) - DeepSearch research materials from schema derivation process

---

## Related Documents

- [docs/AGENTS.md](../AGENTS.md) - Document structure guide for AI agents
- [docs/README.md](../README.md) - Full document index
