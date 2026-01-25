---
title: "GPT - GraphRAG 기반 문서 시스템 아키텍처"
description: "AI Agent 기반 문서 시스템 아키텍처 제안 - Frontmatter + Graph + RAG 통합 접근"
type: reference
tags: [AI, Documentation, Frontmatter, Architecture]
ai_summary: "docs와 agents를 동적으로 연결하는 GraphRAG 파이프라인, 6단계 마이그레이션 로드맵 제안"
created: 2025-01-20
depends_on: [../00-meta-prompt.md]
related: [./02-gemini.md, ./03-claude.md]
---

# AI Agent 기반 문서 시스템 아키텍처 제안

> Frontmatter + Graph + RAG 통합 접근

---

## 0) 문제 요약과 목표

### 현재 문제

- `docs/`는 정적 마크다운 중심이라 시맨틱 검색/RAG 최적화가 안 됨
- `.ai-agents/`는 문서를 하드코딩 경로(`@docs/…`)로 참조해서 유지보수 비용이 큼
- `ask.md`의 키워드→문서 매핑은 수동 인덱싱이라 문서가 늘수록 관리가 불가능
- 문서 관계가 링크 형태로 흩어져 있어 "문서 그래프(지식 그래프)"가 없음
- docs와 agents가 서로 독립적으로 진화해서 구조 불일치/확장성 부족

### 목표

1. RAG 친화적인 docs 구조/메타데이터(Frontmatter) 표준화
2. docs ↔ agents가 동적으로 연결되도록 재설계 (하드코딩 제거)
3. 문서 간 관계를 frontmatter로 정의해 그래프 기반 탐색/자동 백링크/검증 가능하게
4. 마이그레이션 비용을 최소화하면서 점진적 전환 로드맵 제시

---

## 1) 최신 문서 + AI 에이전트 패턴 핵심 정리

### A. RAG 친화적 문서 구조 (Chunking + Metadata)

#### 청킹(Chunking) 원칙

- "헤더/섹션 단위"로 의미가 끊기게 분리 (문단/코드블록 중간에서 자르지 않기)
- 청크는 "자기 완결적인 주제"가 되도록 유지
- 섹션 제목(H2/H3)을 청크에 포함하거나, 약간의 오버랩을 두면 검색 품질이 좋아짐

#### Frontmatter 메타데이터

`title/description/type/tags/category/summary` 같은 필드는 다음에 활용:

- 검색 필터링 (예: `type=Troubleshooting`만)
- 결과 랭킹 (예: `agent_priority=high` 가중치)
- 문서 추천/연관 문서 자동 생성
- 에이전트 컨텍스트 구성 (어떤 문서를 언제 넣을지)

> 문서 프레임워크(Docusaurus/Nextra 등)도 frontmatter 중심으로 문서 관리를 권장하는 추세

### B. AI 에이전트의 문서 통합 방식 (정적 참조 → 동적 검색)

- 최신 코딩 에이전트/문서봇 흐름은 "문서를 프롬프트에 박아넣기"보다 **검색/리트리버(RAG)로 필요한 부분만 가져오는 방식**이 표준

#### Long context vs RAG

| 방식 | 장점 | 단점 |
|------|------|------|
| Long context | 전체를 한 번에 넣음 | 비용/잡음이 커짐 |
| RAG | 필요한 부분만 가져옴 | 유지보수성 좋음 |

**결론**: docs를 "지식 원천(source of truth)"로 두고, agents는 필요할 때 검색해서 가져오는 구조가 가장 관리가 쉽고 정확함

### C. 에이전트 스킬/커맨드 설계 패턴

- **오케스트레이터 → 스페셜리스트(전문 스킬)** 구조가 확장에 유리
  - 예: `dev-assistant(조율)` → `test-writer`, `migration-helper`, `design-system-enforcer`
- **룰(rule)은 조건부 로딩**
  - 프론트엔드 파일 편집 시에만 `design-system-rules`를 로딩하는 식
  - 컨텍스트 윈도우 낭비를 줄이고 답변 품질을 올림

