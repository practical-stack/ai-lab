---
title: "Frontmatter 시스템 요구사항"
description: "docs 폴더 문서 메타데이터 시스템 설계를 위한 요구사항 정의, 문제 정의, 목표, 기능 요구사항, 비기능 요구사항을 정리한 문서입니다."
type: reference
tags: [Documentation, Frontmatter, Architecture]
order: 0
related: [./01-adr.md]
---

# Frontmatter 시스템 요구사항

> 이 문서는 docs 폴더 frontmatter 시스템 설계의 **요구사항 정의서**입니다.
> 
> - 관련 ADR: [01-adr.md](./01-adr.md)
> - 스키마 정의 (Source of Truth): [/.ai-agents/skills/docs-update-frontmatter/references/schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)

---

## 배경 및 문제 정의

### 현재 상황

| 항목 | 현황 |
|------|------|
| docs 파일 수 | 약 75개+ |
| Frontmatter 있는 파일 | 일부만 존재 |
| 문서 간 관계 정의 | 본문 링크만 존재 |
| AI 에이전트 문서 참조 | 하드코딩 경로 사용 |

### 해결하려는 문제

1. **AI 탐색 비효율**: AI 에이전트가 문서를 검색할 때 시맨틱 정보 부족으로 정확도 저하
2. **메타데이터 불일치**: 문서마다 다른 형식의 메타데이터 사용으로 자동화 불가
3. **관계 정보 부재**: 문서 간 의존성, 선후관계가 명시되지 않아 학습 경로 파악 어려움
4. **의존성 추적 불가**: 문서 수정 시 영향받는 AI 에이전트 파일 파악 불가

---

## 요구사항 정의

### 기능 요구사항 (Functional Requirements)

| # | 요구사항 | 설명 | 우선순위 |
|---|----------|------|:--------:|
| FR1 | **AI 검색 최적화** | AI 에이전트가 문서를 검색할 때 정확한 문서를 찾을 수 있어야 함 | P0 |
| FR2 | **문서 분류** | 문서 유형(guide, reference, pattern 등)을 명확히 구분해야 함 | P0 |
| FR3 | **관계 정의** | 문서 간 의존성, 연관성, 대체 관계를 표현할 수 있어야 함 | P1 |
| FR4 | **역방향 추적** | 문서를 참조하는 AI 에이전트를 추적할 수 있어야 함 | P1 |
| FR5 | **llms.txt 생성** | frontmatter 기반으로 llms.txt 자동 생성이 가능해야 함 | P2 |

### 비기능 요구사항 (Non-Functional Requirements)

| # | 요구사항 | 설명 | 측정 기준 |
|---|----------|------|----------|
| NFR1 | **유지보수성** | 개발자가 쉽게 작성하고 유지할 수 있어야 함 | 필수 필드 3개 이하 |
| NFR2 | **일관성** | 모든 문서가 동일한 스키마를 따라야 함 | 스키마 검증 통과율 100% |
| NFR3 | **점진적 도입** | 기존 문서를 단계적으로 마이그레이션 가능해야 함 | 문서 중단 없음 |
| NFR4 | **표준 호환** | llms.txt, AGENTS.md 등 신흥 AI 표준과 호환되어야 함 | 표준 스펙 준수 |

---

## 요구사항 근거

### FR1: AI 검색 최적화

**문제**: 벡터 검색만으로는 동음이의어 구분, 문맥 이해에 한계

**근거**:
- Microsoft GraphRAG 연구: 명시적 관계 그래프가 벡터 전용 RAG보다 복잡한 쿼리에서 3.4배 우수
- description 필드가 임베딩 벡터 생성의 핵심 소스로 활용됨

**해결책**: `title`, `description`, `type`, `tags` 메타데이터로 검색 정밀도 향상

### FR2: 문서 분류

**문제**: 문서 유형이 불명확하여 AI가 사용자 의도에 맞는 문서 선택 어려움

**근거**:
- Diátaxis 프레임워크: 문서를 4가지 유형(tutorial, guide, reference, explanation)으로 분류
- GitHub Docs, Astro Starlight 등 대규모 프로젝트에서 검증된 패턴

**해결책**: `type` 필드로 문서 유형 명시, 검색 시 가중치 적용

### FR3: 관계 정의

**문제**: 문서 간 의존성이 암묵적으로만 존재하여 학습 순서, 영향 범위 파악 어려움

**근거**:
- 선행 문서(prerequisites) 없이 복잡한 문서를 읽으면 이해도 저하
- 버전 업그레이드 시 대체된 문서(supersedes) 명시 필요

**해결책**: `depends_on`, `related`, `supersedes` 관계 필드 도입

### FR4: 역방향 추적

**문제**: 문서 수정 시 해당 문서를 참조하는 AI 에이전트 파일 파악 불가

**근거**:
- `.ai-agents/commands/`, `.cursor/rules/` 파일들이 docs를 하드코딩으로 참조
- 문서 이동/삭제 시 깨진 참조 발생

**해결책**: `ai_agents` 필드로 역방향 의존성 명시

### NFR1: 유지보수성

**문제**: 메타데이터 필드가 많으면 작성자가 유지보수를 포기

**근거**:
- Wikipedia 연구: "더 높은 세분성의 메타데이터는 유지보수 부담을 기하급수적으로 증가"
- 10개 이상 필드 → 6개월 내 준수율 50% 이하

**해결책**: 필수 필드 3개(title, description, type), 나머지는 선택

---

## 제약 조건

| # | 제약 | 이유 |
|---|------|------|
| C1 | YAML frontmatter 형식 사용 | Markdown 표준, 대부분의 도구 지원 |
| C2 | 필수 필드 3개 이하 | 유지보수성 확보 |
| C3 | 태그 최대 5개 | 노이즈 방지, 일관성 유지 |
| C4 | 경로는 상대 경로 사용 | 문서 이동 시 수정 범위 최소화 |

---

## 성공 지표

| 지표 | 측정 방법 | 목표 |
|------|----------|------|
| Frontmatter 커버리지 | (frontmatter 있는 파일 / 전체 파일) × 100 | 100% |
| 스키마 준수율 | CI 검증 통과율 | 100% |
| AI 검색 정확도 | ask 커맨드 정확 응답률 | >90% |
| 유지보수 준수율 | 3개월 후 필드 최신성 | >80% |

---

## 참고 자료

### 내부 문서

- [research/](./research/) - DeepSearch 리서치 자료
- [synthesized-results/03-claude.md](./research/synthesized-results/03-claude.md) - 핵심 근거 종합

### 외부 참고

| 주제 | 링크 |
|------|------|
| llms.txt 표준 | [llmstxt.org](https://llmstxt.org/) |
| Diátaxis 프레임워크 | [diataxis.fr](https://diataxis.fr/) |
| AGENTS.md 표준 | [agents.md](https://agents.md/) |
| GitHub Docs Frontmatter | [GitHub Docs](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) |
| Microsoft GraphRAG | [GitHub](https://microsoft.github.io/graphrag/) |
