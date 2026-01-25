# Decision Tree

Primary decision logic for component type selection.

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
│ Q3: Must human explicitly trigger   │
│ this action?                        │
│                                     │
│ Examples:                           │
│ • Deployment to production          │
│ • Dangerous/irreversible actions    │
│ • Specific timing required          │
│ • Authorization needed              │
└─────────────────────────────────────┘
       │
       ├── YES ──▶ ⚡ COMMAND
       │          Human-triggered workflow.
       │          Explicit entry point.
       │
       ▼ NO
┌─────────────────────────────────────┐
│ No separate component needed.       │
│ Embed in existing Agent or Command. │
└─────────────────────────────────────┘
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
| "User must approve/trigger" | ⚡ COMMAND |
| "Run only when explicitly asked" | ⚡ COMMAND |
| "Dangerous side effects" | ⚡ COMMAND |