---

## 2) 그래프 기반 문서 시스템 패턴 (신규 핵심)

### A. 지식 그래프(문서 그래프)의 장점

문서 간 관계가 명시되면:

- "이 문서 읽기 전에 필요한 문서(선행지식)" 자동 추천
- 연관 문서/백링크(나를 참조하는 문서) 자동 생성
- 고아 문서(아무도 참조하지 않는 문서) 탐지
- AI가 "관련 문서를 확장 검색(그래프 1-hop)"해서 더 정확한 답변 제공

### B. Frontmatter로 관계 정의

- 관계를 YAML로 명시하면 기계가 파싱 가능 → 자동화 가능
- **핵심 관계 타입**:
  - `depends_on`, `prerequisite_for`, `related`, `extends`
  - `see_also`, `supersedes`, `conflicts_with`

### C. GraphRAG 스타일 (그래프 + RAG 결합) 적용 아이디어

1. **1차**: 벡터 검색으로 "가장 유사한 문서/청크" 찾기
2. **2차**: 그 문서의 frontmatter 관계를 통해 **연결된 문서(선행/연관/확장)** 도 함께 가져오기

→ 이렇게 하면 "단일 문서 청크만 보고 답하는 문제"가 줄어듦

---

## 3) 목표 아키텍처

```
┌─────────────────────────┐
│        docs/*.md         │
│ (frontmatter + content)  │
└───────────┬─────────────┘
            │ Build time (CI/Nx task)
            │ - parse frontmatter
            │ - chunking
            │ - embeddings 생성
            │ - graph edges 생성
            v
┌─────────────────────────────────────┐
│   Knowledge Store (2 artifacts)      │
│  1) Vector Index (embeddings + meta) │
│  2) Doc Graph (nodes + edges JSON)   │
└─────────────────┬───────────────────┘
                  │ Runtime
                  │ (agent 실행 시)
                  v
┌─────────────────────────────────────┐
│           AI Orchestrator            │
│  - commands 실행                     │
│  - rules 조건부 로딩                 │
│  - search_docs(query, filters)       │
│  - expand_via_graph(doc_id, 1-hop)   │
└───────────────┬─────────────────────┘
                │
                v
┌─────────────────────────┐
│   LLM Context Builder    │
│ - topK chunks + graph nbr│
│ - relevant rules         │
└─────────────────────────┘
```

---

## 4) 권장 폴더 구조 제안

### A. docs/ 재구조화 (번호 prefix → 의미 중심)

```
docs/
├── guides/
│   ├── setup/
│   ├── app-management/
│   └── ...
├── best-practices/
│   ├── api/
│   ├── ui-ux/
│   ├── testing/
│   └── ...
├── reference/
│   ├── k8s/
│   ├── api/
│   └── design-system/
├── adr/
├── migrations/
├── troubleshooting/
└── README.md
```

### B. .ai-agents/ 재구조화 (commands vs rules 분리)

```
.ai-agents/
├── commands/        # 사용자 요청 기반 워크플로우
│   ├── ask.md
│   ├── make-pr.md
│   ├── make-unit-test.md
│   ├── twx-migration.md
│   └── ...
├── rules/           # 항상/조건부 적용 룰
│   ├── base-rules.md
│   ├── frontend-rules.md
│   ├── design-system-rules.md
│   └── ...
└── agents/          # (옵션) orchestrator / specialist 정의
```

---

## 5) Frontmatter 스키마 표준

### 공통 필드 (전체 문서에 권장)

#### 기본 메타

| 필드 | 필수 | 설명 |
|------|------|------|
| `title` | ✅ | 문서 제목 |
| `description` | - | 1-2문장 설명 |
| `created` | - | 생성일 |
| `updated` | - | 수정일 |
| `author` | - | 작성자/팀 |
| `status` | - | `draft` / `published` / `deprecated` |

#### 분류

