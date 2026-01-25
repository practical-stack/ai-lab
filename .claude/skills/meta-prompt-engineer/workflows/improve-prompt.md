# Workflow: Improve Prompt

Optimize an existing prompt for better quality outputs.

## Input Required

- **Current prompt**: The prompt to improve
- **Issues observed** (optional): What's wrong with current outputs
- **Desired improvements** (optional): Specific enhancements wanted

## Step-by-Step Procedure

### Step 1: Analyze Current Prompt

Evaluate against checklist:

| Element | Present? | Quality |
|---------|----------|---------|
| Clear role/persona | Y/N | 1-5 |
| Specific task description | Y/N | 1-5 |
| Input format defined | Y/N | 1-5 |
| Output format specified | Y/N | 1-5 |
| Examples provided | Y/N | Count: _ |
| Constraints/guardrails | Y/N | 1-5 |
| Structure (XML/sections) | Y/N | 1-5 |

### Step 2: Identify Gaps

Common issues to fix:

| Problem | Symptom | Solution |
|---------|---------|----------|
| **Vague instructions** | Inconsistent outputs | Add specific constraints |
| **No examples** | Wrong format | Add 1-3 few-shot examples |
| **Missing structure** | Disorganized output | Add XML tags |
| **No reasoning** | Shallow analysis | Add chain-of-thought |
| **Weak guardrails** | Unwanted behavior | Add DO/DON'T constraints |

### Step 3: Apply Anthropic's 4-Step Improvement

**Phase 1: Example Identification**
- Locate existing examples in the prompt
- Note their format and quality

**Phase 2: Initial Draft Restructuring**
- Organize with clear sections
- Add XML tags for inputs/outputs
- Separate instructions from context

**Phase 3: Chain of Thought Refinement**
- Add reasoning instructions for complex tasks
- Include "think step by step" where appropriate
- Structure the thinking process

**Phase 4: Example Enhancement**
- Update examples to show reasoning process
- Ensure examples match output format exactly
- Add edge case examples if needed

### Step 4: Restructure with XML Tags

Transform unstructured prompts:

**Before:**
```
Summarize this article. Make it short. Here's the article: {text}
```

**After:**
```xml
You are a professional editor specializing in executive summaries.

<task>
Summarize the article for busy executives who need key insights quickly.
</task>

<article>
{{text}}
</article>

<requirements>
- Maximum 3 bullet points
- Each bullet under 20 words
- Focus on actionable insights
- Use business language
</requirements>

<output_format>
## Key Takeaways
- [Insight 1]
- [Insight 2]
- [Insight 3]
</output_format>
```

### Step 5: Enhance Examples

Transform basic examples into reasoning demonstrations:

**Before:**
```
Input: "The product is great"
Output: Positive
```

**After:**
```xml
<example>
<input>The product is great but shipping took forever</input>
<reasoning>
1. Identify sentiment indicators: "great" (positive), "took forever" (negative)
2. Assess balance: One positive about product, one negative about service
3. Determine primary subject: Product quality vs shipping experience
4. Overall: Mixed sentiment, leaning positive on product
</reasoning>
<output>
Sentiment: Mixed (Product: Positive, Shipping: Negative)
Confidence: 85%
</output>
</example>
```

### Step 6: Add Missing Guardrails

Standard guardrails to consider:

```markdown
## Constraints

ALWAYS:
- Cite specific evidence from the input
- Maintain consistent output format
- Handle edge cases gracefully

NEVER:
- Make assumptions not supported by input
- Include personal opinions
- Exceed specified length limits

IF UNCERTAIN:
- State confidence level
- Ask for clarification
- Provide best effort with caveats
```

### Step 7: Validate Improvements

Compare before/after:

| Aspect | Before | After |
|--------|--------|-------|
| Structure | Poor/Good | Improved |
| Examples | 0/1/2+ | Added/Enhanced |
| Constraints | Weak/Strong | Strengthened |
| Output format | Vague/Clear | Specified |

## Output Format

Return:

1. **Improved Prompt** in code block
2. **Changes Made** summary:
   - What was added
   - What was restructured
   - Why these changes help

## Example

**Original Prompt:**
```
Write a good email response
```

**Improved Prompt:**
```markdown
You are a professional communication specialist who writes clear, concise business emails.

## Task
Write a professional email response to the message below.

<original_email>
{{email_content}}
</original_email>

<context>
Sender: {{sender_name}}
Relationship: {{relationship}}
Tone needed: {{tone}}
</context>

## Requirements
- Match the formality level of the original email
- Address all questions/points raised
- Keep response under 150 words
- Include clear next steps if applicable

## Output Format
Subject: Re: [Original Subject]

[Greeting],

[Body - 2-3 paragraphs max]

[Professional closing],
[Your name]

## Example
<example>
<input>
Original: "Hi, can we reschedule tomorrow's meeting?"
Context: Colleague, casual, accommodating tone
</input>
<output>
Subject: Re: Tomorrow's Meeting

Hi [Name],

No problem at all! I'm flexible tomorrow. Would 2pm or 4pm work better for you?

Let me know what fits your schedule.

Best,
[Your name]
</output>
</example>

## Constraints
- DO: Mirror the sender's tone and formality
- DO: Be concise and action-oriented
- DON'T: Use overly casual language with external contacts
- DON'T: Leave questions unanswered
```

**Changes Made:**
- Added professional communicator role
- Structured input with XML tags
- Specified output format with template
- Added concrete example
- Included DO/DON'T constraints
