# Meta-Skill & Meta-Agent Design Report Prompt

> Use this prompt to request an AI agent to write a comprehensive report for designing Meta-Skills or Meta-Agents.

---

## Prompt

```
You are an AI Agent Architect. Analyze the reference patterns below and write a comprehensive report for designing "Skills that create Skills (Meta-Skill)" or "Agents that create Agents (Meta-Agent)".

## Report Table of Contents

1. **Executive Summary**
   - Definition and purpose of Meta-Skill/Agent
   - Core value proposition

2. **Reference Analysis**
   - Pattern summary from each reference repository
   - Common patterns and differentiated approaches

3. **Skill Architecture Design**
   - SKILL.md structure standard
   - Directory layout conventions
   - Progressive Disclosure patterns
   - Scripts/References/Assets usage guide

4. **Agent Architecture Design**
   - AgentConfig interface standard
   - Model tier routing strategy
   - Prompt metadata system
   - Tools permission design

5. **Meta-Skill Design**
   - Skill creation workflow
   - Automation scripts (init, validate, package)
   - Quality assurance checklist

6. **Meta-Agent Design**
   - Agent creation workflow
   - Dynamic prompt building
   - Orchestration patterns

7. **Environment Configuration**
   - Claude Code/OpenCode setup

8. **Implementation Roadmap**
   - Phase 1: Basic structure
   - Phase 2: Automation tools
   - Phase 3: Validation and testing

9. **Appendix**
   - Code templates
   - Checklists
   - Anti-pattern list

---

## Reference Patterns to Analyze

### A. Skill Patterns (Based on 63 SKILL.md Analysis)

#### SKILL.md Standard Structure
```yaml
---
name: skill-name           # Required: kebab-case
description: |             # Required: trigger conditions + purpose
  When to use this skill and what it does.
  Include trigger phrases like "summon the council", "clarify requirements"
---
# Skill Title

[Markdown instructions - loaded only after skill triggers]

## Usage / Quick Start
## References (if needed)
## Guidelines
```

#### Directory Layout
```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions
├── scripts/              # Optional: executable code (bash/python)
│   └── init_skill.py     # Skill initialization script
├── references/           # Optional: on-demand loaded docs
│   └── patterns.md       # Detailed pattern guide
└── assets/               # Optional: templates, images, fonts
    └── template/         # Boilerplate
```

#### Progressive Disclosure Principles
1. **Metadata** (name + description) - Always loaded into context (~100 words)
2. **SKILL.md body** - Loaded when skill triggers (<5k words)
3. **Bundled resources** - On-demand loaded when Claude needs (unlimited)

#### Core Principles (Based on skill-creator)
- **Conciseness is key**: Context window is a public good. Don't add what Claude already knows
- **Set appropriate freedom levels**: Adjust specificity based on task fragility and variability
  - High freedom: Text instructions (multiple valid approaches)
  - Medium freedom: Pseudocode/parameterized scripts (preferred pattern exists)
  - Low freedom: Specific scripts (fragile operations, consistency required)

---

### B. Agent Patterns (Based on 34 Agent Files Analysis)

#### AgentConfig Interface (TypeScript)
```typescript
interface AgentConfig {
  name: string;           // e.g., "architect", "explore"
  description: string;    // Selection guide (when to use)
  prompt: string;         // System prompt (or load from .md file)
  tools: string[];        // Allowed tools: ['Read', 'Glob', 'Edit', ...]
  model?: ModelType;      // 'opus' | 'sonnet' | 'haiku' | 'inherit'
  metadata?: AgentPromptMetadata;  // For dynamic prompt generation
}

interface AgentPromptMetadata {
  category: AgentCategory;     // exploration | specialist | advisor | utility | orchestration
  cost: AgentCost;             // FREE | CHEAP | EXPENSIVE
  triggers: DelegationTrigger[];  // Delegation conditions
  useWhen?: string[];          // When to use
  avoidWhen?: string[];        // When to avoid
  promptAlias?: string;        // Alias for prompts
}
```

#### Model Tier Routing
| Tier | Model | Use Cases |
|------|-------|-----------|
| HIGH | opus | Complex analysis, architecture, debugging, strategic planning |
| MEDIUM | sonnet | Standard tasks, medium complexity |
| LOW | haiku | Simple lookups, fast operations, exploration |

#### Agent Categories
| Category | Examples | Purpose |
|----------|----------|---------|
| **orchestration** | sisyphus, atlas, orchestrator | Task coordination, delegation |
| **specialist** | architect, designer, writer | Domain expertise |
| **exploration** | explore, librarian, researcher | Search and research |
| **advisor** | oracle, critic, analyst | Strategic consultation (read-only) |
| **utility** | executor, vision | General helpers |

#### Agent Definition Example (oh-my-claudecode)
```typescript
export const architectAgent: AgentConfig = {
  name: 'architect',
  description: 'Architecture & Debugging Advisor. Use for complex problems, root cause analysis.',
  prompt: loadAgentPrompt('architect'),  // Load from /agents/architect.md
  tools: ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch'],
  model: 'opus'
};

