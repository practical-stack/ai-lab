---
description: Create structured learning content from research materials
allowed-tools: Read, Write, Glob
argument-hint: <topic-directory>
---

# Learning Content Creator

Transform multi-model research materials into structured learning content with bilingual support.

## Arguments

$ARGUMENTS

- **topic-directory**: Path to topic folder (e.g., `docs/01-structure-organizer`)

## Pipeline Overview

This command orchestrates the learning content creation pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│  /learning-content (COMMAND - Orchestrator)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: ANALYZE                                           │
│  📚 learning-content-creator skill (Phase 1)                │
│  Input: research/*.md → Output: Content Outline             │
│                                                             │
│  Phase 2: CREATE (English)                                  │
│  📚 learning-content-creator skill (Phase 2)                │
│  Input: Outline → Output: learning/*.en.md                  │
│                                                             │
│  Phase 3: TRANSLATE (Korean)                                │
│  📚 learning-content-creator skill (Phase 3)                │
│  Input: *.en.md → Output: *.ko.md                           │
│                                                             │
│  Phase 4: FRONTMATTER                                       │
│  📚 doc-frontmatter skill                                   │
│  Input: All files → Output: YAML metadata added             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Instructions

### Phase 1: ANALYZE Research

1. Read @.claude/skills/learning-content-creator/SKILL.md (Phase 1 section)
2. Read all files in `{topic-directory}/research/`
3. Create content outline synthesizing insights from all models

### Phase 2: CREATE English Content

1. Read @.claude/skills/learning-content-creator/SKILL.md (Phase 2 section)
2. Create `{topic-directory}/learning/` directory
3. Write modules following the template structure

### Phase 3: TRANSLATE to Korean

1. Read @.claude/skills/learning-content-creator/workflows/translate.md
2. Translate all `.en.md` files to `.ko.md`
3. Follow translation guidelines (keep technical terms in English)

### Phase 4: ADD Frontmatter

1. Read @.claude/skills/doc-frontmatter/SKILL.md
2. Read @.claude/skills/doc-frontmatter/references/schema.md for schema details
3. Add YAML frontmatter to all learning documents

## Output Structure

```
{topic-directory}/
└── learning/
    ├── README.en.md           # Course overview (EN)
    ├── README.ko.md           # Course overview (KO)
    ├── 01-module-name.en.md   # Module 1 (EN)
    ├── 01-module-name.ko.md   # Module 1 (KO)
    ├── 02-module-name.en.md   # Module 2 (EN)
    ├── 02-module-name.ko.md   # Module 2 (KO)
    └── ...
```

## Quality Checklist

After completion, verify:

- [ ] All research sources synthesized (not copied)
- [ ] 6-8 modules with progressive complexity
- [ ] All EN files have KO counterparts
- [ ] All files have valid frontmatter
- [ ] Internal links use correct language suffix

## Key Principle

**This command owns the pipeline.** Skills provide knowledge only.

```
⚡ COMMAND: Orchestrates phases, decides progression
    ↓
📚 SKILL: Provides domain knowledge (templates, guidelines)
    ↓
🔧 TOOL: Executes file operations
```
