---
title: "Claude Code Skill 활성화 신뢰성"
description: "Hook, 샌드박스 평가, forced-eval 커밋먼트 메커니즘을 활용한 Claude Code Skill 활성화율 측정 및 개선 실습 과정"
type: index
tags: [AI, Testing, BestPractice]
related: [./README.en.md]
---

# Claude Code Skill 활성화 신뢰성

> Hook, 샌드박스 평가, 커밋먼트 메커니즘으로 50% Skill 활성화 문제를 해결합니다

## 과정 개요

Claude Code의 Skill은 강력하지만, 신뢰할 수 없습니다. Skill이 올바르게 구성되어 있어도 Claude는 약 절반의 확률로 Skill을 건너뛰고 도메인 지식 없이 바로 구현에 들어갑니다. 이 과정에서는 그 원인과 해결 방법을 배웁니다.

전체 파이프라인을 학습합니다: 활성화와 선택의 구분 이해, Hook 메커니즘 구성, Daytona를 활용한 샌드박스 평가 하네스 구축, 약 250회 호출에 대한 결과 분석, 그리고 최종 솔루션 배포(forced-eval Hook: 100% 활성화, 0% 오탐). 연구 비용은 총 $5.59이며 재현 가능한 실증적 결과를 도출했습니다.

이 과정은 Scott Spence의 실증 연구를 기반으로 하며, 격리된 Daytona 샌드박스에서 Claude Code의 `claude -p` CLI에 대해 5가지 Hook 구성을 테스트한 결과입니다.

## 대상

- Skill이 항상 활성화되지 않는 것을 경험한 **Claude Code 사용자**
- LLM용 Skill/플러그인 시스템을 설계하는 **AI 도구 개발자**
- 커밋먼트 메커니즘과 구조화된 프롬프팅에 관심 있는 **프롬프트 엔지니어**
- 재현 가능한 LLM 평가 파이프라인을 구축하려는 **DevOps 엔지니어**

## 사전 요건

- Claude Code 기본 사용법 (Skill, `.claude/settings.json`)
- Shell 스크립팅(bash) 기본 지식
- JSON/JSONL 형식 이해
- 선택사항: TypeScript 및 Docker/샌드박스 지식 (Module 3용)

---

## 과정 모듈

| # | 모듈 | 소요 시간 | 설명 |
|---|------|----------|------|
| 1 | [문제점과 기준선](./01-problem-and-baseline.ko.md) | 20분 | Skill 활성화 실패 원인, 키워드 vs 의미 매칭, 모델 차이 |
| 2 | [Hook 구성](./02-hook-configurations.ko.md) | 25분 | 5가지 Hook 접근법 분석: 무설정부터 forced-eval, LLM-eval까지 |
| 3 | [평가 하네스](./03-eval-harness.ko.md) | 30분 | Daytona 샌드박스와 JSONL 파싱으로 재현 가능한 LLM 평가 구축 |
| 4 | [결과 분석](./04-results-analysis.ko.md) | 25분 | 구성별 데이터 기반 비교, 오탐 분석, 분산 |
| 5 | [구현 가이드](./05-implementation-guide.ko.md) | 20분 | 자신의 프로젝트에 forced-eval을 단계별로 설정 |

**총 소요 시간:** 약 2시간

---

## 학습 경로

### 빠른 해결 트랙 (Module 1, 2, 5)

지금 당장 Skill 활성화를 해결하고 싶다면:

```
Module 1: 문제점
    │
    │  학습: Skill이 활성화되지 않는 이유
    │  이해: 활성화 ≠ 선택
    │
    ▼
Module 2: Hook 구성
    │
    │  학습: forced-eval의 작동 원리
    │  비교: 5가지 접근법
    │
    ▼
Module 5: 구현 가이드
    │
    │  실행: forced-eval Hook 설정
    │  검증: 활성화 확인
    │
    ▼
Skill이 항상 활성화됩니다!
```

### 심화 학습 트랙 (전체 Module)

방법론을 이해하고 자체 평가를 구축하고 싶다면:

```
Module 1: 문제점과 기준선
    │
    ▼
Module 2: Hook 구성
    │
    ▼
Module 3: 평가 하네스
    │
    │  구축: Daytona 샌드박스 파이프라인
    │  파싱: JSONL 스트림 출력
    │
    ▼
Module 4: 결과 분석
    │
    │  분석: 250회 이상의 호출
    │  비교: 표준 vs 엣지 케이스
    │
    ▼
Module 5: 구현 가이드
    │
    ▼
나만의 LLM 평가를 구축하세요!
```

---

## 빠른 참조

### 핵심 문제

| 항목 | 결과 |
|------|------|
| **기준선 활성화율** | ~50-55% (Sonnet 4.5) |
| **Haiku 활성화율** | ~0% (Skill 사용에 너무 작은 모델) |
| **근본 원인** | 의미 이해가 아닌 키워드 매칭 |
| **핵심 통찰** | 활성화 ≠ 선택 (활성화되면 항상 올바른 Skill 선택) |

### Hook 비교

| 구성 | 활성화율 | 오탐율 | 지연 시간 | 판정 |
|------|---------|--------|----------|------|
| none | 50-55% | N/A | 8.7s | 기준선 |
| simple | 50-59% | N/A | 8.6s | 개선 없음 |
| **forced-eval** | **100%** | **0%** | 10.7s | **최선** |
| llm-eval | 100% | 80% (엣지) | 6.4s | 빠르지만 환각 |
| type-prompt | 41-55% | N/A | 9.6s | 무용 |

### 최종 솔루션

```bash
# .claude/hooks/force-eval.sh
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE
Step 1 - EVALUATE: For each skill, state [skill-name] - YES/NO - [reason]
Step 2 - ACTIVATE: Call Skill() for YES skills
Step 3 - IMPLEMENT: Only after Step 2 complete
CRITICAL: You MUST call Skill() in Step 2. Do NOT skip to implementation.
EOF
```

---

## 출처 자료

| 출처 | 설명 |
|------|------|
| [연구 원문](https://scottspence.com/posts/measuring-claude-code-skill-activation-with-sandboxed-evals) | Scott Spence의 원본 연구 (2026년 2월) |
| [svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) | Hook이 포함된 참조 구현 |
| [연구 노트](../research/) | 로컬 연구 분석 자료 |

---

## 핵심 용어

| 용어 | 정의 |
|------|------|
| **Skill** | Claude Code가 `Skill()` 도구를 통해 로드하는 재사용 가능한 도메인 지식 |
| **활성화(Activation)** | Claude가 `Skill()`을 호출하는지 여부 |
| **선택(Selection)** | Claude가 어떤 Skill을 선택하는지 (활성화 시 항상 올바름) |
| **Hook** | Claude Code 이벤트(예: `UserPromptSubmit`)에 의해 트리거되는 스크립트 |
| **Forced-eval** | 3단계 커밋먼트 메커니즘: 평가 → 활성화 → 구현 |
| **Daytona** | 재현 가능한 테스트를 위한 샌드박스 개발 환경 |
| **JSONL** | `claude -p --output-format stream-json`이 사용하는 줄 단위 JSON 형식 |

---

## 버전

- **v1.0.0** — 초판 (2026년 2월)
- 실증 연구 기반: 약 250회 호출, 총 비용 $5.59
