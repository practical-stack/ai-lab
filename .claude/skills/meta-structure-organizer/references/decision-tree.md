# Decision Tree

Primary decision logic for component type selection using a 2-phase approach.

## Phase 1: Determine Core Type (Skill vs Agent)

```
[Feature Request]
       │
       ▼
┌─────────────────────────────────────┐
│ Q1: Does it require multi-step      │
│ planning with dynamic branching     │
│ or iteration?                       │
│                                     │
│ Examples:                           │
│ • Different paths based on results  │
│ • Retry loops on failure            │
│ • Tool selection based on context   │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ 🤖 AGENT
       │          Autonomous reasoning needed.
       │          Agent plans, selects tools, iterates.
       │
       ▼ NO
┌─────────────────────────────────────┐
│ Q2: Is it domain knowledge/expertise│
│ that agent should auto-load when    │
│ relevant keywords or context appear?│
│                                     │
│ Examples:                           │
│ • Coding style guidelines           │
│ • Framework best practices          │
│ • Domain-specific procedures        │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ 📚 SKILL
       │          Reusable knowledge module.
       │          Agent loads when relevant.
       │
       ▼ NO
┌─────────────────────────────────────┐
│ No separate component needed.       │
│ Embed in existing Agent or Skill.   │
└─────────────────────────────────────┘
```

## Phase 2: Determine if Command Wrapper is Needed

After identifying the core type (Skill or Agent), check if a Command wrapper is justified:

```
[Core Type Identified: Skill or Agent]
       │
       ▼
┌─────────────────────────────────────┐
│ Does it need platform-level         │
│ constraints or explicit human       │
│ entry point?                        │
│                                     │
│ Examples:                           │
│ • Tool sandboxing (allowed-tools)   │
│ • Dangerous/irreversible actions    │
│ • Structured $ARGUMENTS validation  │
│ • Frequent human shortcut           │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ ⚡ COMMAND (wrapper)
       │          Add Command layer over Skill/Agent.
       │          Provides UI entry point + constraints.
       │
       ▼ NO
       Use Skill or Agent directly.
       No Command wrapper needed.
```

## Decision Shortcuts

| Signal | → Result |
|--------|----------|
| "Needs to reason about what to do next" | 🤖 AGENT |
| "Loops until successful" | 🤖 AGENT |
| "Selects different tools based on situation" | 🤖 AGENT |
| "Best practices for X" | 📚 SKILL |
| "How to do X properly" | 📚 SKILL |
| "Guidelines for X" | 📚 SKILL |
| "Needs tool sandboxing (allowed-tools)" | ⚡ COMMAND (wrapper) |
| "Dangerous/irreversible action" | ⚡ COMMAND (wrapper) |
| "Structured arguments with validation" | ⚡ COMMAND (wrapper) |
| "Frequent human shortcut" | ⚡ COMMAND (wrapper) |
