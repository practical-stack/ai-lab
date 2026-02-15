---
title: "The Eval Harness"
description: "Building reproducible LLM evaluations with Daytona sandboxes, TypeScript orchestration, and JSONL stream parsing"
type: tutorial
tags: [AI, Testing, TypeScript]
order: 3
depends_on: [./02-hook-configurations.en.md]
related: [./03-eval-harness.ko.md, ./04-results-analysis.en.md]
---

# Module 3: The Eval Harness

> Build a reproducible pipeline for testing LLM behavior in isolated sandboxes

## Learning Objectives

After completing this module, you will:
- Design an evaluation harness architecture for LLM behavior testing
- Use Daytona sandboxes for isolated, reproducible test environments
- Parse JSONL stream output from `claude -p` to detect tool_use events
- Implement a monitor script pattern for controlling Claude's runtime behavior
- Optimize evaluation runs with timeout and flag-based early termination

---

## 3.1 Why Sandboxed Evals?

Testing LLM behavior on your local machine is unreliable because:

| Problem | Impact |
|---------|--------|
| **State leakage** | Previous runs affect subsequent behavior |
| **Environment drift** | System-level changes alter results |
| **Non-reproducibility** | Can't share or verify results |
| **Risk** | Claude could modify your actual project files |

### The Sandbox Solution

