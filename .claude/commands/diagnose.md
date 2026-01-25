---
description: Diagnose whether a feature should be Command, Skill, or Agent
allowed-tools: Read, Write, Glob
argument-hint: <feature-description>
---

# Component Type Diagnosis

Analyze the following feature request and diagnose the appropriate component type.

## Feature Request

$ARGUMENTS

## Instructions

Load the **component-architect** skill from @.claude/skills/component-architect/SKILL.md and:

1. **Analyze** the feature request using @.claude/skills/component-architect/workflows/analyze.md
2. **Diagnose** the component type (Command / Skill / Agent)
3. **Generate** the appropriate spec template using @.claude/skills/component-architect/workflows/generate-spec.md

## Output Format

```
## 진단 결과: [🤖 AGENT | 📚 SKILL | ⚡ COMMAND]

### 분석
[Feature analysis]

### 근거
[Reasoning based on decision criteria]

### 스펙 템플릿
[Filled spec template]

### 다음 단계
[Link to creation skill based on diagnosis]
```

## Next Steps by Diagnosis

After generating the spec template, guide the user to the appropriate creation skill:

| Diagnosis | Creation Skill | Action |
|-----------|----------------|--------|
| ⚡ COMMAND | N/A | Spec template is sufficient; implement directly |
| 📚 SKILL | `.claude/skills/meta-skill-creator/SKILL.md` | Load for 6-phase skill creation workflow |
| 🤖 AGENT | `.claude/skills/meta-agent-creator/SKILL.md` | Load for 5-phase agent creation workflow |
