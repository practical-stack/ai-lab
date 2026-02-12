# Output Patterns

Patterns for producing consistent, high-quality skill output. Choose based on how strict the output format needs to be.

## Pattern 1: Template Pattern

Provide templates when output structure matters.

### Strict Template (API responses, data formats, reports)

```markdown
## Report Structure

ALWAYS use this exact template:

# [Analysis Title]

## Executive Summary
[One-paragraph overview of key findings]

## Key Findings
- Finding 1 with supporting data
- Finding 2 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```

### Flexible Template (adaptation useful)

```markdown
## Report Structure

Sensible default format — adjust sections as needed:

# [Analysis Title]

## Executive Summary
[Overview]

## Key Findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to the specific context]
```

**When to use which**:

| Strictness | Use Case | Implementation |
|------------|----------|----------------|
| Strict | API contracts, compliance reports, data exports | Exact template with `ALWAYS` prefix |
| Flexible | Analysis, summaries, documentation | Template with "adjust as needed" note |
| None | Creative content, exploration | No template — describe intent only |

## Pattern 2: Examples Pattern

Provide input/output pairs when output quality depends on style and tone.

```markdown
## Commit Message Format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation

Follow this style: type(scope): brief description, then detailed explanation.
```

**Why examples > descriptions**: Claude infers the desired style, tone, and detail level more accurately from examples than from abstract descriptions.

### When to Use Each

| Pattern | Best For | Signal |
|---------|----------|--------|
| Template | Structured output (reports, configs, API responses) | "Must follow this format" |
| Examples | Style-sensitive output (commit msgs, docs, emails) | "Should look like this" |
| Both | Complex output with structure AND style | Reports with specific tone |

## Pattern 3: Validation Pattern

Pair output patterns with validation to ensure consistency.

```markdown
## Output Validation

After generating output, verify:
- [ ] All required sections present
- [ ] No placeholder text remaining
- [ ] Format matches template exactly
- [ ] Links are valid

If validation fails, regenerate the failing section only.
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Template too rigid | Claude forces content into wrong structure | Add "adjust as needed" escape hatch |
| No examples for style | Inconsistent tone across outputs | Add 2-3 input/output examples |
| Too many examples | Context bloat | 2-3 representative examples suffice |
| Examples without explanation | Claude copies format but misses intent | Add brief pattern explanation after examples |
