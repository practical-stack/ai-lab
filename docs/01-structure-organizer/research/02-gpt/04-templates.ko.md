---
title: "설계 템플릿"
description: "Command, Skill, Agent의 표준 스펙 템플릿으로 입력 스키마, 프로세스 흐름, 출력 정의를 포함."
type: explanation
tags: [Architecture, AI]
order: 4
related: ["./04-templates.md"]
depends_on: [./README.md]
---

# D. 설계 템플릿 (스펙 폼)

아래에 Command, Skill, Agent 각각에 대한 표준 스펙 작성 템플릿을 제공합니다. 실무에서 이 폼을 복사하여 각 구성요소의 명세서를 작성하면 됩니다.

## 1. Command Spec Template

**Command Name:** `<짧고 명확한 명령 이름>`  
**Purpose (목적):** 이 Command의 의도와 하는 작업을 한 줄로 명시.

- _예:_ `/deploy` – _"지정한 환경에 최신 코드를 배포한다."_

**Out of Scope (비목적):** 이 Command가 수행하지 않거나 다루지 않는 범위 명시.

- _예:_ "인프라 프로비저닝은 하지 않으며, 배포 실패시 롤백은 담당하지 않음."

**Inputs (입력 스키마):**

- **Parameters:** 허용하는 인자/옵션 목록과 의미, 타입.
  - _예:_ `<env>` (string) – 배포 대상 환경, `"dev"` 혹은 `"prod"` 중 하나.
  - _예:_ `--dry-run` (flag) – 실제 배포하지 않고 단계 검증만 수행.
- **Input Example:** 실제 호출 예시를 함께 기술.
  - _예:_ `/deploy prod --dry-run`

**Process (절차):** Command 실행 시 수행되는 내부 절차를 순서대로 기술. (필요시 pseudo-code 사용)

1. 입력 파라미터 유효성 검사 (예: `env` 값 체크).
2. 관련 Skill 로드 (예: `Deployment` 스킬 로드하여 체크리스트 확보).
3. 툴 실행 (예: `deploy_script.sh env=... dry-run` 실행).
4. 결과 확인 및 성공/실패 분기 처리.
5. 사용자에게 요약 결과 응답 생성.

**Output (출력 스키마):** Command 실행 후 Agent가 사용자에게 제공하는 출력 형태.

- **Success:** 성공 시 메시지 또는 산출물 형식.
  - _예:_ "✅ Deployment to **prod** successful. (Version 1.2.3 deployed)"
- **Failure:** 실패 시 오류 표준 형식.
  - _예:_ "❌ Deployment failed – _Timeout connecting to server_"
- **Output Artifacts:** 생성/변경되는 외부 리소스.
  - _예:_ 배포 로그 파일 (`logs/deploy_<env>.log`) 업데이트.

**Failure Modes & Errors (실패 모드 및 에러 코드):** 가능한 실패 시나리오와 처리 방법 명시.

- _예:_ `INVALID_ENV` – 지원하지 않는 환경 인자 → **즉시 오류 응답**, 배포 시도 안 함.
- _예:_ `DEPLOY_TIMEOUT` – 배포 스크립트 타임아웃 → **오류 메시지 반환**, (필요시) **클린업** 시도.
- _예:_ `DEPLOY_PARTIAL_FAIL` – 몇 개 서비스만 배포됨 → **경고 메시지** + **추가 조치 가이드** 제공.

**Safety Constraints (안전장치):** 보안/권한/실행상의 안전 조치.

- _Security:_ 프로덕션(`prod`) 배포는 **추가 확인 질문** 요구. (예: "Are you sure?")
- _Permission:_ 에이전트가 이 Command 실행시 **특정 IAM 역할**로만 수행 (권한 격리).
- _Dry-run:_ 기본적으로 `--dry-run`모드로 실행 후 사용자 확인 받거나, `--force` 옵션이 있어야 실제 실행.
- _Rate Limit:_ 하루 한 번만 실행 가능하도록 제한 (중복 배포 방지).

