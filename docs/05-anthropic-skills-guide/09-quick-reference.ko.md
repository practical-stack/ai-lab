# 빠른 참조

## Skill 개발 체크리스트

### 시작 전

- [ ] 2~3가지 구체적인 Use Case 정의 완료
- [ ] 필요한 도구 식별 (내장 또는 MCP)
- [ ] 이 가이드와 예시 Skill 검토 완료
- [ ] 폴더 구조 계획 완료

### 개발 중

- [ ] 폴더 이름이 kebab-case
- [ ] `SKILL.md` 파일 존재 (정확한 철자)
- [ ] YAML frontmatter에 `---` 구분자 포함
- [ ] `name` 필드: kebab-case, 공백 없음, 대문자 없음
- [ ] `description`에 WHAT(하는 일)과 WHEN(사용 시점) 포함
- [ ] XML 태그 (`<` `>`) 없음
- [ ] 지침이 명확하고 실행 가능
- [ ] 오류 처리 포함
- [ ] 예시 제공
- [ ] 참조가 명확히 링크됨

### 업로드 전

- [ ] 명확한 작업에서 트리거 테스트 완료
- [ ] 바꿔 말한 요청에서 트리거 테스트 완료
- [ ] 관련 없는 주제에서 트리거되지 않는 것 확인
- [ ] 기능 테스트 통과
- [ ] 도구 연동 동작 확인 (해당되는 경우)
- [ ] `.zip` 파일로 압축 완료

### 업로드 후

- [ ] 실제 대화에서 테스트
- [ ] 과소/과다 트리거 모니터링
- [ ] 사용자 피드백 수집
- [ ] description과 지침 반복 개선
- [ ] metadata의 버전 업데이트

---

## YAML Frontmatter 사양

### 필수 필드

```yaml
---
name: skill-name-in-kebab-case
description: What it does and when to use it. Include specific trigger phrases.
---
```

### 모든 선택 필드

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

### 보안 규칙

**허용:** 모든 표준 YAML 타입, 커스텀 metadata 필드, 긴 description (최대 1024자)

**금지:** XML 꺾쇠 괄호 (`<` `>`), YAML 내 코드 실행, "claude" 또는 "anthropic" 접두사가 붙은 Skill 이름

---

## 완성된 Skill 예시

이 가이드의 패턴을 보여주는 프로덕션 수준의 완성된 Skill 예시:

- **Document Skills** — PDF, DOCX, PPTX, XLSX 생성
- **Example Skills** — 다양한 워크플로우 패턴
- **Partner Skills Directory** — Asana, Atlassian, Canva, Figma, Sentry, Zapier 등의 Skill

저장소: [github.com/anthropics/skills](https://github.com/anthropics/skills)

---

## 리소스

**공식 문서:**
- Best Practices Guide
- Skills Documentation
- API Reference
- MCP Documentation

**블로그 포스트:**
- Introducing Agent Skills
- Engineering Blog: Equipping Agents for the Real World
- Skills Explained
- How to Create Skills for Claude
- Building Skills for Claude Code
- Improving Frontend Design through Skills

**지원:**
- 커뮤니티: Claude Developers Discord
- 버그 리포트: `anthropics/skills/issues`
