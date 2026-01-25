---
title: "Anti-patterns & Guardrails"
description: "12 common failure patterns in Command/Skill/Agent design with symptoms, guardrails, and prevention measures for robust architecture."
type: explanation
tags: [Architecture, AI]
order: 6
related: ["./06-anti-patterns.ko.md"]
---

# F. Anti-patterns & Guardrails

We organize 12 failure/misuse patterns that frequently appear in Command/Skill/Agent design/operations and their prevention measures. Each item provides symptoms of the anti-pattern and **organizational rule responses (guardrails)**.

---

## 1. Skill Spaghetti

**Symptoms:**
- Numerous Skills proliferate with unclear boundaries
- Skills with overlapping functions exist (e.g., DBQuery vs Database)
- Too much responsibility in one Skill → becomes huge
- Agent loads wrong Skills
- Same content duplicated across multiple Skills → maintenance nightmare

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Domain-based Classification** | Define clear domain/responsibility areas. Review whether overlaps with existing ones before adding new Skill |
| **Skill Registry Table** | Maintain catalog documenting all Skills' names, purposes, triggers |
| **Periodic Refactoring** | Quarterly skill list review. Consolidate/delete infrequently used or duplicate ones |
| **Max Size Rule** | Consider separation if Skill file exceeds 500 lines |
| **Clear Triggers** | Specify USE WHEN/WHEN NOT conditions. Request modification if ambiguous |
| **Linting** | Operate script detecting trigger keyword conflicts |

---

## 2. Command Overuse

**Symptoms:**
- Creating Commands for trivial features → dozens of slash commands
- Users need to remember too many commands → confusion
- Many commands with similar patterns (e.g., `/create-class`, `/create-interface`, `/create-enum`)
- User commanding even things agent could handle itself → reduced automation benefits

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Feature Consolidation** | Combine similar features into one and distinguish with parameters (`/create code --type=class\|interface\|enum`) |
| **Stable Command Set** | Maintain command count under 10. Addition requires code review approval |
| **Naming Convention** | Use intuitive, general verbs (`/create`, `/update`, `/delete`), detailed actions as arguments |
| **Auto-suggestion** | Handle automatically executable ones as Skills (e.g., auto-use optimize skill when performance issues detected) |
| **Review Checklist** | Self-ask 3 questions: "Frequently used?", "Can it be combined?", "Can Agent handle it automatically?" |
| **Deprecation** | Mark unused commands as Deprecated then remove, hide from autocomplete |

---

## 3. Agent Omnipotence Mania

**Symptoms:**
- Giving Agent excessive omnipotent roles (treating as absolute AI)
- Putting all detailed knowledge into Agent prompt
- Expecting Agent to do everything without Skills
- One Agent covers all work (coding, docs, deployment, design)
- Agent prompt becomes thousands of lines → context overflow, increased strange behavior, security risks

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Single Responsibility** | Only clearly limited role per Agent (separate coding Agent, deployment Agent) |
| **Skills & Subagents Usage** | Skill-ify knowledge, separate procedures as Subagents. Keep main prompt within 300~400 lines |
| **Permission Scoping** | Grant only minimum permissions per Agent. Separate permissions if tools/API keys are excessive |
| **Eval & Audit** | Periodic behavior evaluation. Judge as excessive complexity on abnormal signs |
| **Team Training** | Educate concept "Agent is not omnipotent, collaborates with Skills/Commands" |

---

## 4. Unbounded Tool Usage

**Symptoms:**
- Agent uses tools without restrictions
- Overlooking external side effects when designing Commands/Skills
- Scripts in Skills overuse disk
- "delete all data" tool used without filter → system safety/security issues
- No fallback logic for tool failures → agent stops/produces wrong output

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Tool Whitelist/Scopes** | Define whitelist and scope for each Agent (file writing only in `/project` folder) |
| **Dangerous Tool Confirmation** | Secondary confirmation procedure for dangerous tools (deleteDB) (wait for approval) |
| **Resource Limits** | Time/memory limits (stop external API after 5 seconds) |
| **Error Handling Defaults** | Unified return format on failure (`"error": "message"`) |
| **Observability** | Log tool calls `TOOL=<name> ARGS=<..>` |
| **SecOps Review** | Security team risk assessment on new tool introduction (prompt leak, transactionality, etc.) |

---

## 5. Hallucinations / Lack of Source Attribution