**Versioning (버전/호환성):**

- **Current Version:** v1.0 (2026-01-24) – 최초 작성.
- **Change Log:**
  - v1.1 – _변경예정:_ 환경별 다른 스크립트 지원 추가 예정.
- **Backward Compatibility:** v1.x 대에서는 입력 파라미터와 출력 포맷 유지. v2.0에서 파라미터 변화 가능.

**Testing (테스트 전략):**

- **Unit Tests:** 각 인자 조합별로 마크다운 명령 파일을 small context 에이전트로 실행, 기대 응답 검증.
  - _예:_ `/deploy dev` → "successful" 포함 응답 확인. `/deploy invalid` → "INVALID_ENV" 오류 확인.
- **Integration Tests:** 실제 스테이징 환경에 dry-run으로 실행해 로그/시스템 영향 확인. (CI 파이프라인 nightly)
- **Simulation:** 프로덕션에 대해 dry-run 모드로 정기 실행해, 스크립트/API 변경으로 인한 실패 조기 감지.

**Observability (관측):**

- **Logging:** 실행 시 각 단계 (검증, 스킬로드, 툴호출 결과)를 `COMMAND=deploy` 태그와 함께 로그.
- **Metrics:** `deploy_success_count`, `deploy_failure_count`, `deploy_duration_ms` 메트릭 수집 및 대시보드화.
- **Traceability:** Trace ID를 상위 Agent 대화와 연동해 저장. 문제 발생 시 해당 ID로 전체 과정 재현 가능.
- **Notifications:** prod 배포 성공/실패 결과를 슬랙 채널에 알림.

**Owners & Reviewers:**

- **Owner:** DevOps팀 – Alice (alice@example.com)
- **Reviewer:** ML Platform팀 – Bob, 및 시큐리티팀 – Charlie (승인자 목록)

**Notes:** (기타 참고사항)

- 실제 배포는 사전에 CI 파이프라인을 통과한 artefact에 대해서만 진행됨.
- 이 Command 실행 전에 Agent는 코드 변경사항이 모두 커밋되었는지 확인하는 것이 좋음 (추후 검토).

---

## 2. Skill Spec Template

**Skill Name:** `<Domain>.<Skill>` (도메인과 스킬 식별자)  
**Description (목적/사용처):** 해당 Skill이 다루는 문제 영역과 사용 트리거를 상세히 기술.

- _예:_ **logging skill** – _"코드에 로깅 추가/수정 작업 시 사용. 다른 맥락에서는 사용하지 말 것. (Use when: adding log statements or adjusting log levels. Do NOT use when: database transactions or UI text.)"_

**Not for Use (비목적/한계):** 에이전트가 이 Skill을 잘못 사용하면 안 되는 경우나 한계.

- _예:_ "Debugging 상황에는 이 스킬이 도움 안 됨 – 대신 debug skill 사용"
- _예:_ "거대한 로그 데이터 분석에는 본 스킬 비적합 (context 한계)"

**Skill Files Structure:** (SKILL.md 및 부속 파일 구성)

```
skills/
└── logging/                    # Domain folder (kebab-case)
    ├── SKILL.md                # 메인 스킬 정의
    ├── workflows/
    │   ├── add-log.md          # 새 로그 추가 절차
    │   └── adjust-level.md     # 로그 레벨 조정 절차
    └── tools/
        └── format_log.py       # (예시) 로그 포맷 검증 스크립트
```

- **Context Files:** SKILL.md 외 참고로 불러올 추가 문서가 있으면 명시.
  - _예:_ `Conventions.md` – 프로젝트 공통 로깅 컨벤션 설명 (SKILL.md 본문에서 참조함).
- **Tools:** 동반하는 툴/스크립트 설명 및 경로.
  - _예:_ `tools/format_log.py` – Python script, 인자로 로그 메시지 주면 포맷 규칙 검사, 결과 JSON 리턴.

