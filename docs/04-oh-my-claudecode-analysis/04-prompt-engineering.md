# Prompt Engineering Techniques

**Document:** 04-prompt-engineering.md
**Part of:** oh-my-claudecode Analysis
**Source:** `nicobailon/oh-my-claudecode` (v3.7.15)

---

## Technique Catalog

| # | Technique | Purpose | Primary Source |
|---|-----------|---------|----------------|
| 1 | XML Semantic Containers | Section isolation to prevent instruction bleed | `agents/architect.md`, `agents/scientist.md` |
| 2 | YAML Frontmatter Metadata | Dual-purpose: runtime config + identity declaration | All agent `.md` files |
| 3 | Markdown Decision Tables | Convert ambiguous choices into lookup operations | `docs/CLAUDE.md`, all skills |
| 4 | Numbered Phase Systems | Sequential workflow with explicit transitions | `agents/planner.md`, `skills/orchestrate/SKILL.md` |
| 5 | Mythological Persona Anchoring | Cultural associations prime model behavior | `agents/architect.md`, `agents/planner.md` |
| 6 | Contrastive Identity Definition | Define what agent IS NOT to block failure modes | `agents/planner.md`, `agents/architect.md` |
| 7 | Anti-Drift Redundancy | Repeat critical rules 5+ times across sections | `agents/planner.md`, `agents/executor.md` |
| 8 | Calibration Backstory | Set review strictness via narrative framing | `agents/critic.md` |
| 9 | NEVER/ALWAYS Polarity Lists | Hard behavioral boundaries | All agent files |
| 10 | NON-NEGOTIABLE Escalation Language | Signal criticality hierarchy | `docs/CLAUDE.md`, `agents/executor.md` |
| 11 | Structured Output Templates | Parseable inter-agent communication | `agents/explore.md`, `agents/scientist.md` |
| 12 | Red Flag Self-Monitoring | Metacognitive hedging-word detection | `agents/architect.md`, `agents/executor.md` |
| 13 | Mandatory Pre-Action Reasoning | Force chain-of-thought before tool use | `agents/explore.md`, `skills/orchestrate/SKILL.md` |
| 14 | Failure Condition Inversion | Define failure instead of success | `agents/explore.md` |
| 15 | Circuit Breaker Pattern | Prevent infinite retry loops | `agents/architect.md`, `skills/orchestrate/SKILL.md` |

---

## Detailed Techniques

### Technique 1: XML Semantic Containers

**Purpose:** Partition prompt sections with semantic boundaries to prevent instruction bleed between different types of rules.

**How It Works:** Custom XML tags (not standard HTML) create named regions that the model treats as distinct instruction domains. Tags are domain-specific inventions, not schema-defined.

**Tags Used in the System:**

| Tag | Purpose | Found In |
|-----|---------|----------|
| `<Role>` | Identity establishment | architect.md, scientist.md |
| `<Critical_Constraints>` | Hard behavioral limits | executor.md, scientist.md |
| `<Operational_Phases>` | Workflow sequencing | planner.md, scientist.md |
| `<Anti_Patterns>` | What NOT to do | architect.md, designer.md |
| `<Verification_Before_Completion>` | Quality gates | architect.md, executor.md |
| `<Behavior_Instructions>` | Operational rules | scientist.md |
| `<Task_Management>` | Todo discipline | executor.md |
| `<Tone_and_Style>` | Communication rules | scientist.md |
| `<Python_REPL_Tool>` | Tool-specific instructions | scientist.md |
| `<Quality_Gates>` | Evidence requirements | scientist.md |

**Example from `agents/architect.md`:**
```xml
<Role>
Oracle - Strategic Architecture & Debugging Advisor
Named after the prophetic Oracle of Delphi who could see
patterns invisible to mortals.

YOU ARE A CONSULTANT. YOU DO NOT IMPLEMENT.
</Role>

<Critical_Constraints>
FORBIDDEN ACTIONS (will be blocked):
- Write tool: BLOCKED
- Edit tool: BLOCKED
- Any file modification: BLOCKED
</Critical_Constraints>
```

**Why This Works:** Models treat XML boundaries as context switches. Instructions inside `<Critical_Constraints>` are less likely to be confused with instructions inside `<Role>`. Without these boundaries, "YOU DO NOT IMPLEMENT" could be misinterpreted as applying only to the Oracle persona, not to all behaviors.

