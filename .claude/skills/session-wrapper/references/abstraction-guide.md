# Abstraction Guide

Tips for effectively abstracting session work into reusable patterns.

## Core Principle

> **Good abstraction captures the essential pattern while hiding incidental details.**

## Abstraction Levels

### Level 1: Too Concrete (Bad)

```
"Take 01-claude.en.md, 02-gpt/*.en.md, and 03-gemini.en.md from 
docs/01-structure-organizer/research/ and create 6 modules in 
docs/01-structure-organizer/learning/ named 01-fundamentals.en.md..."
```

❌ Specific file names, paths, counts hardcoded

### Level 2: Too Abstract (Bad)

```
"Process input files and generate output files"
```

❌ No useful information about what or how

### Level 3: Right Level (Good)

```
"Transform research documents (multi-model responses) into structured
learning modules, with each module covering a specific topic. Support
primary language with optional translations."
```

✅ Captures what and how without over-specifying

## Abstraction Checklist

### Remove These (Incidental Details)

| Incidental | Why Remove |
|------------|------------|
| Specific file names | Will vary each time |
| Exact counts (6 modules) | Depends on content |
| Specific paths | Project-dependent |
| Timestamps | Session-specific |
| Error workarounds | One-time fixes |

### Keep These (Essential Pattern)

| Essential | Why Keep |
|-----------|----------|
| Input type (research docs) | Defines source |
| Output type (learning modules) | Defines goal |
| Processing steps | Core workflow |
| Quality criteria | Success definition |
| Trigger conditions | When to use |

## Variable Identification

### Step 1: Highlight Concrete Values

```markdown
Read files from [docs/01-structure-organizer/research/]
Create [6] modules in [docs/01-structure-organizer/learning/]
Translate to [Korean]
Add frontmatter with type [tutorial]
```

### Step 2: Name the Variables

| Concrete | Variable | Type |
|----------|----------|------|
| `docs/01-structure-organizer/research/` | `source_dir` | path |
| `docs/01-structure-organizer/learning/` | `output_dir` | path |
| 6 | `module_count` | number (or dynamic) |
| Korean | `target_languages` | string[] |
| tutorial | `frontmatter_type` | enum |

### Step 3: Determine Defaults

| Variable | Default | Required |
|----------|---------|----------|
| `source_dir` | - | Yes |
| `output_dir` | `{source_dir}/../learning/` | No |
| `module_count` | Dynamic based on content | No |
| `target_languages` | `["ko"]` | No |
| `frontmatter_type` | Auto-detect | No |

## Pattern Extraction Questions

Ask yourself:

### 1. What is the core transformation?

- Input state → Output state
- Before → After
- Problem → Solution

### 2. What makes this repeatable?

- Similar inputs will occur
- Same process applies
- Consistent output expected

### 3. What varies between uses?

- File paths
- Names/identifiers
- Configuration options
- Scope/depth

### 4. What stays the same?

- Processing logic
- Quality criteria
- Output structure
- Domain rules

## Red Flags in Abstraction

### 🚩 Over-engineering

If the pattern description is longer than the original work, you're over-abstracting.

**Fix**: Focus on the happy path, document edge cases separately.

### 🚩 Loss of Meaning

If someone reading the abstraction can't understand what it does, you're too abstract.

**Fix**: Add a concrete example to ground the abstraction.

### 🚩 Too Many Variables

If you have more than 5-7 configurable variables, consider splitting into sub-patterns.

**Fix**: Group related variables, use sensible defaults.

### 🚩 Unclear Trigger

If it's not obvious when to use this pattern, the abstraction is incomplete.

**Fix**: Define explicit trigger conditions (keywords, context, user intent).

## Testing Your Abstraction

### Litmus Test 1: Explain to a Colleague

> "When you have [trigger], use [pattern name] to [achieve goal] by [process]."

If this sentence is clear and accurate, your abstraction is good.

### Litmus Test 2: Apply to New Scenario

Try applying your pattern description to a similar but different case:
- Does it make sense?
- Would it produce the right result?
- Are the variables sufficient?

### Litmus Test 3: Implementation Gap

Can someone implement this pattern from the description alone?
- If too many questions arise → too abstract
- If no flexibility needed → too concrete

## Example: Good vs Bad Abstraction

### Original Work

Created 14 markdown files for learning content about AI agent architecture:
- 7 English modules (README + 6 learning modules)
- 7 Korean translations
- Each with frontmatter including title, description, type, tags

### Bad Abstraction (Too Concrete)

```
Create 14 markdown files in docs/01-structure-organizer/learning/:
README.en.md, README.ko.md, 01-fundamentals.en.md, 01-fundamentals.ko.md...
Each must have exactly 5 frontmatter fields: title, description, type, tags, order.
```

### Bad Abstraction (Too Abstract)

```
Generate documentation files with metadata.
```

### Good Abstraction

```
Transform research materials into structured learning modules:
- Analyze source documents to identify topics
- Create primary language modules with progressive structure
- Generate translations maintaining technical term consistency
- Apply metadata standard (frontmatter) to all outputs

Variables: source_dir, output_dir, languages, frontmatter_schema
Trigger: "create learning content", research documents exist
```

## Summary

1. **Identify** what's concrete (varies) vs essential (constant)
2. **Name** variables for varying parts
3. **Define** defaults for optional variables
4. **Test** with the three litmus tests
5. **Refine** based on clarity and usability
