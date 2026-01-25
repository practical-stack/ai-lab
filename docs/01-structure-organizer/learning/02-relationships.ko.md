---
title: "모듈 2: 컴포넌트 관계 및 계약"
description: "Agent, Skill, Command, Tool 계층이 계층적 관계와 계약을 통해 어떻게 함께 작동하는지 이해"
type: tutorial
tags: [AI, Architecture]
order: 2
depends_on: [./01-fundamentals.ko.md]
related: [./02-relationships.md]
---

# 모듈 2: 컴포넌트 관계 및 계약

> Agent, Skill, Command, Tool 계층이 어떻게 함께 작동하는지 이해하기

## 학습 목표

이 모듈을 완료하면:
- 컴포넌트 간의 계층적 관계를 이해합니다
- 계약(Contract)이 계층 간 상호작용을 어떻게 정의하는지 알게 됩니다
- 각 컴포넌트에 대한 적절한 인터페이스를 설계할 수 있습니다

---

## 2.1 계층 구조: Agent → Workflow → Command → Skill → Tool

### 시각적 개요

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT 계층                           │
│  • 사용자 의도 수신, 목표 설정                          │
│  • 추론과 계획 수행                                     │
│  • 어떤 Skill/Command를 사용할지 결정                   │
│  • 도구 접근 관리                                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              COMMAND/WORKFLOW 계층                      │
│  • 특정 절차 실행                                       │
│  • Skill과 Tool 호출 순서 기술                          │
│  • 일반적인 워크플로우를 위한 미니 스크립트              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SKILL 계층                           │
│  • 도메인 지식과 체크리스트 제공                        │
│  • 특정 도메인 작업 시 Agent가 로드                     │
│  • 도구를 올바르게 사용하는 방법 가이드                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    TOOL 계층                            │
│  • 실제 작업 실행 (API, CLI, DB)                        │
│  • JSON 또는 구조화된 출력으로 결과 반환                │
│  • 시스템의 "손"                                        │
└─────────────────────────────────────────────────────────┘
```

### 왜 이런 구조인가?

| 원칙 | 이점 |
|------|------|
| **관심사 분리** | 각 계층이 명확한 책임을 가짐 |
| **재사용성** | Skill과 Command를 여러 Agent에서 재사용 가능 |
| **모듈성** | 다른 계층에 영향 없이 한 계층 변경 가능 |
| **테스트 용이성** | 각 계층을 독립적으로 테스트 가능 |

### 예제 흐름

**사용자:** "이 코드를 더 나은 에러 처리로 리팩토링해줘"

```
1. AGENT 결정: "코드 리팩토링 필요" → 다단계 접근법 계획
2. AGENT 로드: "error-handling" SKILL (베스트 프랙티스용)
3. SKILL 제공: 에러 처리를 위한 체크리스트와 패턴
4. AGENT 호출: FileRead TOOL로 현재 코드 가져오기
5. AGENT 호출: FileWrite TOOL로 변경 적용
6. AGENT 실행: TestRunner TOOL로 변경사항 확인
7. AGENT 보고: 변경 요약을 사용자에게 전달
```

---

## 2.2 계층별 책임 상세

### Agent 계층

```yaml
# Agent가 하는 일:
responsibilities:
  - 사용자 의도 해석
  - 실행 계획 생성
  - 관련 Skill 로드
  - 적절한 Tool 선택
  - 오류 처리 및 재시도
  - 결과 보고

# Agent가 하면 안 되는 일:
anti_patterns:
  - 상세 절차를 하드코딩 (Skill 대신 사용)
  - 계획 없이 실행
  - 실패 시나리오 무시
```

### Command/Workflow 계층

```yaml
# Command가 하는 일:
responsibilities:
  - 고정된 실행 순서 정의
  - 사용자로부터 매개변수 수신
  - 입력 유효성 검사
  - Agent 작업 트리거

# 예시: /deploy Command
steps:
  1. 환경 매개변수 유효성 검사
  2. 배포 Skill 로드
  3. 배포 도구 실행
  4. 성공/실패 보고
```

### Skill 계층

```yaml
# Skill이 하는 일:
responsibilities:
  - 도메인 전문 지식 제공
  - 베스트 프랙티스 정의
  - 템플릿과 예제 제공
  - 도구 사용법 가이드

# Skill이 하면 안 되는 일:
anti_patterns:
  - 직접 도구 실행 (Agent가 결정)
  - 자율적인 의사결정
  - 사용 간 상태 유지
```

### Tool 계층

```yaml
# Tool이 하는 일:
responsibilities:
  - 원자적 작업 실행
  - 구조화된 결과 반환
  - 명확한 오류 보고

