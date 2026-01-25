# Workflow: Create Learning Content from Research

Step-by-step guide to transform research materials into structured learning content.

## Prerequisites

- Research materials exist in `docs/NN-topic/research/`
- At least one model response available (Claude, GPT, or Gemini)

## Step 1: Survey Research Materials

```bash
# List all research files
ls -la docs/NN-topic/research/
```

Read each research file and note:

| File | Model | Key Topics | Unique Insights | Length |
|------|-------|------------|-----------------|--------|
| 01-claude.en.md | Claude | | | |
| 02-gpt/*.md | GPT | | | |
| 03-gemini.en.md | Gemini | | | |

## Step 2: Create Content Outline

Create a mental map of topics:

```
1. Identify COMMON topics (all models cover)
   → These become core modules
   
2. Identify UNIQUE insights (only one model covers well)
   → Add to relevant modules or create dedicated section
   
3. Identify CONFLICTS (models disagree)
   → Document both perspectives, recommend one
   
4. Determine MODULE count (aim for 6-8)
```

### Recommended Module Structure

| # | Purpose | Common Name |
|---|---------|-------------|
| 1 | Core concepts | Fundamentals |
| 2 | How parts relate | Relationships |
| 3 | Decision making | Decision Framework |
| 4 | Practical specs | Templates |
| 5 | Real implementations | Examples |
| 6 | What not to do | Anti-patterns |

## Step 3: Create Learning Directory

```bash
mkdir -p docs/NN-topic/learning/
```

## Step 4: Write README.en.md First

The README serves as course index and must include:

1. **Course Overview** - What students will learn
2. **Target Audience** - Who this is for
3. **Prerequisites** - What they should know
4. **Module List** - With descriptions and durations
5. **Learning Paths** - Beginner vs advanced tracks
6. **Source Materials** - Links to research files

## Step 5: Write Each Module

For each module (01 through 06+):

### 5.1 Set Learning Objectives

Start with 3-5 measurable outcomes:
- "After this module, you can [DO something]"
- Use action verbs: identify, apply, design, implement, evaluate

### 5.2 Structure Content

```markdown
# Module N: Title

> One-line summary

## Learning Objectives
[3-5 objectives]

---

## N.1 Section Title
[Core content - synthesized from research]

## N.2 Section Title
[More content]

---

## Key Takeaways
[3-5 bullet points]

## Exercises
[At least 1 practical exercise]

---

## Next Steps
[Link to next module]
```

### 5.3 Synthesize, Don't Copy

| Do | Don't |
|----|-------|
| Combine insights from multiple models | Copy-paste from one source |
| Rewrite in consistent voice | Mix different writing styles |
| Add your own examples | Use only research examples |
| Note where models agree/disagree | Present one view as absolute truth |

### 5.4 Include Practical Elements

Each module should have at least:
- 1 decision table or flowchart
- 1 code/config example
- 1 exercise
- 1 "common mistake" note

## Step 6: Create Exercises

Exercises should:
- Be completable in 5-15 minutes
- Build on module content
- Have clear success criteria
- Include hints or solutions (optional)

### Exercise Types

| Type | Best For | Example |
|------|----------|---------|
| Classification | Testing understanding | "Is this a Command or Skill?" |
| Design | Applying knowledge | "Design a spec for X" |
| Code review | Finding issues | "What's wrong with this?" |
| Fill-in-template | Practical application | "Complete this template" |

## Step 7: Add Navigation

Ensure every module has:
- Link to previous module
- Link to next module
- Link back to README index

## Step 8: Review and Refine

### Content Review Checklist

- [ ] All learning objectives are measurable
- [ ] Content flows logically between sections
- [ ] Examples are practical and realistic
- [ ] No unexplained jargon
- [ ] Consistent terminology throughout

### Technical Review Checklist

- [ ] All internal links work
- [ ] Code examples are syntactically correct
- [ ] Tables render properly
- [ ] Diagrams are readable

## Output

After completing this workflow:

```
docs/NN-topic/learning/
├── README.en.md          # Course index
├── 01-module.en.md       # First module
├── 02-module.en.md       # Second module
├── ...                   # More modules
└── 0N-module.en.md       # Last module
```

## Next Step

Proceed to translation workflow: [translate.md](./translate.md)
