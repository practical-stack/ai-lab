# E. Example Designs (Applying to My Workflows)

This section covers two workflow examples:
1. "New app creation scaffolding + CI setup"
2. "Bug report → Reproduction → Cause analysis → PR creation"

Each case describes file structure, naming conventions, brief implementation, and operational scenarios.

---

## Example 1: New App Creation Scaffolding + CI Setup

### Scenario

- User requests "Create a new project for me"
- Perform basic code scaffolding + CI pipeline setup
- Multiple steps needed: Create project structure → Write CI config file → Initialize repository

### Component Separation

| Component | Name | Role |
|-----------|------|------|
| **Command** | `/init-project` | Command executed by human, receives project name etc. as parameters and triggers agent |
| **Agent** | `project-init-agent` | Project initialization specialist agent, performs multi-step from scaffolding to CI setup |
| **Skills** | `scaffold`, `ci` | Domain-specific knowledge (language-specific templates/directory structure, CI tool writing guidelines) |
| **Tools** | Git CLI, FileWrite, etc. | Perform actual work (create-react-app CLI, etc.) |

> **Structure:** Command → Agent → (Skills) → Tools

### File/Folder Structure Example

(Assuming .assistant/ directory usage based on internal framework)

```
.assistant/
├── commands/
│   └── init-project.md           # /init-project Command script
├── agents/
│   └── project-init-agent.md     # Project initialization agent definition
└── skills/
    ├── scaffold/                 # scaffold skill domain
    │   ├── SKILL.md              # Scaffolding skill overview (trigger: "new project", language keywords, etc.)
    │   └── workflows/
    │       ├── create-structure.md  # Directory/file creation procedure
    │       └── init-repo.md         # Git init & first commit procedure
    └── ci/                       # ci skill domain
        ├── SKILL.md              # CI skill overview (trigger: "CI", "pipeline", etc.)
        └── workflows/
            └── setup-pipeline.md  # CI YAML writing and CI setup procedure
```

### Naming Convention

| Item | Rule | Example |
|------|------|---------|
| Command file | kebab-case | `init-project.md` |
| Agent file | kebab-case | `project-init-agent.md` |
| Skill directory | kebab-case | `scaffold`, `ci` |
| Workflow file | kebab-case | `create-structure.md`, `setup-pipeline.md` |

> **Key:** All components use kebab-case for consistency

### Minimal Implementation (Pseudo-code Level)

**commands/init-project.md:** (No YAML – if Cursor-style Command then markdown only)

```markdown
/init-project <project_name> [--language <lang>]

- Load the `scaffold` skill and `ci` skill.
- Ask the project-init-agent to create a new project named "$1" (language: $2).
```

Explanation: This Command simply receives project name and language, pre-loads related Skills and requests Agent to start work. (Either @mention Agent directly to call it, or induce agent behavior with internal prompt)

**agents/project-init-agent.md:** (System role and instructions inside)

```yaml
name: project-init-agent
description: "An agent that scaffolds a new project and sets up CI."
tools: ["FileWrite", "GitInit", "TemplateFetch", ...]
```

```markdown
---

## Instructions:

1. Ensure the "scaffold" skill is loaded for project structure templates.
2. Ensure the "ci" skill is loaded for CI configuration templates.
3. Plan: Determine appropriate project structure based on language.
4. Step 1: Create base project files and folders (use FileWrite tool).
5. Step 2: Initialize git repository (use GitInit tool), commit scaffold.
6. Step 3: Set up CI pipeline (create CI YAML, commit).
7. Final: Confirm success with project name.
8. If any step fails, report error and abort further steps.
```

(System prompt also includes above procedure + safeguards: "if prod deployment, skip", etc.)

**skills/scaffold/SKILL.md:**

```yaml
name: scaffold
description: |
  Project scaffolding instructions.
  USE WHEN: "new project", "initialize repository", "project structure", etc.
  WHEN NOT: used for adding features to existing project.
```

