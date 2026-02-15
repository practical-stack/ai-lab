---
title: "Results & Analysis"
description: "Data-driven comparison of hook configurations across standard and edge case prompts, with false positive and variance analysis"
type: tutorial
tags: [AI, Testing, BestPractice]
order: 4
depends_on: [./03-eval-harness.en.md]
related: [./04-results-analysis.ko.md, ./05-implementation-guide.en.md]
---

# Module 4: Results & Analysis

> Data from ~250 invocations reveals clear winners and surprising patterns

## Learning Objectives

After completing this module, you will:
- Compare activation rates across all five hook configurations
- Analyze the difference between standard and edge case prompt results
- Evaluate false positive rates and their practical implications
- Identify keyword patterns that drive activation success
- Assess variance and statistical confidence in LLM evaluation results

---

## 4.1 Standard Prompt Results

Standard prompts contain keywords that overlap with skill descriptions — the "happy path" for activation.

### Aggregate Results

| Config | Run 1 | Run 2 | Run 3 | Average | Variance |
|--------|-------|-------|-------|---------|----------|
| none | 50% | 55% | 52% | 52.3% | Low |
| simple | 50% | 59% | 53% | 54.0% | Medium |
| **forced-eval** | **100%** | **100%** | **100%** | **100%** | **None** |
| llm-eval | 100% | 100% | 100% | 100% | None |
| type-prompt | 41% | 55% | 50% | 48.7% | High |

### Key Observations

**1. Clear tier separation**

```
Tier 1 (100%):  forced-eval, llm-eval
Tier 2 (~50%):  none, simple, type-prompt
```

There's no middle ground. Hooks either solve the problem completely or don't help at all.

**2. Simple echo provides no improvement**

Despite injecting a reminder into Claude's context, the simple echo hook performs within the baseline variance range (50-59% vs 50-55%). The instruction is too weak to change behavior.

**3. Type-prompt is worse than baseline**

The `type: prompt` hook occasionally performs *below* baseline (41% in one run). This suggests the prompt injection might interfere with Claude's default skill-checking behavior rather than enhance it.

---

## 4.2 Edge Case Prompt Results

Edge case prompts are designed to be harder — they describe tasks semantically related to skills but without keyword overlap.

### Edge Case Categories

| Category | Example Prompt | Expected Skill | Challenge |
|----------|---------------|----------------|-----------|
| **Semantic-only** | "add form actions" | svelte-forms | No `$state` keyword |
| **Non-matching** | "update the README" | none | Should NOT activate any |
| **Ambiguous** | "improve the page" | unclear | Multiple skills could apply |
| **Cross-domain** | "optimize database queries" | none | Completely unrelated |

### Results on Edge Cases

| Config | Activation (matching) | False Positives (non-matching) |
|--------|----------------------|-------------------------------|
| none | N/A (not tested) | N/A |
| simple | N/A | N/A |
| **forced-eval** | **75%** | **0% (0 of 5)** |
| llm-eval | 67% | **80% (4 of 5)** |
| type-prompt | N/A | N/A |

### Forced-Eval Edge Case Breakdown

The 75% activation on matching edge cases (down from 100% on standard) shows that even forced-eval can't overcome completely absent keyword signals. But critically:

- **No false activations**: When skills don't match, Claude correctly says NO for all skills
- **Deliberate reasoning**: The YES/NO evaluation step produces clear reasoning about relevance
- **Graceful degradation**: 75% on hard prompts is still far better than 50% baseline on easy ones

### LLM-Eval Edge Case Breakdown

The 80% false positive rate on non-matching prompts is the critical flaw:

```
Prompt: "update the README with project description"
Expected: No skill activation (README has nothing to do with Svelte skills)
Haiku pre-classification: "ACTIVATE: svelte-routing, svelte-forms"  ← WRONG
Claude: Activates both skills unnecessarily
```

Haiku's pre-classification is too aggressive — it finds superficial connections between any prompt and available skills. This wastes tokens and could introduce confusion from irrelevant skill content.

---

