---
title: "Module 5: Real-World Examples & Exercises"
description: "Complete implementations of Commands, Skills, and Agents with project scaffolding and bug-fix automation case studies"
type: tutorial
tags: [AI, Architecture]
order: 5
depends_on: [./04-templates.md]
related: [./05-examples.ko.md]
---

# Module 5: Real-World Examples & Exercises

> Complete implementations of Commands, Skills, and Agents

## Learning Objectives

By the end of this module, you will:
- See full implementations of each component type
- Understand how components work together in real scenarios
- Practice designing your own components

---

## 5.1 Example 1: Project Scaffolding System

### Scenario

Create a system that helps developers start new projects with:
- Proper folder structure
- CI/CD configuration
- Git initialization

### Component Breakdown

```
User runs: /init-project MyApp --language python

   ┌─────────────────────────────────────────────────┐
   │  COMMAND: /init-project                         │
   │  Triggers agent with project parameters         │
   └───────────────────────┬─────────────────────────┘
                           │
                           ▼
   ┌─────────────────────────────────────────────────┐
   │  AGENT: project-init-agent                      │
   │  Plans and executes scaffolding steps           │
   │                                                 │
   │  Loads skills: scaffold, ci                     │
   │  Uses tools: file_write, git_init, template_fetch│
   └───────────────────────┬─────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ SKILL:      │  │ SKILL:      │  │ TOOL:       │
   │ scaffold    │  │ ci          │  │ file_write  │
   │             │  │             │  │ git_init    │
   │ - templates │  │ - CI config │  │             │
   │ - structure │  │ - pipelines │  │             │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### Command Implementation

**File:** `.claude/commands/init-project.md`

```markdown
---
allowed-tools: Bash(*), Read, Write
argument-hint: <project-name> [--language python|node|go]
description: Initialize a new project with scaffolding and CI setup
---

# Project Initialization

Create a new project named "$1" with language preference "${2:-python}".

## Requirements
1. Create project directory structure
2. Initialize git repository  
3. Set up CI/CD pipeline
4. Create README with setup instructions

## Context
Current directory: !`pwd`
Available templates: @.claude/skills/scaffold/templates/

Use the scaffold skill for project structure and ci skill for pipeline setup.
Ensure all files follow project conventions.
```

### Skill Implementation: Scaffold

**File:** `.claude/skills/scaffold/SKILL.md`

```yaml
---
name: scaffold
version: 1.0.0
description: |
  Project scaffolding templates and structure guidelines.
  USE WHEN: "new project", "create project", "scaffold", "project structure"
  DO NOT USE WHEN: Adding features to existing projects
---

# Scaffold Skill

## Workflow Routing

| Intent | Workflow | Description |
|--------|----------|-------------|
| Create new project | workflows/create-structure.md | Full project setup |
| Initialize repository | workflows/init-repo.md | Git setup only |

## Supported Languages

| Language | Template Dir | Key Files |
|----------|--------------|-----------|
| Python | templates/python/ | setup.py, requirements.txt, pyproject.toml |
| Node.js | templates/node/ | package.json, tsconfig.json |
| Go | templates/go/ | go.mod, main.go |

## Directory Structure Standard

```
project-name/
├── src/              # Source code
├── tests/            # Test files
├── docs/             # Documentation
├── .github/          # GitHub workflows
├── README.md         # Project documentation
└── .gitignore        # Git ignore rules
```
```

**File:** `.claude/skills/scaffold/workflows/create-structure.md`

```markdown
# Create Project Structure

## Prerequisites
- Project name provided
- Language specified

## Steps

### 1. Create Base Directories

```
mkdir -p $PROJECT_NAME/{src,tests,docs,.github/workflows}
```

### 2. Generate Language-Specific Files

**For Python:**
- `src/__init__.py` - Package marker
- `src/main.py` - Entry point
- `tests/__init__.py` - Test package
- `tests/test_main.py` - Example test
- `requirements.txt` - Dependencies
- `pyproject.toml` - Project metadata

**For Node.js:**
- `src/index.ts` - Entry point
- `tests/index.test.ts` - Example test
- `package.json` - Project config
- `tsconfig.json` - TypeScript config

### 3. Create Common Files

- `README.md` - From template with project name
- `.gitignore` - Language-specific ignores
- `LICENSE` - MIT license (default)

### 4. Validation

- [ ] All directories created
- [ ] All required files present
- [ ] Files are not empty
- [ ] No syntax errors in config files
```

### Skill Implementation: CI

**File:** `.claude/skills/ci/SKILL.md`

```yaml
---
name: ci
version: 1.0.0
description: |
  CI/CD pipeline configuration for GitHub Actions.
  USE WHEN: "CI", "pipeline", "workflow", "GitHub Actions", "continuous integration"
  DO NOT USE WHEN: Non-GitHub hosting, local testing only
---

# CI Skill

## Workflow Routing

| Intent | Workflow | Description |
|--------|----------|-------------|
| Set up basic CI | workflows/setup-pipeline.md | Standard build/test pipeline |
| Add deployment | workflows/add-deploy.md | Deployment stage |

