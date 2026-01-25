---
title: "문서화 시스템 메타 정보"
description: "docs 폴더 문서 작성을 위한 frontmatter 스키마, 태그 controlled vocabulary, 타입 정의 및 작성 가이드를 제공합니다."
type: index
tags: [Documentation, Frontmatter]
---

# 문서화 시스템 메타 정보

docs 폴더 문서 작성을 위한 스키마, 태그, 가이드입니다.

---

## 폴더 구조

```
00-meta/
└── 00-frontmatter/              # Frontmatter 시스템
    ├── 00-guide.md              # 적용 가이드
    ├── 01-schema.md             # 스키마 정의 (Source of Truth)
    ├── 02-tags.md               # 태그 목록 (Source of Truth)
    ├── 03-types.md              # 타입 정의 (Source of Truth)
    ├── 04-requirement.md        # 요구사항
    ├── 05-adr.md                # 설계 결정 기록
    └── research/                # 리서치 자료
```

---

## 문서 목록

| 문서 | 설명 | 용도 |
|------|------|------|
| [00-guide.md](./00-frontmatter/00-guide.md) | Frontmatter 적용 가이드 | 문서 작성 시 참고 |
| [01-schema.md](./00-frontmatter/01-schema.md) | Frontmatter 스키마 정의 | **Source of Truth** |
| [02-tags.md](./00-frontmatter/02-tags.md) | Tags Controlled Vocabulary | **Source of Truth** |
| [03-types.md](./00-frontmatter/03-types.md) | 문서 Type 정의 | **Source of Truth** |
| [04-requirement.md](./00-frontmatter/04-requirement.md) | 시스템 요구사항 정의 | 배경 이해 |
| [05-adr.md](./00-frontmatter/05-adr.md) | 설계 결정 기록 (ADR) | 설계 근거 |

---

## Source of Truth

| 항목 | 문서 |
|------|------|
| Frontmatter 필드 정의 | [01-schema.md](./00-frontmatter/01-schema.md) |
| 사용 가능한 태그 | [02-tags.md](./00-frontmatter/02-tags.md) |
| 문서 Type | [03-types.md](./00-frontmatter/03-types.md) |

---

## 빠른 참조

### 필수 필드

```yaml
---
title: "문서 제목"
description: "50-160자 핵심 요약"
type: guide  # tutorial | guide | reference | explanation | adr | troubleshooting | pattern | index
---
```

### 권장 필드

```yaml
tags: [React, API]  # 02-tags.md에서 선택, 최대 5개
order: 0            # 파일명 prefix와 일치
```

---

## 리서치 자료

[research/](./00-frontmatter/research/) - 스키마 도출 과정의 DeepSearch 리서치 자료

---

## 관련 문서

- [docs/AGENTS.md](../AGENTS.md) - AI 에이전트용 문서 구조 가이드
- [docs/README.md](../README.md) - 전체 문서 인덱스
