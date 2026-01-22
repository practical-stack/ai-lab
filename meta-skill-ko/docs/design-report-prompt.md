# Meta-Skill & Meta-Agent 설계 보고서 작성 프롬프트

> 이 프롬프트를 사용하여 AI 에이전트에게 메타-스킬 또는 메타-에이전트를 설계하기 위한 종합 보고서를 작성하도록 요청하세요.

---

## 프롬프트

```
당신은 AI 에이전트 아키텍트입니다. 아래 레퍼런스 패턴들을 분석하여 "스킬을 만드는 스킬(Meta-Skill)" 또는 "에이전트를 만드는 에이전트(Meta-Agent)"를 설계하는 종합 보고서를 작성하세요.

## 보고서 목차

1. **Executive Summary**
   - 메타-스킬/에이전트의 정의와 목적
   - 핵심 가치 제안

2. **레퍼런스 분석**
   - 각 레퍼런스 레포지토리의 패턴 요약
   - 공통 패턴 및 차별화된 접근법

3. **Skill 아키텍처 설계**
   - SKILL.md 구조 표준
   - 디렉토리 레이아웃 컨벤션
   - Progressive Disclosure 패턴
   - 스크립트/레퍼런스/에셋 활용 가이드

4. **Agent 아키텍처 설계**
   - AgentConfig 인터페이스 표준
   - 모델 티어 라우팅 전략
   - 프롬프트 메타데이터 시스템
   - 도구(Tools) 권한 설계

5. **Meta-Skill 설계안**
   - 스킬 생성 워크플로우
   - 자동화 스크립트 (init, validate, package)
   - 품질 보증 체크리스트

6. **Meta-Agent 설계안**
   - 에이전트 생성 워크플로우
   - 동적 프롬프트 빌딩
   - 오케스트레이션 패턴

7. **환경 설정**
   - Claude Code/OpenCode 환경 설정

8. **구현 로드맵**
   - Phase 1: 기본 구조
   - Phase 2: 자동화 도구
   - Phase 3: 검증 및 테스트

9. **부록**
   - 코드 템플릿
   - 체크리스트
   - 안티패턴 목록

---

## 분석할 레퍼런스 패턴

### A. Skill 패턴 (63개 SKILL.md 분석 기반)

#### SKILL.md 표준 구조
```yaml
---
name: skill-name           # Required: kebab-case
description: |             # Required: 트리거 조건 + 목적
  When to use this skill and what it does.
  Include trigger phrases like "summon the council", "clarify requirements"
---
# Skill Title

[마크다운 지시사항 - 스킬 트리거 후에만 로드됨]

## Usage / Quick Start
## References (필요시)
## Guidelines
```

#### 디렉토리 레이아웃
```
skill-name/
├── SKILL.md              # Required: 프론트매터 + 지시사항
├── scripts/              # Optional: 실행 가능 코드 (bash/python)
│   └── init_skill.py     # 스킬 초기화 스크립트
├── references/           # Optional: 온디맨드 로드 문서
│   └── patterns.md       # 상세 패턴 가이드
└── assets/               # Optional: 템플릿, 이미지, 폰트
    └── template/         # 보일러플레이트
```

#### Progressive Disclosure 원칙
1. **메타데이터** (name + description) - 항상 컨텍스트에 로드 (~100 단어)
2. **SKILL.md 본문** - 스킬 트리거 시 로드 (<5k 단어)
3. **번들 리소스** - Claude가 필요할 때 온디맨드 로드 (무제한)

#### 핵심 원칙 (skill-creator 기반)
- **간결함이 핵심**: 컨텍스트 윈도우는 공공재. Claude가 이미 아는 것은 추가하지 말 것
- **적절한 자유도 설정**: 태스크의 취약성과 가변성에 따라 구체성 수준 조절
  - High freedom: 텍스트 지시사항 (여러 접근법 유효)
  - Medium freedom: 의사코드/파라미터 스크립트 (선호 패턴 존재)
  - Low freedom: 구체적 스크립트 (취약한 작업, 일관성 필수)

---

### B. Agent 패턴 (34개 에이전트 파일 분석 기반)

#### AgentConfig 인터페이스 (TypeScript)
```typescript
interface AgentConfig {
  name: string;           // e.g., "architect", "explore"
  description: string;    // 선택 가이드 (언제 사용하는지)
  prompt: string;         // 시스템 프롬프트 (또는 .md 파일 로드)
  tools: string[];        // 허용 도구: ['Read', 'Glob', 'Edit', ...]
  model?: ModelType;      // 'opus' | 'sonnet' | 'haiku' | 'inherit'
  metadata?: AgentPromptMetadata;  // 동적 프롬프트 생성용
}

