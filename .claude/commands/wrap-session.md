---
description: Extract reusable pattern from completed session work
allowed-tools: Read, Write, Glob, TodoRead
argument-hint: "[session-description]"
---

# Wrap Session

Extract and formalize completed session work into a reusable Feature Request.

## Arguments

$ARGUMENTS

- **session-description** (optional): Brief description of completed work to wrap

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│  /wrap-session (COMMAND - Orchestrator)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Phase 1: IDENTIFY                                          │
│  📚 meta-session-wrapper skill                              │
│  Input: Session history → Output: Work Summary              │
│                                                             │
│  Phase 2: ABSTRACT                                          │
│  📚 meta-session-wrapper skill                              │
│  Input: Work Summary → Output: Generic Pattern              │
│                                                             │
│  Phase 3: FORMALIZE                                         │
│  📚 meta-session-wrapper skill                              │
│  Input: Pattern → Output: Feature Request                   │
│                                                             │
│  Phase 4: DIAGNOSE (optional, auto if requested)            │
│  → /create-llm-structure <feature-request>                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Instructions

### Phase 1: IDENTIFY Work Done

1. Read @.claude/skills/meta-session-wrapper/SKILL.md (Phase 1 section)
2. Review current session:
   - Check `todoread` for completed tasks
   - Review files created/modified in session
   - Identify key decisions made
3. Output: Work Summary document

### Phase 2: ABSTRACT to Generic Pattern

1. Read @.claude/skills/meta-session-wrapper/SKILL.md (Phase 2 section)
2. Generalize concrete steps to abstract pattern
3. Identify variables (what changes between uses)
4. Define trigger conditions
5. Output: Generic Pattern description

### Phase 3: FORMALIZE as Feature Request

1. Read @.claude/skills/meta-session-wrapper/SKILL.md (Phase 3 section)
2. Use Feature Request template
3. Validate completeness
4. Output: Feature Request document

### Phase 4: Next Steps (Ask User)

After generating Feature Request, ask:

```
Feature Request 생성 완료.

다음 단계:
1. `/create-llm-structure` 로 진단 및 스펙 생성
2. 직접 구현 시작
3. Feature Request 저장 후 나중에 진행

어떻게 진행할까요?
```

## Output Format

```markdown
## Session Wrap 결과

### 1. Work Summary
[Session actions, artifacts, decisions]

### 2. Generic Pattern
[Abstracted steps, variables, triggers]

### 3. Feature Request

#### Name
[pattern-name]

#### Description
[1-2 sentences]

#### Trigger
[Activation conditions]

#### Inputs
- [Input 1]
- [Input 2]

#### Outputs
- [Output 1]
- [Output 2]

#### Steps
1. [Step 1]
2. [Step 2]

#### Domain Knowledge
[Required expertise]

#### Side Effects
[File creation, APIs, etc.]

#### Reusability
[Frequency of use]

---

다음 단계를 선택하세요:
1. `/create-llm-structure` 실행
2. 직접 구현
3. 저장 후 나중에 진행
```

## Key Principle

**This command owns the pipeline.** The skill provides domain knowledge; this command coordinates the extraction workflow.

```
⚡ COMMAND: Orchestrates flow, asks user for next step
    ↓
📚 SKILL: Provides extraction/abstraction knowledge
    ↓
🔧 TOOL: Reads session state (todos, files)
```
