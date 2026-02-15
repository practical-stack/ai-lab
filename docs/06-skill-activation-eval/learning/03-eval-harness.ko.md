---
title: "평가 하네스"
description: "Daytona 샌드박스, TypeScript 오케스트레이션, JSONL 스트림 파싱을 활용한 재현 가능한 LLM 평가 구축"
type: tutorial
tags: [AI, Testing, TypeScript]
order: 3
depends_on: [./02-hook-configurations.ko.md]
related: [./03-eval-harness.en.md, ./04-results-analysis.ko.md]
---

# Module 3: 평가 하네스

> 격리된 샌드박스에서 LLM 동작을 테스트하는 재현 가능한 파이프라인 구축

## 학습 목표

이 모듈을 완료하면 다음을 할 수 있습니다:
- LLM 동작 테스트를 위한 평가 하네스 아키텍처 설계
- 격리되고 재현 가능한 테스트 환경을 위해 Daytona 샌드박스 사용
- `claude -p`의 JSONL 스트림 출력을 파싱하여 tool_use 이벤트 감지
- Claude의 런타임 동작 제어를 위한 모니터 스크립트 패턴 구현
- 타임아웃과 플래그 기반 조기 종료로 평가 실행 최적화

---

## 3.1 샌드박스 평가가 필요한 이유

로컬 머신에서 LLM 동작을 테스트하는 것은 신뢰할 수 없습니다:

| 문제 | 영향 |
|------|------|
| **상태 누출** | 이전 실행이 이후 동작에 영향 |
| **환경 변화** | 시스템 수준 변경이 결과를 변경 |
| **비재현성** | 결과를 공유하거나 검증할 수 없음 |
| **위험** | Claude가 실제 프로젝트 파일을 수정할 수 있음 |

### 샌드박스 솔루션

각 평가 실행은 **새로운 격리된 Daytona 샌드박스**를 받습니다:
- 깨끗한 파일 시스템 (Skill과 Hook이 새로 복사됨)
- 이전 실행의 상태 없음
- 일관된 환경 (동일 OS, 패키지, CLI 버전)
- 안전한 실행 (호스트 머신에 영향 없음)

```
┌─────────────────────────────────────┐
│  Orchestrator (로컬 머신)            │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Sandbox 1 │  │ Sandbox 2 │  ...  │
│  │ 구성: A   │  │ 구성: B   │       │
│  │ 프롬프트: 1│  │ 프롬프트: 1│       │
│  └──────────┘  └──────────┘        │
│                                     │
│  결과 → JSONL → 파싱 → 비교         │
└─────────────────────────────────────┘
```

---

## 3.2 아키텍처 개요

평가 하네스는 4개 컴포넌트로 구성됩니다:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Orchestrator │────▶│   Sandbox   │────▶│ Claude CLI   │────▶│   Parser    │
│ (TypeScript) │     │  (Daytona)  │     │ (claude -p)  │     │  (JSONL)    │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │                     │
       │  샌드박스 생성     │  claude -p 실행    │  JSONL 스트리밍      │
       │  파일 복사         │  Hook 구성 적용    │  tool_use 이벤트     │
       │  실행 트리거       │  타임아웃 설정     │  Skill 활성화        │
       └──────────────────▶└───────────────────▶└────────────────────▶│
                                                                      │
                                                              결과 수집
```

### 컴포넌트 역할

| 컴포넌트 | 역할 | 기술 |
|---------|------|------|
| **Orchestrator** | 샌드박스 생성, 구성 복사, 프롬프트 실행, 결과 수집 | TypeScript + `@daytonaio/sdk` |
| **Sandbox** | Claude CLI와 프로젝트 파일이 있는 격리 환경 | Daytona |
| **Claude CLI** | 구성된 Hook과 Skill로 프롬프트 처리 | `claude -p` |
| **Parser** | JSONL 스트림 출력에서 tool_use 이벤트 추출 | 줄별 JSON 파싱 |

---

## 3.3 Orchestrator

Orchestrator는 각 평가 실행의 전체 수명주기를 관리합니다.

### 핵심 루프

```typescript
import { Daytona } from '@daytonaio/sdk';

interface EvalConfig {
  hookType: 'none' | 'simple' | 'forced-eval' | 'llm-eval' | 'type-prompt';
  prompts: string[];
  skills: string[];
  runs: number;
}

