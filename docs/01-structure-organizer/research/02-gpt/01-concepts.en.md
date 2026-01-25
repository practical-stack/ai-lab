---
title: "Concept Definitions & Boundaries"
description: "Precise definitions and separation of Command, Skill, Agent concepts with cross-framework terminology mapping and boundary case Q&As."
type: explanation
tags: [Architecture, AI]
order: 1
related: "./01-concepts.ko.md"
---

# AI Agent Architecture: Command, Skill, Agent Design Guide

## A. Concept Definitions & Boundaries (Precise Separation)

### Background on Terminology Consistency

The terms "Command", "Skill", and "Agent" are used slightly differently across various AI agent ecosystems.

| Framework                        | Terminology Usage                                              |
| -------------------------------- | -------------------------------------------------------------- |
| OpenAI LangChain / Autonomous Agents | Centered on "Tools" and "Actions", rarely uses "Skill"        |
| Cursor / Claude Code / OpenCode  | Clearly distinguishes Commands, Skills, Agents                 |
| Microsoft Semantic Kernel        | Calls function collections "Skills" but has no "Command" concept |

In **Claude Code/OpenCode-based environments**, Command/Skill/Agent are officially defined, so we distinguish concepts according to this standard.

---

### Command

> **"What to do"** - Precise instruction

**Definition:**

- Primarily triggered directly by humans using slash ("/") command format
- Deterministically requires the agent to perform a specific task
- Markdown script containing fixed prompts or procedures
- Stored globally or locally in the project
- File name becomes the slash command name (e.g., `commands/deploy.md` → `/deploy`)

**Input/Output:**

- **Input:** Receives parameters as needed and inserts them into prompts (e.g., `/release 1.2.3`)
- **Output:** Response or code changes produced by the agent executing the Command content

**State/Side Effects:**

- Consumes context only at execution time (no burden normally)
- May cause side effects such as actual tool calls or code changes during execution

**Failure:**

- Immediately reports error or retries on tool errors or unmet conditions
- Causes: Incorrect arguments, tool failures, prompt limitations, etc.

**Boundaries:**

- Only operates when **explicitly called** by user or parent agent
- Agent does not automatically select Commands
- Not conditionally loaded like Skills

---

### Skill

> **"How to do it"** - Reusable knowledge/procedure

**Definition:**

- Module bundling specialized knowledge and steps for a specific domain or task area
- Agent automatically loads based on situation, or user calls when needed
- Managed as folder units (domain containers)
- Composed of `SKILL.md` metadata and subordinate workflow files

**Input/Output:**

- **Input:** Trigger conditions (keywords, situations) are defined, automatically loads when relevant
- **Output:** No independent final output → Injected into agent conversation context to change behavior/response

**State/Side Effects:**

- Primarily prompt-level knowledge
- May include scripts or resource files (CLI scripts, etc.) when needed
- Skill itself has no state and behaves the same each time it's loaded

**Failure:**

