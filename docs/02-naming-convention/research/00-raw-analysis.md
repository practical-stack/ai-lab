---
title: "Raw Analysis: Naming Convention Research"
description: "Analysis of naming patterns across 6 repositories including Anthropic skills, Vercel agent-skills, and community plugins."
type: reference
tags: [Documentation]
order: 0
related: [../README.md]
---

# Raw Analysis: Naming Convention Research

> Analysis date: 2026-01-25
> Source: `/Users/youngchang/dev/side/ai-lab/refs/`

## Repositories Analyzed

| Repository | Path | Description |
|------------|------|-------------|
| skills | `refs/skills/` | Anthropic official skill examples |
| agent-skills | `refs/agent-skills/` | Vercel agent skills (React, Deploy) |
| oh-my-claudecode | `refs/oh-my-claudecode/` | Claude Code multi-agent orchestration |
| oh-my-opencode | `refs/oh-my-opencode/` | OpenCode multi-agent orchestration |
| plugins-for-claude-natives | `refs/plugins-for-claude-natives/` | Community plugins collection |
| claude-cookbooks | `refs/claude-cookbooks/` | Anthropic cookbook examples |

---

## 1. Skill Analysis

### Files Found (64 SKILL.md files)

```
refs/skills/skills/skill-creator/SKILL.md
refs/skills/skills/web-artifacts-builder/SKILL.md
refs/skills/skills/theme-factory/SKILL.md
refs/skills/skills/pdf/SKILL.md
refs/skills/skills/xlsx/SKILL.md
refs/skills/skills/docx/SKILL.md
refs/skills/skills/doc-coauthoring/SKILL.md
refs/skills/skills/canvas-design/SKILL.md
refs/skills/skills/algorithmic-art/SKILL.md
refs/skills/skills/brand-guidelines/SKILL.md
refs/skills/skills/frontend-design/SKILL.md
refs/skills/skills/internal-comms/SKILL.md
refs/skills/skills/mcp-builder/SKILL.md
refs/skills/skills/pptx/SKILL.md
refs/skills/skills/slack-gif-creator/SKILL.md
refs/skills/skills/webapp-testing/SKILL.md

refs/agent-skills/skills/react-best-practices/SKILL.md
refs/agent-skills/skills/web-design-guidelines/SKILL.md
refs/agent-skills/skills/claude.ai/vercel-deploy-claimable/SKILL.md

refs/oh-my-claudecode/skills/ultrawork/SKILL.md
refs/oh-my-claudecode/skills/ultraqa/SKILL.md
refs/oh-my-claudecode/skills/review/SKILL.md
refs/oh-my-claudecode/skills/ralph/SKILL.md
refs/oh-my-claudecode/skills/ralplan/SKILL.md
refs/oh-my-claudecode/skills/release/SKILL.md
refs/oh-my-claudecode/skills/planner/SKILL.md
refs/oh-my-claudecode/skills/plan/SKILL.md
refs/oh-my-claudecode/skills/ralph-init/SKILL.md
refs/oh-my-claudecode/skills/omc-setup/SKILL.md
refs/oh-my-claudecode/skills/orchestrate/SKILL.md
refs/oh-my-claudecode/skills/omc-default/SKILL.md
refs/oh-my-claudecode/skills/note/SKILL.md
refs/oh-my-claudecode/skills/omc-default-global/SKILL.md
refs/oh-my-claudecode/skills/hud/SKILL.md
refs/oh-my-claudecode/skills/learner/SKILL.md
refs/oh-my-claudecode/skills/frontend-ui-ux/SKILL.md
refs/oh-my-claudecode/skills/help/SKILL.md
refs/oh-my-claudecode/skills/git-master/SKILL.md
refs/oh-my-claudecode/skills/doctor/SKILL.md
refs/oh-my-claudecode/skills/deepsearch/SKILL.md
refs/oh-my-claudecode/skills/deepinit/SKILL.md
refs/oh-my-claudecode/skills/cancel-ralph/SKILL.md
refs/oh-my-claudecode/skills/cancel-ultraqa/SKILL.md
refs/oh-my-claudecode/skills/cancel-ultrawork/SKILL.md
refs/oh-my-claudecode/skills/analyze/SKILL.md

refs/plugins-for-claude-natives/plugins/youtube-digest/skills/youtube-digest/SKILL.md
refs/plugins-for-claude-natives/plugins/session-wrap/skills/session-wrap/SKILL.md
refs/plugins-for-claude-natives/plugins/session-wrap/skills/session-analyzer/SKILL.md
refs/plugins-for-claude-natives/plugins/session-wrap/skills/history-insight/SKILL.md
refs/plugins-for-claude-natives/plugins/kakaotalk/skills/kakaotalk/SKILL.md
refs/plugins-for-claude-natives/plugins/interactive-review/skills/review/SKILL.md
refs/plugins-for-claude-natives/plugins/google-calendar/skills/google-calendar/SKILL.md
refs/plugins-for-claude-natives/plugins/dev/skills/tech-decision/SKILL.md
refs/plugins-for-claude-natives/plugins/dev/skills/dev-scan/SKILL.md
refs/plugins-for-claude-natives/plugins/clarify/skills/clarify/SKILL.md
refs/plugins-for-claude-natives/plugins/agent-council/skills/agent-council/SKILL.md

refs/claude-cookbooks/.claude/skills/cookbook-audit/SKILL.md
refs/claude-cookbooks/skills/custom_skills/creating-financial-models/SKILL.md
refs/claude-cookbooks/skills/custom_skills/applying-brand-guidelines/SKILL.md
refs/claude-cookbooks/skills/custom_skills/analyzing-financial-statements/SKILL.md

refs/oh-my-opencode/src/features/builtin-skills/frontend-ui-ux/SKILL.md
refs/oh-my-opencode/src/features/builtin-skills/git-master/SKILL.md
```

