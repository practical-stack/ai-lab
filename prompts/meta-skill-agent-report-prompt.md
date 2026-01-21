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

7. **환경 제약사항 대응 전략**
   - Claude Code/OpenCode: Full Feature 활용
   - Cursor 전용 환경 대응 (멀티 모델/서브에이전트 없음, MCP/LSP 지원)

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

### F. 환경 제약사항 패턴 (CRITICAL)

> **중요**: 레퍼런스 패턴들은 Claude Code, OpenCode 등 멀티 모델 오케스트레이션이 가능한 환경을 가정합니다.
> 그러나 실제 사용 환경은 제한적일 수 있으므로, 다양한 환경에 대응 가능한 설계가 필수입니다.

#### 환경 유형별 제약사항

| 환경 | 멀티 모델 | 서브에이전트 | MCP | LSP | Hooks |
|------|----------|-------------|-----|-----|-------|
| **Claude Code** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **OpenCode** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Cursor** | ❌ | ❌ | ✅ | ✅ | ❌ |

#### Cursor 환경 대응 패턴 (멀티 모델/서브에이전트 없음)

Cursor에서는 멀티 모델 라우팅과 서브에이전트 위임이 불가능하므로 다음 대안 사용:

```yaml
# Claude Code/OpenCode (Full Feature)
agent_routing:
  complex_task: opus      # 서브에이전트 위임
  standard_task: sonnet   # 서브에이전트 위임
  simple_lookup: haiku    # 서브에이전트 위임

# Cursor (MCP/LSP 지원, 서브에이전트 없음)
cursor_fallback:
  strategy: "sequential_role_switching_with_tools"
  approaches:
    - name: "순차적 역할 전환"
      description: |
        한 세션 내에서 역할 전환으로 다중 관점 시뮬레이션
        1. "저는 지금 아키텍트 역할입니다..." → 설계
        2. "저는 지금 코드 리뷰어 역할입니다..." → 검토
        3. "저는 지금 QA 엔지니어 역할입니다..." → 테스트 계획
    - name: "자체 검증 루프"
      description: |
        서브에이전트 대신 동일 모델에게 검증 요청
        "이전 응답을 비판적으로 검토하고 개선점을 제시하세요"
    - name: "MCP/LSP 도구 적극 활용"
      description: |
        서브에이전트 없이도 MCP/LSP 도구로 품질 보완
        - LSP: 리팩토링, 진단, 심볼 검색
        - MCP: 외부 검색, 문서 조회
```

#### Cursor 전용 환경 대응 패턴

Cursor는 자체 AI 통합 환경으로, MCP와 LSP는 지원하나 다음 제약사항 존재:

| 제약사항 | 영향 | 대응 방안 |
|----------|------|----------|
| 서브에이전트 위임 불가 | 병렬 처리 불가 | 순차적 태스크 분해, `.cursorrules` 활용 |
| 멀티 모델 라우팅 불가 | 복잡도별 최적화 불가 | 단일 모델 내 프롬프트 복잡도 조절 |
| Hooks 시스템 없음 | 자동화 트리거 불가 | `.cursorrules`로 행동 가이드, 수동 트리거 |
| 모델 선택 제한 | 티어별 라우팅 불가 | 범용적 프롬프트 설계, 자체 검증 루프 |

**지원되는 기능 (활용 가능)**:
- ✅ MCP: 외부 도구 연동 가능
- ✅ LSP: 리팩토링, 진단, 심볼 검색 등 활용 가능

```yaml
# Cursor 대응 스킬 구조
cursor_compatible_skill:
  # .cursorrules 파일로 행동 가이드
  rules_file: ".cursorrules"
  
  # SKILL.md 대신 직접 프롬프트 포함
  inline_instructions: true
  
  # MCP/LSP 활용 (지원됨!)
  mcp_tools: true           # 외부 도구 연동 가능
  lsp_tools: true           # 리팩토링, 진단 등 활용 가능
  
  # 스크립트는 bash/python으로 외부 실행
  scripts_execution: "manual_or_terminal"
  
  # 멀티 에이전트 → 단일 에이전트 순차 실행 (MCP/LSP로 보완)
  workflow: "tool_assisted_sequential"
```

#### .cursorrules 예시 (Cursor 대응)

