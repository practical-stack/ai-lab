---
title: "모듈 5: 실전 예제 및 연습"
description: "프로젝트 스캐폴딩과 버그 수정 자동화 사례를 통한 Command, Skill, Agent의 완전한 구현 예제"
type: tutorial
tags: [AI, Architecture]
order: 5
depends_on: [./04-templates.ko.md]
related: [./05-examples.en.md]
---

# 모듈 5: 실전 예제 및 연습

> Command, Skill, Agent의 완전한 구현

## 학습 목표

이 모듈을 완료하면:
- 각 컴포넌트 유형의 완전한 구현을 볼 수 있습니다
- 실제 시나리오에서 컴포넌트가 함께 작동하는 방식을 이해합니다
- 직접 컴포넌트를 설계하는 연습을 합니다

---

## 5.1 예제 1: 프로젝트 스캐폴딩 시스템

### 시나리오

개발자가 새 프로젝트를 시작할 때 도움이 되는 시스템 만들기:
- 적절한 폴더 구조
- CI/CD 설정
- Git 초기화

### 컴포넌트 분해

```
사용자 실행: /init-project MyApp --language python

   ┌─────────────────────────────────────────────────┐
   │  COMMAND: /init-project                         │
   │  프로젝트 매개변수로 에이전트 트리거            │
   └───────────────────────┬─────────────────────────┘
                           │
                           ▼
   ┌─────────────────────────────────────────────────┐
   │  AGENT: project-init-agent                      │
   │  스캐폴딩 단계 계획 및 실행                     │
   │                                                 │
   │  로드 skills: scaffold, ci                      │
   │  사용 tools: file_write, git_init, template_fetch│
   └───────────────────────┬─────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ SKILL:      │  │ SKILL:      │  │ TOOL:       │
   │ scaffold    │  │ ci          │  │ file_write  │
   │             │  │             │  │ git_init    │
   │ - 템플릿    │  │ - CI 설정   │  │             │
   │ - 구조      │  │ - 파이프라인│  │             │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### Command 구현

**파일:** `.claude/commands/init-project.md`

```markdown
---
allowed-tools: Bash(*), Read, Write
argument-hint: <project-name> [--language python|node|go]
description: 스캐폴딩과 CI 설정으로 새 프로젝트 초기화
---

# 프로젝트 초기화

"$1" 이름과 언어 선호 "${2:-python}"으로 새 프로젝트를 생성합니다.

## 요구사항
1. 프로젝트 디렉토리 구조 생성
2. git 저장소 초기화
3. CI/CD 파이프라인 설정
4. 설정 지침이 포함된 README 생성

## 컨텍스트
현재 디렉토리: !`pwd`
사용 가능한 템플릿: @.claude/skills/scaffold/templates/

프로젝트 구조에는 scaffold skill, 파이프라인 설정에는 ci skill 사용.
모든 파일이 프로젝트 규칙을 따르도록 보장.
```

### Skill 구현: Scaffold

**파일:** `.claude/skills/scaffold/SKILL.md`

```yaml
---
name: scaffold
version: 1.0.0
description: |
  프로젝트 스캐폴딩 템플릿과 구조 가이드라인.
  USE WHEN: "새 프로젝트", "프로젝트 생성", "스캐폴드", "프로젝트 구조"
  DO NOT USE WHEN: 기존 프로젝트에 기능 추가
---

# Scaffold Skill

## 워크플로우 라우팅

| 의도 | 워크플로우 | 설명 |
|------|------------|------|
| 새 프로젝트 생성 | workflows/create-structure.md | 전체 프로젝트 설정 |
| 저장소 초기화 | workflows/init-repo.md | Git 설정만 |

## 지원 언어

| 언어 | 템플릿 디렉토리 | 주요 파일 |
|------|-----------------|-----------|
| Python | templates/python/ | setup.py, requirements.txt, pyproject.toml |
| Node.js | templates/node/ | package.json, tsconfig.json |
| Go | templates/go/ | go.mod, main.go |

## 디렉토리 구조 표준

```
project-name/
├── src/              # 소스 코드
├── tests/            # 테스트 파일
├── docs/             # 문서
├── .github/          # GitHub 워크플로우
├── README.md         # 프로젝트 문서
└── .gitignore        # Git 무시 규칙
```
```

### 운영 시나리오

#### 성공 흐름

```
사용자: /init-project MyWebApp --language node

Agent: 새 Node.js 프로젝트 "MyWebApp" 생성 중...

단계 1: 디렉토리 구조 생성
  ✓ MyWebApp/ 생성됨
  ✓ MyWebApp/src/ 생성됨
  ✓ MyWebApp/tests/ 생성됨
  ✓ MyWebApp/docs/ 생성됨

