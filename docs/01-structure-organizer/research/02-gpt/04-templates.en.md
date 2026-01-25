---
title: "Design Templates"
description: "Standard specification templates for Command, Skill, and Agent with input schema, process flows, and output definitions."
type: explanation
tags: [Architecture, AI]
order: 4
related: ["./04-templates.ko.md"]
depends_on: [./README.md]
---

# D. Design Templates (Spec Forms)

Below are standard spec writing templates for Command, Skill, and Agent respectively. In practice, copy this form to write specifications for each component.

## 1. Command Spec Template

**Command Name:** `<short, clear command name>`  
**Purpose:** Specify the intent and work this Command does in one line.

- _Example:_ `/deploy` – _"Deploy latest code to specified environment."_

**Out of Scope:** Specify scope this Command doesn't perform or handle.

- _Example:_ "Does not handle infrastructure provisioning; rollback on deployment failure is not covered."

**Inputs (Input Schema):**

- **Parameters:** List of allowed arguments/options with meaning and type.
  - _Example:_ `<env>` (string) – Deployment target environment, one of `"dev"` or `"prod"`.
  - _Example:_ `--dry-run` (flag) – Perform step verification only without actual deployment.
- **Input Example:** Include actual call example.
  - _Example:_ `/deploy prod --dry-run`

**Process:** Describe internal procedures performed when Command executes, in order. (Use pseudo-code if needed)

1. Validate input parameter validity (e.g., check `env` value).
2. Load related Skill (e.g., load `Deployment` skill to get checklist).
3. Execute tool (e.g., run `deploy_script.sh env=... dry-run`).
4. Check result and handle success/failure branches.
5. Generate summary result response for user.

**Output (Output Schema):** Output format Agent provides to user after Command execution.

- **Success:** Message or output format on success.
  - _Example:_ "✅ Deployment to **prod** successful. (Version 1.2.3 deployed)"
- **Failure:** Standard error format on failure.
  - _Example:_ "❌ Deployment failed – _Timeout connecting to server_"
- **Output Artifacts:** External resources created/modified.
  - _Example:_ Deployment log file (`logs/deploy_<env>.log`) updated.

**Failure Modes & Errors:** Specify possible failure scenarios and handling methods.

- _Example:_ `INVALID_ENV` – Unsupported environment argument → **Immediate error response**, no deployment attempt.
- _Example:_ `DEPLOY_TIMEOUT` – Deployment script timeout → **Return error message**, (if needed) **attempt cleanup**.
- _Example:_ `DEPLOY_PARTIAL_FAIL` – Only some services deployed → **Warning message** + **additional action guide** provided.

**Safety Constraints:** Security/permission/execution safety measures.

- _Security:_ Production (`prod`) deployment requires **additional confirmation question**. (e.g., "Are you sure?")
- _Permission:_ Agent performs this Command execution only with **specific IAM role** (permission isolation).
- _Dry-run:_ Execute in `--dry-run` mode by default and get user confirmation, or require `--force` option for actual execution.
- _Rate Limit:_ Limit to once per day (prevent duplicate deployments).

**Versioning:**

- **Current Version:** v1.0 (2026-01-24) – Initial creation.
- **Change Log:**
  - v1.1 – _Planned change:_ Adding different script support per environment.
- **Backward Compatibility:** Maintain input parameters and output format in v1.x. Parameter changes possible in v2.0.

**Testing:**

- **Unit Tests:** Run markdown command file with small context agent for each argument combination, verify expected response.
  - _Example:_ `/deploy dev` → Confirm response includes "successful". `/deploy invalid` → Confirm "INVALID_ENV" error.
- **Integration Tests:** Run with dry-run on actual staging environment to check logs/system impact. (CI pipeline nightly)
- **Simulation:** Regularly run dry-run mode for production to detect early failures from script/API changes.

**Observability:**

- **Logging:** Log each step (validation, skill load, tool call results) with `COMMAND=deploy` tag during execution.
- **Metrics:** Collect `deploy_success_count`, `deploy_failure_count`, `deploy_duration_ms` metrics and dashboard them.
- **Traceability:** Store Trace ID linked with parent Agent conversation. Reproduce entire process with that ID when problems occur.
- **Notifications:** Notify slack channel of prod deployment success/failure results.

**Owners & Reviewers:**

- **Owner:** DevOps Team – Alice (alice@example.com)
- **Reviewer:** ML Platform Team – Bob, and Security Team – Charlie (approver list)

