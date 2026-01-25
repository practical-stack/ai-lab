---
title: "Claude - 실용적 Frontmatter 스키마"
description: "GitHub Docs, MADR, Obsidian 등 실제 사례 기반의 정적 문서 그래프용 즉시 적용 가능한 최소 Frontmatter 스키마 설계 제안입니다."
type: reference
tags: [AI, Documentation, Frontmatter, BestPractice]
ai_summary: "즉시 적용 가능한 최소 스키마 제안, GitHub Docs/MADR/Obsidian 등 실제 사례 기반 근거 제시"
created: 2025-01-20
depends_on: [../00-meta-prompt.md]
related: [./01-gpt.md, ./02-gemini.md]
---

# 실용적 Frontmatter 스키마 설계

> 정적 문서 그래프용 - 실제 사례 기반 근거 포함

---

## 1. 핵심 스키마

웹 퍼블리싱이 불필요한 내부 문서용 최소 스키마입니다.

```yaml
---
# === 필수 ===
title: "문서 제목"
description: "1-2문장 요약"
id: kebab-case-id
type: guide  # guide | reference | adr | troubleshooting | command

# === 분류 ===
tags: [tag1, tag2]
category: api  # api | architecture | tooling | workflow
status: published  # draft | published | deprecated

# === 날짜 ===
created: 2025-01-15
updated: 2025-01-20

# === 그래프 관계 ===
depends_on: [./prerequisite-doc.md]
related: [./related-doc.md]
see_also: [./supplementary.md]
supersedes: ./old-version.md
parent: ./parent-doc.md

# === AI 에이전트용 ===
ai_summary: "AI가 문서를 빠르게 파악할 수 있는 1문장 요약"
priority: medium  # high | medium | low
use_cases: ["X 구현 시", "Y 디버깅 시"]
related_commands: [command-name]
keywords: [검색키워드1, 검색키워드2]
---
```

### 필드별 근거

