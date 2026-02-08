# 문제 해결

## Skill 업로드 실패

**Error:** "Could not find SKILL.md in uploaded folder"
**원인:** 파일 이름이 정확히 `SKILL.md`가 아님
**해결:**
- `SKILL.md`로 이름 변경 (대소문자 구분)
- 확인 방법: `ls -la`에서 `SKILL.md`가 표시되어야 함

**Error:** "Invalid frontmatter"
**원인:** YAML 포맷 문제. 흔한 실수:

```yaml
# 잘못됨 - 구분자 누락
name: my-skill
description: Does things

# 잘못됨 - 닫히지 않은 따옴표
name: my-skill
description: "Does things

# 올바름
---
name: my-skill
description: Does things
---
```

**Error:** "Invalid skill name"
**원인:** 이름에 공백 또는 대문자 포함

```yaml
# 잘못됨
name: My Cool Skill

# 올바름
name: my-cool-skill
```

## Skill이 트리거되지 않음

**증상:** Skill이 자동으로 로드되지 않음.

**해결:** `description` 필드를 수정하세요. 좋은/나쁜 예시는 [04-writing-instructions.ko.md](04-writing-instructions.ko.md)를 참고하세요.

**빠른 체크리스트:**
- 너무 일반적인가? ("Helps with projects"는 작동하지 않음)
- 사용자가 실제로 말할 트리거 문구가 포함되어 있는가?
- 해당되는 경우 관련 파일 유형이 언급되어 있는가?

**디버깅 방법:** Claude에게 물어보세요: "When would you use the [skill name] skill?" Claude가 description을 인용하여 답할 것입니다. 누락된 부분을 기반으로 조정하세요.

## Skill이 너무 자주 트리거됨

**증상:** 관련 없는 쿼리에 Skill이 로드됨.

**해결책:**

1. **부정 트리거 추가:**
   ```yaml
   description: Advanced data analysis for CSV files. Use for statistical modeling,
     regression, clustering. Do NOT use for simple data exploration (use data-viz
     skill instead).
   ```

2. **더 구체적으로 작성:**
   ```yaml
   # 너무 넓음
   description: Processes documents

   # 더 구체적
   description: Processes PDF legal documents for contract review
   ```

3. **범위 명확히:**
   ```yaml
   description: PayFlow payment processing for e-commerce. Use specifically for
     online payment workflows, not for general financial queries.
   ```

## MCP 연결 문제

**증상:** Skill은 로드되지만 MCP 호출이 실패함.

**체크리스트:**

1. **MCP 서버 연결 확인**
   - Claude.ai: Settings > Extensions > [Your Service]
   - "Connected" 상태가 표시되어야 함

2. **인증 확인**
   - API 키가 유효하고 만료되지 않았는지
   - 적절한 권한/스코프가 부여되었는지
   - OAuth 토큰이 갱신되었는지

3. **MCP 독립 테스트**
   - Claude에게 Skill 없이 직접 MCP를 호출하도록 요청
   - "Use [Service] MCP to fetch my projects"
   - 이것이 실패하면 문제는 Skill이 아닌 MCP에 있음

4. **도구 이름 확인**
   - Skill이 올바른 MCP 도구 이름을 참조하는지
   - MCP 서버 문서 확인
   - 도구 이름은 대소문자를 구분함

## 지침이 따라지지 않음

**증상:** Skill은 로드되지만 Claude가 지침을 따르지 않음.

**일반적인 원인:**

1. **지침이 너무 장황함**
   - 지침을 간결하게 유지
   - 글머리 기호와 번호 목록 사용
   - 상세한 참고사항은 별도 파일로 이동

2. **지침이 묻혀 있음**
   - 중요한 지침을 상단에 배치
   - `## Important` 또는 `## Critical` 헤더 사용
   - 필요 시 핵심 사항 반복

3. **모호한 표현**
   ```text
   # 나쁨
   Make sure to validate things properly

   # 좋음
   CRITICAL: Before calling create_project, verify:
   - Project name is non-empty
   - At least one team member assigned
   - Start date is not in the past
   ```

   고급 기법: 중요한 검증의 경우, 언어 지침에 의존하기보다는 검사를 프로그래매틱하게 수행하는 스크립트를 번들하는 것을 고려하세요. 코드는 결정적이지만, 언어 해석은 그렇지 않습니다.

4. **모델 "게으름"** — 명시적 격려를 추가:
   ```markdown
   ## Performance Notes
   - Take your time to do this thoroughly
   - Quality is more important than speed
   - Do not skip validation steps
   ```

   참고: 이것을 SKILL.md보다 사용자 프롬프트에 추가하는 것이 더 효과적입니다.

## Large Context 문제

**증상:** Skill이 느리거나 응답 품질이 저하됨.

**원인:**
- Skill 콘텐츠가 너무 큼
- 너무 많은 Skill이 동시에 활성화됨
- Progressive Disclosure 대신 모든 콘텐츠가 로드됨

**해결책:**

1. **SKILL.md 크기 최적화**
   - 상세 문서를 `references/`로 이동
   - 인라인 대신 참조 링크 사용
   - SKILL.md를 5,000단어 이내로 유지

2. **활성화된 Skill 수 줄이기**
   - 20~50개 이상의 Skill이 동시에 활성화되어 있는지 평가
   - 선택적 활성화 권장
   - 관련 기능을 위한 Skill "팩" 고려