**When to Use:** Any prompt longer than 100 lines with multiple instruction types.

---

### Technique 2: YAML Frontmatter Metadata

**Purpose:** Dual-purpose header that configures both the runtime system AND communicates identity to the model.

**How It Works:** Every agent markdown file starts with YAML frontmatter. The TypeScript runtime (`definitions.ts`) parses and strips it. The remaining markdown becomes the agent's prompt. But the model ALSO sees the frontmatter during prompt assembly, so it reinforces identity.

**Example from `agents/architect.md`:**
```yaml
---
name: architect
description: Strategic Architecture & Debugging Advisor (Opus, READ-ONLY)
model: opus
disallowedTools: Write, Edit
---
```

**Standard Fields:**

| Field | Purpose | Example |
|-------|---------|---------|
| `name` | Agent identifier | `architect`, `executor-low` |
| `description` | Human-readable role summary | "Focused executor from OhMyOpenCode" |
| `model` | Default model tier | `opus`, `sonnet`, `haiku` |
| `disallowedTools` | Infrastructure-enforced tool blocking | `Write, Edit`, `Task` |

**Why This Works:** The `disallowedTools` field creates hardware-level enforcement. Even if the prompt says "you may write files," the tool simply won't be available. This belt-and-suspenders approach is essential because LLMs can and do ignore prompt-only instructions.

---

### Technique 3: Markdown Decision Tables

**Purpose:** Convert ambiguous behavioral choices into deterministic table lookups.

**How It Works:** Instead of explaining when to use which model in prose, the system presents a table. The model pattern-matches against columns rather than reasoning from principles.

**Example — Model Routing (from `docs/CLAUDE.md`):**
```markdown
| Task Complexity | Model | When to Use |
|-----------------|-------|-------------|
| Simple lookup | `haiku` | "What does this return?" |
| Standard work | `sonnet` | "Add error handling" |
| Complex reasoning | `opus` | "Debug race condition" |
```

**Example — Question Classification (from `agents/planner.md`):**
```markdown
| BAD (asks user about codebase) | GOOD (asks user about preferences) |
|--------------------------------|-------------------------------------|
| "Where is auth implemented?" | "What auth method do you prefer?" |
| "What patterns does the codebase use?" | "What's your timeline?" |
| "How is the DB structured?" | "Do you need offline support?" |
```

**Example — Symptom-vs-Root-Cause (from `agents/architect.md`):**
```markdown
| Symptom | Not a Fix | Root Cause Question |
|---------|-----------|---------------------|
| "TypeError: undefined" | Adding null checks | Why is it undefined? |
| "Test flaky" | Re-running until pass | What state is shared? |
| "Works locally" | "It's the CI" | What environment diff? |
```

**Why This Works:** Tables reduce the reasoning burden on the model. Instead of interpreting "use Haiku for simple tasks" (what counts as "simple"?), the model matches against concrete examples in the table. Over 120 tables are used across the system.

**When to Use:** Any decision with 3+ options, especially when the boundary between options is ambiguous.

---

### Technique 4: Numbered Phase Systems

**Purpose:** Structure complex workflows as sequential phases with explicit transition triggers.

**How It Works:** Multi-step workflows are numbered to create clear ordering. Sub-phases (2A, 2B, 2C) handle branching without breaking the numbering.

**Example — Planner (from `agents/planner.md`):**
```
Phase 1: Interview Mode (DEFAULT)
  → Ask single question at a time
  → Use AskUserQuestion tool
  → Only preference questions, not codebase facts
Phase 2: Plan Generation Trigger
  → User says "create the plan" or equivalent
Phase 3: Plan Generation
  → Write to .omc/plans/{name}.md
Phase 3.5: Confirmation (MANDATORY)
  → Display summary, ask for approval
Phase 4: Handoff
  → Provide /oh-my-claudecode:start-work command
```

**Example — Orchestrator (from `skills/orchestrate/SKILL.md`):**
```
Phase 0: Intent Gate (check skills FIRST — blocking)
Phase 1: Codebase Assessment (disciplined/transitional/legacy/greenfield)
Phase 2A: Exploration & Research
Phase 2B: Implementation
Phase 2C: Failure Recovery (3-failure circuit breaker)
Phase 3: Completion (architect verification)
```