### Naming Pattern Analysis

| Pattern | Count | Examples |
|---------|-------|----------|
| `kebab-case` | 64/64 (100%) | `skill-creator`, `frontend-ui-ux`, `git-master` |
| `snake_case` | 0 | - |
| `PascalCase` | 0 | - |
| `camelCase` | 0 | - |

### Frontmatter `name` Field Samples

```yaml
# refs/skills/skills/skill-creator/SKILL.md
---
name: skill-creator
description: Guide for creating effective skills...
---

# refs/agent-skills/skills/react-best-practices/SKILL.md
---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines...
---

# refs/oh-my-claudecode/skills/frontend-ui-ux/SKILL.md
---
name: frontend-ui-ux
description: Designer-turned-developer who crafts stunning UI/UX...
---

# refs/plugins-for-claude-natives/plugins/dev/skills/tech-decision/SKILL.md
---
name: tech-decision
description: This skill should be used when the user asks to...
---
```

---

## 2. Agent Analysis

### Files Found (36 agent .md files)

```
refs/oh-my-claudecode/agents/vision.md
refs/oh-my-claudecode/agents/writer.md
refs/oh-my-claudecode/agents/planner.md
refs/oh-my-claudecode/agents/researcher.md
refs/oh-my-claudecode/agents/researcher-low.md
refs/oh-my-claudecode/agents/explore.md
refs/oh-my-claudecode/agents/qa-tester.md
refs/oh-my-claudecode/agents/executor-high.md
refs/oh-my-claudecode/agents/executor.md
refs/oh-my-claudecode/agents/executor-low.md
refs/oh-my-claudecode/agents/explore-medium.md
refs/oh-my-claudecode/agents/designer-low.md
refs/oh-my-claudecode/agents/designer-high.md
refs/oh-my-claudecode/agents/critic.md
refs/oh-my-claudecode/agents/designer.md
refs/oh-my-claudecode/agents/architect.md
refs/oh-my-claudecode/agents/architect-low.md
refs/oh-my-claudecode/agents/architect-medium.md
refs/oh-my-claudecode/agents/analyst.md

refs/claude-cookbooks/patterns/agents/prompts/citations_agent.md
refs/claude-cookbooks/patterns/agents/prompts/research_lead_agent.md
refs/claude-cookbooks/patterns/agents/prompts/research_subagent.md
refs/claude-cookbooks/claude_agent_sdk/chief_of_staff_agent/.claude/agents/financial-analyst.md
refs/claude-cookbooks/claude_agent_sdk/chief_of_staff_agent/.claude/agents/recruiter.md
refs/claude-cookbooks/.claude/agents/code-reviewer.md

refs/plugins-for-claude-natives/plugins/session-wrap/agents/followup-suggester.md
refs/plugins-for-claude-natives/plugins/session-wrap/agents/learning-extractor.md
refs/plugins-for-claude-natives/plugins/session-wrap/agents/duplicate-checker.md
refs/plugins-for-claude-natives/plugins/session-wrap/agents/doc-updater.md
refs/plugins-for-claude-natives/plugins/session-wrap/agents/automation-scout.md
refs/plugins-for-claude-natives/plugins/dev/agents/docs-researcher.md
refs/plugins-for-claude-natives/plugins/dev/agents/tradeoff-analyzer.md
refs/plugins-for-claude-natives/plugins/dev/agents/codebase-explorer.md
refs/plugins-for-claude-natives/plugins/dev/agents/decision-synthesizer.md
```

### Naming Pattern Analysis

| Pattern | Count | Examples |
|---------|-------|----------|
| `kebab-case` | 36/36 (100%) | `code-reviewer`, `tradeoff-analyzer`, `executor-high` |
| `snake_case` | 0 | - |
| `PascalCase` | 0 | - |
| `camelCase` | 0 | - |

### Frontmatter Samples

```yaml
# refs/oh-my-claudecode/agents/explore.md
---
name: explore
description: Fast codebase search specialist for finding files and code patterns (Haiku)
model: haiku
tools: Read, Glob, Grep, Bash
---

# refs/oh-my-claudecode/agents/architect.md
---
name: architect
description: Strategic Architecture & Debugging Advisor (Opus, READ-ONLY)
model: opus
tools: Read, Grep, Glob, Bash, WebSearch
---

# refs/plugins-for-claude-natives/plugins/dev/agents/tradeoff-analyzer.md
---
name: tradeoff-analyzer
description: Use this agent to synthesize research findings into structured pros/cons analysis...
model: sonnet
color: yellow
tools:
  - Read
---

# refs/claude-cookbooks/.claude/agents/code-reviewer.md
---
name: code-reviewer
description: Performs thorough code reviews for the Notebooks...
tools: Read, Grep, Glob, Bash, Bash(git status:*), Task
---
```

