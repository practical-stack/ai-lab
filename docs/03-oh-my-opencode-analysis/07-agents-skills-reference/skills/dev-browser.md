# Dev Browser Skill

**Source:** `src/features/builtin-skills/dev-browser/SKILL.md`

---

## Overview

Dev Browser provides browser automation with **persistent page state**. Unlike typical Playwright scripts that close after execution, dev-browser maintains pages across script executions, enabling incremental workflow development.

**Key Insight**: Write small, focused scripts that do ONE thing. Evaluate state. Decide next step. Repeat.

---

## Frontmatter

```yaml
---
name: dev-browser
description: |
  Browser automation with persistent page state.
  Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows.
  Trigger phrases include "go to [url]", "click on", "fill out the form", "take a screenshot", "scrape", "automate", "test the website", "log into", or any browser interaction request.
---
```

---

## Core Principle: Persistent State

Unlike traditional Playwright:
- **Pages persist** after script execution
- **State accumulates** across multiple scripts
- **Incremental development** - debug step by step

```typescript
// Script 1: Navigate
const page = await client.page("checkout");
await page.goto("https://shop.example.com");
await client.disconnect();  // Page persists!

// Script 2: Later, continue from where we left off
const page = await client.page("checkout");  // Same page, same state
await page.click("#add-to-cart");
```

---

## Two Modes

### Standalone Mode (Default)
Launches fresh Chromium browser.

```bash
./skills/dev-browser/server.sh &
# Wait for "Ready" message
```

### Extension Mode
Connects to user's existing Chrome with logged-in sessions.

```bash
cd skills/dev-browser && npm i && npm run start-extension &
# Wait for "Extension connected"
```

---

## Workflow Loop Pattern

The skill enforces an iterative workflow:

```
1. Write a script → performs ONE action
2. Run it → observe output
3. Evaluate → did it work? What's the state?
4. Decide → complete or need another script?
5. Repeat → until task is done
```

---

## Script Template

```typescript
cd skills/dev-browser && npx tsx <<'EOF'
import { connect, waitForPageLoad } from "@/client.js";

const client = await connect();
const page = await client.page("example", { viewport: { width: 1920, height: 1080 } });

await page.goto("https://example.com");
await waitForPageLoad(page);

console.log({ title: await page.title(), url: page.url() });
await client.disconnect();
EOF
```

---

## Element Discovery: ARIA Snapshot

Instead of guessing selectors, use `getAISnapshot()` to see what's on the page:

```typescript
const snapshot = await client.getAISnapshot("hackernews");
console.log(snapshot);
```

Output (YAML accessibility tree):
```yaml
- banner:
  - link "Hacker News" [ref=e1]
  - navigation:
    - link "new" [ref=e2]
- main:
  - list:
    - listitem:
      - link "Article Title" [ref=e8]
      - link "328 comments" [ref=e9]
- contentinfo:
  - textbox [ref=e10]
    - /placeholder: "Search"
```

Then interact using refs:
```typescript
const element = await client.selectSnapshotRef("hackernews", "e2");
await element.click();
```

---

## Client API

```typescript
const client = await connect();

// Get or create named page
const page = await client.page("name");
const pageWithSize = await client.page("name", { viewport: { width: 1920, height: 1080 } });

const pages = await client.list();        // List all page names
await client.close("name");               // Close a page
await client.disconnect();                // Disconnect (pages persist)

// ARIA Snapshot methods
const snapshot = await client.getAISnapshot("name");
const element = await client.selectSnapshotRef("name", "e5");
```

---

## Key Constraints

### No TypeScript in Browser Context

```typescript
// ✅ Correct: plain JavaScript
const text = await page.evaluate(() => {
  return document.body.innerText;
});

// ❌ Wrong: TypeScript syntax fails at runtime
const text = await page.evaluate(() => {
  const el: HTMLElement = document.body;  // Type annotation breaks!
  return el.innerText;
});
```

### Write to tmp/ for Reusable Scripts

```markdown
**Write to `tmp/` files only when:**
- Script needs reuse
- Script is complex
- User explicitly requests it
```

---

## Error Recovery

Pages persist after failures. Debug with:

```typescript
const page = await client.page("hackernews");
await page.screenshot({ path: "tmp/debug.png" });
console.log({
  url: page.url(),
  title: await page.title(),
  bodyText: await page.textContent("body").then(t => t?.slice(0, 200)),
});
```

---

## Approach Selection

```markdown
## Choosing Your Approach

- **Local/source-available sites**: Read the source code first to write selectors directly
- **Unknown page layouts**: Use `getAISnapshot()` to discover elements
- **Visual feedback**: Take screenshots to see what the user sees
```

---

## Data Scraping Strategy

For large datasets, intercept network requests rather than DOM scrolling:

```markdown
Intercept and replay network requests rather than scrolling the DOM.
See [references/scraping.md] for request capture, schema discovery, and paginated API replay.
```

---

## Usage

```typescript
delegate_task(
  category="visual-engineering",
  load_skills=["dev-browser"],
  prompt="Navigate to https://example.com and fill out the contact form..."
)
```
