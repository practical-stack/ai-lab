---
title: "Hook 구성"
description: "단순 echo부터 forced-eval 커밋먼트 메커니즘까지, Claude Code Skill 활성화를 개선하는 5가지 Hook 접근법 심화 분석"
type: tutorial
tags: [AI, Architecture, BestPractice]
order: 2
depends_on: [./01-problem-and-baseline.ko.md]
related: [./02-hook-configurations.en.md, ./03-eval-harness.ko.md]
---

# Module 2: Hook 구성

> Skill 활성화를 강제하는 5가지 접근법 — 무동작에서 100% 신뢰성까지

## 학습 목표

이 모듈을 완료하면 다음을 할 수 있습니다:
- Claude Code Hook이 `UserPromptSubmit` 이벤트를 통해 어떻게 작동하는지 설명
- 5가지 Hook 구성과 각각의 트레이드오프를 비교
- Forced-eval Hook이 100% 활성화를 달성하는 이유를 분석
- `type: prompt` Hook이 효과가 없는 이유를 이해
- 구조화된 LLM 동작을 위한 커밋먼트 메커니즘 설계

---

## 2.1 Claude Code Hook의 작동 원리

Claude Code Hook은 세션 중 특정 이벤트에 의해 트리거되는 스크립트입니다. `.claude/settings.json`에서 구성합니다:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/my-hook.sh"
      }
    ]
  }
}
```

### Hook 이벤트

| 이벤트 | 실행 시점 | 사용 사례 |
|--------|----------|----------|
| `UserPromptSubmit` | 사용자가 프롬프트를 보낸 후, Claude가 처리하기 전 | 전처리, Skill 강제 |
| `Stop` | Claude가 응답을 완료한 후 | 후처리, 로깅 |
| `SubagentStop` | 하위 에이전트가 완료된 후 | 하위 에이전트 조정 |

### Hook 유형

| 유형 | 동작 | 출력 처리 |
|------|------|----------|
| `command` | Shell 스크립트 실행 | stdout이 Claude 컨텍스트에 앞에 추가됨 |
| `prompt` | 정적 프롬프트 제공 | 시스템 지침으로 주입됨 |

핵심 세부사항: **`command` Hook의 stdout은 Claude의 입력 컨텍스트의 일부가 됩니다**. 스크립트가 출력하는 모든 내용을 Claude가 사용자 프롬프트를 처리하기 전에 봅니다. 이것이 forced-eval이 작동하는 메커니즘입니다.

---

## 2.2 구성: None (기준선)

대조군 — Hook이 구성되지 않은 상태입니다.

```json
{
  "hooks": {}
}
```

### 동작

Claude가 사용자 프롬프트를 받고 자체적으로 `Skill()`을 호출할지 결정합니다. Module 1에서 확인했듯이 표준 프롬프트에서 약 50-55% 활성화율을 보입니다.

### 결과

| 지표 | 표준 프롬프트 | 엣지 케이스 |
|------|-------------|-----------|
| 활성화율 | 50-55% | 더 낮음 |
| 오탐 | N/A | N/A |
| 평균 지연 시간 | 8.7s | — |

### 실패 원인

명시적 지침 없이 Claude는 `Skill()`을 선택사항으로 취급합니다. 기본 동작은 지식 로드보다 즉시 구현을 우선시합니다.

---

## 2.3 구성: Simple Echo

Claude에게 Skill을 확인하도록 상기시키는 최소한의 Hook입니다.

```bash
#!/bin/bash
echo "Remember to check and use available skills for this task."
```

### 구성

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/simple-echo.sh"
      }
    ]
  }
}
```

### 결과

| 지표 | 표준 프롬프트 | 엣지 케이스 |
|------|-------------|-----------|
| 활성화율 | 50-59% | N/A |
| 오탐 | N/A | N/A |
| 평균 지연 시간 | 8.6s | — |

### 실패 원인

부드러운 리마인더는 Claude의 동작을 바꾸지 않습니다. 지시가 너무 모호합니다 — "Skill 확인"은 의무감을 만들지 않습니다. Claude는 이를 요구가 아닌 제안으로 처리합니다. 일반적인 프롬프트 엔지니어링 실패: **정중한 요청은 기본 동작 패턴을 무시하지 못합니다**.

---

## 2.4 구성: Forced-Eval (최선의 솔루션)

명시적 Skill 평가를 강제하는 구조화된 3단계 커밋먼트 메커니즘입니다.

```bash
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
```

### 구성

```json
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
```

### 결과

| 지표 | 표준 프롬프트 | 엣지 케이스 |
|------|-------------|-----------|
| 활성화율 | **100%** | **75%** |
| 오탐 | **0%** | **0%** |
| 평균 지연 시간 | 10.7s | — |

