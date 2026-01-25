# Prompt Anti-Patterns

Common mistakes that lead to poor prompt performance.

## Anti-Pattern 1: Vague Instructions

### Problem
```
Help me with my code.
```

### Why It Fails
- No specific task defined
- No context about the code
- No success criteria
- AI must guess what you want

### Fix
```
Review this Python function for:
1. Logic bugs
2. Edge case handling
3. Performance issues

<code>
def calculate_total(items):
    return sum(i.price for i in items)
</code>

Flag any issues with severity (Critical/Major/Minor).
```

---

## Anti-Pattern 2: No Output Format

### Problem
```
Analyze this data and tell me what you find.
```

### Why It Fails
- Output structure is undefined
- Responses will be inconsistent
- Hard to parse or use programmatically

### Fix
```
Analyze this data and return results in this format:

## Key Findings
- [Finding 1]
- [Finding 2]

## Metrics
| Metric | Value | Trend |
|--------|-------|-------|
| ...    | ...   | ...   |

## Recommendations
1. [Action item]
```

---

## Anti-Pattern 3: Missing Examples

### Problem
```
Classify customer feedback as positive, negative, or neutral.
Feedback: "The product works but delivery was slow"
```

### Why It Fails
- Ambiguous edge cases not addressed
- No format demonstration
- Model must infer expectations

### Fix
```
Classify customer feedback as positive, negative, neutral, or mixed.

<examples>
<example>
<input>"Amazing product, fast delivery!"</input>
<output>Positive</output>
</example>
<example>
<input>"Product works but delivery was slow"</input>
<output>Mixed (Product: Positive, Delivery: Negative)</output>
</example>
</examples>

Feedback: "{{input}}"
```

---

## Anti-Pattern 4: Instruction-Data Confusion

### Problem
```
Summarize this article. The article should be about technology.
Make sure to include key points. Here is the article:
[article text that might contain "summarize" or "key points"]
```

### Why It Fails
- Instructions mixed with data
- Model may confuse article content with commands
- Injection vulnerabilities

### Fix
```xml
<instructions>
Summarize the article below. Include 3-5 key points.
</instructions>

<article>
{{article_content}}
</article>

<output_format>
## Summary
[2-3 sentences]

## Key Points
- [Point 1]
- [Point 2]
</output_format>
```

---

## Anti-Pattern 5: No Constraints

### Problem
```
Write a product description for this item.
```

### Why It Fails
- No length guidance (could be 1 sentence or 1000 words)
- No tone specification
- No content boundaries

### Fix
```
Write a product description with these constraints:

LENGTH: 100-150 words
TONE: Professional but approachable
AUDIENCE: Tech-savvy consumers

MUST INCLUDE:
- Key features (top 3)
- Primary use case
- Call to action

MUST NOT INCLUDE:
- Competitor comparisons
- Unverified claims
- Technical jargon
```

---

## Anti-Pattern 6: Overloaded Prompts

### Problem
```
Analyze this code for bugs, security issues, performance problems, 
style violations, documentation gaps, test coverage, dependency issues,
accessibility concerns, internationalization support, and scalability,
then refactor it, write tests, add documentation, and create a PR description.
```

### Why It Fails
- Too many tasks in one prompt
- Quality degrades with complexity
- Hard to iterate on specific parts

### Fix
Break into focused prompts:

```
# Prompt 1: Analysis
Analyze this code for bugs and security issues only.
[code]

# Prompt 2: Fixes
Based on the analysis, fix the critical bugs identified.
[code + analysis]

# Prompt 3: Documentation
Add documentation to the fixed code.
[fixed code]
```

---

## Anti-Pattern 7: Assuming Context

### Problem
```
Continue from where we left off.
```

### Why It Fails
- AI may not have previous context
- Session state is unreliable
- Leads to inconsistent results

### Fix
```
Previously, we were analyzing customer churn data. 
The key finding was that 40% of churn occurs in month 3.

Continue the analysis by:
1. Identifying what happens in month 3
2. Suggesting interventions

<previous_findings>
- Churn rate: 40% at month 3
- Common complaints: [...]
</previous_findings>
```

---

## Anti-Pattern 8: Asking for Perfection

### Problem
```
Write the perfect marketing email that will definitely convert.
```

### Why It Fails
- "Perfect" is undefined
- Creates pressure for overconfidence
- No actionable criteria

### Fix
```
Write a marketing email optimized for:
- Open rate (compelling subject line)
- Click-through (clear CTA)
- Conversion (value proposition)

Target: {{audience}}
Goal: {{conversion_goal}}

After writing, rate your confidence (1-10) for each metric and explain.
```

---

## Anti-Pattern 9: No Error Handling

### Problem
```
Extract all email addresses from this text.
```

### Why It Fails
- What if there are no emails?
- What if emails are malformed?
- What if text is empty?

### Fix
```
Extract all email addresses from this text.

If no emails found: Return "No email addresses found"
If emails are malformed: Return them with [INVALID] tag
If text is empty: Return "Error: Empty input"

<text>
{{input}}
</text>

Output format:
- valid@email.com
- [INVALID] partial@
```

---

## Anti-Pattern 10: Implicit Knowledge Assumptions

### Problem
```
Use our standard format for this report.
```

### Why It Fails
- AI doesn't know "your" standard
- Relies on unstated assumptions
- Results will be wrong

### Fix
```
Format this report using the structure below:

<template>
# [Report Title]
Date: [YYYY-MM-DD]
Author: [Name]

## Executive Summary
[2-3 sentences]

## Findings
[Numbered list]

## Recommendations
[Action items with owners]
</template>
```

---

## Quick Reference: Anti-Pattern Checklist

Before using a prompt, verify:

| Check | Question |
|-------|----------|
| [ ] Specific | Is the task clearly defined? |
| [ ] Formatted | Is output structure specified? |
| [ ] Exampled | Are examples provided? |
| [ ] Separated | Are instructions separate from data? |
| [ ] Constrained | Are boundaries defined? |
| [ ] Focused | Is it one task (not many)? |
| [ ] Contextual | Is necessary context included? |
| [ ] Realistic | Are expectations achievable? |
| [ ] Robust | Are edge cases handled? |
| [ ] Explicit | Are assumptions stated? |