| 필드 | 필수 | 설명 |
|------|------|------|
| `category` | ✅ 권장 | 대분류 |
| `subcategory` | - | 소분류 |
| `tags` | - | 태그 리스트 |
| `type` | ✅ | `Guide` / `Best Practice` / `Reference` / `Migration` / `ADR` / `Troubleshooting` |

#### 그래프 관계 (핵심)

| 필드 | 설명 |
|------|------|
| `depends_on` | 선행 문서 |
| `prerequisite_for` | 대부분 자동 역산 추천 |
| `related` | 연관 문서 |
| `extends` | 확장 문서 |
| `see_also` | 참고 링크 |
| `supersedes` | 대체한 이전 문서 |
| `conflicts_with` | 충돌하는 문서 |

#### RAG/검색 최적화

| 필드 | 설명 |
|------|------|
| `search_keywords` | 검색 키워드 |
| `summary` | 요약 |
| `embedding_hint` | 임베딩 힌트 (필요시) |

#### 에이전트 연동

| 필드 | 설명 |
|------|------|
| `related_commands` | 관련 커맨드 |
| `agent_priority` | `high` / `normal` / `low` |

---

## 6) 문서 그래프 운영 규칙

### 관계 타입 사용 기준 (추천)

| 타입 | 의미 |
|------|------|
| `depends_on` | 선행 지식/읽기 순서 |
| `extends` | 상위 문서의 확장판 |
| `related` | 동일 주제군 (양방향 성격) |
| `see_also` | 참고 링크 (외부 포함 가능) |
| `supersedes` | 이 문서가 이전 문서를 대체 |
| `conflicts_with` | 둘을 함께 쓰면 위험/충돌 |

### 일관성/품질 규칙

- `depends_on`은 **DAG(순환 금지)** 로 유지 (cycle 검출)
- **"고아 문서(orphan)" 탐지**:
  - outgoing edge(내가 참조)도 없고
  - incoming edge(나를 참조)도 없으면 경고
- **"깨진 링크" 탐지**:
  - frontmatter에 적은 참조 대상 문서가 실제로 없으면 CI 실패

### 자동 백링크(Backlink) 생성

- 소스 파일을 수정하지 않고, 빌드 산출물(사이트/검색 데이터)에서:
  - "이 문서를 참조하는 문서 목록"을 자동 생성
  - 즉, A가 B를 `related`로 적으면 → B 페이지 하단에 "Backlinks: A" 자동 표시 가능

---

## 7) Frontmatter 예시

### 예시 1: Guide 문서

```yaml
---
title: "Node.js 설치 및 개발 환경 준비"
description: "모노레포 개발을 위한 Node.js(LTS) 설치 및 기본 설정 가이드"
created: 2022-01-10
updated: 2023-08-15
author: "DevOps Team"
status: published

category: "Guide"
subcategory: "Setup"
tags: ["Node.js", "Environment", "Installation"]
type: "Guide"

depends_on: []
related: ["00-setup/nx-installation.md"]
see_also: ["https://nodejs.org/en/download", "00-setup/troubleshooting-node.md"]

search_keywords: ["Node", "npm", "nvm", "LTS"]
summary: "Node.js(LTS)를 설치하고 패키지 매니저 및 기본 환경을 설정한다."

related_commands: []
agent_priority: high
---
```

### 예시 2: Best Practice 문서

```yaml
---
title: "Suspense Query 기반 데이터 패칭 패턴"
description: "React Suspense와 Query 패턴을 활용한 데이터 패칭 베스트 프랙티스"
created: 2023-03-05
updated: 2023-11-20
author: "Frontend Guild"
status: published

category: "Best Practices"
subcategory: "API Call Patterns"
tags: ["React", "Suspense", "Data Fetching"]
type: "Best Practice"

depends_on: ["00-best-practice/04-api-call-pattern/basic-fetch-pattern.md"]
extends: ["00-best-practice/04-api-call-pattern/basic-fetch-pattern.md"]
related: ["00-best-practice/error-handling-pattern.md"]
see_also: ["https://react.dev/"]

search_keywords: ["Suspense", "loading state", "React Query"]
summary: "로딩/에러 상태를 Suspense 경계로 통합해 UI 일관성과 코드 단순화를 달성한다."

agent_priority: normal
---
```

