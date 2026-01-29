---
title: "Module 6: Anti-patterns & Best Practices"
description: "12 common anti-patterns in AI agent architecture with prevention strategies and organizational guardrails to implement"
type: tutorial
tags: [AI, Architecture, BestPractice]
order: 6
depends_on: [./05-examples.md]
related: [./06-anti-patterns.ko.md]
---

# Module 6: Anti-patterns & Best Practices

> Common mistakes to avoid and guardrails to implement

## Learning Objectives

By the end of this module, you will:
- Recognize the 12 most common anti-patterns
- Know how to prevent each anti-pattern
- Implement guardrails for your organization

---

## 6.1 The 12 Anti-patterns

### Overview

| # | Anti-pattern | Risk Level | Common Cause |
|---|--------------|------------|--------------|
| 1 | Skill Spaghetti | High | No governance |
| 2 | Command Overuse | Medium | Over-engineering |
| 3 | Agent Omnipotence | High | Lazy design |
| 4 | Unbounded Tools | Critical | No security review |
| 5 | Hallucination Tolerance | High | No verification |
| 6 | NIH Syndrome | Medium | Poor discoverability |
| 7 | Context Overflow | High | No limits |
| 8 | Ignoring Failures | Critical | Happy path thinking |
| 9 | No Testing | High | "It's just prompts" |
| 10 | Poor Observability | High | No monitoring |
| 11 | Versioning Chaos | Medium | No process |
| 12 | Poor Documentation | Medium | Time pressure |

---

## 6.2 Anti-pattern Details

### 1. Skill Spaghetti

**Symptoms:**
- Dozens of skills with overlapping purposes
- Skills like `DBQuery` and `Database` both exist
- One skill does too many things
- Agent loads wrong skills
- Duplicate content across skills

**Prevention:**

```yaml
guardrails:
  - name: "Skill Registry"
    action: "Maintain catalog of all skills with clear purposes"
    
  - name: "Domain Boundaries"
    action: "Each skill owns one domain. No overlaps."
    
  - name: "Size Limits"
    action: "Skill SKILL.md < 500 lines. Split if larger."
    
  - name: "Trigger Clarity"
    action: "Clear USE WHEN / DO NOT USE in every skill"
    
  - name: "Periodic Review"
    action: "Quarterly: consolidate duplicates, archive unused"
```

**Example Fix:**
```
Before:
  skills/db-query/
  skills/database-access/
  skills/sql-helper/
  
After:
  skills/database/
    ├── SKILL.md
    └── workflows/
        ├── query.md
        ├── migrate.md
        └── backup.md
```

---

### 2. Command Overuse

**Symptoms:**
- `/create-class`, `/create-interface`, `/create-enum` (separate commands)
- Users can't remember all commands
- Commands overlap with what agents can auto-handle
- Commands that are just thin wrappers around skills with no tool restrictions

**Prevention:**

```yaml
guardrails:
  - name: "Command Justification"
    action: "Before creating a command, ask: Does this need allowed-tools? 
             If not, just use the skill directly."
    
  - name: "Command Limit"
    action: "Max 10-15 commands per project"
    
  - name: "Consolidation"
    action: "Similar commands → single command with parameters"
    
  - name: "Auto vs Manual"
    action: "If agent can handle automatically, don't make command"
    
  - name: "Wrapper Test"
    action: "If removing the command and using @skill directly works 
             identically, the command is unnecessary"
    
review_checklist:
  - "Does this command use allowed-tools to restrict tool access?"
  - "Is this a dangerous/irreversible operation?"
  - "Does it need structured $ARGUMENTS?"
  - "Can it be combined with existing command?"
  - "Could the skill be invoked directly via @path instead?"
```

**Example Fix:**
```
Before (unnecessary command wrapper):
  /organize-skill              ← Just calls the skill with no tool restrictions
  
After (direct skill invocation):
  @meta-structure-organizer    ← Skill invoked directly, no command needed

Before (too many similar commands):
  /build-api
  /build-ui
  /build-worker
  
After (consolidated with parameters):
  /build [component]
  # /build api
  # /build ui
  # /build worker
```

> **Rule of thumb**: If a Command doesn't use `allowed-tools`, doesn't guard dangerous ops, and doesn't need `$ARGUMENTS` — it's probably an unnecessary wrapper. Just use the Skill directly.

---

### 3. Agent Omnipotence

**Symptoms:**
- One agent does everything (code, docs, deploy, design)
- Agent prompt is 1000+ lines
- Too many tools/skills loaded
- Unpredictable behavior

**Prevention:**

```yaml
guardrails:
  - name: "Single Responsibility"
    action: "One agent = one clear role"
    
  - name: "Prompt Size Limit"
    action: "System prompt < 400 lines. Use skills for knowledge."
    
  - name: "Permission Scoping"
    action: "Each agent gets only needed tools/permissions"
    
  - name: "Sub-agent Pattern"
    action: "Complex tasks → orchestrator + specialized sub-agents"
```

**Example Fix:**
```
Before:
  mega-agent (does everything)
  
After:
  orchestrator-agent
    ├── code-agent
    ├── test-agent
    ├── docs-agent
    └── deploy-agent
```

