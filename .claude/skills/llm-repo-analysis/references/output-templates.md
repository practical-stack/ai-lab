# Output Templates

Complete templates for each output document.

---

## README.md Template

```markdown
# [Repository Name] Analysis

**Analyzed:** [YYYY-MM-DD]  
**Repository:** `[owner/repo]` ([version/tag])  
**Depth Level:** [Quick | Standard | Deep]

---

## The One-Liner

> "[Single sentence capturing the core philosophy]"

---

## How to Read This Analysis

This analysis is designed for **progressive learning**:

### Learning Path

```
START HERE
    ↓
[00-core-philosophy]     ← WHY: The beliefs that drive everything
    ↓
[01-architecture]        ← WHAT: How the system is structured
    ↓
[02-design-patterns]     ← HOW: Patterns to implement yourself
    ↓
[03-anti-patterns]       ← AVOID: What NOT to do
    ↓
[04-prompt-engineering]  ← CRAFT: Prompt techniques in detail
    ↓
[05-eval-methodology]    ← VERIFY: Testing and verification methods
    ↓
[06-reference]           ← REFERENCE: Detailed examples
    ↓
[PRACTICAL-GUIDE]        ← APPLY: Synthesis of all patterns
```

### Quick Navigation by Goal

| If you want to... | Read this |
|-------------------|-----------|
| Understand the philosophy | [00-core-philosophy.md](./00-core-philosophy.md) |
| See the system architecture | [01-architecture.md](./01-architecture.md) |
| Learn reusable patterns | [02-design-patterns.md](./02-design-patterns.md) |
| Know what NOT to do | [03-anti-patterns.md](./03-anti-patterns.md) |
| Master prompt engineering | [04-prompt-engineering.md](./04-prompt-engineering.md) |
| Implement verification | [05-eval-methodology.md](./05-eval-methodology.md) |
| See concrete examples | [06-reference/](./06-reference/) |
| Apply patterns | [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) |

---

## Document Index

| # | Document | Role | Key Insight |
|---|----------|------|-------------|
| 00 | [Core Philosophy](./00-core-philosophy.md) | WHY | [insight] |
| 01 | [Architecture](./01-architecture.md) | WHAT | [insight] |
| 02 | [Design Patterns](./02-design-patterns.md) | HOW | [insight] |
| 03 | [Anti-Patterns](./03-anti-patterns.md) | AVOID | [insight] |
| 04 | [Prompt Engineering](./04-prompt-engineering.md) | CRAFT | [insight] |
| 05 | [Evaluation Methodology](./05-eval-methodology.md) | VERIFY | [insight] |
| 06 | [Reference](./06-reference/) | REFERENCE | [insight] |
| - | [Practical Guide](./PRACTICAL-GUIDE.md) | APPLY | [insight] |

---

## Core Mechanisms (TL;DR)

If you only remember three things:

### 1. [Mechanism 1 Name]
[Brief description of the most important mechanism]

### 2. [Mechanism 2 Name]
[Brief description]

### 3. [Mechanism 3 Name]
[Brief description]

**For implementation details, see [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md).**

---

## Source Files Referenced

| Category | Key Files |
|----------|-----------|
| [Category] | `path/to/file` |
| ... | ... |

---

## Summary

[2-3 sentences: What makes this repository unique? What's the core insight? Who should read this?]

Start with [00-core-philosophy.md](./00-core-philosophy.md) to understand the "why", then progress through the documents to learn the "how", and finally use [PRACTICAL-GUIDE.md](./PRACTICAL-GUIDE.md) to apply the patterns.
```

---

## PRACTICAL-GUIDE.md Template

