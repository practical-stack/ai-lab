# Pattern 10: Category + Skill Delegation System

**Effort:** 3-5 days | **Impact:** Very High | **Level:** Full System  
**Source:** [01-architecture.md](../01-architecture.md)

---

## The Problem

- Different tasks need different models
- A frontend task doesn't need the same model as deep reasoning
- Generic delegation wastes expensive models on trivial tasks
- Domain expertise isn't injected into subagents

---

## The Solution

1. **Categories**: Route tasks to domain-optimized models
2. **Skills**: Inject domain expertise into subagents

```typescript
delegate_task({
  category: "visual-engineering",  // Selects model
  load_skills: ["playwright", "frontend-ui-ux"],  // Injects expertise
  prompt: "..."
})
```

---

## Category System

Categories route tasks to appropriate models:

| Category | Domain / Best For | Model Type |
|----------|-------------------|------------|
| `visual-engineering` | Frontend, UI/UX, design, styling | Visual-optimized |
| `ultrabrain` | Deep reasoning, complex architecture | Highest capability |
| `artistry` | Highly creative/artistic tasks | Creative-optimized |
| `quick` | Trivial tasks, single file changes | Fast/cheap |
| `unspecified-low` | General tasks, low effort | Balanced |
| `unspecified-high` | General tasks, high effort | Higher capability |
| `writing` | Documentation, prose, technical writing | Writing-optimized |

---

## Skill System

Skills inject domain expertise that the base model doesn't have:

| Skill | Expertise Domain |
|-------|------------------|
| `playwright` | Browser automation, testing |
| `frontend-ui-ux` | Component design, styling, accessibility |
| `git-master` | Atomic commits, history search, rebase |

### How Skills Work

1. Skill metadata (frontmatter) is always available
2. When skill is loaded, instructions are injected
3. Agent gains domain expertise for the task

---

## Selection Protocol

### Step 1: Select Category

Ask: "What domain is this task in?"

| Task | Category |
|------|----------|
| "Create login form" | `visual-engineering` |
| "Design microservice architecture" | `ultrabrain` |
| "Fix typo in README" | `quick` |
| "Write user guide" | `writing` |
| "Create logo animation" | `artistry` |

### Step 2: Evaluate Skills

For EVERY available skill, ask: "Does this skill's expertise overlap with my task?"

- If YES → Include in `load_skills`
- If NO → Justify why (see below)

### Step 3: Justify Omissions

If you choose NOT to include a potentially relevant skill:

```
SKILL EVALUATION for "git-master":
- Skill domain: Git operations, atomic commits
- Task domain: Frontend component creation
- Decision: OMIT
- Reason: No git operations involved in this task
```

---

## Delegation Pattern

```typescript
// Full delegation with category and skills
delegate_task({
  category: "visual-engineering",
  load_skills: ["playwright", "frontend-ui-ux"],
  prompt: `
## 1. TASK
Create a responsive navigation component

## 2. EXPECTED OUTCOME
- [ ] Files: src/components/Navigation.tsx created
- [ ] Responsive: Works on mobile and desktop
- [ ] Accessible: Keyboard navigation works
- [ ] Verification: Playwright tests pass

## 3. REQUIRED SKILLS
- frontend-ui-ux: Component design patterns
- playwright: E2E testing

## 4. REQUIRED TOOLS
- Write: Create component file
- Bash: Run tests

## 5. MUST DO
- Use Tailwind CSS for styling
- Include mobile hamburger menu
- Add keyboard navigation
- Create Playwright test

## 6. MUST NOT DO
- Do NOT use CSS-in-JS
- Do NOT skip accessibility

## 7. CONTEXT
- Existing nav: src/components/OldNav.tsx (for reference)
- Design system: src/styles/
  `
})
```

---

## Implementation: Category Configuration

```typescript
interface CategoryConfig {
  name: string
  model: string
  description: string
  useCases: string[]
}

const categories: CategoryConfig[] = [
  {
    name: "visual-engineering",
    model: "gemini-3",  // Visual-optimized
    description: "Frontend, UI/UX, design work",
    useCases: [
      "Component creation",
      "Styling and CSS",
      "Responsive design",
      "Animation"
    ]
  },
  {
    name: "ultrabrain",
    model: "claude-opus-4.5",  // Highest capability
    description: "Deep logical reasoning",
    useCases: [
      "Architecture decisions",
      "Complex debugging",
      "System design",
      "Performance optimization"
    ]
  },
  {
    name: "quick",
    model: "claude-haiku",  // Fast and cheap
    description: "Trivial single-file changes",
    useCases: [
      "Typo fixes",
      "Simple modifications",
      "Config changes"
    ]
  }
  // ... more categories
]
```

---

## Implementation: Skill Loading

```typescript
interface Skill {
  name: string
  description: string
  content: string
}

function loadSkills(skillNames: string[]): string {
  const skills = skillNames.map(name => {
    const skill = skillRegistry.get(name)
    return `<skill-instruction name="${skill.name}">
${skill.content}
</skill-instruction>`
  })
  
  return skills.join('\n\n')
}

// Inject into prompt
const fullPrompt = `
${loadSkills(["playwright", "frontend-ui-ux"])}

<user-request>
${userPrompt}
</user-request>
`
```

---

## Why Both Category AND Skills?

| Aspect | Category | Skills |
|--------|----------|--------|
| Purpose | Select model | Inject expertise |
| Scope | Task routing | Domain knowledge |
| Effect | Performance characteristics | Behavioral guidance |

Example:
- Category `visual-engineering` → Uses Gemini (good at visual)
- Skill `playwright` → Knows how to write browser tests
- Skill `frontend-ui-ux` → Knows component design patterns

Together: The right model WITH the right knowledge.

---

## Adoption Checklist

- [ ] Define category taxonomy for your domains
- [ ] Map categories to model configurations
- [ ] Create skill definitions for domain expertise
- [ ] Implement category-based routing
- [ ] Document skill trigger phrases
- [ ] Test combinations of categories + skills

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Empty `load_skills` without justification | Always evaluate all skills |
| Using expensive category for trivial tasks | Match category to effort |
| Not injecting domain skills | Always check relevant skills |
| Hardcoding model in delegations | Use category abstraction |

---

## See Also

- [05-delegation-prompt.md](./05-delegation-prompt.md) - Prompt structure
- [08-skill-format.md](./08-skill-format.md) - Creating skills
- [../01-architecture.md](../01-architecture.md) - Full architecture