# Tool 예시:
- file_read, file_write
- git_commit, git_push
- api_call, database_query
- run_tests, run_build
```

---

## 2.3 계약(Contract): 계층 간 인터페이스 정의

각 계층은 명확한 **계약** - 입력/출력 형식과 오류 처리에 대한 합의가 필요합니다.

### Agent 계약

```yaml
agent_contract:
  input:
    format: "자연어 또는 구조화된 JSON"
    example: "버그 #123 수정해줘" 또는 {"task": "fix_bug", "issue_id": 123}
  
  output:
    format: "결과가 포함된 사용자 대상 응답"
    example: "버그 #123 수정완료. 변경사항: [diff]. PR: #456"
  
  error_handling:
    timeout: "{max_time} 후 ERROR_TIMEOUT 반환"
    tool_failure: "최대 3회 재시도, 그 후 사용자에게 문의"
    missing_input: "누락된 필드와 함께 즉시 오류 반환"
```

### Command 계약

```yaml
command_contract:
  input:
    parameters: "argument-hint에 정의"
    validation: "타입 및 값 제약"
    example: "/deploy prod --dry-run"
  
  output:
    success: "✅ {env}에 배포 성공"
    failure: "❌ 배포 실패 - {reason}"
  
  error_handling:
    invalid_input: "INVALID_ARGS 즉시 반환"
    timeout: "상태와 함께 정의된 제한 후 반환"
    partial_failure: "성공한 것과 실패한 것 보고"
```

### Skill 계약

```yaml
skill_contract:
  trigger:
    conditions: "키워드 또는 컨텍스트 패턴"
    example: "USE WHEN: '코드 리뷰', '보안 검사'"
  
  content:
    format: "구조화된 섹션이 있는 마크다운"
    sections: ["Workflow Routing", "Guidelines", "Examples"]
  
  error_handling:
    load_failure: "Agent가 skill 없이 계속 진행"
    content_error: "skill 이름과 함께 오류 보고"
```

### Tool 계약

```yaml
tool_contract:
  input:
    format: "JSON Schema 정의 매개변수"
    example: {"file_path": "/src/app.ts", "content": "..."}
  
  output:
    success: {"status": "ok", "result": {...}}
    failure: {"status": "error", "code": "FILE_NOT_FOUND", "message": "..."}
  
  constraints:
    timeout: "기본 30초"
    permissions: "Agent별로 정의"
```

---

## 2.4 실용 예제: 계층 간 상호작용

### 시나리오: 새 GitHub 이슈 생성

```
┌─────────────────────────────────────────────────────────────┐
│ 사용자: "/create-issue 로그인 타임아웃 버그 수정"            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ COMMAND: create-issue.md                                    │
│ ────────────────────────                                    │
│ 입력: $1 = "로그인 타임아웃 버그 수정"                       │
│ 동작: 작업과 함께 Agent 호출                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ AGENT: 워크플로우 계획                                       │
│ ─────────────────────────                                   │
│ 1. "github-workflow" skill 로드                              │
│ 2. 적절한 라벨로 이슈 생성                                   │
│ 3. 선택적으로 연결된 브랜치 생성                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SKILL: github-workflow/SKILL.md                             │
│ ───────────────────────────────                             │
│ 제공:                                                        │
│ - 이슈 제목 규칙 (feat:, fix: 등)                            │
│ - 라벨 추천                                                  │
│ - 브랜치 네이밍 패턴                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ TOOL: gh_issue_create                                       │
│ ─────────────────────                                       │
│ 입력: {"title": "fix: 로그인 타임아웃 버그",                 │
│        "labels": ["bug", "auth"],                           │
│        "body": "..."}                                       │
│ 출력: {"issue_number": 123, "url": "..."}                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 결과: "이슈 #123 생성: fix: 로그인 타임아웃 버그"            │
│       "URL: https://github.com/org/repo/issues/123"         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2.5 운영: 버전 관리, 테스팅, 관측성

### 버전 관리 전략

```yaml
versioning:
  skills:
    location: "SKILL.md 프론트매터"
    format: "version: 1.0.0"
    changelog: "skill 폴더에 CHANGELOG.md 유지"
  
  commands:
    location: "Command 파일 헤더"
    format: "# Version: 1.0.0"
  
  agents:
    location: "Agent 정의"
    format: "version: 1.0.0"

compatibility:
  rule: "브레이킹 변경 시 Major 버전 증가"
  example: "입력 형식 변경 시 Skill v2.0"
```

### 테스팅 전략

| 계층 | 테스트 유형 | 예시 |
|------|-------------|------|
| **Tool** | 단위 테스트 | `test_file_read()`가 올바른 내용 반환 |
| **Skill** | 콘텐츠 테스트 | Skill이 오류 없이 로드되고 필수 섹션 보유 |
| **Command** | 통합 테스트 | `/deploy dev`가 예상 출력 생성 |
| **Agent** | 시나리오 테스트 | 입력부터 결과까지 전체 워크플로우 |

### 관측성 요구사항

