---
title: "Claude 연구: Command/Skill/Agent 설계"
description: "AI 코딩 어시스턴트를 위한 Command, Skill, Agent 설계에 대한 Claude의 분석. GitHub CLI 통합 중심."
type: explanation
tags: [AI, Architecture, BestPractice]
order: 1
depends_on: [./00-research-prompt.ko.md]
related: [./01-claude.en.md]
---

# AI 코딩 어시스턴트를 위한 Command, Skill, Agent 설계 가이드

Claude Code와 OpenCode 같은 AI 코딩 어시스턴트는 기능을 Command, Skill, Agent라는 추상화 계층으로 구분한다. **Command**는 사람이 트리거하는 진입점이고, **Skill**은 실행 없이 도메인 전문성을 인코딩하며, **Agent**는 자율적 추론을 제공한다. 이 가이드는 GitHub CLI 통합에 초점을 맞춰 정확한 정의, 아키텍처 패턴, 실용적인 명세를 정립한다.

---

## A. 개념 정의 & 경계

AI 코딩 생태계에서 이 용어들은 일관되지 않게 사용되지만, 프로덕션급 시스템은 정확한 구분이 필요하다.

### 핵심 정의

| 개념         | 정의                                                    | 핵심 특성                                                  |
| ------------ | ------------------------------------------------------- | ---------------------------------------------------------- |
| **Tool**     | 원자적 연산을 실행 (API 호출, 파일 쓰기, DB 쿼리)       | JSON 정의 입력, 문서화된 부작용. AI 시스템의 "손"          |
| **Skill**    | _어떻게_ 문제에 접근할지 형성하는 패키징된 전문성       | 행동 지침, 도메인 휴리스틱, 템플릿 제공. 에이전트의 "훈련" |
| **Command**  | 특정 워크플로우를 시작하는 사람이 트리거하는 이산 액션  | 명시적 진입점—사용자가 `/create-issue` 호출                |
| **Agent**    | LLM을 사용해 추론, 계획, 동적 도구 선택하는 자율 시스템 | 상태 유지, 예상치 못한 상황 적응, 최소 개입으로 목표 달성  |
| **Workflow** | 고정된 순서로 미리 정해진 단계 실행                     | 결정론적, 예측 가능, 일관된 프로세스에 이상적              |

### 계층 구조

```
Agent → Workflow → Command → Skill → Tool
  ↓         ↓          ↓         ↓       ↓
오케스트레이션  단계실행    진입점     지식/지침   원자적실행
```

에이전트가 워크플로우를 오케스트레이션하고, 워크플로우가 커맨드를 호출하고, 커맨드가 스킬을 활용하여 도메인 안내를 받고, 스킬이 도구 선택과 사용을 지시한다.

### 용어 매핑 테이블 (플랫폼별)

| 도구               | Commands (사용자 트리거)                 | Rules/Instructions (지속 컨텍스트)    | Agents/Modes         | 설정 위치         |
| ------------------ | ---------------------------------------- | ------------------------------------- | -------------------- | ----------------- |
| **Claude Code**    | Slash commands (`.claude/commands/*.md`) | `CLAUDE.md` (계층적)                  | 단일 에이전트        | `.claude/`        |
| **OpenCode**       | `.opencode/commands/*.md`                | `AGENTS.md`, instructions 배열        | Build, Plan 모드     | `opencode.json`   |
| **Cursor**         | `.cursor/commands/*.md` (베타)           | `.cursor/rules/*.mdx`, `.cursorrules` | Agent, Ask, Manual   | `.cursor/rules/`  |
| **GitHub Copilot** | `.github/instructions/*.instructions.md` | `.github/copilot-instructions.md`     | Chat 중심            | `.github/`        |
| **Aider**          | Chat commands (`/read`, `/run`)          | `CONVENTIONS.md` via `--read`         | 단일 어시스턴트      | `.aider.conf.yml` |
| **Cline/Roo Code** | 대화형                                   | `.clinerules/`, `.roo/rules/`         | Code, Architect, Ask | VS Code 확장      |

### 경계 테스트 케이스 10개

