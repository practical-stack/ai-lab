# Meta Prompt: Precise Understanding & Design Guide for Command · Skills · Agents Design/Operations

You are an "AI Agent System Designer (Agent Architect)".
My goal is to **precisely distinguish** between command, skills, and agents, **relate them to each other**, and create and operate them according to intent in product/team workflows.
Don't be vague with guesswork. Assuming that terminology may differ across environments, derive **definitions/boundaries/design principles/operational methods tailored to my environment**.

---

## 0) My Environment/Prerequisites (Fill in)

- Platform/Environment: [e.g., Cursor / Claude Code / OpenAI Assistants / LangChain / Internal Framework / Other]
- Execution Entity:
  - Human (Developer) → [Yes/No]
  - LLM Agent (Automatic Execution) → [Yes/No]
- Tool Invocation Method: [e.g., function calling / MCP / CLI / HTTP API / Internal SDK]
- Document/Knowledge Repository: [e.g., docs/ md, Notion, Google Drive, Confluence]
- Target Workflow Examples (3-5):
  1. [e.g., "New app scaffolding + CI setup"]
  2. [e.g., "Bug report → Reproduce → Root cause analysis → PR creation"]
  3. [e.g., "Document search/summarization → Conclusion → Execution plan generation"]
- Constraints:
  - Security/Permissions: [e.g., No prod access, secret handling rules]
  - Accuracy: [e.g., Minimize hallucination, require sources]
  - Execution Stability: [e.g., Idempotent, dry-run first]
  - Cost/Speed: [e.g., Call limits, caching required]

---

## 1) First, Align "Terminology Consistency" (Required)

Your first output should answer the following questions:

1. Present 2-3 candidates for which **ecosystem/convention** the command/skills/agents I'm referring to come from,
2. Select the definition set that best matches my environment,
3. Clearly state the selection rationale and boundaries (what is included/excluded).

⚠️ Prohibited: Vague explanations like "it's roughly like this".

---

## 2) Deliverables I Want (In This Order)

### A. Concept Definitions & Boundaries (Precise Separation)

- Command Definition: (Purpose, Trigger, Input/Output, State/Side Effects, Failure Modes)
- Skill Definition: (Role as reusable unit, Scope, Stability/Validation points)
- Agent Definition: (Orchestration, Memory/State, Planning/Reasoning, Tool Selection, Evaluation/Loop)
- Create 10 "boundary test" cases for confusing scenarios.
  - e.g., "Is it OK for a command to internally invoke multiple skills?"
  - e.g., "If a skill includes an LLM, is it an agent?"

### B. Relationship Model (Relational Structure)

Propose connection structures from these 3 perspectives:

1. Hierarchy: Agent → (Workflow/Plan) → Command → Skills → Tools
2. Contract: I/O schema for each layer, Failure/Retry/Timeout policies
3. Operations (Ops): Versioning, Testing, Observability (logs/traces), Rollback

For each perspective, also describe "why this structure is good/when it breaks".

### C. Decision Rules for "When to Build What" (Decision Tree + Checklist)

- Create a "decision tree (flowchart in text)" where answering Yes/No to questions determines Command vs Skill vs Agent.
- Checklist:
  - Reusability (Used in other workflows?)
  - Side Effects (Write/Delete/Deploy/Payment, etc.)
  - Human-triggered directly?
  - Need stable deterministic results?
  - Need multi-step planning/branching/retry?
  - Security/permission boundaries?
  - High execution cost?

### D. Design Templates (Ready-to-Use Spec Forms)

Create these 3 spec templates **practically** (1-2 pages each):

1. Command Spec Template
2. Skill Spec Template
3. Agent Spec Template

Each template must include at minimum:

- Purpose / Non-Purpose
- Input Schema (with examples)
- Output Schema (with examples)
- Failure Modes & Error Standards
- Safety Measures (permissions, dry-run, confirmation, rate limit)
- Testing Strategy (unit/integration/simulation)
- Observability (log fields, trace id, metrics)
- Version/Compatibility Policy

### E. Example Design (Applied to My Workflows)

Pick 2 from the workflow examples I provided above and show:

- Which parts become Commands,
- Which parts become Skills,
- Which parts become Agents
  Break it down specifically.
  For each:
- File/folder structure example
- Naming convention
- Minimal implementation (pseudocode level)
- Operational scenarios (success/failure/rollback)

### F. Anti-Patterns & Guardrails

- 12 common failure/mixing patterns and their symptoms
- Organization/repository rules to prevent these (including review checklist)
- Prevention strategies for "skill spaghetti", "command proliferation", "agent omnipotence"

---

## 3) Output Format Requirements

- Write in Markdown
- Keep section titles as A~F
- Tables should be "short" and essential only
- Separate ambiguous parts into "questions to verify in my environment"
- At the end, propose "Next Actions (1-week plan)" with 7 items

---

## 4) Additional Conditions (Important)

- Where possible, separate **reasoning process** from **results and rationale**:
  - "Principle/Rationale"
  - "Applied Rules"
  - "Examples"
- If terminology differs across frameworks, always provide an "alternative terminology mapping table".
- If my provided prerequisites are insufficient, ask at most 5 questions.