### 예시 3: Migration 문서

```yaml
---
title: "TWX 마이그레이션 가이드"
description: "레거시 TWX에서 신규 체계로 전환하기 위한 단계별 마이그레이션 가이드"
created: 2023-05-20
updated: 2023-10-05
author: "Platform Team"
status: published

category: "Migration"
tags: ["Migration", "TWX"]
type: "Migration"

depends_on: ["00-migration/twx-overview.md", "00-best-practice/framework-guidelines.md"]
related: ["00-migration/project-json-migration.md"]
see_also: ["00-adr/choose-new-framework.md"]

search_keywords: ["TWX", "migration", "refactor"]
summary: "구성/코드 차이를 before/after로 제시하며 안전한 전환 절차를 제공한다."

related_commands: ["twx-migration"]
agent_priority: high
---
```

---

## 8) 자동 인덱싱/검색/그래프 생성 운영 설계

### 빌드 타임 (또는 CI)에서 하는 일

1. docs 전체 스캔 → frontmatter 파싱
2. 본문 chunking
3. 임베딩 생성 → Vector Index에 업서트
4. frontmatter 관계를 edge로 변환 → `doc-graph.json` 생성
5. 검증:
   - 참조 대상 파일 존재 여부
   - `depends_on` cycle 검출
   - orphan 문서 리스트 출력 (경고)

### 런타임 (에이전트 실행 시)

**ask 같은 Q&A**:
1. `search_docs(query)`로 topK 청크 수집
2. 청크의 source doc를 기준으로 graph 1-hop 확장 (필요한 관계만)
3. context builder가 "핵심 청크 + 선행지식/연관 문서"를 넣어 답변

**make-pr, make-unit-test, twx-migration 같은 command**:
1. command frontmatter `related_docs` 기반으로 우선 컨텍스트 로딩
2. 추가로 검색을 섞어 "변경사항과 가장 관련 깊은 규칙/문서"를 보강

---

## 9) 마이그레이션 로드맵 (단계별 전환)

### Phase 0: 인벤토리

- docs 76개 / agents 16개 목록화
- 핵심 문서(중요도 높은 doc)부터 관계 설계 초안 작성

### Phase 1: Frontmatter 최소 도입

- 모든 docs에 `title/type/category/tags/summary` 최소 세트 추가
- agents도 frontmatter 최소 세트 정리

### Phase 2: 폴더 구조 리팩터링

- 숫자 prefix → 의미 기반 구조로 이동
- 기존 상대 링크 업데이트

### Phase 3: 그래프 관계 채우기

- `depends_on` / `related` / `supersedes` 우선 적용
- orphan/cycle 검증 CI 도입

### Phase 4: RAG 인덱싱 파이프라인 구축

- 임베딩/인덱싱 스크립트 + CI 자동화
- `ask.md`의 수동 키워드 매핑 제거 (완전 동적 검색 전환)

### Phase 5: agents 동적 참조로 전환

- `@docs` 하드코딩 제거
- `related_docs`, `related_commands` 기반 자동 컨텍스트 구성

### Phase 6: 그래프 시각화/백링크 UX (선택)

- docs 사이트에 related/backlinks 섹션 자동 생성
- 전체 그래프 뷰 페이지 (옵션)

---

## 10) 참고 자료 (카테고리)

| 카테고리 | 설명 |
|----------|------|
| RAG chunking 전략 | 문서 분할/의미 단위 유지 |
| 코딩 에이전트의 규칙 로딩/문서 참조 패턴 | Cursor Rules류 |
| 문서 프레임워크 frontmatter 관례 | Docusaurus/Nextra 등 |
| 지식 그래프/백링크 시스템 | Obsidian/Roam 계열 |
| GraphRAG 개념 | 그래프 + RAG 결합 |
