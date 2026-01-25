# Frontmatter Schema Reference

> **Source of Truth**: This document is the single source of truth for docs folder frontmatter.
> It includes Schema, Types, and Tags definitions.

---

## Quick Reference

```yaml
---
# Required fields
title: "Document Title"
description: "50-160 character summary"
type: guide                               # tutorial|guide|reference|explanation|adr|troubleshooting|pattern|index

# Optional fields
tags: [React, API]                        # Max 5 tags
order: 0                                  # Matches filename prefix

# Relationship fields (when dependencies exist)
depends_on: [./prerequisite-doc.md]       # Prerequisite document paths
related: [./related-doc.md]               # Related document paths
used_by: [/commands/xxx.md]               # Where this document is used
---
```

---

## 1. Field Definitions

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Document title. Highest search priority |
| `description` | `string` | 50-160 char summary. Core source for AI embeddings and llms.txt generation |
| `type` | `enum` | Document type. See [Type Definition](#2-type-definition) below |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `tags` | `string[]` | Max 5 tags. See [Tags List](#3-tags-controlled-vocabulary) below |
| `order` | `number` | Document order within folder. Matches filename prefix (e.g., `00-xxx.md` → `order: 0`) |

### Relationship Fields

Use when documents have dependencies.

| Field | Type | Description |
|-------|------|-------------|
| `depends_on` | `string[]` | Prerequisite document paths. Documents that should be read before this one |
| `related` | `string[]` | Related document paths. Connect documents with different perspectives on same topic |
| `used_by` | `string[]` | Where this document is used. For tracking impact when updating dependencies |

---

## 2. Type Definition

| type | Description | Example |
|------|-------------|---------|
| `tutorial` | Step-by-step learning guide. Follow-along format from start to finish | - |
| `guide` | How to perform a specific task | node-install.md, deployment.md |
| `reference` | Lookup information: APIs, specs, configuration values | K8s env vars, code conventions |
| `explanation` | Background, design principles, concept explanations | - |
| `adr` | Architecture Decision Record | apps-src-folder-structure.adr.md |
| `troubleshooting` | Problem-solving guide | ingress-routing-troubleshooting.md |
| `pattern` | Coding patterns and best practices | suspense-query-pattern.md |
| `index` | Folder index document | README.md |

### Type Selection Criteria

| Comparison | Left | Right |
|------------|------|-------|
| **tutorial vs guide** | Learning purpose, sequential from start to finish, "Let's learn X" | Task purpose, reference only needed parts, "How to do X" |
| **reference vs explanation** | Lookup information, specs/configs/APIs, "What is X" | Understanding-focused, background/principles/concepts, "Why X" |
| **pattern vs guide** | Reusable patterns, code patterns, "Write it this way" | How to perform specific task, install/config/deploy, "Do it this way" |

### Type Decision Flow

```
Check document characteristics
    ├─ Step-by-step follow-along? ──► tutorial
    ├─ "How to do ~"? ─────────────► guide
    ├─ API, specs, config values? ─► reference
    ├─ "Why ~" explanation? ───────► explanation
    ├─ ADR format? ────────────────► adr
    ├─ Problem solving? ───────────► troubleshooting
    ├─ Code pattern? ──────────────► pattern
    └─ README.md? ─────────────────► index
```

---

## 3. Tags Controlled Vocabulary

Select up to **5 tags** per document.

### Tech Stack

| Tag | Description |
|-----|-------------|
| `React` | React components, hooks, patterns |
| `TypeScript` | Type definitions, type utilities |
| `Next.js` | Next.js routing, SSR, API Routes |
| `Kubernetes` | K8s deployment, configuration, resources |
| `Nx` | Nx monorepo setup, plugins |
| `Tailwind` | Tailwind CSS, styling |

### Domain

| Tag | Description |
|-----|-------------|
| `API` | API calls, data fetching, React Query |
| `Testing` | Unit tests, integration tests |
| `Deployment` | Deployment process, ArgoCD, GitOps |
| `CI-CD` | CI/CD pipelines, GitHub Actions |
| `Security` | Security, authentication, authorization |

### Task Type

| Tag | Description |
|-----|-------------|
| `Setup` | Environment setup, initial configuration |
| `Migration` | Migration, version upgrades |
| `BestPractice` | Best practices, coding patterns |
| `Architecture` | Architecture, folder structure, design decisions |

### Other

| Tag | Description |
|-----|-------------|
| `Documentation` | Documentation, meta information |
| `Frontmatter` | Frontmatter schema, metadata |
| `AI` | AI agents, AI usage patterns |

### Tag Addition Rules

1. Add tag to this document first
2. Write clear tag description
3. Review if existing tags can substitute
4. **Keep total tag count under 20**

---

## 4. Field Detailed Specifications

### title

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | Yes |
| Purpose | Highest search priority, document identification |

**Generation rules:**
1. Use document's first H1 header
2. If no H1, extract from filename (hyphen → space, capitalize first letter)

### description

| Property | Value |
|----------|-------|
| Type | `string` |
| Required | Yes |
| Length | 50-160 characters |
| Purpose | AI embeddings, llms.txt generation |

**Generation rules:**
1. Summarize the problem the document solves
2. Reference first paragraph or overview section
3. Warn if under 50 chars, truncate if over 160 chars

### type

| Property | Value |
|----------|-------|
| Type | `enum` |
| Required | Yes |
| Allowed values | `tutorial`, `guide`, `reference`, `explanation`, `adr`, `troubleshooting`, `pattern`, `index` |

### tags

| Property | Value |
|----------|-------|
| Type | `string[]` |
| Required | No |
| Max count | 5 |

### order

| Property | Value |
|----------|-------|
| Type | `number` |
| Required | No |
| Purpose | Document order within folder |

**Generation rules:**
- Extract from filename prefix: `00-guide.md` → `order: 0`
- Omit if no prefix

### depends_on / related / used_by

| Property | depends_on | related | used_by |
|----------|------------|---------|---------|
| Type | `string[]` | `string[]` | `string[]` |
| Required | No | No | No |
| Purpose | Specify prerequisites | Connect related docs | Track dependencies |

**used_by target paths:**
- `/commands/*.md` - AI command files
- `/rules/*.mdc` - AI rule files
- `/docs/AGENTS.md` - Document structure guide

---

## 5. Examples

### Minimal frontmatter

```yaml
---
title: "Node.js Installation Guide"
description: "How to manage and install Node.js versions using asdf"
type: guide
---
```

### Recommended frontmatter

```yaml
---
title: "Document Title"
description: "50-160 character core summary"
type: guide
tags: [React, API]
order: 0
---
```

### Full frontmatter

```yaml
---
title: "SuspenseQuery Cohesion Pattern"
description: "Pattern to solve the difficulty of understanding data flow caused by separating SuspenseQuery declaration from usage"
type: pattern
tags: [React, API, BestPractice]
order: 3
depends_on: [./suspense-query-conditional-pattern.md]
related: [./parallel-query-pattern.md, ./prefetch-query-pattern.md]
used_by: [/commands/make-api.md, /rules/api-rules.mdc]
---
```
