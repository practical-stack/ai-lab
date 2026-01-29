# Boundary Cases

12 common confusions when distinguishing Command, Skill, and Agent.

## Case 1: Command calls multiple Skills internally

**Question:** "Can a Command load and use multiple Skills?"

**Answer:** ✅ **Yes**

- Command can load multiple Skills as part of its workflow
- Example: `/release` command loads `Version.Skill` → `Changelog.Skill` → `Notification.Skill`
- Command orchestrates the order; Skills provide the domain knowledge
- Note: Skills can also invoke other skills directly (platform-supported), but Commands are preferred for complex multi-skill pipelines

---

## Case 2: Skill includes LLM prompts and tool calls

**Question:** "If a Skill includes both LLM prompts and tool call instructions, doesn't it become an Agent?"

**Answer:** ❌ **No, they are different**

- Skill = Script/Recipe (static instructions)
- Agent = Executor that interprets and runs the script
- Skill tells Agent "use tool X this way"; Agent actually executes
- Skill doesn't have its own execution loop

---

## Case 3: Agent auto-executes Commands

**Question:** "Can an Agent automatically call Commands?"

**Answer:** ⚠️ **Generally no**

- Commands are principally for human triggers
- If Agent needs the functionality → promote Command content to Skill
- Keep Commands as explicit user entry points

---

## Case 4: Knowledge must always be applied

**Question:** "If knowledge must always be applied (like style guide), should it be a Skill?"

**Answer:** ❌ **No, use Rules instead**

- Skills are "loaded when relevant keywords appear"
- Always-applied rules → put in `CLAUDE.md` or `AGENTS.md`
- Skill = "module added when needed"
- Rule = "always active constraint"

---

## Case 5: Both reusable - Skill or Command?

**Question:** "Both Skill and Command can be reusable. When to use which?"

**Answer:** **Skill is the default. Command is only added as a wrapper when platform constraints are needed.**

| Scenario | Component | Reason |
|----------|-----------|--------|
| Reusable knowledge, auto-load on keywords | 📚 SKILL | Default choice |
| Skill + needs tool sandboxing | ⚡ COMMAND (wrapper) | Add Command layer for `allowed-tools` |
| Skill + dangerous operation | ⚡ COMMAND (wrapper) | Add Command layer for explicit trigger |
| Skill + structured arguments | ⚡ COMMAND (wrapper) | Add Command layer for `$ARGUMENTS` validation |
| Skill + frequent shortcut | ⚡ COMMAND (wrapper) | Add Command layer for discoverability |

- Skill = Agent's brain extension (default)
- Command = Optional UI + security wrapper (only when needed)

---

## Case 6: Multiple Agents share one Skill

**Question:** "Can multiple Agents share one Skill?"

**Answer:** ✅ **Yes**

- Skills are general-purpose modules
- Example: `Logging.Skill` used by DevAgent, TestAgent, DeployAgent
- Each Agent uses Skill within its own permission scope
- Avoid Skills that modify shared mutable state

---

## Case 7: One Agent handles everything

**Question:** "If one Agent handles everything internally, are Skills/Sub-agents needed?"

**Answer:** ❌ **Anti-pattern. Split it.**

| Problem | Solution |
|---------|----------|
| Agent prompt bloated | Extract common knowledge → Skills |
| Duplication across agents | Share Skills |
| Need parallel work | Split into Sub-agents |

- Concise, specialized agents > monolithic super-agent

---

## Case 8: Too many Skills confuse Agent

**Question:** "If there are 50+ Skills, won't Agent get confused?"

**Answer:** **Managed through Skill discovery**

- Well-designed systems: Agent analyzes prompt → selects relevant Skills
- Selection via keyword matching or vector search
- Administrator's job:
  - Clear "when to use" descriptions
  - Consolidate overlapping Skills
  - Categorize by domain
  - Archive unused Skills

---

## Case 9: Too many Commands

**Question:** "Is having many similar Commands bad? e.g., `/build-api`, `/build-ui`"

**Answer:** ✅ **Yes, consolidate them. Most could be Skills directly invoked.**

| Problem | Solution |
|---------|----------|
| `/build-api`, `/build-ui`, `/build-web` | One `/build <target>` Command + shared Build.Skill |
| Many similar Commands | Evaluate: do they really need Command wrapper? |

