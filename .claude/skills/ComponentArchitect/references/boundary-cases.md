# Boundary Cases

10 common confusions when distinguishing Command, Skill, and Agent.

## Case 1: Command calls multiple Skills internally

**Question:** "Can a Command load and use multiple Skills?"

**Answer:** ✅ **Yes**

- Command can load multiple Skills as part of its workflow
- Example: `/release` command loads `Version.Skill` → `Changelog.Skill` → `Notification.Skill`
- Command orchestrates the order; Skills provide the knowledge

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

**Answer:** **Depends on who decides when to use it**

| Who Decides | Component |
|-------------|-----------|
| Agent decides automatically | 📚 SKILL |
| Human decides explicitly | ⚡ COMMAND |

- Skill = Agent's brain extension
- Command = User's shortcut button

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

**Answer:** ✅ **Yes, consolidate them**

| Problem | Solution |
|---------|----------|
| `/build-api`, `/build-ui`, `/build-web` | One `/build <target>` + shared Build.Skill |

- Keep Command list small and memorable
- Delegate detailed logic to Skills
- Commands = UI/UX convenience, not logic storage

---

## Case 10: Procedure must run every time

**Question:** "If a procedure must always execute in specific scenarios, should it be a Skill?"

**Answer:** ❌ **No, embed directly**

- Skills are "used when needed" (optional)
- Always-required procedures → embed in Command or Agent's core workflow
- Example: "Audit log after login" → part of Auth Agent's mandatory flow, not a Skill

---

## Quick Reference

| Situation | Do This |
|-----------|---------|
| Agent needs it automatically | → Skill |
| User must trigger explicitly | → Command |
| Complex reasoning/planning | → Agent |
| Always applies (style guide) | → Rules (CLAUDE.md) |
| Must run every time | → Embed in workflow |
| Multiple similar commands | → One Command + Skill |
| One agent doing everything | → Split to specialized agents |
