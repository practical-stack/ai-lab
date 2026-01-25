# Workflow: Analyze Feature Request

When analyzing a feature request, extract and evaluate these aspects:

## Step 1: Extract Core Information

| Aspect | Question | Extract |
|--------|----------|---------|
| **Core Function** | What does it do? | [description] |
| **Trigger** | Who/what initiates it? | Human / Agent / System |
| **Steps** | Single or multi-step? | Single / Multi with branching |
| **Reasoning** | Does it need LLM judgment? | Yes / No |
| **Reusability** | Used in multiple contexts? | Yes / No |
| **Side Effects** | Write/Delete/Deploy/External? | Yes / No |
| **Domain Knowledge** | Encodes "how to do X"? | Yes / No |
| **Multiple Domains** | Needs expertise in 2+ areas? | Yes / No |

## Step 2: Apply Decision Tree

Load [decision-tree.md](../references/decision-tree.md) and follow the logic:

```
[Feature Request]
       │
       ▼
Q1: Multi-step planning with dynamic branching/iteration?
       │
       ├── YES ──▶ 🤖 AGENT
       │
       ▼ NO
Q2: Domain knowledge agent should auto-load when relevant?
       │
       ├── YES ──▶ 📚 SKILL
       │
       ▼ NO
Q3: Must human explicitly trigger it?
       │
       ├── YES ──▶ ⚡ COMMAND
       │
       ▼ NO
       → Embed in existing component
```

## Step 3: Validate Against Criteria

Load [criteria.md](../references/criteria.md) and score:

| Criteria | Command | Skill | Agent | This Feature |
|----------|---------|-------|-------|--------------|
| Multi-step planning | No | No | Yes | ? |
| Dynamic branching | No | No | Yes | ? |
| LLM reasoning | No | No | Yes | ? |
| Auto-load on context | No | Yes | No | ? |
| Reusable knowledge | Maybe | Yes | No | ? |
| Human must trigger | Yes | No | Maybe | ? |
| Side effects | Yes | No | Maybe | ? |

## Step 4: Check Boundary Cases

Load [boundary-cases.md](../references/boundary-cases.md) and verify:

- Does this match any common confusion patterns?
- Apply the clarification from boundary cases

## Step 5: Evaluate Combination Need

Load [combination-patterns.md](../references/combination-patterns.md) and check:

| Question | If Yes |
|----------|--------|
| Needs domain knowledge + multi-step planning + human trigger? | → Full Stack |
| Needs domain knowledge + multi-step planning? | → Agent + Skills |
| Needs domain knowledge + human trigger? | → Command + Skills |
| Needs multi-step planning + human trigger? | → Command + Agent |
| Single aspect only? | → Single component |

**Most features need combinations.** Default to combination thinking, not single-type.

## Step 6: Output Diagnosis

### Single Component Output

```markdown
## 진단 결과

### Primary Component: [🤖 AGENT | 📚 SKILL | ⚡ COMMAND]

### 분석
- **핵심 기능:** [what it does]
- **트리거:** [who initiates]
- **단계:** [single/multi]
- **추론 필요:** [yes/no]
- **재사용성:** [yes/no]
- **도메인 지식:** [yes/no]

### 근거
1. [Reason 1 based on decision tree]
2. [Reason 2 based on criteria]
3. [Reason 3 if applicable]

### 왜 다른 타입이 아닌가?
- **왜 Command 아님:** [if not Command]
- **왜 Skill 아님:** [if not Skill]
- **왜 Agent 아님:** [if not Agent]
```

### Combination Output (when multiple components needed)

If Step 5 identified a combination pattern, add:

```markdown
## Recommended Combination

### Architecture
```
⚡ COMMAND: /command-name (Entry Point)
    ↓
🤖 AGENT: agent-name (Orchestration)
    ↓
📚 SKILL: skill-1 (Domain 1)
📚 SKILL: skill-2 (Domain 2)
    ↓
🔧 TOOL: tool-1, tool-2 (Execution)
```

### Component Summary

| Component | Name | Purpose |
|-----------|------|---------|
| Command | /command-name | User entry point |
| Agent | agent-name | Reasoning & orchestration |
| Skill | skill-1 | Domain expertise 1 |
| Skill | skill-2 | Domain expertise 2 |

### Why This Combination?
1. **Command needed because:** [human trigger required / not required]
2. **Agent needed because:** [multi-step planning / not needed]
3. **Skills needed because:** [domain expertise required / specific domains]
```

For detailed patterns, see [combination-patterns.md](../references/combination-patterns.md).