## 4.3 False Positive Analysis

False positives are when Claude activates a skill that isn't relevant to the prompt.

### Why False Positives Matter

| Impact | Description |
|--------|-------------|
| **Token waste** | Loading irrelevant skill content consumes context window |
| **Confusion risk** | Irrelevant patterns may influence implementation |
| **Trust erosion** | Users lose confidence if Claude loads wrong skills |
| **Cost increase** | More tokens processed = higher API costs |

### False Positive Rates by Config

| Config | Standard | Edge (matching) | Edge (non-matching) |
|--------|----------|-----------------|---------------------|
| none | 0% | N/A | N/A |
| simple | 0% | N/A | N/A |
| **forced-eval** | **0%** | **0%** | **0%** |
| llm-eval | 0% | 0% | **80%** |
| type-prompt | 0% | N/A | N/A |

### The Commitment Mechanism's Restraint Effect

Forced-eval's zero false positive rate comes from the YES/NO enumeration step:

```
Step 1 - EVALUATE:
  [svelte-routing] - NO - The prompt asks about README documentation,
    not routing
  [svelte-forms] - NO - README updates don't involve form handling
  [svelte-state] - NO - No state management in documentation tasks

Step 2 - ACTIVATE: No skills marked YES.
Step 3 - IMPLEMENT: Proceeding without skill activation.
```

The explicit evaluation forces Claude to justify each decision. Writing "NO - [reason]" for an irrelevant skill is a natural, low-effort response that Claude handles correctly. Compare this to the implicit behavior without hooks, where Claude just... doesn't think about skills at all.

---

## 4.4 Keyword Pattern Analysis

Analyzing which prompt words trigger activation reveals the underlying matching mechanism.

### High-Activation Keywords

| Keyword/Pattern | Activation Rate | Explanation |
|-----------------|----------------|-------------|
| `$state` | 95%+ | Direct match to skill description |
| `SvelteKit` | 90%+ | Framework name = strong signal |
| `runes` | 85%+ | Specific technical term |
| `routing` + `svelte` | 90%+ | Compound match |
| `form` + `validation` | 80%+ | Multi-word overlap |

### Low-Activation Keywords

| Keyword/Pattern | Activation Rate | Explanation |
|-----------------|----------------|-------------|
| "form actions" | ~30% | Svelte-specific term not in descriptions |
| "make reactive" | ~25% | Generic concept, no keyword match |
| "handle input" | ~20% | Too vague for matching |
| "improve performance" | ~10% | No skill keyword overlap |

### The Keyword Threshold

```
                  ┌──────────── 100% forced-eval line ────────────┐
                  │                                                │
Activation  100% ─┤████████████████████████████████████████████████│
Rate         80% ─┤                                                │
             60% ─┤     ┌─── Baseline threshold ───┐              │
             50% ─┤─────│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─│
             40% ─┤     └──────────────────────────┘              │
             20% ─┤                                                │
              0% ─┤────────────────────────────────────────────────│
                  └────────────────────────────────────────────────┘
                  Strong keywords ◀────────────▶ Semantic only
```

Without hooks, activation follows a gradient based on keyword overlap. With forced-eval, the line flattens to 100% (or near it) regardless of keyword density.

---

## 4.5 Variance Analysis

LLM outputs are non-deterministic. Understanding variance is crucial for trusting eval results.

### Run-to-Run Variance

| Config | Min | Max | Range | Std Dev |
|--------|-----|-----|-------|---------|
| none | 50% | 55% | 5% | ~2.5% |
| simple | 50% | 59% | 9% | ~4.5% |
| **forced-eval** | 100% | 100% | 0% | **0%** |
| llm-eval | 100% | 100% | 0% | 0% |
| type-prompt | 41% | 55% | 14% | **~7%** |

### Statistical Significance

With ~50 invocations per config:

| Comparison | Statistically Significant? | Confidence |
|------------|---------------------------|------------|
| none vs forced-eval | ✅ Yes | >99.9% |
| none vs simple | ❌ No | ~60% |
| none vs type-prompt | ❌ No | ~70% |
| forced-eval vs llm-eval (standard) | ❌ No difference | Same (100%) |
| forced-eval vs llm-eval (edge FP) | ✅ Yes | >99% |

