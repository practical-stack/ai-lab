---
name: meta-prompt-engineer
description: Generate high-quality prompts using proven prompt engineering
  techniques. Use when users want to write a prompt, create or improve prompts,
  work on meta-prompts, or need to craft effective instructions for AI tasks.
  Do NOT use for simply asking questions, executing existing prompts, or
  non-prompt-related tasks.
---

# Meta Prompt Engineer

Generate structured, effective prompts for AI systems using proven techniques from Anthropic, OpenAI, and academic research.

## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Create new prompt from scratch | [workflows/generate-prompt.md](workflows/generate-prompt.md) |
| Improve/optimize existing prompt | [workflows/improve-prompt.md](workflows/improve-prompt.md) |

## Core References

| Reference | Purpose |
|-----------|---------|
| [Techniques Catalog](references/techniques.md) | All prompt engineering techniques |
| [Templates](references/templates.md) | Ready-to-use prompt structures |
| [Anti-Patterns](references/anti-patterns.md) | Mistakes to avoid |

## The 80/20 Rule

Three principles that solve 80% of prompt quality issues:

1. **Goal + Constraints Upfront**
   - State what "done" looks like
   - Define boundaries and limitations

2. **1-3 Examples**
   - Format beats adjectives
   - Show, don't tell

3. **Force Structured Output**
   - JSON, bullets, tables, rubric
   - Explicit format requirements

## Prompt Structure (Contract-Style)

```
1. ROLE       - Who the AI is (persona, expertise)
2. TASK       - What to do (specific action)
3. CONTEXT    - What you're given (inputs, background)
4. OUTPUT     - Format, constraints, requirements
5. EXAMPLES   - Show desired input→output
6. VERIFY     - How to check success
```

## Quick Technique Reference

| Technique | When to Use | Example |
|-----------|-------------|---------|
| **XML Tags** | Structure complex inputs | `<context>...</context>` |
| **Few-shot** | Enforce format/style | 1-3 input→output examples |
| **Chain of Thought** | Complex reasoning | "Think step by step" |
| **Role/Persona** | Consistent voice | "You are a senior engineer" |
| **Prefill** | Force output format | Start with `{` for JSON |
| **Constraints** | Prevent unwanted behavior | "Do NOT include..." |

## Success Criteria

Generated prompt should have:

- [ ] Clear goal statement (what success looks like)
- [ ] Explicit output format specification
- [ ] At least one example (input → output)
- [ ] Appropriate structure (XML tags or clear sections)
- [ ] Constraints/guardrails (what NOT to do)
- [ ] Context about the task domain

## Output

This skill outputs:
1. **Structured prompt** ready for use
2. **Rationale** explaining technique choices (if requested)
