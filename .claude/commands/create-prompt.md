---
description: Generate or improve prompts using proven prompt engineering techniques
allowed-tools: Read, Write
argument-hint: <task-description> [--improve <existing-prompt>]
---

# Create Prompt

Generate high-quality prompts for AI tasks using proven prompt engineering techniques from Anthropic, OpenAI, and academic research.

## Arguments

$ARGUMENTS

- **task-description**: What the prompt should accomplish (e.g., "code review", "summarize articles")
- **--improve** (optional): Path to existing prompt file to optimize

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│  /create-prompt (COMMAND - Orchestrator)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Route 1: GENERATE (new prompt)                             │
│  📚 meta-prompt-engineer skill                              │
│  workflows/generate-prompt.md                               │
│                                                             │
│  Route 2: IMPROVE (existing prompt)                         │
│  📚 meta-prompt-engineer skill                              │
│  workflows/improve-prompt.md                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Instructions

### Step 1: Load Skill

Read @.claude/skills/meta-prompt-engineer/SKILL.md for core principles:
- The 80/20 Rule (goal + examples + structure)
- Contract-style prompt structure
- Technique quick reference

### Step 2: Route by Intent

| Intent | Workflow | Trigger |
|--------|----------|---------|
| Create new prompt | @.claude/skills/meta-prompt-engineer/workflows/generate-prompt.md | No `--improve` flag |
| Optimize existing | @.claude/skills/meta-prompt-engineer/workflows/improve-prompt.md | Has `--improve` flag |

### Step 3: Execute Workflow

**For New Prompt (generate-prompt.md):**
1. Extract task goal from arguments
2. Select appropriate techniques (CoT, few-shot, XML tags, etc.)
3. Structure with contract-style template
4. Add examples demonstrating desired output
5. Define constraints and guardrails

**For Improvement (improve-prompt.md):**
1. Read the existing prompt file
2. Analyze against checklist (role, task, examples, constraints, output format)
3. Apply Anthropic's 4-step improvement process
4. Restructure with XML tags
5. Enhance examples with reasoning

### Step 4: Reference Materials (On-Demand)

For technique details: @.claude/skills/meta-prompt-engineer/references/techniques.md
For templates: @.claude/skills/meta-prompt-engineer/references/templates.md
For mistakes to avoid: @.claude/skills/meta-prompt-engineer/references/anti-patterns.md

## Output

### Success (New Prompt)

```markdown
## Generated Prompt

**Task:** [extracted goal]
**Techniques Used:** [list of techniques applied]

---

[Generated prompt in code block]

---

### Customization Hints
- [How to adapt for specific use cases]
- [Variables to replace: {{placeholders}}]
```

### Success (Improved Prompt)

```markdown
## Improved Prompt

**Changes Made:**
- [What was added]
- [What was restructured]
- [Why these changes help]

---

[Improved prompt in code block]

---

### Before/After Comparison
| Aspect | Before | After |
|--------|--------|-------|
| Structure | [status] | [status] |
| Examples | [count] | [count] |
| Constraints | [status] | [status] |
```

### Failure

```
❌ Could not generate prompt

**Issue:** [specific problem]
**Suggestion:** [how to fix]

Example usage:
  /create-prompt "code review for security vulnerabilities"
  /create-prompt --improve .claude/prompts/my-prompt.md
```

## Key Principle

**Command orchestrates; Skill provides knowledge.**

```
⚡ COMMAND: Routes to workflow, manages output
    ↓
📚 SKILL: Provides techniques, templates, anti-patterns
    ↓
🔧 OUTPUT: Ready-to-use prompt
```

## Related

- @.claude/skills/meta-prompt-engineer/SKILL.md
- @.claude/skills/meta-prompt-engineer/references/techniques.md
