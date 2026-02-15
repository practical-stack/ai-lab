---
title: "구현 가이드"
description: "자신의 프로젝트에서 안정적인 Claude Code Skill 활성화를 위한 forced-eval Hook 단계별 설정"
type: tutorial
tags: [AI, BestPractice, Setup]
order: 5
depends_on: [./04-results-analysis.ko.md]
related: [./05-implementation-guide.en.md]
---

# Module 5: 구현 가이드

> 10분 안에 프로젝트에 100% Skill 활성화를 설정하세요

## 학습 목표

이 모듈을 완료하면 다음을 할 수 있습니다:
- 모든 Claude Code 프로젝트에 forced-eval Hook 설정
- Hook 통합을 위한 `.claude/settings.json` 구성
- Skill 활성화가 100%에 도달하는지 테스트 및 검증
- 자신의 Skill 세트에 맞게 Hook 템플릿 조정
- Hook 구성의 일반적인 문제 해결

---

## 5.1 사전 요건 확인

시작하기 전에 환경을 확인하세요:

| 요구사항 | 확인 명령 | 예상 결과 |
|---------|----------|----------|
| Claude Code CLI | `claude --version` | v1.x 이상 |
| 기존 프로젝트 | `ls .claude/` | 디렉터리 존재 |
| 최소 하나의 Skill | `ls .claude/skills/` | Skill 디렉터리 존재 |
| Bash 사용 가능 | `which bash` | `/bin/bash` 또는 유사 경로 |

### Skill이 아직 없는 경우

먼저 최소한의 Skill을 생성하세요:

```bash
mkdir -p .claude/skills/my-skill
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: Project coding conventions and patterns. Use when implementing
  features, writing code, or making architectural decisions.
---
# My Skill

## Conventions
- Use TypeScript strict mode
- Follow the repository's naming conventions
- Write tests for all new functions
EOF
```

---

## 5.2 Hook 스크립트 생성

### 단계 1: hooks 디렉터리 생성

```bash
mkdir -p .claude/hooks
```

### 단계 2: forced-eval 스크립트 생성

```bash
cat > .claude/hooks/force-eval.sh << 'SCRIPT'
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Before implementing ANYTHING, you MUST complete these steps IN ORDER:

Step 1 - EVALUATE: For EACH available skill, explicitly state:
  [skill-name] - YES/NO - [one-line reason why it's relevant or not]

Step 2 - ACTIVATE: For every skill you marked YES, call the Skill() tool
  to load its contents. Do this BEFORE any implementation.

Step 3 - IMPLEMENT: Only AFTER completing Steps 1 and 2, proceed with
  the user's request using the loaded skill knowledge.

CRITICAL: You MUST call Skill() in Step 2 for all YES skills.
Do NOT skip directly to implementation.
Do NOT say "I'll keep the skill in mind" — you must CALL Skill().
EOF
SCRIPT
```

### 단계 3: 실행 권한 부여

```bash
chmod +x .claude/hooks/force-eval.sh
```

### 검증

```bash
# 스크립트가 올바르게 출력하는지 테스트
.claude/hooks/force-eval.sh
```

예상 출력: "INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE"로 시작하는 전체 지시 텍스트

---

## 5.3 settings.json 구성

### 단계 1: settings.json 찾기 또는 생성

```bash
# 존재 여부 확인
cat .claude/settings.json 2>/dev/null || echo "File doesn't exist yet"
```

### 단계 2: Hook 구성 추가

`settings.json`이 존재하지 않는 경우:

```bash
cat > .claude/settings.json << 'EOF'
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/force-eval.sh"
      }
    ]
  }
}
EOF
```

`settings.json`이 이미 존재하는 경우 `hooks` 키를 추가하세요. 병합 예시:

```json
{
  "permissions": {
    "allow": ["Skill"]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/force-eval.sh"
      }
    ]
  }
}
```

### 중요 사항

| 설정 | 이유 |
|------|------|
| `type: "command"` | `command`여야 하며, `prompt`는 안 됨 (prompt Hook은 작동하지 않음) |
| `UserPromptSubmit` | Claude가 프롬프트를 처리하기 전에 실행 |
| 상대 경로 | `.claude/hooks/force-eval.sh`는 프로젝트 루트에서 해석됨 |

---

## 5.4 설정 테스트

### 빠른 검증

Skill을 활성화해야 하는 프롬프트로 Claude를 실행하세요:

```bash
claude -p "implement a new feature using the project conventions" \
  --output-format stream-json \
  --max-turns 1 2>&1 | grep -o '"name":"Skill"'
```

