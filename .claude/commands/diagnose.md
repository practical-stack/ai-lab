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

Load the **ComponentArchitect** skill from @.claude/skills/ComponentArchitect/SKILL.md and:

1. **Analyze** the feature request using @.claude/skills/ComponentArchitect/workflows/analyze.md
2. **Diagnose** the component type (Command / Skill / Agent)
3. **Generate** the appropriate spec template using @.claude/skills/ComponentArchitect/workflows/generate-spec.md

## Output Format

```
## 진단 결과: [🤖 AGENT | 📚 SKILL | ⚡ COMMAND]

### 분석
[Feature analysis]

### 근거
[Reasoning based on decision criteria]

### 스펙 템플릿
[Filled spec template]
```