---

### 4. Unbounded Tool Usage

**Symptoms:**
- Agent can delete any file
- No confirmation for dangerous actions
- API calls without rate limits
- Tool failures crash the system

**Prevention:**

```yaml
tool_safety:
  whitelist:
    - file_read: { scope: "project directory only" }
    - file_write: { scope: "src/ and tests/ only" }
    
  confirmation_required:
    - delete_file: "Confirm: Delete {path}?"
    - deploy: "Deploy to {env}. Proceed?"
    - database_write: "This will modify production data. Sure?"
    
  rate_limits:
    - api_call: "10 per minute"
    - file_write: "50 per session"
    
  error_handling:
    format: '{"status": "error", "code": "X", "message": "..."}'
    retry: 3
    fallback: "Ask user for help"
```

---

### 5. Hallucination Tolerance

**Symptoms:**
- Agent makes up information confidently
- No source citations
- Wrong facts in bug explanations
- Users can't verify claims

**Prevention:**

```yaml
guardrails:
  - name: "Ask When Unsure"
    rule: "If confidence < 80%, ask user rather than guess"
    
  - name: "Cite Sources"
    rule: "Knowledge-based answers must cite file:line or doc"
    
  - name: "Verification Step"
    rule: "Verify with tool before claiming facts"
    
  - name: "Human Review"
    rule: "Critical decisions require human confirmation"

system_prompt_addition: |
  IMPORTANT: Never guess. If unsure:
  1. Say "I'm not certain, but..."
  2. Cite where information comes from
  3. Suggest how to verify
```

---

### 6. Not-Invented-Here (NIH) Syndrome

**Symptoms:**
- Duplicating existing skills in new agents
- Creating new commands instead of using existing
- Same logic in multiple places
- Maintenance nightmare

**Prevention:**

```yaml
guardrails:
  - name: "Skill Catalog"
    action: "Searchable registry of all skills"
    
  - name: "Code Review Check"
    question: "Could we use existing skill X instead?"
    
  - name: "Usage Metrics"
    action: "Track skill usage. Promote or remove unused."
    
process:
  before_creating_new:
    1. Search existing skills
    2. Check if enhancement better than new creation
    3. Discuss with team
```

---

### 7. Context Overflow

**Symptoms:**
- Agent loads too many skills at once
- Conversation history explodes
- "Context limit exceeded" errors
- High costs, slow responses

**Prevention:**

```yaml
guardrails:
  - name: "Lazy Loading"
    action: "Load skill description first, full content only when needed"
    
  - name: "Context Trimming"
    action: "Auto-summarize at 75% context usage"
    
  - name: "Skill Count Limit"
    action: "Max 3 skills loaded per request"
    
  - name: "Sub-agent Delegation"
    action: "Large info processing → separate sub-agent context"
    
  - name: "Cost Monitoring"
    action: "Alert when token usage exceeds threshold"
```

**Example:**
```
Bad: Load all 10 skills immediately
Good: Load skill descriptions → Select 2-3 relevant → Load full content
```

---

### 8. Ignoring Failure Paths

**Symptoms:**
- Only happy path designed
- No retry logic
- Errors cause silent failures
- No rollback plan

**Prevention:**

```yaml
design_checklist:
  for_each_step:
    - "What if this fails?"
    - "How do we detect failure?"
    - "What's the recovery action?"
    - "Do we need rollback?"
    
error_handling_template:
  detection: "How to know it failed"
  response: "What to do"
  user_message: "What to tell user"
  logging: "What to record"
  
standard_responses:
  timeout: "Operation timed out. Partial progress saved. Retry?"
  tool_error: "X tool failed: {reason}. Trying alternative..."
  unrecoverable: "Cannot proceed. Here's what was accomplished..."
```

---

### 9. Lack of Testing

**Symptoms:**
- "It's just prompts, what's to test?"
- Edge cases cause failures
- Version updates break scenarios
- No regression detection

**Prevention:**

```yaml
testing_requirements:
  unit:
    - "Command X with input Y produces output Z"
    - "Skill loads without errors"
    - "Skill triggers on correct keywords"
    
  integration:
    - "Full workflow from input to output"
    - "Error scenarios handled correctly"
    
  regression:
    - "Previous bugs stay fixed"
    - "Version updates don't break workflows"
    
ci_integration:
  - "Run tests on every PR"
  - "Block merge if tests fail"
  - "Track test coverage"
```

---

### 10. Poor Observability

**Symptoms:**
- Can't debug production issues
- Don't know which skills are used
- No performance metrics
- Can't identify slow steps

**Prevention:**

```yaml
logging_standard:
  format: "[LEVEL][COMPONENT][TRACE_ID] action=X result=Y time=Z"
  
  required_events:
    - Command invocation
    - Skill loading
    - Tool calls (with args)
    - Errors (with stack)
    - Completion status
    
metrics_to_track:
  - success_rate
  - avg_response_time
  - error_rate_by_type
  - skill_usage_counts
  - tool_failure_rates
  
alerting:
  - "Error rate > 5% → PagerDuty"
  - "Response time > 30s → Slack"
  - "Usage anomaly → Email"
```

