---
title: "Relationship Model"
description: "Hierarchical composition model, contract definitions for I/O and exceptions, and operational patterns for versioning, testing, and rollback."
type: explanation
tags: [Architecture, AI]
order: 2
related: "./02-relationships.ko.md"
---

# B. Relationship Model (Association Structure)

## 1. Hierarchy

System composition takes a hierarchical form where higher layers orchestrate lower ones.

```
Agent (Top Level)
  └── Workflow/Plan
        └── Command / Skill
              └── Tool (API, CLI, Function)
```

### Agent Layer

- Receives user intent and sets goals
- Performs reasoning and planning with unique context/role
- Creates multiple Sub-agents in parallel when needed to parallelize work
- Decides which Skills and Commands to use
- Manages tool access

### Command/Workflow Layer

- Executes specific procedures that Agent must perform
- In Claude Code, "Workflow" has similar meaning to Commands
- Mini-script describing the order of Skill and Tool calls
- Without Command, Agent directly calls Skills/Tools according to its own Plan

### Skill Layer

- Agent loads corresponding Skill when specific domain work is needed
- Can load multiple Skills together at once (e.g., tanstack + panda-css)
- Provides additional knowledge, checklists, templates, etc. to Agent
- Agent calls Tools according to workflow presented by Skill

### Tool Layer

- Executes actual programming functions, external APIs, CLI commands, DB queries, etc.
- Example: file search tool, gh CLI execution
- Execution results (JSON, command output, etc.) are returned to Agent

---

**Advantages of Layer Separation: Separation of Concerns**

| Layer | Role |
|-------|------|
| Agent | "What to do" (plan/decision-making) |
| Skill | "How to do it" (providing validated procedures) |
| Tool | Actual execution |

**Example:** Agent decides "Let's refactor this code" → Skill provides tanstack usage → Tool executes file writing

**When Structure Breaks:**
- Hardcoding detailed procedures in Agent → Loses Skill layer benefits
- Skill indiscriminately executes tools directly → Side effects occur without Agent control

---

## 2. Contract – I/O and Exception Policies Between Layers

Each layer must have clear interfaces (input/output) and failure handling conventions.

### Agent Contract

Agent receives **goal/request (Input)** from user and returns **solution (Output)**.

**Input Format:**
- Free natural language
- Structured specification (JSON) given by parent system

**Output Format:**
- Answer to show user
- Generated code
- Reports, etc.

**Failure Handling:**

| Situation | Handling Method |
|-----------|-----------------|
| Timeout | Notify as `ERROR_TIMEOUT` if not completed within specified time/steps |
| Tool Error | Self-retry up to certain count (e.g., 3 times), ask user for additional info if impossible |
| Missing Required Field | Return error immediately (e.g., `{"error": "missing field X"}`) |

**Skill/Tool Interaction Contract:**
- When loading Skill, only read description field first and add minimum to context
- Lazy-load actual body when needed (token optimization)
- Tool calls put JSON arguments according to function signature, parse return value JSON
- If Tool throws exception/error, handle with standard field like `failure_reason`

> **Summary:** Agent contract = "Given this input, internally use Skills/Tools to return this form of output. Provide standard error response in failure situations. Stop and report if unable to complete within appropriate count and time."

---

### Command Contract

Command is a parameterized prompt template with defined arguments and result formats.

**Input Contract:**
- Example: `/deploy <env>` command only allows `dev`/`prod` for `<env>` argument
- On wrong value input: outputs `ERROR: invalid environment`
- Consumes input through positional parameters like `${1}`, `${2}`
- Agent inserts user-provided arguments into positions to complete prompt

**Output Contract:**
- Command itself is a procedure, not a final response
- When completed, Agent summarizes work results or provides output
- Example: After `/code-review` execution, "Code review completed" + list of found issues

**Failure Handling:**
- On internal tool failure: Report in format `<toolname> FAILED: <reason>`
- Idempotent design: System integrity maintained even if executed twice with same parameters
- Support dry-run mode (e.g., `/deploy --dry-run`)
- Specify timeout policy (e.g., `ERROR: Deployment timed out` if deployment not completed within 5 minutes)

> **Key:** Command should be treated as a small program with Input → Prompt/Skill → Tool → Output flow, specifying Input/Output/Failure conditions

---

### Skill Contract

Skill is a modular function provided to Agent, so **trigger** and **content** contracts are key.

**Trigger Contract:**
- Define `name`, `description`, `USE WHEN` keywords in Skill's metadata (YAML frontmatter)
- Specify "Load this Skill when prompt has X keyword or situation"
- Specify "This Skill should not be used in these situations"
- Example: Logging Skill's description with `USE WHEN: code logging, debug` / `DO NOT USE WHEN: database transaction`

**Content Contract:**
- Describe format and intent of instructions in Skill body
- Example: "When this Skill is loaded, Agent must perform 3-step checklist"
- When accompanied by Tool (script), include that tool's input/output contract
- When "Success Criteria" section is provided, Agent uses those criteria to determine task completion

**Error/Exception Handling:**
- Skill loading failure is rare
- Errors in Skill (e.g., typos) can cause errors during Agent execution
- Agent reports error with Skill name (e.g., `ERROR in Skill 'X': ...`)
- Or tries Plan B without Skill

**Time/Resource Policy:**
- Limit maximum number of parallel loads during auto-load
- Limit tokens put into context at once
- Anthropic Claude: Reference description first, full insert only needed Skills (token optimization)

> **Why Important?** Skills are written by multiple people and auto-selected by Agent, so without clear contracts, wrong Skills may be loaded causing incorrect behavior

