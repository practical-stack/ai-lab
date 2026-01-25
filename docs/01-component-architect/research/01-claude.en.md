# Designing commands, skills, and agents for AI coding assistants

AI coding assistants like Claude Code and OpenCode organize capabilities into distinct abstraction layers—commands, skills, and agents—each serving different purposes. **Commands** are human-triggered entry points, **skills** encode domain expertise without execution, and **agents** provide autonomous reasoning. This guide establishes precise definitions, architectural patterns, and practical specifications for building maintainable AI coding workflows, with particular focus on GitHub CLI integration.

## Concept definitions establish clear boundaries

The AI coding ecosystem uses these terms inconsistently, but production-grade systems require precise distinctions. A **tool** executes atomic operations—API calls, file writes, database queries—with JSON-defined inputs and documented side effects. Tools are the "hands" of an AI system; they _do things_. A **skill** is packaged expertise that shapes _how_ an agent approaches problems without executing code directly. Skills provide behavioral instructions, domain heuristics, and templates—they're the "training" of an agent.

A **command** is a discrete, human-triggered action that initiates specific workflows. Commands map user intent to system capabilities and often include validation logic. Commands are explicit entry points—users invoke `/create-issue` or `/review-pr` to trigger defined behavior. An **agent** operates autonomously, using an LLM to reason, plan, and dynamically select tools. Agents maintain state, adapt to unexpected situations, and work toward goals with minimal intervention. A **workflow** (or chain) executes predetermined steps in fixed order—deterministic, predictable, and ideal for consistent processes.

The hierarchy flows from abstract to concrete: **Agent → Workflow → Command → Skill → Tool**. Agents orchestrate workflows, workflows invoke commands, commands leverage skills for domain guidance, and skills direct tool selection and usage.

### Terminology mapping across AI coding tools

| Tool               | Commands (User-Triggered)                | Rules/Instructions (Persistent Context) | Agents/Modes         | Config Location      |
| ------------------ | ---------------------------------------- | --------------------------------------- | -------------------- | -------------------- |
| **Claude Code**    | Slash commands (`.claude/commands/*.md`) | `CLAUDE.md` (hierarchical)              | Single agent         | `.claude/` directory |
| **OpenCode**       | `.opencode/commands/*.md`                | `AGENTS.md`, instructions array         | Build, Plan modes    | `opencode.json`      |
| **Cursor**         | `.cursor/commands/*.md` (beta)           | `.cursor/rules/*.mdx`, `.cursorrules`   | Agent, Ask, Manual   | `.cursor/rules/`     |
| **GitHub Copilot** | `.github/instructions/*.instructions.md` | `.github/copilot-instructions.md`       | Chat-focused         | `.github/` directory |
| **Aider**          | Chat commands (`/read`, `/run`)          | `CONVENTIONS.md` via `--read`           | Single assistant     | `.aider.conf.yml`    |
| **Cline/Roo Code** | Conversational                           | `.clinerules/`, `.roo/rules/`           | Code, Architect, Ask | VS Code extension    |

## Claude Code architecture centers on markdown files

Claude Code organizes capabilities through a file-based system where markdown files define behavior. Custom commands live in `.claude/commands/` (project-scoped) or `~/.claude/commands/` (user-scoped). Each `.md` file becomes a slash command—`fix-issue.md` creates `/fix-issue`. Commands use YAML frontmatter for configuration:

```markdown
---
allowed-tools: Bash(git:*), Bash(npm:*)
argument-hint: [issue-number] [priority]
description: Fix a GitHub issue following project conventions
---

Fix issue #$1 with priority $2.

Current git status: !`git status`
Relevant code: @src/utils/helpers.ts

Follow the coding standards in @CONVENTIONS.md
```

The `$ARGUMENTS` variable captures all passed arguments; `$1`, `$2` provide positional access. The `!` prefix embeds shell command output; `@` prefix includes file contents. Commands can specify models, restrict tool access, and disable automatic invocation.

**CLAUDE.md serves as persistent memory**—automatically loaded at session start. It defines project context, coding conventions, and workflow instructions. The hierarchy cascades: enterprise policy (`/etc/claude-code/`) → user preferences (`~/.claude/CLAUDE.md`) → project rules (`./CLAUDE.md`) → local overrides (`./CLAUDE.local.md`). Files at each level are combined, with higher-priority sources winning conflicts. Keep CLAUDE.md files under **1,000 tokens** to avoid context pollution.

Skills extend commands with supporting resources. A skill directory (`.claude/skills/code-review/`) contains `SKILL.md` for behavioral instructions plus templates, examples, and scripts. Skills enable automatic invocation based on context matching—the description field guides when Claude activates a skill without explicit user invocation.

## GitHub CLI integration follows specific patterns

### Issue creation with templates and metadata