interface AgentPromptMetadata {
  category: AgentCategory;     // exploration | specialist | advisor | utility | orchestration
  cost: AgentCost;             // FREE | CHEAP | EXPENSIVE
  triggers: DelegationTrigger[];  // 위임 조건
  useWhen?: string[];          // 사용 시점
  avoidWhen?: string[];        // 피해야 할 시점
  promptAlias?: string;        // 프롬프트에서 사용할 별칭
}
```

#### 모델 티어 라우팅
| Tier | Model | 사용 케이스 |
|------|-------|------------|
| HIGH | opus | 복잡한 분석, 아키텍처, 디버깅, 전략적 계획 |
| MEDIUM | sonnet | 표준 태스크, 중간 복잡도 |
| LOW | haiku | 단순 조회, 빠른 작업, 탐색 |

#### 에이전트 카테고리
| 카테고리 | 예시 | 목적 |
|----------|------|------|
| **orchestration** | sisyphus, atlas, orchestrator | 작업 조정, 위임 |
| **specialist** | architect, designer, writer | 도메인 전문성 |
| **exploration** | explore, librarian, researcher | 검색 및 리서치 |
| **advisor** | oracle, critic, analyst | 전략적 자문 (읽기 전용) |
| **utility** | executor, vision | 범용 헬퍼 |

#### 에이전트 정의 예시 (oh-my-claudecode)
```typescript
export const architectAgent: AgentConfig = {
  name: 'architect',
  description: 'Architecture & Debugging Advisor. Use for complex problems, root cause analysis.',
  prompt: loadAgentPrompt('architect'),  // /agents/architect.md 에서 로드
  tools: ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch'],
  model: 'opus'
};

// 티어 변형
export const architectMediumAgent: AgentConfig = {
  name: 'architect-medium',
  description: 'Standard Analysis (Sonnet). Use for moderate analysis.',
  prompt: loadAgentPrompt('architect-medium'),
  tools: ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch'],
  model: 'sonnet'
};
```

---

### C. Meta-Skill 레퍼런스 (skill-creator 분석)

#### 스킬 생성 6단계 프로세스
1. **이해**: 구체적 예시로 스킬 파악
2. **계획**: 재사용 가능한 콘텐츠 식별 (scripts, references, assets)
3. **초기화**: `init_skill.py` 실행
4. **편집**: 리소스 구현 및 SKILL.md 작성
5. **패키징**: `package_skill.py`로 .skill 파일 생성
6. **반복**: 실사용 기반 개선

#### 자동화 스크립트
```bash
# 스킬 초기화
scripts/init_skill.py <skill-name> --path <output-directory>