**Skill Triggers (트리거 조건):** 에이전트가 이 Skill을 언제 로드해야 하는지 구체적 패턴.

- _예:_ 사용자 요청이나 Agent 목표에 **"log", "logging", "로그레벨"** 키워드 포함 → Trigger.
- _예:_ 파일 변경 맥락에서 `*.log` 파일이 대상일 때 → Trigger.
- _Negative Triggers:_ _"사용자가 '로그' 단어를 쓰더라도, `logistics`처럼 다른 의미면 무시"_
- **Trigger Implementation:** (프레임워크 상 구현 방법)
  - _예:_ Claude Skill YAML frontmatter의 `description`에 _USE WHEN_ 절에 키워드 나열.

**Inputs to Skill:** Skill이 전제로 하는 컨텍스트나 변수. (명시적인 함수 인자는 아니지만, **필요한 전제**를 기술)

- _예:_ "에이전트가 현재 편집 중인 코드 파일 내용" (Skill 내용에서 `<<file_content>>` placeholder로 참조).
- _예:_ "사용자가 원하는 로그 레벨 (e.g., INFO→DEBUG)" – Agent가 파악해놔야 함.

**Skill Content (내용 설명):** SKILL.md와 워크플로우들의 논리와 역할을 서술.

- **Overall Structure:**
  - SKILL.md: YAML frontmatter + 본문에 **Workflow Routing 표** 및 **스킬 설명**.
  - Workflows: 각각 세부 작업 절차 (예: add-log.md는 1)로그 위치 결정 2)코드 삽입 3)포맷 검증 4)테스트 등).
- **Example Workflow:** (한 워크플로우의 요약)
  - _예:_ **add-log.md** – "Agent가 이 워크플로우를 실행하면, 함수 시작 부분에 진입 로그를 추가하도록 안내. 1) 함수 이름과 입력값 식별, 2) 해당 위치에 `logger.info()` 코드 삽입, 3) `format_log.py` 툴로 메시지 포맷 검사, 4) 결과 요약."
- **Skill Usage in Agent:**
  - _예:_ "Agent는 SKILL.md 로드 후, `## Workflow Routing` 테이블을 읽어 **사용자 의도에 맞는 워크플로우 파일**을 선택 실행함. '로그 레벨 변경' 키워드 감지 시 adjust-level.md 로 진행."

**Output/Effect:** Skill 적용으로 기대되는 Agent의 행동이나 외부 효과.

- _예:_ "Agent will produce a code diff adding the log line."
- _예:_ "Agent's answer includes a confirmation that logging conventions were followed."
- (Skill 자체 출력 없음지만, Agent 결과의 특징 기술)

**Quality/Validation Points (안정성/검증 포인트):** Skill 내용의 정확성 및 안전장치.

- _예:_ "삽입된 로그 코드가 컴파일 에러를 일으키지 않도록, 성공 조건에 `build passes` 포함."
- _예:_ "Format 검증 스크립트 에러 시, Agent는 '포맷 검증 실패' 경고만 주고 진행 계속 (치명적 중단 안 함)."
- _예:_ "Skill 실행 후에도 결과가 기대와 다르면 Agent는 사용자에게 확인 질문을 해야 함 ('이 로그 추가로 원하는 정보가 출력되나요?')."

**Failure Modes:** Skill 적용 시 잘못될 수 있는 상황과 대응.

- _예:_ **NoLogLib:** 코드에 로깅 라이브러리 임포트가 안 된 경우 → Agent가 "logging 라이브러리 임포트 필요" 알림 후 import 구문 추가 단계 포함.
- _예:_ **MultiChoice:** 로그 삽입 위치가 여러 군데 나와 Agent가 혼란 → Agent는 Skill 지침에 따라 최적 위치 하나만 선택, ambiguous하면 사용자에게 물어봄.

**Testing (테스트 전략):**

