---
title: "Implementation Guide"
description: "Step-by-step setup of the forced-eval hook for reliable Claude Code skill activation in your own projects"
type: tutorial
tags: [AI, BestPractice, Setup]
order: 5
depends_on: [./04-results-analysis.en.md]
related: [./05-implementation-guide.ko.md]
---

# Module 5: Implementation Guide

> Set up 100% skill activation in your project in under 10 minutes

## Learning Objectives

After completing this module, you will:
- Set up the forced-eval hook in any Claude Code project
- Configure `.claude/settings.json` for hook integration
- Test and verify that skill activation reaches 100%
- Adapt the hook template for your own skill set
- Troubleshoot common issues with hook configurations

---

## 5.1 Prerequisites Check

Before starting, verify your environment:

| Requirement | Check Command | Expected |
|-------------|--------------|----------|
| Claude Code CLI | `claude --version` | v1.x or later |
| Existing project | `ls .claude/` | Directory exists |
| At least one skill | `ls .claude/skills/` | Skill directories present |
| Bash available | `which bash` | `/bin/bash` or similar |

### If You Don't Have Skills Yet

Create a minimal skill first:

```bash
mkdir -p .claude/skills/my-skill
cat > .claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: Project coding conventions and patterns. Use when implementing
  features, writing code, or making architectural decisions.
---
# My Skill

## Conventions
- Use TypeScript strict mode
- Follow the repository's naming conventions
- Write tests for all new functions
EOF
```

---

## 5.2 Create the Hook Script

### Step 1: Create the hooks directory

```bash
mkdir -p .claude/hooks
```

### Step 2: Create the forced-eval script

```bash
cat > .claude/hooks/force-eval.sh << 'SCRIPT'
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Before implementing ANYTHING, you MUST complete these steps IN ORDER:

Step 1 - EVALUATE: For EACH available skill, explicitly state:
  [skill-name] - YES/NO - [one-line reason why it's relevant or not]

Step 2 - ACTIVATE: For every skill you marked YES, call the Skill() tool
  to load its contents. Do this BEFORE any implementation.

Step 3 - IMPLEMENT: Only AFTER completing Steps 1 and 2, proceed with
  the user's request using the loaded skill knowledge.

CRITICAL: You MUST call Skill() in Step 2 for all YES skills.
Do NOT skip directly to implementation.
Do NOT say "I'll keep the skill in mind" — you must CALL Skill().
EOF
SCRIPT
```

### Step 3: Make it executable

```bash
chmod +x .claude/hooks/force-eval.sh
```

### Verification

```bash
# Test the script outputs correctly
.claude/hooks/force-eval.sh
```

Expected output: The full instruction text starting with "INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE"

---

## 5.3 Configure settings.json

### Step 1: Locate or create settings.json

```bash
# Check if it exists
cat .claude/settings.json 2>/dev/null || echo "File doesn't exist yet"
```

### Step 2: Add hook configuration

If `settings.json` doesn't exist:

```bash
cat > .claude/settings.json << 'EOF'
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/force-eval.sh"
      }
    ]
  }
}
EOF
```

If `settings.json` already exists, add the `hooks` key. Example merge:

```json
{
  "permissions": {
    "allow": ["Skill"]
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": ".claude/hooks/force-eval.sh"
      }
    ]
  }
}
```

### Important Notes