| 필드 카테고리 | 참고 소스 |
|--------------|----------|
| 기본 메타데이터 (title, description, tags, date) | [GitHub Docs Frontmatter 가이드](https://docs.github.com/en/contributing/writing-for-github-docs/using-yaml-frontmatter) |
| status, type 필드 패턴 | [MADR 4.0 - ADR용 Frontmatter](https://adr.github.io/madr/) |
| 문서 관계 (related) 필드 | [GraphRAG Hybrid - frontmatter 기반 관계](https://github.com/rileylemm/graphrag-hybrid) |
| Frontmatter 링크 지원 | [Obsidian Frontmatter Links 플러그인](https://github.com/Trikzon/obsidian-frontmatter-links) |

---

## 2. 타입별 추가 필드

문서 유형에 따라 확장 가능한 필드입니다:

| type | 추가 필드 | 설명 |
|------|----------|------|
| **guide** | `difficulty`, `estimated_time`, `prerequisites` | 학습 난이도, 소요 시간, 전제 조건 |
| **adr** | `decision_makers`, `decision_date`, `adr_status` | 결정권자, 결정일, ADR 상태 |
| **troubleshooting** | `symptoms`, `causes`, `solutions` | 증상, 원인, 해결책 |
| **command** | `command`, `triggers`, `doc_references` | 명령어, 트리거 키워드, 참조 문서 |

---

## 3. 관계 유형 정의

### 관계 필드 명세

| 필드 | 의미 | 방향성 | 용도 |
|------|------|--------|------|
| `depends_on` | 먼저 읽어야 함 | 단방향 | 학습 순서 정의 |
| `related` | 연관 문서 | 양방향 | 탐색 확장 |
| `see_also` | 참고/보충 | 단방향 | 추가 정보 제공 |
| `supersedes` | 이전 버전 대체 | 단방향 | 버전 관리 |
| `parent` | 상위 문서 | 단방향 | 계층 구조 표현 |

### 관계 설계 근거

- **양방향 링크 개념**: [Obsidian 백링크 가이드](https://www.marclittlemore.com/beginners-guide-note-taking-obsidian/) - Wikilink 형식의 양방향 연결
- **Frontmatter 양방향 관계 논의**: [Obsidian Forum](https://forum.obsidian.md/t/bidirectional-relationship-links-in-frontmatter-possible/81798)
- **백링크 자동 생성 패턴**: [Nuxt Content - backlinks 기능](https://github.com/nuxt/content/issues/1084)

---

## 4. AI 에이전트 연동 패턴

### 4.1 Cursor/Windsurf Rules에서 문서 참조

```markdown
# .cursor/rules/api-rules.md 또는 .windsurfrules

## 관련 문서
이 규칙과 관련된 문서:
- @docs/04-best-practice/00-api/patterns/suspense-query-cohesion-pattern.md
- @docs/04-best-practice/01-error-handling/README.md

## 사용 시점
- API 호출 패턴 구현 시 참조
- 에러 처리 로직 작성 시 참조
```

### 4.2 AI 커맨드 파일 스키마

```yaml
# .ai-agents/commands/make-api.md
---
command: make-api
description: "API 호출 코드 생성"
triggers:
  - "API 만들어줘"
  - "fetch 코드"
  - "서버 요청"
doc_references:
  - path: ./docs/04-best-practice/00-api/patterns/suspense-query-cohesion-pattern.md
    priority: 1
    context: "주요 패턴 참고"
  - path: ./docs/04-best-practice/01-error-handling/README.md
    priority: 2
    context: "에러 처리 참고"
---
```

### 4.3 참고 자료

| 패턴 | 참고 소스 |
|------|----------|
| Cursor Rules 구조 | [Awesome Cursor Rules](https://github.com/PatrickJS/awesome-cursorrules) |
| Windsurf Rules/AGENTS.md | [Windsurf AGENTS.md 공식 문서](https://docs.windsurf.com/windsurf/cascade/agents-md) |
| Rules 파일 활용법 | [Windsurf Rules 가이드](https://playbooks.com/windsurf-rules) |
| 도메인별 에이전트 분리 | [Agentic Cursor Rules](https://github.com/s-smits/agentic-cursorrules) |
| AI 코딩 도구 통합 가이드 | [AI Coding Agents 히치하이커 가이드](https://www.yixtian.com/blog/11-ai-coding-agents-guide) |

---

## 5. llms.txt 표준

AI 에이전트가 문서를 더 잘 찾도록 하는 인덱스 파일입니다.

### 형식

```markdown
# docs/llms.txt

# Project Name
> 프로젝트 설명

## 섹션명
- [문서제목](./path/to/doc.md): 간단 설명
```

### 실제 예시

```markdown
# docs/llms.txt

# Enterprise Web Frontend Docs
> enterprise-web 프론트엔드 모노레포 기술 문서

## 시작하기
- [Node 설치](./01-foundation/01-setup/node-install.md): 개발 환경 Node.js 설정
- [프로젝트 설정](./01-foundation/01-setup/README.md): 초기 프로젝트 구성

## 베스트 프랙티스
- [API 호출 패턴](./04-best-practice/00-api/patterns/suspense-query-cohesion-pattern.md): Suspense + React Query 패턴
- [에러 처리](./04-best-practice/01-error-handling/README.md): 표준 에러 처리 방식

## Kubernetes
- [Deployment 템플릿](./05-infrastructure/02-k8s/04-deployment.md): K8s 배포 설정 레퍼런스
```

### llms.txt 참고 자료

| 주제 | 참고 소스 |
|------|----------|
| llms.txt 공식 스펙 | [llmstxt.org](https://llmstxt.org/) |
| llms.txt 개요 및 활용 | [LangGraph llms.txt 문서](https://langchain-ai.github.io/langgraph/llms-txt-overview/) |
| llms-full.txt 패턴 | [Mintlify llms.txt 가이드](https://www.mintlify.com/docs/ai/llmstxt) |
| 실제 활용 사례 | [Mintlify 블로그 - llms.txt 설명](https://www.mintlify.com/blog/simplifying-docs-with-llms-txt) |

---

## 6. 백링크 생성 스크립트

### Node.js 구현

```javascript
// scripts/generate-backlinks.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

const docs = glob.sync('docs/**/*.md');
const backlinks = {};

// 1. 모든 문서의 관계 수집
docs.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  const id = filePath;
  
  ['depends_on', 'related', 'see_also'].forEach(field => {
    (data[field] || []).forEach(target => {
      const resolvedTarget = path.resolve(path.dirname(filePath), target);
      if (!backlinks[resolvedTarget]) backlinks[resolvedTarget] = [];
      backlinks[resolvedTarget].push({ from: id, type: field });
    });
  });
});

// 2. 결과 저장
fs.writeFileSync('_cache/backlinks.json', JSON.stringify(backlinks, null, 2));
console.log('Backlinks generated:', Object.keys(backlinks).length);
```

### 참고 자료

- **JavaScript 백링크 생성**: [Chris Padilla - Generating Back Links](https://www.chrisdpadilla.com/backlinksinjs)
- **gray-matter 라이브러리**: frontmatter 파싱용 표준 도구
- **Obsidian 스타일 그래프**: [Graph Data Modelling - YAML frontmatter 기반 지식 그래프](https://schemaorg.healis.eu/)

---

## 7. 실제 문서 예시

### 예시 1: 가이드 문서

```yaml
# docs/01-foundation/01-setup/node-install.md
---
title: "Node.js 설치 가이드"
description: "개발 환경에 Node.js와 패키지 매니저 설치"
id: node-install
type: guide

tags: [setup, nodejs, nvm]
category: tooling
status: published

created: 2024-06-01
updated: 2025-01-15

difficulty: beginner
estimated_time: "15분"
prerequisites:
  - "macOS 또는 Linux 환경"

depends_on: []
related: [./README.md]
see_also: [../../04-best-practice/README.md]

ai_summary: "nvm을 사용한 Node.js 설치 및 버전 관리 방법"
priority: high
use_cases: ["신규 입사자 온보딩", "개발 환경 초기화"]
keywords: [nvm, node, npm, yarn, pnpm]
---
```

### 예시 2: 베스트 프랙티스

```yaml
# docs/04-best-practice/00-api/patterns/suspense-query-cohesion-pattern.md
---
title: "Suspense Query 응집도 패턴"
description: "React Suspense와 TanStack Query를 활용한 API 호출 패턴"
id: suspense-query-pattern
type: pattern

tags: [api, react-query, suspense, pattern]
category: api
status: published

created: 2024-09-15
updated: 2025-01-10

depends_on: []
related:
  - ./parallel-query-pattern.md
  - ./prefetch-query-pattern.md
see_also: [../../01-error-handling/README.md]

ai_summary: "useSuspenseQuery로 선언적 데이터 페칭, ErrorBoundary로 에러 처리"
priority: high
use_cases: ["API 호출 구현", "데이터 페칭 리팩토링"]
keywords: [useSuspenseQuery, ErrorBoundary, 데이터페칭, 선언적]
related_commands: [make-api, refactor-query]
---
```

### 예시 3: AI 커맨드

```yaml
# .ai-agents/commands/design-system-rules.md
---
title: "BDS 디자인 시스템 규칙"
description: "BDS 디자인 시스템 사용 규칙"
id: design-system-rules
type: command

command: design-system
triggers:
  - "디자인 시스템"
  - "BDS 컴포넌트"
  - "스타일 가이드"

doc_references:
  - path: ../docs/04-best-practice/05-visual-asset-guide/README.md
    priority: 1
    context: "비주얼 에셋 사용법"
  - path: ../docs/04-best-practice/04-style-layout/README.md
    priority: 2
    context: "스타일링 규칙"

children:
  - ./design-system-rules/colors.md
  - ./design-system-rules/typography.md
  - ./design-system-rules/layout.md

ai_summary: "BDS 디자인 시스템 컴포넌트와 토큰 사용 규칙"
priority: high
keywords: [BDS, 디자인토큰, 컴포넌트, spacing, color]
---
```

---

## 8. 그래프 검증 규칙

문서 그래프의 품질을 유지하기 위한 검증 규칙입니다:

| 규칙 | 설명 | 검증 방법 |
|------|------|----------|
| **깨진 링크 방지** | `depends_on`, `related` 등의 경로가 실제 존재하는지 확인 | CI에서 경로 유효성 검사 |
| **순환 참조 방지** | `depends_on` 체인에서 A→B→C→A 같은 순환 탐지 | 그래프 DFS로 사이클 검출 |
| **고아 문서 경고** | 어떤 관계에도 포함되지 않은 문서 식별 | 입출력 엣지가 모두 0인 노드 탐지 |
| **타입 일관성** | `type: command`는 `.ai-agents/` 아래에만 존재 | 경로-타입 매핑 검증 |

---

## 9. 추가 참고 자료

### Frontmatter 관련

| 주제 | 링크 |
|------|------|
| Docusaurus Frontmatter | [Docusaurus Markdown Features](https://docusaurus.io/docs/markdown-features) |
| MyST Frontmatter 옵션 | [MyST Markdown Frontmatter](https://mystmd.org/guide/frontmatter) |
| Markdoc Frontmatter | [Markdoc Frontmatter](https://markdoc.dev/docs/frontmatter) |
| Frontmatter 기본 개념 | [DEV.to - What is Frontmatter](https://dev.to/dailydevtips1/what-exactly-is-frontmatter-123g) |

### 문서 시스템 설계

| 주제 | 링크 |
|------|------|
| Diátaxis 프레임워크 | [diataxis.fr](https://diataxis.fr/) |
| MADR (ADR 템플릿) | [adr.github.io/madr](https://adr.github.io/madr/) |
| Arc42 아키텍처 템플릿 | [arc42.org](https://arc42.org/overview) |
| Google 기술 문서 스타일 | [developers.google.com/style](https://developers.google.com/style) |