- **Unit (Prompt) Test:** Skill의 Workflow가 제대로 작동하는지, 작은 예제로 Agent에 주입하여 시뮬레이션.
  - _예:_ 간단한 함수 코드에 "로그 추가" 요청 + 이 Skill만 로드 → Agent가 로그 한 줄 추가한 diff 생성 확인.
- **Integration Test:** 실제 Agent 전체에 Skill 포함해 사용자 시나리오 테스트.
  - _예:_ 사용자가 "이 함수에 디버그 로그 넣어줘" 요청 → Agent가 logging skill 로드하고 결과 주는지 확인.
- **Negative Test:** Skill 트리거가 오작동하지 않는지 테스트.
  - _예:_ "배송(logistics) 모듈 수정" 요청했을 때 logging skill이 로드되지 않는지 검증.
- **Automated Validation:** Skill 내 포함된 툴(`format_log.py`)을 단위 테스트 (올바른 포맷/잘못된 포맷 입력 케이스).

**Observability (관측):**

- **Usage Logging:** 이 Skill이 로드될 때 로그에 `SKILL=Logging loaded (trigger=keyword 'log')` 식으로 기록.
- **Metrics:** `skill_logging_usage_count`, `skill_logging_success_rate` 측정. (성공률은 Skill 적용 후 Agent 작업이 오류 없이 끝났는지로 계산)
- **Performance:** Skill 본문 토큰 수와 실제 투입 빈도를 모니터링하여, 평균 토큰 증량을 파악. (너무 크면 분리 고려)
- **Feedback Collection:** 에이전트 결과에 대해 사용자 피드백("이 로그 추가가 유용했다/쓸데없었다") 수집시, 해당 Skill 효과성을 평가.

**Versioning:**

- **Version:** v1.0 – 기본 로그 추가/레벨조정 기능.
- **History:** (버전 변경 내역)
  - v1.1 – 2026-02-10: 레벨 조정 시 기존 로그레벨 일괄 변경 워크플로우 추가.
- **Compatibility:** 이 Skill을 사용하는 다른 에이전트 (DevAgent v2.0 등) 리스트. 변경 시 호환성 영향 공지.

**Owner:** Backend팀 – Dave (dave@example.com)

**Notes:**

- 회사 코딩 규칙문서 (링크) 에 따라 작성됨.
- 관련 Skill: debug skill (함께 로드될 수 있으므로 트리거 충돌 주의 – debug skill description과 키워드 조정함).

---

## 3. Agent Spec Template

**Agent Name:** `<에이전트 이름>` – (가능한 역할을 나타내는 명칭, 예: _"qa-bug-hunter"_)  
**Goal (목표):** 이 Agent가 해결하거나 수행해야 하는 최상위 목적 기술.

- _예:_ "버그 리포트로부터 원인을 찾아 코드 수정 및 PR까지 완결하는 것."

**Scope & Role (역할/책임):** Agent의 책임 범위와 한계.

- _예:_ "코드베이스 내 버그 해결. 시스템 외부의 제품 이슈 분석은 범위 밖."
- _예:_ "스스로 코드 수정과 테스트까지 하지만, 최종 PR 머지는 사람 검토 필요."

**Inputs (입력):** Agent가 인자로 받는 내용 형식.

- _예:_ 사용자 프롬프트: "버그 설명" (자연어) + (선택) 관련 이슈ID.
- _예:_ API 호출로 받는 JSON: { "bug_description": "...", "steps_to_reproduce": "..." }
- 선행 맥락: (있는 경우) 이전 대화나 관련 파일들.

**Outputs (출력):** Agent가 산출하는 결과물.

- _예:_ 문제 원인 분석 설명 + 수정된 코드 패치(diff) + PR 링크.
- _예:_ 혹은 "해결 실패" 보고 및 추가 조치 제안.
- 출력 형식: Markdown 리포트, JSON (API 응답일 경우), etc.

**System Prompt (시스템 지시):** Agent에게 설정된 기본 프롬프트/개성/규칙.

