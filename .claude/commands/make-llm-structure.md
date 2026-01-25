---
description: Organize a feature into the right LLM structure (Command, Skill, or Agent)
allowed-tools: Read, Write, Glob
argument-hint: <feature-description>
---

# LLM Structure Organizer

Analyze a feature request and organize it into the appropriate structure type (Command, Skill, or Agent).

## Feature Request

$ARGUMENTS

## Prerequisite

If you're extracting a pattern from completed session work, first use the **session-wrapper** skill:

```
Load skill: session-wrapper
```

This helps you formalize your work into a proper feature request.

## Instructions

Load the **meta-structure-organizer** skill from @.claude/skills/meta-structure-organizer/SKILL.md and:

1. **Analyze** the feature request using @.claude/skills/meta-structure-organizer/workflows/analyze.md
2. **Determine** the structure type (Command / Skill / Agent)
3. **Generate** the spec template using @.claude/skills/meta-structure-organizer/workflows/generate-spec.md

## Output Format

```
## 결과: [🤖 AGENT | 📚 SKILL | ⚡ COMMAND]

### 분석
[Feature analysis - core function, trigger, steps, reasoning needs]

### 근거
[Reasoning based on decision criteria from decision-tree.md]

### 왜 다른 타입이 아닌가?
- **왜 Command 아님:** [if not Command]
- **왜 Skill 아님:** [if not Skill]
- **왜 Agent 아님:** [if not Agent]

### 스펙 템플릿
[Filled spec template from templates/]

### 다음 단계
[Specific creation guidance based on result]
```

## Next Steps by Result

| Result | Creation Workflow | Files |
|--------|-------------------|-------|
| ⚡ **COMMAND** | Implement directly from spec | `.claude/commands/{name}.md` |
| 📚 **SKILL** | Load `meta-skill-creator` skill | `.claude/skills/{name}/SKILL.md` |
| 🤖 **AGENT** | Load `meta-agent-creator` skill | `src/agents/{name}.ts` |

### For COMMAND
1. Use the spec template to create `.claude/commands/{name}.md`
2. Test with `/command-name [args]`

### For SKILL
1. Load skill: `meta-skill-creator`
2. Follow 6-phase workflow: UNDERSTAND → PLAN → INITIALIZE → IMPLEMENT → VALIDATE → PACKAGE
3. Create in `.claude/skills/{name}/`

### For AGENT
1. Load skill: `meta-agent-creator`
2. Follow 5-phase workflow: DEFINE PURPOSE → CLASSIFY → DESIGN PROMPT → CONFIGURE → REGISTER & TEST
3. Create in `src/agents/`

## Complete Workflow

The full "session work to reusable structure" workflow:

```
1. Complete session work
       ↓
2. Load skill: session-wrapper
   → Extract and abstract the pattern
   → Output: Feature Request
       ↓
3. /make-llm-structure <feature-request>
   → Diagnose type (Command / Skill / Agent)
   → Generate spec template
       ↓
4. Load appropriate creator skill
   → meta-skill-creator (for Skill)
   → meta-agent-creator (for Agent)
   → Direct implementation (for Command)
       ↓
5. Implement and validate
```
