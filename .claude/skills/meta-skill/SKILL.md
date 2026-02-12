---
name: meta-skill
description: |
  Guide for creating and validating AI agent skills based on Anthropic's official skill specification.
  Use when user asks to create a new skill, update an existing skill, validate skills,
  or needs guidance on skill architecture and best practices.

  USE WHEN:
  - "create a skill", "new skill", "make a skill", "skill template"
  - "validate skill", "check skill", "organize skill", "skill audit"

  DO NOT USE WHEN:
  - Creating agents (use meta-agent)
  - Creating commands (use meta-command)
---

# Meta-Skill Creator

Create and validate skills for AI agents following Anthropic's official skill specification.

> **Output Language**: All generated skill content (SKILL.md, comments, documentation) in **English**.

## Core Principle: Concise is Key

The context window is a public good. Skills share it with system prompt, conversation history, other skills, and the user request.

**Default assumption: Claude is already very smart.** Only add context Claude doesn't already have. For each piece of content, ask: *"Does Claude really need this? Does this paragraph justify its token cost?"*

Prefer concise examples over verbose explanations. See [references/official-examples.md](references/official-examples.md) for how Anthropic's own skills demonstrate this — ranging from 33-line reference skills to 400-line generative skills, each sized appropriately for their domain.

## Workflow Routing