```markdown
---

## Workflow Routing

| Workflow            | Trigger keywords                      | File                         |
| ------------------- | ------------------------------------- | ---------------------------- |
| **create-structure** | "new project", "scaffold", "template" | workflows/create-structure.md |
| **init-repo**        | "git init", "initialize repository"   | workflows/init-repo.md        |

## About

This skill provides templates and steps to scaffold a new software project. It covers directory structure, sample files, and repository initialization.
```

**skills/scaffold/workflows/create-structure.md:**

```markdown
**Goal:** Create base structure for a new $LANG project named $PROJECT_NAME.

1. Determine standard structure for $LANG (use included templates or convention).
2. Create directory named `$PROJECT_NAME` (if not exists).
3. Inside it, create subdirectories (src/, tests/, etc.) and placeholder files (README.md, main file).
4. Use FileWrite tool for each file.
5. (If language requires build config or package file, create it from template.)
6. Ensure no file collisions; if directory already exists, warn and stop.
```

**skills/ci/workflows/setup-pipeline.md:**

```markdown
**Goal:** Set up CI pipeline (GitHub Actions) for the new project.

1. Create `.github/workflows/ci.yml` with a basic build/test pipeline.
   - Use a template: for $LANG, include relevant setup (e.g., install deps, run tests).
2. Ensure the pipeline triggers on push.
3. Commit the `ci.yml` file to the repository (Agent will use Git tool).
4. Verify syntax if possible (optional: if `gh` CLI available for validation).
```

### Operational Scenarios

#### ✅ Success Path

| Step | Action |
|------|--------|
| 1. Command input | Developer enters `/init-project MyApp --language python` in VSCode Chat |
| 2. Agent startup | Load scaffold and ci skills (skill content included in Agent context) |
| 3. Plan establishment | "Step1: Create structure → Step2: Git init → Step3: CI setup" |
| 4. Step1 | Create folders/files with scaffold skill's create-structure workflow (FileWrite tool) |
| 5. Step2 | Execute `git init` with init-repo workflow (GitInit tool) and initial commit |
| 6. Step3 | Write `.github/workflows/ci.yml` and commit with ci skill's setup-pipeline |
| 7. Complete | "✅ MyApp project creation and CI pipeline setup complete." + file list output |

- Structure and CI files actually created in repo folder
- Each step logged normally, metrics success count increased

#### ❌ Failure Scenarios

**1. Folder Collision:**
- Agent detects error in Step1 ("directory exists")
- Immediately stops with message: "❌ Project directory already exists. Please choose a different name or empty the folder."
- Rollback: Delete if some files were written, if before GitInit just leave folder and terminate
- User takes action then retries

**2. Git Not Installed:**
- GitInit tool error occurs
- Report "Git not installed: please install git and try again"

#### 🔄 Rollback Policy

- This workflow is relatively **idempotent**
- Created files are not fatal even if failed (user can delete manually)
- Guidance required on intermediate failure: "CI setup failed, please add manually"

**Transaction Strength Options:**
- Create files in temp directory, move when all steps succeed
- Adopted sequential creation model due to implementation complexity

> **Key:** Clearly inform user so they can take next action

---

## Example 2: Bug Report → Reproduction → Cause Analysis → PR Creation

### Scenario

- QA or user reports bug
- AI agent reproduces bug → fixes code → creates GitHub PR
- Complex multi-step work performed primarily by Agent, step-by-step function modularization

### Component Separation

| Component | Name | Role |
|-----------|------|------|
| **Command** | `/fix-bug` | Triggers bug fix process. Receives bug ID or description as argument. Chat invocation or issue tracker integration |
| **Agent** | `bug-fix-agent` | Bug resolution specialist agent. Performs "reproduce→find cause→fix→verify→PR" |

**Skills:**

| Skill | Role |
|-------|------|
| `diagnosis` | Analysis routines by bug symptom (null pointer vs performance bug, etc.) |
| `coding-guidelines` | Project coding standards/best practices (ensures fix quality) |
| `testing` | Test writing/execution related knowledge |
| (Optional) `logging`, `security` | Contextual skills |

**Tools:**

