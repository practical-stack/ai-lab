---
title: "예시 설계"
description: "프로젝트 스캐폴딩 CI 설정, 버그 리포트에서 PR 생성까지의 실무 워크플로우 예시를 통한 설계 가이드."
type: explanation
tags: [Architecture, AI]
order: 5
related: ["./05-examples.en.md"]
---

# E. 예시 설계 (내 워크플로우 적용)

이 섹션에서는 두 가지 워크플로우를 예시로 다룹니다:
1. "신규 앱 생성 스캐폴딩 + CI 설정"
2. "버그 리포트 → 재현 → 원인 분석 → PR 생성"

각 사례마다 파일 구조, 명명법, 간략 구현, 운영 시나리오를 서술합니다.

---

## 예시 1: 신규 앱 생성 스캐폴딩 + CI 설정

### 시나리오

- 사용자가 "새로운 프로젝트를 만들어줘"라고 요청
- 기본 코드 스캐폴딩 생성 + CI 파이프라인 설정까지 수행
- 여러 단계 필요: 프로젝트 구조 생성 → CI 설정 파일 작성 → 저장소 초기화

### 구성 요소 분리

| 구성요소 | 이름 | 역할 |
|----------|------|------|
| **Command** | `/init-project` | 사람이 실행하는 명령, 프로젝트 이름 등 파라미터 입력 받아 에이전트 트리거 |
| **Agent** | `project-init-agent` | 프로젝트 초기화 전문 에이전트, 스캐폴드 생성부터 CI 설정까지 멀티스텝 수행 |
| **Skills** | `scaffold`, `ci` | 도메인별 지식 (언어별 템플릿/디렉토리 구조, CI 도구 작성 지침) |
| **Tools** | Git CLI, FileWrite 등 | 실제 작업 수행 (create-react-app CLI 등) |

> **구조:** Command → Agent → (Skills) → Tools

### 파일/폴더 구조 예시

(사내 프레임워크 기준으로 .assistant/ 디렉토리 사용 가정)

```
.assistant/
├── commands/
│   └── init-project.md           # /init-project Command 스크립트
├── agents/
│   └── project-init-agent.md     # 프로젝트 초기화 에이전트 정의
└── skills/
    ├── scaffold/                 # scaffold 스킬 도메인
    │   ├── SKILL.md              # 스캐폴딩 스킬 개요 (트리거: "새 프로젝트", 언어 키워드 등)
    │   └── workflows/
    │       ├── create-structure.md  # 디렉토리/파일 생성 절차
    │       └── init-repo.md         # Git init & 첫 커밋 절차
    └── ci/                       # ci 스킬 도메인
        ├── SKILL.md              # CI 스킬 개요 (트리거: "CI", "pipeline" 등)
        └── workflows/
            └── setup-pipeline.md  # CI YAML 작성 및 CI 설정 절차
```

### Naming Convention

| 항목 | 규칙 | 예시 |
|------|------|------|
| Command 파일 | kebab-case | `init-project.md` |
| Agent 파일 | kebab-case | `project-init-agent.md` |
| Skill 디렉토리 | kebab-case | `scaffold`, `ci` |
| Workflow 파일 | kebab-case | `create-structure.md`, `setup-pipeline.md` |

> **핵심:** 모든 구성요소는 일관성을 위해 kebab-case 사용

### 최소 구현 (의사코드 수준)

**commands/init-project.md:** (YAML 없음 – Cursor 스타일 Command라면 markdown만)

```markdown
/init-project <project_name> [--language <lang>]

- Load the `scaffold` skill and `ci` skill.
- Ask the project-init-agent to create a new project named "$1" (language: $2).
```

설명: 이 Command는 단순히 프로젝트명과 언어를 받아, 관련 Skill을 미리 로드하고 Agent에게 작업 시작하도록 요청하는 역할.

**agents/project-init-agent.md:** (내부에 시스템 역할과 지시)