```
You are a code assistant specialized in bug fixing…
• Always provide code diffs in markdown format.
• If uncertain, ask user for clarification rather than guessing.
```

(위 같이, Agent 초기 프롬프트 내용을 기재. 보안 요구사항이나 말투 등의 규칙 포함.)

**Accessible Tools & Skills:** 이 Agent가 사용할 수 있는 툴/스킬 목록과 권한.

- **Tools:**
  - FileSearch Tool – _"키워드로 코드베이스 검색"_ (읽기 전용, 프로젝트 디렉토리 전체 접근).
  - CodeEditor Tool – _"코드 수정/쓰기"_ (특정 경로 내 쓰기 가능, 테스트 코드 위치 제한).
  - TestRunner Tool – _"테스트 실행"_ (네트워크 없이 로컬 테스트만).
  - WebSearch Tool – _"오픈 웹 검색"_ (**비활성화** in this agent for security).
- **Skills:**
  - logging skill, debug skill – (필요시 자동 로드)
  - coding-guidelines skill – (프로젝트 코딩 스타일 & 네이밍 규칙 제공)
  - _Note:_ 이 Agent는 위 이외 Skill은 로드하지 않음 (예: ui skill 등 비관련 도메인 제외).
- **Permissions:**
  - GitHub API 토큰 (레포지토리 접근 권한 O, 조직 관리 권한 X)
  - Prod DB 접근 없음 (데이터 변동 방지)
  - Confidential 파일 접근 제한 (일부 디렉토리 읽기 금지)

**Planning & Workflow:** Agent가 문제를 풀기 위해 거치는 단계 및 의사결정 흐름.

1. **Problem Understanding:** 버그 설명을 분석해 재현 단서를 추출. 필요한 경우 사용자에게 추가 질문 (1회 이상).
2. **Locate Issue:** FileSearch 툴로 관련 코드 탐색. 관련 코드 조각을 읽어 원인 진단.
3. **Devise Fix:** 문제 원인에 맞는 수정 방안을 플랜. (필요시 coding-guidelines skill 자동 로드하여 스타일 참고)
4. **Apply Fix:** CodeEditor 툴로 해당 부분 수정.
5. **Test Fix:** TestRunner 툴 실행. 결과에 따라 성공/실패 분기.
   - 만약 테스트 실패 → 오류 로그 분석하여 **2단계**로 돌아가 추가 수정 시도 (최대 2회 루프).
6. **Prepare PR:** 테스트 통과하면 logging skill 등 참고하여 로그/주석 추가 개선. GitHub API 툴로 새 브랜치 push 및 PR 생성.
7. **Output Result:** 사용자에게 "버그 원인과 수정 사항" 요약 답변 출력, PR 링크 첨부. 필요시 리뷰어에게 다음 단계 안내.

**Success Criteria (완료 기준):** Agent가 언제 작업을 "완료"로 간주하는지.

- 모든 관련 테스트 통과 & PR 생성까지 완료하면 성공.
- 또는 사용자 확인을 받아 "이 정도면 됐다" 응답 시 완료.
- (위 조건 만족 못 하면, 실패로 간주하고 보고)

**Failure Modes & Recovery:** 예상 가능한 실패 시나리오와 Agent 대처.

- **Unreproducible Bug:** 재현 안 되는 버그 → 사용자에게 추가 정보 요청. 2회 시도해도 못 찾으면 "재현 불가" 보고하고 종료.
- **Fix not Found:** 3번 시도까지 테스트 실패 → 부분적으로 고친 내용 PR 올리고 "완전 해결 실패, 추가 도움 요청" 메시지. (PR에 워닝 라벨 달기).
- **Tool Error:** 툴 사용 오류 (예: FileSearch 시간초과) → 해당 스텝 재시도 (최대 2회), 그래도 실패 시 사용자에게 "일부 자동 검색 실패" 알리고 수동 확인 요청.
- **Permission Denied:** 시도한 작업이 권한상 금지 → 즉시 중지, 사용자에게 권한 문제 보고. (ex: "데이터베이스에는 접근할 수 없습니다").
- **Context Overflow:** 하위 에이전트 너무 많이 띄워 컨텍스트 부족 → 현재 진행 내용을 요약(Summarize Skill 이용)하여 컨텍스트 비우고 이어서 진행.
- **Fatal Error:** (코너 케이스) Agent 자체 논리 오류로 루프에 빠질 경우 → 타임아웃(예: 10분) 후 강제 종료, 사용자에게 사과 및 로그 제공.