// Tier variant
export const architectMediumAgent: AgentConfig = {
  name: 'architect-medium',
  description: 'Standard Analysis (Sonnet). Use for moderate analysis.',
  prompt: loadAgentPrompt('architect-medium'),
  tools: ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch'],
  model: 'sonnet'
};
```

---

### C. Meta-Skill Reference (skill-creator Analysis)

#### 6-Phase Skill Creation Process
1. **Understand**: Grasp skill through concrete examples
2. **Plan**: Identify reusable content (scripts, references, assets)
3. **Initialize**: Run `init_skill.py`
4. **Edit**: Implement resources and write SKILL.md
5. **Package**: Create .skill file with `package_skill.py`
6. **Iterate**: Improve based on real usage

#### Automation Scripts
```bash
# Initialize skill
scripts/init_skill.py <skill-name> --path <output-directory>

# Package skill (includes validation)
scripts/package_skill.py <path/to/skill-folder> [output-dir]
```

---

### D. Orchestrator Patterns (oh-my-opencode, oh-my-claudecode)

#### Orchestrator Core Behaviors
1. **Intent Gate**: Classify intent on every message
2. **Codebase Assessment**: Evaluate codebase maturity
3. **Exploration & Research**: Parallel agent execution
4. **Implementation**: TODO-based execution
5. **Failure Recovery**: Recovery strategy on failures
6. **Completion**: Verify before completing

#### Delegation Prompt Structure (7 Sections Required)
```
1. TASK: Atomic, specific goal
2. EXPECTED OUTCOME: Concrete deliverables with success criteria
3. REQUIRED SKILLS: Skills to invoke
4. REQUIRED TOOLS: Explicit tool whitelist
5. MUST DO: Exhaustive requirements (nothing implicit)
6. MUST NOT DO: Forbidden actions
7. CONTEXT: File paths, existing patterns, constraints
```

---

### E. Plugin/Extension Patterns (plugins-for-claude-natives)

#### Agent Council Pattern (Multi-AI Consensus)
- Collect opinions from multiple AI models
- Chairman synthesizes final conclusion
- Parallel execution optimizes response time

#### Plugin Structure
```
plugin-name/
├── skills/
│   └── skill-name/
│       ├── SKILL.md
│       └── scripts/
├── references/
├── AGENTS.md
└── README.md
```

---

### F. Supported Environments

| Environment | Multi-Model | Sub-agents | MCP | LSP | Hooks |
|-------------|-------------|------------|-----|-----|-------|
| **Claude Code** | Yes | Yes | Yes | Yes | Yes |
| **OpenCode** | Yes | Yes | Yes | Yes | Yes |

---

## Report Writing Guidelines

### Format Requirements
- **Language**: English (technical terms as-is)
- **Length**: 3000-5000 words
- **Structure**: Markdown, use tables and code blocks
- **Tone**: Technical but practical, immediately actionable insights

### Must Include
1. Strengths/weaknesses comparison table by reference
2. Recommended SKILL.md template
3. Recommended AgentConfig template
4. Meta-Skill workflow diagram
5. Meta-Agent workflow diagram
6. Implementation priority matrix
7. Anti-pattern checklist
8. **Platform compatibility matrix** (Claude Code, OpenCode)
9. **Graceful Degradation strategy** (Full → Reduced workflow)

### Questions to Consider
- How can we extend/improve the existing skill-creator?
- What is the optimal scope for agent creation automation?
- How can we systematize quality assurance?
- How to apply Progressive Disclosure to Meta-Skills?

---

## Reference Locations

| Resource | Path |
|----------|------|
| skill-creator | `skills/skills/skill-creator/SKILL.md` |
| skill template | `skills/template/SKILL.md` |
| oh-my-claudecode agents | `oh-my-claudecode/src/agents/` |
| oh-my-opencode agents | `oh-my-opencode/src/agents/` |
| orchestrate skill | `oh-my-claudecode/skills/orchestrate/SKILL.md` |
| agent-council plugin | `plugins-for-claude-natives/plugins/agent-council/` |
| Full SKILL.md list | 63 files (each subdirectory)

---

Start writing the report. Comprehensively analyze the patterns above and present actually implementable Meta-Skill and Meta-Agent designs.
```

---

## Usage

1. Send this prompt to Claude, GPT, or other AI agents
2. Provide access to reference files (or use the pattern summaries above)
3. Implement Meta-Skill/Meta-Agent based on the generated report

## Expected Outputs

- Comprehensive analysis report (3000-5000 words)
- SKILL.md template
- AgentConfig template
- Workflow diagrams
- Implementation roadmap
- Anti-pattern checklist
- **Platform compatibility matrix** (Claude Code, OpenCode)
- **Workflow guide**