Each evaluation run gets a **fresh, isolated Daytona sandbox** with:
- Clean file system (skills and hooks copied fresh)
- No state from previous runs
- Consistent environment (same OS, packages, CLI version)
- Safe execution (can't affect host machine)

```
┌─────────────────────────────────────┐
│  Orchestrator (local machine)       │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Sandbox 1 │  │ Sandbox 2 │  ...  │
│  │ Config: A │  │ Config: B │       │
│  │ Prompt: 1 │  │ Prompt: 1 │       │
│  └──────────┘  └──────────┘        │
│                                     │
│  Results → JSONL → Parse → Compare  │
└─────────────────────────────────────┘
```

---

## 3.2 Architecture Overview

The eval harness has four components:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Orchestrator │────▶│   Sandbox   │────▶│ Claude CLI   │────▶│   Parser    │
│ (TypeScript) │     │  (Daytona)  │     │ (claude -p)  │     │  (JSONL)    │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │                     │
       │  Creates sandbox  │  Runs claude -p    │  Streams JSONL      │
       │  Copies files     │  With hook config  │  tool_use events    │
       │  Triggers run     │  Sets timeout      │  Skill activations  │
       └──────────────────▶└───────────────────▶└────────────────────▶│
                                                                      │
                                                              Results collection
```

### Component Responsibilities

| Component | Role | Technology |
|-----------|------|------------|
| **Orchestrator** | Creates sandboxes, copies configs, runs prompts, collects results | TypeScript + `@daytonaio/sdk` |
| **Sandbox** | Isolated environment with Claude CLI and project files | Daytona |
| **Claude CLI** | Processes prompt with configured hooks and skills | `claude -p` |
| **Parser** | Extracts tool_use events from JSONL stream output | Line-by-line JSON parse |

---

## 3.3 The Orchestrator

The orchestrator manages the full lifecycle of each evaluation run.

### Core Loop

```typescript
import { Daytona } from '@daytonaio/sdk';

interface EvalConfig {
  hookType: 'none' | 'simple' | 'forced-eval' | 'llm-eval' | 'type-prompt';
  prompts: string[];
  skills: string[];
  runs: number;
}

async function runEvaluation(config: EvalConfig) {
  const daytona = new Daytona();
  const results: EvalResult[] = [];

  for (const prompt of config.prompts) {
    for (let run = 0; run < config.runs; run++) {
      // 1. Create fresh sandbox
      const sandbox = await daytona.create();

      // 2. Copy skills and hook config
      await copySkills(sandbox, config.skills);
      await copyHookConfig(sandbox, config.hookType);

      // 3. Run claude -p with JSONL output
      const output = await runClaude(sandbox, prompt);

      // 4. Parse results
      const result = parseJSONL(output);
      results.push(result);

      // 5. Cleanup
      await sandbox.delete();
    }
  }

  return results;
}
```

### File Setup Per Sandbox

Each sandbox is initialized with:

```
sandbox/
├── .claude/
│   ├── settings.json          # Hook configuration
│   ├── hooks/
│   │   └── force-eval.sh      # Hook script (if applicable)
│   └── skills/
│       ├── skill-1/SKILL.md
│       ├── skill-2/SKILL.md
│       └── skill-3/SKILL.md
├── src/                       # Minimal project structure
│   └── routes/
│       └── +page.svelte
└── monitor.sh                 # Runtime monitor (optional)
```

---

## 3.4 Claude CLI Invocation

The critical command that runs Claude in each sandbox:

```bash
claude -p "$PROMPT" \
  --output-format stream-json \
  --max-turns 1 \
  --allowedTools "Skill"
```

### Flag Breakdown

| Flag | Purpose | Why |
|------|---------|-----|
| `-p` | Pipe mode (non-interactive) | Enables scripted execution |
| `--output-format stream-json` | JSONL output | Machine-parseable events |
| `--max-turns 1` | Single turn only | Prevents multi-turn complexity |
| `--allowedTools "Skill"` | Restrict to Skill tool | Isolates what we're measuring |

### Why `--allowedTools "Skill"`

By restricting Claude to only the `Skill` tool, we:
1. Prevent file writes that could affect subsequent behavior
2. Isolate the measurement to skill activation only
3. Make parsing simpler (only looking for Skill tool_use events)
4. Reduce execution time (Claude can't go down implementation rabbit holes)

### Timeout: The 20-Second Optimization

```typescript
const TIMEOUT_MS = 20_000; // 20 seconds

async function runClaude(sandbox: Sandbox, prompt: string): Promise<string> {
  const proc = sandbox.exec(
    `claude -p "${prompt}" --output-format stream-json --max-turns 1 --allowedTools "Skill"`,
    { timeout: TIMEOUT_MS }
  );

  return proc.stdout;
}
```

Why 20 seconds? Analysis of run times showed:
- Skill activation decisions happen within 5-10 seconds
- Implementation (which we don't need) takes 10-30+ seconds
- 20s captures all activation events while cutting off unnecessary work
- Cost reduction: shorter runs = fewer tokens = lower cost

---

## 3.5 The Monitor Script

An optional but powerful component that provides runtime control:

```bash
#!/bin/bash
# monitor.sh - Runtime behavior control

FLAG_FILE="/tmp/eval-complete"

# Watch for Skill() activation
tail -f /tmp/claude-output.jsonl | while read line; do
  if echo "$line" | jq -e '.type == "content_block_start" and
    .content_block.type == "tool_use" and
    .content_block.name == "Skill"' > /dev/null 2>&1; then

    echo "SKILL_ACTIVATED: $(echo $line | jq -r '.content_block.input.skill_name')"
    touch "$FLAG_FILE"
  fi
done &

# Timeout watchdog
sleep 20 && kill -TERM $CLAUDE_PID 2>/dev/null &
```

### Monitor Flags

| Flag | Purpose |
|------|---------|
| `SKILL_ACTIVATED` | Logged when any Skill() call detected |
| `/tmp/eval-complete` | Created when activation detected (for early termination) |
| Timeout watchdog | Kills Claude process after 20s regardless |

### Why a Monitor?

The monitor enables:
1. **Early termination**: Once skill activation is detected, no need to wait for full response
2. **Real-time logging**: See activation events as they happen
3. **Failure detection**: Timeout without flag file = no activation

---

## 3.6 JSONL Parsing

The `--output-format stream-json` flag produces JSONL (one JSON object per line):

### Event Types

```jsonl
{"type":"message_start","message":{"id":"msg_xxx","model":"claude-sonnet-4-5-20250514"}}
{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}
{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"I'll "}}
{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"toolu_xxx","name":"Skill","input":{}}}
{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\"skill_name\":"}}
{"type":"content_block_stop","index":1}
{"type":"message_stop"}
```

### What We're Looking For

The key event is `content_block_start` with `type: "tool_use"` and `name: "Skill"`:

```typescript
interface ToolUseEvent {
  type: 'content_block_start';
  content_block: {
    type: 'tool_use';
    name: string;      // "Skill" is what we want
    input: {
      skill_name: string;  // Which skill was activated
    };
  };
}

