---
title: "Frontmatter 시스템"
description: "docs 폴더 문서 작성을 위한 YAML frontmatter 시스템의 Source of Truth, 학습 순서, 빠른 시작 가이드를 제공합니다."
type: index
tags: [Documentation, Frontmatter]
---

# Frontmatter 시스템

docs 폴더 문서 작성을 위한 YAML frontmatter 시스템입니다.

---

## Source of Truth

> **스키마, Tags, Types 정의는 아래 skill 레퍼런스가 Source of Truth입니다.**
> 
> **[/.ai-agents/skills/docs-update-frontmatter/references/schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md)**

---

## 문서 구조

| # | 문서 | 설명 |
|:-:|------|------|
| 0 | [00-requirement.md](./00-requirement.md) | **요구사항** - 왜 이런 시스템이 필요한가 |
| 1 | [01-adr.md](./01-adr.md) | **ADR** - 왜 이렇게 설계했는가 |
| - | [research/](./research/) | 리서치 자료 - DeepSearch 과정 |

---

## 빠른 시작

```yaml
---
# 필수
title: "문서 제목"
description: "50-160자 핵심 요약"
type: guide    # tutorial|guide|reference|explanation|adr|troubleshooting|pattern|index

# 선택
tags: [React, API]                    # 최대 5개
order: 0                              # 파일명 prefix와 일치

# 관계 (의존성이 있는 경우)
depends_on: [./prerequisite-doc.md]   # 선행 문서
related: [./related-doc.md]           # 연관 문서
used_by: [/.ai-agents/xxx.md]         # 이 문서가 사용되는 곳
---
```

**상세 스키마, Tags, Types**: [schema.md](/.ai-agents/skills/docs-update-frontmatter/references/schema.md) 참조

---

## 학습 순서

```
schema.md (무엇이 있고, 어떻게 사용하는가)
    ↓
00-requirement.md (왜 필요한가)
    ↓
01-adr.md (왜 이렇게 설계했는가)
```
