# Pattern: Structured Output Templates

**Difficulty:** Beginner
**Impact:** Medium
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-12-structured-agent-communication)

---

## Problem
Agents pass unstructured text, causing information loss between agents.

## Solution
Define XML or marker-based output templates for each agent role.

## Implementation
```xml
<!-- For search/explore agents -->
<results>
<files>- /absolute/path -- [relevance]</files>
<answer>[Direct answer]</answer>
<next_steps>[What to do next]</next_steps>
</results>
```

```markdown
<!-- For reviewer agents -->
[OKAY / REJECT]
Justification: [reason]
Summary: Clarity, Verifiability, Completeness
```

## Verification
- [ ] Each agent has a defined output format
- [ ] Downstream consumers can reliably parse the format
- [ ] Failure conditions are defined ("FAILED if any path is relative")

## See Also
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-12-structured-agent-communication)