| #   | 케이스                                          | 답변                                                                  |
| --- | ----------------------------------------------- | --------------------------------------------------------------------- |
| 1   | 커맨드가 내부적으로 여러 스킬을 호출하는 건 OK? | ✅ OK. 커맨드는 스킬을 조합하는 진입점 역할                           |
| 2   | 스킬이 LLM을 포함하면 에이전트인가?             | ❌ 아니오. 스킬은 지식/지침만. LLM 추론 포함 시 Agent                 |
| 3   | Tool이 다른 Tool을 호출하면?                    | ❌ 안티패턴. Tool은 원자적이어야 함. Workflow나 Command에서 조합      |
| 4   | 워크플로우에서 조건 분기가 있으면 Agent인가?    | 상황에 따라. 정적 조건 분기는 Workflow, 동적 판단은 Agent             |
| 5   | 사용자 확인 없이 실행되는 건 Command?           | ❌ 아니오. Command는 명시적 트리거 필요. 자동 실행은 Agent 영역       |
| 6   | 파일 읽기만 하는 건 Tool? Skill?                | Tool (원자적 실행). Skill은 "어떤 파일을 언제 읽을지" 지침            |
| 7   | 에러 리트라이 로직이 있으면 Agent?              | ❌ 아니오. 단순 리트라이는 Workflow/Tool 수준. 동적 전략 변경은 Agent |
| 8   | CLAUDE.md에 정의된 규칙은 Skill?                | ✅ 맞음. 지속적 컨텍스트로 제공되는 도메인 지식                       |
| 9   | gh issue create는 Tool? Command?                | Tool (원자적 CLI 실행). 이를 감싸는 `/create-issue`가 Command         |
| 10  | 멀티스텝이지만 순서 고정이면?                   | Workflow. Agent는 동적으로 다음 단계를 결정할 때만                    |

---

## B. 관계 모델 (연관 구조)

### 1) 계층 관점

```
┌─────────────────────────────────────────────────┐
│ Agent (오케스트레이션, 상태관리, 동적계획)           │
├─────────────────────────────────────────────────┤
│ Workflow (고정 순서 실행, 단계별 상태 전달)         │
├─────────────────────────────────────────────────┤
│ Command (사용자 진입점, 검증, 권한 확인)           │
├─────────────────────────────────────────────────┤
│ Skill (도메인 지식, 휴리스틱, 템플릿)              │
├─────────────────────────────────────────────────┤
│ Tool (원자적 실행: API, CLI, 파일 I/O)           │
└─────────────────────────────────────────────────┘
```

**왜 이 구조가 좋은가:**

- 관심사 분리로 테스트/유지보수 용이
- 상위 계층 변경이 하위에 영향 최소화
- 재사용성: Tool/Skill은 여러 Command에서 공유

**언제 깨지는가:**

- Tool이 너무 많은 로직을 포함할 때 (God Tool)
- Command가 직접 Tool을 호출하며 Skill 우회할 때
- Agent가 모든 것을 처리하려 할 때 (Agent 만능주의)

### 2) 계약(Contract) 관점

| 계층     | 입력 스키마      | 출력 스키마               | 실패 정책                 | 타임아웃    |
| -------- | ---------------- | ------------------------- | ------------------------- | ----------- |
| Tool     | JSON Schema 필수 | 구조화된 결과 + 에러 코드 | 즉시 실패, 상위로 전파    | 30초 기본   |
| Skill    | 자연어 컨텍스트  | 지침/템플릿 (실행 없음)   | N/A                       | N/A         |
| Command  | 위치 인자 + 옵션 | 구조화된 결과             | 사용자에게 에러 표시      | 5분 기본    |
| Workflow | 이전 단계 출력   | 다음 단계 입력            | 롤백 또는 중단            | 단계별 설정 |
| Agent    | 목표 + 컨텍스트  | 최종 결과 + 추론 과정     | 재시도 → 폴백 → 사람 요청 | 15분 기본   |

### 3) 운영(Ops) 관점

| 항목         | Tool        | Skill       | Command       | Workflow      | Agent           |
| ------------ | ----------- | ----------- | ------------- | ------------- | --------------- |
| **버전닝**   | SemVer 필수 | SemVer 권장 | SemVer 권장   | SemVer 필수   | SemVer 필수     |
| **테스트**   | 유닛 테스트 | 수동 검증   | 통합 테스트   | E2E 테스트    | 시뮬레이션      |
| **로그**     | 입출력 기록 | N/A         | 트리거/결과   | 단계별 상태   | 전체 추론 과정  |
| **트레이스** | span ID     | N/A         | trace ID 시작 | 단계별 span   | 전체 trace      |
| **롤백**     | 자동 불가   | N/A         | 수동          | 보상 트랜잭션 | 체크포인트 복원 |