## Pipeline Templates

### Python CI
```yaml
name: Python CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pytest tests/
```

### Node.js CI
```yaml
name: Node CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```
```

### Agent Implementation

**File:** `.claude/agents/project-init-agent.md` (conceptual)

```yaml
name: project-init-agent
description: "Creates new projects with proper structure and CI"
version: 1.0.0

capabilities:
  skills: [scaffold, ci]
  tools: [file_write, file_read, bash]

workflow:
  1: "Validate project name and language"
  2: "Load scaffold skill for structure templates"
  3: "Create directory structure using templates"
  4: "Load ci skill for pipeline configuration"
  5: "Create CI workflow file"
  6: "Initialize git repository"
  7: "Report completion with next steps"

constraints:
  max_steps: 10
  timeout: 120s
  
error_handling:
  directory_exists: "Ask user to choose different name or confirm overwrite"
  template_missing: "Use default minimal template"
```

### Operational Scenarios

#### Success Flow

```
User: /init-project MyWebApp --language node

Agent: Creating new Node.js project "MyWebApp"...

Step 1: Creating directory structure
  ✓ Created MyWebApp/
  ✓ Created MyWebApp/src/
  ✓ Created MyWebApp/tests/
  ✓ Created MyWebApp/docs/

Step 2: Generating project files
  ✓ Created package.json
  ✓ Created tsconfig.json
  ✓ Created src/index.ts
  ✓ Created tests/index.test.ts
  ✓ Created README.md

Step 3: Setting up CI
  ✓ Created .github/workflows/ci.yml

Step 4: Initializing git
  ✓ Ran git init
  ✓ Created initial commit

✅ Project "MyWebApp" created successfully!

Next steps:
  cd MyWebApp
  npm install
  npm test
```

#### Failure Flow

```
User: /init-project MyWebApp

Agent: Creating project "MyWebApp"...

Step 1: Checking directory...
❌ ERROR: Directory "MyWebApp" already exists.

Options:
1. Choose a different name
2. Run with --force to overwrite
3. Cancel

What would you like to do?
```

---

## 5.2 Example 2: Bug Fix Automation

### Scenario

Create an agent that:
- Takes a bug report
- Reproduces the issue
- Finds the root cause
- Creates a fix and PR

### Component Breakdown

| Component | Name | Purpose |
|-----------|------|---------|
| Command | `/fix-bug` | Entry point for bug fixing |
| Agent | `bug-fix-agent` | Orchestrates the entire flow |
| Skill | `debugging` | Bug analysis techniques |
| Skill | `testing` | Test writing and running |
| Skill | `coding-guidelines` | Ensure fix quality |
| Tools | Various | File ops, git, test runner |

### Command Implementation

**File:** `.claude/commands/fix-bug.md`

```markdown
---
allowed-tools: Bash(git:*), Read, Write, Bash(npm test), Bash(pytest)
argument-hint: <issue-id-or-description>
description: Analyze and fix a bug, then create a PR
---

# Bug Fix Command

## Input
Bug reference: $1

## Instructions

You are a bug fixing specialist. Follow this process:

1. **Understand** - Read the bug description carefully
2. **Reproduce** - Try to trigger the bug
3. **Investigate** - Find the root cause
4. **Fix** - Apply minimal, targeted fix
5. **Verify** - Run tests to confirm fix
6. **Document** - Create PR with clear explanation

## Context
Repository: !`git remote get-url origin`
Current branch: !`git branch --show-current`
Recent commits: !`git log --oneline -5`

Load the debugging skill for investigation techniques.
Follow coding-guidelines skill when making changes.
Use testing skill to verify the fix.

## Safety
- Always create a new branch for fixes
- Run tests before committing
- Create draft PR (human review required)
```

### Agent Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      BUG-FIX-AGENT                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
    ▼                           ▼                           ▼
┌─────────┐               ┌─────────┐               ┌─────────┐
│ PHASE 1 │               │ PHASE 2 │               │ PHASE 3 │
│ ANALYZE │               │  FIX    │               │ VERIFY  │
└────┬────┘               └────┬────┘               └────┬────┘
     │                         │                         │
     ▼                         ▼                         ▼
• Read bug report         • Edit source files       • Run test suite
• Reproduce issue         • Add test case           • Verify fix works
• Search for cause        • Follow guidelines       • Check no regression
• Load debugging skill    • Load coding-guidelines  • Load testing skill
                                │
                                ▼
                        ┌─────────────┐
                        │  PHASE 4    │
                        │  DELIVER    │
                        │             │
                        │ • Commit    │
                        │ • Push      │
                        │ • Create PR │
                        └─────────────┘
```

### Skill: Debugging

**File:** `.claude/skills/debugging/SKILL.md`

