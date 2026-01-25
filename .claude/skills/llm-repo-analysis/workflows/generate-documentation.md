# Workflow: Generate Documentation

Transform analysis findings into structured documentation.

## Prerequisites

- Completed analysis phases (see [analyze-repository.md](analyze-repository.md))
- Clear topic name for the repository

## Step 1: Create Directory Structure

```bash
# Create base directory
mkdir -p docs/NN-topic-name/{PRACTICAL-GUIDE.patterns,XX-reference}

# Where NN = next available number
# Where XX = appropriate reference number (usually 06)
```

## Step 2: Generate README.md

Template:

```markdown
# [Repository Name] Analysis

**Analyzed:** [Date]  
**Repository:** `[owner/repo]` ([version])  
**Depth Level:** [Quick | Standard | Deep]

---

## The One-Liner

> "[Core philosophy in one sentence]"

---

## How to Read This Analysis

[Learning path diagram]

### Quick Navigation by Goal

| If you want to... | Read this |
|-------------------|-----------|
| Understand the philosophy | [00-core-philosophy.md](./00-core-philosophy.md) |
| See the system architecture | [01-architecture.md](./01-architecture.md) |
| ... | ... |

---

## Document Index

| # | Document | Role | Key Insight |
|---|----------|------|-------------|
| 00 | [Core Philosophy](./00-core-philosophy.md) | WHY | [one-line insight] |
| 01 | [Architecture](./01-architecture.md) | WHAT | [one-line insight] |
| ... | ... | ... | ... |

---

## Three Core Mechanisms (TL;DR)

### 1. [Mechanism 1]
[Brief description]

### 2. [Mechanism 2]
[Brief description]

### 3. [Mechanism 3]
[Brief description]

---

## Source Files Referenced

| Category | Key Files |
|----------|-----------|
| [Category 1] | `path/to/file.md` |
| ... | ... |

---

## Summary

[2-3 sentences summarizing what makes this repository unique and valuable]
```

## Step 3: Generate Each Document

### 00-core-philosophy.md

```markdown
# Core Philosophy

## The One-Liner

> "[Core belief statement]"

## Core Beliefs

| Belief | Evidence | Implication |
|--------|----------|-------------|
| [Belief] | [Quote] | [Impact] |

## Design Principles

### 1. [Principle Name]
[Description with examples]

### 2. [Principle Name]
[Description with examples]

## Philosophy in Practice

| Principle | Implementation | Example |
|-----------|----------------|---------|
| [Principle] | [How it's implemented] | [Code/prompt example] |

## Contrast with Conventional Approaches

| Conventional | This System | Why Different |
|--------------|-------------|---------------|
| [Approach] | [Alternative] | [Reasoning] |
```

### 01-architecture.md

```markdown
# Architecture

## System Overview

```
[ASCII diagram showing layers/components]
```

## Layer Analysis

### [Layer 1 Name]

**Purpose:** [description]

**Components:**
| Component | File | Responsibility |
|-----------|------|----------------|
| [Name] | [Path] | [What it does] |

**Key Patterns:**
- [Pattern 1]
- [Pattern 2]

### [Layer 2 Name]
...

## Data Flow

```
[Request] 
    → [Component 1]
    → [Component 2]
    → [Response]
```

### Detailed Flow

1. **Step 1:** [Description]
2. **Step 2:** [Description]
...

## Integration Points

| Point | Input | Output | Protocol |
|-------|-------|--------|----------|
| [Name] | [What] | [What] | [How] |
```

### 02-design-patterns.md

```markdown
# Design Patterns

## Pattern Catalog

| # | Pattern | Problem | Impact |
|---|---------|---------|--------|
| 1 | [Name] | [Problem] | [High/Med/Low] |
| 2 | [Name] | [Problem] | [High/Med/Low] |

## Pattern Details

### Pattern 1: [Name]

**Problem:** [What problem does this solve?]

**Solution:** [Brief description]

**Implementation:**
```[language]
[Code or prompt example]
```

**When to Use:**
- [Condition 1]
- [Condition 2]

**Related Patterns:** [Links to related patterns]

---

### Pattern 2: [Name]
...
```

### 03-anti-patterns.md

```markdown
# Anti-Patterns

## Anti-Pattern Catalog

| # | Anti-Pattern | Severity | Prevention |
|---|--------------|----------|------------|
| 1 | [Name] | Critical/High/Medium | [How prevented] |

## Critical Anti-Patterns

### [Anti-Pattern Name]

**What It Is:**
[Description of the problematic behavior]

**Why It's Bad:**
[Consequences]

**How to Avoid:**
[Prevention strategy]

**Enforcement:**
[How the system enforces this]

**Example:**
```
BAD:
[Example of anti-pattern]

GOOD:
[Correct alternative]
```
```

### 04-prompt-engineering.md

```markdown
# Prompt Engineering Techniques

## Technique Catalog

| Technique | Purpose | Example |
|-----------|---------|---------|
| [Name] | [Purpose] | [Brief example] |

## Detailed Techniques

### [Technique Name]

**Purpose:** [What it achieves]

**How It Works:**
[Explanation]

**Example from Repository:**
```markdown
[Actual example from the analyzed repo]
```

**When to Use:**
- [Scenario 1]
- [Scenario 2]

**Implementation Template:**
```markdown
[Reusable template]
```
```

### 05-eval-methodology.md

```markdown
# Evaluation Methodology

## Verification Systems

| System | Purpose | Trigger |
|--------|---------|---------|
| [Name] | [What it verifies] | [When it runs] |

## System Details

### [System Name]

**Purpose:** [What problem it solves]

**How It Works:**
1. [Step 1]
2. [Step 2]
...

**Implementation:**
```[language]
[Code example]
```

**Failure Behavior:**
[What happens when verification fails]
```

## Step 4: Generate PRACTICAL-GUIDE.md

See [output-templates.md](../references/output-templates.md) for the full template.

Key sections:
1. Overview
2. Adoption Path (Level 1/2/3)
3. Decision Framework
4. Quick Start
5. Pattern Index

## Step 5: Generate Pattern Guides

For each pattern in PRACTICAL-GUIDE.md, create:

`PRACTICAL-GUIDE.patterns/NN-pattern-name.md`

```markdown
# Pattern: [Name]

**Difficulty:** [Beginner | Intermediate | Advanced]  
**Effort:** [X hours/days]  
**Impact:** [High | Medium | Low]

---

## Problem

[What problem does this pattern solve?]

## Solution

[Overview of the solution]

## Implementation

### Step 1: [Step Name]

[Instructions]

```[language]
[Code/prompt example]
```

### Step 2: [Step Name]
...

## Verification

- [ ] [Checklist item 1]
- [ ] [Checklist item 2]

## Common Mistakes

| Mistake | Why Wrong | Correct Approach |
|---------|-----------|------------------|
| [Mistake] | [Reason] | [Fix] |

## See Also

- [Related Pattern 1](./NN-related-pattern.md)
- [Source Document](../0X-source.md)
```

## Step 6: Final Review

Checklist before completion:

- [ ] README.md provides clear navigation
- [ ] All documents follow consistent structure
- [ ] Cross-references work (relative links)
- [ ] PRACTICAL-GUIDE.md synthesizes all insights
- [ ] Pattern guides are actionable
- [ ] Source files are referenced