---

## C. 결정 규칙 (Decision Tree + Checklist)

### 결정 트리

```
시작: 새로운 기능이 필요하다
    │
    ▼
[Q1] 원자적이고 결정론적인 단일 연산인가?
    │
    ├─ YES → TOOL로 만들기
    │
    └─ NO ─┬─▶ [Q2] 실행 없이 지식/지침만 제공하는가?
           │
           ├─ YES → SKILL로 만들기
           │
           └─ NO ─┬─▶ [Q3] 사람이 명시적으로 트리거해야 하는가?
                  │
                  ├─ YES → COMMAND로 만들기
                  │
                  └─ NO ─┬─▶ [Q4] 단계가 미리 정해져 있고 고정인가?
                         │
                         ├─ YES → WORKFLOW로 만들기
                         │
                         └─ NO → AGENT에 위임
```

### 체크리스트

| 기준                                 | Tool | Skill | Command | Workflow | Agent |
| ------------------------------------ | :--: | :---: | :-----: | :------: | :---: |
| 재사용성 (다른 워크플로우에서 쓰나?) |  ●   |   ●   |    ◐    |    ◐     |   ○   |
| 부작용 (쓰기/삭제/배포 등)           |  ●   |   ○   |    ◐    |    ●     |   ◐   |
| 사람이 직접 트리거?                  |  ○   |   ○   |    ●    |    ◐     |   ◐   |
| 결정론적 결과 필요?                  |  ●   |  N/A  |    ◐    |    ●     |   ○   |
| 멀티스텝 계획/분기 필요?             |  ○   |   ○   |    ○    |    ●     |   ●   |
| 권한/보안 경계?                      |  ◐   |   ○   |    ●    |    ●     |   ●   |
| 실행 비용이 큰가?                    |  ○   |   ○   |    ◐    |    ◐     |   ●   |

> ● 높음/필수 | ◐ 중간/선택적 | ○ 낮음/해당없음

---

## D. 설계 템플릿

### 1) Command Spec Template

```yaml
command:
  name: "create-issue"
  version: "1.0.0"

  # === 목적 / 비목적 ===
  purpose: |
    GitHub 이슈를 적절한 라벨링, 마일스톤 할당,
    연결된 브랜치 생성과 함께 생성한다.
  non_goals:
    - "이슈 내용 자동 생성 (사용자 입력 필요)"
    - "다른 저장소의 이슈 관리"

  # === 입력 스키마 ===
  parameters:
    required:
      - name: "title"
        type: "string"
        description: "이슈 제목 (conventional format)"
        validation: "feat:, fix:, docs: 등 타입 프리픽스 필수"
        example: "feat: OAuth 인증 추가"

      - name: "type"
        type: "enum"
        values: ["bug", "feature", "enhancement", "documentation"]
        description: "이슈 타입 (라벨로 변환됨)"

    optional:
      - name: "milestone"
        type: "string"
        default: null
        description: "대상 마일스톤 이름"
        example: "v2.0"

      - name: "template"
        type: "string"
        default: "feature_request.md"
        description: ".github/ISSUE_TEMPLATE/ 내 템플릿 파일명"

  # === 출력 스키마 ===
  returns:
    schema:
      issue_number: { type: integer, description: "생성된 이슈 번호" }
      issue_url: { type: string, description: "이슈 웹 URL" }
      branch_name:
        { type: string, nullable: true, description: "생성된 브랜치 (옵션)" }
    example:
      issue_number: 123
      issue_url: "https://github.com/org/repo/issues/123"
      branch_name: "feature/123-oauth-flow"

  # === 실패 모드 & 에러 표준 ===
  errors:
    - code: "INVALID_TITLE"
      condition: "타입 프리픽스 누락"
      recoverable: true
      user_action: "올바른 형식으로 제목 수정"

    - code: "MILESTONE_NOT_FOUND"
      condition: "지정된 마일스톤이 존재하지 않음"
      recoverable: true
      user_action: "마일스톤 이름 확인 또는 생략"

    - code: "TEMPLATE_NOT_FOUND"
      condition: "템플릿 파일이 존재하지 않음"
      recoverable: true
      user_action: "템플릿 이름 확인"

    - code: "GH_AUTH_FAILED"
      condition: "GitHub 인증 실패"
      recoverable: false
      user_action: "gh auth login 실행"

  # === 안전장치 ===
  safety:
    always:
      - "제목 형식 검증"
      - "마일스톤 존재 확인"
      - "템플릿 파일 존재 확인"
    ask_first:
      - "다른 사용자에게 할당"
      - "private 저장소에 생성"
    never:
      - "권한 없는 저장소에 이슈 생성"
      - "시크릿 정보를 이슈 본문에 포함"
    dry_run: true # --dry-run 옵션 지원
    confirmation: "이슈 생성 전 내용 확인 프롬프트"

  # === 테스트 전략 ===
  testing:
    unit:
      - "제목 검증 로직"
      - "타입-라벨 매핑"
    integration:
      - "실제 gh issue create 호출 (테스트 저장소)"
      - "마일스톤 할당 확인"
    simulation:
      - "LLM 생성 본문의 품질 평가 (0.8 threshold)"

  # === 관측 ===
  observability:
    log_fields:
      - "command_name"
      - "issue_title"
      - "issue_type"
      - "duration_ms"
      - "success"
    trace_id: "cmd-{timestamp}-{random}"
    metrics:
      - "command.create_issue.count"
      - "command.create_issue.duration_ms"
      - "command.create_issue.error_rate"

  # === 버전/호환성 ===
  compatibility:
    min_gh_version: "2.0.0"
    breaking_changes:
      - version: "1.0.0"
        description: "초기 릴리스"
```

