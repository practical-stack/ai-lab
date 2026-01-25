# Multimodal Looker Agent

**Cost:** CHEAP  
**Mode:** Read-only (subagent)  
**Model:** Vision-capable model  
**Source:** `src/agents/multimodal-looker.ts`

---

## Overview

Multimodal Looker interprets media files that cannot be read as plain text - PDFs, images, diagrams, screenshots. It extracts specific information or summaries from documents and describes visual content.

**Key Characteristics:**
- READ-ONLY: Can only use the `read` tool
- Vision-capable model required
- Returns extracted information, not raw file contents

---

## When to Use

| Scenario | Example |
|----------|---------|
| Media files the Read tool cannot interpret | Binary files, images |
| Extracting specific information from documents | "What's the API key format in this PDF?" |
| Describing visual content | "What UI elements are in this screenshot?" |
| Analyzing diagrams | "Explain this architecture diagram" |

## When NOT to Use

- Source code or plain text files (use Read)
- Files that need editing afterward (need literal content)
- Simple file reading where no interpretation is needed

---

## Implementation

```typescript
export function createMultimodalLookerAgent(model: string): AgentConfig {
  const restrictions = createAgentToolAllowlist(["read"])  // ONLY read allowed

  return {
    description:
      "Analyze media files (PDFs, images, diagrams) that require interpretation beyond raw text. Extracts specific information or summaries from documents, describes visual content.",
    mode: "subagent" as const,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: MULTIMODAL_PROMPT,
  }
}
```

---

## System Prompt

```markdown
You interpret media files that cannot be read as plain text.

Your job: examine the attached file and extract ONLY what was requested.

When to use you:
- Media files the Read tool cannot interpret
- Extracting specific information or summaries from documents
- Describing visual content in images or diagrams
- When analyzed/extracted data is needed, not raw file contents

When NOT to use you:
- Source code or plain text files needing exact contents (use Read)
- Files that need editing afterward (need literal content from Read)
- Simple file reading where no interpretation is needed

How you work:
1. Receive a file path and a goal describing what to extract
2. Read and analyze the file deeply
3. Return ONLY the relevant extracted information
4. The main agent never processes the raw file - you save context tokens

For PDFs: extract text, structure, tables, data from specific sections
For images: describe layouts, UI elements, text, diagrams, charts
For diagrams: explain relationships, flows, architecture depicted

Response rules:
- Return extracted information directly, no preamble
- If info not found, state clearly what's missing
- Match the language of the request
- Be thorough on the goal, concise on everything else

Your output goes straight to the main agent for continued work.
```

---

## Usage Pattern

```typescript
// Analyze a screenshot
delegate_task(
  subagent_type="multimodal-looker",
  load_skills=[],
  prompt="Analyze the UI in /path/to/screenshot.png. What components are visible and what's the layout?"
)

// Extract from PDF
delegate_task(
  subagent_type="multimodal-looker",
  load_skills=[],
  prompt="Extract the API authentication section from /path/to/docs.pdf"
)

// Understand architecture diagram
delegate_task(
  subagent_type="multimodal-looker",
  load_skills=[],
  prompt="Explain the data flow in /path/to/architecture.png"
)
```

---

## Key Constraints

| Constraint | Reason |
|------------|--------|
| Only `read` tool allowed | Prevents any modifications |
| Return extracted info only | Saves context tokens for main agent |
| No preamble | Direct, actionable output |
