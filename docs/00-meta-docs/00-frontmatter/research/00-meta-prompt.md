---
title: "Docs Architecture Design Meta-Prompt"
description: "DeepSearch meta-prompt for deriving optimal docs folder structure that enables AI coding agents to effectively navigate and utilize documentation"
type: reference
tags: [Documentation, AI, Frontmatter]
order: 0
depends_on: [./README.md]
used_by: [./raw-results/01-gpt.md, ./raw-results/02-gemini.md, ./raw-results/03-claude.md]
---

# Docs Architecture Design Meta-Prompt for AI Development Environment Optimization

[한국어](./00-meta-prompt.ko.md)

> This meta-prompt is designed to derive optimal `docs/` folder structure and management system that enables AI coding agents (Cursor, Claude Code, Copilot, etc.) to effectively navigate and utilize documentation.

---

## 🎯 Goals

Redesign the frontend monorepo technical documentation system from these perspectives:

1. **AI Navigation Optimization**: Structure that allows AI agents to search and reference documents quickly and accurately
2. **Maintainability**: Metadata level that teams can realistically sustain
3. **Gradual Adoption**: Strategy to improve incrementally while maintaining existing documents
4. **Standard Compatibility**: Compatibility with emerging AI documentation standards like AGENTS.md, llms.txt

---

## 📊 Current Situation (Context)

### Documentation Scale and Structure

| Item | Status |
|------|--------|
| Number of docs files | ~75 |
| Files with Frontmatter | Partial (AI documentation section only) |
| Folder structure | Number prefix-based (00-06) |
| AGENTS.md | ✅ Exists (navigation guide within docs) |
| .ai-agents/commands | ✅ 10 command files |
| .cursor/rules | ✅ Cursor rule files |

### Current Folder Structure

```
docs/
├── 00-meta/                # Documentation system meta info (Frontmatter schema, AI documentation methodology)
├── 01-foundation/          # Foundation (requirements, setup, asset system)
├── 02-how-we-work/         # How we work (development process, PR, deployment)
├── 03-architecture/        # Architecture & conventions
├── 04-best-practice/       # Coding pattern guides (API, error handling, testing, TS, styling, AI)
├── 05-infrastructure/      # Infrastructure (Nx, CI/CD, Kubernetes)
├── 06-migration/           # Migration
├── 07-app-lifecycle/       # App lifecycle
├── README.md               # Full document index
└── AGENTS.md               # Navigation guide for AI agents
```

### Key Findings Verified from Previous Research

#### Metadata (Frontmatter)

| Finding | Evidence |
|---------|----------|
| **3 required fields** are sufficient | title, description, type - Verified in large projects like GitHub Docs, Astro Starlight |
| **5+ fields = maintenance abandonment** | Compliance drops below 50% within 6 months |
| **description is key for AI search** | Primary source for llms.txt generation, embedding vectors |
| **Diátaxis 4-classification effective** | tutorial, guide, reference, explanation |

#### Document Relationships

| Finding | Evidence |
|---------|----------|
| **Hybrid approach optimal** | In-text links + manifest (llms.txt) + minimal relationship fields |
| **Only 4 relationships meaningful** | prerequisites, related, supersedes, see_also |
| **Backlinks are low priority** | Vector search covers most cases, low ROI for manual management |
| **GraphRAG is overkill for 75 documents** | Simple frontmatter + llms.txt achieves 80% effectiveness |

#### AI Standards