### 작동 원리: 커밋먼트 메커니즘

Forced-eval Hook은 LLM 프롬프팅에 적용된 세 가지 행동 원칙으로 성공합니다:

**1. 명시적 열거가 평가를 강제함**

Claude에게 각 Skill에 대해 YES/NO를 나열하도록 요구하면 평가 단계를 건너뛸 수 없습니다. 열거가 인지적 체크포인트를 만듭니다.

**2. 이진 선택이 의무감을 생성함**

Skill에 "YES"를 쓰면 Claude가 이행하는 약속이 됩니다. 이것이 "커밋먼트 메커니즘"입니다 — Claude가 Skill이 관련 있다고 명시적으로 진술하면 `Skill()`을 호출할 가능성이 훨씬 높습니다.

**3. 순차적 단계가 단축을 방지함**

EVALUATE → ACTIVATE → IMPLEMENT 순서가 Claude의 구현 직행을 방지합니다. 각 단계가 다음 단계 시작 전에 완료되어야 합니다.

### 양방향 제약

Forced-eval Hook은 양방향으로 작동합니다:

| 방향 | 동작 | 결과 |
|------|------|------|
| **긍정** | 관련 Skill → YES → Skill() 호출 | 100% 활성화 |
| **부정** | 비관련 Skill → NO → Skill() 미호출 | 0% 오탐 |

이 양방향 효과가 forced-eval이 엣지 케이스에서 오탐이 0인 이유입니다 — 단순히 활성화를 강제하는 것이 아니라 *신중한* 활성화를 강제합니다.

---

## 2.5 구성: LLM-Eval

보조 LLM(Haiku)을 사용하여 Claude가 프롬프트를 처리하기 전에 Skill 관련성을 사전 분류합니다.

```bash
#!/bin/bash
# Haiku API를 호출하여 프롬프트를 Skill 설명과 대조 분류
# 반환: "ACTIVATE: skill-name-1, skill-name-2" 또는 "NONE"

PROMPT="$1"
SKILLS=$(cat .claude/skills/*/SKILL.md | head -50)

RESULT=$(curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "content-type: application/json" \
  -d "{
    \"model\": \"claude-haiku-4-5-20241022\",
    \"max_tokens\": 100,
    \"messages\": [{
      \"role\": \"user\",
      \"content\": \"Given these skills:\\n$SKILLS\\n\\nClassify this prompt: $PROMPT\\n\\nRespond with ACTIVATE: skill-names or NONE\"
    }]
  }" | jq -r '.content[0].text')

echo "Based on pre-analysis, activate these skills: $RESULT"
```

### 결과

| 지표 | 표준 프롬프트 | 엣지 케이스 |
|------|-------------|-----------|
| 활성화율 | **100%** | **67%** |
| 오탐 | 0% | **80% (5개 중 4개)** |
| 평균 지연 시간 | 6.4s | — |

### 빠르지만 결함 있는 이유

**속도 이점**: Haiku 호출은 빠르고(~1초), Claude에게 어떤 Skill을 활성화할지 미리 알려주므로 평가 단계를 건너뜁니다. 총 지연: forced-eval의 10.7s 대비 6.4s.

**오탐 문제**: Haiku는 엣지 케이스에서 과도하게 매칭합니다. 어떤 Skill과도 맞지 않는 프롬프트가 주어져도 Haiku는 여전히 Skill 활성화를 제안합니다(80% 오탐율). 이는 Claude가 관련 없는 지식을 로드하므로 Hook이 없는 것보다 나쁩니다.

**API 키 의존성**: 환경에 `ANTHROPIC_API_KEY`가 필요하여 운영 복잡성이 추가됩니다.

### LLM-Eval이 적합한 경우

| 시나리오 | 권장 |
|---------|------|
| 도메인 특화 프롬프트만 (엣지 케이스 없음) | ✅ 속도를 위한 LLM-eval |
| 혼합 프롬프트 (일부 매칭, 일부 미매칭) | ❌ forced-eval 사용 |
| API 키 미보유 | ❌ LLM-eval 사용 불가 |

---

## 2.6 구성: Type-Prompt