```yaml
name: project-init-agent
description: "An agent that scaffolds a new project and sets up CI."
tools: ["FileWrite", "GitInit", "TemplateFetch", ...]
```

```markdown
---

## Instructions:

1. Ensure the "scaffold" skill is loaded for project structure templates.
2. Ensure the "ci" skill is loaded for CI configuration templates.
3. Plan: Determine appropriate project structure based on language.
4. Step 1: Create base project files and folders (use FileWrite tool).
5. Step 2: Initialize git repository (use GitInit tool), commit scaffold.
6. Step 3: Set up CI pipeline (create CI YAML, commit).
7. Final: Confirm success with project name.
8. If any step fails, report error and abort further steps.
```

**skills/scaffold/SKILL.md:**

```yaml
name: scaffold
description: |
  Project scaffolding instructions.
  USE WHEN: "new project", "initialize repository", "project structure", etc.
  WHEN NOT: used for adding features to existing project.
```

```markdown
---

## Workflow Routing

| Workflow            | Trigger keywords                      | File                         |
| ------------------- | ------------------------------------- | ---------------------------- |
| **create-structure** | "new project", "scaffold", "template" | workflows/create-structure.md |
| **init-repo**        | "git init", "initialize repository"   | workflows/init-repo.md        |

## About

This skill provides templates and steps to scaffold a new software project.
```

### 운영 시나리오

#### ✅ 성공 경로

| 단계 | 동작 |
|------|------|
| 1. 명령 입력 | 개발자가 VSCode Chat에 `/init-project MyApp --language python` 입력 |
| 2. Agent 기동 | scaffold와 ci 스킬 로드 (스킬 내용이 Agent 컨텍스트에 포함) |
| 3. 계획 수립 | "Step1: 구조 생성 → Step2: Git init → Step3: CI 설정" |
| 4. Step1 | scaffold 스킬의 create-structure 워크플로우로 폴더/파일 생성 (FileWrite 툴) |
| 5. Step2 | init-repo 워크플로우로 `git init` 실행 (GitInit 툴) 및 초기 커밋 |
| 6. Step3 | ci 스킬의 setup-pipeline으로 `.github/workflows/ci.yml` 작성 및 커밋 |
| 7. 완료 | "✅ MyApp 프로젝트 생성 및 CI 파이프라인 설정 완료." + 파일 목록 출력 |

#### ❌ 실패 시나리오

**1. 폴더 충돌:**
- Agent Step1에서 오류 감지 ("directory exists")
- 즉시 중단 후 메시지: "❌ 프로젝트 디렉토리 이미 존재합니다. 다른 이름 선택하거나 폴더 비워주세요."

**2. Git 미설치:**
- GitInit 툴 에러 발생
- "Git 미설치: git 설치 후 다시 시도" 보고

#### 🔄 롤백 정책

- 이 워크플로우는 비교적 **idempotent**
- 실패해도 생성된 파일이 치명적이지 않음 (사용자가 직접 삭제 가능)
- 중간 실패 시 안내 필수: "CI 설정은 실패했으니 수동으로 추가 바랍니다"

> **핵심:** 사용자에게 명확히 알려 다음 액션을 취하게 하는 것

---

## 예시 2: 버그 리포트 → 재현 → 원인 분석 → PR 생성

### 시나리오

- QA나 사용자가 버그 보고
- AI 에이전트가 버그 재현 → 코드 수정 → GitHub PR 생성
- 복합적인 멀티스텝 작업으로 Agent 중심 수행

### 구성 요소 분리

| 구성요소 | 이름 | 역할 |
|----------|------|------|
| **Command** | `/fix-bug` | 버그 수정 프로세스 트리거. 버그 ID나 설명을 인수로 받음 |
| **Agent** | `bug-fix-agent` | 버그 해결 전문 에이전트. "재현→원인찾기→수정→검증→PR" 수행 |

