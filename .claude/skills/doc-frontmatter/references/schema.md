# Frontmatter Schema Reference

> **Source of Truth**: 이 문서는 docs 폴더 frontmatter의 단일 진실 공급원입니다.
> Schema, Types, Tags 정의를 모두 포함합니다.

---

## Quick Reference

```yaml
---
# 필수 필드
title: "문서 제목"
description: "50-160자 핵심 요약"
type: guide                               # tutorial|guide|reference|explanation|adr|troubleshooting|pattern|index

# 선택 필드
tags: [React, API]                        # 최대 5개
order: 0                                  # 파일명 prefix와 일치

# 관계 필드 (의존성이 있는 경우)
depends_on: [./prerequisite-doc.md]       # 선행 문서 경로
related: [./related-doc.md]               # 연관 문서 경로
used_by: [/commands/xxx.md]               # 이 문서가 사용되는 곳
---
```

---

## 1. 필드 정의

### 필수 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `title` | `string` | 문서 제목. 검색 최우선 순위 |
| `description` | `string` | 50-160자 요약. AI 임베딩 및 llms.txt 생성의 핵심 소스 |
| `type` | `enum` | 문서 유형. 아래 [Type 정의](#2-type-정의) 참조 |

### 선택 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `tags` | `string[]` | 최대 5개. 아래 [Tags 목록](#3-tags-controlled-vocabulary) 참조 |
| `order` | `number` | 폴더 내 문서 순서. 파일명 prefix와 일치 (예: `00-xxx.md` → `order: 0`) |

### 관계 필드

문서 간 의존성이 있는 경우 사용합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `depends_on` | `string[]` | 선행 문서 경로. 이 문서를 읽기 전에 먼저 읽어야 하는 문서 |
| `related` | `string[]` | 연관 문서 경로. 같은 주제의 다른 관점 문서 연결 |
| `used_by` | `string[]` | 이 문서가 사용되는 곳. 의존성 업데이트 시 영향 범위 파악용 |

---

## 2. Type 정의

| type | 설명 | 예시 |
|------|------|------|
| `tutorial` | 단계별 학습 가이드. 처음부터 끝까지 따라하는 형식 | - |
| `guide` | 특정 작업 수행 방법 | node-install.md, deployment.md |
| `reference` | API, 스펙, 설정값 등 조회용 정보 | k8s 환경변수, 코드 컨벤션 |
| `explanation` | 배경, 설계 원칙, 개념 설명 | - |
| `adr` | 아키텍처 결정 기록 (Architecture Decision Record) | apps-src-folder-structure.adr.md |
| `troubleshooting` | 문제 해결 가이드 | ingress-routing-troubleshooting.md |
| `pattern` | 코딩 패턴 및 베스트 프랙티스 | suspense-query-pattern.md |
| `index` | 폴더의 인덱스 문서 | README.md |

### Type 선택 기준

| 비교 | 왼쪽 | 오른쪽 |
|------|------|--------|
| **tutorial vs guide** | 학습 목적, 처음부터 끝까지 순서대로, "X를 배워보자" | 작업 목적, 필요한 부분만 참조, "X를 하는 방법" |
| **reference vs explanation** | 조회용 정보, 스펙/설정값/API, "X는 무엇인가" | 이해를 위한 설명, 배경/원칙/개념, "왜 X인가" |
| **pattern vs guide** | 반복 사용 가능한 패턴, 코드 패턴, "이렇게 작성하라" | 특정 작업 수행 방법, 설치/설정/배포, "이렇게 하라" |

### Type 결정 플로우

```
문서 특징 확인
    ├─ 단계별 따라하기? ────► tutorial
    ├─ "~하는 방법"? ───────► guide
    ├─ API, 스펙, 설정값? ──► reference
    ├─ "왜 ~인가" 설명? ────► explanation
    ├─ ADR 형식? ───────────► adr
    ├─ 문제 해결? ──────────► troubleshooting
    ├─ 코드 패턴? ──────────► pattern
    └─ README.md? ──────────► index
```

---

## 3. Tags Controlled Vocabulary

문서당 최대 **5개**까지 선택할 수 있습니다.

### 기술 스택

| 태그 | 설명 |
|------|------|
| `React` | React 컴포넌트, 훅, 패턴 |
| `TypeScript` | 타입 정의, 타입 유틸리티 |
| `Next.js` | Next.js 라우팅, SSR, API Routes |
| `Kubernetes` | K8s 배포, 설정, 리소스 |
| `Nx` | Nx 모노레포 설정, 플러그인 |
| `Tailwind` | Tailwind CSS, 스타일링 |

### 도메인

| 태그 | 설명 |
|------|------|
| `API` | API 호출, 데이터 페칭, React Query |
| `Testing` | 단위 테스트, 통합 테스트 |
| `Deployment` | 배포 프로세스, ArgoCD, GitOps |
| `CI-CD` | CI/CD 파이프라인, GitHub Actions |
| `Security` | 보안, 인증, 권한 |

### 작업 유형

| 태그 | 설명 |
|------|------|
| `Setup` | 환경 설정, 초기 구성 |
| `Migration` | 마이그레이션, 버전 업그레이드 |
| `BestPractice` | 베스트 프랙티스, 코딩 패턴 |
| `Architecture` | 아키텍처, 폴더 구조, 설계 결정 |

### 기타

| 태그 | 설명 |
|------|------|
| `Documentation` | 문서화, 메타 정보 |
| `Frontmatter` | Frontmatter 스키마, 메타데이터 |
| `AI` | AI 에이전트, AI 활용 패턴 |

### 태그 추가 규칙

1. 이 문서에 태그를 먼저 추가
2. 태그 설명을 명확히 작성
3. 기존 태그로 대체 가능한지 검토
4. **태그 총 개수는 20개 이하 유지**

---

## 4. 필드 상세 명세

### title

| 속성 | 값 |
|------|-----|
| 타입 | `string` |
| 필수 | Yes |
| 용도 | 검색 최우선 순위, 문서 식별 |

**생성 규칙:**
1. 문서의 첫 번째 H1 헤더 사용
2. H1이 없으면 파일명에서 추출 (하이픈 → 공백, 첫 글자 대문자)

### description

| 속성 | 값 |
|------|-----|
| 타입 | `string` |
| 필수 | Yes |
| 길이 | 50-160자 |
| 용도 | AI 임베딩, llms.txt 생성 |

**생성 규칙:**
1. 문서가 해결하는 문제 요약
2. 첫 번째 단락 또는 개요 섹션 참조
3. 50자 미만이면 경고, 160자 초과 시 잘라냄

### type

| 속성 | 값 |
|------|-----|
| 타입 | `enum` |
| 필수 | Yes |
| 허용값 | `tutorial`, `guide`, `reference`, `explanation`, `adr`, `troubleshooting`, `pattern`, `index` |

### tags

| 속성 | 값 |
|------|-----|
| 타입 | `string[]` |
| 필수 | No |
| 최대 개수 | 5개 |

### order

| 속성 | 값 |
|------|-----|
| 타입 | `number` |
| 필수 | No |
| 용도 | 폴더 내 문서 순서 |

**생성 규칙:**
- 파일명 prefix에서 추출: `00-guide.md` → `order: 0`
- prefix 없으면 생략

### depends_on / related / used_by

| 속성 | depends_on | related | used_by |
|------|------------|---------|---------|
| 타입 | `string[]` | `string[]` | `string[]` |
| 필수 | No | No | No |
| 용도 | 선행 문서 명시 | 연관 문서 연결 | 의존성 추적 |

**used_by 대상 경로:**
- `/commands/*.md` - AI 커맨드 파일
- `/rules/*.mdc` - AI 룰 파일
- `/docs/AGENTS.md` - 문서 구조 가이드

---

## 5. 예시

### 최소 frontmatter

```yaml
---
title: "Node.js 설치 가이드"
description: "asdf를 사용한 Node.js 버전 관리 및 설치 방법"
type: guide
---
```

### 권장 frontmatter

```yaml
---
title: "문서 제목"
description: "50-160자 핵심 요약"
type: guide
tags: [React, API]
order: 0
---
```

### 전체 frontmatter

```yaml
---
title: "SuspenseQuery 응집도 패턴"
description: "SuspenseQuery 선언부와 사용처 분리로 인한 데이터 흐름 파악 어려움을 해결하는 패턴"
type: pattern
tags: [React, API, BestPractice]
order: 3
depends_on: [./suspense-query-conditional-pattern.md]
related: [./parallel-query-pattern.md, ./prefetch-query-pattern.md]
used_by: [/commands/make-api.md, /rules/api-rules.mdc]
---
```