**Why This Works:** Numbering creates implicit ordering that models respect. Sub-phases (3.5, 2A/2B/2C) signal branching without losing position context. The model can reference "go back to Phase 2A" unambiguously.

---

### Technique 5: Mythological Persona Anchoring

**Purpose:** Use cultural associations to prime model behavior through character naming.

**Implementation:**

| Agent | Persona | Mythological Source | Behavioral Priming |
|-------|---------|--------------------|--------------------|
| architect | Oracle | Oracle of Delphi | Sees hidden patterns, prophetic insight |
| planner | Prometheus | Titan of foresight | Brings structure and foresight to chaos |
| executor | Sisyphus-Junior | Sisyphus (relentless labor) | Pushes task forward relentlessly |

**Example from `agents/architect.md`:**
```markdown
Oracle - Strategic Architecture & Debugging Advisor
Named after the prophetic Oracle of Delphi who could see
patterns invisible to mortals.
```

**Why This Works:** Mythological names are rich with associations that LLMs have deeply learned. "Oracle" primes for wisdom, truth-seeking, and analytical depth without needing to spell out these qualities. The name does behavioral work that pages of instructions would struggle to achieve.

---

### Technique 6: Contrastive Identity Definition

**Purpose:** Define what an agent IS NOT to explicitly block the most likely failure modes.

**How It Works:** A two-column table contrasts the agent's identity with what it must not become. Negative definitions are often more effective than positive ones because they address specific failure modes.

**Example from `agents/planner.md`:**
```markdown
| What You ARE | What You ARE NOT |
|--------------|------------------|
| Strategic consultant | Code writer |
| Requirements gatherer | Task executor |
| Work plan designer | Implementation agent |
| Interview conductor | File modifier |
```

**Followed by absolute reinforcement:**
```
YOU ARE A PLANNER. YOU ARE NOT AN IMPLEMENTER.
YOU DO NOT WRITE CODE. YOU DO NOT EXECUTE TASKS.
This is not a suggestion. This is your fundamental identity constraint.
NO EXCEPTIONS. EVER. Under ANY circumstances.
```

**Why This Works:** LLMs naturally try to be helpful by doing everything. A planner that can also execute will drift toward executing. The IS/IS NOT table creates a hard boundary. The repeated reinforcement (stated 5+ times in different formulations) is deliberate anti-drift redundancy.

---

### Technique 7: Anti-Drift Redundancy

**Purpose:** Repeat critical constraints multiple times in different formulations to prevent the model from drifting away from them over long conversations.

**How It Works:** The most important rules appear in multiple sections, with different phrasings. This is intentional, not poor organization.

**Example — "Never implement" for the planner:**
1. Frontmatter: `description: "Strategic Planning Consultant"`
2. Role section: "YOU ARE A PLANNER. YOU ARE NOT AN IMPLEMENTER."
3. Constraints: "FORBIDDEN: Writing code files, editing source code"
4. Anti-patterns: "Common failure: starting to implement the plan yourself"
5. Closing: "NO EXCEPTIONS. EVER."

**Example — Iron Law across the system:**
- `docs/CLAUDE.md` — Main system prompt
- `agents/architect.md` — Architect-specific
- `agents/executor.md` — Executor-specific
- `skills/ralph/SKILL.md` — Ralph-specific
- `skills/orchestrate/SKILL.md` — Orchestration-specific

**Why This Works:** In long context windows, instructions at the beginning fade in influence. Repeating them at multiple points maintains their salience. Each formulation also covers slightly different nuances.

---

### Technique 8: Calibration Backstory

**Purpose:** Set a reviewer's strictness level through narrative framing rather than numeric parameters.

**Example from `agents/critic.md`:**
```markdown
You are reviewing a first-draft work plan from an author with ADHD.
Based on historical patterns, these initial submissions are typically
rough drafts that require refinement.

Historical Data: Plans from this author average 7 rejections before
receiving an OKAY. The primary failure pattern is critical context
omission due to ADHD...
```

**Why This Works:** Telling a model "be strict, reject 7 out of 8 plans" is less effective than giving it a backstory that makes strictness the natural response. The narrative creates an emotional frame (expectations of rough drafts) that calibrates behavior more reliably than numeric instructions.

**When to Use:** Any reviewer/evaluator agent where the default behavior would be too permissive. The backstory approach avoids the model interpreting a numeric threshold literally.

---

### Technique 9: NEVER/ALWAYS Polarity Lists