function detectSkillActivation(jsonlOutput: string): ActivationResult {
  const lines = jsonlOutput.split('\n').filter(Boolean);
  const activations: string[] = [];

  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      if (
        event.type === 'content_block_start' &&
        event.content_block?.type === 'tool_use' &&
        event.content_block?.name === 'Skill'
      ) {
        activations.push(event.content_block.input?.skill_name || 'unknown');
      }
    } catch {
      // Skip malformed lines
    }
  }

  return {
    activated: activations.length > 0,
    skills: activations,
    totalEvents: lines.length,
  };
}
```

### Parsing Gotchas

| Issue | Solution |
|-------|----------|
| Partial JSON in `input_json_delta` | Only check `content_block_start`, not deltas |
| Multi-skill activation | Collect all tool_use events, not just first |
| Malformed lines at timeout | Wrap parse in try-catch, skip bad lines |
| Large output files | Stream-parse line by line, don't load entire file |

---

## 3.7 Cost and Scale

The complete evaluation across all configurations:

| Metric | Value |
|--------|-------|
| Total invocations | ~250 |
| Total cost | $5.59 |
| Cost per invocation | ~$0.02 |
| Average run time | 8-11s |
| Total wall time | ~45 minutes |

### Cost Breakdown by Config

| Config | Invocations | Est. Cost |
|--------|------------|-----------|
| none | ~50 | ~$1.00 |
| simple | ~50 | ~$1.00 |
| forced-eval | ~50 | ~$1.20 |
| llm-eval | ~50 | ~$1.19 (+Haiku) |
| type-prompt | ~50 | ~$1.20 |

### Cost Optimization Tips

1. **Use `--max-turns 1`**: Prevents multi-turn cost multiplication
2. **Use `--allowedTools`**: Restricts expensive tool calls
3. **20s timeout**: Cuts off expensive generation after activation detected
4. **Haiku for pre-classification**: Cheaper than Sonnet for simple tasks
5. **Batch by config**: Run all prompts per config to minimize sandbox overhead

---

## Key Takeaways

- Sandboxed environments (Daytona) are essential for reproducible LLM evals — state leakage invalidates results
- The harness follows a simple pattern: create sandbox → copy files → run CLI → parse output → collect results
- `claude -p --output-format stream-json` produces JSONL with machine-parseable tool_use events
- `--max-turns 1` and `--allowedTools "Skill"` isolate the measurement to skill activation only
- The 20-second timeout optimizes cost while capturing all activation decisions
- Monitor scripts enable real-time detection and early termination
- Full evaluation cost: $5.59 for ~250 invocations — LLM evals can be inexpensive

## Exercises

### Exercise 3.1: Design an Eval Matrix

You want to test 3 hook configurations against 8 prompts with 3 runs each. Calculate:
1. Total number of sandbox invocations needed
2. Estimated cost at $0.02/invocation
3. Estimated wall time at 10s/invocation (sequential)
4. How would you parallelize to reduce wall time?

### Exercise 3.2: Write a JSONL Parser

Given this JSONL output, write a function to extract all skill activations:

```jsonl
{"type":"message_start","message":{"id":"msg_01"}}
{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}
{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","name":"Skill","input":{"skill_name":"svelte-routing"}}}
{"type":"content_block_stop","index":1}
{"type":"content_block_start","index":2,"content_block":{"type":"tool_use","name":"Skill","input":{"skill_name":"svelte-forms"}}}
{"type":"content_block_stop","index":2}
{"type":"message_stop"}
```

Expected output: `["svelte-routing", "svelte-forms"]`

### Exercise 3.3: Spot the Bug

This orchestrator code has a bug that would invalidate results. Find it:

```typescript
const sandbox = await daytona.create();

for (const config of configs) {
  await copyHookConfig(sandbox, config);
  for (const prompt of prompts) {
    const result = await runClaude(sandbox, prompt);
    results.push(result);
  }
}

await sandbox.delete();
```

Hint: Think about state leakage between configs.

---

## Next Steps

Continue to [Module 4: Results & Analysis](./04-results-analysis.en.md) to see how the harness data reveals patterns across configurations.