| Setting | Why |
|---------|-----|
| `type: "command"` | Must be `command`, NOT `prompt` (prompt hooks don't work) |
| `UserPromptSubmit` | Fires before Claude processes the prompt |
| Relative path | `.claude/hooks/force-eval.sh` resolves from project root |

---

## 5.4 Test the Setup

### Quick Verification

Run Claude with a prompt that should activate your skills:

```bash
claude -p "implement a new feature using the project conventions" \
  --output-format stream-json \
  --max-turns 1 2>&1 | grep -o '"name":"Skill"'
```

If you see `"name":"Skill"` in the output, activation is working.

### Detailed Verification

```bash
claude -p "add a new API endpoint with proper error handling" \
  --output-format stream-json \
  --max-turns 1 2>&1 | while read line; do
    if echo "$line" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d.get('type') == 'content_block_start' and \
       d.get('content_block', {}).get('name') == 'Skill':
        print(f'ACTIVATED: {d[\"content_block\"][\"input\"].get(\"skill_name\", \"unknown\")}')
except: pass
" 2>/dev/null; then
        true
    fi
done
```

### What to Look For in Claude's Response

With forced-eval active, Claude's response should always begin with:

```
Step 1 - EVALUATE:
  [my-skill] - YES - This prompt involves implementing a feature,
    which matches the skill's focus on coding conventions

Step 2 - ACTIVATE:
  Loading my-skill...

Step 3 - IMPLEMENT:
  [Implementation using skill knowledge]
```

If Claude skips Step 1 and jumps straight to implementation, the hook isn't configured correctly.

---

## 5.5 Adapting for Your Skills

### Multiple Skills

The hook works automatically with any number of skills. Claude enumerates all available skills in Step 1:

```
Step 1 - EVALUATE:
  [react-patterns] - YES - User is creating a React component
  [api-conventions] - NO - No API work in this prompt
  [testing-standards] - NO - User didn't ask for tests
  [accessibility] - YES - Component needs a11y compliance

Step 2 - ACTIVATE:
  Loading react-patterns...
  Loading accessibility...
```

### Customizing the Script

You can tailor the hook for your context:

#### Option A: Add project-specific context

```bash
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

[Standard 3-step instruction...]

NOTE: This project uses a monorepo structure. Skills in /packages
apply to specific packages. Match skills to the relevant package.
EOF
```

#### Option B: Prioritize certain skills

```bash
#!/bin/bash
cat <<'EOF'
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

[Standard 3-step instruction...]

PRIORITY SKILLS (always evaluate first):
- code-style: MUST be loaded for ANY code changes
- security: MUST be loaded for auth, API, or data handling
EOF
```

#### Option C: Add skill metadata

```bash
#!/bin/bash
# List skills dynamically
SKILLS=$(ls -d .claude/skills/*/SKILL.md 2>/dev/null | sed 's|.*/\(.*\)/SKILL.md|\1|')
cat <<EOF
INSTRUCTION: MANDATORY SKILL ACTIVATION SEQUENCE

Available skills for evaluation: $SKILLS

[Standard 3-step instruction...]
EOF
```

---

## 5.6 Troubleshooting

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Hook not firing | Wrong event name | Use `UserPromptSubmit` (exact case) |
| No improvement | `type: prompt` used | Change to `type: command` |
| Permission denied | Script not executable | `chmod +x .claude/hooks/force-eval.sh` |
| Script not found | Wrong path | Use relative path from project root |
| Skills not loading | `Skill` not in allowed tools | Add `"Skill"` to permissions allow list |
| Hook fires but ignored | Script has no output | Ensure `cat <<'EOF'` block is present |

### Debugging Steps

1. **Verify script runs manually:**
   ```bash
   bash .claude/hooks/force-eval.sh
   # Should print the full instruction
   ```

2. **Check settings.json is valid JSON:**
   ```bash
   python3 -c "import json; json.load(open('.claude/settings.json'))"
   ```

3. **Test with verbose output:**
   ```bash
   claude -p "test prompt" --output-format stream-json 2>&1 | head -20
   ```

4. **Confirm hook output appears in context:**
   Look for the "MANDATORY SKILL ACTIVATION SEQUENCE" text in Claude's initial reasoning.

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| No skills configured | Hook fires but Claude has nothing to evaluate (harmless) |
| Skill directory empty | Claude lists no skills in Step 1 (harmless) |
| Multiple hooks | All hooks in array fire in order, outputs concatenated |
| Hook script errors | stderr is ignored; empty stdout = no injection |
| Very long hook output | May consume context window; keep instructions concise |

---

## 5.7 File Layout Checklist

Your final project structure should include:

```
your-project/
├── .claude/
│   ├── settings.json           # ← Hook configuration
│   ├── hooks/
│   │   └── force-eval.sh       # ← Hook script (executable)
│   └── skills/
│       ├── skill-1/
│       │   └── SKILL.md
│       ├── skill-2/
│       │   └── SKILL.md
│       └── .../
├── src/
└── ...
```

### Checklist

- [ ] `.claude/hooks/force-eval.sh` exists and is executable
- [ ] `.claude/settings.json` has `UserPromptSubmit` hook with `type: command`
- [ ] Hook script outputs the 3-step instruction text
- [ ] At least one skill is configured in `.claude/skills/`
- [ ] Test prompt triggers skill activation
- [ ] Non-matching prompt correctly gets NO for all skills
- [ ] Settings file is valid JSON

---

## Key Takeaways

- Setup takes under 10 minutes: create script → configure settings → test
- The hook script must use `type: command` (not `prompt`) — this is the most common mistake
- The script must be executable (`chmod +x`) and produce stdout
- Forced-eval works with any number of skills — Claude automatically enumerates all available ones
- Customize the hook for project context, priority skills, or dynamic skill listing
- Always test with both matching and non-matching prompts to verify bidirectional behavior
- The 2-second latency cost is negligible compared to the reliability gain from 100% activation

## Exercises

### Exercise 5.1: Full Setup

Set up forced-eval in your current Claude Code project:
1. Create the hook script
2. Configure settings.json
3. Test with 3 prompts (one matching, one non-matching, one ambiguous)
4. Verify the 3-step output appears in Claude's response

### Exercise 5.2: Custom Hook

Design a custom forced-eval hook for a project with these requirements:
- Must always load `security` skill for any file changes
- Should evaluate `react-patterns` and `api-design` normally
- Should list the current git branch in the hook output

Write the complete bash script.

### Exercise 5.3: Eval Your Setup

Using the techniques from Module 3, run a mini-evaluation:
1. Create 5 test prompts (3 matching, 2 non-matching)
2. Run each prompt 3 times with `claude -p`
3. Parse the JSONL output for Skill activations
4. Calculate your activation rate and false positive rate
5. Compare with the research baseline

---

## Course Complete

Congratulations! You've completed the full course on Claude Code Skill Activation Reliability. You now understand:

- **Why** skills fail (~50% baseline, keyword-based matching)
- **How** to fix it (forced-eval hook, commitment mechanism)
- **How to measure** it (Daytona sandboxes, JSONL parsing, eval harness)
- **What the data says** (100% activation, 0% false positives, $5.59 for 250 invocations)
- **How to implement** it (10-minute setup, one script, one config)

### What's Next?

- Apply forced-eval to your own projects
- Build custom eval harnesses for other LLM behaviors
- Contribute improvements to the [svelte-claude-skills](https://github.com/spences10/svelte-claude-skills) reference implementation
- Experiment with hook variations for your specific use case

Return to [Course Overview](./README.en.md) for reference materials and key terminology.
