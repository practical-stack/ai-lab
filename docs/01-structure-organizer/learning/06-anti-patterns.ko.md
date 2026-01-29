---
title: "모듈 6: 안티패턴 및 베스트 프랙티스"
description: "AI 에이전트 아키텍처에서 피해야 할 12가지 흔한 안티패턴과 예방 전략 및 조직 가드레일"
type: tutorial
tags: [AI, Architecture, BestPractice]
order: 6
depends_on: [./05-examples.ko.md]
related: [./06-anti-patterns.md]
---

# 모듈 6: 안티패턴 및 베스트 프랙티스

> 피해야 할 흔한 실수와 구현해야 할 가드레일

## 학습 목표

이 모듈을 완료하면:
- 12가지 가장 흔한 안티패턴을 인식할 수 있습니다
- 각 안티패턴을 방지하는 방법을 알게 됩니다
- 조직을 위한 가드레일을 구현할 수 있습니다

---

## 6.1 12가지 안티패턴

### 개요

| # | 안티패턴 | 위험 수준 | 흔한 원인 |
|---|----------|-----------|-----------|
| 1 | Skill 스파게티 | 높음 | 거버넌스 부재 |
| 2 | Command 남용 | 중간 | 과도한 엔지니어링 |
| 3 | Agent 전능 | 높음 | 게으른 설계 |
| 4 | 무제한 Tool 사용 | 심각 | 보안 리뷰 없음 |
| 5 | 할루시네이션 관용 | 높음 | 검증 없음 |
| 6 | NIH 증후군 | 중간 | 낮은 발견 가능성 |
| 7 | 컨텍스트 오버플로우 | 높음 | 제한 없음 |
| 8 | 실패 경로 무시 | 심각 | 정상 경로만 생각 |
| 9 | 테스팅 부재 | 높음 | "그냥 프롬프트일 뿐" |
| 10 | 관측성 부족 | 높음 | 모니터링 없음 |
| 11 | 버전 관리 혼란 | 중간 | 프로세스 없음 |
| 12 | 문서화 부실 | 중간 | 시간 압박 |

---

## 6.2 안티패턴 상세

### 1. Skill 스파게티

**증상:**
- 목적이 불분명한 수십 개의 skill
- 중복 기능의 skill 존재 (예: `DBQuery`와 `Database` 둘 다 존재)
- 하나의 skill이 너무 많은 일을 함
- Agent가 잘못된 skill 로드
- 여러 skill에 중복된 콘텐츠 → 유지보수 악몽

**방지책:**

```yaml
guardrails:
  - name: "Skill 레지스트리"
    action: "모든 skill의 이름, 목적, 트리거가 있는 카탈로그 유지"
    
  - name: "도메인 경계"
    action: "각 skill은 하나의 도메인 소유. 중복 없음."
    
  - name: "크기 제한"
    action: "Skill SKILL.md < 500줄. 더 크면 분할."
    
  - name: "트리거 명확성"
    action: "모든 skill에 USE WHEN / DO NOT USE 명확히"
    
  - name: "정기 리뷰"
    action: "분기별: 중복 통합, 미사용 아카이브"
```

**수정 예시:**
```
이전:
  skills/db-query/
  skills/database-access/
  skills/sql-helper/
  
이후:
  skills/database/
    ├── SKILL.md
    └── workflows/
        ├── query.md
        ├── migrate.md
        └── backup.md
```

---

### 2. Command 남용 (불필요한 래퍼)

**증상:**
- `/create-class`, `/create-interface`, `/create-enum` (별도 커맨드)
- 사용자가 모든 커맨드를 기억 못 함
- 에이전트가 자동 처리할 수 있는 것과 커맨드 중복
- **도구 제한 없이 단순히 Skill을 감싸기만 하는 Command**
- Command가 `allowed-tools`, 위험한 작업, `$ARGUMENTS` 검증, `/` 단축키 중 어느 것도 활용하지 않음

**방지책:**

```yaml
guardrails:
  - name: "Command 정당화 검증"
    action: |
      Command 생성 전에 확인:
      - allowed-tools 제한이 필요한가? 아니라면 Skill을 직접 사용
      - 위험한/되돌릴 수 없는 작업인가?
      - 구조화된 $ARGUMENTS가 필요한가?
      - / 단축키가 필요한가?
      위의 어느 것도 해당되지 않으면 Command 래퍼를 만들지 않음
    
  - name: "Command 제한"
    action: "프로젝트당 최대 10-15개 커맨드"
    
  - name: "통합"
    action: "유사 커맨드 → 매개변수 있는 단일 커맨드"
    
  - name: "자동 vs 수동"
    action: "에이전트가 자동 처리 가능하면 커맨드 만들지 않음"
    
review_checklist:
  - "이 Command에 allowed-tools 제한이 있나요?"
  - "위험한 작업이라서 명시적 트리거가 필요한가요?"
  - "Skill을 @path로 직접 호출하면 안 되나요?"
  - "기존 커맨드와 통합 가능한가요?"
```