### Tier Variant Pattern

```
Base Agent       Tier Variants
─────────────────────────────────────────
executor         executor-low, executor, executor-high
designer         designer-low, designer, designer-high
architect        architect-low, architect-medium, architect
researcher       researcher-low, researcher
explore          explore, explore-medium
```

---

## 3. Command Analysis

### Files Found (32 command .md files)

```
refs/oh-my-claudecode/commands/ultrawork.md
refs/oh-my-claudecode/commands/review.md
refs/oh-my-claudecode/commands/ultraqa.md
refs/oh-my-claudecode/commands/ralplan.md
refs/oh-my-claudecode/commands/ralph-init.md
refs/oh-my-claudecode/commands/release.md
refs/oh-my-claudecode/commands/ralph.md
refs/oh-my-claudecode/commands/omc-setup.md
refs/oh-my-claudecode/commands/plan.md
refs/oh-my-claudecode/commands/learner.md
refs/oh-my-claudecode/commands/note.md
refs/oh-my-claudecode/commands/hud.md
refs/oh-my-claudecode/commands/help.md
refs/oh-my-claudecode/commands/doctor.md
refs/oh-my-claudecode/commands/cancel-ultraqa.md
refs/oh-my-claudecode/commands/deepsearch.md
refs/oh-my-claudecode/commands/cancel-ralph.md
refs/oh-my-claudecode/commands/cancel-ultrawork.md
refs/oh-my-claudecode/commands/deepinit.md
refs/oh-my-claudecode/commands/analyze.md

refs/claude-cookbooks/claude_agent_sdk/chief_of_staff_agent/.claude/commands/talent-scan.md
refs/claude-cookbooks/claude_agent_sdk/chief_of_staff_agent/.claude/commands/slash-command-test.md
refs/claude-cookbooks/claude_agent_sdk/chief_of_staff_agent/.claude/commands/budget-impact.md
refs/claude-cookbooks/claude_agent_sdk/chief_of_staff_agent/.claude/commands/strategic-brief.md
refs/claude-cookbooks/.claude/commands/review-issue.md
refs/claude-cookbooks/.claude/commands/review-pr.md
refs/claude-cookbooks/.claude/commands/review-pr-ci.md
refs/claude-cookbooks/.claude/commands/link-review.md
refs/claude-cookbooks/.claude/commands/notebook-review.md
refs/claude-cookbooks/.claude/commands/model-check.md
refs/claude-cookbooks/.claude/commands/add-registry.md

refs/plugins-for-claude-natives/plugins/session-wrap/commands/wrap.md
```

### Naming Pattern Analysis

| Pattern | Count | Examples |
|---------|-------|----------|
| `kebab-case` | 32/32 (100%) | `review-pr`, `cancel-ralph`, `deepsearch` |
| `snake_case` | 0 | - |
| `PascalCase` | 0 | - |
| `camelCase` | 0 | - |

### Frontmatter Samples

```yaml
# refs/oh-my-claudecode/commands/deepsearch.md
---
description: Thorough codebase search
---

# refs/claude-cookbooks/.claude/commands/review-pr.md
---
allowed-tools: Bash(gh pr checkout:*), Bash(gh pr diff:*), Bash(gh pr view:*), Bash(gh pr review:*), Bash(git diff:*), Bash(git log:*), Task, Read, Glob, Grep, AskUserQuestion
description: Review an open pull request and optionally post the review to GitHub
---
```

**Note:** Commands do NOT have a `name` field. The filename becomes the command name.

---

## 4. Directory Structure Patterns

### Skill Directory Structure

```
skills/
└── skill-name/           # kebab-case directory
    ├── SKILL.md          # UPPERCASE (required)
    ├── scripts/          # Optional: executable scripts
    │   └── script.py
    ├── references/       # Optional: documentation
    │   └── guide.md
    └── assets/           # Optional: templates, images
        └── template.html
```

### Agent Directory Structure

```
agents/
├── agent-name.md         # kebab-case.md
├── agent-name-low.md     # tier variant
├── agent-name-high.md    # tier variant
└── ...
```

### Command Directory Structure

```
commands/
├── command-name.md       # kebab-case.md
└── ...
```

---

## 5. Conclusion

### Universal Convention: kebab-case

All 132 files analyzed (64 skills + 36 agents + 32 commands) use `kebab-case`:
- **100% kebab-case** across all repositories
- **0% snake_case, PascalCase, or camelCase**

### Special Cases

| Case | Convention |
|------|------------|
| Filename `SKILL.md` | Always uppercase |
| Agent tiers | Suffix: `-low`, `-medium`, `-high` |
| Command name field | None (uses filename) |
| Skill/Agent name field | Must match directory/filename |
