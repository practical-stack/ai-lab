# Agent Browser Skill

**Source:** `src/features/builtin-skills/agent-browser/SKILL.md`

---

## Overview

Agent Browser is a CLI-based browser automation tool. Unlike dev-browser (which uses TypeScript scripts), agent-browser uses shell commands for quick, imperative browser control.

**Key Difference from dev-browser:**
- **dev-browser**: TypeScript scripts, persistent state, incremental development
- **agent-browser**: CLI commands, snapshot-based interaction, quick operations

---

## Frontmatter

```yaml
---
name: agent-browser
description: |
  Automates browser interactions for web testing, form filling, screenshots, and data extraction.
  Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract information from web pages.
---
```

---

## Core Workflow

```bash
agent-browser open <url>        # Navigate to page
agent-browser snapshot -i       # Get interactive elements with refs
agent-browser click @e1         # Click element by ref
agent-browser fill @e2 "text"   # Fill input by ref
agent-browser close             # Close browser
```

**Pattern:**
1. Navigate: `open <url>`
2. Snapshot: `snapshot -i` (returns refs like `@e1`, `@e2`)
3. Interact: Use refs from snapshot
4. Re-snapshot: After navigation or DOM changes

---

## Command Reference

### Navigation
```bash
agent-browser open <url>
agent-browser back
agent-browser forward
agent-browser reload
agent-browser close
```

### Snapshot (Element Discovery)
```bash
agent-browser snapshot            # Full accessibility tree
agent-browser snapshot -i         # Interactive elements only (recommended)
agent-browser snapshot -c         # Compact output
agent-browser snapshot -d 3       # Limit depth
agent-browser snapshot -s "#main" # Scope to CSS selector
```

### Interactions (use @refs)
```bash
agent-browser click @e1
agent-browser dblclick @e1
agent-browser fill @e2 "text"     # Clear and type
agent-browser type @e2 "text"     # Type without clearing
agent-browser press Enter
agent-browser press Control+a
agent-browser hover @e1
agent-browser check @e1
agent-browser select @e1 "value"
agent-browser scroll down 500
agent-browser drag @e1 @e2
agent-browser upload @e1 file.pdf
```

### Get Information
```bash
agent-browser get text @e1
agent-browser get html @e1
agent-browser get value @e1
agent-browser get attr @e1 href
agent-browser get title
agent-browser get url
agent-browser get count ".item"
```

### State Checks
```bash
agent-browser is visible @e1
agent-browser is enabled @e1
agent-browser is checked @e1
```

### Screenshots & Recording
```bash
agent-browser screenshot
agent-browser screenshot path.png
agent-browser screenshot --full
agent-browser pdf output.pdf
agent-browser record start ./demo.webm
agent-browser record stop
```

### Wait
```bash
agent-browser wait @e1                 # Wait for element
agent-browser wait 2000                # Wait milliseconds
agent-browser wait --text "Success"    # Wait for text
agent-browser wait --url "**/dashboard"
agent-browser wait --load networkidle
```

---

## Example: Form Submission

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output: textbox "Email" [ref=e1], textbox "Password" [ref=e2], button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # Check result
```

---

## Example: Authentication with Saved State

```bash
# Login once
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "username"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# Later sessions: load saved state
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

---

## Sessions & Persistent Profiles

### Sessions (Parallel Browsers)
```bash
agent-browser --session test1 open site-a.com
agent-browser --session test2 open site-b.com
agent-browser session list
```

### Persistent Profiles
```bash
agent-browser --profile ~/.myapp-profile open myapp.com
# Or via env var
AGENT_BROWSER_PROFILE=~/.myapp-profile agent-browser open myapp.com
```

Persists: cookies, localStorage, IndexedDB, service workers, cache, login sessions.

---

## Global Options

| Option | Description |
|--------|-------------|
| `--session <name>` | Isolated browser session |
| `--profile <path>` | Persistent browser profile |
| `--headers <json>` | HTTP headers scoped to URL's origin |
| `--headed` | Show browser window (not headless) |
| `--cdp <port>` | Connect via Chrome DevTools Protocol |
| `--json` | Machine-readable JSON output |

---

## Header-based Auth

```bash
# Headers scoped to specific domain only
agent-browser open api.example.com --headers '{"Authorization": "Bearer <token>"}'
# Navigate to another domain - headers NOT sent (safe)
agent-browser open other-site.com
```

---

## Installation

```bash
# Install CLI
bun add -g agent-browser

# Install Playwright browsers
cd /tmp && bun init -y && bun add playwright
bun playwright install chromium

# Verify
agent-browser open https://example.com --headed
```

---

## Debugging

```bash
agent-browser open example.com --headed  # Show browser
agent-browser console                    # View console messages
agent-browser errors                     # View page errors
agent-browser highlight @e1              # Highlight element
agent-browser trace start                # Start recording trace
agent-browser trace stop trace.zip       # Save trace
```

---

## When to Use Which

| Scenario | Use |
|----------|-----|
| Quick one-off interaction | agent-browser |
| Complex multi-step workflow | dev-browser |
| Debugging page state | dev-browser (persistent) |
| CI/CD automation | agent-browser (CLI) |
| Incremental script development | dev-browser |
| Already have auth session | dev-browser (extension mode) |

---

## Usage

```typescript
delegate_task(
  category="visual-engineering",
  load_skills=["agent-browser"],
  prompt="Navigate to https://example.com and take a screenshot..."
)
```