**Notes:** (Other notes)

- Actual deployment proceeds only for artifacts that passed CI pipeline beforehand.
- It's good for Agent to verify all code changes are committed before executing this Command (under review).

---

## 2. Skill Spec Template

**Skill Name:** `<Domain>.<Skill>` (domain and skill identifier)  
**Description (Purpose/Use Case):** Describe in detail the problem domain this Skill handles and usage triggers.

- _Example:_ **logging** skill – _"Use when adding/modifying logging in code. Do not use in other contexts. (Use when: adding log statements or adjusting log levels. Do NOT use when: database transactions or UI text.)"_

**Not for Use (Non-purpose/Limitations):** Cases or limitations where agent should not misuse this Skill.

- _Example:_ "This skill doesn't help in Debugging situations – use debug skill instead"
- _Example:_ "This skill is not suitable for analyzing large log data (context limitations)"

**Skill Files Structure:** (SKILL.md and accompanying file composition)

```
skills/
└── logging/                    # Domain folder (kebab-case)
    ├── SKILL.md                # Main skill definition
    ├── workflows/
    │   ├── add-log.md          # New log addition procedure
    │   └── adjust-level.md     # Log level adjustment procedure
    └── tools/
        └── format_log.py       # (Example) Log format validation script
```

- **Context Files:** Specify additional documents to load as reference besides SKILL.md.
  - _Example:_ `Conventions.md` – Project common logging conventions description (referenced in SKILL.md body).
- **Tools:** Description and path of accompanying tools/scripts.
  - _Example:_ `tools/format_log.py` – Python script, checks format rules given log message as argument, returns result JSON.

**Skill Triggers (Trigger Conditions):** Specific patterns for when agent should load this Skill.

- _Example:_ User request or Agent goal contains **"log", "logging", "log level"** keywords → Trigger.
- _Example:_ In file change context, when `*.log` file is target → Trigger.
- _Negative Triggers:_ _"Even if user uses 'log' word, ignore if different meaning like `logistics`"_
- **Trigger Implementation:** (Implementation method in framework)
  - _Example:_ List keywords in _USE WHEN_ clause in Claude Skill YAML frontmatter `description`.

**Inputs to Skill:** Context or variables the Skill assumes. (Not explicit function arguments, but describe **required prerequisites**)

- _Example:_ "Code file content Agent is currently editing" (referenced as `<<file_content>>` placeholder in Skill content).
- _Example:_ "Log level user wants (e.g., INFO→DEBUG)" – Agent must have figured this out.

**Skill Content (Content Description):** Describe logic and role of SKILL.md and workflows.

- **Overall Structure:**
  - SKILL.md: YAML frontmatter + **Workflow Routing table** and **skill description** in body.
  - Workflows: Each detailed work procedure (e.g., add-log.md is 1)determine log location 2)code insertion 3)format validation 4)test etc.).
- **Example Workflow:** (Summary of one workflow)
  - _Example:_ **add-log.md** – "When Agent executes this workflow, guides to add entry log at function start. 1) Identify function name and input values, 2) Insert `logger.info()` code at that location, 3) Check message format with `format_log.py` tool, 4) Summarize results."
- **Skill Usage in Agent:**
  - _Example:_ "After loading SKILL.md, Agent reads `## Workflow Routing` table to **select and execute workflow file matching user intent**. When 'log level change' keyword detected, proceeds to adjust-level.md."

**Output/Effect:** Expected Agent behavior or external effects from applying Skill.

- _Example:_ "Agent will produce a code diff adding the log line."
- _Example:_ "Agent's answer includes a confirmation that logging conventions were followed."
- (Skill itself has no output, but describe characteristics of Agent results)

**Quality/Validation Points (Stability/Validation Points):** Accuracy and safeguards for Skill content.

- _Example:_ "To prevent inserted log code from causing compile errors, include `build passes` in success conditions."
- _Example:_ "On Format validation script error, Agent only gives 'format validation failed' warning and continues (no fatal stop)."
- _Example:_ "Even after Skill execution, if result differs from expected, Agent should ask user confirmation question ('Is this log addition outputting the information you want?')."

**Failure Modes:** Situations that could go wrong when applying Skill and responses.

- _Example:_ **NoLogLib:** When logging library import is missing in code → Agent notifies "logging library import needed" then includes import statement addition step.
- _Example:_ **MultiChoice:** Multiple log insertion locations appear confusing Agent → Agent selects only one optimal location per Skill instructions, asks user if ambiguous.