async function runEvaluation(config: EvalConfig) {
  const daytona = new Daytona();
  const results: EvalResult[] = [];

  for (const prompt of config.prompts) {
    for (let run = 0; run < config.runs; run++) {
      // 1. 새 샌드박스 생성
      const sandbox = await daytona.create();

      // 2. Skill과 Hook 구성 복사
      await copySkills(sandbox, config.skills);
      await copyHookConfig(sandbox, config.hookType);

      // 3. JSONL 출력으로 claude -p 실행
      const output = await runClaude(sandbox, prompt);

      // 4. 결과 파싱
      const result = parseJSONL(output);
      results.push(result);

      // 5. 정리
      await sandbox.delete();
    }
  }

  return results;
}
```

### 샌드박스별 파일 설정

각 샌드박스는 다음과 같이 초기화됩니다:

```
sandbox/
├── .claude/
│   ├── settings.json          # Hook 구성
│   ├── hooks/
│   │   └── force-eval.sh      # Hook 스크립트 (해당 시)
│   └── skills/
│       ├── skill-1/SKILL.md
│       ├── skill-2/SKILL.md
│       └── skill-3/SKILL.md
├── src/                       # 최소 프로젝트 구조
│   └── routes/
│       └── +page.svelte
└── monitor.sh                 # 런타임 모니터 (선택사항)
```

---

## 3.4 Claude CLI 호출

각 샌드박스에서 Claude를 실행하는 핵심 명령:

```bash
claude -p "$PROMPT" \
  --output-format stream-json \
  --max-turns 1 \
  --allowedTools "Skill"
```

### 플래그 분석

| 플래그 | 목적 | 이유 |
|--------|------|------|
| `-p` | 파이프 모드 (비대화형) | 스크립트 실행 가능 |
| `--output-format stream-json` | JSONL 출력 | 기계 파싱 가능한 이벤트 |
| `--max-turns 1` | 단일 턴만 | 멀티턴 복잡성 방지 |
| `--allowedTools "Skill"` | Skill 도구로 제한 | 측정 대상 격리 |

### `--allowedTools "Skill"`의 이유

Claude를 Skill 도구만으로 제한하면:
1. 이후 동작에 영향을 줄 수 있는 파일 쓰기 방지
2. 측정을 Skill 활성화만으로 격리
3. 파싱 간소화 (Skill tool_use 이벤트만 탐색)
4. 실행 시간 단축 (Claude가 구현 작업에 빠지지 않음)

### 타임아웃: 20초 최적화

```typescript
const TIMEOUT_MS = 20_000; // 20초

async function runClaude(sandbox: Sandbox, prompt: string): Promise<string> {
  const proc = sandbox.exec(
    `claude -p "${prompt}" --output-format stream-json --max-turns 1 --allowedTools "Skill"`,
    { timeout: TIMEOUT_MS }
  );

  return proc.stdout;
}
```

20초인 이유는 실행 시간 분석 결과:
- Skill 활성화 결정은 5-10초 내에 발생
- 구현(불필요)은 10-30초 이상 소요
- 20초는 모든 활성화 이벤트를 포착하면서 불필요한 작업을 차단
- 비용 절감: 짧은 실행 = 적은 토큰 = 낮은 비용

---

## 3.5 모니터 스크립트

런타임 제어를 제공하는 선택적이지만 강력한 컴포넌트:

```bash
#!/bin/bash
# monitor.sh - 런타임 동작 제어

FLAG_FILE="/tmp/eval-complete"

# Skill() 활성화 감시
tail -f /tmp/claude-output.jsonl | while read line; do
  if echo "$line" | jq -e '.type == "content_block_start" and
    .content_block.type == "tool_use" and
    .content_block.name == "Skill"' > /dev/null 2>&1; then

    echo "SKILL_ACTIVATED: $(echo $line | jq -r '.content_block.input.skill_name')"
    touch "$FLAG_FILE"
  fi
done &

