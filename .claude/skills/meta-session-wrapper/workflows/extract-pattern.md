# Workflow: Extract Pattern from Session

Step-by-step guide to extract a reusable pattern from completed session work.

## Prerequisites

- Session work is complete (not in progress)
- Work involved multiple steps that could be repeated
- You want to make this reusable

## Step 1: Document What Was Done

### 1.1 List Actions

Create a chronological list of significant actions:

```markdown
## Actions Log

| # | Action | Type | Files Affected |
|---|--------|------|----------------|
| 1 | Read research files | Input | 3 files |
| 2 | Created content outline | Planning | - |
| 3 | Wrote English modules | Create | 7 files |
| 4 | Translated to Korean | Transform | 7 files |
| 5 | Added frontmatter | Update | 14 files |
```

### 1.2 Identify Categories

Categorize each action:

| Category | Actions |
|----------|---------|
| **Input** | Read, load, fetch |
| **Analysis** | Parse, extract, identify |
| **Transform** | Convert, translate, format |
| **Create** | Write, generate, scaffold |
| **Update** | Modify, add, append |
| **Validate** | Check, verify, test |

### 1.3 Note Decisions

Document choices made during the work:

```markdown
## Decisions

| Decision | Options Considered | Chosen | Reasoning |
|----------|-------------------|--------|-----------|
| Module count | 4, 6, 8 | 6 | Matches content depth |
| Translation approach | Machine + review, Manual | Manual | Quality priority |
| Frontmatter type | guide, tutorial | tutorial | Step-by-step nature |
```

## Step 2: Identify the Pattern

### 2.1 Find the Core Transformation

What went in? → What came out?

```markdown
## Core Transformation

INPUT:
- Research documents (Claude, GPT, Gemini responses)
- Unstructured, model-specific format

OUTPUT:
- Structured learning modules
- Consistent format across modules
- Bilingual (EN + KO)
- Metadata-enriched (frontmatter)
```

### 2.2 Map to Pattern Template

Use [pattern-templates.md](../references/pattern-templates.md) to identify the closest match:

| Pattern | Match? | Reason |
|---------|--------|--------|
| Transform | ✅ Yes | Research → Learning |
| Localization | ✅ Yes | EN → KO |
| Validation | Partial | Frontmatter check |
| Scaffold | No | Not creating new project |

**Primary Pattern**: Transform
**Secondary Pattern**: Localization

### 2.3 Extract Abstract Steps

Generalize the concrete steps:

| Concrete Step | Abstract Step |
|---------------|---------------|
| Read 01-claude.en.md | Read source documents |
| Synthesize insights | Analyze and synthesize |
| Write 01-fundamentals.en.md | Generate primary content |
| Translate to Korean | Create language variants |
| Add frontmatter | Apply metadata standard |

## Step 3: Define Variables

### 3.1 Identify What Changes

| Aspect | This Session | Next Time |
|--------|--------------|-----------|
| Source path | `docs/01-structure-organizer/research/` | Different topic |
| Output path | `docs/01-structure-organizer/learning/` | Different topic |
| Module count | 6 | Depends on content |
| Languages | EN, KO | Could be EN only |

### 3.2 Create Variable List

```markdown
## Variables

| Variable | Type | Required | Default |
|----------|------|----------|---------|
| source_dir | path | Yes | - |
| output_dir | path | No | `{source_dir}/../learning/` |
| primary_lang | string | No | "en" |
| secondary_langs | string[] | No | ["ko"] |
| frontmatter_skill | string | No | "doc-frontmatter" |
```

### 3.3 Determine Constants

What stays the same regardless of use?

```markdown
## Constants

- Output file naming: `{NN}-{name}.{lang}.md`
- Module structure: Learning objectives → Content → Takeaways → Exercises
- Frontmatter fields: title, description, type, tags, order
- Translation rules: Keep technical terms, translate headers
```

## Step 4: Define Trigger Conditions

### 4.1 Keywords

What phrases should trigger this pattern?

```markdown
## Trigger Keywords

- "create learning content"
- "research to learning"
- "make learning path"
- "transform research"
```

### 4.2 Context

What conditions should be true?

```markdown
## Context Conditions

- Research directory exists with model response files
- At least one model response present
- Topic has enough content for multiple modules
```

### 4.3 User Intent

What is the user trying to achieve?

```markdown
## User Intent

- Turn research into educational content
- Create structured learning progression
- Support multiple languages
- Maintain quality and consistency
```

## Step 5: Write Feature Request

Combine all elements into a formal feature request:

```markdown
## Feature Request

### Name
learning-content-creator

### Description
Transform multi-model research materials into structured, bilingual
learning content with proper metadata.

### Trigger
Keywords: "create learning content", "research to learning"
Context: Research files exist in source directory

### Inputs
- source_dir (required): Path to research documents
- output_dir (optional): Path for learning output
- primary_lang (optional): Primary language code
- secondary_langs (optional): Languages to translate to

### Outputs
- Structured learning modules in primary language
- Translations in secondary languages
- Frontmatter on all files
- Course index (README)

### Steps (High-Level)
1. Analyze research sources and identify topics
2. Create content outline with module structure
3. Write primary language modules
4. Translate to secondary languages
5. Apply frontmatter metadata

### Domain Knowledge Required
- Research synthesis techniques
- Learning content structure
- Translation guidelines
- Frontmatter schema

### Side Effects
- Creates multiple files
- No external APIs

### Reusability
Moderate - whenever new research topic is completed
```

## Step 6: Validate and Proceed

### 6.1 Validation Checklist

- [ ] Feature request is clear and complete
- [ ] Variables are identified with defaults
- [ ] Trigger conditions are specific
- [ ] Steps are at right abstraction level
- [ ] Could someone else implement this?

### 6.2 Next Step

Run the command:

```
/create-llm-structure <paste feature request>
```

This will diagnose whether it should be:
- ⚡ **COMMAND**: Human-triggered workflow
- 📚 **SKILL**: Domain knowledge module
- 🤖 **AGENT**: Autonomous reasoning needed