단계 2: 프로젝트 파일 생성
  ✓ package.json 생성됨
  ✓ tsconfig.json 생성됨
  ✓ src/index.ts 생성됨
  ✓ tests/index.test.ts 생성됨
  ✓ README.md 생성됨

단계 3: CI 설정
  ✓ .github/workflows/ci.yml 생성됨

단계 4: git 초기화
  ✓ git init 실행됨
  ✓ 초기 커밋 생성됨

✅ 프로젝트 "MyWebApp" 성공적으로 생성됨!

다음 단계:
  cd MyWebApp
  npm install
  npm test
```

#### 실패 흐름

```
사용자: /init-project MyWebApp

Agent: 프로젝트 "MyWebApp" 생성 중...

단계 1: 디렉토리 확인 중...
❌ 오류: 디렉토리 "MyWebApp"이 이미 존재합니다.

옵션:
1. 다른 이름 선택
2. --force로 실행하여 덮어쓰기
3. 취소

어떻게 하시겠습니까?
```

---

## 5.2 예제 2: 버그 수정 자동화

### 시나리오

다음을 수행하는 에이전트 생성:
- 버그 리포트 수신
- 이슈 재현
- 근본 원인 찾기
- 수정 및 PR 생성

### 컴포넌트 분해

| 컴포넌트 | 이름 | 목적 |
|----------|------|------|
| Command | `/fix-bug` | 버그 수정 진입점 |
| Agent | `bug-fix-agent` | 전체 흐름 조율 |
| Skill | `debugging` | 버그 분석 기법 |
| Skill | `testing` | 테스트 작성 및 실행 |
| Skill | `coding-guidelines` | 수정 품질 보장 |
| Tools | 다양 | 파일 작업, git, 테스트 러너 |

### Command 구현

**파일:** `.claude/commands/fix-bug.md`

```markdown
---
allowed-tools: Bash(git:*), Read, Write, Bash(npm test), Bash(pytest)
argument-hint: <issue-id-or-description>
description: 버그를 분석하고 수정한 후 PR 생성
---

# 버그 수정 Command

## 입력
버그 참조: $1

## 지시사항

당신은 버그 수정 전문가입니다. 다음 프로세스를 따르세요:

1. **이해** - 버그 설명을 주의 깊게 읽기
2. **재현** - 버그 트리거 시도
3. **조사** - 근본 원인 찾기
4. **수정** - 최소한의 타겟팅된 수정 적용
5. **확인** - 테스트 실행하여 수정 확인
6. **문서화** - 명확한 설명과 함께 PR 생성

## 컨텍스트
저장소: !`git remote get-url origin`
현재 브랜치: !`git branch --show-current`
최근 커밋: !`git log --oneline -5`

조사 기법에는 debugging skill 로드.
변경 시 coding-guidelines skill 따르기.
수정 확인에는 testing skill 사용.

## 안전
- 항상 수정용 새 브랜치 생성
- 커밋 전 테스트 실행
- draft PR 생성 (사람 리뷰 필요)
```

### Agent 워크플로우

```
┌─────────────────────────────────────────────────────────────────┐
│                      BUG-FIX-AGENT                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
    ▼                           ▼                           ▼
┌─────────┐               ┌─────────┐               ┌─────────┐
│ 1단계   │               │ 2단계   │               │ 3단계   │
│ 분석    │               │  수정   │               │ 확인    │
└────┬────┘               └────┬────┘               └────┬────┘
     │                         │                         │
     ▼                         ▼                         ▼
• 버그 리포트 읽기        • 소스 파일 편집         • 테스트 스위트 실행
• 이슈 재현              • 테스트 케이스 추가      • 수정 동작 확인
• 원인 검색              • 가이드라인 따르기      • 회귀 없음 확인
• debugging skill 로드    • coding-guidelines 로드  • testing skill 로드
                                │
                                ▼
                        ┌─────────────┐
                        │  4단계      │
                        │  전달       │
                        │             │
                        │ • 커밋      │
                        │ • 푸시      │
                        │ • PR 생성   │
                        └─────────────┘
```

### 완전한 시나리오 워크스루

```
사용자: /fix-bug "비밀번호에 특수문자가 포함되면 로그인 실패"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1단계: 버그 이해
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

debugging skill 로드 중...

버그 요약:
- 이슈: 특수문자 비밀번호로 로그인 실패
- 예상: 유효한 모든 비밀번호로 로그인 가능해야 함
- 실제: "잘못된 자격 증명" 오류 반환

재현 시도 중...
  > 비밀번호 "test@123!"로 로그인 테스트
  > 결과: ❌ 로그인 실패
  > 성공적으로 재현됨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2단계: 조사
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

인증 코드 검색 중...
  > 발견: src/auth/login.ts