Command Hook 대신 Claude Code의 네이티브 `type: prompt` Hook 메커니즘을 사용합니다.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "prompt",
        "prompt": "Before implementing, evaluate each available skill and activate relevant ones using Skill()."
      }
    ]
  }
}
```

### 결과

| 지표 | 표준 프롬프트 | 엣지 케이스 |
|------|-------------|-----------|
| 활성화율 | 41-55% | N/A |
| 오탐 | N/A | N/A |
| 평균 지연 시간 | 9.6s | — |

### 무용한 이유

`type: prompt` Hook은 **기준선과 다르지 않으며** — 일부 실행에서는 *더 나쁩니다*. 직관에 반합니다: 시스템 레벨 프롬프트가 최소한 command Hook의 stdout 주입만큼은 효과적일 것으로 예상되기 때문입니다.

가능한 설명: `type: prompt` 지침은 `type: command` stdout과 다른 위치에 Claude의 컨텍스트에 주입됩니다. prompt Hook 내용은 우선순위가 낮은 시스템 지침으로 취급될 수 있는 반면, command stdout은 사용자 메시지 바로 앞에 추가되어 더 높은 주목도를 가집니다.

### 핵심 교훈

**모든 지침 주입 지점이 동일하지 않습니다.** 지침이 컨텍스트 윈도우의 어디에 나타나는지가 무엇을 말하는지만큼 중요합니다. Command Hook은 사용자 인접 컨텍스트에 주입하고, prompt Hook은 다른 시스템 프롬프트와 경쟁하는 시스템 지침 공간에 주입합니다.

---

## 2.7 비교 요약

| 구성 | 활성화율 | 오탐율 | 지연 시간 | API 키? | 판정 |
|------|---------|--------|----------|---------|------|
| none | 50-55% | N/A | 8.7s | 불필요 | 기준선 |
| simple | 50-59% | N/A | 8.6s | 불필요 | 무의미 |
| **forced-eval** | **100%** | **0%** | 10.7s | 불필요 | **최선** |
| llm-eval | 100% | 80% (엣지) | 6.4s | 필요 | 빠르지만 위험 |
| type-prompt | 41-55% | N/A | 9.6s | 불필요 | 무용 |

### 결정 매트릭스

```
안정적인 활성화가 필요한가?
  ├─ 예: 정확도보다 속도가 필요한가?
  │    ├─ 예: llm-eval (오탐 위험 수용)
  │    └─ 아니오: forced-eval (권장)
  └─ 아니오: Hook 불필요 (~50% 활성화 수용)
```

---

## 핵심 요약

- Claude Code Hook은 프롬프트 처리 전 `UserPromptSubmit` 이벤트로 지침을 주입
- 단순한 리마인더("Skill 확인")는 동작을 바꾸지 않음 — 구체성과 구조가 중요
- **Forced-eval**은 3단계 커밋먼트 메커니즘(평가 → 활성화 → 구현)으로 100% 활성화 달성
- 커밋먼트는 양방향 작동: 관련 Skill 활성화 강제 AND 비관련 Skill 자제 강제
- LLM-eval은 빠르지만 엣지 케이스에서 80% 오탐 발생
- `type: prompt` Hook은 Hook이 없는 것과 동일 — 지침 주입 위치가 중요
- Forced-eval의 ~2초 지연 추가(10.7s vs 기준선 8.7s)는 100% 신뢰성 대비 무시할 수준

## 연습문제

### 연습문제 2.1: Hook 설계

다음 Skill이 있는 프로젝트에 forced-eval Hook 스크립트를 작성하세요:
- `react-patterns`: React 컴포넌트 모범 사례
- `api-conventions`: REST API 명명 및 오류 처리
- `testing-standards`: Jest/Vitest 테스트 구조

3단계 패턴을 따라 작성하세요. 다음 프롬프트에 대해 정신적으로 테스트하세요:
1. "사용자 프로필 컴포넌트 생성"
2. "API 엔드포인트에 오류 처리 추가"
3. "인증 모듈 단위 테스트 작성"
4. "README 업데이트"

### 연습문제 2.2: 결과 예측

각 Hook 구성에 대해 "더 나은 성능을 위해 데이터베이스 쿼리 리팩터링" 프롬프트의 활성화 결과를 예측하세요:
1. Hook 없음
2. Simple echo
3. Forced-eval (Skill: `db-optimization`, `code-style`, `testing`)
4. LLM-eval
5. Type-prompt

### 연습문제 2.3: 실패 분석

이 Hook이 활성화를 개선하지 못하는 이유는 무엇인가요?

```bash
#!/bin/bash
echo "Skills are available. Use them if needed."
```

커밋먼트 메커니즘 패턴을 사용하여 다시 작성하세요. 어떤 구체적인 변경이 차이를 만드나요?

---

## 다음 단계

[Module 3: 평가 하네스](./03-eval-harness.ko.md)로 계속하여 이러한 구성이 샌드박스 환경에서 어떻게 재현 가능하게 테스트되었는지 알아보세요.