| Tool | Purpose |
|------|---------|
| `RunApp` / `RunTests` | Execute app or test cases (bug reproduction) |
| `ReadLog` | Extract error logs/stack traces |
| `CodeSearch` | Code search (find similar error patterns) |
| `FileEdit` | Code modification |
| `GitHubAPI` | Branch push and PR creation |
| `NotifyAssignee` | (Optional) Notify team channel on PR creation |

### File/Folder Structure Example

```
.assistant/
├── commands/
│   └── fix-bug.md                # /fix-bug Command
├── agents/
│   └── bug-fix-agent.md          # Bug fix agent definition
└── skills/
    ├── diagnosis/
    │   ├── SKILL.md
    │   └── workflows/
    │       ├── null-pointer.md
    │       ├── perf-issue.md
    │       └── ...               # (Various bug type response workflows)
    ├── coding-guidelines/
    │   ├── SKILL.md
    │   └── ...                   # (Project coding standard related docs)
    └── testing/
        ├── SKILL.md
        └── workflows/
            ├── reproduce.md      # Reproduction method (test case writing, etc.)
            └── regression-test.md # Post-fix regression test procedure
```

Naming Convention:
- fix-bug.md command – kebab-case.
- bug-fix-agent.md – kebab-case.
- Skills: diagnosis, coding-guidelines, testing – kebab-case domain names. Diagnosis workflow files named by specific bug type in kebab-case.
- Tools configured likely via Agent YAML or platform config, not in our repo structure (except perhaps script wrappers).

### Pseudo-code Implementation Summary

**commands/fix-bug.md:**

```markdown
/fix-bug <issue_id_or_title>

- Summon @bug-fix-agent to analyze and resolve the bug "$1".
- Provide any available details from issue tracker for context.
```

Explanation: When called like /fix-bug 101, fix-bug.md command calls bug-fix-agent while providing environment info (bug ID 101 issue content) as input. Command itself doesn't contain detailed logic, just serves as agent execution trigger role.

**agents/bug-fix-agent.md:**

```yaml
name: bug-fix-agent
description: "Agent that reproduces bugs, fixes code, and creates a PR."
configuration:
  model: Claude-2
  max_iterations: 10
  tools: [RunApp, RunTests, ReadLog, SearchCode, EditFile, GitHubCreatePR]
  skills: [diagnosis, coding-guidelines, testing]
```

```markdown
---

## Behavior:

You are a software bug fixer agent. Follow this high-level process:

1. Understand bug description and context (if not clear, ask user clarifying questions).
2. Reproduce the bug: use RunTests or RunApp tool with provided steps.
   - If reproduction fails, try alternate inputs or ask for more info.
3. Once reproduced, identify root cause: use ReadLog for error, SearchCode for error patterns, etc.
   - Load "diagnosis" skill to guide analysis based on error type.
4. Devise a fix and implement it: edit code (EditFile tool).
   - Follow coding best practices (coding-guidelines skill loaded).
5. Test the fix: run tests again to confirm bug is resolved and no new issues.
   - If tests fail, iterate fix (go back to step 3 or 4 up to 2 retries).
6. If fix is successful, run additional regression tests (testing skill might help).
7. Create a Git branch and commit changes, open a Pull Request (GitHubCreatePR tool).
8. Summarize the bug cause and fix in the PR description and in the response to user.
9. If at any point something is unclear or cannot be resolved, communicate failure to user with reasons.

## Constraints:

- Ensure no sensitive data is included in outputs (strip any secrets from logs).
- Limit context: prefer using sub-agents for extensive search if needed (like context search agent).
- Adhere to project coding standards (coding-guidelines skill ensures this).

## Confirmation:

- Before applying fix or creating PR in a critical module, consider asking user for confirmation if unsure about side-effects.
```

**Skills usage:**

| Skill | Purpose |
|-------|---------|
| `diagnosis/SKILL.md` | Trigger-based routing: "NullPointerException" → `null-pointer.md`, "Timeout" → `perf-issue.md` |
| `coding-guidelines/SKILL.md` | Provides style rules: function names start with verb, unit tests required for new code, etc. |
| `testing/SKILL.md` | Regression test writing guide, test coverage assurance, test generation for uncovered scenarios |