**Skills:**

| Skill | 역할 |
|-------|------|
| `diagnosis` | 버그 증상별 분석 루틴 (null pointer vs performance bug 등) |
| `coding-guidelines` | 프로젝트 코딩 표준/베스트프랙티스 (수정 품질 담보) |
| `testing` | 테스트 작성/실행 관련 지식 |

**Tools:**

| Tool | 용도 |
|------|------|
| `RunApp` / `RunTests` | 앱 또는 테스트 케이스 실행 (버그 재현) |
| `ReadLog` | 에러 로그/스택 추출 |
| `CodeSearch` | 코드 검색 (유사 에러 패턴 찾기) |
| `FileEdit` | 코드 수정 |
| `GitHubAPI` | 브랜치 푸시 및 PR 생성 |

### 파일/폴더 구조 예시

```
.assistant/
├── commands/
│   └── fix-bug.md                # /fix-bug Command
├── agents/
│   └── bug-fix-agent.md          # 버그 수정 에이전트 정의
└── skills/
    ├── diagnosis/
    │   ├── SKILL.md
    │   └── workflows/
    │       ├── null-pointer.md
    │       └── perf-issue.md
    ├── coding-guidelines/
    │   └── SKILL.md
    └── testing/
        ├── SKILL.md
        └── workflows/
            ├── reproduce.md
            └── regression-test.md
```

### 운영 시나리오

#### ✅ 성공 케이스

**시작:** QA가 `/fix-bug #101` 실행

| Step | 동작 | 상세 |
|------|------|------|
| 0 | Agent 시작 | 이슈 #101 정보 Input으로 수신 (NullPointerException 에러 보고) |
| 1 | 이해 | 추가정보 필요 시 "재현 방법?" 질문 |
| 2 | 재현 | RunApp 툴로 앱 실행 → 에러 발생 → ReadLog로 스택트레이스 획득 |
| 3 | 원인 분석 | diagnosis 스킬 로드 → SearchCode로 원인 코드 확인 |
| 4 | Fix | coding-guidelines 스킬 참고 → EditFile로 null-check 추가 |
| 5 | Test | RunTests 실행 → 모든 테스트 통과 |
| 6 | PR | GitHubCreatePR: branch `bugfix-101-nullptr` |
| 7 | 완료 | "✅ 버그 #101 재현 및 수정 완료. PR 링크." |

#### ❌ 실패/예외 시나리오

**1. 재현 실패:**
- Agent가 여러 시도 후에도 버그 재현 불가
- 출력: "❌ 재현 불가: 추가 정보를 주세요."

**2. 원인 분석 실패:**
- 재현 성공했으나 원인 파악 불가
- 출력: "원인을 자동으로 파악하지 못했습니다. 개발자 확인 필요."

**3. Fix 회귀:**
- 버그 수정 후 다른 테스트 실패
- 출력: "부분 수정했으나 모든 테스트 통과 못했습니다. PR 열었으니 수동 수정 필요."

**4. 권한 오류:**
- GitHub token 만료 또는 PR 생성 권한 없음
- 출력: "❌ 수정 완료되었으나 PR 생성 실패 (권한 오류)."

#### 🔄 롤백 정책

| 상황 | 처리 방식 |
|------|-----------|
| 완전 실패 | PR 미생성, 로컬 변경만 보존 |
| 부분 성공 | Draft PR 또는 diff via chat |
| PR 생성 후 실패 | Draft로 올리거나 Close PR |

**안전장치:**
- 모든 Agent 행동은 로컬 branch에서 수행
- 치명적 부작용(잘못된 코드 머지)은 human-in-the-loop review로 예방

> **핵심:** 롤백보다는 **중간 실패 시 상태를 정확히 알리고 산출물(diff 등) 제공**에 중점

⚠️ **조직 가드레일:** Agent 출력은 항상 human-in-the-loop review 후 merge