---

### 11. Versioning Chaos

**Symptoms:**
- Different users get different behavior
- Breaking changes surprise everyone
- Rollback is impossible
- "It works on my machine"

**Prevention:**

```yaml
versioning_policy:
  format: "semver (major.minor.patch)"
  
  when_to_increment:
    major: "Breaking changes (input/output format changes)"
    minor: "New features (backward compatible)"
    patch: "Bug fixes"
    
  process:
    1. Update version in metadata
    2. Update CHANGELOG.md
    3. Test compatibility with dependent components
    4. Announce to team
    5. Gradual rollout (internal → beta → production)
    
  rollback:
    - Keep previous versions available
    - Tag releases in git
    - Document rollback procedure
```

---

### 12. Poor Documentation

**Symptoms:**
- Skills with no description
- Ambiguous names (`MiscSkill`, `HelperAgent`)
- No usage examples
- New team members lost

**Prevention:**

```yaml
documentation_requirements:
  skills:
    - Clear USE WHEN / DO NOT USE
    - Workflow routing table
    - Example inputs/outputs
    
  commands:
    - Parameter descriptions
    - Usage examples
    - Error scenarios
    
  agents:
    - Goal statement
    - Capability list
    - Workflow diagram
    
naming_conventions:
  allowed: "Descriptive names (code-review, deploy-agent)"
  forbidden: "Generic names (Misc, Helper, Test, Util)"
  
onboarding:
  - README with architecture overview
  - Diagram of component relationships
  - Getting started guide
```

---

## 6.3 Guardrails Implementation Checklist

### For Your Team

```markdown
## Pre-Launch Checklist

### Design Phase
- [ ] Component follows decision tree
- [ ] No overlap with existing components
- [ ] Clear boundaries defined
- [ ] Error scenarios documented

### Implementation Phase
- [ ] Follows naming conventions
- [ ] Documentation complete
- [ ] Tests written
- [ ] Logging implemented

### Review Phase
- [ ] Code review completed
- [ ] Security review (for tool access)
- [ ] Anti-pattern check passed
- [ ] Version documented

### Deployment Phase
- [ ] Staged rollout plan
- [ ] Rollback procedure documented
- [ ] Monitoring configured
- [ ] Team notified
```

### Anti-pattern Quick Check

Ask these questions for every new component:

| Question | If NO → |
|----------|---------|
| Is the name descriptive? | Rename |
| Is there existing component for this? | Reuse |
| Are error cases handled? | Add handling |
| Is it tested? | Add tests |
| Is it documented? | Add docs |
| Can it be abused? | Add safeguards |

---

## 6.4 1-Week Implementation Plan

### Day-by-Day Schedule

| Day | Focus | Tasks |
|-----|-------|-------|
| **1** | Environment Setup | Define LLM, tools, permissions. Create skill/command registry. |
| **2** | Classification | List existing workflows. Classify as Command/Skill/Agent candidates. |
| **3-4** | Skeleton Build | Create folder structure. Write 2-3 core components using templates. |
| **5** | Tool Integration | Connect actual tools. End-to-end testing. |
| **6** | Review | Team review. Anti-pattern check. Pilot with small group. |
| **7** | Documentation | Write README. Share with team. Collect feedback. |

### Ongoing Practices

```yaml
weekly:
  - Review metrics dashboard
  - Triage error alerts
  - Update documentation
  
monthly:
  - Skill usage review (consolidate/archive)
  - Security review of tool access
  - Performance optimization
  
quarterly:
  - Full anti-pattern audit
  - Team training refresh
  - Dependency updates
```

---

## Key Takeaways

1. **Anti-patterns are predictable** - Most teams make the same mistakes
2. **Guardrails prevent disasters** - Implement them proactively
3. **Checklists work** - Use them at design, review, and deploy
4. **Monitoring is essential** - You can't fix what you can't see
5. **Documentation is investment** - Future you will thank present you

---

## Course Summary

Congratulations! You've completed the AI Agent Architecture course.

### What You've Learned

| Module | Key Concepts |
|--------|--------------|
| 1. Fundamentals | Two-layer architecture: Skill & Agent (core) + Command (optional wrapper) |
| 2. Relationships | Hierarchy, contracts, and layer interactions |
| 3. Decision Framework | Two-phase decision: core type first, then Command wrapper if needed |
| 4. Templates | Ready-to-use specification formats |
| 5. Examples | Real-world implementations |
| 6. Anti-patterns | Common mistakes and how to avoid them |

### Next Steps

1. **Apply immediately** - Pick one workflow to implement
2. **Start simple** - One command or skill first
3. **Iterate** - Improve based on real usage
4. **Share** - Teach your team what you learned

---

## Resources

- [Research Prompt](../research/00-research-prompt.md) - Original meta-prompt for research
- [Claude Research](../research/01-claude.md) - Claude's research response
- [GPT Research](../research/02-gpt/) - GPT's comprehensive research response (6 parts)
- [Extracted Skill](../../../.claude/skills/meta-structure-organizer/) - Practical skill for component decisions