---

### Tool Contract

Tools are mostly defined by function signatures or CLI interfaces.

**Definition Methods:**
- Function-type tools: Specify argument types/required/return structure with JSON Schema
- CLI tools: Define command options and output format
- Agent (or Skill) calls according to this schema

**Error Handling:**
- API calls: Return HTTP status code or error message
- CLI: Exit code or stderr
- Agent recognizes `exit code != 0` as failure
- Deliver standard error like `TOOL_FAILED` to user

**Time Limits:**
- Each tool call has individual timeout/retry policy
- Example: Web search tool times out after 30 seconds

**Security:**
- Tools only work within Agent's permission scope
- Example: "File delete tool" cannot access prod directory

**Data Contract:**
- Document units and meanings of returned data
- Example: Embedding tool always returns 1536-dimensional vector as float32

> **Key:** Tool layer contract is API contract between external systems and Agent, requiring same rigor as general software API design

In summary, each layer must clearly define input/output format, error handling, time/resource limits exchanged with higher/lower layers. Following this makes the system predictable and robust. When contracts are violated (e.g., Skill outputs larger text than expected, exceeding context), default safeguards in upper layers to control or truncate are also needed.

---

## 3. Operations (Ops) – Version Control, Testing, Monitoring, Rollback

AI agent systems also need operations/maintenance principles like software.

### Versioning

It's good to give version identification to each Command, Skill, and Agent.

**Version Management Methods:**
- Keep CHANGELOG in Skill folder
- Add `version: 1.2` field in Skill YAML frontmatter
- Notify team members when changing skills/commands
- Decide whether to keep old version files on version conflicts
- Manage releases by version when deploying as plugins (e.g., Claude Plugins)

**Backward Compatibility:**
- New Skills/Commands maintain same interface as previous versions
- Separate major changes with new name or major version
- Explicitly mark as `Agent v2` when changing Agent's prompt structure or usage

**Operational Strategy:**
- Deploy only stable versions to production environment
- Test experimental changes in separate branch/folder (e.g., `.assistant_dev/`) then merge
- Document version management and apply with team consensus

---

### Testing

Agent components follow unit test + integration test strategy.

**Unit Tests:**
- Verify expected output for input prompts for Commands and Skills
- Example: `/add-user John` Command execution → Confirm "User John created" included in response
- Skill unit test: Simulate Agent behavior change when Skill is loaded
- Example: Confirm Skill's checklist items are actually performed by checking logs

**Integration Tests:**
- Check entire agent workflow by scenario
- Example: "Bug → Fix → PR creation" agent test
  - Provide virtual codebase and bug
  - Observe whether Agent creates PR
- Use Mock Tools (e.g., mock Git tool to only imitate responses without push)
- Measure performance

**Simulation:**
- Regularly simulate important workflows with dry-run
- Example: Deployment agent runs periodically in staging environment
- Consider LLM response non-determinism → Repeat tests multiple times for reliability improvement
- Integrate all tests into CI → Automatic verification when adding new Skills/Commands
- Early detection of hallucinations or policy violations (use Anthropic eval, etc.)

---

### Observability

Running agent systems must be transparently monitored through logs, traces, and metrics collection.

**Logs:**
- Record all Commands executed by Agent, Skills loaded, Tool calls in chronological order
- Attach trace ID or session ID to each log item
- Track connected flow from specific user request → sub-agent → command → tool call
- Example: `trace abcd-1234` logs "User request received → Agent Plan established → Skill X loaded → Tool Y called → Completed"

**Metrics:**
- Collect key performance indicators:
  - Average token usage
  - Response time
  - Success rate
  - Retry count
  - Error type frequency
- Per-layer statistics: "How many times was this Skill called?", "What's failure rate for specific Command?"
- Visualize with dashboards → Quickly detect anomalies (e.g., sudden failure rate increase)

**Tracing:**
- Introduce distributed tracing concepts like OpenTelemetry
- Reconstruct decision path within Agent
- Automatically track by tagging major steps
- Track response times for external API calls → Identify bottlenecks

**Alerts:**
- Notify team channel on errors or important events
- Example: "Deployment agent failed 3 consecutive times - verification needed"
- Thorough observation improves root cause analysis and improvement speed

---

### Rollback

When problems occur from incorrect Skill/Command/Agent updates, you must be able to quickly return to previous stable state.

**Version Rollback:**
- Use version control like Git to tag previous versions
- Revert to that version when problems occur
- Launch darkly approach: Apply new version only to specific users or percentage
- Agent duplication: On new version error, immediately terminate session → Retry with previous Agent instance

**State Rollback:**
- When side effects occur during agent execution (e.g., file creation, permission changes)
- Restore to original state with predetermined cleanup procedures
- Example: "New project creation" agent fails midway → Execute rollback command to delete created files
- Need transactional response when affecting external systems (deployment, payment, etc.)

**User Notification:**
- When rollback occurs, notify "X operation failed, restored to previous state"
- Log the rollback situation itself and analyze cause
- Reflect in next patch

---

### Summary: Why This Structure is Good

| Perspective | Advantage | When It Breaks |
|-------------|-----------|----------------|
| **Hierarchy** | Manage complexity through modularization and role separation, maximize reusability | When boundaries become ambiguous (e.g., putting everything in one place) |
| **Contract** | Predictable with clear interface definitions, easy debugging | When implemented with implicit assumptions (e.g., writing Skills without documentation) compatibility issues occur |
| **Operations** | Ensure reliability through thorough version/test/monitoring | Unilateral changes without operational procedures cause failures and confusion |
