---
title: "Frontmatter 방법론 리서치 자료"
description: "AI/LLM 친화적 Frontmatter 설계 방법론 도출을 위한 DeepSearch 리서치 과정과 결과물"
type: index
tags: [Documentation, AI, Frontmatter, BestPractice]
---

# Frontmatter 방법론 리서치 자료

[00-guide.md](../00-guide.md) 도출을 위한 리서치 과정과 결과물입니다.

## 리서치 과정

```
1️⃣ 메타프롬프트 설계
   └── 00-meta-prompt.md

2️⃣ 1차 DeepSearch (3개 AI 모델)
   └── raw-results/
       ├── 01-gpt.md      (GraphRAG 아키텍처 관점)
       ├── 02-gemini.md   (URN/JSON Schema 관점)
       └── 03-claude.md   (실용적 최소 스키마 관점)

3️⃣ 2차 종합 분석
   └── synthesized-results/
       ├── 01-gpt.md      (GPT 종합 분석)
       ├── 02-gemini.md   (Gemini 종합 분석)
       └── 03-claude.md   (Claude 종합 분석)

4️⃣ 최종 방법론 도출
   └── ../00-guide.md
```

## 파일 설명

| 파일 | 설명 |
|------|------|
| [00-meta-prompt.md](./00-meta-prompt.md) | DeepSearch에 사용된 메타프롬프트 |
| [raw-results/](./raw-results/) | 1차 AI 리서치 원본 결과 |
| [synthesized-results/](./synthesized-results/) | 2차 종합 분석 결과 |

## 핵심 발견

| AI 모델 | 핵심 관점 | 복잡도 | 채택 여부 |
|---------|----------|--------|----------|
| GPT | GraphRAG 파이프라인, 6단계 마이그레이션 | 높음 | 마이그레이션 로드맵 참고 |
| Gemini | URN 기반 ID, JSON Schema 검증 | 매우 높음 | 불채택 (과도함) |
| Claude | 실용적 최소 스키마, 즉시 적용 가능 | 낮음 | **기반 채택** |

## 결론

Claude의 실용적 스키마를 기반으로, GPT의 점진적 마이그레이션 로드맵과 Gemini의 관계 정의 일부를 결합한 **"Minimal Viable Frontmatter"** 접근법 채택.

→ 최종 결과: [../00-guide.md](../00-guide.md)