**Purpose:** Create absolute behavioral boundaries with no ambiguity.

**Example from `agents/architect.md`:**
```markdown
NEVER:
- Give advice without reading the code first
- Suggest solutions without understanding context
- Make changes yourself (you are READ-ONLY)
- Provide generic advice that could apply to any codebase
- Skip the context gathering phase

ALWAYS:
- Cite specific files and line numbers
- Explain WHY, not just WHAT
- Consider second-order effects
- Acknowledge trade-offs
```

**Example from `agents/scientist.md`:**
```markdown
BASH BOUNDARY RULES:
- ALLOWED: python3 --version, pip list, ls, mkdir, git status
- PROHIBITED: python << 'EOF', python -c "...", ANY Python data analysis
```

**Why This Works:** NEVER/ALWAYS lists eliminate edge-case reasoning. The model does not need to decide if a particular situation is an exception — the list is absolute. This is especially effective for preventing common LLM shortcuts (like giving generic advice without reading code).

---

### Technique 10: NON-NEGOTIABLE Escalation Language

**Purpose:** Create a hierarchy of emphasis to signal which rules are most critical.

**Emphasis Hierarchy Used:**

| Level | Keyword | Meaning | Example |
|-------|---------|---------|---------|
| 1 | `IMPORTANT` | Should follow | "IMPORTANT: Always pass model parameter" |
| 2 | `CRITICAL` | Must follow | "CRITICAL: Don't assume. Ask until clear." |
| 3 | `NON-NEGOTIABLE` | Cannot override | "TODO OBSESSION (NON-NEGOTIABLE)" |
| 4 | `IRON LAW` | Absolute rule | "IRON LAW: NO COMPLETION CLAIMS WITHOUT EVIDENCE" |
| 5 | `HARD RULE` | System-enforced | "HARD RULE: Never claim completion without Architect" |

**Why This Works:** Without a hierarchy, all-caps instructions lose their impact (everything is equally "important"). The escalation ladder lets the model prioritize when rules conflict. An IRON LAW outranks a CRITICAL instruction.

---

### Technique 11: Structured Output Templates

**Purpose:** Shape agent output into parseable formats for inter-agent communication.

**Example — Explore agent (`agents/explore.md`):**
```xml
<results>
<files>
- /absolute/path/to/file.ts -- [why this file is relevant]
</files>
<answer>
[Direct answer to their actual need]
</answer>
<next_steps>
[What they should do with this information]
</next_steps>
</results>
```

**Example — Scientist agent (`agents/scientist.md`):**
```
[OBJECTIVE] Identify correlation between region and revenue
[DATA] 10,000 rows, 15 columns, 3 regions
[FINDING] Northern region shows higher average revenue
[STAT:n] Northern n=2,500, Southern n=2,800
[STAT:effect_size] Cohen's d = 0.85 (large effect)
[STAT:ci] 95% CI for difference: [$22,100, $31,460]
[LIMITATION] Missing values in 15% of records
```

**Example — Critic agent (`agents/critic.md`):**
```
[OKAY / REJECT]

Justification: [Concise explanation]

Summary:
- Clarity: [Brief assessment]
- Verifiability: [Brief assessment]
- Completeness: [Brief assessment]
- Big Picture: [Brief assessment]
```

**Why This Works:** Structured output creates natural-language API contracts. Downstream agents or the orchestrator can reliably parse these formats. The `<results>` block from explore is essentially a function return type expressed in XML.

---

### Technique 12: Red Flag Self-Monitoring

**Purpose:** Teach the model to monitor its own language for signs of uncertainty.

**Implementation (from `agents/architect.md`):**
```markdown
Red Flags (STOP and verify):
- Using "should", "probably", "seems to", "likely"
- Expressing confidence without citing file:line evidence
- Concluding analysis without fresh verification
```

**Implementation (from `agents/executor.md`):**
```markdown
Red Flags (STOP and verify):
- Using "should", "probably", "seems to"
- Expressing satisfaction before running verification
- Claiming completion without fresh test/build output
```

**Why This Works:** This is metacognitive self-monitoring — the model learns to treat its own hedging language as a diagnostic signal rather than a natural speech pattern. When it catches itself saying "probably," it knows to stop and gather evidence. This addresses a uniquely LLM failure mode: models use hedging words when they are uncertain but still produce output as if it were factual.

---

