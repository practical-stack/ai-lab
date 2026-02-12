---
name: learning-content-creator
description: Transform research materials into structured learning content with
  bilingual support. Use when users want to create learning content from research,
  convert research to learning paths, make learning materials, or translate
  learning content between languages.
---

# Learning Content Creator

Transform multi-model research materials into structured learning content, with bilingual support (English + Korean).

## Quick Start

### Workflow Overview

```
Research Materials → Learning Path (EN) → Translation (KO) → Frontmatter
```

| Phase | Input | Output |
|-------|-------|--------|
| 1. Analyze | `research/*.md` files | Content outline |
| 2. Create EN | Synthesized insights | `learning/*.en.md` |
| 3. Translate KO | English content | `learning/*.ko.md` |
| 4. Frontmatter | All files | YAML metadata added |

## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Create learning content from research | [workflows/create-learning.md](workflows/create-learning.md) |
| Translate EN to KO | [workflows/translate.md](workflows/translate.md) |

> **Note**: Phase 4 (Frontmatter) uses the `doc-frontmatter` schema. The calling command coordinates the multi-skill pipeline.

## Phase 1: ANALYZE Research

**Goal**: Understand and synthesize multi-model research.

### Input Structure

```
docs/NN-topic/
├── research/
│   ├── 00-research-prompt.en.md   # Original prompt
│   ├── 01-claude.en.md            # Claude's response
│   ├── 02-gpt/                    # GPT's response (may be multi-file)
│   │   ├── 01-concepts.en.md
│   │   ├── 02-relationships.en.md
│   │   └── ...
│   └── 03-gemini.en.md            # Gemini's response
```

### Analysis Checklist

| Check | Question |
|-------|----------|
| Coverage | What topics do all models agree on? |
| Unique | What unique insights does each model provide? |
| Conflicts | Where do models disagree? How to resolve? |
| Gaps | What's missing? What questions remain? |

### Output: Content Outline

```markdown
# Learning Content Outline

## Modules (6-8 recommended)

| # | Module | Topics | Sources |
|---|--------|--------|---------|
| 1 | Fundamentals | Definitions, core concepts | All models |
| 2 | Relationships | How parts connect | GPT, Claude |
| ... | ... | ... | ... |

## Key Insights by Source

- **Claude**: [unique insights]
- **GPT**: [unique insights]
- **Gemini**: [unique insights]

## Synthesis Strategy

[How to combine insights without redundancy]
```

## Phase 2: CREATE English Content

**Goal**: Create structured learning modules in English.

### Directory Structure

```
docs/NN-topic/
└── learning/
    ├── README.en.md           # Course overview, learning path
    ├── 01-module-name.en.md   # Module 1
    ├── 02-module-name.en.md   # Module 2
    └── ...
```

### Module Template

```markdown
# Module N: Title

> One-sentence module summary

## Learning Objectives

After completing this module, you will:
- [Objective 1]
- [Objective 2]
- [Objective 3]

---

## N.1 First Section

[Content]

## N.2 Second Section

[Content]

---

## Key Takeaways

- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## Exercises

### Exercise N.1: [Name]

[Exercise description]

---

## Next Steps

Continue to [Module N+1: Title](./0N+1-title.en.md)
```

### README Template

```markdown
# Course Title

> Course tagline (one sentence)

## Course Overview

[2-3 paragraph description]

## Who This Is For

- [Audience 1]
- [Audience 2]

## Prerequisites

- [Prerequisite 1]
- [Prerequisite 2]

---

## Course Modules

| # | Module | Duration | Description |
|---|--------|----------|-------------|
| 1 | [Title](./01-name.en.md) | NN min | Description |
| 2 | [Title](./02-name.en.md) | NN min | Description |

**Total Time:** ~N hours

---

## Learning Path

### Beginner Track
[Visual flow diagram]

### Advanced Track
[Visual flow diagram]

---

## Source Materials

| Source | Description |
|--------|-------------|
| [Research Prompt](../research/00-research-prompt.en.md) | Original prompt |
| [Claude](../research/01-claude.en.md) | Claude's response |
| [GPT](../research/02-gpt/) | GPT's response |
| [Gemini](../research/03-gemini.en.md) | Gemini's response |
```