```yaml
---
name: debugging
version: 1.0.0
description: |
  Techniques for analyzing and diagnosing bugs.
  USE WHEN: "bug", "error", "exception", "crash", "not working", "investigate"
  DO NOT USE WHEN: Writing new features, refactoring
---

# Debugging Skill

## Workflow Routing

| Bug Type | Workflow | Key Techniques |
|----------|----------|----------------|
| Runtime exception | workflows/exception-analysis.md | Stack trace, error message parsing |
| Logic error | workflows/logic-debugging.md | State inspection, assertions |
| Performance issue | workflows/performance-debugging.md | Profiling, bottleneck analysis |

## Universal Debugging Checklist

1. **Reproduce First**
   - Can you trigger the bug consistently?
   - What are the exact steps?
   - What inputs cause it?

2. **Isolate the Problem**
   - What's the smallest case that shows the bug?
   - Which component is responsible?
   - When was it last working?

3. **Gather Evidence**
   - Error messages and stack traces
   - Log files around the time of failure
   - Related recent changes (git blame, git log)

4. **Form Hypothesis**
   - What could cause this behavior?
   - How can you test the hypothesis?

5. **Verify Fix**
   - Does the fix address root cause (not just symptom)?
   - Are there other places with similar issues?
   - Will this break anything else?
```

### Complete Scenario Walkthrough

```
User: /fix-bug "Login fails when password contains special characters"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1: Understanding the Bug
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Loading debugging skill...

Bug Summary:
- Issue: Login fails with special character passwords
- Expected: Login should work with any valid password
- Actual: Returns "Invalid credentials" error

Attempting reproduction...
  > Test login with password "test@123!"
  > Result: ❌ Login failed
  > Reproduced successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2: Investigation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Searching for authentication code...
  > Found: src/auth/login.ts

Analyzing code:
```typescript
// Line 45
const sanitizedPassword = password.replace(/[^a-zA-Z0-9]/g, '');
```

ROOT CAUSE IDENTIFIED:
Password is being sanitized to remove special characters
before comparison, but stored hash uses original password.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3: Fix Implementation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Loading coding-guidelines skill...

Proposed fix:
- Remove incorrect sanitization
- Use proper password handling

Creating branch: fix/login-special-chars

Applied change:
```diff
- const sanitizedPassword = password.replace(/[^a-zA-Z0-9]/g, '');
- const hash = await bcrypt.hash(sanitizedPassword, 10);
+ const hash = await bcrypt.hash(password, 10);
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4: Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Loading testing skill...

Running test suite...
  ✓ 45 tests passed
  ✓ No regressions

Adding test case for special characters:
```typescript
test('should authenticate with special character password', async () => {
  const result = await login('user@test.com', 'p@ss!w0rd#');
  expect(result.success).toBe(true);
});
```

All tests: ✓ 46 passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5: PR Creation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Created Draft PR #234:

Title: fix(auth): Allow special characters in passwords

## Summary
Fixed login failure when password contains special characters.

## Root Cause
Password sanitization was incorrectly removing special characters
before hashing, causing hash mismatch during login.

## Changes
- Removed unnecessary password sanitization (src/auth/login.ts)
- Added test case for special character passwords

## Testing
- All existing tests pass
- Added regression test

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bug Fix Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PR: https://github.com/org/repo/pull/234
Branch: fix/login-special-chars
Commits: 2 (fix + test)

Awaiting review before merge.
```

---

## 5.3 Practice Exercises

### Exercise 1: Design a Documentation Generator

**Scenario:** Create a system that generates API documentation from code.

Design the components:
1. What command triggers it?
2. What skills does it need?
3. What's the agent workflow?

<details>
<summary>Sample Solution</summary>

**Command:** `/generate-docs`

```markdown
---
description: Generate API documentation from source code
argument-hint: [path-to-source]
---

Generate comprehensive API documentation for code in $1.
Use the documentation skill for formatting standards.
Output to docs/api/ directory.
```

**Skill:** `documentation`
- Workflow: Extract function signatures
- Workflow: Generate markdown from JSDoc/docstrings
- Templates: API doc templates

**Agent Workflow:**
1. Scan source files for documented functions
2. Extract signatures and descriptions
3. Generate markdown using templates
4. Create index/navigation
5. Validate all links work
</details>

### Exercise 2: Design a Code Migration Tool

**Scenario:** Create a tool that helps migrate from JavaScript to TypeScript.

<details>
<summary>Sample Solution</summary>

**Command:** `/migrate-to-ts`
- Parameters: directory, strict-mode flag
- Safety: Creates backup, requires confirmation

**Skills:**
- `typescript-patterns` - TS best practices
- `migration-checklist` - Step-by-step process
- `testing` - Verify migration worked

**Agent Workflow:**
1. Analyze JS files to migrate
2. Rename .js → .ts
3. Add type annotations (infer where possible)
4. Fix type errors
5. Update imports
6. Run TypeScript compiler
7. Run tests
8. Report migration summary
</details>

---

## Key Takeaways

1. **Real systems combine all component types** - Commands trigger Agents that use Skills
2. **Clear phases** - Break complex workflows into distinct stages
3. **Error handling at every step** - Plan for failures
4. **Skills provide reusable knowledge** - Don't hardcode expertise in agents
5. **Document the flow** - Future maintainers need to understand

---

## Next Module

[Module 6: Anti-patterns & Best Practices](./06-anti-patterns.md) - Learn what NOT to do and how to prevent common mistakes.