```yaml
logging:
  format: "[LAYER=X] [ID=trace-123] action=Y result=Z time=1.2s"
  
  examples:
    - "[AGENT=bug-fix] [ID=abc123] action=load_skill skill=debugging"
    - "[TOOL=file_read] [ID=abc123] action=read path=/src/app.ts status=ok"
    - "[COMMAND=deploy] [ID=abc123] action=complete result=success"

metrics:
  - success_rate_per_agent
  - avg_response_time
  - skill_usage_count
  - tool_failure_rate

alerting:
  - "오류율 > 5% → PagerDuty"
  - "응답 시간 > 30초 → Slack"
```

---

## 2.6 구조가 무너지는 경우

### 피해야 할 안티패턴

| 안티패턴 | 문제점 | 해결책 |
|----------|--------|--------|
| **Agent가 모든 것을 함** | 프롬프트 비대화, 혼란 | Skill로 모듈화 |
| **Skill이 직접 실행** | Agent 제어 없이 부작용 발생 | Skill은 가이드만, 실행 안 함 |
| **계약 없음** | 암묵적 가정이 버그 유발 | I/O 및 오류 처리 정의 |
| **버전 관리 없음** | 브레이킹 변경이 사용자에게 충격 | 시맨틱 버저닝 |
| **로깅 없음** | 문제 디버깅 불가 | trace ID가 있는 구조화된 로그 |

### 예제: 적절한 분리 vs 부적절한 분리

**나쁨: Agent가 모든 것을 하드코딩**
```markdown
# Agent 시스템 프롬프트 (1000줄 이상!)
당신은 버그 수정자입니다. 버그 수정 시:
1. 먼저 git status를 실행하고...
2. 그런 다음 오류를 검색하고...
3. 그런 다음 이 정확한 수정 패턴을 적용하고...
[수백 줄 더]
```

**좋음: Agent가 Skill 사용**
```markdown
# Agent 시스템 프롬프트 (간결)
당신은 버그 수정자입니다. 버그 분석 시 "debugging" skill을 사용하세요.
변경 시 "coding-guidelines" skill을 따르세요.

# Skill은 필요에 따라 동적으로 로드
# 각 skill은 별도의 유지보수 가능한 파일
```

---

## 2.7 연습 문제

### 연습 1: 계약 매핑

다음 기능에 대해 각 계층의 계약을 정의하세요:

**기능:** 보안 이슈에 대해 PR을 리뷰하는 코드 리뷰 커맨드

<details>
<summary>예시 답안</summary>

```yaml
# Command 계약
command:
  name: "/review-security"
  input: "PR 번호 또는 URL"
  output: "보안 리뷰 보고서"
  errors: ["INVALID_PR", "NO_ACCESS", "TIMEOUT"]

# Skill 계약
skill:
  name: "security-review"
  triggers: ["보안", "취약점", "CVE"]
  content: "보안 체크리스트, 일반적인 취약점, 수정 패턴"

# Tool 계약
tools:
  - name: "github_get_pr"
    input: {"pr_number": int}
    output: {"diff": string, "files": list}
  
  - name: "code_search"
    input: {"pattern": string, "file_type": string}
    output: {"matches": list}
```
</details>

### 연습 2: 로깅 설계

이 흐름에서 어떤 로그 항목을 예상할 수 있나요:
1. 사용자가 `/create-project MyApp` 실행
2. Agent가 scaffold skill 로드
3. Agent가 파일 생성
4. 오류: 디렉토리가 이미 존재
5. Agent가 사용자에게 오류 보고

<details>
<summary>예시 답안</summary>

```
[INFO][COMMAND=create-project][ID=xyz789] input="MyApp" started
[INFO][AGENT=project-init][ID=xyz789] planning started
[INFO][AGENT=project-init][ID=xyz789] loading skill=scaffold
[INFO][SKILL=scaffold][ID=xyz789] loaded successfully
[INFO][TOOL=file_create][ID=xyz789] action=mkdir path=/projects/MyApp
[ERROR][TOOL=file_create][ID=xyz789] error=DIRECTORY_EXISTS path=/projects/MyApp
[INFO][AGENT=project-init][ID=xyz789] handling error=DIRECTORY_EXISTS
[INFO][COMMAND=create-project][ID=xyz789] completed status=failed error="디렉토리가 이미 존재합니다"
```
</details>

---

## 핵심 정리

1. **계층 구조가 중요**: Agent → Command → Skill → Tool, 각각 고유한 책임
2. **계약이 혼란을 방지**: 모든 계층에 입력/출력/오류 정의
3. **운영이 필수적**: 버전 관리, 테스팅, 로깅, 모니터링
4. **관심사 분리**: 한 계층에 모든 것을 넣지 마세요
5. **모든 것을 로깅**: 볼 수 없는 것은 디버깅할 수 없습니다

---

## 다음 모듈

[모듈 3: 결정 프레임워크](./03-decision-framework.ko.md) - 실용적인 결정 트리로 Command vs Skill vs Agent를 언제 만들어야 하는지 배웁니다.
