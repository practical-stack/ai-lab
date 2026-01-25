---
title: "ADR: Frontmatter 시스템 설계 결정 기록"
description: "필수 필드 개수, 문서 타입 분류, 관계 필드 범위, 태그 vs 폴더 등 frontmatter 시스템 아키텍처 결정 과정과 기각된 대안을 기록합니다."
type: adr
tags: [Documentation, Frontmatter, Architecture]
order: 1
related: [./00-requirement.md]
---

# ADR: Frontmatter 시스템 설계 결정 기록

> **ADR (Architecture Decision Record)**: 이 문서는 frontmatter 시스템을 설계하면서 거친 의사결정 과정과 기각된 대안들을 기록합니다.
>
> - 요구사항: [00-requirement.md](./00-requirement.md)
> - 스키마 정의 (Source of Truth): [/.ai-agents/skills/docs-update-frontmatter/references/schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)

---

## 목차

1. [필수 필드 개수 결정](#1-필수-필드-개수-결정)
2. [문서 타입 분류 체계 선택](#2-문서-타입-분류-체계-선택)
3. [관계 필드 도입 범위](#3-관계-필드-도입-범위)
4. [used_by 필드 도입](#4-used_by-필드-도입)
5. [태그 vs 폴더 구조](#5-태그-vs-폴더-구조)
6. [llms.txt 생성 전략](#6-llmstxt-생성-전략)
7. [스키마 검증 방식](#7-스키마-검증-방식)

---

## 1. 필수 필드 개수 결정

### 결정

**3개 필수 필드 채택**: `title`, `description`, `type`

### 고려된 대안

| 대안 | 필드 수 | 장점 | 단점 | 결정 |
|------|:------:|------|------|:----:|
| **최소 스키마** | 2개 | 유지보수 최소 | AI 분류 불가 | ❌ |
| **3개 필수** | 3개 | 유지보수/AI 균형 | - | ✅ |
| **5개 필수** | 5개 | 풍부한 메타데이터 | 유지보수 포기 위험 | ❌ |
| **10개+ 전체** | 10개+ | 완전한 그래프 | 6개월 내 준수율 50% 이하 | ❌ |

### 근거

**DeepSearch 리서치 결과** ([synthesized-results/03-claude.md](./research/synthesized-results/03-claude.md)):

> "75개 마크다운 문서를 보유한 프론트엔드 모노레포에서 **세 가지 프론트매터 필드가 필수**로 입증됨: title, description, doc_type. 5개 이상의 필드를 추가하면 6개월 내 유지보수 포기로 이어지는 경우가 많지만, 이 세 가지만으로도 AI 에이전트 탐색이 크게 개선됨."

**검증된 사례**:
- GitHub Docs: 2개 필드만 필수 (title, versions)
- Astro Starlight: 1개 필드만 필수 (title)
- Mintlify: title, description 중심

### 트레이드오프

| 관점 | 3개 필수 | 5개+ 필수 |
|------|----------|----------|
| 유지보수 비용 | 낮음 | 높음 |
| AI 검색 정확도 | 충분함 (80%+) | 약간 향상 |
| 초기 도입 장벽 | 낮음 | 높음 |
| 장기 준수율 | 높음 (80%+) | 낮음 (50% 이하) |

---

## 2. 문서 타입 분류 체계 선택

### 결정

**Diátaxis 기반 확장 타입 체계 채택**: 8개 타입

```
tutorial | guide | reference | explanation | adr | troubleshooting | pattern | index
```

### 고려된 대안

| 대안 | 타입 수 | 장점 | 단점 | 결정 |
|------|:------:|------|------|:----:|
| **Diátaxis 원본** | 4개 | 단순, 검증됨 | 코드베이스 특화 부족 | ❌ |
| **확장 타입** | 8개 | 코드베이스 맞춤 | 학습 필요 | ✅ |
| **자유 텍스트** | 무제한 | 유연함 | 일관성 없음 | ❌ |

### 근거

**Diátaxis 4분류의 한계**:
- `adr`: 아키텍처 결정 기록은 explanation과 다른 목적
- `troubleshooting`: 문제 해결 가이드는 how-to와 구조가 다름
- `pattern`: 코딩 패턴은 reference와 다른 활용 방식
- `index`: 폴더 README는 별도 역할

**GitHub Docs 참고**:
```yaml
type: overview | quick_start | tutorial | how_to | reference
```

### 타입 정의

| 타입 | 목적 | Diátaxis 매핑 |
|------|------|--------------|
| `tutorial` | 단계별 학습 | Tutorial |
| `guide` | 작업 수행 방법 | How-to |
| `reference` | 조회용 정보 | Reference |
| `explanation` | 배경, 개념 설명 | Explanation |
| `adr` | 아키텍처 결정 기록 | (확장) |
| `troubleshooting` | 문제 해결 가이드 | (확장) |
| `pattern` | 코딩 패턴 | (확장) |
| `index` | 폴더 인덱스 | (확장) |

---

## 3. 관계 필드 도입 범위

### 결정

**3가지 관계 필드 도입**: `depends_on`, `related`, `used_by`

### 고려된 대안

| 대안 | 관계 타입 | 장점 | 단점 | 결정 |
|------|:--------:|------|------|:----:|
| **관계 없음** | 0개 | 단순 | 문서 그래프 불가 | ❌ |
| **최소 관계** | 2개 | 핵심만 | 역추적 불가 | ❌ |
| **3가지 관계** | 3개 | 의존성+역추적 | 관리 필요 | ✅ |
| **전체 관계** | 7개+ | 완전한 그래프 | 복잡, 순환 위험 | ❌ |

### 근거

**GraphRAG 연구 결과**:
- 벡터 검색만으로는 "이 문서 전에 무엇을 읽어야 하는가?" 질문에 답 불가
- 명시적 관계 그래프가 복잡한 쿼리에서 벡터 전용 RAG보다 3.4배 우수

**채택된 관계 타입**:

| 필드 | 방향 | 용도 | 필수 여부 |
|------|:----:|------|:--------:|
| `depends_on` | 정방향 | 선행 문서 지정 | 선택 |
| `related` | 양방향 | 연관 문서 연결 | 선택 |
| `used_by` | 역방향 | 문서 사용처 추적 | 선택 |

**기각된 관계 타입**:

| 필드 | 기각 이유 |
|------|----------|
| `prerequisite_for` | `depends_on`의 역관계, 자동 계산 가능 |
| `extends` | `related`로 충분히 표현 가능 |
| `conflicts_with` | 실제 사용 사례 드묾 |
| `see_also` | `related`와 중복 |
| `supersedes` | 실제 사용 빈도 낮음, 문서 자체에 명시 가능 |

---

## 4. used_by 필드 도입

### 결정

**`used_by` 필드 도입**: 문서를 참조하는 AI 에이전트 경로 목록

### 배경

| 현재 상황 | 문제점 |
|----------|--------|
| `.ai-agents/commands/*.md` | docs 경로 하드코딩 |
| `.cursor/rules/*.mdc` | docs 경로 하드코딩 |
| 문서 수정 시 | 영향받는 에이전트 파악 불가 |
| 문서 이동/삭제 시 | 깨진 참조 발생 |

### 고려된 대안

| 대안 | 장점 | 단점 | 결정 |
|------|------|------|:----:|
| **역방향 필드 없음** | 단순 | 의존성 추적 불가 | ❌ |
| **자동 스캔** | 실시간 | 빌드 비용 높음 | ❌ |
| **used_by 필드** | 명시적, 검증 가능 | 수동 관리 필요 | ✅ |

### 사용 예시

```yaml
---
title: "API 호출 패턴"
description: "React Query 기반 API 호출 베스트 프랙티스"
type: pattern
used_by:
  - /.ai-agents/commands/make-api.md
  - /.cursor/rules/api-rules.mdc
---
```

### 운영 규칙

1. **문서 수정 시**: `used_by` 목록의 파일들 검토 필요
2. **문서 이동 시**: CI에서 깨진 참조 검출
3. **에이전트 추가 시**: 해당 문서의 `used_by` 필드 업데이트

---

## 5. 태그 vs 폴더 구조

### 결정

**폴더 구조 + 보조 태그 하이브리드**

### 고려된 대안

| 대안 | 장점 | 단점 | 결정 |
|------|------|------|:----:|
| **폴더만** | 명확한 위치 | 교차 분류 불가 | ❌ |
| **태그만** | 유연한 분류 | 물리적 구조 없음 | ❌ |
| **하이브리드** | 물리적 구조 + 교차 분류 | 두 가지 관리 필요 | ✅ |

### 근거

**dotCMS 가이드라인**:
> "대부분의 문서는 몇 가지 다른 영역이나 도메인과 관련되어 있으며, 계층 구조에서는 하나의 폴더에만 넣을 수 있음."

**해결책**:
- **폴더**: 주요 분류 (1개만 가능)
- **태그**: 교차 관심사 (최대 5개)

### 태그 운영 규칙

| 규칙 | 내용 |
|------|------|
| 최대 개수 | 문서당 5개 |
| Controlled Vocabulary | [schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)에서만 선택 |
| 총 태그 수 | 20개 이하 유지 |

---

## 6. llms.txt 생성 전략

### 결정

**빌드 타임 자동 생성 + 수동 큐레이션 혼합**

### 고려된 대안

| 대안 | 장점 | 단점 | 결정 |
|------|------|------|:----:|
| **완전 수동** | 품질 높음 | 유지보수 비용 높음 | ❌ |
| **완전 자동** | 일관성 | 중요도 반영 어려움 | ❌ |
| **혼합 방식** | 자동화 + 품질 | 초기 설정 필요 | ✅ |

### 근거

**Mintlify 사례**:
- `llms.txt`: 요약 버전 (자동 생성)
- `llms-full.txt`: 전체 내용 (자동 생성)
- LLM이 llms-full.txt를 인덱스 파일보다 **2배 이상 자주** 접근

**Vercel 성과**:
> "llms.txt 구현 후 ChatGPT를 통한 가입이 10%에 달함"

### 생성 규칙

```markdown
# Enterprise Web Documentation
> 프론트엔드 모노레포 기술 문서

## Getting Started
- [Node 설치](./01-foundation/01-setup/node-install.md): {description}

## Best Practices
- [API 패턴](./04-best-practice/00-api/README.md): {description}
```

---

## 7. 스키마 검증 방식

### 결정

**CI 빌드 타임 검증 (향후 도입)**

### 고려된 대안

| 대안 | 장점 | 단점 | 결정 |
|------|------|------|:----:|
| **검증 없음** | 자유로움 | 일관성 없음 | ❌ |
| **Pre-commit Hook** | 즉각 피드백 | 로컬 환경 의존 | ⚠️ |
| **CI 검증** | 일관된 환경 | PR 시점 피드백 | ✅ |

### 검증 항목

| 항목 | 검증 내용 | 심각도 |
|------|----------|:------:|
| 필수 필드 | title, description, type 존재 | Error |
| type 값 | 허용된 enum 값인지 | Error |
| tags 값 | Controlled vocabulary에 있는지 | Warning |
| 관계 경로 | 참조 파일 존재 여부 | Warning |

### 구현 방안 (향후)

```typescript
// Zod 스키마 예시
const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string().min(50).max(160),
  type: z.enum(['tutorial', 'guide', 'reference', 'explanation', 
                'adr', 'troubleshooting', 'pattern', 'index']),
  tags: z.array(z.string()).max(5).optional(),
  depends_on: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  supersedes: z.string().optional(),
  ai_agents: z.array(z.string()).optional(),
});
```

---

## 참고 문헌

### 메타데이터 & AI

| # | 출처 | 링크 |
|---|------|------|
| 1 | llms.txt 표준 | [llmstxt.org](https://llmstxt.org/) |
| 2 | AGENTS.md 표준 | [agents.md](https://agents.md/) |
| 3 | Microsoft GraphRAG | [GitHub](https://microsoft.github.io/graphrag/) |
| 4 | Mintlify llms.txt | [Mintlify Blog](https://www.mintlify.com/blog/simplifying-docs-with-llms-txt) |

### 문서화 프레임워크

| # | 출처 | 링크 |
|---|------|------|
| 5 | Diátaxis | [diataxis.fr](https://diataxis.fr/) |
| 6 | GitHub Docs Frontmatter | [GitHub Docs](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) |
| 7 | Astro Starlight | [Starlight Docs](https://starlight.astro.build/reference/frontmatter/) |

### 내부 리서치

| # | 문서 | 핵심 내용 |
|---|------|----------|
| 8 | [synthesized-results/01-gpt.md](./research/synthesized-results/01-gpt.md) | 하이브리드 접근법, llms.txt 표준 |
| 9 | [synthesized-results/02-gemini.md](./research/synthesized-results/02-gemini.md) | GraphRAG, 점진적 도입 전략 |
| 10 | [synthesized-results/03-claude.md](./research/synthesized-results/03-claude.md) | 3개 필수 필드, 유지보수성 |