**Testing:**

- **Unit (Prompt) Test:** Simulate by injecting Skill's Workflow into Agent with small example to verify proper operation.
  - _Example:_ Simple function code + "add log" request + only this Skill loaded → Confirm Agent generates diff adding one log line.
- **Integration Test:** Test user scenarios with Skill included in full Agent.
  - _Example:_ User requests "Put debug log in this function" → Confirm Agent loads logging skill and gives result.
- **Negative Test:** Test that Skill trigger doesn't malfunction.
  - _Example:_ Verify logging skill is not loaded when "modify shipping(logistics) module" is requested.
- **Automated Validation:** Unit test tools included in Skill (`format_log.py`) (correct format/wrong format input cases).

**Observability:**

- **Usage Logging:** When this Skill is loaded, record in log like `SKILL=Logging loaded (trigger=keyword 'log')`.
- **Metrics:** Measure `skill_logging_usage_count`, `skill_logging_success_rate`. (Success rate calculated by whether Agent work completed without errors after Skill application)
- **Performance:** Monitor Skill body token count and actual input frequency to understand average token increase. (Consider separation if too large)
- **Feedback Collection:** When collecting user feedback on agent results ("This log addition was useful/useless"), evaluate Skill effectiveness.

**Versioning:**

- **Version:** v1.0 – Basic log addition/level adjustment functionality.
- **History:** (Version change history)
  - v1.1 – 2026-02-10: Added workflow for batch changing existing log levels during level adjustment.
- **Compatibility:** List of other agents using this Skill (DevAgent v2.0, etc.). Notify compatibility impact when changing.

**Owner:** Backend Team – Dave (dave@example.com)

**Notes:**

- Written according to company coding rules document (link).
- Related Skill: debug skill (may be loaded together, so adjusted keywords to avoid trigger conflicts with debug skill description).

---

## 3. Agent Spec Template

**Agent Name:** `<agent name>` – (Name representing role if possible, e.g., _"qa-bug-hunter"_)  
**Goal:** Describe the top-level purpose this Agent should solve or perform.

- _Example:_ "Find cause from bug report and complete code fix and PR."

**Scope & Role:** Agent's responsibility scope and limitations.

- _Example:_ "Bug resolution within codebase. Product issue analysis outside system is out of scope."
- _Example:_ "Makes code fixes and tests on its own, but final PR merge requires human review."

**Inputs:** Content format Agent receives as arguments.

- _Example:_ User prompt: "Bug description" (natural language) + (optional) related issue ID.
- _Example:_ JSON received via API call: { "bug_description": "...", "steps_to_reproduce": "..." }
- Prior context: (if any) Previous conversations or related files.

**Outputs:** Results Agent produces.

- _Example:_ Problem cause analysis explanation + fixed code patch (diff) + PR link.
- _Example:_ Or "Resolution failed" report and additional action suggestions.
- Output format: Markdown report, JSON (for API response), etc.

**System Prompt:** Default prompt/personality/rules set for Agent.

```
You are a code assistant specialized in bug fixing…
• Always provide code diffs in markdown format.
• If uncertain, ask user for clarification rather than guessing.
```