### Technique 13: Mandatory Pre-Action Reasoning

**Purpose:** Force chain-of-thought reasoning before taking action.

**Example — Explore pre-search analysis (`agents/explore.md`):**
```markdown
Before ANY search, wrap your analysis in <analysis> tags:

<analysis>
**Literal Request**: [What they literally asked]
**Actual Need**: [What they're really trying to accomplish]
**Success Looks Like**: [What result would let them proceed]
</analysis>
```

**Example — Orchestrator pre-delegation (`skills/orchestrate/SKILL.md`):**
```markdown
MANDATORY FORMAT before delegating:
I will use omc_task with:
- Category/Agent: [name]
- Reason: [why this choice fits]
- Skills (if any): [skill names]
- Expected Outcome: [what success looks like]
```

**Why This Works:** Without forced reasoning, agents jump directly to action. The `<analysis>` block forces the model to articulate intent before executing, which significantly improves relevance of results. The delegation format ensures the orchestrator has thought about agent selection before spawning.

---

### Technique 14: Failure Condition Inversion

**Purpose:** Define quality by enumerating failure modes rather than success criteria.

**Example from `agents/explore.md`:**
```markdown
Your response has FAILED if:
- Any path is relative (not absolute)
- You missed obvious matches in the codebase
- Caller needs to ask "but where exactly?" or "what about X?"
- You only answered the literal question, not the underlying need
- No <results> block with structured output
```

**Why This Works:** Success criteria are often vague ("be thorough"). Failure criteria are specific and testable. The model can check its output against each failure condition before responding. This inverted approach produces more reliable quality than positive-only guidance.

---

### Technique 15: Circuit Breaker Pattern

**Purpose:** Prevent agents from getting stuck in infinite retry loops.

**Example from `agents/architect.md`:**
```markdown
3-Failure Circuit Breaker
If 3+ fix attempts fail for the same issue:
- STOP recommending fixes
- QUESTION the architecture
- ESCALATE to full re-analysis
- CONSIDER the problem may be elsewhere entirely
```

**Example from `skills/orchestrate/SKILL.md`:**
```markdown
After 3 Consecutive Failures:
1. STOP all further edits immediately
2. REVERT to last known working state
3. DOCUMENT what was attempted and what failed
4. CONSULT Architect with full failure context
5. If Architect cannot resolve → ASK USER
```

**Why This Works:** LLM agents naturally retry the same approach when it fails. The circuit breaker forces a fundamental shift in strategy (from "fix the code" to "question the architecture"). The progressive escalation (self → specialist → human) prevents both infinite loops and premature escalation.

---

## Technique Distribution

| Technique | Occurrences | Where Used |
|-----------|-------------|------------|
| Decision tables | 120+ tables | All files |
| NEVER/ALWAYS lists | 15+ lists | All agent/skill files |
| XML containers | 12+ tag types | architect, scientist, orchestrate, explore |
| Iron Law verification | 5+ instances | CLAUDE.md, architect, executor, ralph, orchestrate |
| Red flag detection | 4 instances | architect, executor, CLAUDE.md, ralph |
| Numbered phases | 4+ files | planner, orchestrate, scientist, autopilot |
| Identity matrices | 3 instances | planner, CLAUDE.md, orchestrate |
| Circuit breakers | 2 instances | architect, orchestrate |
| Structured output | 2+ instances | scientist, explore |
| Promise token | 1 instance | ralph |
| Calibration backstory | 1 instance | critic |
| Mythological naming | 3 instances | architect, planner, executor |

---

## Cross-Cutting Insight

The prompt engineering in oh-my-claudecode follows a principle of **redundant, multi-modal constraint communication**. No single technique is trusted alone:

| Constraint Level | Technique | Example |
|-----------------|-----------|---------|
| Identity | Persona + Contrastive + Redundancy | Architect = Oracle + "IS NOT implementer" × 5 |
| Behavior | NEVER/ALWAYS + Tables + Phases | Never write code + delegation table + Phase 2B |
| Output | Templates + Failure conditions | `<results>` block + "FAILED if relative paths" |
| Quality | Red flags + Evidence gates + Circuit breaker | "probably" = stop + run verification + 3 failures = escalate |
| Infrastructure | Frontmatter + Tool blocking | `disallowedTools: Write, Edit` |

This layered approach assumes that any single technique will sometimes fail, and designs for resilience through redundancy.
