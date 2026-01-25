---
title: "Frontmatter System Requirements"
description: "Requirements definition document for docs folder metadata system design, including problem definition, goals, functional requirements, and non-functional requirements."
type: reference
tags: [Documentation, Frontmatter, Architecture]
order: 0
related: [./01-adr.md]
---

# Frontmatter System Requirements

[한국어](./00-requirement.ko.md)

> This document is the **requirements definition** for the docs folder frontmatter system design.
> 
> - Related ADR: [01-adr.md](./01-adr.md)
> - Schema Definition (Source of Truth): [/.ai-agents/skills/docs-update-frontmatter/references/schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)

---

## Background and Problem Definition

### Current Situation

| Item | Status |
|------|--------|
| Number of docs files | ~75+ |
| Files with Frontmatter | Only partial |
| Document relationship definitions | Only in-text links |
| AI agent document references | Hardcoded paths |

### Problems to Solve

1. **Inefficient AI Discovery**: AI agents struggle to find accurate documents due to lack of semantic information
2. **Metadata Inconsistency**: Different metadata formats across documents prevent automation
3. **Missing Relationship Information**: Dependencies and sequences between documents are not explicit, making learning paths difficult to identify
4. **Unable to Track Dependencies**: Cannot identify affected AI agent files when modifying documents

---

## Requirements Definition

### Functional Requirements

| # | Requirement | Description | Priority |
|---|-------------|-------------|:--------:|
| FR1 | **AI Search Optimization** | AI agents must be able to find accurate documents when searching | P0 |
| FR2 | **Document Classification** | Document types (guide, reference, pattern, etc.) must be clearly distinguished | P0 |
| FR3 | **Relationship Definition** | Must be able to express dependencies, associations, and replacement relationships between documents | P1 |
| FR4 | **Reverse Tracking** | Must be able to track AI agents that reference a document | P1 |
| FR5 | **llms.txt Generation** | Must be able to auto-generate llms.txt based on frontmatter | P2 |

### Non-Functional Requirements

| # | Requirement | Description | Measurement Criteria |
|---|-------------|-------------|---------------------|
| NFR1 | **Maintainability** | Developers must be able to easily write and maintain | 3 or fewer required fields |
| NFR2 | **Consistency** | All documents must follow the same schema | 100% schema validation pass rate |
| NFR3 | **Gradual Adoption** | Must be able to migrate existing documents in stages | No document disruption |
| NFR4 | **Standard Compatibility** | Must be compatible with emerging AI standards like llms.txt, AGENTS.md | Compliance with standard specs |

---

## Requirements Rationale

### FR1: AI Search Optimization

**Problem**: Vector search alone has limitations in distinguishing homonyms and understanding context

**Rationale**:
- Microsoft GraphRAG research: Explicit relationship graphs are 3.4x superior to vector-only RAG for complex queries
- The description field is the key source for generating embedding vectors

**Solution**: Improve search precision with `title`, `description`, `type`, `tags` metadata

### FR2: Document Classification

**Problem**: Unclear document types make it difficult for AI to select documents matching user intent

**Rationale**:
- Diátaxis framework: Classifies documents into 4 types (tutorial, guide, reference, explanation)
- Proven pattern in large-scale projects like GitHub Docs, Astro Starlight

**Solution**: Explicitly specify document type with `type` field, apply weights during search

### FR3: Relationship Definition

**Problem**: Dependencies between documents exist only implicitly, making learning order and impact scope difficult to identify

**Rationale**:
- Reading complex documents without prerequisites reduces comprehension
- Need to specify superseded documents during version upgrades

**Solution**: Introduce `depends_on`, `related`, `supersedes` relationship fields

### FR4: Reverse Tracking

**Problem**: Cannot identify AI agent files that reference a document when modifying it

**Rationale**:
- `.ai-agents/commands/`, `.cursor/rules/` files reference docs with hardcoded paths
- Broken references occur when documents are moved/deleted

**Solution**: Specify reverse dependencies with `ai_agents` field

### NFR1: Maintainability

**Problem**: Authors abandon maintenance when there are too many metadata fields

**Rationale**:
- Wikipedia research: "Higher granularity metadata exponentially increases maintenance burden"
- 10+ fields → compliance rate drops below 50% within 6 months

**Solution**: 3 required fields (title, description, type), rest are optional

---

## Constraints

| # | Constraint | Reason |
|---|------------|--------|
| C1 | Use YAML frontmatter format | Markdown standard, supported by most tools |
| C2 | 3 or fewer required fields | Ensure maintainability |
| C3 | Maximum 5 tags | Prevent noise, maintain consistency |
| C4 | Use relative paths | Minimize modification scope when moving documents |

---

## Success Metrics

| Metric | Measurement Method | Target |
|--------|-------------------|--------|
| Frontmatter Coverage | (files with frontmatter / total files) × 100 | 100% |
| Schema Compliance Rate | CI validation pass rate | 100% |
| AI Search Accuracy | ask command accurate response rate | >90% |
| Maintenance Compliance Rate | Field freshness after 3 months | >80% |

---

## References

### Internal Documents

- [research/](./research/) - DeepSearch research materials
- [synthesized-results/03-claude.md](./research/synthesized-results/03-claude.md) - Key rationale synthesis

### External References

| Topic | Link |
|-------|------|
| llms.txt Standard | [llmstxt.org](https://llmstxt.org/) |
| Diátaxis Framework | [diataxis.fr](https://diataxis.fr/) |
| AGENTS.md Standard | [agents.md](https://agents.md/) |
| GitHub Docs Frontmatter | [GitHub Docs](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) |
| Microsoft GraphRAG | [GitHub](https://microsoft.github.io/graphrag/) |
