---
title: "ADR: Frontmatter System Design Decision Record"
description: "Records the architecture decision process and rejected alternatives for the frontmatter system, including required field count, document type classification, relationship field scope, and tags vs folders."
type: adr
tags: [Documentation, Frontmatter, Architecture]
order: 1
related: [./00-requirement.md]
---

# ADR: Frontmatter System Design Decision Record

[한국어](./01-adr.ko.md)

> **ADR (Architecture Decision Record)**: This document records the decision-making process and rejected alternatives during the frontmatter system design.
>
> - Requirements: [00-requirement.md](./00-requirement.md)
> - Schema Definition (Source of Truth): [/.ai-agents/skills/docs-update-frontmatter/references/schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)

---

## Table of Contents

1. [Required Field Count Decision](#1-required-field-count-decision)
2. [Document Type Classification System Selection](#2-document-type-classification-system-selection)
3. [Relationship Field Scope](#3-relationship-field-scope)
4. [used_by Field Introduction](#4-used_by-field-introduction)
5. [Tags vs Folder Structure](#5-tags-vs-folder-structure)
6. [llms.txt Generation Strategy](#6-llmstxt-generation-strategy)
7. [Schema Validation Method](#7-schema-validation-method)

---

## 1. Required Field Count Decision

### Decision

**Adopted 3 required fields**: `title`, `description`, `type`

### Considered Alternatives

| Alternative | Field Count | Pros | Cons | Decision |
|-------------|:-----------:|------|------|:--------:|
| **Minimal Schema** | 2 | Minimum maintenance | Cannot classify for AI | ❌ |
| **3 Required** | 3 | Balance maintenance/AI | - | ✅ |
| **5 Required** | 5 | Rich metadata | Risk of maintenance abandonment | ❌ |
| **10+ Full** | 10+ | Complete graph | Compliance below 50% within 6 months | ❌ |

### Rationale

**DeepSearch Research Results** ([synthesized-results/03-claude.md](./research/synthesized-results/03-claude.md)):

> "In a frontend monorepo with 75 markdown documents, **three frontmatter fields proved essential**: title, description, doc_type. Adding 5+ fields often leads to maintenance abandonment within 6 months, but these three alone significantly improve AI agent navigation."

**Verified Cases**:
- GitHub Docs: Only 2 required fields (title, versions)
- Astro Starlight: Only 1 required field (title)
- Mintlify: Centered on title, description

### Tradeoffs

| Perspective | 3 Required | 5+ Required |
|-------------|------------|-------------|
| Maintenance Cost | Low | High |
| AI Search Accuracy | Sufficient (80%+) | Slightly improved |
| Initial Adoption Barrier | Low | High |
| Long-term Compliance | High (80%+) | Low (below 50%) |

---

## 2. Document Type Classification System Selection

### Decision

**Adopted Diátaxis-based extended type system**: 8 types

```
tutorial | guide | reference | explanation | adr | troubleshooting | pattern | index
```

### Considered Alternatives

| Alternative | Type Count | Pros | Cons | Decision |
|-------------|:----------:|------|------|:--------:|
| **Original Diátaxis** | 4 | Simple, proven | Lacks codebase specialization | ❌ |
| **Extended Types** | 8 | Codebase-tailored | Learning required | ✅ |
| **Free Text** | Unlimited | Flexible | Inconsistent | ❌ |

### Rationale

**Limitations of Diátaxis 4-classification**:
- `adr`: Architecture decision records serve different purposes than explanation
- `troubleshooting`: Problem-solving guides have different structure than how-to
- `pattern`: Coding patterns are used differently than reference
- `index`: Folder READMEs serve a separate role

**GitHub Docs Reference**:
```yaml
type: overview | quick_start | tutorial | how_to | reference
```

### Type Definitions

| Type | Purpose | Diátaxis Mapping |
|------|---------|------------------|
| `tutorial` | Step-by-step learning | Tutorial |
| `guide` | How to perform tasks | How-to |
| `reference` | Lookup information | Reference |
| `explanation` | Background, concept explanation | Explanation |
| `adr` | Architecture decision record | (Extended) |
| `troubleshooting` | Problem-solving guide | (Extended) |
| `pattern` | Coding pattern | (Extended) |
| `index` | Folder index | (Extended) |

---

## 3. Relationship Field Scope

### Decision

**Introduced 3 relationship fields**: `depends_on`, `related`, `used_by`

### Considered Alternatives

| Alternative | Relationship Types | Pros | Cons | Decision |
|-------------|:------------------:|------|------|:--------:|
| **No Relationships** | 0 | Simple | Cannot build document graph | ❌ |
| **Minimal Relationships** | 2 | Core only | Cannot track reverse | ❌ |
| **3 Relationships** | 3 | Dependencies + reverse tracking | Management needed | ✅ |
| **Full Relationships** | 7+ | Complete graph | Complex, cycle risk | ❌ |

### Rationale

**GraphRAG Research Results**:
- Vector search alone cannot answer "What should I read before this document?"
- Explicit relationship graphs are 3.4x superior to vector-only RAG for complex queries

**Adopted Relationship Types**:

| Field | Direction | Purpose | Required |
|-------|:---------:|---------|:--------:|
| `depends_on` | Forward | Specify prerequisite documents | Optional |
| `related` | Bidirectional | Connect related documents | Optional |
| `used_by` | Reverse | Track document usage | Optional |

**Rejected Relationship Types**:

| Field | Rejection Reason |
|-------|------------------|
| `prerequisite_for` | Inverse of `depends_on`, can be auto-computed |
| `extends` | Can be sufficiently expressed with `related` |
| `conflicts_with` | Rare actual use cases |
| `see_also` | Duplicates `related` |
| `supersedes` | Low actual usage frequency, can be specified in document itself |

---

## 4. used_by Field Introduction

### Decision

**Introduced `used_by` field**: List of AI agent paths that reference the document

### Background

| Current Situation | Problem |
|-------------------|---------|
| `.ai-agents/commands/*.md` | Hardcoded docs paths |
| `.cursor/rules/*.mdc` | Hardcoded docs paths |
| When modifying documents | Cannot identify affected agents |
| When moving/deleting documents | Broken references occur |

### Considered Alternatives

| Alternative | Pros | Cons | Decision |
|-------------|------|------|:--------:|
| **No Reverse Field** | Simple | Cannot track dependencies | ❌ |
| **Auto Scan** | Real-time | High build cost | ❌ |
| **used_by Field** | Explicit, verifiable | Manual management required | ✅ |

### Usage Example

```yaml
---
title: "API Call Patterns"
description: "React Query based API call best practices"
type: pattern
used_by:
  - /.ai-agents/commands/make-api.md
  - /.cursor/rules/api-rules.mdc
---
```

### Operational Rules

1. **When modifying documents**: Review files in `used_by` list
2. **When moving documents**: CI detects broken references
3. **When adding agents**: Update `used_by` field in relevant documents

---

## 5. Tags vs Folder Structure

### Decision

**Hybrid of folder structure + supplementary tags**

### Considered Alternatives

| Alternative | Pros | Cons | Decision |
|-------------|------|------|:--------:|
| **Folders Only** | Clear location | Cannot cross-classify | ❌ |
| **Tags Only** | Flexible classification | No physical structure | ❌ |
| **Hybrid** | Physical structure + cross-classification | Need to manage both | ✅ |

### Rationale

**dotCMS Guidelines**:
> "Most documents relate to several different areas or domains, and in a hierarchy you can only put them in one folder."

**Solution**:
- **Folders**: Primary classification (only 1 possible)
- **Tags**: Cross-cutting concerns (max 5)

### Tag Operational Rules

| Rule | Content |
|------|---------|
| Max Count | 5 per document |
| Controlled Vocabulary | Select only from [schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md) |
| Total Tag Count | Maintain 20 or fewer |

---

## 6. llms.txt Generation Strategy

### Decision

**Build-time auto-generation + manual curation hybrid**

### Considered Alternatives

| Alternative | Pros | Cons | Decision |
|-------------|------|------|:--------:|
| **Fully Manual** | High quality | High maintenance cost | ❌ |
| **Fully Automatic** | Consistent | Hard to reflect importance | ❌ |
| **Hybrid** | Automation + quality | Initial setup required | ✅ |

### Rationale

**Mintlify Case**:
- `llms.txt`: Summary version (auto-generated)
- `llms-full.txt`: Full content (auto-generated)
- LLMs access llms-full.txt **more than 2x more frequently** than index files

**Vercel Results**:
> "After implementing llms.txt, signups through ChatGPT reached 10%"

### Generation Rules

```markdown
# Enterprise Web Documentation
> Frontend monorepo technical documentation

## Getting Started
- [Node Installation](./01-foundation/01-setup/node-install.md): {description}

## Best Practices
- [API Patterns](./04-best-practice/00-api/README.md): {description}
```

---

## 7. Schema Validation Method

### Decision

**CI build-time validation (future implementation)**

### Considered Alternatives

| Alternative | Pros | Cons | Decision |
|-------------|------|------|:--------:|
| **No Validation** | Freedom | Inconsistent | ❌ |
| **Pre-commit Hook** | Immediate feedback | Depends on local environment | ⚠️ |
| **CI Validation** | Consistent environment | PR-time feedback | ✅ |

### Validation Items

| Item | Validation Content | Severity |
|------|-------------------|:--------:|
| Required Fields | title, description, type exist | Error |
| type Value | Is it an allowed enum value | Error |
| tags Value | Is it in controlled vocabulary | Warning |
| Relationship Paths | Does referenced file exist | Warning |

### Implementation Plan (Future)

```typescript
// Zod schema example
const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().min(50).max(160),
  type: z.enum(['tutorial', 'guide', 'reference', 'explanation', 
                'adr', 'troubleshooting', 'pattern', 'index']),
  tags: z.array(z.string()).max(5).optional(),
  depends_on: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  supersedes: z.string().optional(),
  ai_agents: z.array(z.string()).optional(),
});
```

---

## References

### Metadata & AI

| # | Source | Link |
|---|--------|------|
| 1 | llms.txt Standard | [llmstxt.org](https://llmstxt.org/) |
| 2 | AGENTS.md Standard | [agents.md](https://agents.md/) |
| 3 | Microsoft GraphRAG | [GitHub](https://microsoft.github.io/graphrag/) |
| 4 | Mintlify llms.txt | [Mintlify Blog](https://www.mintlify.com/blog/simplifying-docs-with-llms-txt) |

### Documentation Frameworks

| # | Source | Link |
|---|--------|------|
| 5 | Diátaxis | [diataxis.fr](https://diataxis.fr/) |
| 6 | GitHub Docs Frontmatter | [GitHub Docs](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) |
| 7 | Astro Starlight | [Starlight Docs](https://starlight.astro.build/reference/frontmatter/) |

### Internal Research

| # | Document | Key Content |
|---|----------|-------------|
| 8 | [synthesized-results/01-gpt.md](./research/synthesized-results/01-gpt.md) | Hybrid approach, llms.txt standard |
| 9 | [synthesized-results/02-gemini.md](./research/synthesized-results/02-gemini.md) | GraphRAG, gradual adoption strategy |
| 10 | [synthesized-results/03-claude.md](./research/synthesized-results/03-claude.md) | 3 required fields, maintainability |