### 2) Skill Spec Template

```yaml
skill:
  name: "git-workflow"
  version: "1.0.0"

  # === 목적 / 비목적 ===
  purpose: |
    프로젝트의 Git 워크플로우 컨벤션을 제공한다.
    브랜치 네이밍, 커밋 메시지, PR 규칙 포함.
  non_goals:
    - "Git 명령어 직접 실행"
    - "충돌 자동 해결"

  # === 트리거 조건 ===
  triggers:
    - pattern: "브랜치 생성 요청"
      confidence_required: 0.8
    - pattern: "커밋 메시지 작성"
      confidence_required: 0.7
    - pattern: "PR 생성 관련 질문"
      confidence_required: 0.8

  # === 제공하는 지식 ===
  knowledge:
    branch_naming:
      pattern: "<type>/<issue-id>-<description>"
      types:
        feature: "새 기능"
        fix: "버그 수정"
        hotfix: "긴급 프로덕션 수정"
        refactor: "개선"
        docs: "문서"
      examples:
        - "feature/123-oauth-flow"
        - "fix/456-login-timeout"

    commit_convention:
      format: "<type>(<scope>): <description>"
      types:
        feat: "새 기능 (MINOR 버전 증가)"
        fix: "버그 수정 (PATCH 버전 증가)"
        refactor: "리팩토링"
        docs: "문서 변경"
        test: "테스트 추가/수정"
        chore: "빌드, 설정 변경"
      breaking_change: "! 접미사 또는 BREAKING CHANGE: 푸터"

    pr_rules:
      - "draft PR로 먼저 생성"
      - "Closes #N으로 이슈 연결"
      - "최소 1명 리뷰어 지정"

  # === 제약사항 ===
  constraints:
    - "main/master 브랜치 직접 커밋 금지"
    - "force push 금지 (hotfix 제외)"
    - "커밋당 하나의 목적만"

  # === 참조 리소스 ===
  resources:
    templates:
      - path: ".github/PULL_REQUEST_TEMPLATE.md"
      - path: ".github/ISSUE_TEMPLATE/"
    conventions:
      - path: "CONVENTIONS.md"
      - path: "CLAUDE.md"

  # === 검증 ===
  validation:
    manual_review:
      - "새 팀원이 이 스킬만으로 올바른 브랜치 생성 가능한가?"
      - "커밋 메시지 예시가 충분한가?"
    automated:
      - "commitlint와 규칙 일치 확인"
```

### 3) Agent Spec Template