출력에서 `"name":"Skill"`이 보이면 활성화가 작동하고 있습니다.

### 상세 검증

```bash
claude -p "add a new API endpoint with proper error handling" \
  --output-format stream-json \
  --max-turns 1 2>&1 | while read line; do
    if echo "$line" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d.get('type') == 'content_block_start' and \
       d.get('content_block', {}).get('name') == 'Skill':
        print(f'ACTIVATED: {d[\"content_block\"][\"input\"].get(\"skill_name\", \"unknown\")}')
except: pass
" 2>/dev/null; then
        true
    fi
done
```

### Claude 응답에서 확인할 내용

Forced-eval이 활성 상태이면 Claude의 응답은 항상 다음과 같이 시작해야 합니다:

```
Step 1 - EVALUATE:
  [my-skill] - YES - This prompt involves implementing a feature,
    which matches the skill's focus on coding conventions

Step 2 - ACTIVATE:
  Loading my-skill...

Step 3 - IMPLEMENT:
  [Skill 지식을 사용한 구현]
```

Claude가 Step 1을 건너뛰고 바로 구현으로 넘어가면 Hook이 올바르게 구성되지 않은 것입니다.

---

## 5.5 자신의 Skill에 맞게 조정

### 다수의 Skill

Hook은 어떤 수의 Skill에도 자동으로 작동합니다. Claude가 Step 1에서 사용 가능한 모든 Skill을 열거합니다:

```
Step 1 - EVALUATE:
  [react-patterns] - YES - User is creating a React component
  [api-conventions] - NO - No API work in this prompt
  [testing-standards] - NO - User didn't ask for tests
  [accessibility] - YES - Component needs a11y compliance

Step 2 - ACTIVATE:
  Loading react-patterns...
  Loading accessibility...
```

### 스크립트 커스터마이징

컨텍스트에 맞게 Hook을 조정할 수 있습니다:

#### 옵션 A: 프로젝트별 컨텍스트 추가

```bash
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

[표준 3단계 지시...]

NOTE: This project uses a monorepo structure. Skills in /packages
apply to specific packages. Match skills to the relevant package.
EOF
```

#### 옵션 B: 특정 Skill 우선순위 지정

```bash
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

[표준 3단계 지시...]

PRIORITY SKILLS (always evaluate first):
- code-style: MUST be loaded for ANY code changes
- security: MUST be loaded for auth, API, or data handling
EOF
```

#### 옵션 C: Skill 메타데이터 추가

```bash
#!/bin/bash
# Skill 목록을 동적으로 표시
SKILLS=$(ls -d .claude/skills/*/SKILL.md 2>/dev/null | sed 's|.*/\(.*\)/SKILL.md|\1|')
cat <<EOF
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Available skills for evaluation: $SKILLS

[표준 3단계 지시...]
EOF
```

---

## 5.6 문제 해결

### 일반적인 문제

| 증상 | 원인 | 해결 |
|------|------|------|
| Hook이 실행되지 않음 | 잘못된 이벤트 이름 | `UserPromptSubmit` 사용 (정확한 대소문자) |
| 개선 없음 | `type: prompt` 사용 | `type: command`로 변경 |
| 권한 거부 | 스크립트가 실행 불가 | `chmod +x .claude/hooks/force-eval.sh` |
| 스크립트를 찾을 수 없음 | 잘못된 경로 | 프로젝트 루트 기준 상대 경로 사용 |
| Skill이 로드되지 않음 | 허용된 도구에 `Skill` 없음 | permissions allow 목록에 `"Skill"` 추가 |
| Hook이 실행되지만 무시됨 | 스크립트에 출력 없음 | `cat <<'EOF'` 블록 존재 확인 |

### 디버깅 단계

1. **스크립트를 수동으로 실행 검증:**
   ```bash
   bash .claude/hooks/force-eval.sh
   # 전체 지시가 출력되어야 함
   ```

2. **settings.json이 유효한 JSON인지 확인:**
   ```bash
   python3 -c "import json; json.load(open('.claude/settings.json'))"
   ```

3. **상세 출력으로 테스트:**
   ```bash
   claude -p "test prompt" --output-format stream-json 2>&1 | head -20
   ```

4. **컨텍스트에 Hook 출력이 나타나는지 확인:**
   Claude의 초기 추론에서 "MANDATORY SKILL ACTIVATION SEQUENCE" 텍스트를 찾으세요.

### 엣지 케이스