- Loading failure is rare (if keyword matching fails, it simply doesn't load)
- Errors in Skill procedures may cause failure during agent execution

**Boundaries:**

- Always operates within the agent's context
- **Does not reason or plan on its own**
- LLM decides whether and in what order to use Skills
- Key difference from Command: **Automatically loads when relevant**
- Understood as "knowledge/procedures the agent knows"

---

### Agent

> **"Who performs the work"**

**Definition:**

- Intelligent work coordinator
- LLM instance (or process) given a specific role and goal
- Also called "worker profile"

**Key Functions:**

- Receives user input or parent commands (goals) and establishes plans (Workflow/Plan)
- Selects and loads necessary Skills
- Calls appropriate tools (functions, CLI) to perform work
- Reasons through multiple steps for complex problem solving
- Creates **Sub-agents** in parallel when needed to divide work

**Input/Output:**

- **Input:** Human prompts or parent system instructions → Set as **Goal**
- **Output:** Produces final results (explanations, code, summaries, etc.) or passes to other agents/systems

**State:**

- Maintains memory/context of conversation history, progress, etc.
- Has its own system prompt (role instructions) and tool access scope
- Uses independent context window when needed (prevents main agent context pollution)

**Side Effects:**

- Executes all actions that affect the external world through tools
- Code modifications, web data collection, CI pipeline execution, etc.
- **Layer where permission management and restrictions are important**

**Failure:**

- Goal unachievable, infinite loops, context overflow, accumulated tool failures, etc.
- Retries with own heuristics or terminates after reporting intermediate results and failure causes

**Boundaries:**

- Does not create new knowledge on its own
- Operates within given model and Skills/Tools
- Each Agent is an independent execution unit with **separate system prompt and permissions**
- One Agent can create another Agent (operates in isolated context)
- Difference from Skill: Skill is static knowledge, **planning/reasoning subject is the Agent**

**Alternative Terminology Mapping Table:** Similar terms across major frameworks:

#### Command (Cursor/Claude Code)

| Other Environment Term | Description |
|------------------------|-------------|
| Workflow / Slash Command | "Workflow" in Claude Code documentation is same as former "Command" |
| Function / Tool Action | Pre-defined function calls in OpenAI function calling |
| Intent Trigger | Specific command called by user in conversational bots |

#### Skill (Agent Skill Standard)

| Other Environment Term | Description |
|------------------------|-------------|
| Skill | Same (modularized conversation skills in IBM Watson Assistant, etc.) |
| Knowledge Pack / Rule | Early Cursor versions used Rules like Skills |
| Prompt Template / Chain | Chains or prompt sets designed for specific tasks in LangChain |

#### Agent (Claude/Cursor)

| Other Environment Term | Description |
|------------------------|-------------|
| Sub-agent | User-defined agent in Claude |
| AI Worker / Bot | General autonomous agents |
| Planner / Orchestrator | Semantic Kernel's Plan is similar to Agent |
| Assistant Instance | Assistant that operates according to prompt in OpenAI API |

#### Tool (Function/API/CLI)

| Other Environment Term | Description |
|------------------------|-------------|
| Tool | Same (LangChain, etc.) |
| MCP Function | Claude's Model-Context-Protocol tool |
| Function (API) | OpenAI function |
| Action | Actions taken by LLM in ReAct framework |

> **Summary:** Command is called "Workflow" or "Slash command" depending on the environment, and Skill may be treated similarly to "Rule" or simple prompt templates in other contexts. Agent is also commonly called "autonomous agent" or "Subagent" (sub-agent).

---

## 10 Boundary Cases Often Confused – Q/A Format Test

Below are 10 cases where Command, Skill, and Agent boundaries are easily confused, organized as Q&A.

### 1. Q: "Can I call multiple skills sequentially inside a command?"

**A:** Yes, it's possible.

- Command is essentially a script that executes one designated workflow
- That procedure can load multiple Skills or include multiple steps
- Example: `/release` command does "load release skill → perform checklist → load notification skill → send notification"
- Command's role: Bundles multiple tasks for convenient execution with a single trigger

**Caveats:**
- Command itself only follows a set order, doesn't reason
- Agent monitors whether each step succeeds
- On failure, stops next step or handles rollback

### 2. Q: "If a Skill includes both LLM prompts and tool calls, doesn't it make its own judgments and become the same as an agent?"

**A:** They are different.

**Skill Characteristics:**
- Just a predefined instruction set, **doesn't judge on its own (loop)**
- Even if procedures like "run tests after code change" are written, the execution subject is the Agent
- Even when including tool calls, it's telling the Agent "use it this way"
- The Skill file itself doesn't have an embedded execution engine

**Agent Characteristics:**
- Reads Skill content and follows it while controlling sequence
- Agent performs branching or additional judgment when needed during execution
- Self-reasoning and decision-making for new situations

> **Analogy:** Skill = "script", Agent = "interprets and executes the script, adapts when necessary"

### 3. Q: "Can an agent automatically use certain Commands?"

**A:** Yes, in certain implementations it's possible.

**When Possible:**
- In some frameworks like Cursor, agents can autonomously execute Commands based on situation
- When "multi-step workflow" is required, if a registered Command is found, it can be called like a tool

**General Principles:**
- Commands are principally for explicit human instructions
- In Claude Code, Command has been reorganized as "Workflow"
- Agents primarily act autonomously based on Skills
- Commands are principally manual triggers; Skills/Tools are used for automatic decision-making

**Design Recommendations:**
- If you want an agent to automatically call a Command
- → It's clearer to promote that Command's content to a Skill or integrate it into Agent logic

### 4. Q: "If knowledge must always be applied without human direct invocation, what's better than a Skill?"

**A:** Using a **Rule** is appropriate.

**Skill Limitations:**
- Instructions that must always be applied to all requests, like "coding style guide"
- If made as a Skill, may be missed because it only responds to related keywords

**How to Apply Rules:**
- Set as permanent rules in system prompt
- Add as always-applied rules in Cursor's `.cursor/rules/`

**Summary:**
- Global invariant rules → Agent's basic knowledge or separate Rule
- Skill → Limited to **"modules added when needed"**

### 5. Q: "Both Command and Skill are reusable, when should I make a Skill vs Command?"

**A:** Decide based on usage method and role.

| Category | Skill | Command |
|----------|-------|---------|
| **Usage Timing** | Agent recognizes need and loads itself | User specifies timing and executes |
| **Purpose** | Module referenceable by other Skills or Agents | Like a UI shortcut for combined task invocation |
| **Content** | Contains logic or policies | Combined task execution |

**Selection Criteria:**
- "Should the agent decide when to use this feature on its own?" → **Skill**
- "Should I command it each time?" → **Command**

### 6. Q: "If there are multiple Agents, can they share one Skill?"

**A:** Yes, Skills are general-purpose modules that can be shared by multiple agents.

**Shareability:**
- Example: Logging Skill → Both developer agent and testing agent can use it
- In Claude or Cursor environments, Skills are open standards
- Designed to be compatible across multiple platforms

**Caveats:**
- Each Agent uses Skills only within its own permission/role scope
- When specific tools (e.g., deployment permissions) are needed, only Agents with access to those tools will work properly
- Concurrency issues are usually absent, but avoid designs where Skills modify the same resource (e.g., temp files)

### 7. Q: "If I make one agent handle everything internally, are Skills or Sub-agents really necessary?"

**A:** Not recommended. Putting all instructions into one Agent is an anti-pattern.

**Problems:**
- May seem simple at first but Agent prompt becomes bloated
- Duplication creates management difficulties and confusion
- Claude also evaluates "agents are better when concise and specialized"

**Advantages of Skill/Sub-agent:**

| Method | Effect |
|--------|--------|
| Separate knowledge as Skills | Remove duplication between multiple Agents, save context |
| Separate roles as Sub-agents | Enables parallel processing, advantageous for context management |

**Recommendations:**
- Common logic → Modularize as Skills
- Independent work → Separate as Sub-agents

### 8. Q: "If there are too many Skills, won't the agent get confused about what to use?"

**A:** Skill explosion can be managed through administration.

**Systematic Solutions:**
- When Skills exceed dozens, Claude etc. only loads a few relevant ones through Skill discovery
- In well-designed environments, Agent analyzes prompt → selects most appropriate Skill
  - Keyword matching
  - Vector search
- No major performance issues even with many Skills

**Administrator's Role:**
- Describe clearly "when to use" for each Skill
- Clean up overlapping Skills
- Categorize Skills by domain
- Periodically archive or consolidate infrequently used ones

**Example:**
- 5 "database\_\*" skills → Bundle into one "Database" Skill with 5 workflows
- Reduces Agent confusion + easier maintenance

### 9. Q: "Is overusing Commands bad? e.g., 2 separate commands build-api, build-ui vs one build skill."

**A:** Avoid excessive command separation.

**Problems:**
- Too many Commands makes it hard for users to remember or find them
- Potential conflict with Skill-based automation

**Recommended Solutions:**
- Multiple Commands doing similar work → Consolidate into one Skill + one Command
- Example: `/build-api`, `/build-ui` (similar procedures) → Common Build skill + `/build api` parameter for branching

**Principles:**
- Keep Command list small, memorable, and stable
- Delegate detailed logic to Skills
- Commands = UI/UX convenience means (not logic storage means)
- Unify same type of work into one Command

### 10. Q: "If a procedure in a Skill must be executed every time, isn't it better to just make it a Command instead of keeping it as a Skill?"

**A:** Yes.

**Skill Characteristics:**
- An option that agents **"use when needed"**
- If it's a procedure that's always used in specific scenarios, there's little benefit to separating it as a Skill

**Recommended Design:**
- Procedures that must be executed every time → Include directly in Command or Agent's inherent workflow
- Example: "Leave audit log after user login"
  - If separated as Skill → Risk of agent missing it
  - → Include in Agent's basic scenario or specify as a step in Command sequence

**When to Separate as Skill:**
- When reused intermittently across multiple scenarios
- Limited to when there's value in separating for management