```yaml
agent:
  name: "pr-workflow-agent"
  version: "1.0.0"
  role: "이슈에서 PR까지 전체 라이프사이클 관리"

  # === 목적 / 비목적 ===
  purpose: |
    이슈 생성부터 PR 생성까지의 워크플로우를 자율적으로 관리.
    사용자의 의도를 파악하고 적절한 커맨드/스킬을 조합.
  non_goals:
    - "PR 머지 (사람 승인 필요)"
    - "프로덕션 배포"
    - "보안 관련 설정 변경"

  # === 역량 정의 ===
  capabilities:
    skills:
      - "git-workflow"
      - "code-review"
      - "conventional-commits"
    commands:
      - "create-issue"
      - "create-branch"
      - "create-pr"
    tools:
      - "gh_cli"
      - "git_commands"
      - "file_operations"

    can:
      - "이슈에 연결된 브랜치 생성"
      - "변경사항 원자적 커밋"
      - "draft PR 생성"
      - "테스트 실행 및 결과 분석"

    cannot:
      - "승인 없이 PR 머지"
      - "열린 PR이 있는 브랜치 삭제"
      - "설정되지 않은 private 저장소 접근"

  # === 자율성 수준 ===
  autonomy:
    max_steps: 15
    timeout_seconds: 300

    autonomous: # 묻지 않고 실행
      - "파일 읽기"
      - "테스트 실행"
      - "draft PR 생성"
      - "브랜치 생성"

    requires_approval: # 확인 후 실행
      - "원격 push"
      - "리뷰어 요청"
      - "이슈 생성"

    prohibited: # 절대 불가
      - "force push"
      - "main/master 직접 커밋"
      - "시크릿 파일 수정"

  # === 메모리/상태 ===
  memory:
    scope: "session"
    retention:
      - key: "current_issue"
        purpose: "작업 중인 이슈 번호 추적"
        ttl: "end_of_session"
      - key: "commit_history"
        purpose: "세션 내 커밋 추적"
        ttl: "end_of_session"

  # === 에러 처리 ===
  error_handling:
    retry_policy:
      max_attempts: 3
      backoff: "exponential"
      retryable_errors:
        - "NETWORK_TIMEOUT"
        - "RATE_LIMITED"

    fallback_chain:
      1: "단순화된 접근법으로 재시도"
      2: "진행 상황 저장 후 사람에게 안내 요청"
      3: "세션 상태 덤프 및 종료"

  # === 계획/추론 ===
  planning:
    strategy: "ReAct" # Reasoning + Acting
    max_reasoning_tokens: 1000
    checkpoint_interval: 5 # 5단계마다 상태 저장

  # === 평가 기준 ===
  success_criteria:
    - "요청한 이슈가 올바른 메타데이터와 함께 생성됨"
    - "브랜치가 컨벤션에 맞게 생성됨"
    - "커밋이 목적별로 분리됨"
    - "PR이 이슈에 연결되어 생성됨"

  # === 관측 ===
  observability:
    log_fields:
      - "agent_name"
      - "goal"
      - "steps_taken"
      - "tools_used"
      - "duration_ms"
      - "success"
    trace:
      - "전체 추론 과정 기록"
      - "각 tool 호출 span"
    metrics:
      - "agent.pr_workflow.count"
      - "agent.pr_workflow.steps_avg"
      - "agent.pr_workflow.success_rate"
```

---

## E. 예시 설계 (GitHub 워크플로우 적용)

### 워크플로우 1: Issue 생성 + 타입/마일스톤 할당

#### 파일 구조

```
.claude/
├── commands/
│   └── create-issue.md          # Command 정의
├── skills/
│   └── issue-management/
│       ├── SKILL.md             # 이슈 관리 지식
│       └── templates/
│           ├── feature.md
│           ├── bug.md
│           └── docs.md
└── CLAUDE.md                    # 프로젝트 컨텍스트
```

#### Command 구현: `.claude/commands/create-issue.md`

````markdown
---
allowed-tools: Bash(gh:*), Read, Write
argument-hint: <type> <title> [--milestone <n>]
description: 이슈 템플릿에 맞게 GitHub 이슈 생성
---

# Issue 생성 Command

## 입력 파싱

- type: $1 (bug | feature | docs | enhancement)
- title: $2
- milestone: $3 (선택적)

## 컨텍스트

현재 저장소: !`gh repo view --json nameWithOwner -q .nameWithOwner`
사용 가능한 마일스톤: !`gh api repos/{owner}/{repo}/milestones -q '.[].title'`
이슈 템플릿 목록: !`ls .github/ISSUE_TEMPLATE/ 2>/dev/null || echo "없음"`

