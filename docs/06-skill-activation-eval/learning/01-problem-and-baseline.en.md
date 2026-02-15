---
title: "The Problem & Baseline"
description: "Understanding why Claude Code skills fail to activate reliably and establishing baseline metrics across models"
type: tutorial
tags: [AI, Testing]
order: 1
related: [./01-problem-and-baseline.ko.md, ./02-hook-configurations.en.md]
---

# Module 1: The Problem & Baseline

> Claude Code skills are powerful but unreliable — they activate only about half the time

## Learning Objectives

After completing this module, you will:
- Explain why Claude Code skills don't auto-activate reliably
- Distinguish between **activation** and **selection** (the core insight)
- Understand keyword-based vs semantic matching behavior
- Compare baseline activation rates across different models
- Identify when skill activation is likely to succeed or fail

---

## 1.1 The Skill Activation Problem

Claude Code skills are designed to provide domain-specific knowledge. You configure them in `.claude/settings.json`, and Claude is supposed to call `Skill()` to load them when relevant. The problem: **it doesn't always do this**.

### What Should Happen

```
User prompt → Claude evaluates skills → Calls Skill() → Reads content → Implements with knowledge
```

### What Actually Happens (~50% of the time)

```
User prompt → Claude skips skill evaluation → Implements directly (without domain knowledge)
```

This isn't a minor inconvenience. Skills contain critical context — coding standards, framework patterns, API conventions. When Claude skips them, it produces generic code instead of project-specific implementations.

### Real-World Impact

Consider a Svelte project with skills for:
- SvelteKit routing patterns
- State management with runes
- Form handling with `$state`

When a user asks "add a contact form with validation," Claude *should* load the form handling skill. But half the time, it writes generic HTML form code instead of using the project's established patterns.

---

## 1.2 Activation vs Selection: The Core Insight

The research revealed a crucial distinction:

| Concept | Definition | Claude's Performance |
|---------|-----------|---------------------|
| **Activation** | Whether Claude calls `Skill()` at all | ~50% (the problem) |
| **Selection** | Which skill Claude picks when it does activate | ~100% (not a problem) |

**This changes everything about the solution approach.** Claude doesn't have a "wrong skill" problem. It has a "skipping the skill step" problem. When it does engage the skill system, it consistently picks the correct skill.

### Why This Matters

If the problem were selection (picking wrong skills), you'd need better skill descriptions, improved matching algorithms, or semantic search. But since the problem is activation (engaging the system at all), the solution is simpler: **force Claude to evaluate skills before acting.**

This is analogous to a developer who knows where to find documentation but doesn't bother looking — the fix isn't better documentation, it's a process that requires checking documentation first.

---

## 1.3 Keyword Matching vs Semantic Understanding

Claude's skill activation uses **keyword matching**, not semantic understanding. This has direct implications for how you write skill descriptions and prompts.

### What Works: Direct Keyword Triggers

| Prompt | Skill Description Contains | Activates? |
|--------|---------------------------|------------|
| "add a form with `$state`" | "`$state` management" | ✅ Yes |
| "implement SvelteKit routing" | "SvelteKit routing" | ✅ Yes |
| "use runes for reactivity" | "Svelte runes" | ✅ Yes |

### What Fails: Semantic/Conceptual Triggers

| Prompt | Skill Description Contains | Activates? |
|--------|---------------------------|------------|
| "add form actions" | "form handling patterns" | ❌ No |
| "make the page reactive" | "Svelte runes, `$state`" | ❌ No |
| "handle user input" | "form validation, `$state`" | ❌ No |

### The Pattern

```
Keyword overlap between prompt and skill description → Activation likely
Semantic relationship without keyword overlap       → Activation unlikely
```

This explains why baseline activation is ~50%: straightforward prompts that reuse skill keywords work, but conceptually related prompts without keyword overlap don't trigger activation.

### Practical Implication

Without hooks, you can improve activation by:
1. Writing skill descriptions with many keyword variants
2. Coaching users to use specific terminology
3. But neither approach reaches 100% — hence the need for hooks