**Symptoms:**
- Agent/Skill confidently generates incorrect information (hallucination)
- No source indication when summarizing documents → trust issues
- Adding inferences different from facts in bug cause explanations
- Unknown source basis → reduced accuracy, verification difficulty

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Ask when unsure** | "Ask rather than guess when uncertain" rule (system prompt/Skill) |
| **Citations Protocol** | Require citing document path/title when answering from knowledge base |
| **Verification Step** | Verify actual values with Tool before producing important results, use Self-critique subagent |
| **Human Review** | Human confirmation before important decisions (code deletion, cost billing) |
| **Testing for Truthfulness** | Regular testing of Knowledge-based Skills (against ground truth) |
| **User Education** | Guide "Trust agent answers but verify", recommend source confirmation |

---

## 6. Not Invented Here for Skills

**Symptoms:**
- Re-describing already abstracted Skills/Commands in Agent prompts without knowing
- Creating new commands with duplicate implementation (e.g., "test execution" Skill exists but writing again)
- Knowledge spreads everywhere → consistency loss, omissions when modifying

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Discoverability** | Use Skill/Command catalog. Search first when creating new Agent |
| **Code Review Check** | Reviewer confirms "Can't we use existing Skill?" |
| **Convention** | When writing procedures in Agent prompts, recommend "express as Skill/Command calls" |
| **Internal Marketplace** | Operate shared library of useful Skills/Agents |
| **Dead Skill Metrics** | Monitor unused Skills. Promote or remove if 0 calls |

---

## 7. Context Overflow/Pollution

**Symptoms:**
- Agent loads too many Skills at once
- Conversation history becomes massive without summarization → context window saturation
- Including all detailed rules in System prompt → becomes long
- LLM performance degradation, cost increase, context overflow errors

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Lazy Loading** | Delay Skill loading until needed (description only first) |
| **Context Trimming** | Auto-summarize when exceeding certain tokens (compact at 75%+) |
| **Subagent Delegation** | Delegate large info processing to Subagents to maintain main context |
| **Skill Count Limit** | Load max N Skills (e.g., 3) per request |
| **Cost Monitoring** | Monitor token usage, alert when threshold exceeded |
| **Conciseness Principle** | System prompt core only, details separated as Skills |

---

## 8. Ignoring Failure Paths

**Symptoms:**
- Designing only for "happy path" (normal scenarios)
- No mention when Skill fails
- Agent retries infinitely on tool failure → stops
- No rollback plan → data inconsistency
- Wrong answers or silent stops on exceptions

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Failure Mode Enumeration** | Specify failure scenarios per component at design time. Habituate "What if X fails?" |
| **Default Error Responses** | "I'm sorry, I couldn't…" standard error response requesting debugging cooperation |
| **Time-out & Stop Criteria** | Set max count/time (3 retries, 5min) then graceful failure |
| **Transaction Guard** | Dry-run verification before committing external changes. Don't proceed on failure |
| **Error Logging & Alert** | Record detailed error logs and team alerts, DevOps monitoring |
| **User Guidance** | Include next step suggestions in failure responses ("Check logs", "Request from human") |

---

## 9. Lack of Testing & Evaluation

**Symptoms:**
- Deploying Skills/Agents roughly thinking "it's just prompts"
- Wrong results in edge cases (trigger mismatch on Korean input, etc.)
- Agent mishandles important parts
- Previous scenarios break on version updates

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Mandatory Test Cases** | Must attach key scenario test cases to PR |
| **Automated CI Testing** | Simple verification like function call simulation, checking keyword inclusion |
| **Evaluation harness** | Score with LLM eval frameworks (langsmith, Anthropic eval) |
| **Manual UAT** | Manual testing in staging. Required for high-risk agents |
| **Gradual Rollout** | Phased release: internal subset users → company-wide expansion |
| **Feedback Loop** | Collect feedback via "Was this response helpful?" button, etc. |

---

## 10. Poor Observability

**Symptoms:**
- No way to monitor agents
- Insufficient logs on error occurrence → hard to reproduce
- Lack of performance/usage data → lost optimization opportunities
- Can't identify which step is slow

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Structured Logging** | Standardized log format (JSON/key=value). `[Agent=BugFix step="RunTests" result="fail" time=3.2s]` |
| **Central Log Store** | Unified log collection (ELK stack, etc.) for searchability |
| **Trace IDs** | Required trace IDs, distinguish with thread ID for parallel subagents |
| **Metric Dashboard** | KPI dashboard with success rate, error rate, avg latency, etc. Review at least weekly |
| **Alerting** | PagerDuty alert when error rate exceeds 5%, response time exceeds 30s |
| **Playback Tool** | Agent session replay functionality (for failure analysis) |
| **Privacy in Logs** | Sensitive info masking, PII filter applied |
| **Regular Log Review** | Regular log sampling for anomaly detection |

