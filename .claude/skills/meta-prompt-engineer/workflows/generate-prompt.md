# Workflow: Generate Prompt

Create a new high-quality prompt from scratch.

## Input Required

From the user, extract:
- **Task goal**: What should the AI accomplish?
- **Target audience**: Who will use the output?
- **Input data**: What will be provided to the prompt?
- **Output format**: How should results be structured?

## Step-by-Step Procedure

### Step 1: Analyze the Task

Extract from user request:

| Element | Question | Example |
|---------|----------|---------|
| **Goal** | What is the end result? | "Summarize articles for executives" |
| **Input** | What data is provided? | Article text, length limit |
| **Output** | What format is needed? | Bullet points, 3-5 items |
| **Audience** | Who consumes this? | Busy executives |
| **Constraints** | Any limitations? | Max 100 words, no jargon |

### Step 2: Select Techniques

Based on task complexity, choose techniques:

| Task Type | Recommended Techniques |
|-----------|----------------------|
| **Simple transformation** | Clear instructions + output format |
| **Analysis/reasoning** | Chain of thought + examples |
| **Creative generation** | Role/persona + few-shot examples |
| **Classification** | Examples + structured output |
| **Multi-step process** | XML tags + step-by-step |

Load [techniques.md](../references/techniques.md) for detailed guidance.

### Step 3: Structure the Prompt

Use the Contract-Style structure:

```markdown
# [ROLE]
You are [persona with relevant expertise].

# [TASK]
Your task is to [specific action verb] [object] for [purpose].

# [CONTEXT]
<input>
{{user_input}}
</input>

[Additional context about the domain/situation]

# [OUTPUT REQUIREMENTS]
Format your response as:
- [Format specification]
- [Length constraints]
- [Style requirements]

# [EXAMPLES]
<example>
<input>[Sample input]</input>
<output>[Ideal output demonstrating format]</output>
</example>

# [CONSTRAINTS]
- DO: [Required behaviors]
- DO NOT: [Prohibited behaviors]
```

### Step 4: Add Examples

Create 1-3 examples showing:

1. **Input**: Representative sample
2. **Reasoning** (if CoT): Step-by-step thought process
3. **Output**: Ideal result in exact format

Example structure:
```xml
<example>
<input>
[Sample input data]
</input>
<reasoning>
1. First, I identify...
2. Then, I analyze...
3. Finally, I conclude...
</reasoning>
<output>
[Formatted output matching requirements]
</output>
</example>
```

### Step 5: Add Guardrails

Define boundaries:

```markdown
## Constraints

ALWAYS:
- [Required behavior 1]
- [Required behavior 2]

NEVER:
- [Prohibited action 1]
- [Prohibited action 2]

IF UNCERTAIN:
- [Fallback behavior]
```

### Step 6: Validate Completeness

Check against criteria:

- [ ] Goal is stated clearly
- [ ] Output format is explicit
- [ ] At least 1 example included
- [ ] XML tags organize complex sections
- [ ] Constraints prevent unwanted behavior
- [ ] Role matches task requirements

## Output Format

Return the generated prompt in a code block:

~~~markdown
```
[Generated prompt here]
```
~~~

Optionally include:
- **Technique rationale**: Why these techniques were chosen
- **Customization hints**: How user can adapt the prompt

## Example

**User Request**: "Create a prompt for code review"

**Generated Prompt**:

```markdown
You are a senior software engineer conducting code reviews. Your expertise includes clean code principles, security best practices, and performance optimization.

## Task
Review the provided code and identify issues across these categories:
1. **Bugs**: Logic errors, edge cases, null handling
2. **Security**: Vulnerabilities, injection risks, auth issues
3. **Performance**: Inefficiencies, memory leaks, N+1 queries
4. **Maintainability**: Readability, naming, complexity

## Input
<code language="{{language}}">
{{code}}
</code>

<context>
{{additional_context}}
</context>

## Output Format
For each issue found:

### [Category]: [Brief Title]
- **Location**: Line X-Y
- **Severity**: Critical / Major / Minor
- **Issue**: [Description]
- **Suggestion**: [How to fix]

If no issues found in a category, state "No issues found."

## Example
<example>
<input>
def get_user(id):
    return db.query(f"SELECT * FROM users WHERE id = {id}")
</input>
<output>
### Security: SQL Injection Vulnerability
- **Location**: Line 2
- **Severity**: Critical
- **Issue**: String interpolation in SQL query allows injection attacks
- **Suggestion**: Use parameterized queries: `db.query("SELECT * FROM users WHERE id = ?", [id])`
</output>
</example>

## Constraints
- Focus on actionable issues, not style preferences
- Prioritize security issues
- If code is too long, focus on the most critical sections
- Say "No significant issues found" if code is clean
```