---

## 1.4 Model Differences: Sonnet vs Haiku

Not all models handle skill activation equally:

| Model | Baseline Activation | Notes |
|-------|-------------------|-------|
| **Sonnet 4.5** | ~50-55% | Usable but unreliable |
| **Haiku 4.5** | ~0% | Effectively cannot use skills |

### Why Haiku Fails

Haiku is a smaller, faster model optimized for throughput. It appears to lack sufficient capacity to:
1. Parse the skill system instructions
2. Evaluate skill relevance
3. Decide to call `Skill()` as a tool

This isn't a configuration issue — Haiku simply doesn't engage with the skill mechanism. If you need skill activation, **Sonnet is the minimum viable model**.

### Sonnet's Inconsistency

Even Sonnet's ~55% is problematic. The inconsistency means:
- Same prompt, same skills → different behavior across runs
- No way to predict whether skills will activate
- Users can't rely on skills for critical workflows

This variance motivated the search for hook-based solutions that guarantee activation.

---

## 1.5 Establishing the Baseline

The baseline measurements were taken with:

| Parameter | Value |
|-----------|-------|
| Model | Sonnet 4.5 (via `claude -p`) |
| Skills | 3 Svelte-related skills |
| Prompts | 12 standard + 4 edge case |
| Runs per config | 3+ |
| Environment | Daytona sandboxes |

### Standard Prompts (Keyword-Rich)

These prompts naturally contain keywords from skill descriptions:

```
"add a contact form with validation using $state"
"implement SvelteKit routing for the dashboard"
"create a reactive counter component using runes"
```

**Baseline result: 50-55% activation rate**

### Edge Case Prompts (Semantic Only)

These prompts describe the same tasks without keyword overlap:

```
"add form actions to handle user submissions"
"make the page respond to user interactions"
"build a component that tracks a changing value"
```

**Baseline result: Even lower activation** — confirms keyword dependency.

### What "Activation" Means in Data

Each invocation produces JSONL output. Activation is detected by searching for `tool_use` events where the tool name is `Skill`:

```json
{"type":"content_block_start","content_block":{"type":"tool_use","name":"Skill","input":{"skill_name":"svelte-form-handling"}}}
```

No such event = skill was not activated for that run.

---

## Key Takeaways

- Claude Code skills activate only ~50-55% of the time on Sonnet 4.5 (Haiku: ~0%)
- **Activation ≠ Selection**: Claude always picks the right skill when it activates — the problem is it doesn't activate at all
- Activation is **keyword-based**, not semantic: prompts must share vocabulary with skill descriptions
- Baseline variance means skills cannot be relied upon for critical workflows without intervention
- The solution space is forcing activation (hooks), not improving selection

## Exercises

### Exercise 1.1: Identify Activation Triggers

Given this skill description:
```
"Svelte 5 runes patterns: $state, $derived, $effect for reactive state management"
```

Which prompts would likely activate it?
1. "Add reactive state to the counter"
2. "Use `$state` for the form fields"
3. "Make the component update when data changes"
4. "Implement `$derived` for computed values"
5. "Handle side effects in the dashboard"

### Exercise 1.2: Predict Model Behavior

A team uses Claude Code with 5 custom skills for their Next.js project. They run the same prompt 10 times on Sonnet 4.5 without any hooks.

- How many times would you expect skills to activate? (Give a range)
- Would switching to Haiku improve reliability? Why?
- What single change would most improve their activation rate without hooks?

### Exercise 1.3: Classify the Problem

For each scenario, identify whether it's an activation problem or a selection problem:
1. Claude writes a React component without loading any Svelte skills
2. Claude loads the routing skill when asked about form handling
3. Claude implements a feature using generic patterns instead of project conventions
4. Claude loads the correct skill but misinterprets its instructions

---

## Next Steps

Continue to [Module 2: Hook Configurations](./02-hook-configurations.en.md) to learn how different hook mechanisms attempt to solve the activation problem.
