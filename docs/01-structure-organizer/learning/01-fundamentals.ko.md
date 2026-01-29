---
title: "모듈 1: AI 에이전트 아키텍처 기초"
description: "AI 코딩 어시스턴트의 아키텍처 모델: Skill과 Agent(핵심 타입) + Command(선택적 래퍼)의 핵심 개념과 사용 시점"
type: tutorial
tags: [AI, Architecture]
order: 1
related: [./01-fundamentals.md]
---

# 모듈 1: AI 에이전트 아키텍처 기초

> Skill, Agent, Command 이해하기 - AI 코딩 어시스턴트의 아키텍처 모델

## 학습 목표

이 모듈을 완료하면:
- Skill과 Agent(핵심 타입)의 핵심 차이점을 이해합니다
- Command가 선택적 래퍼인 이유를 설명할 수 있습니다
- 각 컴포넌트 유형을 언제 사용해야 하는지 알게 됩니다

---

## 1.1 큰 그림: 아키텍처 모델 - 두 개의 레이어

Claude Code, Cursor, OpenCode와 같은 AI 코딩 어시스턴트는 기능을 **두 개의 레이어**로 구성합니다:

### Knowledge Layer (핵심 타입)

| 컴포넌트 | 비유 | 역할 |
|----------|------|------|
| **Skill** | 교육/지식 | "어떻게" - 도메인 전문 지식과 절차 |
| **Agent** | 직원 | "누가" - 추론 능력을 가진 지능적 작업자 |

### Access Layer (선택적 래퍼)

| 컴포넌트 | 비유 | 역할 |
|----------|------|------|
| **Command** | 보안 게이트 | Skill/Agent 위의 UI + 보안 래퍼 (필요할 때만) |

> **핵심 인사이트**: Command는 Skill/Agent와 병렬적인 타입이 아닙니다. 플랫폼 제약조건(`allowed-tools`, `$ARGUMENTS`)과 사용자 진입점이 필요할 때 씌우는 **접근 패턴**입니다.

```
사용자 요청
     │
     ▼
┌─────────────────┐
│   Command (?)   │  ← 선택적 래퍼 (필요할 때만)
│   (접근 제어)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Agent       │  ← "누가 작업을 수행하는가"
│    (추론)       │
└────────┬────────┘
         │ 로드
         ▼
┌─────────────────┐
│     Skills      │  ← "어떻게 할 것인가"
│     (지식)      │
└────────┬────────┘
         │ 사용
         ▼
┌─────────────────┐
│     Tools       │  ← 실제 실행 (API, CLI 등)
└─────────────────┘
```

---

## 1.2 Command: 선택적 래퍼 (Access Layer)

### 정의

**Command**는 Skill이나 Agent 위에 씌우는 **선택적 UI + 보안 래퍼**입니다. 플랫폼 제약조건과 사용자 진입점이 필요할 때만 추가합니다.

> **중요**: Command는 핵심 타입이 아닙니다. Skill/Agent와 병렬적으로 비교하지 마세요.

### 핵심 특성

| 측면 | 설명 |
|------|------|
| **트리거** | 명시적 사용자 호출 (예: `/deploy`, `/create-issue`) |
| **동작** | 결정적 - 고정된 절차를 따름 |
| **형식** | 선택적 YAML 프론트매터가 있는 마크다운 파일 |
| **위치** | `.claude/commands/` 또는 유사한 디렉토리 |

### Command 예시

```markdown
---
allowed-tools: Bash(git:*), Bash(npm:*)
description: 프로젝트 규칙에 따라 GitHub 이슈 수정
---

이슈 #$1을 우선순위 $2로 수정합니다.

현재 git 상태: !`git status`
코딩 표준 따르기: @CONVENTIONS.md
```

### Command가 정당화되는 경우

- `allowed-tools` 제한이 필요할 때 (도구 샌드박싱)
- 위험한/되돌릴 수 없는 작업 (명시적 사용자 트리거 필요)
- 구조화된 `$ARGUMENTS` 검증이 필요할 때
- `/` 메뉴를 통한 자주 쓰는 단축키가 필요할 때

### Command가 필요하지 않은 경우

- Skill이 `@path`로 직접 호출 가능한 경우
- Agent가 목표 할당만으로 충분한 경우
- 위의 네 가지 정당화 조건에 해당하지 않는 경우

### 빠른 퀴즈

**Q1:** 사용자가 파일 저장 시 자동으로 코드를 포맷하는 기능을 원합니다. 이것은 Command여야 할까요?

<details>
<summary>정답</summary>

**아니오.** Command는 선택적 래퍼이며, 자동 포맷은 `allowed-tools` 제한이나 위험한 작업이 아닙니다. 파일 변경을 감지했을 때 에이전트가 자동으로 적용하는 **Skill**이어야 합니다. Command 래퍼는 불필요합니다.
</details>