**Safeguards (안전장치):** Agent 차원의 보호 장치.

- **Ask vs Assume:** 애매한 상황에서는 자체 판단으로 진행하지 말고 **사용자에게 확인 질문** 먼저 (hallucination 방지).
- **No Secrets in Output:** 환경 변수나 비밀번호 등 노출 금지 – 감지되면 마스킹 또는 응답 중단.
- **Rate Limit:** 이 Agent는 한 번에 한 세션/한 사용자만 실행 (병렬로 여러 PR 만들지 않음).
- **Confirmation:** 위험한 작업 전 사용자 컨펌 – (예: 대량 코드 삭제 전에 "정말 진행할까요?").
- **Performance Guard:** Sub-agent 병렬 최대 5개 (토큰 부하 방지), 각 sub-agent 2분 타임 제한.

**Collaboration (사람 개입 지점):**

- PR 생성 후 반드시 사람 리뷰 → Agent는 자동 머지 안 함.
- 에이전트가 불확실한 부분 질문 시, 사용자가 답할 때까지 대기 (세션 유지 시간 최대 1시간).
- 긴 작업 (예: 테스트 30분 이상)은 중간 진행 상황을 사용자에게 중계 ("테스트 러닝 중…") – (사용자 취소 가능).

**Logging & Monitoring:**

- 이 Agent는 모든 주요 이벤트를 로깅 (`AGENT=bug-hunter step=locate-issue time=...`).
- 사용된 스킬/툴 요약을 결과와 함께 로그에 첨부 (재현성 위해).
- Metric: bug_fix_success_rate, avg_fix_iterations, avg_time_to_fix 추적.

**Testing Plan:**

- **Scenario Tests:** 다양한 버그 시나리오로 end-to-end 테스트 (예: null pointer 예외, 계산 오류 등 각각).
- **Edge Case Tests:** 재현 정보 부족한 버그, 권한 없는 작업 요청 등의 케이스별 Agent 대응 검사.
- **Regression Tests:** 과거 해결했던 버그를 다시 주어 동일한 수정 출력 나오는지 확인 (Agent 업그레이드가 결과 바꾸지 않았는지).
- **Load Test:** 동시에 여러 버그 요청시 (병렬 5개) 리소스 사용 및 충돌 여부 관찰 (이 Agent는 병렬 제한 있지만, 여러 사용자 경우).

**Deployment & Versioning:**

- 버전 v1.0 – 초기 배포 (Claude-2 100k context 사용)
- v1.1 계획 – GPT-4로 모델 교체 (더 정확한 fix 기대), 이를 위해 tool 권한 재검토 예정.
- 롤아웃: v1.1은 내부 테스트 그룹에만 적용 후, 안정되면 전체 적용.
- 이전 버전 fallback: 심각한 버그 시 v1.0 Agent config로 되돌릴 수 있도록 설정 남김.

**Owner & Team:** ML Platform Team – 담당: Erin (erin@example.com)  
**Stakeholders:** QA팀, Backend팀 (Agent output 품질 피드백 루프 운영)

**Notes:**

- 이 Agent는 사내 `coding-guidelines skill`에 강하게 의존 – 해당 Skill 업데이트시 이 Agent 테스트 필요.
- 향후 개선: 복잡한 이슈는 LLM만으로 어려우므로, 유사 이력 검색(과거 버그 해결 내역) 통합 검토중.