(Write Agent's initial prompt content like above. Include security requirements or speech style rules.)

**Accessible Tools & Skills:** List of tools/skills this Agent can use and permissions.

- **Tools:**
  - FileSearch Tool – _"Search codebase by keyword"_ (read-only, access to entire project directory).
  - CodeEditor Tool – _"Modify/write code"_ (writable within specific paths, test code location restricted).
  - TestRunner Tool – _"Run tests"_ (local tests only without network).
  - WebSearch Tool – _"Open web search"_ (**disabled** in this agent for security).
- **Skills:**
  - logging skill, debug skill – (auto-load when needed)
  - coding-guidelines skill – (provides project coding style & naming conventions)
  - _Note:_ This Agent does not load Skills other than above (e.g., ui skill and other unrelated domains excluded).
- **Permissions:**
  - GitHub API token (repository access O, organization management X)
  - No Prod DB access (prevent data changes)
  - Confidential file access restricted (some directories read prohibited)

**Planning & Workflow:** Steps and decision flow Agent goes through to solve problems.

1. **Problem Understanding:** Analyze bug description to extract reproduction clues. Ask user additional questions if needed (1+ times).
2. **Locate Issue:** Search related code with FileSearch tool. Read related code snippets to diagnose cause.
3. **Devise Fix:** Plan fix approach matching problem cause. (Auto-load coding-guidelines skill when needed to reference style)
4. **Apply Fix:** Modify that part with CodeEditor tool.
5. **Test Fix:** Run TestRunner tool. Branch based on results for success/failure.
   - If tests fail → Analyze error logs and return to **step 2** for additional fix attempt (max 2 loop iterations).
6. **Prepare PR:** When tests pass, refer to logging skill etc. to add log/comment improvements. Push new branch and create PR with GitHub API tool.
7. **Output Result:** Output summary answer of "bug cause and fix" to user, attach PR link. Guide next steps to reviewers if needed.

**Success Criteria:** When Agent considers work "complete."

- Success when all related tests pass & PR creation is complete.
- Or complete when user confirms "This is enough."
- (If above conditions not met, consider it failure and report)

**Failure Modes & Recovery:** Expected failure scenarios and Agent responses.

- **Unreproducible Bug:** Bug cannot be reproduced → Request additional info from user. If can't find after 2 attempts, report "Cannot reproduce" and terminate.
- **Fix not Found:** Tests still fail after 3 attempts → Upload partially fixed content as PR and message "Complete resolution failed, requesting additional help." (Add warning label to PR).
- **Tool Error:** Tool usage error (e.g., FileSearch timeout) → Retry that step (max 2 times), if still fails, inform user "Some automatic search failed" and request manual verification.
- **Permission Denied:** Attempted action is permission-prohibited → Stop immediately, report permission issue to user. (e.g., "Cannot access database").
- **Context Overflow:** Too many sub-agents spawned, context insufficient → Summarize current progress (using Summarize Skill) to clear context and continue.
- **Fatal Error:** (Corner case) Agent gets stuck in loop due to logic error → Force terminate after timeout (e.g., 10 minutes), apologize to user and provide logs.

**Safeguards:** Protection measures at Agent level.

- **Ask vs Assume:** In ambiguous situations, don't proceed with own judgment, **ask user for confirmation** first (prevent hallucination).
- **No Secrets in Output:** Prohibit exposure of environment variables or passwords – mask or stop response if detected.
- **Rate Limit:** This Agent runs only one session/one user at a time (doesn't create multiple PRs in parallel).
- **Confirmation:** User confirmation before dangerous actions – (e.g., "Do you really want to proceed?" before mass code deletion).
- **Performance Guard:** Max 5 parallel sub-agents (prevent token overload), 2-minute time limit per sub-agent.

**Collaboration (Human Intervention Points):**

- Human review required after PR creation → Agent doesn't auto-merge.
- When agent asks uncertain parts, wait until user answers (session maintained max 1 hour).
- For long tasks (e.g., tests 30+ minutes), relay progress to user ("Running tests…") – (user can cancel).

**Logging & Monitoring:**

- This Agent logs all major events (`AGENT=bug-hunter step=locate-issue time=...`).
- Attach used skills/tools summary to log with results (for reproducibility).
- Metrics: Track bug_fix_success_rate, avg_fix_iterations, avg_time_to_fix.

**Testing Plan:**

- **Scenario Tests:** End-to-end tests with various bug scenarios (e.g., null pointer exception, calculation errors, etc.).
- **Edge Case Tests:** Test Agent responses for cases like bugs with insufficient reproduction info, permission-less action requests, etc.
- **Regression Tests:** Give previously solved bugs again to confirm same fix output (verify Agent upgrade didn't change results).
- **Load Test:** Observe resource usage and conflicts when multiple bug requests come in simultaneously (5 in parallel) (this Agent has parallel limits, but for multiple users).

**Deployment & Versioning:**

- Version v1.0 – Initial deployment (using Claude-2 100k context)
- v1.1 planned – Model change to GPT-4 (expecting more accurate fixes), tool permissions to be reviewed for this.
- Rollout: v1.1 applied only to internal test group first, then full application when stable.
- Previous version fallback: Keep v1.0 Agent config settings available to revert on serious bugs.

**Owner & Team:** ML Platform Team – Lead: Erin (erin@example.com)  
**Stakeholders:** QA Team, Backend Team (operating Agent output quality feedback loop)

**Notes:**

- This Agent strongly depends on internal `coding-guidelines skill` – Testing this Agent needed when that Skill is updated.
- Future improvement: Complex issues are difficult with LLM alone, so reviewing integration of similar history search (past bug resolution history).
