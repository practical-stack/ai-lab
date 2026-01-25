# Prompt Engineering Techniques Catalog

Comprehensive reference of proven prompt engineering techniques.

## Core Techniques (Anthropic Official)

### 1. Be Clear and Direct

State exactly what you want using action verbs.

| Weak | Strong |
|------|--------|
| "Help with code" | "Review this Python function for bugs" |
| "Write something about AI" | "Write a 500-word blog post explaining AI to beginners" |

**Key principles:**
- Use imperative verbs: "Analyze", "Generate", "Extract", "Compare"
- Specify scope: length, format, audience
- State success criteria explicitly

### 2. Provide Context and Motivation

Explain *why* to help the model understand goals.

```markdown
# Without context
Summarize this article.

# With context
Summarize this article for our weekly executive newsletter. 
The audience is C-suite executives with 2 minutes to read.
Focus on business implications and actionable insights.
```

### 3. Use Examples (Few-Shot)

Show the desired format with 1-3 examples.

```xml
<examples>
<example>
<input>Customer: "Your product ruined my entire project!"</input>
<output>
Sentiment: Negative
Intensity: High
Category: Product Quality
Action: Escalate to support manager
</output>
</example>
</examples>
```

**Guidelines:**
- 1 example: Format demonstration
- 2-3 examples: Pattern establishment
- Include edge cases for complex tasks

### 4. Chain of Thought (CoT)

Add reasoning instructions for complex tasks.

```markdown
Think through this step by step:
1. First, identify the key variables
2. Then, analyze their relationships
3. Consider potential edge cases
4. Finally, form your conclusion

Show your reasoning before giving the final answer.
```

**When to use:**
- Math/logic problems
- Multi-step analysis
- Complex classification
- Debugging tasks

### 5. Use XML Tags

Organize content with clear structure.

```xml
<context>
Background information here
</context>

<task>
What the AI should do
</task>

<input>
{{user_provided_data}}
</input>

<output_format>
How to structure the response
</output_format>
```

**Benefits:**
- Clear separation of sections
- Easy to reference specific parts
- Prevents instruction-data confusion

### 6. Give a Role (System Prompts)

Define persona and expertise.

```markdown
You are a senior backend engineer with 15 years of experience in:
- Distributed systems architecture
- Database optimization
- Security best practices

You communicate technically but explain reasoning clearly.
```

**Effective roles include:**
- Expertise level and domain
- Communication style
- Key priorities/values

### 7. Prefill Response

Start the output to enforce format.

```
User: Analyze this data and return JSON.
Assistant: {"analysis":
```

This forces JSON output by starting the response.

**Use cases:**
- Force JSON/XML output
- Start with specific structure
- Prevent preamble text

### 8. Chain Complex Prompts

Break large tasks into subtasks.

```markdown
# Step 1: Extract
Extract all dates mentioned in the text.

# Step 2: Validate  
Check if dates are in valid format.

# Step 3: Transform
Convert all dates to ISO 8601 format.

# Step 4: Output
Return the transformed dates as JSON array.
```

## Advanced Techniques (Research-Backed)

### 9. Meta-Prompting (Stanford/OpenAI)

Use one LLM as "conductor" to orchestrate experts.

```markdown
You are a meta-prompt conductor. For complex tasks:
1. Break the task into subtasks
2. Assign each subtask to a specialized "expert" perspective
3. Integrate expert outputs
4. Verify and refine the final result
```

**When to use:**
- Multi-domain problems
- Tasks requiring diverse expertise
- Quality-critical outputs

### 10. Self-Consistency

Generate multiple responses and aggregate.

```markdown
Generate 3 different approaches to solve this problem.
Then compare them and select the best one, explaining why.
```

### 11. ReAct (Reason + Act)

Interleave reasoning with actions.

```markdown
For each step:
1. Thought: Explain what you're thinking
2. Action: What tool/action to take
3. Observation: What you learned
4. Repeat until task complete
```

### 12. Structured Output Forcing

Demand specific output structures.

```markdown
Return your response in this exact format:

## Summary
[1-2 sentences]

## Key Points
- Point 1
- Point 2
- Point 3

## Recommendation
[Single actionable recommendation]

## Confidence
[High/Medium/Low] - [Reason]
```

## Technique Selection Guide

| Task Type | Primary Technique | Supporting Techniques |
|-----------|-------------------|----------------------|
| **Simple Q&A** | Clear instructions | - |
| **Analysis** | CoT + Role | XML tags |
| **Generation** | Examples + Role | Constraints |
| **Classification** | Examples | Structured output |
| **Multi-step** | Chaining | XML tags + CoT |
| **Complex reasoning** | Meta-prompting | Self-consistency |
| **Format-critical** | Prefill + Examples | XML tags |

## Combining Techniques

Most effective prompts combine 3-4 techniques:

```xml
<!-- Role -->
You are an expert data analyst specializing in financial data.

<!-- Task with CoT -->
<task>
Analyze this financial report and identify trends.
Think step by step through your analysis.
</task>

<!-- Structured Input -->
<report>
{{financial_data}}
</report>

<!-- Few-shot Example -->
<example>
<input>Q1 revenue: $1M, Q2 revenue: $1.2M</input>
<analysis>
1. Calculate growth: ($1.2M - $1M) / $1M = 20%
2. Identify trend: Positive quarter-over-quarter growth
3. Assess significance: 20% growth is strong
</analysis>
<output>
Trend: Positive (20% QoQ growth)
Significance: Strong
Recommendation: Investigate drivers of growth
</output>
</example>

<!-- Structured Output -->
<output_format>
## Trends Identified
[List trends]

## Analysis
[Your reasoning]

## Recommendations
[Actionable items]
</output_format>

<!-- Constraints -->
<constraints>
- Base conclusions only on provided data
- State confidence level for each trend
- Flag any data quality concerns
</constraints>
```