### Writing Guidelines

| Guideline | Description |
|-----------|-------------|
| **Synthesize** | Don't copy verbatim; synthesize insights |
| **Attribute** | Note which model contributed which insight |
| **Practical** | Focus on actionable knowledge |
| **Consistent** | Use same terminology throughout |
| **Progressive** | Build complexity gradually |

## Phase 3: TRANSLATE to Korean

**Goal**: Create high-quality Korean translations.

### Naming Convention

| English | Korean |
|---------|--------|
| `*.en.md` | `*.ko.md` |
| `README.en.md` | `README.ko.md` |
| `01-fundamentals.en.md` | `01-fundamentals.ko.md` |

### Translation Guidelines

| Aspect | Guideline |
|--------|-----------|
| **Technical terms** | Keep English for universally used terms (e.g., Command, Skill, Agent) |
| **Headers** | Translate headers |
| **Code blocks** | Keep code in English, translate comments |
| **Tables** | Translate content, keep structure |
| **Links** | Update to point to `.ko.md` counterparts |

### Do NOT Translate

- Code snippets
- File paths
- Command examples
- Technical identifiers (kebab-case names, etc.)

### Translation Checklist

- [ ] All `.en.md` files have `.ko.md` counterparts
- [ ] Internal links updated to `.ko.md` versions
- [ ] Technical terms consistently handled
- [ ] Tables and diagrams preserved
- [ ] Exercises and examples localized where appropriate

## Phase 4: ADD Frontmatter

**Goal**: Add YAML frontmatter to all learning documents.

### Frontmatter Schema

Use the frontmatter schema from `doc-frontmatter` skill (see `.claude/skills/doc-frontmatter/references/schema.md`).

### Frontmatter Template for Learning Content

```yaml
---
title: "Module Title"
description: "50-160 char summary of what this module teaches"
type: tutorial
tags: [AI, Architecture, BestPractice]
order: 1
depends_on: [./prerequisite-module.en.md]
related: [./related-module.en.md]
---
```

### Type Selection for Learning

| Content Type | `type` Value |
|--------------|--------------|
| Course overview (README) | `index` |
| Step-by-step module | `tutorial` |
| Reference/spec | `reference` |
| Concept explanation | `explanation` |

### Execution

For each file:
1. Extract title from H1
2. Generate description from first paragraph
3. Determine type based on content
4. Select relevant tags (max 5)
5. Set order from filename prefix
6. Add depends_on/related if applicable

## Quality Checklist

### Phase 1: Analyze
- [ ] All research files read
- [ ] Key insights extracted from each model
- [ ] Conflicts identified and resolved
- [ ] Content outline created

### Phase 2: Create EN
- [ ] All modules follow template
- [ ] Learning objectives are measurable
- [ ] Content synthesizes (not copies) sources
- [ ] Exercises included in each module
- [ ] Links work correctly

### Phase 3: Translate KO
- [ ] All files translated
- [ ] Technical terms consistent
- [ ] Links updated to .ko.md
- [ ] Natural Korean (not machine-translation quality)

### Phase 4: Frontmatter
- [ ] All files have frontmatter
- [ ] Required fields present (title, description, type)
- [ ] Tags from controlled vocabulary
- [ ] Dependencies correctly specified

## Example Output

See `docs/01-structure-organizer/learning/` for a complete example:

```
docs/01-structure-organizer/learning/
├── README.en.md              # Course index (EN)
├── README.ko.md              # Course index (KO)
├── 01-fundamentals.en.md     # Module 1 (EN)
├── 01-fundamentals.ko.md     # Module 1 (KO)
├── 02-relationships.en.md    # Module 2 (EN)
├── 02-relationships.ko.md    # Module 2 (KO)
├── 03-decision-framework.en.md
├── 03-decision-framework.ko.md
├── 04-templates.en.md
├── 04-templates.ko.md
├── 05-examples.en.md
├── 05-examples.ko.md
├── 06-anti-patterns.en.md
└── 06-anti-patterns.ko.md
```
