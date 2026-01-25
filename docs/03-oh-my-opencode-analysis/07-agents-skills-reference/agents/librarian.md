# Librarian Agent

**Cost:** CHEAP  
**Mode:** Read-only (subagent)  
**Model:** Sonnet-class model  
**Source:** `src/agents/librarian.ts`

---

## Overview

Librarian is a specialized open-source codebase understanding agent. It searches **external** resources - remote repositories, official documentation, and GitHub examples. Think of it as "reference grep" for the outside world.

**Key Characteristics:**
- READ-ONLY: Cannot write, edit, or delegate
- Designed for parallel execution (`run_in_background=true`)
- Returns evidence with GitHub permalinks

---

## When to Use

| Trigger | Example |
|---------|---------|
| "How do I use [library]?" | Need official API documentation |
| "What's the best practice for [framework feature]?" | Need community patterns |
| "Why does [external dependency] behave this way?" | Need source code investigation |
| "Find examples of [library] usage" | Need real-world implementations |
| Working with unfamiliar npm/pip/cargo packages | Need quick context |

---

## Implementation

```typescript
export function createLibrarianAgent(model: string): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    "write",
    "edit",
    "task",
    "delegate_task",
    "call_omo_agent",
  ])

  return {
    description:
      "Specialized codebase understanding agent for multi-repository analysis, searching remote codebases, retrieving official documentation, and finding implementation examples using GitHub CLI, Context7, and Web Search.",
    mode: "subagent" as const,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: LIBRARIAN_PROMPT,
  }
}
```

---

## System Prompt (Key Sections)

### Request Classification

```markdown
## PHASE 0: REQUEST CLASSIFICATION (MANDATORY FIRST STEP)

| Type | Trigger Examples | Tools |
|------|------------------|-------|
| **TYPE A: CONCEPTUAL** | "How do I use X?", "Best practice for Y?" | Doc Discovery → context7 + websearch |
| **TYPE B: IMPLEMENTATION** | "How does X implement Y?", "Show me source of Z" | gh clone + read + blame |
| **TYPE C: CONTEXT** | "Why was this changed?", "History of X?" | gh issues/prs + git log/blame |
| **TYPE D: COMPREHENSIVE** | Complex/ambiguous requests | Doc Discovery → ALL tools |
```

### Documentation Discovery Flow

```markdown
## PHASE 0.5: DOCUMENTATION DISCOVERY (FOR TYPE A & D)

### Step 1: Find Official Documentation
websearch("library-name official documentation site")

### Step 2: Version Check (if version specified)
websearch("library-name v{version} documentation")

### Step 3: Sitemap Discovery
webfetch(official_docs_base_url + "/sitemap.xml")

### Step 4: Targeted Investigation
webfetch(specific_doc_page_from_sitemap)
context7_query-docs(libraryId: id, query: "specific topic")
```

### Mandatory Citation Format

```markdown
## MANDATORY CITATION FORMAT

Every claim MUST include a permalink:

**Claim**: [What you're asserting]

**Evidence** ([source](https://github.com/owner/repo/blob/<sha>/path#L10-L20)):
```typescript
// The actual code
function example() { ... }
```

**Explanation**: This works because [specific reason from the code].
```

### Tool Reference

| Purpose | Tool | Command/Usage |
|---------|------|---------------|
| **Official Docs** | context7 | `context7_resolve-library-id` → `context7_query-docs` |
| **Find Docs URL** | websearch_exa | `websearch("library official documentation")` |
| **Read Doc Page** | webfetch | `webfetch(specific_doc_page)` |
| **Fast Code Search** | grep_app | `grep_app_searchGitHub(query, language, useRegexp)` |
| **Clone Repo** | gh CLI | `gh repo clone owner/repo ${TMPDIR:-/tmp}/name -- --depth 1` |
| **Issues/PRs** | gh CLI | `gh search issues/prs "query" --repo owner/repo` |

---

## Usage Pattern

```typescript
// CORRECT: Always background for external research
delegate_task(subagent_type="librarian", run_in_background=true, load_skills=[],
  prompt="Find JWT best practices in official documentation")
delegate_task(subagent_type="librarian", run_in_background=true, load_skills=[],
  prompt="How does tanstack-query implement staleTime?")

// Collect when needed
background_output(task_id="...")
```

---

## Failure Recovery

| Failure | Recovery Action |
|---------|-----------------|
| context7 not found | Clone repo, read source + README directly |
| grep_app no results | Broaden query, try concept instead of exact name |
| gh API rate limit | Use cloned repo in temp directory |
| Repo not found | Search for forks or mirrors |
| Uncertain | **STATE YOUR UNCERTAINTY**, propose hypothesis |
