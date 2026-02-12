# Official Anthropic Skill Examples

Real examples from Anthropic's official skills repository (`anthropics/skills`).
Use these as style references when creating new skills.

## Frontmatter Style

All official skills use **natural prose** descriptions — no structured labels.

### Example 1: Simple (skill-creator)

```yaml
---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
---
```

### Example 2: Tool-based (webapp-testing)

```yaml
---
name: webapp-testing
description: Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.
---
```

### Example 3: Creative (frontend-design)

```yaml
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
---
```

### Example 4: File-type with negative trigger (docx)

```yaml
---
name: docx
description: "Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of \"Word doc\", \"word document\", \".docx\", or requests to produce professional documents. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks unrelated to document generation."
---
```

> Note: Negative triggers (`Do NOT use for...`) appear only in `docx` out of 16 official skills — used because `.docx`, `.pdf`, and `.xlsx` skills have realistically overlapping triggers.

## Body Structure Examples

Official skills do NOT follow a universal template. Each structures its body around its domain.

### Pattern A: Minimal Reference (33 lines) — `internal-comms`

```markdown
## When to use this skill
[List of communication types]

## How to use this skill
1. Identify the communication type
2. Load the appropriate guideline file from examples/
3. Follow the specific instructions in that file
```

### Pattern B: Decision Tree + Examples (96 lines) — `webapp-testing`

```markdown
## Decision Tree: Choosing Your Approach
[ASCII decision tree]

## Example: Using with_server.py
[Concrete code examples]

## Common Pitfall
[Single ❌/✅ pair]

## Best Practices
[Bullet list]

## Reference Files
[Links to examples/]
```

### Pattern C: Multi-Phase Workflow (376 lines) — `doc-coauthoring`

```markdown
## When to Offer This Workflow
[Trigger conditions + initial offer text]

## Stage 1: Context Gathering
[Goal → Steps → Exit condition → Transition]

## Stage 2: Refinement & Structure
[Goal → Section ordering → Step 1-6 per section → Quality checking]

## Stage 3: Reader Testing
[Goal → Sub-agent approach → Manual approach → Exit condition]

## Tips for Effective Guidance
[Tone, deviations, context management]
```

### Pattern D: Creative/Generative (405 lines) — `algorithmic-art`

```markdown
## ALGORITHMIC PHILOSOPHY CREATION
[What to create → How to generate → Examples → Essential principles]

## DEDUCING THE CONCEPTUAL SEED
[Critical step before implementation]

## P5.JS IMPLEMENTATION
[Step 0: Read template → Technical requirements → Craftsmanship]

## INTERACTIVE ARTIFACT CREATION
[Fixed vs variable sections → Required features]

## RESOURCES
[Template files with usage instructions]
```

## Key Observations

| Observation | Detail |
|-------------|--------|
| Description length | 1-4 sentences, natural prose |
| Body size range | 33-405 lines — sized to domain |
| Common sections | None universal; each skill has unique structure |
| "When to use" in body | Some skills repeat triggers in body, but official guide says to keep triggers in description only |
| Conciseness | Simple skills are genuinely short (33-96 lines), not padded |
| References | Linked inline where needed, not always in a dedicated section |