---

## 1.3 Skill: "어떻게 할 것인가"

### 정의

**Skill**은 에이전트가 문제에 접근하는 방식을 형성하는 패키지화된 도메인 전문 지식입니다. Skill은 코드를 직접 실행하지 않고 지식과 절차를 제공합니다.

### 핵심 특성

| 측면 | 설명 |
|------|------|
| **트리거** | 컨텍스트/키워드 기반 자동 로드 |
| **동작** | 실행이 아닌 가이드 제공 |
| **형식** | `SKILL.md` + 지원 파일이 있는 폴더 |
| **상태** | 무상태 - 로드될 때마다 동일하게 동작 |

### Skill 구조

```
skills/
└── code-review/
    ├── SKILL.md           # 메인 스킬 정의
    ├── workflows/
    │   ├── security.md    # 보안 리뷰 절차
    │   └── performance.md # 성능 리뷰 절차
    └── references/
        └── checklist.md   # 리뷰 체크리스트
```

### SKILL.md 예시

```yaml
---
name: code-review
description: |
  보안 및 성능 이슈에 대해 코드를 리뷰합니다.
  USE WHEN: "코드 리뷰", "PR 확인", "보안 감사"
  DO NOT USE WHEN: "새 코드 작성", "리팩토링"
---

## 워크플로우 라우팅

| 의도 | 워크플로우 |
|------|------------|
| 보안 이슈 | workflows/security.md |
| 성능 이슈 | workflows/performance.md |

## 핵심 원칙

1. 스타일 지적보다 실질적인 이슈에 집중
2. 항상 구체적인 라인 번호 제공
3. 문제만 지적하지 말고 해결책 제안
```

### Skill을 사용하는 경우

- 관련 상황에서 에이전트가 자동 로드해야 하는 도메인 지식
- 여러 워크플로우에서 재사용 가능한 절차
- 베스트 프랙티스와 가이드라인
- 사용자 트리거가 필요 없는 지식

### 빠른 퀴즈

**Q2:** 모든 코드 변경에 적용되어야 하는 코딩 스타일 가이드. 이것은 Skill이어야 할까요?

<details>
<summary>정답</summary>

**아마 아닐 겁니다.** 규칙이 예외 없이 항상 적용되어야 한다면, 에이전트의 시스템 프롬프트나 영구 "Rules"(`.cursorrules` 같은)에 있어야 합니다. Skill은 "필요할 때" 로드되는 지식을 위한 것이지, 항상 켜져 있는 요구사항이 아닙니다.
</details>

---

## 1.4 Agent: "누가 작업을 수행하는가"

### 정의

**Agent**는 지능적인 작업 조정자입니다 - 특정 역할과 목표가 주어진 LLM 인스턴스. Agent는 추론하고, 계획하고, 도구와 스킬을 동적으로 선택합니다.

### 핵심 특성

| 측면 | 설명 |
|------|------|
| **트리거** | 목표 할당 또는 사용자 요청 |
| **동작** | 자율적인 추론과 계획 |
| **메모리** | 컨텍스트와 대화 히스토리 유지 |
| **범위** | 정의된 권한과 도구 접근 권한 보유 |

### Agent가 하는 일

1. 사용자나 상위 시스템으로부터 **목표 수신**
2. 목표 달성 방법 **계획**
3. 전문 지식이 필요할 때 **스킬 로드**
4. 실제 작업을 위해 **도구 호출**
5. 다단계 문제에 대해 **추론**
6. 필요시 병렬 작업을 위해 **서브 에이전트 생성**

### Agent 정의 예시

```yaml
name: bug-fix-agent
description: "이슈 보고서에서 버그를 찾아 수정합니다"
capabilities:
  skills: [code-review, testing, debugging]
  tools: [file_search, code_editor, test_runner]
autonomy:
  max_steps: 15
  requires_approval: [push_to_remote, merge_pr]
```

### Agent를 사용하는 경우

- 동적 도구 선택이 필요한 작업
- 피드백 루프가 있는 다단계 추론
- 예상치 못한 상황에 적응해야 할 때
- 결과가 중간 결과에 따라 달라질 때

### 빠른 퀴즈

**Q3:** "코드베이스에서 모든 TODO 주석 찾기" 작업 - 이것에 에이전트가 필요할까요?

<details>
<summary>정답</summary>

**아니오.** 이것은 단일 도구(grep/search)로 할 수 있는 간단하고 결정적인 작업입니다. 추론이나 계획이 필요 없습니다. 간단한 Command나 도구 호출만으로 충분합니다.
</details>

---

## 1.5 컴포넌트 비교

### 핵심 타입 비교 (Knowledge Layer)

