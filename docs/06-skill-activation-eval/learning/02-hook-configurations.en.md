---
title: "Hook Configurations"
description: "Deep dive into five hook approaches for improving Claude Code skill activation, from simple echo to forced-eval commitment mechanism"
type: tutorial
tags: [AI, Architecture, BestPractice]
order: 2
depends_on: [./01-problem-and-baseline.en.md]
related: [./02-hook-configurations.ko.md, ./03-eval-harness.en.md]
---

# Module 2: Hook Configurations

> Five approaches to forcing skill activation — from no-op to 100% reliability

## Learning Objectives

After completing this module, you will:
- Explain how Claude Code hooks work via the `UserPromptSubmit` event
- Compare five hook configurations and their tradeoffs
- Analyze why the forced-eval hook achieves 100% activation
- Understand why `type: prompt` hooks are ineffective
- Design a commitment mechanism for structured LLM behavior

---

## 2.1 How Claude Code Hooks Work

Claude Code hooks are scripts triggered by specific events during a session. They're configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/my-hook.sh"
      }
    ]
  }
}
```

### Hook Events

| Event | When It Fires | Use Case |
|-------|--------------|----------|
| `UserPromptSubmit` | After user sends a prompt, before Claude processes it | Pre-processing, skill forcing |
| `Stop` | After Claude finishes responding | Post-processing, logging |
| `SubagentStop` | After a subagent finishes | Subagent coordination |

### Hook Types

| Type | Behavior | Output Handling |
|------|----------|-----------------|
| `command` | Runs a shell script | stdout is prepended to Claude's context |
| `prompt` | Provides a static prompt | Injected as system instruction |

The critical detail: **`command` hook stdout becomes part of Claude's input context**. Whatever the script prints, Claude sees before processing the user's prompt. This is the mechanism that makes forced-eval work.

---

## 2.2 Config: None (Baseline)

The control group — no hook configured.

```json
{
  "hooks": {}
}
```

### Behavior

Claude receives the user prompt and decides on its own whether to call `Skill()`. As established in Module 1, this yields ~50-55% activation on standard prompts.

### Results

| Metric | Standard Prompts | Edge Cases |
|--------|-----------------|------------|
| Activation rate | 50-55% | Lower |
| False positives | N/A | N/A |
| Avg latency | 8.7s | — |

### Why It Fails

Without explicit instruction, Claude treats `Skill()` as optional. Its default behavior prioritizes immediate implementation over knowledge loading.

---

## 2.3 Config: Simple Echo

A minimal hook that reminds Claude to check skills.

```bash
#!/bin/bash
echo "Remember to check and use available skills for this task."
```

### Configuration

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/simple-echo.sh"
      }
    ]
  }
}
```

### Results

| Metric | Standard Prompts | Edge Cases |
|--------|-----------------|------------|
| Activation rate | 50-59% | N/A |
| False positives | N/A | N/A |
| Avg latency | 8.6s | — |

### Why It Fails

A gentle reminder doesn't change Claude's behavior. The instruction is too vague — "check skills" doesn't create obligation. Claude processes it as a suggestion, not a requirement. This is a common prompt engineering failure: **polite requests don't override default behavior patterns**.

---

## 2.4 Config: Forced-Eval (The Winner)

A structured 3-step commitment mechanism that forces explicit skill evaluation.

```bash
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Before implementing ANYTHING, you MUST complete these steps IN ORDER:

Step 1 - EVALUATE: For EACH available skill, explicitly state:
  [skill-name] - YES/NO - [one-line reason why it's relevant or not]

Step 2 - ACTIVATE: For every skill you marked YES, call the Skill() tool
  to load its contents. Do this BEFORE any implementation.

Step 3 - IMPLEMENT: Only AFTER completing Steps 1 and 2, proceed with
  the user's request using the loaded skill knowledge.

CRITICAL: You MUST call Skill() in Step 2 for all YES skills.
Do NOT skip directly to implementation.
Do NOT say "I'll keep the skill in mind" — you must CALL Skill().
EOF
```

### Configuration

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/force-eval.sh"
      }
    ]
  }
}
```

### Results

| Metric | Standard Prompts | Edge Cases |
|--------|-----------------|------------|
| Activation rate | **100%** | **75%** |
| False positives | **0%** | **0%** |
| Avg latency | 10.7s | — |

### Why It Works: The Commitment Mechanism

The forced-eval hook succeeds because of three psychological/behavioral principles applied to LLM prompting:

**1. Explicit enumeration forces evaluation**

By requiring Claude to list each skill with YES/NO, it can't skip the evaluation step. The enumeration creates a cognitive checkpoint.

**2. Binary commitment creates obligation**

Writing "YES" for a skill creates a commitment that Claude follows through on. This is the "commitment mechanism" — once Claude has explicitly stated a skill is relevant, it's far more likely to call `Skill()`.

**3. Sequential steps prevent shortcutting**

The EVALUATE → ACTIVATE → IMPLEMENT ordering prevents Claude from jumping to implementation. Each step must complete before the next begins.

### Bidirectional Restraint

The forced-eval hook works in both directions:

| Direction | Behavior | Result |
|-----------|----------|--------|
| **Positive** | Relevant skill → YES → Skill() called | 100% activation |
| **Negative** | Irrelevant skill → NO → Skill() not called | 0% false positives |

This bidirectional effect is why forced-eval has zero false positives on edge cases — it doesn't just force activation, it forces *deliberate* activation.

---

## 2.5 Config: LLM-Eval

Uses a secondary LLM (Haiku) to pre-classify skill relevance before Claude processes the prompt.

```bash
#!/bin/bash
# Calls Haiku API to classify prompt against skill descriptions
# Returns: "ACTIVATE: skill-name-1, skill-name-2" or "NONE"

