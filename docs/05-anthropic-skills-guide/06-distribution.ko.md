# 배포 및 공유

Skill은 MCP 연동을 더 완성도 있게 만들어 줍니다. 사용자들이 커넥터를 비교할 때, Skill을 갖춘 쪽이 더 빠른 가치 도달 경로를 제공하여 MCP만 제공하는 대안보다 경쟁 우위를 가질 수 있습니다.

## 현재 배포 모델 (2026년 1월)

**개인 사용자가 Skill을 얻는 방법:**

1. Skill 폴더 다운로드
2. 폴더 압축 (필요 시)
3. Claude.ai의 Settings > Capabilities > Skills에서 업로드
4. 또는 Claude Code의 Skills 디렉토리에 배치

**조직 수준의 Skill:**
- 관리자가 워크스페이스 전체에 Skill 배포 가능 (2025년 12월 18일 출시)
- 자동 업데이트
- 중앙 집중 관리

## 오픈 표준

우리는 Agent Skills를 오픈 표준으로 발표했습니다. MCP와 마찬가지로, Skill은 도구와 플랫폼 간에 이식 가능해야 한다고 믿습니다 — 동일한 Skill이 Claude를 사용하든 다른 AI 플랫폼을 사용하든 작동해야 합니다. 다만, 일부 Skill은 특정 플랫폼의 기능을 최대한 활용하도록 설계되어 있으며, 제작자는 이를 Skill의 `compatibility` 필드에 명시할 수 있습니다.

## API를 통한 Skill 사용

Skill을 활용하는 애플리케이션, 에이전트 또는 자동화된 워크플로우 구축 등 프로그래매틱 사용 사례의 경우, API가 Skill 관리 및 실행에 대한 직접적인 제어를 제공합니다.

**주요 기능:**
- Skill 목록 조회 및 관리를 위한 `/v1/skills` 엔드포인트
- Messages API 요청에 `container.skills` 파라미터로 Skill 추가
- Claude Console을 통한 버전 관리
- 커스텀 에이전트 구축을 위한 Claude Agent SDK와 연동

| Use Case | 최적의 플랫폼 |
|---|---|
| 사용자가 Skill과 직접 상호작용 | Claude.ai / Claude Code |
| 개발 중 수동 테스트 및 반복 개선 | Claude.ai / Claude Code |
| 개인 단위의 일회성 워크플로우 | Claude.ai / Claude Code |
| 프로그래매틱으로 Skill을 사용하는 애플리케이션 | API |
| 대규모 프로덕션 배포 | API |
| 자동화된 파이프라인 및 에이전트 시스템 | API |

참고: API에서의 Skill은 Code Execution Tool 베타를 필요로 하며, 이는 Skill이 실행되는 데 필요한 보안 환경을 제공합니다.

구현 세부사항은 다음을 참조하세요:
- Skills API Quickstart
- Create Custom Skills
- Skills in the Agent SDK

## 현재 권장 접근법

GitHub에 퍼블릭 저장소로 Skill을 호스팅하고, 명확한 README (사용자를 위한 것으로, README.md를 포함해서는 안 되는 Skill 폴더와는 별개), 스크린샷을 포함한 사용 예시를 준비하세요. 그런 다음 MCP 문서에 Skill로 연결되는 섹션을 추가하세요.

1. **GitHub에 호스팅**
   - 오픈소스 Skill을 위한 퍼블릭 저장소
   - 설치 방법이 포함된 명확한 README
   - 사용 예시 및 스크린샷

2. **MCP 저장소에 문서화**
   - MCP 문서에서 Skill로의 링크
   - 함께 사용할 때의 가치 설명
   - 빠른 시작 가이드 제공

3. **설치 가이드 작성**

```markdown
## Installing the [Your Service] Skill

1. Download the skill:
   - Clone repo: `git clone https://github.com/yourcompany/skills`
   - Or download ZIP from Releases

2. Install in Claude:
   - Open Claude.ai > Settings > Skills
   - Click "Upload skill"
   - Select the skill folder (zipped)

3. Enable the skill:
   - Toggle on the [Your Service] skill
   - Ensure your MCP server is connected

4. Test:
   - Ask Claude: "Set up a new project in [Your Service]"
```

## Skill 포지셔닝

Skill을 어떻게 설명하느냐에 따라 사용자가 그 가치를 이해하고 실제로 사용해 보는지가 결정됩니다.

**기능이 아닌 결과에 집중:**

✅ **좋음:**
> "ProjectHub skill을 사용하면 팀이 페이지, 데이터베이스, 템플릿을 포함한 완전한 프로젝트 워크스페이스를 수 초 만에 설정할 수 있습니다 — 수동 설정에 30분을 쓰는 대신."

❌ **나쁨:**
> "ProjectHub skill은 YAML frontmatter와 Markdown 지침을 포함하는 폴더로, MCP 서버 도구를 호출합니다."

**MCP + Skills 스토리 강조:**
> "우리의 MCP 서버는 Claude에게 Linear 프로젝트 접근 권한을 제공합니다. 우리의 Skill은 Claude에게 팀의 스프린트 기획 워크플로우를 가르칩니다. 함께하면 AI 기반 프로젝트 관리가 가능해집니다."