**Key insight:** If a Command doesn't add platform constraints (`allowed-tools`, dangerous ops, structured args), it's probably just a Skill that should be invoked directly.

- Keep Command list small and memorable
- Delegate detailed logic to Skills
- Commands = UI/UX convenience + security wrapper, not logic storage
- When in doubt: use Skill directly, add Command wrapper only if justified

---

## Case 10: Procedure must run every time

**Question:** "If a procedure must always execute in specific scenarios, should it be a Skill?"

**Answer:** ❌ **No, embed directly**

- Skills are "used when needed" (optional)
- Always-required procedures → embed in Command or Agent's core workflow
- Example: "Audit log after login" → part of Auth Agent's mandatory flow, not a Skill

---

---

## Case 11: Command or Agent Ambiguity

**Question:** "Generate API documentation from code" - Command or Agent?

**Answer:** **상황에 따라 다름**

| Scenario | Result | Reason |
|----------|--------|--------|
| Simple JSDoc extraction | ⚡ COMMAND | Fixed procedure, no judgment |
| Code analysis + doc generation | 🤖 AGENT | Needs to understand code semantics |
| Integration with existing docs | 🤖 AGENT | Requires contextual decisions |
| Template-based generation | ⚡ COMMAND | Predictable transformation |

**Decision criteria:**
- Does it require understanding code meaning? → Agent
- Is it a mechanical transformation? → Command
- Does it need to make contextual decisions? → Agent

---

## Case 12: Skill vs Rule Distinction

**Question:** "Project coding standards" - should this be a Skill or a Rule (CLAUDE.md)?

**Answer:** **적용 범위에 따라 결정**

| Application Scope | Result | Example |
|-------------------|--------|---------|
| Specific domain only | 📚 SKILL | "React component patterns" (only when writing React) |
| All code, always | 📋 RULE | "Never commit secrets" (always enforced) |
| Specific file types | 📚 SKILL | "Python docstring format" (only .py files) |
| Project-wide conventions | 📋 RULE | "Use kebab-case for files" (all files) |

**Decision criteria:**
- Must it apply to ALL work? → Rule (CLAUDE.md/AGENTS.md)
- Should it auto-load only for specific contexts? → Skill
- Is it triggered by keywords? → Skill
- Is it a hard constraint? → Rule

---

## Case 13: Command-as-Wrapper: When is a Command actually needed?

**Question:** "I have a Skill. When should I wrap it in a Command?"

**Answer:** **Only when platform-level features are required.**

Command wrapper is justified ONLY for:

| Constraint | Example | Justification |
|-----------|---------|---------------|
| **Tool Sandboxing** | `/deploy` needs `allowed-tools: Bash(docker:*)` | ✅ Restrict dangerous tools |
| **Dangerous Operation** | `/delete-database` requires explicit trigger | ✅ Prevent accidental execution |
| **Structured Arguments** | `/create-user` with validated `$ARGUMENTS` | ✅ Input validation at platform level |
| **Frequent Shortcut** | `/lint` in `/` menu for discoverability | ✅ Common human entry point |

**Anti-pattern examples:**

❌ **Command wrapping a Skill without adding constraints:**
```
/organize-skill → just loads meta-skill directly
(No tool restriction, not dangerous, no structured args, not frequent)
→ Use Skill directly, no Command wrapper needed
```

✅ **Justified Command wrapper:**
```
/deploy → loads deploy-agent with allowed-tools: Bash(docker:*)
(Dangerous operation + tool restriction)
→ Command wrapper justified
```

**Decision rule:**
- If the Command adds ZERO platform constraints → it's not a wrapper, it's just a Skill
- If the Command adds ANY platform constraint → wrapper is justified

---

## Quick Reference

| Situation | Do This |
|-----------|---------|
| Agent needs it automatically | → Skill |
| Skill needs platform constraints | → Add Command wrapper |
| Complex reasoning/planning | → Agent |
| Always applies (style guide) | → Rules (CLAUDE.md) |
| Must run every time | → Embed in workflow |
| Multiple similar commands | → One Command + Skill |
| One agent doing everything | → Split to specialized agents |
| Command or Agent unclear | → Check if needs code understanding (Case 11) |
| Skill or Rule unclear | → Check application scope (Case 12) |
| Command wrapper justified? | → Check Case 13 (platform constraints) |
