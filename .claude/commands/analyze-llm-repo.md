---
description: Analyze an LLM plugin repository and generate structured documentation
argument-hint: <repo-url-or-path> [--depth quick|standard|deep]
---

# Analyze LLM Repository

Deep analysis of an LLM agent/plugin repository to produce structured documentation.

## Arguments

- `<repo-url-or-path>`: GitHub URL or local path to the repository
- `--depth`: Analysis depth level (default: standard)
  - `quick`: README + core-philosophy only (1-2 hours)
  - `standard`: README + 00-03 documents (4-6 hours)
  - `deep`: Full 00-06 + PRACTICAL-GUIDE (1-2 days)

## Example

```bash
# Most common: analyze pre-cloned repo in refs/
/analyze-llm-repo refs/oh-my-opencode --depth deep

# Available repos in refs/:
ls refs/
# oh-my-opencode/  oh-my-claudecode/  agent-skills/  skills/  claude-cookbooks/

# Clone new repo first, then analyze
git clone https://github.com/user/llm-project refs/llm-project
/analyze-llm-repo refs/llm-project --depth standard
```

## Instructions

### Phase 0: Setup

1. Load skill: @.claude/skills/llm-repo-analysis/SKILL.md
2. Determine next available topic number:
   ```bash
   ls docs/ | grep -E "^[0-9]+-" | tail -1
   ```
3. Access repository:
   - **Typical**: Use pre-cloned repo in `refs/<repo-name>`
   - If not cloned: `git clone <url> refs/<repo-name>` first

### Phase 1: Initial Exploration

Follow @.claude/skills/llm-repo-analysis/workflows/analyze-repository.md Phase 0.

Identify:
- Main agent prompt location
- Skills/commands directory
- Hooks/verification systems
- Configuration files

### Phase 2: Analysis

Based on `--depth` argument:

| Depth | Documents to Generate |
|-------|----------------------|
| `quick` | README.md, 00-core-philosophy.md |
| `standard` | README.md, 00-03 documents |
| `deep` | Full structure including PRACTICAL-GUIDE |

For each document, follow the corresponding phase in the analyze-repository workflow.

### Phase 3: Generate Documentation

1. Create directory: `docs/NN-topic-name/`
2. Follow @.claude/skills/llm-repo-analysis/workflows/generate-documentation.md
3. Use templates from @.claude/skills/llm-repo-analysis/references/output-templates.md

### Phase 4: Verification

Checklist before completion:

- [ ] README.md provides clear navigation
- [ ] All cross-links work (test relative paths)
- [ ] Each document has consistent structure
- [ ] PRACTICAL-GUIDE.md synthesizes key patterns (if deep)
- [ ] Source files are referenced

## Output

```
docs/NN-topic-name/
├── README.md
├── 00-core-philosophy.md
├── 01-architecture.md        (standard/deep)
├── 02-design-patterns.md     (standard/deep)
├── 03-anti-patterns.md       (standard/deep)
├── 04-prompt-engineering.md  (deep only)
├── 05-eval-methodology.md    (deep only)
├── 06-reference/             (deep only)
├── PRACTICAL-GUIDE.md        (deep only)
└── PRACTICAL-GUIDE.patterns/ (deep only)
```

## Key Principle

**Extract the "WHY" before the "WHAT".**

Focus on what's UNIQUE and REUSABLE, not obvious implementation details.
