---
title: "Docs 아키텍처 설계 메타프롬프트"
description: "AI 코딩 에이전트가 효과적으로 문서를 탐색하고 활용할 수 있는 최적의 docs 폴더 구조 도출을 위한 DeepSearch 메타프롬프트"
type: reference
tags: [Documentation, AI, Frontmatter]
order: 0
depends_on: [./README.md]
used_by: [./raw-results/01-gpt.md, ./raw-results/02-gemini.md, ./raw-results/03-claude.md]
---

# AI 개발환경 최적화를 위한 Docs 아키텍처 설계 메타프롬프트

> 이 메타프롬프트는 AI 코딩 에이전트(Cursor, Claude Code, Copilot 등)가 효과적으로 문서를 탐색하고 활용할 수 있는 최적의 `docs/` 폴더 구조 및 관리 체계를 도출하기 위한 것입니다.

---

## 🎯 목표

프론트엔드 모노레포의 기술 문서 시스템을 다음 관점에서 재설계:

1. **AI 탐색 최적화**: AI 에이전트가 문서를 빠르고 정확하게 검색하고 참조할 수 있는 구조
2. **유지보수 가능성**: 팀이 실제로 지속 가능하게 관리할 수 있는 메타데이터 수준
3. **점진적 도입**: 기존 문서를 유지하면서 단계적으로 개선할 수 있는 전략
4. **표준 호환**: AGENTS.md, llms.txt 등 신흥 AI 문서 표준과의 호환

---

## 📊 현재 상황 (Context)

### 문서 규모 및 구조

| 항목 | 현황 |
|------|------|
| docs 파일 수 | 약 75개 |
| Frontmatter 있는 파일 | 일부 (AI 문서화 섹션만) |
| 폴더 구조 | 번호 prefix 기반 (00-06) |
| AGENTS.md | ✅ 존재 (docs 내 네비게이션 가이드) |
| .ai-agents/commands | ✅ 10개 커맨드 파일 |
| .cursor/rules | ✅ Cursor 룰 파일들 |

### 현재 폴더 구조

```
docs/
├── 00-meta/                # 문서화 시스템 메타 정보 (Frontmatter 스키마, AI 문서화 방법론)
├── 01-foundation/          # 기반 (요구사항, 환경설정, 에셋 시스템)
├── 02-how-we-work/         # 일하는 방법 (개발 프로세스, PR, 배포)
├── 03-architecture/        # 아키텍처 & 컨벤션
├── 04-best-practice/       # 코딩 패턴 가이드 (API, 에러처리, 테스트, TS, 스타일, AI)
├── 05-infrastructure/      # 인프라 (Nx, CI/CD, Kubernetes)
├── 06-migration/           # 마이그레이션
├── 07-app-lifecycle/       # 앱 생명주기
├── README.md               # 전체 문서 인덱스
└── AGENTS.md               # AI 에이전트용 네비게이션 가이드
```

### 기존 리서치에서 검증된 핵심 발견

#### 메타데이터 (Frontmatter)

| 발견 | 근거 |
|------|------|
| **3개 필수 필드**로 충분 | title, description, type - GitHub Docs, Astro Starlight 등 대규모 프로젝트 검증 |
| **5개 이상 필드 = 유지보수 포기** | 6개월 내 준수율 50% 이하로 하락 |
| **description이 AI 검색의 핵심** | llms.txt 생성, 임베딩 벡터의 주요 소스 |
| **Diátaxis 4분류 효과적** | tutorial, guide, reference, explanation |

#### 문서 관계

| 발견 | 근거 |
|------|------|
| **하이브리드 접근법 최적** | 본문 링크 + 매니페스트(llms.txt) + 최소 관계 필드 |
| **4가지 관계만 유의미** | prerequisites, related, supersedes, see_also |
| **백링크는 우선순위 낮음** | 벡터 검색이 대부분 커버, 수동 관리 ROI 낮음 |
| **GraphRAG는 75개 문서에 과도** | 단순 프론트매터 + llms.txt로 80% 효과 달성 |

#### AI 표준