## 실행 단계

1. **검증**
   - 타입이 유효한지 확인
   - 마일스톤이 지정되었으면 존재하는지 확인
2. **템플릿 선택**
   - @.claude/skills/issue-management/templates/$1.md 참조
3. **이슈 생성**
   ```bash
   gh issue create \
     --title "$1: $2" \
     --label "$1" \
     --milestone "$3" \
     --body-file -
   ```
````

4. **결과 반환**
   - 이슈 번호
   - 이슈 URL
   - 할당된 라벨/마일스톤

## 안전 규칙

- dry-run 먼저 실행하여 내용 확인
- 사용자 확인 후 실제 생성

````

#### Skill 구현: `.claude/skills/issue-management/SKILL.md`

```markdown
# Issue Management Skill

## 이슈 타입별 템플릿 선택 규칙

| 키워드 | 타입 | 템플릿 |
|--------|------|--------|
| 버그, 오류, 에러, crash | bug | bug.md |
| 기능, 추가, 새로운 | feature | feature.md |
| 문서, README, 설명 | docs | docs.md |
| 개선, 리팩토링, 성능 | enhancement | feature.md |

## 라벨 매핑

- bug → `bug`, `priority-high`
- feature → `enhancement`, `needs-triage`
- docs → `documentation`

## 마일스톤 할당 가이드

- 긴급 버그: 현재 마일스톤
- 새 기능: 다음 마이너 버전 마일스톤
- 문서: 마일스톤 없음 (선택적)
````

#### 실행 시나리오

**성공 케이스:**

```bash
# 사용자 입력
/create-issue feature "OAuth 인증 추가" --milestone v2.0

# 실행 결과
✓ 검증 완료: feature 타입, v2.0 마일스톤 존재
✓ 템플릿 로드: feature.md
✓ 이슈 생성: #123
  URL: https://github.com/org/repo/issues/123
  라벨: enhancement, needs-triage
  마일스톤: v2.0
```

**실패 케이스:**

```bash
# 사용자 입력
/create-issue feature "OAuth" --milestone v3.0

# 실행 결과
✗ 마일스톤 'v3.0'이 존재하지 않습니다.
  사용 가능: v1.0, v2.0

다시 시도하시겠습니까? [Y/n]
```

---

### 워크플로우 2: 커밋 목적별 분리 + PR 생성

#### 파일 구조

```
.claude/
├── commands/
│   ├── split-commits.md         # 커밋 분리 Command
│   └── create-pr.md             # PR 생성 Command
├── skills/
│   └── conventional-commits/
│       └── SKILL.md             # 커밋 컨벤션 지식
└── CLAUDE.md
```

#### Command 구현: `.claude/commands/split-commits.md`

```markdown
---
allowed-tools: Bash(git:*), Read, Write
argument-hint: [--interactive]
description: 스테이징된 변경사항을 목적별로 커밋 분리
---

# Split Commits Command

## 현재 상태

스테이징된 파일: !`git diff --cached --name-only`
변경 통계: !`git diff --cached --stat`

## 컨벤션 참조

@.claude/skills/conventional-commits/SKILL.md

## 분리 전략

1. **파일 분류**
   - src/\*.ts → feat 또는 fix
   - \*.test.ts → test
   - docs/_, _.md → docs
   - package.json, _.config._ → chore

2. **변경 목적 분석**
   - 새 함수/클래스 추가 → feat
   - 기존 로직 수정 → fix 또는 refactor
   - 타입/인터페이스만 → refactor

3. **커밋 순서**
```

1.  feat: 핵심 기능 구현
2.  test: 테스트 추가
3.  docs: 문서 업데이트
4.  chore: 설정 변경

````

## 실행

각 그룹에 대해:
```bash
git add <files>
git commit -m "<type>(<scope>): <description>"
````

## 확인 사항

- 각 커밋이 독립적으로 빌드/테스트 통과하는지
- 커밋 순서가 논리적인지

````

#### Skill 구현: `.claude/skills/conventional-commits/SKILL.md`