```markdown
# Practical Guide: Applying [Repository Name] Patterns

**Document:** PRACTICAL-GUIDE.md  
**Part of:** [Repository Name] Analysis  
**Purpose:** Complete synthesis of all patterns into actionable adoption steps

---

## Overview

This guide synthesizes insights from ALL analysis documents into actionable steps. Read the numbered documents (00-06) first to understand the "why", then use this guide for the "how".

**Prerequisite Reading:**
- [00-core-philosophy.md](./00-core-philosophy.md) - WHY these patterns exist
- [01-architecture.md](./01-architecture.md) - WHAT the system looks like  
- [02-design-patterns.md](./02-design-patterns.md) - HOW patterns work

---

## Adoption Path

### Level 1: Quick Wins ([time estimate])

Start here. Immediate impact with minimal effort.

| Pattern | Effort | Impact | Guide |
|---------|--------|--------|-------|
| [Pattern 1] | [time] | [High/Med/Low] | [link] |
| [Pattern 2] | [time] | [High/Med/Low] | [link] |
| [Pattern 3] | [time] | [High/Med/Low] | [link] |

### Level 2: Foundation ([time estimate])

Build the infrastructure for reliable operations.

| Pattern | Effort | Impact | Guide |
|---------|--------|--------|-------|
| [Pattern 4] | [time] | [High/Med/Low] | [link] |
| [Pattern 5] | [time] | [High/Med/Low] | [link] |
| ... | ... | ... | ... |

### Level 3: Full System ([time estimate])

Complete the system with advanced patterns.

| Pattern | Effort | Impact | Guide |
|---------|--------|--------|-------|
| [Pattern N] | [time] | [High/Med/Low] | [link] |
| ... | ... | ... | ... |

---

## Decision Framework

When you encounter a problem, use this table:

| Problem | Pattern |
|---------|---------|
| [Problem 1] | [Pattern link] |
| [Problem 2] | [Pattern link] |
| ... | ... |

---

## Quick Start: Minimal Viable Adoption

If you only have 30 minutes:

### 1. [First Quick Win] (N min)

```markdown
[Minimal implementation example]
```

### 2. [Second Quick Win] (N min)

```markdown
[Minimal implementation example]
```

### 3. [Third Quick Win] (N min)

```markdown
[Minimal implementation example]
```

**These changes will transform your quality immediately.**

---

## Summary: The 80/20 Rule

| Priority | Patterns | Total Impact |
|----------|----------|--------------|
| **Do First** | [List] | [Expected outcome] |
| **Do Second** | [List] | [Expected outcome] |
| **Full Adoption** | [List] | [Expected outcome] |

---

## Pattern Index

For detailed implementation of each pattern, see [PRACTICAL-GUIDE.patterns/](./PRACTICAL-GUIDE.patterns/).

---

## See Also

- [README.md](./README.md) - Analysis overview
- [00-core-philosophy.md](./00-core-philosophy.md) - Philosophy behind patterns
- [01-architecture.md](./01-architecture.md) - System architecture
```

---

## Pattern Guide Template (PRACTICAL-GUIDE.patterns/NN-pattern-name.md)

```markdown
# Pattern: [Pattern Name]

**Difficulty:** [Beginner | Intermediate | Advanced]  
**Effort:** [X hours/days]  
**Impact:** [High | Medium | Low]  
**Source:** [Link to source document]

---

## Problem

[Clear description of what problem this pattern solves]

## Solution

[Overview of the solution approach]

---

## Implementation

### Step 1: [Step Name]

[Description]

```[language]
[Code or prompt example]
```

### Step 2: [Step Name]

[Description]

```[language]
[Code or prompt example]
```

### Step 3: [Step Name]

[Description]

---

## Complete Example

```[language]
[Full working example]
```

---

## Verification

Checklist to confirm correct implementation:

- [ ] [Verification item 1]
- [ ] [Verification item 2]
- [ ] [Verification item 3]

---

## Common Mistakes

| Mistake | Why Wrong | Correct Approach |
|---------|-----------|------------------|
| [Mistake 1] | [Reason] | [Fix] |
| [Mistake 2] | [Reason] | [Fix] |

---

## Variations

| Variation | When to Use | Difference |
|-----------|-------------|------------|
| [Variation 1] | [Scenario] | [How it differs] |

---

## See Also

- [Related Pattern 1](./NN-related-pattern.md)
- [Source Document](../0X-source.md)
- [External Reference](URL)
```

---

## Directory Structure Template

```
docs/NN-topic-name/
├── README.md                       # Overview + navigation
├── 00-core-philosophy.md           # WHY
├── 01-architecture.md              # WHAT
├── 02-design-patterns.md           # HOW
├── 03-anti-patterns.md             # AVOID
├── 04-prompt-engineering.md        # CRAFT
├── 05-eval-methodology.md          # VERIFY
├── 06-reference/                   # REFERENCE
│   ├── README.md
│   ├── category-1/
│   │   ├── example-1.md
│   │   └── example-2.md
│   └── category-2/
│       └── example-3.md
├── PRACTICAL-GUIDE.md              # APPLY (synthesis)
└── PRACTICAL-GUIDE.patterns/       # IMPLEMENT
    ├── README.md
    ├── 01-pattern-name.md
    ├── 02-pattern-name.md
    └── ...
```
