# Pattern 04: XML Tag Structure

**Effort:** 30 minutes | **Impact:** Medium | **Level:** Quick Win  
**Source:** [04-prompt-engineering.md](../04-prompt-engineering.md)

---

## The Problem

Prompts are hard for AI to parse and prioritize without clear structure. Text blends together, priority is unclear.

---

## The Solution

Use XML tags to create semantic sections that help AI understand structure and priority.

---

## Standard Tags

| Tag | Purpose | Behavioral Effect |
|-----|---------|-------------------|
| `<Role>` | Agent identity | Defines personality, operating mode |
| `<Behavior_Instructions>` | How to act | Main behavioral guidelines |
| `<Constraints>` | Hard rules | Non-negotiable restrictions |
| `<critical_warning>` | Absolute rules | Treated as failure conditions |
| `<Available_Agents>` | Delegation targets | Know what can be delegated |
| `<Available_Skills>` | Knowledge base | Know what expertise exists |
| `<Available_Categories>` | Task routing | Know model options |

---

## Implementation Template

```xml
<Role>
You are "[Agent Name]" - [Brief description].

**Identity**: [Persona description]

**Core Competencies**:
- [Competency 1]
- [Competency 2]
- [Competency 3]
</Role>

<Behavior_Instructions>
## Phase 1: [Phase Name]

[Instructions...]

## Phase 2: [Phase Name]

[Instructions...]
</Behavior_Instructions>

<Constraints>
## Hard Blocks (NEVER violate)

| Constraint | No Exceptions |
|------------|---------------|
| [Constraint 1] | Never |
| [Constraint 2] | Never |

## Soft Guidelines

- [Guideline 1]
- [Guideline 2]
</Constraints>

<critical_warning>
NEVER use `as any` or `@ts-ignore`.
Type safety is non-negotiable.
If you violate this, the entire task fails.
</critical_warning>

<Available_Agents>
| Agent | Purpose | When to Use |
|-------|---------|-------------|
| explore | Fast code search | Find patterns in codebase |
| librarian | Documentation | External docs, OSS examples |
| oracle | Strategic advice | Complex decisions, debugging |
</Available_Agents>

<Available_Skills>
- git-master: Git operations, atomic commits
- playwright: Browser automation
- frontend-ui-ux: UI/UX implementation
</Available_Skills>
```

---

## Real Example: Role Definition

```xml
<Role>
You are "Sisyphus" - Powerful AI Agent with orchestration capabilities.

**Why Sisyphus?**: Humans roll their boulder every day. So do you. 
We're not so different—your code should be indistinguishable from a senior engineer's.

**Identity**: SF Bay Area engineer. Work, delegate, verify, ship. No AI slop.

**Core Competencies**:
- Parsing implicit requirements from explicit requests
- Adapting to codebase maturity (disciplined vs chaotic)
- Delegating specialized work to the right subagents
- Parallel execution for maximum throughput
</Role>
```

---

## Real Example: Critical Warning

```xml
<critical_warning>
NEVER use `as any`, `@ts-ignore`, or `@ts-expect-error`.
Type safety is non-negotiable. If you violate this, the entire task fails.

NEVER commit without explicit user request.
NEVER claim "done" without verification evidence.
</critical_warning>
```

---

## Phase Tags for BLOCKING

```xml
<style_detection>
**THIS PHASE HAS MANDATORY OUTPUT**

### 1.3 MANDATORY OUTPUT (BLOCKING)

**You MUST output this block before proceeding. NO EXCEPTIONS.**

```
STYLE DETECTION RESULT
======================
[template]
```

**IF YOU SKIP THIS OUTPUT, YOUR WORK WILL BE WRONG. STOP AND REDO.**
</style_detection>
```

---

## Why This Works

1. **Visual Separation**: Tags create clear boundaries between sections
2. **Priority Signaling**: `<critical_warning>` treated more seriously than regular text
3. **Parseability**: AI can identify and extract specific sections
4. **Nesting**: Allows hierarchical instruction structures
5. **Consistency**: Same format across all prompts

---

## Nesting Example

```xml
<Behavior_Instructions>
## Phase 1: Analysis

<analysis_phase>
### 1.1 Read Context
[instructions]

### 1.2 MANDATORY OUTPUT (BLOCKING)
[template]
</analysis_phase>

## Phase 2: Execution

<execution_phase>
### 2.1 Implement
[instructions]

### 2.2 Verify
[instructions]
</execution_phase>
</Behavior_Instructions>
```

---

## Adoption Checklist

- [ ] Identify main sections of your prompt
- [ ] Wrap each section in appropriate XML tags
- [ ] Use `<Role>` for agent identity
- [ ] Use `<Behavior_Instructions>` for main workflow
- [ ] Use `<Constraints>` for rules
- [ ] Use `<critical_warning>` for absolute rules
- [ ] Test that AI respects section boundaries

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Too many tag types | Stick to standard tags |
| Tags without clear purpose | Each tag should have semantic meaning |
| Inconsistent tag names | Use consistent naming across prompts |
| No closing tags | Always close XML tags properly |

---

## See Also

- [01-blocking-checkpoints.md](./01-blocking-checkpoints.md) - Using phase tags
- [08-skill-format.md](./08-skill-format.md) - XML wrapping in skills
- [../04-prompt-engineering.md](../04-prompt-engineering.md) - Full prompt engineering
