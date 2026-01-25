---
description: Organize a feature into the right LLM structure (Command, Skill, or Agent)
allowed-tools: Read, Write, Glob
argument-hint: <feature-description>
---

# LLM Structure Organizer

Analyze the feature request and organize it into the appropriate structure type.

## Feature Request

$ARGUMENTS

## Instructions

Load the **meta-structure-organizer** skill from @.claude/skills/meta-structure-organizer/SKILL.md and:

1. **Analyze** the feature request using @.claude/skills/meta-structure-organizer/workflows/analyze.md
2. **Determine** the structure type (Command / Skill / Agent)
3. **Generate** the spec template using @.claude/skills/meta-structure-organizer/workflows/generate-spec.md

## Output Format

```
## 결과: [🤖 AGENT | 📚 SKILL | ⚡ COMMAND]

### 분석
[Feature analysis]

### 근거
[Reasoning based on decision criteria]

### 스펙 템플릿
[Filled spec template]

### 다음 단계
[Link to creation skill based on result]
```

## Next Steps

| Result | Creation Skill | Action |
|--------|----------------|--------|
| ⚡ COMMAND | N/A | Implement directly from spec |
| 📚 SKILL | `.claude/skills/meta-skill-creator/SKILL.md` | 6-phase creation workflow |
| 🤖 AGENT | `.claude/skills/meta-agent-creator/SKILL.md` | 5-phase creation workflow |