# 타임아웃 워치독
sleep 20 && kill -TERM $CLAUDE_PID 2>/dev/null &
```

### 모니터 플래그

| 플래그 | 목적 |
|--------|------|
| `SKILL_ACTIVATED` | Skill() 호출 감지 시 로그 |
| `/tmp/eval-complete` | 활성화 감지 시 생성 (조기 종료용) |
| 타임아웃 워치독 | 20초 후 무조건 Claude 프로세스 종료 |

### 모니터가 필요한 이유

모니터는 다음을 가능하게 합니다:
1. **조기 종료**: Skill 활성화가 감지되면 전체 응답을 기다릴 필요 없음
2. **실시간 로깅**: 활성화 이벤트가 발생하는 대로 확인
3. **실패 감지**: 플래그 파일 없이 타임아웃 = 활성화 없음

---

## 3.6 JSONL 파싱

`--output-format stream-json` 플래그는 JSONL(줄당 하나의 JSON 객체)을 생성합니다:

### 이벤트 유형

```jsonl
{"type":"message_start","message":{"id":"msg_xxx","model":"claude-sonnet-4-5-20250514"}}
{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}
{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"I'll "}}
{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","id":"toolu_xxx","name":"Skill","input":{}}}
{"type":"content_block_delta","index":1,"delta":{"type":"input_json_delta","partial_json":"{\"skill_name\":"}}
{"type":"content_block_stop","index":1}
{"type":"message_stop"}
```

### 찾는 대상

핵심 이벤트는 `type: "tool_use"`와 `name: "Skill"`을 가진 `content_block_start`입니다:

```typescript
interface ToolUseEvent {
  type: 'content_block_start';
  content_block: {
    type: 'tool_use';
    name: string;      // "Skill"이 목표
    input: {
      skill_name: string;  // 어떤 Skill이 활성화되었는지
    };
  };
}

function detectSkillActivation(jsonlOutput: string): ActivationResult {
  const lines = jsonlOutput.split('\n').filter(Boolean);
  const activations: string[] = [];

  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      if (
        event.type === 'content_block_start' &&
        event.content_block?.type === 'tool_use' &&
        event.content_block?.name === 'Skill'
      ) {
        activations.push(event.content_block.input?.skill_name || 'unknown');
      }
    } catch {
      // 형식이 잘못된 줄 건너뛰기
    }
  }

  return {
    activated: activations.length > 0,
    skills: activations,
    totalEvents: lines.length,
  };
}
```

### 파싱 주의사항

| 이슈 | 해결 |
|------|------|
| `input_json_delta`의 부분 JSON | delta가 아닌 `content_block_start`만 확인 |
| 다중 Skill 활성화 | 첫 번째만이 아닌 모든 tool_use 이벤트 수집 |
| 타임아웃 시 형식 오류 줄 | try-catch로 감싸고 불량 줄 건너뛰기 |
| 큰 출력 파일 | 전체 파일 로드 대신 줄별 스트림 파싱 |

---

## 3.7 비용과 규모

전체 구성에 걸친 완전한 평가:

| 지표 | 값 |
|------|-----|
| 총 호출 수 | ~250 |
| 총 비용 | $5.59 |
| 호출당 비용 | ~$0.02 |
| 평균 실행 시간 | 8-11s |
| 총 소요 시간 | ~45분 |

### 구성별 비용 분석

| 구성 | 호출 수 | 추정 비용 |
|------|--------|----------|
| none | ~50 | ~$1.00 |
| simple | ~50 | ~$1.00 |
| forced-eval | ~50 | ~$1.20 |
| llm-eval | ~50 | ~$1.19 (+Haiku) |
| type-prompt | ~50 | ~$1.20 |

### 비용 최적화 팁

1. **`--max-turns 1` 사용**: 멀티턴 비용 증가 방지
2. **`--allowedTools` 사용**: 비싼 도구 호출 제한
3. **20초 타임아웃**: 활성화 감지 후 비싼 생성 차단
4. **사전 분류에 Haiku**: 단순 작업에 Sonnet보다 저렴
5. **구성별 배치**: 구성당 모든 프롬프트 실행하여 샌드박스 오버헤드 최소화

---

## 핵심 요약

- 샌드박스 환경(Daytona)은 재현 가능한 LLM 평가에 필수 — 상태 누출은 결과를 무효화
- 하네스는 간단한 패턴을 따름: 샌드박스 생성 → 파일 복사 → CLI 실행 → 출력 파싱 → 결과 수집
- `claude -p --output-format stream-json`은 기계 파싱 가능한 tool_use 이벤트가 있는 JSONL 생성
- `--max-turns 1`과 `--allowedTools "Skill"`은 측정을 Skill 활성화만으로 격리
- 20초 타임아웃은 모든 활성화 결정을 포착하면서 비용을 최적화
- 모니터 스크립트는 실시간 감지와 조기 종료 가능
- 전체 평가 비용: 약 250회 호출에 $5.59 — LLM 평가는 저렴할 수 있음

## 연습문제

### 연습문제 3.1: 평가 매트릭스 설계

3가지 Hook 구성을 8개 프롬프트에 대해 각 3회 실행하여 테스트하고 싶습니다. 계산하세요:
1. 필요한 총 샌드박스 호출 수
2. 호출당 $0.02 기준 추정 비용
3. 호출당 10초 기준 추정 소요 시간 (순차 실행)
4. 소요 시간을 줄이기 위해 어떻게 병렬화하겠습니까?

### 연습문제 3.2: JSONL 파서 작성

다음 JSONL 출력에서 모든 Skill 활성화를 추출하는 함수를 작성하세요:

```jsonl
{"type":"message_start","message":{"id":"msg_01"}}
{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}
{"type":"content_block_start","index":1,"content_block":{"type":"tool_use","name":"Skill","input":{"skill_name":"svelte-routing"}}}
{"type":"content_block_stop","index":1}
{"type":"content_block_start","index":2,"content_block":{"type":"tool_use","name":"Skill","input":{"skill_name":"svelte-forms"}}}
{"type":"content_block_stop","index":2}
{"type":"message_stop"}
```

기대 출력: `["svelte-routing", "svelte-forms"]`

### 연습문제 3.3: 버그 찾기

이 Orchestrator 코드에는 결과를 무효화하는 버그가 있습니다. 찾아보세요:

```typescript
const sandbox = await daytona.create();

for (const config of configs) {
  await copyHookConfig(sandbox, config);
  for (const prompt of prompts) {
    const result = await runClaude(sandbox, prompt);
    results.push(result);
  }
}

await sandbox.delete();
```

힌트: 구성 간 상태 누출을 생각해보세요.

---

## 다음 단계

[Module 4: 결과 분석](./04-results-analysis.ko.md)으로 계속하여 하네스 데이터가 구성별 패턴을 어떻게 드러내는지 확인하세요.
