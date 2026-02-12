---
name: meta-session-wrapper
description: Extract reusable patterns from completed session work. Use when
  users want to wrap a session into a reusable component, extract workflows,
  make completed work reusable, abstract session work into patterns, or create
  a skill from session history.
---

# Meta Session Wrapper

Knowledge for extracting and abstracting completed work from a session into a reusable pattern.

## Quick Reference

| Phase | Input | Output |
|-------|-------|--------|
| 1. IDENTIFY | Session history / completed work | Work summary |
| 2. ABSTRACT | Concrete actions | Generic pattern |
| 3. FORMALIZE | Pattern description | Feature Request |

## When to Use

✅ **USE WHEN**:
- You completed a multi-step workflow that might be repeated
- You want to turn ad-hoc work into a reusable component
- You see patterns emerging across sessions

❌ **DON'T USE WHEN**:
- Work was one-time only, won't be repeated
- Already have a clear feature request (use `/create-llm-structure` directly)

## Workflow

### Phase 1: IDENTIFY Work Done

**Goal**: Catalog what was accomplished in the session.

#### 1.1 Review Session Actions

List all significant actions:

```markdown
## Session Work Summary

### Actions Performed
1. [Action 1]: [What was done]
2. [Action 2]: [What was done]
3. [Action 3]: [What was done]
...

### Artifacts Created
- [File/artifact 1]: [Purpose]
- [File/artifact 2]: [Purpose]
...

### Decisions Made
- [Decision 1]: [Reasoning]
- [Decision 2]: [Reasoning]
...
```

#### 1.2 Identify Patterns

Ask these questions:

| Question | Answer |
|----------|--------|
| What triggered this work? | [User request / problem identified] |
| What was the end goal? | [Desired outcome] |
| Were there repeatable steps? | [Yes/No - list if yes] |
| Could this be automated? | [Fully / Partially / Manual only] |
| What domain knowledge was used? | [Expertise applied] |

### Phase 2: ABSTRACT to Generic Pattern

**Goal**: Convert concrete work into a reusable pattern.

#### 2.1 Generalize Steps

| Concrete (This Session) | Abstract (Any Session) |
|-------------------------|------------------------|
| "Created learning-content-creator skill" | "Create domain skill from pattern" |
| "Added frontmatter to 14 files" | "Apply metadata standard to documents" |
| "Translated EN to KO" | "Create language variants" |

#### 2.2 Identify Variables

What parts change between uses?

```markdown
## Pattern Variables

| Variable | This Session | Generic |
|----------|--------------|---------|
| Source | `research/*.md` | `{source_directory}` |
| Output | `learning/*.md` | `{output_directory}` |
| Languages | EN, KO | `{language_list}` |
```

#### 2.3 Define Trigger Conditions

When should this pattern be invoked?

```markdown
## Trigger Conditions

### Keywords
- "create learning content"
- "research to learning"

### Context
- Research files exist in source directory
- Multi-model analysis completed

### User Intent
- Transform research into structured educational content
```

### Phase 3: FORMALIZE as Feature Request

**Goal**: Output a structured description for `/create-llm-structure`.

#### 3.1 Write Feature Request

Use this template:

```markdown
## Feature Request

### Name
[pattern-name] (kebab-case)

### Description
[1-2 sentence description of what this does]

### Trigger
[How is it activated - user command, auto-detect, goal assignment]

### Inputs
- [Input 1]: [Description]
- [Input 2]: [Description]

### Outputs
- [Output 1]: [Description]
- [Output 2]: [Description]

### Steps (High-Level)
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Domain Knowledge Required
[What expertise is needed - coding patterns, frameworks, etc.]

### Side Effects
[File creation, external API calls, deployments, etc.]

### Reusability
[How often might this be used - once, occasionally, frequently]
```

#### 3.2 Validate Feature Request

Before proceeding, verify:

- [ ] Description is clear and complete
- [ ] Trigger is well-defined
- [ ] Steps are at the right abstraction level (not too detailed, not too vague)
- [ ] Domain knowledge is identified
- [ ] Side effects are documented

## Output

The final output is a **Feature Request** document containing:
- Name (kebab-case)
- Description
- Trigger conditions
- Inputs/Outputs
- High-level steps
- Domain knowledge required
- Side effects
- Reusability assessment

## Example: Learning Content Creator

### Phase 1: Identify

```markdown
## Session Work Summary

### Actions Performed
1. Read research documents (Claude, GPT, Gemini responses)
2. Created content outline synthesizing insights
3. Wrote 7 English learning modules
4. Translated to 7 Korean modules
5. Added YAML frontmatter to all 14 files

### Artifacts Created
- learning/README.en.md - Course index
- learning/01-06-*.en.md - 6 learning modules
- learning/*.ko.md - Korean translations

### Decisions Made
- 6 modules (fundamentals → anti-patterns progression)
- Keep technical terms in English for KO version
- Use tutorial type for frontmatter
```

### Phase 2: Abstract

```markdown
## Generic Pattern

| Concrete | Abstract |
|----------|----------|
| research/01-claude.en.md | {research_sources} |
| learning/*.en.md | {output_dir}/*.{primary_lang}.md |
| EN → KO translation | Primary → Secondary language |

## Variables
- source_directory
- output_directory
- primary_language (default: en)
- secondary_languages (optional)
- frontmatter_skill (optional)
```

### Phase 3: Formalize

```markdown
## Feature Request

### Name
learning-content-creator

### Description
Transform multi-model research materials into structured learning content with bilingual support and proper metadata.

### Trigger
User says "create learning content" or "research to learning" when research files exist.

### Inputs
- Research directory with model responses
- Target output directory
- Language configuration

### Outputs
- Structured learning modules (EN)
- Translations (KO)
- Frontmatter metadata on all files

### Steps
1. Analyze research sources
2. Create content outline
3. Write English modules
4. Translate to Korean
5. Add frontmatter

### Domain Knowledge
- Multi-model research synthesis
- Learning content structure
- Translation guidelines
- Frontmatter schema

### Side Effects
- Creates multiple files
- No external APIs
- No deployments

### Reusability
Moderate - whenever new research topic completed
```

## Output

After completing this workflow, return the **Feature Request** to the calling command.

The command will handle the next steps (diagnosis, spec generation, implementation).

## References

| Resource | Purpose |
|----------|---------|
| [Pattern Templates](references/pattern-templates.md) | Common reusable pattern types |
| [Abstraction Guide](references/abstraction-guide.md) | Tips for effective abstraction |