```bash
# Full issue creation with all metadata
gh issue create \
  --title "feat: Add OAuth authentication" \
  --body "Implementation requirements from spec..." \
  --label "enhancement,priority-high" \
  --assignee "@me" \
  --milestone "v2.0" \
  --project "Q1 Roadmap" \
  --template "feature_request.md"

# Body from file or stdin for AI-generated content
echo "$AI_GENERATED_BODY" | gh issue create \
  --title "Bug: Login timeout" \
  --body-file -
```

Template names must exactly match files in `.github/ISSUE_TEMPLATE/`. Note a known limitation: you cannot specify additional labels via CLI when a template defines default labels.

### PR creation with automatic issue linking

```bash
# Auto-fill from commits (best for squashed workflows)
gh pr create --fill --draft

# Full specification with issue linking
gh pr create \
  --title "feat: Add user authentication" \
  --body "Closes #123. Implements JWT-based auth per RFC." \
  --base main \
  --head feature/123-user-auth \
  --reviewer "alice,bob" \
  --draft
```

Keywords in the body (`Closes #N`, `Fixes #N`, `Resolves #N`) automatically close linked issues on merge. Always create draft PRs for AI-assisted work to enable human review before merging.

### Branch naming tied to issues

The `gh issue develop` command creates branches linked to issues:

```bash
# Create branch from issue (auto-named from title)
gh issue develop 123 --checkout

# Custom branch name with pattern
gh issue develop 123 --name "feature/123-oauth-flow" --checkout
```

Standard branch prefixes: `feature/` (new functionality), `fix/` (bug fixes), `hotfix/` (urgent production), `refactor/` (improvements), `docs/` (documentation). Pattern: `<type>/<issue-id>-<description>`.

### Conventional commits enable automation

```bash
# Structure: <type>(<scope>): <description>
git commit -m "feat(auth): add JWT token validation"
git commit -m "fix(api): handle null response in user endpoint"
git commit -m "refactor!: redesign authentication flow"  # Breaking change
```

Types map to semantic versioning: `feat` bumps MINOR, `fix` bumps PATCH. Breaking changes (marked with `!` or `BREAKING CHANGE:` footer) bump MAJOR. Separate refactors from features in distinct commits—this enables `git bisect` for debugging and cleaner PR reviews.

## Decision framework guides abstraction choice

Use this decision tree to select the appropriate abstraction level:

**Make it a TOOL when:**

- Operation is atomic and deterministic
- Inputs/outputs can be JSON schema-defined
- Side effects are documentable and predictable
- No reasoning required—pure execution

**Make it a SKILL when:**

- Represents domain expertise, not execution
- Shapes _how_ the agent approaches problems
- Token efficiency matters (no schema overhead)
- Knowledge involves judgment, not just action

**Make it a COMMAND when:**

- Must be explicitly triggered by user
- Requires authorization before execution
- Clear entry point to larger workflow
- Maps directly to expressed user intent

**Make it a WORKFLOW when:**

- Steps are predetermined and consistent
- Execution must be predictable and debuggable
- State management spans multiple steps
- No dynamic decision-making needed

**Delegate to AGENT reasoning when:**

- Task requires dynamic tool selection
- Outcome depends on intermediate results
- Must adapt to unexpected situations
- Multi-step reasoning with feedback loops

### Design criteria checklist

| Criteria               | Tool       | Skill | Command | Workflow   | Agent     |
| ---------------------- | ---------- | ----- | ------- | ---------- | --------- |
| Determinism            | High       | N/A   | Medium  | High       | Low       |
| Human trigger required | No         | No    | Yes     | Sometimes  | Sometimes |
| Side effects           | Documented | None  | Depends | Aggregated | Depends   |
| Reusability            | High       | High  | Medium  | Medium     | Low       |
| Planning required      | None       | None  | Defined | Predefined | Dynamic   |

## Anti-patterns destroy maintainability

### Skill spaghetti and command proliferation

Creating too many granular commands with overlapping purposes—`create_file`, `write_file`, `save_file`—causes agents to thrash between similar tools. **Limit to 15 or fewer tools with distinct, non-overlapping purposes.** Each command should have unique objectives and clear ownership of outputs. Run simulation tests to detect role collision.

### Agent-does-everything syndrome

Over-relying on LLM reasoning for deterministic tasks—calculations, validations, database operations—produces unreliable results. LLMs struggle with counting, math, and rule-based logic. **Deterministic rules belong in deterministic code; agents provide reasoning where it matters.**

### Prompt pollution degrades performance

As instructions pile up, model adherence to each drops significantly. A well-organized **50-word prompt often outperforms a rambling 500-word prompt**. Use hierarchical context, feed only relevant sections, and apply context compaction for long sessions.

### Guard rails enforce boundaries

```yaml
boundaries:
  always_do:
    - "Run tests before commits"
    - "Follow naming conventions"
    - "Validate inputs before tool calls"

  ask_first:
    - "Database schema modifications"
    - "Adding new dependencies"
    - "Creating files outside project"

  never_do:
    - "Commit secrets or API keys"
    - "Edit node_modules/ or vendor/"
    - "Execute code from untrusted sources"
```

## Command specification template

