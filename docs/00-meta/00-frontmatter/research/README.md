---
title: "Frontmatter Methodology Research Materials"
description: "DeepSearch research process and outputs for deriving AI/LLM-friendly Frontmatter design methodology"
type: index
tags: [Documentation, AI, Frontmatter, BestPractice]
depends_on: [../README.md]
---

# Frontmatter Methodology Research Materials

[한국어](./README.ko.md)

Research process and outputs for deriving [00-guide.md](../00-guide.md).

## Research Process

```
1️⃣ Meta-prompt Design
   └── 00-meta-prompt.md

2️⃣ 1st DeepSearch (3 AI Models)
   └── raw-results/
       ├── 01-gpt.md      (GraphRAG architecture perspective)
       ├── 02-gemini.md   (URN/JSON Schema perspective)
       └── 03-claude.md   (Practical minimal schema perspective)

3️⃣ 2nd Synthesized Analysis
   └── synthesized-results/
       ├── 01-gpt.md      (GPT synthesized analysis)
       ├── 02-gemini.md   (Gemini synthesized analysis)
       └── 03-claude.md   (Claude synthesized analysis)

4️⃣ Final Methodology Derivation
   └── ../00-guide.md
```

## File Descriptions

| File | Description |
|------|-------------|
| [00-meta-prompt.md](./00-meta-prompt.md) | Meta-prompt used for DeepSearch |
| [raw-results/](./raw-results/) | 1st round AI research raw results |
| [synthesized-results/](./synthesized-results/) | 2nd round synthesized analysis results |

## Key Findings

| AI Model | Key Perspective | Complexity | Adoption |
|----------|-----------------|------------|----------|
| GPT | GraphRAG pipeline, 6-stage migration | High | Referenced for migration roadmap |
| Gemini | URN-based ID, JSON Schema validation | Very High | Not adopted (excessive) |
| Claude | Practical minimal schema, immediately applicable | Low | **Adopted as foundation** |

## Conclusion

Adopted **"Minimal Viable Frontmatter"** approach combining Claude's practical schema as the foundation, with GPT's gradual migration roadmap and some of Gemini's relationship definitions.

→ Final Result: [../00-guide.md](../00-guide.md)