| 측면 | Skill | Agent |
|------|-------|-------|
| **역할** | "어떻게 할 것인가" | "누가 하는가" |
| **트리거** | 자동/키워드 / `@path` | 목표 할당 |
| **추론** | 없음 | 있음 (LLM) |
| **실행** | 실행 없음 | 동적 |
| **상태** | 무상태 | 컨텍스트 보유 |
| **재사용성** | 높음 | 낮음 |

### Command 래퍼 (Access Layer)

| 측면 | Command |
|------|---------|
| **역할** | Skill/Agent 위의 UI + 보안 래퍼 |
| **트리거** | 사용자 명시적 `/command` |
| **정당화 조건** | `allowed-tools`, 위험한 작업, `$ARGUMENTS`, `/` 단축키 |

### 아키텍처 모델

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Knowledge Layer (핵심 타입):                           │
│    Skill = "어떻게" (지식, 전문성, 실행 없음)           │
│    Agent = "누가" (추론, 계획, 동적 선택)               │
│                                                         │
│  Access Layer (선택적):                                 │
│    Command = Skill/Agent 위의 UI + 보안 래퍼            │
│    (필요할 때만 추가)                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 1.6 플랫폼별 용어 매핑

다른 플랫폼은 다른 용어를 사용합니다. 매핑은 다음과 같습니다:

| 개념 | Claude Code | Cursor | OpenCode | GitHub Copilot |
|------|-------------|--------|----------|----------------|
| Command | `.claude/commands/*.md` | `.cursor/commands/*.md` | `.opencode/commands/*.md` | N/A |
| Skill | `.claude/skills/*/SKILL.md` | `.cursor/rules/*.mdx` | `skills/*/SKILL.md` | N/A |
| Agent | 단일 에이전트 | Agent 모드 | Build, Plan 모드 | 채팅 중심 |
| Rules | `CLAUDE.md` | `.cursorrules` | `AGENTS.md` | `copilot-instructions.md` |

---

## 1.7 연습 문제

### 연습 1: 기능 분류하기

아래 각 기능에 대해 결정하세요: **Command, Skill, 또는 Agent?**

1. 프로덕션 환경에 애플리케이션 배포
2. React 베스트 프랙티스에 대한 지식
3. 버그 리포트 분석, 원인 찾기, PR 수정 생성
4. 코드 주석에서 API 문서 생성
5. 프로젝트의 TypeScript 코딩 표준

<details>
<summary>정답</summary>

1. **Command** - 명시적 트리거 필요, 위험할 수 있는 작업
2. **Skill** - 도메인 지식, React 작업 시 자동 로드
3. **Agent** - 다단계 추론, 발견 내용에 따라 적응
4. **Command 또는 Agent** - 단순하면 Command, 코드 컨텍스트 이해 필요하면 Agent
5. **Skill 또는 Rule** - 상황적이면 Skill, 항상 적용이면 Rule
</details>

### 연습 2: 기능 설계하기

**시나리오:** 풀 리퀘스트의 일반적인 이슈를 리뷰하는 기능을 만들고 싶습니다.

작성하세요:
1. 어떤 컴포넌트 유형인가요?
2. 트리거는 무엇인가요?
3. 어떤 스킬/도구가 필요한가요?
4. 출력은 무엇인가요?

<details>
<summary>예시 답안</summary>

**컴포넌트 유형:** Agent (다단계 추론 필요)

**트리거:** `/review-pr` 같은 Command 또는 PR 생성 시 자동 트리거

**필요한 스킬:**
- `code-review` - 일반 리뷰 프랙티스
- `security` - 보안 취약점 검사
- `performance` - 성능 안티패턴

**필요한 도구:**
- `file_read` - PR diff 읽기
- `github_api` - PR 세부사항 가져오기, 댓글 달기
- `search_code` - 관련 코드 찾기

**출력:**
- 파일/라인 참조가 있는 이슈 목록
- 제안된 수정사항
- PR에 달린 요약 댓글
</details>

---

## 핵심 정리

1. **Skill**은 도메인 지식 (핵심 타입) - "이렇게 하는 거야"
2. **Agent**는 지능적 작업자 (핵심 타입) - "알아서 하고 해결해"
3. **Command**는 선택적 래퍼 (접근 계층) - `allowed-tools` 제한, 위험한 작업, `$ARGUMENTS`, `/` 단축키가 필요할 때만 추가
4. 대부분의 기능은 Skill과 Agent의 조합이며, Command 래퍼는 필요할 때만
5. 먼저 핵심 타입을 결정한 후, Command 래퍼 필요 여부를 판단

---

## 다음 모듈

[모듈 2: 컴포넌트 관계 및 계약](./02-relationships.ko.md) - Command, Skill, Agent가 계층적 시스템에서 어떻게 함께 작동하는지 배웁니다.