```markdown
# Conventional Commits Skill

## 커밋 메시지 포맷

````

<type>(<scope>): <description>

[optional body]

[optional footer(s)]

````

## 타입 선택 기준

| 변경 내용 | 타입 | 버전 영향 |
|----------|------|----------|
| 새 기능 추가 | feat | MINOR ↑ |
| 버그 수정 | fix | PATCH ↑ |
| 리팩토링 (동작 변경 없음) | refactor | - |
| 테스트 추가/수정 | test | - |
| 문서 변경 | docs | - |
| 빌드/CI 설정 | chore | - |
| 성능 개선 | perf | PATCH ↑ |

## Breaking Change 표시

```bash
# 방법 1: 타입 뒤에 !
feat!: redesign authentication flow

# 방법 2: 푸터에 명시
feat: redesign authentication flow

BREAKING CHANGE: 기존 토큰 형식 호환되지 않음
````

## 커밋 분리 원칙

1. **하나의 커밋 = 하나의 목적**
   - ❌ "feat: add login and fix logout bug"
   - ✅ "feat: add login" + "fix: resolve logout bug"

2. **논리적 순서**
   - 기능 → 테스트 → 문서 순으로 커밋

3. **각 커밋은 독립 실행 가능**
   - 중간 커밋에서 빌드 깨지면 안 됨

````

#### Command 구현: `.claude/commands/create-pr.md`

```markdown
---
allowed-tools: Bash(gh:*), Bash(git:*)
argument-hint: <issue-number> [--ready]
description: 이슈에 연결된 PR 생성
---

# Create PR Command

## 입력
- issue_number: $1
- ready: $2 (기본: draft)

## 컨텍스트
현재 브랜치: !`git branch --show-current`
이슈 정보: !`gh issue view $1 --json title,labels,milestone`
커밋 목록: !`git log main..HEAD --oneline`

## 검증
1. 브랜치 이름이 이슈와 연결되어 있는지
   - 예: feature/123-* 또는 fix/123-*
2. 커밋이 1개 이상 있는지
3. 테스트가 통과하는지

## PR 생성

```bash
gh pr create \
  --draft \
  --title "$(git log -1 --format=%s)" \
  --body "Closes #$1

## Summary
$(git log main..HEAD --format='- %s')

## Checklist
- [ ] 테스트 추가/업데이트
- [ ] 문서 업데이트
- [ ] 리뷰어 지정" \
  --assignee @me
````

## 후처리

- --ready 플래그가 있으면: `gh pr ready`
- 리뷰어 제안

````

#### 실행 시나리오

**성공 케이스:**
```bash
# 상황: 여러 파일이 스테이징되어 있음
$ git status
Changes to be committed:
  src/auth.ts
  src/auth.test.ts
  docs/auth.md
  package.json

# 커밋 분리 실행
/split-commits

# 결과
분석 완료. 다음과 같이 분리합니다:

1. feat(auth): implement OAuth flow
   - src/auth.ts

2. test(auth): add OAuth unit tests
   - src/auth.test.ts

3. docs(auth): document OAuth setup
   - docs/auth.md

4. chore: update dependencies
   - package.json

진행하시겠습니까? [Y/n]

# 승인 후
✓ 4개 커밋 생성 완료
  - a1b2c3d feat(auth): implement OAuth flow
  - d4e5f6g test(auth): add OAuth unit tests
  - h7i8j9k docs(auth): document OAuth setup
  - l0m1n2o chore: update dependencies

# PR 생성
/create-pr 123

# 결과
✓ Draft PR 생성: #456
  URL: https://github.com/org/repo/pull/456
  연결된 이슈: #123
  커밋: 4개
````

**롤백 시나리오:**

```bash
# PR 생성 실패 (테스트 미통과)
/create-pr 123

✗ 테스트 실패: 2개 케이스
  - auth.test.ts: timeout error
  - auth.test.ts: assertion failed

