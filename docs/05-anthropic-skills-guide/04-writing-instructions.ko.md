# 효과적인 Skill 작성법

## Description 필드

Anthropic 엔지니어링 블로그에 따르면: "이 메타데이터는... 전체 내용을 컨텍스트에 로드하지 않고도 각 Skill을 언제 사용해야 하는지 Claude가 판단할 수 있을 정도의 정보를 제공합니다." 이것이 Progressive Disclosure의 첫 번째 단계입니다.

**구조:** `[하는 일]` + `[사용 시점]` + `[주요 기능]`

### 좋은 Description

```yaml
# 좋음 - 구체적이고 실행 가능
description: Analyzes Figma design files and generates developer handoff
  documentation. Use when user uploads .fig files, asks for "design specs",
  "component documentation", or "design-to-code handoff".

# 좋음 - 트리거 문구 포함
description: Manages Linear project workflows including sprint planning, task
  creation, and status tracking. Use when user mentions "sprint", "Linear tasks",
  "project planning", or asks to "create tickets".

# 좋음 - 명확한 가치 제안
description: End-to-end customer onboarding workflow for PayFlow. Handles account
  creation, payment setup, and subscription management. Use when user says
  "onboard new customer", "set up subscription", or "create PayFlow account".
```

### 나쁜 Description

```yaml
# 너무 모호함
description: Helps with projects.

# 트리거 없음
description: Creates sophisticated multi-page documentation systems.

# 너무 기술적, 사용자 트리거 없음
description: Implements the Project entity model with hierarchical relationships.
```

## 메인 지침 작성

Frontmatter 다음에 Markdown으로 실제 지침을 작성합니다.

### 권장 구조

이 템플릿을 Skill에 맞게 수정하세요. 대괄호 부분을 구체적인 내용으로 대체합니다.

```markdown
---
name: your-skill
description: [...]
---

# Your Skill Name

## Instructions

### Step 1: [첫 번째 주요 단계]
명확한 설명.

```bash
python scripts/fetch_data.py --project-id PROJECT_ID
```

Expected output: [성공 시 어떤 결과가 나오는지 설명]

(필요에 따라 단계 추가)

## Examples

### Example 1: [일반적인 시나리오]

User says: "새 마케팅 캠페인 설정해줘"

Actions:
1. MCP를 통해 기존 캠페인 조회
2. 제공된 파라미터로 새 캠페인 생성

Result: 확인 링크와 함께 캠페인 생성 완료

(필요에 따라 예시 추가)

## Troubleshooting

**Error:** [일반적인 오류 메시지]
**Cause:** [발생 원인]
**Solution:** [해결 방법]

(필요에 따라 오류 케이스 추가)
```

## 지침 작성 모범 사례

### 구체적이고 실행 가능하게 작성

✅ **좋음:**
```text
Run `python scripts/validate.py --input {filename}` to check data format.
If validation fails, common issues include:
- Missing required fields (add them to the CSV)
- Invalid date formats (use YYYY-MM-DD)
```

❌ **나쁨:**
```text
Validate the data before proceeding.
```

### 번들된 리소스를 명확히 참조

```text
Before writing queries, consult `references/api-patterns.md` for:
- Rate limiting guidance
- Pagination patterns
- Error codes and handling
```

### Progressive Disclosure 활용

`SKILL.md`는 핵심 지침에 집중하세요. 상세한 문서는 `references/`로 이동시키고 링크를 연결하세요. (세 단계 시스템의 작동 방식은 핵심 설계 원칙을 참고하세요.)

### 오류 처리 포함

```markdown
## Common Issues

### MCP Connection Failed

If you see "Connection refused":
1. Verify MCP server is running: Check Settings > Extensions
2. Confirm API key is valid
3. Try reconnecting: Settings > Extensions > [Your Service] > Reconnect
```