| 시나리오 | 동작 |
|---------|------|
| Skill이 구성되지 않음 | Hook이 실행되지만 Claude가 평가할 것이 없음 (무해) |
| Skill 디렉터리가 비어 있음 | Claude가 Step 1에서 Skill을 나열하지 않음 (무해) |
| 다중 Hook | 배열의 모든 Hook이 순서대로 실행, 출력이 연결됨 |
| Hook 스크립트 오류 | stderr는 무시됨; 빈 stdout = 주입 없음 |
| 매우 긴 Hook 출력 | 컨텍스트 윈도우를 소비할 수 있음; 지시를 간결하게 유지 |

---

## 5.7 파일 레이아웃 체크리스트

최종 프로젝트 구조에는 다음이 포함되어야 합니다:

```
your-project/
├── .claude/
│   ├── settings.json           # ← Hook 구성
│   ├── hooks/
│   │   └── force-eval.sh       # ← Hook 스크립트 (실행 가능)
│   └── skills/
│       ├── skill-1/
│       │   └── SKILL.md
│       ├── skill-2/
│       │   └── SKILL.md
│       └── .../
├── src/
└── ...
```

### 체크리스트

- [ ] `.claude/hooks/force-eval.sh`가 존재하고 실행 가능
- [ ] `.claude/settings.json`에 `type: command`와 함께 `UserPromptSubmit` Hook 존재
- [ ] Hook 스크립트가 3단계 지시 텍스트를 출력
- [ ] `.claude/skills/`에 최소 하나의 Skill이 구성됨
- [ ] 테스트 프롬프트가 Skill 활성화를 트리거
- [ ] 비매칭 프롬프트가 모든 Skill에 대해 올바르게 NO를 받음
- [ ] 설정 파일이 유효한 JSON

---

## 핵심 요약

- 설정은 10분 이내: 스크립트 생성 → 설정 구성 → 테스트
- Hook 스크립트는 `type: command`를 사용해야 함 (`prompt` 아님) — 가장 흔한 실수
- 스크립트는 실행 가능(`chmod +x`)하고 stdout을 생성해야 함
- Forced-eval은 어떤 수의 Skill에도 작동 — Claude가 사용 가능한 모든 것을 자동 열거
- 프로젝트 컨텍스트, 우선순위 Skill, 동적 Skill 목록에 맞게 Hook 커스터마이징
- 항상 매칭과 비매칭 프롬프트 모두로 테스트하여 양방향 동작 검증
- 2초 지연 비용은 100% 활성화의 신뢰성 향상 대비 무시할 수준

## 연습문제

### 연습문제 5.1: 전체 설정

현재 Claude Code 프로젝트에 forced-eval을 설정하세요:
1. Hook 스크립트 생성
2. settings.json 구성
3. 3개 프롬프트로 테스트 (매칭 1개, 비매칭 1개, 모호 1개)
4. Claude의 응답에 3단계 출력이 나타나는지 확인

### 연습문제 5.2: 커스텀 Hook

다음 요구사항을 가진 프로젝트에 커스텀 forced-eval Hook을 설계하세요:
- 모든 파일 변경에 대해 항상 `security` Skill 로드
- `react-patterns`와 `api-design`은 정상적으로 평가
- Hook 출력에 현재 git 브랜치 포함

전체 bash 스크립트를 작성하세요.

### 연습문제 5.3: 설정 평가

Module 3의 기법을 사용하여 미니 평가를 실행하세요:
1. 5개 테스트 프롬프트 생성 (매칭 3개, 비매칭 2개)
2. 각 프롬프트를 `claude -p`로 3회 실행
3. JSONL 출력에서 Skill 활성화 파싱
4. 활성화율과 오탐율 계산
5. 연구 기준선과 비교

---

## 과정 완료

축하합니다! Claude Code Skill 활성화 신뢰성에 대한 전체 과정을 완료했습니다. 이제 다음을 이해합니다:

- **왜** Skill이 실패하는지 (~50% 기준선, 키워드 기반 매칭)
- **어떻게** 해결하는지 (forced-eval Hook, 커밋먼트 메커니즘)
- **어떻게 측정**하는지 (Daytona 샌드박스, JSONL 파싱, 평가 하네스)
- **데이터가 무엇을 말하는지** (100% 활성화, 0% 오탐, 250회 호출에 $5.59)
- **어떻게 구현**하는지 (10분 설정, 스크립트 하나, 설정 하나)

### 다음은?

- 자신의 프로젝트에 forced-eval 적용
- 다른 LLM 동작에 대한 커스텀 평가 하네스 구축
- [svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) 참조 구현에 개선 기여
- 특정 사용 사례에 맞는 Hook 변형 실험

참고 자료와 핵심 용어는 [과정 개요](./README.ko.md)로 돌아가세요.