**Tools Operation:**

| Tool | Operation |
|------|-----------|
| `RunApp` | Execute program with sample input |
| `RunTests` | Execute test suite |
| `ReadLog` | Used when Agent parses test results |
| `SearchCode` | grep or semantic code search |
| `EditFile` | Apply patch |
| `GitHubCreatePR` | Compose commit message, branch name, PR title/description (including fix summary) |

> Tools are configured with JSON I/O and executed in underlying system

### Operational Scenarios

#### ✅ Success Case

**Start:** QA executes `/fix-bug #101` (or "Fix this issue" → assistant internally calls fix-bug)

| Step | Action | Details |
|------|--------|---------|
| 0 | Agent start | Receives issue #101 info as Input (NullPointerException error report) |
| 1 | Understanding | If additional info needed, asks "Reproduction method?" → "Error when clicking A feature" |
| 2 | Reproduction | Execute app with RunApp tool → Error occurs → Get stack trace with ReadLog |
| 3 | Cause analysis | Load diagnosis skill → Confirm `ModuleX line 45` with SearchCode → Find unhandled null in `obj.getName()` |
| 4 | Fix | Reference coding-guidelines skill → Add null-check or use Optional with EditFile |
| 5 | Test | Execute RunTests → All tests pass, RunApp re-execution → no crash |
| 6 | Regression | Reference testing skill, write new unit test if needed |
| 7 | PR | GitHubCreatePR: branch `bugfix-101-nullptr`, commit message `Fix NPE in ModuleX (fixes #101)` |
| 8 | Complete | "✅ Bug #101 reproduction and fix complete. Cause: obj null unhandled. PR link." |

**Result:**
- PR uploaded to GitHub, CI passes
- Complete once Maintainer merges
- Agent full action recorded in logs, metrics++ (success count)
- QA team channel notification: "Agent fixed bug 101, PR ready for review."

#### ❌ Failure/Exception Scenarios

**1. Reproduction Failure:**
- Agent unable to reproduce bug after multiple attempts
- Request additional info from user → Terminate if no info available
- Output: "❌ Unable to reproduce: Could not reproduce the problem with provided information. Please provide additional info."
- PR not created, metrics failure count recorded

**2. Cause Analysis Failure:**
- Reproduction succeeded but cannot identify clear cause through code analysis
- Graceful fail when iteration limit reached
- Output: "Could not automatically identify cause. Suspected issue in Y area, developer verification needed."
- Option: Draft PR with "Needs Investigation" label

**3. Fix Regression:**
- Other tests fail after bug fix
- Stop after max 2 retries still fail
- Output: "Partially fixed but not all tests passed. Opened PR, manual fix needed."
- Policy choice:
  - Create PR to preserve work (mark incomplete)
  - Or provide only diff in chat

**4. Permission Error:**
- GitHub token expired or no PR creation permission
- Output: "❌ Fix completed but PR creation failed (permission error). Manual branch push and PR needed."
- Provide patch file if branch push fails
- Code changes only local, safe

**5. Environment Constraints:**
- Test execution timeout (context/time limit)
- Output: "Tests took over 10 minutes and were stopped. Manual test verification needed."

#### 🔄 Rollback Policy

**Basic Principles:**
- Most work within development environment, low need for automatic rollback
- Safety ensured through no git commits/PR on failure

**Policy Options:**

| Situation | Handling Method |
|-----------|-----------------|
| Complete failure | No PR created, only local changes preserved |
| Partial success | Draft PR or diff via chat |
| Failure after PR creation | Upload as Draft or Close PR |

**Safeguards:**
- All Agent actions performed in local branch
- Even if PR creation fails, local commits preserved → User can manually push
- Fatal side effects (wrong code merge) prevented by human-in-the-loop review

> **Key:** Focus on **accurately reporting status at intermediate failure and providing outputs (diff, etc.)** rather than rollback

⚠️ **Organizational Guardrail:** Agent outputs always go through human-in-the-loop review before merge
