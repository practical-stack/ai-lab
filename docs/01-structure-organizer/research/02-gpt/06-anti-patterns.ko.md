---
title: "안티패턴 & 가드레일"
description: "Command/Skill/Agent 설계의 12가지 실패 패턴과 증상, 가드레일 및 방지책."
type: explanation
tags: [Architecture, AI]
order: 6
related: ["./06-anti-patterns.en.md"]
depends_on: [./README.md]
---

# F. 안티패턴 & 가드레일

Command/Skill/Agent 설계/운영 시 자주 나타나는 실패/혼용 패턴 12가지와 그 방지책을 정리합니다.

---

## 1. 스킬 스파게티 – Skill Spaghetti

**증상:**
- 수많은 Skill이 난립하고 경계가 모호
- 서로 겹치는 기능의 스킬 존재 (예: DBQuery vs Database)
- 하나의 Skill에 너무 많은 책임 → 거대해짐

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **도메인 기준 분류** | 명확한 도메인/책임 영역 정의 |
| **스킬 등록 표** | 모든 Skill의 이름, 목적, 트리거를 문서화한 카탈로그 유지 |
| **Max Size Rule** | Skill 파일이 500 lines 이상이면 분리 고려 |

---

## 2. 커맨드 남발 – Command Overuse

**증상:**
- 사소한 기능마다 Command 생성 → 수십 개의 slash 명령
- 사용자가 너무 많은 명령 기억 필요 → 혼란

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **기능 통합** | 유사 기능은 하나로 합치고 파라미터로 구분 |
| **Stable Command Set** | Command 수 10개 이내 유지 |
| **Deprecation** | 미사용 command는 Deprecated 표시 후 제거 |

---

## 3. 에이전트 만능주의 – Agent Omnipotence Mania

**증상:**
- Agent에게 과도한 만능 역할 부여
- 모든 세부 지식을 Agent 프롬프트에 몰아넣음
- Agent 프롬프트 수천 줄 → 맥락 초과

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Single Responsibility** | Agent 하나당 명확히 한정된 역할만 |
| **Skills & Subagents 활용** | 지식은 Skill화, 절차는 Subagent로 분리 |
| **Permission Scoping** | Agent마다 최소 권한만 부여 |

---

## 4. 툴 오남용 – Unbounded Tool Usage

**증상:**
- Agent가 툴 호출 시 제약 없이 사용
- "delete all data" 툴 필터 없이 사용 → 시스템 안전성 문제

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Tool Whitelist/Scopes** | 각 Agent에 화이트리스트와 범위 정의 |
| **Dangerous Tool Confirmation** | 위험 툴은 2차 확인 절차 |
| **Resource Limits** | 시간/메모리 제한 |

---

## 5. Hallucination & 출처 누락

**증상:**
- Agent/Skill이 자신있게 잘못된 정보 생성
- 문서 요약 시 출처 미표시 → 신뢰도 문제

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Ask when unsure** | "확실치 않으면 추측말고 질문하라" 규칙 |
| **Citations Protocol** | 지식베이스 답변 시 문서 경로/제목 인용 필수 |
| **Human Review** | 중요 결정 전 사람 확인 |

---

## 6. 모듈 미사용 – Not Invented Here for Skills

**증상:**
- 이미 추상화된 Skill/Command를 모르고 Agent 프롬프트에 재기술
- 지식이 여기저기 퍼짐 → 일관성 상실

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Discoverability** | Skill/Command 카탈로그 활용. 새 Agent 만들 때 먼저 검색 |
| **Code Review Check** | "기존 Skill로 쓸 수 있지 않을까?" 리뷰어 확인 |

---

## 7. 컨텍스트 창 오염 & 초과

**증상:**
- Agent가 너무 많은 Skill 한꺼번에 로드
- 컨텍스트 창 포화 → LLM 성능 저하, 비용 증가

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Lazy Loading** | Skill은 필요 시점까지 로딩 미루기 |
| **Context Trimming** | 일정 token 초과 시 자동 요약 |
| **Skill 개수 제한** | 요청당 최대 N개(예: 3개) Skill만 로드 |

---

## 8. 오류 경로 미고려 – Ignoring Failure Paths

**증상:**
- "해피 패스"(정상 시나리오) 위주로만 설계
- Agent 툴 실패 시 무한 재시도 → 멈춤

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Failure Mode Enumeration** | 설계 시 구성요소별 실패 시나리오 명시 |
| **Time-out & Stop Criteria** | 최대 횟수/시간 설정 후 graceful failure |
| **User Guidance** | 실패 응답에 다음 단계 제안 |