PROMPT="$1"
SKILLS=$(cat .claude/skills/*/SKILL.md | head -50)

RESULT=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20241022\",
    \"max_tokens\": 100,
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"Given these skills:\\n$SKILLS\\n\\nClassify this prompt: $PROMPT\\n\\nRespond with ACTIVATE: skill-names or NONE\"
    }]
  }" | jq -r '.content[0].text')

echo "Based on pre-analysis, activate these skills: $RESULT"
```

### Results

| Metric | Standard Prompts | Edge Cases |
|--------|-----------------|------------|
| Activation rate | **100%** | **67%** |
| False positives | 0% | **80%** (4 of 5) |
| Avg latency | 6.4s | — |

### Why It's Fast But Flawed

**Speed advantage**: The Haiku call is fast (~1s), and by telling Claude which skills to activate upfront, it skips the evaluation phase. Total latency: 6.4s vs 10.7s for forced-eval.

**False positive problem**: Haiku over-matches on edge cases. When given a prompt that doesn't match any skill, Haiku still suggests activating skills (80% false positive rate). This is worse than no hook at all because Claude loads irrelevant knowledge.

**API key dependency**: Requires `ANTHROPIC_API_KEY` in the environment, adding operational complexity.

### When LLM-Eval Makes Sense

| Scenario | Recommendation |
|----------|---------------|
| Domain-specific prompts only (never edge cases) | ✅ LLM-eval for speed |
| Mixed prompts (some match, some don't) | ❌ Use forced-eval |
| No API key available | ❌ Can't use LLM-eval |

---

## 2.6 Config: Type-Prompt

Uses Claude Code's native `type: prompt` hook mechanism instead of a command.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "prompt",
        "prompt": "Before implementing, evaluate each available skill and activate relevant ones using Skill()."
      }
    ]
  }
}
```

### Results

| Metric | Standard Prompts | Edge Cases |
|--------|-----------------|------------|
| Activation rate | 41-55% | N/A |
| False positives | N/A | N/A |
| Avg latency | 9.6s | — |

### Why It's Useless

The `type: prompt` hook is **no better than baseline** — and in some runs, *worse*. This is counterintuitive: you'd expect a system-level prompt to be at least as effective as stdout injection from a command hook.

The likely explanation: `type: prompt` instructions are injected at a different position in Claude's context than `type: command` stdout. The prompt hook content may be treated as a lower-priority system instruction, while command stdout is prepended directly before the user's message, giving it higher salience.

### Key Lesson

**Not all instruction injection points are equal.** Where in the context window an instruction appears matters as much as what it says. Command hooks inject into the user-adjacent context; prompt hooks inject into the system instruction space where they compete with other system prompts.

---

## 2.7 Comparison Summary

| Config | Activation | False Positives | Latency | API Key? | Verdict |
|--------|-----------|-----------------|---------|----------|---------|
| none | 50-55% | N/A | 8.7s | No | Baseline |
| simple | 50-59% | N/A | 8.6s | No | Pointless |
| **forced-eval** | **100%** | **0%** | 10.7s | No | **Best** |
| llm-eval | 100% | 80% (edge) | 6.4s | Yes | Fast, risky |
| type-prompt | 41-55% | N/A | 9.6s | No | Useless |

### Decision Matrix

```
Need reliable activation?
  ├─ YES: Need speed over accuracy?
  │    ├─ YES: llm-eval (accept false positive risk)
  │    └─ NO:  forced-eval (recommended)
  └─ NO:  No hook needed (accept ~50% activation)
```

---

## Key Takeaways

- Claude Code hooks inject instructions via `UserPromptSubmit` event before prompt processing
- Simple reminders ("check skills") don't change behavior — specificity and structure matter
- **Forced-eval** achieves 100% activation through a 3-step commitment mechanism (evaluate → activate → implement)
- The commitment works bidirectionally: forces activation for relevant skills AND restraint for irrelevant ones
- LLM-eval is faster but produces 80% false positives on edge cases
- `type: prompt` hooks are equivalent to no hook — instruction injection position matters
- The ~2s latency cost of forced-eval (10.7s vs 8.7s baseline) is negligible for 100% reliability

## Exercises

### Exercise 2.1: Design a Hook

Write a forced-eval hook script for a project with these skills:
- `react-patterns`: React component best practices
- `api-conventions`: REST API naming and error handling
- `testing-standards`: Jest/Vitest test structure

Your hook should follow the 3-step pattern. Test it mentally against these prompts:
1. "Create a user profile component"
2. "Add error handling to the API endpoint"
3. "Write unit tests for the auth module"
4. "Update the README"

### Exercise 2.2: Predict Outcomes

For each hook config, predict the activation result for the prompt "refactor the database queries for better performance":
1. No hook
2. Simple echo
3. Forced-eval (skills: `db-optimization`, `code-style`, `testing`)
4. LLM-eval
5. Type-prompt

### Exercise 2.3: Analyze the Failure

Why does this hook fail to improve activation?

```bash
#!/bin/bash
echo "Skills are available. Use them if needed."
```

Rewrite it using the commitment mechanism pattern. What specific changes make the difference?

---

## Next Steps

Continue to [Module 3: The Eval Harness](./03-eval-harness.en.md) to learn how these configurations were tested reproducibly in sandboxed environments.
