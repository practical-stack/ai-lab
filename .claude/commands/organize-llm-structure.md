---
description: Organize a feature into the right LLM structure (Command, Skill, or Agent)
allowed-tools: Read, Write, Glob
argument-hint: <feature-description>
---

# LLM Structure Organizer

Analyze a feature request and organize it into the appropriate structure type (Command, Skill, or Agent).

## Feature Request

$ARGUMENTS

## Pipeline Overview

This command orchestrates the full structure creation pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│  /create-llm-structure (COMMAND - Orchestrator)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Prerequisite: Feature Request                              │
│  📚 meta-session-wrapper skill (if extracting from session) │
│                                                             │
│  Phase 1: DIAGNOSE                                          │
│  📚 meta-structure-organizer skill                          │
│  Input: Feature Request → Output: Type + Spec               │
│                                                             │
│  Phase 2: CREATE                                            │
│  📚 meta-skill OR meta-agent skill                          │
│  Input: Spec → Output: Implementation                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Instructions

### Prerequisite: Feature Request

If you need to extract a pattern from completed session work first, use the
meta-session-wrapper skill (@.claude/skills/meta-session-wrapper/SKILL.md).
It handles session extraction and outputs a Feature Request.

Skip if you already have a clear feature request.

### Phase 1: DIAGNOSE

1. Read @.claude/skills/meta-structure-organizer/SKILL.md
2. **Analyze** using @.claude/skills/meta-structure-organizer/workflows/analyze.md
3. **Generate spec** using @.claude/skills/meta-structure-organizer/workflows/generate-spec.md

### Phase 2: CREATE

Based on diagnosis result:

| Diagnosis | Skill to Use | Output Location |
|-----------|--------------|-----------------|
| ⚡ **COMMAND** | N/A - implement from spec | `.claude/commands/{name}.md` |
| 📚 **SKILL** | @.claude/skills/meta-skill/SKILL.md | `.claude/skills/{name}/SKILL.md` |
| 🤖 **AGENT** | @.claude/skills/meta-agent/SKILL.md | `src/agents/{name}.ts` |

#### For COMMAND
Implement directly from the generated spec template.

#### For SKILL
1. Read @.claude/skills/meta-skill/SKILL.md
2. Follow 6-phase workflow: UNDERSTAND → PLAN → INITIALIZE → IMPLEMENT → VALIDATE → PACKAGE

#### For AGENT
1. Read @.claude/skills/meta-agent/SKILL.md
2. Follow 5-phase workflow: DEFINE PURPOSE → CLASSIFY → DESIGN PROMPT → CONFIGURE → REGISTER & TEST

## Output Format

```
## 결과: [🤖 AGENT | 📚 SKILL | ⚡ COMMAND]

### 분석
[Feature analysis - core function, trigger, steps, reasoning needs]

### 근거
[Reasoning based on decision criteria]

### 왜 다른 타입이 아닌가?
- **왜 Command 아님:** [if not Command]
- **왜 Skill 아님:** [if not Skill]
- **왜 Agent 아님:** [if not Agent]

### 스펙 템플릿
[Filled spec template]

### 구현 진행
[Implementation based on Phase 3]
```

## Key Principle

**This command owns the pipeline.** Skills provide domain knowledge. While skills can invoke other skills (platform-supported), this command coordinates the multi-skill workflow.

```
⚡ COMMAND: Orchestrates flow, decides what to use when
    ↓
📚 SKILL: Provides domain knowledge (read-only, no side effects)
    ↓
🔧 TOOL: Executes actual operations (file write, etc.)
```