---

## 9. 테스트/검증 부족

**증상:**
- Skill/Agent를 "프롬프트니까 대충" 만들어 배포
- 엣지 케이스에서 엉뚱한 결과

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Mandatory Test Cases** | PR에 핵심 시나리오 테스트케이스 필수 첨부 |
| **Gradual Rollout** | 내부 일부 사용자 → 전사 확산 단계적 릴리즈 |

---

## 10. 로그/모니터링 부실

**증상:**
- 에이전트 모니터링 방법 없음
- 오류 발생 시 로그 불충분 → 재현 어려움

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Structured Logging** | 표준화된 로그 형식 (JSON/key=value) |
| **Trace IDs** | 추적 ID 필수 |
| **Metric Dashboard** | 성공률, 오류율, avg latency 등 KPI 대시보드 |

---

## 11. 버전 관리 혼란

**증상:**
- Skill/Command 변경 시 사용자별 버전 다름 → 결과 불일치
- 호환성 고려 없이 수정

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Semantic Versioning** | 큰 변경은 Major 올리기 |
| **Changelog** | Skill/Agent 변경 시 CHANGELOG.md 업데이트 필수 |
| **Single Source of Truth** | 중앙 리포에서만 정의 관리 |

---

## 12. Documentation 및 Naming 문제

**증상:**
- Skill/Command/Agent 파일에 설명 부족
- 이름이 모호해 의도 파악 어려움

**가드레일:**

| 규칙 | 설명 |
|------|------|
| **Template-Driven Docs** | Spec Template에 따라 모든 구성요소에 문서 작성 |
| **Self-Describing Naming** | 역할이 드러나는 이름 (`Misc` 금지) |
| **Examples in Docs** | 사용 예시 (input→output) 문서 포함 |

---

> **정리:** 이상 12개의 안티패턴과 대응책을 준수하면, Command–Skill–Agent 아키텍처를 장기적으로 건강하게 유지할 수 있습니다.

---

# G. 내 환경에서 확인해야 할 질문 목록

| 항목 | 질문 | 고려사항 |
|------|------|----------|
| **프레임워크 선택** | 어떤 에이전트 프레임워크를 사용하는가? | Claude Code vs 사내 포크/커스텀 |
| **툴 호출 방식** | 어떤 방식으로 툴을 호출할 것인가? | OpenAI Function Calling / Anthropic MCP / CLI wrapper |
| **지식 저장소 연계** | MD 문서를 Skill 컨텍스트로 어떻게 제공할 것인가? | 벡터DB 검색 vs grep 검색 |
| **다중 LLM** | OpenAI와 Claude를 병행 사용하는가? | 모델별 강점에 따라 역할 분담 가능 |
| **보안 정책** | Prod 접근 금지 등 룰을 어떻게 enforce할 것인가? | 네임스페이스 격리, 권한 토큰 |
| **성능/비용 목표** | "토큰 효율" 기준은 무엇인가? | 예: 응답당 10k 토큰 이하 |

⚠️ 이러한 사항은 설계 세부 설정을 좌우하므로, **관련 부서/팀과 협의**해 결정해야 합니다.

---

# H. 다음 액션 (1주일 계획)

| Day | 단계 | 상세 내용 |
|-----|------|-----------|
| **Day 1** | 환경 세부사항 확정 | 위 질문 목록에 대해 팀 논의. LLM API/플랫폼, 툴 통합 방식, 보안 요구 명문화 |
| **Day 2** | 워크플로우 분류 | 기존 수동 업무 목록 수집 → Command/Skill/Agent 후보로 분류 |
| **Day 3-4** | 스켈레톤 구현 | 대표 워크플로우 2~3개 선정. `.assistant` 폴더 구조 생성, Spec 템플릿 따라 파일 작성 |
| **Day 5** | 툴 통합 및 테스트 | 실제 툴(functions, APIs) 연결. End-to-end 테스트 및 오류 로그 수집 |
| **Day 6** | 리뷰 및 파일럿 | 팀 코드/프롬프트 리뷰 세션. 소수 개발자 파일럿 사용 및 피드백 수집 |
| **Day 7** | 문서화 및 교육 | README/내부 위키에 구조와 사용법 문서화. 피드백 반영 |
| **이후** | 정식 적용 계획 | 파일럿 결과 기반 추가 작업 정리. 다음 스프린트 배정 |

---

> **정리:** 이 1주 계획을 통해 **작은 성공 사례**를 먼저 만들고, 점진적으로 시스템을 확장해 나갈 수 있습니다.