### What 3 Runs Tells Us

Three runs per config is enough to:
- Distinguish 100% from ~50% (clear signal)
- Confirm type-prompt isn't useful (high variance, no improvement)
- Identify false positive patterns (consistent across runs)

But NOT enough to:
- Precisely measure baseline (50% ± 5% is wide)
- Compare simple vs none (within noise)
- Determine exact edge case rates for forced-eval

### Recommendation for Future Work

For tighter confidence intervals:
- 10+ runs per config for precise baseline measurement
- 20+ edge case prompts for false positive rates
- Cross-model testing (Sonnet 4, Opus) for generalizability

---

## 4.6 Latency Analysis

Response time impacts developer experience.

| Config | Avg Latency | Overhead vs None | Explanation |
|--------|-------------|------------------|-------------|
| none | 8.7s | — | Baseline |
| simple | 8.6s | -0.1s | Negligible |
| forced-eval | 10.7s | +2.0s | Evaluation step adds time |
| llm-eval | 6.4s | -2.3s | Haiku pre-filters; Claude skips eval |
| type-prompt | 9.6s | +0.9s | Prompt processing overhead |

### The 2-Second Tradeoff

Forced-eval adds ~2 seconds for:
- Writing YES/NO for each skill
- Calling Skill() for matched skills
- Reading skill content before implementing

Is 2 seconds worth 100% reliability? For most use cases, yes. The cost of Claude implementing without skill knowledge (wrong patterns, missing conventions) far exceeds a 2-second wait.

### LLM-Eval's Speed Advantage

LLM-eval is fastest because Haiku pre-classifies in ~1 second, and Claude skips its own evaluation. But the 80% false positive rate means that speed comes at accuracy cost on edge cases.

---

## Key Takeaways

- Hook effectiveness is binary: either 100% (forced-eval, llm-eval) or ~50% (everything else)
- **Forced-eval has zero false positives across all test categories** — the commitment mechanism provides bidirectional restraint
- LLM-eval's 80% false positive rate on non-matching prompts makes it dangerous for general use
- Keyword overlap drives baseline activation — semantic understanding alone isn't sufficient
- Forced-eval's 2-second latency overhead is negligible compared to the reliability gain
- Type-prompt hooks show the highest variance and may actually hurt activation rates
- Three runs per config suffices for clear signals but not precise measurements

## Exercises

### Exercise 4.1: Interpret Results

Given these results for a new hook configuration "structured-remind":

| Run | Standard | Edge (matching) | Edge (non-matching) |
|-----|----------|-----------------|---------------------|
| 1 | 75% | 50% | 10% |
| 2 | 83% | 42% | 15% |
| 3 | 67% | 58% | 5% |

1. Calculate the average activation rate for each category
2. Is this better than baseline? By how much?
3. Is it worth using over forced-eval? Why or why not?
4. What does the variance suggest about the mechanism?

### Exercise 4.2: False Positive Cost Analysis

A project has 5 skills, each with ~500 tokens of content. With LLM-eval's 80% false positive rate:

1. How many skills are falsely activated on average per non-matching prompt?
2. How many extra tokens does this add to Claude's context?
3. At $3/MTok input pricing, what's the extra cost per 1,000 non-matching prompts?
4. Is this cost acceptable? What if skills were 2,000 tokens each?

### Exercise 4.3: Design a Better Edge Case Test

The current edge case set has only 4-5 prompts. Design a more comprehensive edge case suite with:
- 5 semantic-only prompts (related concept, no keywords)
- 5 non-matching prompts (completely unrelated)
- 5 ambiguous prompts (could go either way)

For each, predict the expected behavior of forced-eval and llm-eval.

---

## Next Steps

Continue to [Module 5: Implementation Guide](./05-implementation-guide.en.md) to set up forced-eval in your own Claude Code projects.