| Standard | Role |
|----------|------|
| **AGENTS.md** | Project rules, build commands, coding conventions (20,000+ OSS projects adopted) |
| **llms.txt** | Document index, AI navigation summary (784+ implementations, contributed 10% to Vercel signups) |
| **.cursor/rules/** | Cursor-specific directives (conditional loading by file patterns) |

---

## 🔍 Design Questions (DeepSearch Request)

### Part A: Folder Structure Optimization

1. **Number prefix retention vs semantic folders**
   - Currently using numbering system like `00-meta`, `01-foundation`, `02-how-we-work`
   - Does number prefix help or hinder AI navigation?
   - What are the tradeoffs of switching to semantic (`guides/`, `reference/`, `architecture/`)?

2. **Hierarchy depth optimization**
   - Currently up to 4 levels deep (`docs/04-best-practice/00-api/patterns/xxx.md`)
   - What's the optimal folder depth for AI agents?
   - Pros and cons of flattening to 2 levels or less?

3. **Index file strategy**
   - README.md in each folder vs root llms.txt
   - Hierarchical index (llms.txt per folder) vs single central index
   - What index structure do AI agents prefer?

4. **File naming conventions**
   - Current: mixed `00-overview.md`, `suspense-query-cohesion-pattern.md`
   - What filename pattern is optimal for AI navigation?
   - Balance between consistency vs descriptive names?

### Part B: Frontmatter Schema Decision

1. **Finalize required fields**
   - Current candidates: `title`, `description`, `type`
   - Is `ai_summary` field needed separately from `description`?
   - Are 3 fields really sufficient at 75 document scale?

2. **Type classification system**
   - Diátaxis 4-classification: `tutorial`, `guide`, `reference`, `explanation`
   - Currently used types: `guide`, `reference`, `adr`, `troubleshooting`, `pattern`, `index`
   - How to integrate or choose between these two systems?

3. **Relationship field introduction criteria**
   - `prerequisites`: Which documents should this apply to?
   - `supersedes`: Only needed for migration documents?
   - `related`: What's the utility vs cost of bidirectional management?

4. **Tags vs folder structure**
   - Cross-classify with tags, or single-classify with folder structure?
   - What's the appropriate size for controlled vocabulary?

### Part C: AI Agent Integration Architecture

1. **llms.txt design**
   - docs/llms.txt vs root llms.txt location
   - Whether to generate llms-full.txt (including full content)
   - Auto-generation vs manual curation

2. **AGENTS.md role separation**
   - Current docs/AGENTS.md: document structure guide
   - Whether root AGENTS.md is needed: project-wide rules
   - Relationship with .ai-agents/commands/

3. **Cursor/Claude integration**
   - Connection method between .cursor/rules/ and docs
   - Whether to introduce CLAUDE.md
   - Document reference patterns (@docs/path vs absolute path)

4. **Search pipeline**
   - Vector search vs graph traversal vs keyword filtering
   - Optimal combination at 75 document scale?
   - Design considering future expansion (200+ documents)?

### Part D: Migration Strategy

1. **Phase priorities**
   - Phase 1 (foundation): Which documents to add frontmatter first?
   - Phase 2 (expansion): When to introduce automation tools?
   - Phase 3 (optimization): When to review GraphRAG?

2. **Existing structure compatibility**
   - Can semantic classification coexist while maintaining number prefixes?
   - Strategy to prevent link breakage?
   - Gradual migration vs batch conversion?

3. **Automation tools**
   - Frontmatter auto-generation tool (LLM-based)
   - Link validation CI (Lychee, etc.)
   - llms.txt build-time generation

---

## 📐 Expected Outputs

### 1. Optimized Folder Structure Proposal

```
docs/
├── llms.txt                    # AI index
├── AGENTS.md                   # AI agent navigation guide
├── README.md                   # Human-readable full index
├── [optimized substructure...]
```

### 2. Frontmatter Schema Standard

```yaml
---
# Required fields
title: "..."
description: "..."
type: guide | reference | tutorial | explanation | adr | troubleshooting

# Recommended fields
tags: [...]
sidebar_position: N

# Optional fields (when applicable)
prerequisites: [...]
supersedes: "..."
last_updated: YYYY-MM-DD
---
```

### 3. llms.txt Template

```markdown
# Enterprise Web Documentation
> Frontend monorepo technical documentation

## Getting Started
- [...]

## Architecture
- [...]
```

### 4. Migration Roadmap

| Phase | Duration | Goal | Outputs |
|-------|----------|------|---------|
| 0 | 1 week | Pilot | Frontmatter for core 10 documents |
| 1 | 2-4 weeks | Foundation | Full frontmatter, llms.txt |
| 2 | 4-8 weeks | Relationships | prerequisites, CI link checking |
| 3 | 3+ months | Optimization | Auto-generation, search pipeline |

### 5. Validation Metrics

| Metric | Measurement Method | Target |
|--------|-------------------|--------|
| Frontmatter coverage | file count / total | 100% |
| AI search accuracy | ask command success rate | >90% |
| Maintenance compliance | field freshness after 3 months | >80% |

---

## 🔗 References (Research Results)

### Internal Documents
- `01-raw-results/00-meta-prompt.md` - Original DeepSearch request
- `01-raw-results/01-gpt.md` - GPT GraphRAG architecture proposal
- `01-raw-results/02-gemini.md` - Gemini extended meta-prompt
- `01-raw-results/03-claude.md` - Claude practical schema
- `02-synthesized-results/01-gpt.md` - GPT synthesized results
- `02-synthesized-results/02-gemini.md` - Gemini synthesized results
- `02-synthesized-results/03-claude.md` - Claude synthesized results

### External Standards
- [llmstxt.org](https://llmstxt.org/) - llms.txt standard
- [agents.md](https://agents.md/) - AGENTS.md standard
- [Diátaxis](https://diataxis.fr/) - Documentation classification framework
- [GitHub Docs Frontmatter](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter)
- [MADR 4.0](https://adr.github.io/madr/) - ADR template

---

## ✅ Success Criteria

| Criterion | Description |
|-----------|-------------|
| **Practicality** | Actually applicable at 75 document scale |
| **Maintainability** | Level that teams can sustain for 6+ months |
| **AI Effectiveness** | Measurable navigation improvement in Cursor, Claude Code |
| **Gradual Adoption** | Phase-by-phase application without disrupting existing workflows |
| **Standard Compatibility** | Alignment with llms.txt, AGENTS.md standards |

---

## ❓ Open Questions (Unknown Answers)

1. Does number prefix help or add noise to AI navigation?
2. Does limiting folder depth to 2 levels actually improve AI performance?
3. Which produces higher quality: manual curation vs auto-generation for llms.txt?
4. Is tags field more effective for AI search than folder structure?
5. Does current design scale when expanding to 200+ documents?

---

## 🚀 Usage

Use this meta-prompt in these situations:

1. **DeepSearch Request**: Pose the above questions to AI models to collect diverse perspectives
2. **Team Discussion Basis**: Use design questions as agenda items for team meetings
3. **Gradual Improvement**: Validate outputs phase by phase while evolving the schema
4. **Benchmarking**: Compare against docs structures of other OSS projects

---

*Generated: 2025-01-20*
*Based on: 3-model DeepSearch analysis (GPT, Gemini, Claude) + librarian research*
