# Skill 패턴

이 패턴들은 얼리 어답터와 내부 팀이 만든 Skill에서 도출되었습니다. 규범적인 템플릿이 아니라, 효과적으로 작동하는 것으로 확인된 일반적인 접근 방식입니다.

## 접근법 선택: Problem-First vs. Tool-First

- **Problem-first:** "프로젝트 워크스페이스를 설정해야 해" — Skill이 올바른 순서로 적절한 MCP 호출을 조율합니다. 사용자는 결과를 설명하고, Skill이 도구를 처리합니다.
- **Tool-first:** "Notion MCP를 연결했어" — Skill이 Claude에게 최적의 워크플로우와 모범 사례를 가르칩니다. 사용자에게는 접근 권한이 있고, Skill은 전문지식을 제공합니다.

대부분의 Skill은 한쪽으로 기울어집니다. 어떤 프레이밍이 여러분의 Use Case에 맞는지 알면 아래에서 적절한 패턴을 선택하는 데 도움이 됩니다.

---

## 패턴 1: 순차 워크플로우 오케스트레이션

**적용 시점:** 사용자가 특정 순서의 다단계 프로세스를 필요로 할 때.

```markdown
## Workflow: Onboard New Customer

### Step 1: Create Account
Call MCP tool: `create_customer`
Parameters: name, email, company

### Step 2: Setup Payment
Call MCP tool: `setup_payment_method`
Wait for: payment method verification

### Step 3: Create Subscription
Call MCP tool: `create_subscription`
Parameters: plan_id, customer_id (from Step 1)

### Step 4: Send Welcome Email
Call MCP tool: `send_email`
Template: welcome_email_template
```

**핵심 기법:**
- 명시적 단계 순서
- 단계 간 의존성
- 각 단계에서의 검증
- 실패 시 롤백 지침

---

## 패턴 2: Multi-MCP 조율

**적용 시점:** 워크플로우가 여러 서비스에 걸쳐 있을 때.

**예시: 디자인-개발 핸드오프**

```markdown
### Phase 1: Design Export (Figma MCP)
1. Figma에서 디자인 에셋 내보내기
2. 디자인 사양서 생성
3. 에셋 매니페스트 생성

### Phase 2: Asset Storage (Drive MCP)
1. Drive에 프로젝트 폴더 생성
2. 모든 에셋 업로드
3. 공유 링크 생성

### Phase 3: Task Creation (Linear MCP)
1. 개발 태스크 생성
2. 태스크에 에셋 링크 첨부
3. 엔지니어링 팀에 할당

### Phase 4: Notification (Slack MCP)
1. #engineering 채널에 핸드오프 요약 게시
2. 에셋 링크와 태스크 참조 포함
```

**핵심 기법:**
- 명확한 단계 분리
- MCP 간 데이터 전달
- 다음 단계로 이동 전 검증
- 중앙 집중식 오류 처리

---

## 패턴 3: 반복 개선

**적용 시점:** 반복을 통해 결과물의 품질이 향상될 때.

**예시: 보고서 생성**

```markdown
## Iterative Report Creation

### Initial Draft
1. MCP를 통해 데이터 조회
2. 초안 보고서 생성
3. 임시 파일에 저장

### Quality Check
1. 검증 스크립트 실행: `scripts/check_report.py`
2. 문제 식별:
   - 누락된 섹션
   - 일관되지 않은 포맷
   - 데이터 검증 오류

### Refinement Loop
1. 식별된 각 문제 해결
2. 영향받은 섹션 재생성
3. 재검증
4. 품질 기준 충족까지 반복

### Finalization
1. 최종 포맷 적용
2. 요약 생성
3. 최종 버전 저장
```

**핵심 기법:**
- 명시적 품질 기준
- 반복적 개선
- 검증 스크립트
- 반복 중단 시점 파악

---

## 패턴 4: 컨텍스트 인식 도구 선택

**적용 시점:** 동일한 결과이지만 컨텍스트에 따라 다른 도구가 필요할 때.

**예시: 파일 저장**

```markdown
## Smart File Storage

### Decision Tree
1. 파일 유형과 크기 확인
2. 최적의 저장 위치 결정:
   - 대용량 파일 (>10MB): Cloud Storage MCP 사용
   - 협업 문서: Notion/Docs MCP 사용
   - 코드 파일: GitHub MCP 사용
   - 임시 파일: 로컬 저장소 사용

### Execute Storage
결정에 따라:
- 적절한 MCP 도구 호출
- 서비스별 메타데이터 적용
- 접근 링크 생성

### Provide Context to User
해당 저장소가 선택된 이유 설명
```

**핵심 기법:**
- 명확한 판단 기준
- 대체 옵션
- 선택에 대한 투명성

---

## 패턴 5: 도메인 특화 인텔리전스

**적용 시점:** Skill이 도구 접근을 넘어 전문 지식을 추가할 때.

**예시: 금융 컴플라이언스**

```markdown
## Payment Processing with Compliance

### Before Processing (Compliance Check)
1. MCP를 통해 거래 세부정보 조회
2. 컴플라이언스 규정 적용:
   - 제재 목록 확인
   - 관할권 허용 여부 검증
   - 위험 수준 평가
3. 컴플라이언스 결정 문서화

### Processing
IF 컴플라이언스 통과:
- 결제 처리 MCP 도구 호출
- 적절한 사기 검사 적용
- 거래 처리

ELSE:
- 검토 대상으로 플래그
- 컴플라이언스 케이스 생성

### Audit Trail
- 모든 컴플라이언스 검사 로깅
- 처리 결정 기록
- 감사 보고서 생성
```

**핵심 기법:**
- 로직에 내장된 도메인 전문지식
- 행동 전 컴플라이언스
- 포괄적 문서화
- 명확한 거버넌스