```markdown
# Project Rules for Cursor

## Role Definition
You are a senior software engineer with multi-agent simulation capability.
Follow these patterns strictly. Use MCP tools and LSP for maximum effectiveness.

## Skill: Meta-Skill Creator (Cursor Adapted)

### When to Activate
- User mentions "create a skill", "new skill", "skill template"
- User mentions "새 스킬", "스킬 만들어", "스킬 생성"

### Available Tools (USE ACTIVELY)
- **MCP Tools**: 외부 검색, 문서 조회, API 호출 등 활용
- **LSP Tools**: 코드 리팩토링, 심볼 검색, 진단 등 활용
- **Terminal**: 스크립트 실행, 파일 생성 등

### Workflow (Sequential Role Switching)
멀티 에이전트 환경이 아니므로 순차적으로 역할을 전환하며 진행:

**Phase 1 - Analyst Role**
"저는 지금 요구사항 분석가 역할입니다."
- 구체적 예시 수집을 위한 질문
- 트리거 조건 명확화
- 사용 시나리오 파악

**Phase 2 - Architect Role**  
"저는 지금 아키텍트 역할입니다."
- 스킬 구조 설계
- 필요한 scripts/references/assets 식별
- Progressive Disclosure 적용 계획

**Phase 3 - Implementer Role**
"저는 지금 구현자 역할입니다."
- SKILL.md 작성
- 스크립트 구현 (LSP 활용하여 안전한 코드 작성)
- 레퍼런스 문서 작성

**Phase 4 - Reviewer Role**
"저는 지금 리뷰어 역할입니다. 이전 단계 결과물을 비판적으로 검토합니다."
- SKILL.md 프론트매터 검증
- description의 트리거 조건 완전성 확인
- 누락된 요구사항 체크
- 안티패턴 검사

### Self-Verification Loop
각 Phase 완료 후:
1. "이 단계의 산출물이 완전한가?" 자문
2. 불완전하면 해당 Phase 재실행
3. 완전하면 다음 Phase로 진행

### Output Format
[Same structure as SKILL.md but inline in conversation]

### Anti-Patterns to Avoid
- 역할 전환 없이 한 번에 모든 것 처리하지 말 것
- 자체 검증 단계 생략하지 말 것
- MCP/LSP 도구 활용 가능한데 수동으로 처리하지 말 것
```

#### 범용 호환 설계 원칙

Meta-Skill/Meta-Agent 설계 시 다음 원칙 준수:

1. **핵심 로직 분리**
   - 플랫폼 의존적 기능과 핵심 워크플로우 분리
   - 핵심 워크플로우는 순수 프롬프트로 표현 가능해야 함

2. **Graceful Degradation**
   ```
   Full Feature (Claude Code/OpenCode)
   - 멀티 모델, 서브에이전트, MCP, LSP, Hooks 모두 지원
   - 병렬 에이전트 실행, 자동 트리거
     ↓ 서브에이전트/멀티모델 없음
   Reduced Feature (Cursor - MCP, LSP 지원)
   - 순차적 역할 전환, MCP/LSP 도구 활용
   - .cursorrules로 행동 가이드
   ```

3. **설정 기반 적응**
   ```typescript
   interface EnvironmentConfig {
     multiModel: boolean;        // 멀티 모델 지원 여부
     subagentSupport: boolean;   // 서브에이전트 위임 가능 여부
     mcpSupport: boolean;        // MCP 지원 여부
     lspSupport: boolean;        // LSP 지원 여부
     hooksSupport: boolean;      // Hooks 시스템 지원 여부
     platform: 'claude-code' | 'opencode' | 'cursor';
   }
   
   // 플랫폼별 기본 설정 예시
   const PLATFORM_CONFIGS: Record<string, EnvironmentConfig> = {
     'claude-code': { multiModel: true, subagentSupport: true, mcpSupport: true, lspSupport: true, hooksSupport: true, platform: 'claude-code' },
     'opencode':    { multiModel: true, subagentSupport: true, mcpSupport: true, lspSupport: true, hooksSupport: true, platform: 'opencode' },
     'cursor':      { multiModel: false, subagentSupport: false, mcpSupport: true, lspSupport: true, hooksSupport: false, platform: 'cursor' },
   };
   
   // 환경에 따른 워크플로우 자동 선택
   function selectWorkflow(env: EnvironmentConfig): WorkflowType {
     if (env.subagentSupport) return 'parallel_delegation';
     if (env.mcpSupport && env.lspSupport) return 'tool_assisted_sequential';  // Cursor/Windsurf
     if (env.hooksSupport) return 'hook_triggered_sequential';
     return 'manual_sequential';
   }
   ```

4. **플랫폼별 어댑터 제공**
   ```
   meta-skill/
   ├── SKILL.md                    # 표준 Claude Code/OpenCode용
   ├── adapters/
   │   └── cursor/
   │       └── .cursorrules        # Cursor 전용 규칙
   ├── scripts/                    # 공통 스크립트 (플랫폼 무관)
   └── references/                 # 공통 레퍼런스
   ```

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