**불필요한 Command 래퍼 예시:**
```
나쁨 (불필요한 래퍼):
  /apply-coding-style  ← Skill을 감싸기만 함, 도구 제한 없음
  # → coding-style Skill을 @path로 직접 사용하면 됨

좋음 (정당한 래퍼):
  /deploy [env]        ← allowed-tools 제한 + 위험한 작업
  ---
  allowed-tools: Bash(git:*), Bash(npm:*)
  ---
```

**수정 예시:**
```
이전:
  /build-api
  /build-ui
  /build-worker
  
이후:
  /build [component]
  # /build api
  # /build ui
  # /build worker
```

---

### 3. Agent 전능

**증상:**
- 하나의 에이전트가 모든 것을 함 (코드, 문서, 배포, 디자인)
- 에이전트 프롬프트가 1000줄 이상
- 너무 많은 도구/skill 로드
- 예측 불가능한 동작

**방지책:**

```yaml
guardrails:
  - name: "단일 책임"
    action: "하나의 에이전트 = 하나의 명확한 역할"
    
  - name: "프롬프트 크기 제한"
    action: "시스템 프롬프트 < 400줄. 지식에는 skill 사용."
    
  - name: "권한 범위 지정"
    action: "각 에이전트는 필요한 도구/권한만 받음"
    
  - name: "서브에이전트 패턴"
    action: "복잡한 작업 → 오케스트레이터 + 전문 서브에이전트"
```

**수정 예시:**
```
이전:
  mega-agent (모든 것을 함)
  
이후:
  orchestrator-agent
    ├── code-agent
    ├── test-agent
    ├── docs-agent
    └── deploy-agent
```

---

### 4. 무제한 Tool 사용

**증상:**
- 에이전트가 아무 파일이나 삭제 가능
- 위험한 액션에 확인 없음
- 속도 제한 없는 API 호출
- 도구 실패가 시스템 크래시 유발

**방지책:**

```yaml
tool_safety:
  whitelist:
    - file_read: { scope: "프로젝트 디렉토리만" }
    - file_write: { scope: "src/ 및 tests/ 만" }
    
  confirmation_required:
    - delete_file: "확인: {path} 삭제?"
    - deploy: "{env}에 배포. 진행?"
    - database_write: "프로덕션 데이터 수정됩니다. 확실합니까?"
    
  rate_limits:
    - api_call: "분당 10회"
    - file_write: "세션당 50회"
    
  error_handling:
    format: '{"status": "error", "code": "X", "message": "..."}'
    retry: 3
    fallback: "사용자에게 도움 요청"
```

---

### 5. 할루시네이션 관용

**증상:**
- 에이전트가 잘못된 정보를 자신 있게 만들어냄
- 출처 인용 없음
- 버그 설명에 사실과 다른 내용
- 사용자가 주장을 검증할 수 없음

**방지책:**

```yaml
guardrails:
  - name: "불확실하면 물어보기"
    rule: "확신 < 80%면 추측 대신 사용자에게 질문"
    
  - name: "출처 인용"
    rule: "지식 기반 답변은 파일:라인 또는 문서 인용 필수"
    
  - name: "검증 단계"
    rule: "사실 주장 전 도구로 실제 값 확인"
    
  - name: "사람 리뷰"
    rule: "중요 결정은 사람 확인 필요"

system_prompt_addition: |
  중요: 절대 추측하지 마세요. 불확실하면:
  1. "확실하지 않지만..." 말하기
  2. 정보 출처 인용
  3. 검증 방법 제안
```

---

### 6. NIH(Not-Invented-Here) 증후군

**증상:**
- 기존 skill을 새 에이전트에서 중복
- 기존 것 대신 새 커맨드 생성
- 여러 곳에 동일한 로직
- 유지보수 악몽

**방지책:**

```yaml
guardrails:
  - name: "Skill 카탈로그"
    action: "모든 skill의 검색 가능한 레지스트리"
    
  - name: "코드 리뷰 확인"
    question: "기존 skill X를 대신 사용할 수 없나요?"
    
  - name: "사용량 메트릭"
    action: "skill 사용량 추적. 미사용은 홍보 또는 제거."
    
process:
  before_creating_new:
    1. 기존 skill 검색
    2. 새 생성보다 개선이 나은지 확인
    3. 팀과 논의
```

---

### 7. 컨텍스트 오버플로우

**증상:**
- 에이전트가 한 번에 너무 많은 skill 로드
- 대화 히스토리 폭발
- "컨텍스트 제한 초과" 오류
- 높은 비용, 느린 응답

**방지책:**