# 스킬 패키징 (검증 포함)
scripts/package_skill.py <path/to/skill-folder> [output-dir]
```

---

### D. Orchestrator 패턴 (oh-my-opencode, oh-my-claudecode)

#### 오케스트레이터 핵심 동작
1. **Intent Gate**: 모든 메시지에서 의도 분류
2. **Codebase Assessment**: 코드베이스 성숙도 평가
3. **Exploration & Research**: 병렬 에이전트 실행
4. **Implementation**: TODO 기반 실행
5. **Failure Recovery**: 실패 시 복구 전략
6. **Completion**: 검증 후 완료

#### 위임 프롬프트 구조 (7섹션 필수)
```
1. TASK: 원자적, 구체적 목표
2. EXPECTED OUTCOME: 성공 기준이 있는 구체적 산출물
3. REQUIRED SKILLS: 호출할 스킬
4. REQUIRED TOOLS: 명시적 도구 화이트리스트
5. MUST DO: 철저한 요구사항 (암묵적인 것 없이)
6. MUST NOT DO: 금지 행동
7. CONTEXT: 파일 경로, 기존 패턴, 제약사항
```

---

### E. 플러그인/확장 패턴 (plugins-for-claude-natives)

#### Agent Council 패턴 (다중 AI 합의)
- 여러 AI 모델에서 의견 수집
- Chairman이 합성하여 최종 결론 도출
- 병렬 실행으로 응답 시간 최적화

#### 플러그인 구조
```
plugin-name/
├── skills/
│   └── skill-name/
│       ├── SKILL.md
│       └── scripts/
├── references/
├── AGENTS.md
└── README.md
```

---

### F. 지원 환경

| 환경 | 멀티 모델 | 서브에이전트 | MCP | LSP | Hooks |
|------|----------|-------------|-----|-----|-------|
| **Claude Code** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **OpenCode** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 보고서 작성 지침

### 형식 요구사항
- **언어**: 한국어 (기술 용어는 영어 병기)
- **길이**: 3000-5000 단어
- **구조**: 마크다운, 표와 코드 블록 적극 활용
- **톤**: 기술적이지만 실용적, 즉시 적용 가능한 인사이트

### 반드시 포함할 내용
1. 레퍼런스별 강점/약점 비교표
2. 권장 SKILL.md 템플릿
3. 권장 AgentConfig 템플릿
4. Meta-Skill 워크플로우 다이어그램
5. Meta-Agent 워크플로우 다이어그램
6. 구현 우선순위 매트릭스
7. 안티패턴 체크리스트
8. **플랫폼별 호환성 매트릭스** (Claude Code, OpenCode, Cursor)
9. **Cursor 환경 대응 가이드** (.cursorrules 템플릿 포함)
10. **Graceful Degradation 전략** (Full → Reduced 워크플로우)

### 고려해야 할 질문들
- 기존 skill-creator를 어떻게 확장/개선할 수 있는가?
- 에이전트 생성 자동화의 최적 범위는?
- 품질 보증을 어떻게 시스템화할 수 있는가?
- Progressive Disclosure를 Meta-Skill에 어떻게 적용할 것인가?
- **Cursor 환경에서 멀티 에이전트 패턴을 어떻게 시뮬레이션할 것인가?**
- **Cursor(MCP/LSP 지원, 서브에이전트 없음)에서 최적의 워크플로우는?**
- **Claude Code/OpenCode와 Cursor 간 어댑터 유지보수 비용을 최소화하는 설계는?**

---

## 레퍼런스 위치

| 리소스 | 경로 |
|--------|------|
| skill-creator | `skills/skills/skill-creator/SKILL.md` |
| skill 템플릿 | `skills/template/SKILL.md` |
| oh-my-claudecode 에이전트 | `oh-my-claudecode/src/agents/` |
| oh-my-opencode 에이전트 | `oh-my-opencode/src/agents/` |
| orchestrate 스킬 | `oh-my-claudecode/skills/orchestrate/SKILL.md` |
| agent-council 플러그인 | `plugins-for-claude-natives/plugins/agent-council/` |
| 전체 SKILL.md 목록 | 63개 파일 (각 서브 디렉토리)

---

보고서 작성을 시작하세요. 위 패턴들을 종합 분석하여 실제로 구현 가능한 Meta-Skill과 Meta-Agent 설계안을 제시해주세요.
```

---

## 사용법

1. 이 프롬프트를 Claude, GPT, 또는 다른 AI 에이전트에게 전달
2. 레퍼런스 파일들에 대한 접근 권한 제공 (또는 위 패턴 요약 사용)
3. 생성된 보고서를 기반으로 Meta-Skill/Meta-Agent 구현

## 예상 산출물

- 종합 분석 보고서 (3000-5000 단어)
- SKILL.md 템플릿
- AgentConfig 템플릿  
- 워크플로우 다이어그램
- 구현 로드맵
- 안티패턴 체크리스트
- **플랫폼별 호환성 매트릭스** (Claude Code, OpenCode, Cursor)
- **.cursorrules 템플릿** (Cursor 전용 환경 대응)
- **Cursor 워크플로우 가이드** (순차적 역할 전환 패턴)