```yaml
command:
  name: "create-issue"
  version: "1.0.0"

  description: |
    Creates a GitHub issue with proper labeling, milestone
    assignment, and linked branch creation.

  parameters:
    required:
      - name: "title"
        type: "string"
        description: "Issue title following conventional format"
        validation: "Must start with type prefix (feat:, fix:, etc.)"

    optional:
      - name: "milestone"
        type: "string"
        default: null
        description: "Target milestone name"

  returns:
    schema:
      issue_number: { type: integer }
      issue_url: { type: string }
      branch_name: { type: string, nullable: true }

  errors:
    - code: "INVALID_TITLE"
      condition: "Title missing type prefix"
      recoverable: true

    - code: "MILESTONE_NOT_FOUND"
      condition: "Specified milestone doesn't exist"
      recoverable: true

  side_effects:
    - type: "github_api"
      action: "create_issue"
      reversible: true # Can close/delete issue

  safety:
    always: ["Validate title format", "Check milestone exists"]
    ask_first: ["Assign to other users"]
    never: ["Create issues in repos without permission"]
```

## Skill specification template

```yaml
skill:
  name: "code-review"
  version: "1.0.0"

  description: |
    Reviews code for security vulnerabilities, performance
    issues, and style violations. Provides actionable feedback.

  triggers:
    - pattern: "User asks to review code or PR"
      confidence_required: 0.85

  workflow:
    1: { action: "Analyze code structure", tool: "file_read" }
    2: { action: "Check for security issues", tool: "reasoning" }
    3: { action: "Evaluate performance", tool: "reasoning" }
    4: { action: "Generate report", tool: "reasoning" }

  constraints:
    - "Focus on substantive issues, not style nitpicks"
    - "Provide specific line references"
    - "Suggest fixes, not just problems"

  commands_used: ["read_file", "search_codebase"]

  memory:
    scope: "session"
    retention:
      - key: "reviewed_files"
        purpose: "Avoid re-reviewing unchanged files"
        ttl: "end_of_session"

  success_criteria:
    - "All high-severity issues identified"
    - "Each issue includes remediation guidance"
```

## Agent specification template

```yaml
agent:
  name: "pr-workflow-agent"
  role: "Manages end-to-end PR lifecycle"

  capabilities:
    skills: ["code-review", "testing", "documentation"]
    tools: ["gh_cli", "file_operations", "git_commands"]

    can:
      - "Create branches linked to issues"
      - "Stage and commit changes atomically"
      - "Create draft PRs with proper linking"

    cannot:
      - "Merge PRs without approval"
      - "Delete branches with open PRs"
      - "Access private repositories not configured"

  autonomy:
    max_steps: 15
    timeout_seconds: 300

    autonomous: ["Read files", "Run tests", "Create drafts"]
    requires_approval: ["Push to remote", "Request reviews"]
    prohibited: ["Force push", "Merge to main"]

  error_handling:
    retry_policy:
      max_attempts: 3
      backoff: "exponential"

    fallback_chain:
      - "Retry with simplified approach"
      - "Save progress and request human guidance"
```

## Testing AI commands requires semantic evaluation

Traditional assertions fail with non-deterministic LLM outputs. Instead, use **threshold-based semantic evaluation**:

```python
def test_issue_creation_command():
    result = run_command("create-issue", {"title": "feat: Add auth"})

    # Semantic correctness evaluation
    assert result.issue_number > 0
    assert "feat" in result.issue_url
    assert result.branch_name.startswith("feature/")

    # LLM-as-judge for generated content
    quality_score = evaluate_with_llm(
        criteria="Issue body is clear, actionable, and complete",
        actual=result.body,
        threshold=0.8
    )
    assert quality_score >= 0.8
```

Run tests multiple times to detect flaky behavior. Use snapshot testing to capture baseline outputs and detect regressions. Mock external tools to isolate command logic from API variability.

## Practical workflow implementation

A complete AI-assisted PR workflow combining these patterns:

```bash
#!/bin/bash
# Workflow: Issue → Branch → Work → Atomic Commits → Draft PR

ISSUE_NUM=$1

# 1. Create linked branch
gh issue develop "$ISSUE_NUM" --checkout

# 2. AI makes changes (separate commits by purpose)
git add src/feature.ts
git commit -m "feat(feature): add core implementation

Implements the main logic for #$ISSUE_NUM"

git add src/feature.test.ts
git commit -m "test(feature): add unit tests"

git add docs/feature.md
git commit -m "docs(feature): update documentation"

# 3. Create draft PR with issue link
gh pr create --draft \
  --title "feat: implement feature #$ISSUE_NUM" \
  --body "Closes #$ISSUE_NUM

## Summary
AI-assisted implementation following project conventions.

## Changes
- Core implementation with error handling
- Unit tests with 90% coverage
- Updated documentation"

# 4. Run checks, then mark ready
gh run watch --exit-status
gh pr ready
```

This architecture—clear abstraction layers, explicit boundaries, proper error handling, and atomic operations—produces maintainable AI coding workflows that scale from simple commands to complex multi-agent systems.