```yaml
guardrails:
  - name: "지연 로딩"
    action: "skill 설명 먼저 로드, 필요할 때만 전체 콘텐츠"
    
  - name: "컨텍스트 트리밍"
    action: "75% 컨텍스트 사용 시 자동 요약"
    
  - name: "Skill 수 제한"
    action: "요청당 최대 3개 skill 로드"
    
  - name: "서브에이전트 위임"
    action: "대용량 정보 처리 → 별도 서브에이전트 컨텍스트"
    
  - name: "비용 모니터링"
    action: "토큰 사용량 임계값 초과 시 알림"
```

---

### 8. 실패 경로 무시

**증상:**
- 정상 경로만 설계
- 재시도 로직 없음
- 오류가 조용한 실패 유발
- 롤백 계획 없음

**방지책:**

```yaml
design_checklist:
  for_each_step:
    - "이게 실패하면 어떻게 되나?"
    - "실패를 어떻게 감지하나?"
    - "복구 액션은 무엇인가?"
    - "롤백이 필요한가?"
    
error_handling_template:
  detection: "실패 감지 방법"
  response: "무엇을 할 것인가"
  user_message: "사용자에게 무엇을 알릴 것인가"
  logging: "무엇을 기록할 것인가"
  
standard_responses:
  timeout: "작업 시간 초과. 부분 진행 저장됨. 재시도?"
  tool_error: "X 도구 실패: {reason}. 대안 시도 중..."
  unrecoverable: "진행 불가. 완료된 것: ..."
```

---

### 9. 테스팅 부재

**증상:**
- "그냥 프롬프트일 뿐, 뭘 테스트해?"
- 엣지 케이스에서 실패
- 버전 업데이트가 시나리오 깨뜨림
- 회귀 감지 없음

**방지책:**

```yaml
testing_requirements:
  unit:
    - "Command X가 입력 Y로 출력 Z 생성"
    - "Skill이 오류 없이 로드됨"
    - "Skill이 올바른 키워드에 트리거됨"
    
  integration:
    - "입력부터 출력까지 전체 워크플로우"
    - "오류 시나리오 올바르게 처리됨"
    
  regression:
    - "이전 버그가 수정된 채로 유지"
    - "버전 업데이트가 워크플로우 깨뜨리지 않음"
    
ci_integration:
  - "모든 PR에 테스트 실행"
  - "테스트 실패 시 머지 차단"
  - "테스트 커버리지 추적"
```

---

### 10. 관측성 부족

**증상:**
- 프로덕션 이슈 디버깅 불가
- 어떤 skill이 사용되는지 모름
- 성능 메트릭 없음
- 느린 단계 식별 불가

**방지책:**

```yaml
logging_standard:
  format: "[LEVEL][COMPONENT][TRACE_ID] action=X result=Y time=Z"
  
  required_events:
    - Command 호출
    - Skill 로딩
    - Tool 호출 (인자 포함)
    - 오류 (스택 포함)
    - 완료 상태
    
metrics_to_track:
  - success_rate
  - avg_response_time
  - error_rate_by_type
  - skill_usage_counts
  - tool_failure_rates
  
alerting:
  - "오류율 > 5% → PagerDuty"
  - "응답 시간 > 30초 → Slack"
  - "사용량 이상 → 이메일"
```

---

### 11. 버전 관리 혼란

**증상:**
- 사용자마다 다른 동작
- 브레이킹 변경이 모두를 놀라게 함
- 롤백 불가능
- "내 컴퓨터에서는 되는데"

**방지책:**

```yaml
versioning_policy:
  format: "semver (major.minor.patch)"
  
  when_to_increment:
    major: "브레이킹 변경 (입력/출력 형식 변경)"
    minor: "새 기능 (하위 호환)"
    patch: "버그 수정"
    
  process:
    1. 메타데이터에 버전 업데이트
    2. CHANGELOG.md 업데이트
    3. 의존 컴포넌트와 호환성 테스트
    4. 팀에 공지
    5. 점진적 롤아웃 (내부 → 베타 → 프로덕션)
    
  rollback:
    - 이전 버전 사용 가능하게 유지
    - git에 릴리스 태그
    - 롤백 절차 문서화
```

---

### 12. 문서화 부실

**증상:**
- 설명 없는 skill
- 모호한 이름 (`MiscSkill`, `HelperAgent`)
- 사용 예시 없음
- 새 팀원이 길을 잃음

**방지책:**

```yaml
documentation_requirements:
  skills:
    - 명확한 USE WHEN / DO NOT USE
    - 워크플로우 라우팅 테이블
    - 예제 입력/출력
    
  commands:
    - 매개변수 설명
    - 사용 예시
    - 오류 시나리오
    
  agents:
    - 목표 선언
    - 역량 목록
    - 워크플로우 다이어그램
    
naming_conventions:
  allowed: "설명적 이름 (code-review, deploy-agent)"
  forbidden: "일반적 이름 (Misc, Helper, Test, Util)"
  
onboarding:
  - 아키텍처 개요가 있는 README
  - 컴포넌트 관계 다이어그램
  - 시작 가이드
```