---

## 11. Versioning Chaos

**Symptoms:**
- Different versions per user when Skill/Command changes → result inconsistency
- Modifications without compatibility consideration → Agent/Skill version mismatch errors
- Version mixing during rollout → consistency broken

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Semantic Versioning** | Increment Major for big changes, specify version requirements in Agent meta (`requires logging skill >=2.0`) |
| **Update Process** | Central management deployment. Notify deployment schedule, provide sync script |
| **Backward Stubs** | Maintain wrapper for old version calls for operation period. Output Deprecate warnings |
| **Single Source of Truth** | Manage definitions only in central repo. Prevent fork divergence |
| **Changelog** | Must update CHANGELOG.md when changing Skill/Agent |
| **Compatibility Matrix Test** | Test whether new Skill version is compatible with existing Agents |
| **Feature Flags** | New/old version branching logic for gradual deployment (reduces risk) |

---

## 12. Poor Documentation/Naming

**Symptoms:**
- Insufficient description in Skill/Command/Agent files
- Ambiguous names make intent hard to understand (e.g., `MiscSkill` with multiple functions mixed)
- No Agent spec → don't know usage → reinvention

**Guardrails:**

| Rule | Description |
|------|-------------|
| **Template-Driven Docs** | Write documentation for all components according to Spec Template |
| **Self-Describing Naming** | Names that reveal role. Prohibit `Misc`, `TestAgent` → `BuildAgent`, `DeployAgent` |
| **Code Review Enforcement** | Review check: "Is name intuitive?", "Is spec filled out?" |
| **Onboarding Guide** | Organize Command/Skill/Agent relationship diagram and explanations in wiki |
| **Examples in Docs** | Include usage examples (input→output) in documentation |
| **Naming Convention** | Define project-wide naming rules (skill: noun/verb, agent: role+Agent) |

---

> **Summary:** Following these 12 anti-patterns and countermeasures allows long-term healthy and scalable maintenance of Command–Skill–Agent architecture.

**Effective Operational Process:**
```
Design Principles → Rules → Tool Application
```

Especially many issues can be automatically detected/prevented at **code review** and **CI stages**.

---

# G. Questions to Verify in My Environment

> Ambiguous or prerequisite-required items

| Item | Question | Considerations |
|------|----------|----------------|
| **Framework Selection** | Which agent framework are you using? | Claude Code itself vs internal fork/custom. Terminology and directory structure must be adapted to environment |
| **Tool Calling Method** | How will you call tools? | Choose between OpenAI Function Calling / Anthropic MCP / Direct CLI wrapper calls |
| **Knowledge Storage Integration** | How will you provide MD documents as Skill context? | Decide between vector DB search vs grep search |
| **Multiple LLMs** | Are you using OpenAI and Claude together? | Role division possible based on model strengths (e.g., Claude for code writing, GPT-4 for explanations) |
| **Security Policy** | How will you enforce rules like no Prod access? | Verify technical means like namespace isolation, permission tokens |
| **Performance/Cost Goals** | What's the "token efficiency" criterion? | e.g., Under 10k tokens per response. Skill loading method tuning needed |

⚠️ These matters affect design details, so they must be **decided in consultation with relevant departments/teams**.

---

# H. Next Actions (1-Week Plan)

| Day | Step | Detailed Content |
|-----|------|------------------|
| **Day 1** | Finalize Environment Details | Team discussion on above question list. Document LLM API/platform, tool integration method, security requirements. Adjust design details |
| **Day 2** | Workflow Classification | Collect existing manual task list → Classify as Command/Skill/Agent candidates. Classify 5 frequently done tasks following decision tree |
| **Day 3-4** | Skeleton Implementation | Select 2~3 representative workflows. Create `.assistant` folder structure, write files following Spec template (pseudo level). Verify operation with external tools as mocks |
| **Day 5** | Tool Integration and Testing | Connect actual tools (functions, APIs). Implement FileWrite, GitHub API, etc. End-to-end testing and error log collection |
| **Day 6** | Review and Pilot | Team code/prompt review session. Anti-pattern checklist verification. Small developer pilot usage and feedback collection |
| **Day 7** | Documentation and Training | Document structure and usage in README/internal wiki. Share Command list, Skill/Agent design intentions. Reflect feedback |
| **Afterwards** | Formal Application Plan | Organize additional work based on pilot results (Skill additions, performance tuning). Assign to next sprint. Establish security team review schedule |

---

> **Summary:** Through this 1-week plan, you can **create small success cases first**, then gradually expand the system.