| Intent | Workflow |
|--------|----------|
| Create a new skill (full process) | [Phase-by-phase below](#skill-creation-workflow-7-phases) |
| Validate existing skill(s) | [workflows/validate-skill.md](workflows/validate-skill.md) |

## Quick Start

### Create a New Skill

```bash
bun scripts/init-skill.ts <skill-name> --path <output-directory>
# Example:
bun scripts/init-skill.ts my-awesome-skill --path .claude/skills
```

### Validate and Package

```bash
bun scripts/validate-skill.ts <skill-folder>
bun scripts/package-skill.ts <skill-folder> [output-dir]
```

## Skill Creation Workflow (7 Phases)

Follow these phases in order. Each phase has specific deliverables and exit criteria.

### Phase 1: UNDERSTAND

**Goal**: Define concrete use cases and trigger conditions.

**Questions to Ask**:
1. "What specific scenarios trigger this skill?"
2. "Can you provide 2-3 concrete use cases?" (with trigger, steps, result format)
3. "What keywords should activate this skill?"
4. "What inputs does it receive? What outputs does it produce?"
5. "What tools are needed (built-in or MCP)?"

**Use Case Format** (from Anthropic guide):
```text
Use Case: [Name]
Trigger: User says "[phrase]" or "[phrase]"
Steps:
  1. [Step with tool/MCP call if applicable]
  2. [Step]
Result: [Concrete outcome]
```

**Deliverables**:
- 2-3 concrete use cases in the format above
- Trigger condition list
- Expected input/output format

**Exit Criteria**: Clear understanding of skill purpose, trigger conditions, and use cases.

### Phase 2: PLAN

**Goal**: Design structure and identify reusable content.

**Content Type Decision**:

| Content Type | When to Include | Examples |
|-------------|-----------------|----------|
| `scripts/` | Repetitive code, deterministic operations | File processing, API calls, automation |
| `references/` | Detailed docs, schemas, lengthy guides | API docs, database schemas, workflow guides |
| `assets/` | Output templates, images, fonts | HTML templates, config files, boilerplate |

**Freedom Level Decision**:

| Level | When to Use | Implementation |
|-------|-------------|----------------|
| High | Multiple valid approaches | Text instructions only |
| Medium | Preferred pattern exists | Pseudocode or parameterized scripts |
| Low | Fragile operations, consistency critical | Specific scripts with minimal parameters |

**Skill Pattern Selection** (choose one):

| Pattern | Use When | Reference |
|---------|----------|-----------|
| Sequential Workflow | Multi-step processes in specific order | [references/skill-patterns.md](references/skill-patterns.md) |
| Multi-MCP Coordination | Workflows spanning multiple services | [references/skill-patterns.md](references/skill-patterns.md) |
| Iterative Refinement | Output quality improves with iteration | [references/skill-patterns.md](references/skill-patterns.md) |
| Context-Aware Selection | Same outcome, different tools depending on context | [references/skill-patterns.md](references/skill-patterns.md) |
| Domain-Specific Intelligence | Specialized knowledge beyond tool access | [references/skill-patterns.md](references/skill-patterns.md) |

**Deliverables**:
- Directory structure design
- Progressive Disclosure strategy
- Selected skill pattern

### Phase 3: INITIALIZE

**Goal**: Create skill directory and template files.

```bash
bun scripts/init-skill.ts <skill-name> --path <output-directory>
```

Creates:
```
skill-name/
├── SKILL.md              # Template with placeholders
├── scripts/
│   └── example.ts
├── references/
│   └── guide.md
└── assets/
    └── .gitkeep
```

**Post-init**: Delete unnecessary directories. Not all skills need all three resource types.

### Phase 4: IMPLEMENT

#### 4.1 Write Frontmatter

```yaml
---
name: skill-name                    # Required: kebab-case, max 64 chars, match dir name
description: [What it does] in natural prose. Use when [specific triggers/contexts].
  Supports [key capabilities]. Include trigger phrases naturally in the sentence
  flow — do NOT use structured labels like "USE WHEN:" or bullet lists.
# --- Optional fields ---
# license: MIT
# compatibility: Requires Node.js 18+
# allowed-tools: "Bash(python:*) WebFetch"   # Restrict tool access for security
---
```

**Description field rules** (see [references/frontmatter-spec.md](references/frontmatter-spec.md)):
- **Natural prose** — write 1-3 sentences, not structured labels or bullet lists
- Weave trigger phrases into natural sentences (e.g., "Use when users want to..." not `USE WHEN:\n- "keyword"`)
- Under 1024 characters
- No XML angle brackets (`<` or `>`)
- Add "Do NOT use for..." only if realistic confusion exists with similar skills
- See [references/official-examples.md](references/official-examples.md) for real Anthropic skill descriptions

**Security considerations**:
- No XML angle brackets in frontmatter (appears in system prompt — injection risk)
- No "claude" or "anthropic" in skill name (reserved by Anthropic)
- YAML uses safe parsing (no code execution)
- Use `allowed-tools` to restrict tool access when the skill should only use specific tools

See [references/frontmatter-spec.md](references/frontmatter-spec.md) for complete spec.

#### 4.2 Write SKILL.md Body

**Design the body structure around your skill's domain** — there is no one-size-fits-all template.
Study [references/official-examples.md](references/official-examples.md) for how Anthropic's own skills structure their bodies.

**Observed patterns from official skills**:

| Skill Domain | Body Structure |
|-------------|----------------|
| Creative (art, design) | Philosophy → Process → Technical Requirements → Resources |
| Tool-based (testing, MCP) | Decision Tree → Examples → Best Practices |
| Workflow (doc-coauthoring) | When to Offer → Stage 1 → Stage 2 → Stage 3 |
| Simple reference (brand, theme) | Overview → Details → Usage Instructions |
| Multi-step creation (skill-creator) | Core Principles → Anatomy → Step-by-step Process |

**Key principle**: Let the domain dictate the structure. A 33-line reference skill and a 400-line generative art skill should look nothing alike.

**Optional elements** (include only when they add value):
- **Workflow Routing table** — only if the skill has multiple distinct workflows (e.g., "create" vs "validate")
- **Examples section** — helpful for user-facing skills with trigger phrases
- **Troubleshooting section** — helpful for skills involving scripts or MCP integrations
- **Reference Files section** — when bundled resources exist in references/, scripts/, or assets/

**Writing best practices** (see [references/writing-guide.md](references/writing-guide.md)):
- Be specific and actionable (not "validate the data" but `run scripts/validate.py --input {file}`)
- Reference bundled resources clearly (`Before writing queries, consult references/api-patterns.md`)
- Put critical instructions at the top
- Match Degrees of Freedom to task fragility (see writing-guide.md)

**Output format guidance** (see [references/output-patterns.md](references/output-patterns.md)):
- **Strict template**: API contracts, data exports — use exact template with `ALWAYS` prefix
- **Flexible template**: Analysis, docs — template with "adjust as needed"
- **Examples pattern**: Style-sensitive output — provide 2-3 input/output pairs

#### 4.3 Implement Scripts (TypeScript/JavaScript)

- Test ALL scripts by actually running them
- Include helpful error messages
- Handle edge cases gracefully

#### 4.4 Write References

- Keep SKILL.md under 500 lines (under 5,000 words)
- Move detailed content to references/
- Always link references from SKILL.md

#### 4.5 Critical Rules

- **SKILL.md** must be exactly `SKILL.md` (case-sensitive)
- **Folder naming**: kebab-case only (`my-skill` not `My_Skill`)
- **No README.md** inside skill folder (documentation goes in SKILL.md or references/)
- **No deeply nested references** — keep 1 level deep

### Phase 5: VALIDATE

```bash
bun scripts/validate-skill.ts <skill-folder>
```

**Validation Checklist**:

| Category | Check | Requirement |
|----------|-------|-------------|
| Frontmatter | `name` field | kebab-case, max 64 chars, matches directory |
| Frontmatter | `description` field | [What] + [When], under 1024 chars, no XML brackets |
| Frontmatter | No reserved names | No "claude" or "anthropic" in name |
| Structure | SKILL.md exists | Exact case: `SKILL.md` |
| Structure | No README.md | Must not exist in skill folder |
| Structure | Line count | Under 500 lines (split to references if exceeded) |
| Content | No unresolved placeholders | All TODO markers resolved |
| Content | Examples section | Recommended if skill has user-facing triggers |
| Content | Error handling | Recommended if skill involves MCP/scripts |
| Scripts | Execution test | All scripts run without errors |
| References | Explicit links | All refs linked from SKILL.md |

See [workflows/validate-skill.md](workflows/validate-skill.md) for full validation workflow.

### Phase 6: TEST

**Goal**: Verify skill triggers correctly and produces expected output.

**6.1 Triggering Tests**:
```text
Should trigger:
- "[obvious trigger phrase 1]"
- "[paraphrased request]"
- "[alternative wording]"

Should NOT trigger:
- "[unrelated query 1]"
- "[similar but out-of-scope query]"
```

**6.2 Functional Tests**:
```text
Test: [Scenario name]
Given: [Input conditions]
When: Skill executes workflow
Then:
  - [Expected outcome 1]
  - [Expected outcome 2]
  - No errors
```

**6.3 Performance Comparison** (optional — for distribution/sharing):
- Compare same task WITH and WITHOUT skill
- Measure: tool calls, total tokens, user corrections needed
- Most useful when proving value to external users; skip for internal-only skills

See [references/testing-guide.md](references/testing-guide.md) for iteration signals and complete testing methodology.

### Phase 7: PACKAGE

```bash
bun scripts/package-skill.ts <skill-folder> [output-dir]
```

**Output**: `<skill-name>.skill` file (ZIP format with .skill extension)

**Post-Package**:
1. Test the packaged skill in target environment
2. Collect usage feedback
3. Iterate based on real usage (go back to Phase 6)

## Progressive Disclosure Patterns

| Level | When Loaded | Size Limit | Content |
|-------|-------------|------------|---------|
| 1 | Always | ~100 words | `name` + `description` (frontmatter) |
| 2 | On trigger | <5k words | SKILL.md body |
| 3 | On demand | Unlimited | scripts/, references/, assets/ |

### Pattern 1: High-level Guide with References
```markdown
# Main Skill
## Quick Start
[Essential instructions]
## Advanced Features
- **Feature A**: See [references/feature_a.md](references/feature_a.md)
```

### Pattern 2: Conditional Details
```markdown
## Basic Usage
[Simple instructions]
## Advanced (when needed)
**For complex scenarios**: See [references/advanced.md](references/advanced.md)
```

## What NOT to Include

A skill should only contain files that directly support its functionality. Do NOT create:

- `README.md` — documentation goes in SKILL.md or references/
- `INSTALLATION_GUIDE.md`, `QUICK_REFERENCE.md`, `CHANGELOG.md`
- User-facing documentation, setup guides, or process notes
- Any auxiliary context about the creation process itself

**Rule**: If it's not needed by an AI agent to do the job, it doesn't belong in the skill.

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| Vague description | Skill won't trigger | Include specific trigger phrases in natural prose |
| Structured labels in description | Doesn't match official style | Write natural sentences, not `USE WHEN:` bullet lists |
| Unnecessary negative triggers | Clutter without value | Add "Do NOT use for..." only if realistic confusion with sibling skills |
| XML brackets in frontmatter | Security violation | Use plain text only |
| SKILL.md > 500 lines | Context bloat | Split to references/ |
| Extraneous docs (README, CHANGELOG) | Clutter and confusion | Remove — see "What NOT to Include" above |
| Untested scripts | Runtime failures | Test all scripts before packaging |
| Deeply nested refs | Hard to navigate | Keep references 1 level deep |
| Verbose instructions | Claude ignores them | Be concise, use bullet points |
| Missing error handling | Users get stuck | Add Troubleshooting section |
| No output examples | Inconsistent results | Add output-patterns (template or examples) |

## References

- **Official Examples**: [references/official-examples.md](references/official-examples.md) — real Anthropic skill frontmatter and body patterns
- **Frontmatter Spec**: [references/frontmatter-spec.md](references/frontmatter-spec.md)
- **Writing Guide**: [references/writing-guide.md](references/writing-guide.md) — description field, body structure, degrees of freedom
- **Output Patterns**: [references/output-patterns.md](references/output-patterns.md) — template, examples, and validation patterns
- **Skill Patterns**: [references/skill-patterns.md](references/skill-patterns.md) — 5 architecture patterns
- **Testing Guide**: [references/testing-guide.md](references/testing-guide.md)
- **Workflow Patterns**: [references/workflows.md](references/workflows.md)
- **Skill Template**: [assets/templates/skill-template.md](assets/templates/skill-template.md)
