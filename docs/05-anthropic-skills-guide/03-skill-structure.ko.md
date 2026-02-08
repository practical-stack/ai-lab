# Skill 구조 및 YAML Frontmatter

## 파일 구조

```text
your-skill-name/
├── SKILL.md              # 필수 - 메인 Skill 파일
├── scripts/              # 선택 - 실행 가능한 코드
│   ├── process_data.py
│   └── validate.sh
├── references/           # 선택 - 문서
│   ├── api-guide.md
│   └── examples/
└── assets/               # 선택 - 템플릿 등
    └── report-template.md
```

## 핵심 규칙

**SKILL.md 네이밍:**
- 반드시 정확히 `SKILL.md`여야 합니다 (대소문자 구분)
- 다른 변형은 허용되지 않습니다 (`SKILL.MD`, `skill.md` 등)

**Skill 폴더 네이밍:**
- kebab-case 사용: `notion-project-setup` ✅
- 공백 불가: `Notion Project Setup` ❌
- 밑줄 불가: `notion_project_setup` ❌
- 대문자 불가: `NotionProjectSetup` ❌

**README.md 금지:**
- Skill 폴더 내에 `README.md`를 포함하지 마세요
- 모든 문서는 `SKILL.md` 또는 `references/`에 작성합니다
- 참고: GitHub를 통해 배포할 때는 사용자를 위한 저장소 수준의 README가 별도로 필요합니다 — 배포 및 공유 섹션을 참고하세요.

## YAML Frontmatter

YAML frontmatter는 Claude가 Skill을 로드할지 결정하는 기준입니다. 이 부분을 정확히 작성해야 합니다.

### 최소 필수 형식

```yaml
---
name: your-skill-name
description: What it does. Use when user asks to [specific phrases].
---
```

이것만으로 시작할 수 있습니다.

### 필드 요구사항

**name** (필수):
- kebab-case만 허용
- 공백이나 대문자 불가
- 폴더 이름과 일치해야 함

**description** (필수):
- 반드시 다음 두 가지를 포함해야 합니다:
  - Skill이 하는 일
  - 사용 시점 (트리거 조건)
- 1024자 이내
- XML 태그 (`<` 또는 `>`) 불가
- 사용자가 실제로 말할 수 있는 구체적인 작업 포함
- 해당되는 경우 파일 유형 언급

**license** (선택):
- 오픈소스 Skill 시 사용
- 일반적: `MIT`, `Apache-2.0`

**compatibility** (선택):
- 1~500자
- 환경 요구사항 표시: 예를 들어 대상 제품, 필수 시스템 패키지, 네트워크 접근 요구사항 등

**metadata** (선택):
- 커스텀 key-value 쌍
- 권장: `author`, `version`, `mcp-server`
- 예시:
  ```yaml
  metadata:
    author: ProjectHub
    version: 1.0.0
    mcp-server: projecthub
  ```

### 모든 선택 필드 (전체 참조)

```yaml
name: skill-name
description: [required description]
license: MIT                                          # 선택: 오픈소스 라이선스
allowed-tools: "Bash(python:*) Bash(npm:*) WebFetch"  # 선택: 도구 접근 제한
metadata:                                              # 선택: 커스텀 필드
  author: Company Name
  version: 1.0.0
  mcp-server: server-name
  category: productivity
  tags: [project-management, automation]
  documentation: https://example.com/docs
  support: support@example.com
```

### 보안 제한사항

frontmatter에서 금지되는 항목:
- XML 꺾쇠 괄호 (`<` `>`)
- 이름에 "claude" 또는 "anthropic"이 포함된 Skill (예약어)

**허용:**
- 모든 표준 YAML 타입 (문자열, 숫자, 불리언, 리스트, 객체)
- 커스텀 metadata 필드
- 긴 description (최대 1024자)

**금지:**
- XML 꺾쇠 괄호 (`<` `>`) — 보안 제한
- YAML 내 코드 실행 (안전한 YAML 파싱 사용)
- "claude" 또는 "anthropic" 접두사가 붙은 Skill 이름 (예약어)

이유: Frontmatter는 Claude의 system prompt에 표시됩니다. 악의적인 내용이 지침을 주입할 수 있습니다.