코드 분석:
```typescript
// Line 45
const sanitizedPassword = password.replace(/[^a-zA-Z0-9]/g, '');
```

근본 원인 식별:
해시 비교 전 특수문자를 제거하도록 비밀번호가 살균되고 있지만,
저장된 해시는 원본 비밀번호를 사용함.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3단계: 수정 구현
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

coding-guidelines skill 로드 중...

제안된 수정:
- 잘못된 살균 제거
- 적절한 비밀번호 처리 사용

브랜치 생성: fix/login-special-chars

적용된 변경:
```diff
- const sanitizedPassword = password.replace(/[^a-zA-Z0-9]/g, '');
- const hash = await bcrypt.hash(sanitizedPassword, 10);
+ const hash = await bcrypt.hash(password, 10);
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4단계: 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

testing skill 로드 중...

테스트 스위트 실행 중...
  ✓ 45개 테스트 통과
  ✓ 회귀 없음

특수문자용 테스트 케이스 추가:
```typescript
test('특수문자 비밀번호로 인증되어야 함', async () => {
  const result = await login('user@test.com', 'p@ss!w0rd#');
  expect(result.success).toBe(true);
});
```

모든 테스트: ✓ 46개 통과

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5단계: PR 생성
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Draft PR #234 생성됨:

제목: fix(auth): 비밀번호에 특수문자 허용

## 요약
비밀번호에 특수문자 포함 시 로그인 실패 수정.

## 근본 원인
비밀번호 살균이 해싱 전 특수문자를 잘못 제거하여
로그인 시 해시 불일치 발생.

## 변경사항
- 불필요한 비밀번호 살균 제거 (src/auth/login.ts)
- 특수문자 비밀번호용 테스트 케이스 추가

## 테스트
- 모든 기존 테스트 통과
- 회귀 테스트 추가됨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 버그 수정 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PR: https://github.com/org/repo/pull/234
브랜치: fix/login-special-chars
커밋: 2개 (수정 + 테스트)

머지 전 리뷰 대기 중.
```

---

## 5.3 연습 문제

### 연습 1: 문서 생성기 설계

**시나리오:** 코드에서 API 문서를 생성하는 시스템 만들기.

컴포넌트를 설계하세요:
1. 트리거하는 command는 무엇?
2. 어떤 skill이 필요?
3. agent 워크플로우는?

<details>
<summary>예시 솔루션</summary>

**Command:** `/generate-docs`

```markdown
---
description: 소스 코드에서 API 문서 생성
argument-hint: [path-to-source]
---

$1의 코드에 대한 종합 API 문서를 생성합니다.
포맷 표준에는 documentation skill 사용.
docs/api/ 디렉토리에 출력.
```

**Skill:** `documentation`
- 워크플로우: 함수 시그니처 추출
- 워크플로우: JSDoc/docstring에서 마크다운 생성
- 템플릿: API 문서 템플릿

**Agent 워크플로우:**
1. 문서화된 함수 위한 소스 파일 스캔
2. 시그니처와 설명 추출
3. 템플릿 사용하여 마크다운 생성
4. 인덱스/네비게이션 생성
5. 모든 링크 작동 확인
</details>

### 연습 2: 코드 마이그레이션 도구 설계

**시나리오:** JavaScript에서 TypeScript로 마이그레이션을 돕는 도구 만들기.

<details>
<summary>예시 솔루션</summary>

**Command:** `/migrate-to-ts`
- 매개변수: directory, strict-mode 플래그
- 안전: 백업 생성, 확인 필요

**Skills:**
- `typescript-patterns` - TS 베스트 프랙티스
- `migration-checklist` - 단계별 프로세스
- `testing` - 마이그레이션 동작 확인

**Agent 워크플로우:**
1. 마이그레이션할 JS 파일 분석
2. .js → .ts 이름 변경
3. 타입 어노테이션 추가 (가능하면 추론)
4. 타입 오류 수정
5. import 업데이트
6. TypeScript 컴파일러 실행
7. 테스트 실행
8. 마이그레이션 요약 보고
</details>

---

## 핵심 정리

1. **실제 시스템은 모든 컴포넌트 유형을 조합** - Command가 Skill을 사용하는 Agent를 트리거
2. **명확한 단계** - 복잡한 워크플로우를 별개의 단계로 분해
3. **모든 단계에서 오류 처리** - 실패를 계획
4. **Skill은 재사용 가능한 지식 제공** - 전문 지식을 에이전트에 하드코딩하지 마세요
5. **흐름 문서화** - 미래 유지보수자가 이해해야 함

---

## 다음 모듈

[모듈 6: 안티패턴 및 베스트 프랙티스](./06-anti-patterns.ko.md) - 무엇을 하면 안 되는지와 일반적인 실수를 방지하는 방법을 배웁니다.