| 표준 | 역할 |
|------|------|
| **AGENTS.md** | 프로젝트 규칙, 빌드 명령, 코딩 컨벤션 (20,000+ OSS 프로젝트 채택) |
| **llms.txt** | 문서 인덱스, AI 탐색용 요약 (784+ 구현체, Vercel 10% 가입 기여) |
| **.cursor/rules/** | Cursor 전용 지침 (파일 패턴별 조건부 로딩) |

---

## 🔍 설계 질문 (DeepSearch 요청)

### Part A: 폴더 구조 최적화

1. **번호 prefix 유지 vs 의미 기반 폴더**
   - 현재 `00-meta`, `01-foundation`, `02-how-we-work` 등 번호 체계 사용
   - AI 탐색 관점에서 번호 prefix가 도움이 되는가, 방해가 되는가?
   - 의미 기반(`guides/`, `reference/`, `architecture/`)으로 전환 시 트레이드오프는?

2. **계층 깊이 최적화**
   - 현재 최대 4단계 깊이 (`docs/04-best-practice/00-api/patterns/xxx.md`)
   - AI 에이전트에게 최적의 폴더 깊이는?
   - 2단계 이내로 평탄화할 경우 장단점은?

3. **인덱스 파일 전략**
   - 각 폴더의 README.md vs 루트 llms.txt
   - 계층적 인덱스(폴더별 llms.txt) vs 단일 중앙 인덱스
   - AI 에이전트가 선호하는 인덱스 구조는?

4. **파일 명명 규칙**
   - 현재: `00-overview.md`, `suspense-query-cohesion-pattern.md` 혼재
   - AI 탐색에 최적인 파일명 패턴은?
   - 일관성 vs 설명적 이름의 균형점은?

### Part B: Frontmatter 스키마 결정

1. **필수 필드 최종 확정**
   - 현재 후보: `title`, `description`, `type`
   - `ai_summary` 필드가 `description`과 별도로 필요한가?
   - 75개 문서 규모에서 정말 3개로 충분한가?

2. **type 분류 체계**
   - Diátaxis 4분류: `tutorial`, `guide`, `reference`, `explanation`
   - 현재 사용 중인 타입: `guide`, `reference`, `adr`, `troubleshooting`, `pattern`, `index`
   - 두 체계를 어떻게 통합하거나 선택할 것인가?

3. **관계 필드 도입 기준**
   - `prerequisites`: 어떤 문서에 적용해야 하는가?
   - `supersedes`: 마이그레이션 문서에만 필요한가?
   - `related`: 양방향 관리 비용 대비 효용은?

4. **tags vs 폴더 구조**
   - 태그로 교차 분류할 것인가, 폴더 구조로 단일 분류할 것인가?
   - Controlled vocabulary 크기는 몇 개가 적정한가?

### Part C: AI 에이전트 통합 아키텍처

1. **llms.txt 설계**
   - docs/llms.txt vs 루트 llms.txt 위치
   - llms-full.txt(전체 내용 포함) 생성 여부
   - 자동 생성 vs 수동 큐레이션

2. **AGENTS.md 역할 분리**
   - 현재 docs/AGENTS.md: 문서 구조 가이드
   - 루트 AGENTS.md 필요 여부: 프로젝트 전반 규칙
   - .ai-agents/commands/와의 관계 정리

3. **Cursor/Claude 통합**
   - .cursor/rules/와 docs의 연결 방식
   - CLAUDE.md 도입 여부
   - 문서 참조 패턴(@docs/path vs 절대경로)

4. **검색 파이프라인**
   - 벡터 검색 vs 그래프 탐색 vs 키워드 필터링
   - 75개 문서 규모에서 최적의 조합은?
   - 향후 확장(200+ 문서)을 고려한 설계는?

### Part D: 마이그레이션 전략

1. **Phase 우선순위**
   - Phase 1(기반 구축): 어떤 문서부터 frontmatter 추가?
   - Phase 2(확장): 자동화 도구 도입 시점?
   - Phase 3(최적화): GraphRAG 검토 시점?

2. **기존 구조 호환성**
   - 번호 prefix를 유지하면서 의미 기반 분류 병행 가능?
   - 기존 링크 깨짐 방지 전략?
   - 점진적 마이그레이션 vs 일괄 전환?

3. **자동화 도구**
   - Frontmatter 자동 생성 도구 (LLM 기반)
   - 링크 검증 CI (Lychee 등)
   - llms.txt 빌드 타임 생성

---

## 📐 기대 산출물

### 1. 최적화된 폴더 구조 제안

```
docs/
├── llms.txt                    # AI 인덱스
├── AGENTS.md                   # AI 에이전트 네비게이션 가이드
├── README.md                   # 인간용 전체 인덱스
├── [최적화된 하위 구조...]
```

### 2. Frontmatter 스키마 표준

```yaml
---
# 필수 필드
title: "..."
description: "..."
type: guide | reference | tutorial | explanation | adr | troubleshooting

# 권장 필드
tags: [...]
sidebar_position: N

# 선택 필드 (해당 시)
prerequisites: [...]
supersedes: "..."
last_updated: YYYY-MM-DD
---
```

### 3. llms.txt 템플릿

```markdown
# Enterprise Web Documentation
> 프론트엔드 모노레포 기술 문서

## Getting Started
- [...]

## Architecture
- [...]
```

### 4. 마이그레이션 로드맵

| Phase | 기간 | 목표 | 산출물 |
|-------|------|------|--------|
| 0 | 1주 | 파일럿 | 핵심 10개 문서 frontmatter |
| 1 | 2-4주 | 기반 | 전체 frontmatter, llms.txt |
| 2 | 4-8주 | 관계 | prerequisites, CI 링크 체크 |
| 3 | 3개월+ | 최적화 | 자동 생성, 검색 파이프라인 |

### 5. 검증 지표

| 지표 | 측정 방법 | 목표 |
|------|----------|------|
| Frontmatter 커버리지 | 파일 수 / 전체 | 100% |
| AI 검색 정확도 | ask 커맨드 성공률 | >90% |
| 유지보수 준수율 | 3개월 후 필드 최신성 | >80% |

---

## 🔗 참고 자료 (리서치 결과)

### 내부 문서
- `01-raw-results/00-meta-prompt.md` - 원본 DeepSearch 요청
- `01-raw-results/01-gpt.md` - GPT GraphRAG 아키텍처 제안
- `01-raw-results/02-gemini.md` - Gemini 확장 메타 프롬프트
- `01-raw-results/03-claude.md` - Claude 실용적 스키마
- `02-synthesized-results/01-gpt.md` - GPT 종합 결과
- `02-synthesized-results/02-gemini.md` - Gemini 종합 결과
- `02-synthesized-results/03-claude.md` - Claude 종합 결과

### 외부 표준
- [llmstxt.org](https://llmstxt.org/) - llms.txt 표준
- [agents.md](https://agents.md/) - AGENTS.md 표준
- [Diátaxis](https://diataxis.fr/) - 문서 분류 프레임워크
- [GitHub Docs Frontmatter](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter)
- [MADR 4.0](https://adr.github.io/madr/) - ADR 템플릿

---

## ✅ 성공 기준

| 기준 | 설명 |
|------|------|
| **실용성** | 75개 문서 규모에서 실제 적용 가능 |
| **유지보수성** | 팀이 6개월 이상 준수할 수 있는 수준 |
| **AI 효과성** | Cursor, Claude Code에서 측정 가능한 탐색 개선 |
| **점진적 도입** | 기존 워크플로우 중단 없이 단계별 적용 |
| **표준 호환** | llms.txt, AGENTS.md 표준과 일치 |

---

## ❓ 열린 질문 (답을 모르는 것들)

1. 번호 prefix가 AI 탐색에 도움이 되는가, 노이즈인가?
2. 폴더 깊이 2단계 제한이 실제로 AI 성능을 개선하는가?
3. llms.txt 수동 큐레이션 vs 자동 생성 중 어느 쪽이 품질이 높은가?
4. tags 필드가 폴더 구조보다 AI 검색에 더 효과적인가?
5. 200+ 문서로 확장 시 현재 설계가 스케일하는가?

---

## 🚀 사용 방법

이 메타프롬프트를 다음 상황에서 사용하세요:

1. **DeepSearch 요청**: AI 모델에게 위 질문들을 던져 다양한 관점 수집
2. **팀 논의 기반**: 설계 질문을 팀 회의 안건으로 활용
3. **점진적 개선**: Phase별로 산출물을 검증하며 스키마 진화
4. **벤치마킹**: 다른 OSS 프로젝트 docs 구조와 비교 분석

---

*Generated: 2025-01-20*
*Based on: 3-model DeepSearch analysis (GPT, Gemini, Claude) + librarian research*