PR을 생성하지 않았습니다.
다음 중 선택하세요:
1. 테스트 수정 후 재시도
2. 강제 생성 (비권장)
3. 취소
```

---

## F. 안티패턴 & 가드레일

### 흔한 실패 패턴 12개

| #   | 패턴 이름           | 징후                                             | 해결책                 |
| --- | ------------------- | ------------------------------------------------ | ---------------------- |
| 1   | **Skill Spaghetti** | 비슷한 스킬이 10개 이상, 중복 내용               | 스킬 통합, 계층화      |
| 2   | **Command 남발**    | `/create-file`, `/write-file`, `/save-file` 공존 | 15개 이하로 통합       |
| 3   | **Agent 만능주의**  | 모든 요청에 Agent 사용, 단순 작업도              | 결정 트리로 분류       |
| 4   | **God Tool**        | 하나의 Tool이 10개 이상 기능                     | 원자적으로 분리        |
| 5   | **Prompt 비대화**   | CLAUDE.md가 5000 토큰 이상                       | 1000 토큰 이하로 압축  |
| 6   | **계층 스킵**       | Command가 직접 Tool 호출, Skill 우회             | 계층 구조 강제         |
| 7   | **에러 삼키기**     | 에러 무시하고 진행                               | 명시적 에러 처리       |
| 8   | **암묵적 상태**     | 전역 변수로 상태 관리                            | 명시적 상태 전달       |
| 9   | **테스트 부재**     | Command/Agent 테스트 없음                        | 시뮬레이션 테스트 필수 |
| 10  | **버전 무시**       | 버전 없이 배포                                   | SemVer 필수 적용       |
| 11  | **관측 부재**       | 로그/트레이스 없음                               | 관측성 레이어 추가     |
| 12  | **권한 과다**       | 모든 Tool에 모든 권한                            | 최소 권한 원칙         |

### 조직/리포지토리 가드레일

#### PR 리뷰 체크리스트

```markdown
## Command/Skill/Agent 변경 리뷰

### 분류 확인

- [ ] 적절한 추상화 레벨인가? (결정 트리 확인)
- [ ] 기존 것과 중복되지 않는가?
- [ ] 이름이 명확한가?

### 계약 확인

- [ ] 입출력 스키마가 정의되어 있는가?
- [ ] 에러 케이스가 문서화되어 있는가?
- [ ] 부작용이 명시되어 있는가?

### 안전 확인

- [ ] 권한이 최소한인가?
- [ ] dry-run 옵션이 있는가? (부작용 있는 경우)
- [ ] 확인 프롬프트가 적절한가?

### 테스트 확인

- [ ] 유닛/통합 테스트가 있는가?
- [ ] 엣지 케이스가 커버되는가?
- [ ] 시뮬레이션 테스트 결과는?

### 관측 확인

- [ ] 로그 필드가 정의되어 있는가?
- [ ] 트레이스 ID가 전파되는가?
- [ ] 메트릭이 정의되어 있는가?
```

#### 디렉토리 구조 강제

```yaml
# .github/workflows/validate-ai-config.yml
name: Validate AI Config

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check structure
        run: |
          # Command 파일 검증
          for f in .claude/commands/*.md; do
            # frontmatter 필수 필드 확인
            grep -q "^allowed-tools:" "$f" || exit 1
            grep -q "^description:" "$f" || exit 1
          done

          # Skill 파일 검증
          for d in .claude/skills/*/; do
            [ -f "${d}SKILL.md" ] || exit 1
          done

          # CLAUDE.md 토큰 수 확인
          tokens=$(wc -w < CLAUDE.md)
          [ "$tokens" -lt 1500 ] || exit 1
```

---

## 다음 액션 (1주 플랜)

| 일  | 액션                          | 산출물                                 |
| --- | ----------------------------- | -------------------------------------- |
| 1   | 기존 CLAUDE.md 리팩토링       | 1000 토큰 이하 CLAUDE.md               |
| 2   | `/create-issue` Command 구현  | `.claude/commands/create-issue.md`     |
| 3   | `git-workflow` Skill 구현     | `.claude/skills/git-workflow/SKILL.md` |
| 4   | `/create-branch` Command 구현 | `.claude/commands/create-branch.md`    |
| 5   | `/split-commits` Command 구현 | `.claude/commands/split-commits.md`    |
| 6   | `/create-pr` Command 구현     | `.claude/commands/create-pr.md`        |
| 7   | 통합 테스트 + 문서화          | E2E 테스트, README 업데이트            |

---

## 환경에서 확인해야 할 질문 목록

1. **gh CLI 인증**: `gh auth status`로 현재 인증 상태 확인
2. **이슈 템플릿**: `.github/ISSUE_TEMPLATE/` 디렉토리 존재 여부
3. **마일스톤**: `gh api repos/{owner}/{repo}/milestones`로 현재 마일스톤 확인
4. **브랜치 보호 규칙**: main/master에 직접 push 가능 여부
5. **commitlint 설정**: 기존 커밋 컨벤션 설정 파일 존재 여부