---

## 6.3 가드레일 구현 체크리스트

### 팀용

```markdown
## 출시 전 체크리스트

### 설계 단계
- [ ] 컴포넌트가 결정 트리를 따름
- [ ] 기존 컴포넌트와 중복 없음
- [ ] 명확한 경계 정의됨
- [ ] 오류 시나리오 문서화됨

### 구현 단계
- [ ] 네이밍 규칙 따름
- [ ] 문서화 완료
- [ ] 테스트 작성됨
- [ ] 로깅 구현됨

### 리뷰 단계
- [ ] 코드 리뷰 완료
- [ ] 보안 리뷰 (도구 접근용)
- [ ] 안티패턴 검사 통과
- [ ] 버전 문서화됨

### 배포 단계
- [ ] 단계적 롤아웃 계획
- [ ] 롤백 절차 문서화됨
- [ ] 모니터링 설정됨
- [ ] 팀에 통지됨
```

### 안티패턴 빠른 검사

모든 새 컴포넌트에 이 질문을 하세요:

| 질문 | 아니오면 → |
|------|-----------|
| 이름이 설명적인가? | 이름 변경 |
| 이것을 위한 기존 컴포넌트가 있나? | 재사용 |
| 오류 케이스가 처리되나? | 처리 추가 |
| 테스트되었나? | 테스트 추가 |
| 문서화되었나? | 문서 추가 |
| 악용될 수 있나? | 보호장치 추가 |

---

## 6.4 1주 구현 계획

### 일별 스케줄

| 일 | 집중 | 작업 |
|----|------|------|
| **1일** | 환경 설정 | LLM, 도구, 권한 정의. skill/command 레지스트리 생성. |
| **2일** | 분류 | 기존 워크플로우 나열. Command/Skill/Agent 후보로 분류. |
| **3-4일** | 스켈레톤 구축 | 폴더 구조 생성. 템플릿으로 2-3개 핵심 컴포넌트 작성. |
| **5일** | 도구 통합 | 실제 도구 연결. 엔드투엔드 테스팅. |
| **6일** | 리뷰 | 팀 리뷰. 안티패턴 검사. 소그룹 파일럿. |
| **7일** | 문서화 | README 작성. 팀과 공유. 피드백 수집. |

### 지속적 실천

```yaml
weekly:
  - 메트릭 대시보드 리뷰
  - 오류 알림 분류
  - 문서 업데이트
  
monthly:
  - Skill 사용량 리뷰 (통합/아카이브)
  - 도구 접근 보안 리뷰
  - 성능 최적화
  
quarterly:
  - 전체 안티패턴 감사
  - 팀 교육 리프레시
  - 의존성 업데이트
```

---

## 핵심 정리

1. **안티패턴은 예측 가능** - 대부분의 팀이 같은 실수를 함
2. **가드레일이 재앙 방지** - 사전에 구현하세요
3. **체크리스트가 동작** - 설계, 리뷰, 배포 시 사용
4. **모니터링은 필수** - 볼 수 없는 것은 고칠 수 없음
5. **문서화는 투자** - 미래의 자신이 현재의 자신에게 감사할 것

---

## 코스 요약

축하합니다! AI 에이전트 아키텍처 코스를 완료했습니다.

### 학습한 내용

| 모듈 | 핵심 개념 |
|------|-----------|
| 1. 기초 | Command, Skill, Agent 정의와 차이 |
| 2. 관계 | 계층 구조, 계약, 레이어 상호작용 |
| 3. 결정 프레임워크 | 언제 무엇을 만들지, 결정 트리, 체크리스트 |
| 4. 템플릿 | 바로 사용 가능한 스펙 형식 |
| 5. 예제 | 실제 구현 |
| 6. 안티패턴 | 흔한 실수와 방지법 |

### 다음 단계

1. **즉시 적용** - 하나의 워크플로우 구현 선택
2. **단순하게 시작** - 먼저 하나의 command 또는 skill
3. **반복** - 실제 사용 기반으로 개선
4. **공유** - 배운 것을 팀에 가르치기

---

## 리소스

- [리서치 프롬프트](../research/00-research-prompt.ko.md) - 원본 리서치 메타 프롬프트
- [Claude 리서치](../research/01-claude.ko.md) - Claude의 리서치 응답
- [GPT 리서치](../research/02-gpt/) - GPT의 종합 리서치 응답 (6부작)
- [추출된 Skill](../../../.claude/skills/meta-structure-organizer/) - 컴포넌트 결정을 위한 실용적 skill
