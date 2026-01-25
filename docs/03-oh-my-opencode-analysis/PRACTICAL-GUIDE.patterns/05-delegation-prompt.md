# Pattern 05: 7-Section Delegation Prompt

**Effort:** 1 hour | **Impact:** High | **Level:** Foundation  
**Source:** [02-design-patterns.md](../02-design-patterns.md)

---

## The Problem

Subagents are stateless - they know NOTHING except what you tell them. Incomplete prompts = incomplete work.

**Common failures:**
- Missing context → Agent makes wrong assumptions
- Vague requirements → Agent does something different
- No constraints → Agent adds unwanted features
- No expected outcome → No way to verify success

---

## The Solution

Always include all 7 sections in delegation prompts.

**Minimum Length Rule:** If your delegation prompt is under 30 lines, it's TOO SHORT.

---

## The 7 Sections

| # | Section | Purpose |
|---|---------|---------|
| 1 | TASK | What to do (one action only) |
| 2 | EXPECTED OUTCOME | How to verify success |
| 3 | REQUIRED SKILLS | Domain expertise needed |
| 4 | REQUIRED TOOLS | Which tools to use |
| 5 | MUST DO | Exhaustive requirements |
| 6 | MUST NOT DO | Forbidden actions |
| 7 | CONTEXT | Existing patterns, constraints |

---

## Implementation Template

```markdown
## 1. TASK
[Quote exact goal. Be obsessively specific. One action only.]

## 2. EXPECTED OUTCOME
- [ ] Files: [exact paths created/modified]
- [ ] Behavior: [what it should do]
- [ ] Verification: `[command]` passes

## 3. REQUIRED SKILLS
- [skill-1]: [why needed]
- [skill-2]: [why needed]

## 4. REQUIRED TOOLS
- [tool-1]: [what to use it for]
- [tool-2]: [what to use it for]

## 5. MUST DO
- [Exhaustive list of requirements]
- [Leave NOTHING implicit]
- [Include obvious things]
- [Be specific about implementation details]

## 6. MUST NOT DO
- Do NOT [forbidden action 1]
- Do NOT [forbidden action 2]
- Do NOT [anticipate rogue behavior]

## 7. CONTEXT
- File patterns: [existing conventions]
- Dependencies: [what previous tasks built]
- Constraints: [technical limitations]
```

---

## Real Example: Add Function

```markdown
## 1. TASK
Add a "deleteUser" function to src/services/user.ts

## 2. EXPECTED OUTCOME
- [ ] Files: src/services/user.ts modified
- [ ] Files: src/services/user.test.ts modified (test added)
- [ ] Function: deleteUser(id: string): Promise<void>
- [ ] Verification: `bun test src/services/user.test.ts` passes

## 3. REQUIRED SKILLS
- None required

## 4. REQUIRED TOOLS
- Read: To read existing user.ts and understand patterns
- Edit: To add the function
- Bash: To run tests

## 5. MUST DO
- Follow existing function patterns in user.ts
- Add proper error handling (throw UserNotFoundError if user doesn't exist)
- Use soft delete (set deletedAt timestamp) not hard delete
- Add corresponding test in user.test.ts
- Use same naming convention as getUser, updateUser, createUser
- Include JSDoc comment matching existing style
- Use Prisma's update() method, not raw SQL

## 6. MUST NOT DO
- Do NOT modify other files
- Do NOT add new dependencies
- Do NOT change existing functions
- Do NOT use hard delete (we need audit trail)
- Do NOT add optional parameters not specified

## 7. CONTEXT
- Pattern: See createUser (line 45-67) for function structure reference
- Database: Using Prisma ORM with soft delete pattern
- Tests: BDD style with #given, #when, #then comments
- Error handling: Custom error classes in src/errors/
- The User model already has deletedAt: DateTime? field
```

---

## Real Example: Frontend Component

```markdown
## 1. TASK
Create a "UserAvatar" component in src/components/UserAvatar.tsx

## 2. EXPECTED OUTCOME
- [ ] Files: src/components/UserAvatar.tsx created
- [ ] Files: src/components/UserAvatar.test.tsx created
- [ ] Displays: User initials in circle when no image
- [ ] Displays: User image when imageUrl provided
- [ ] Verification: `bun test src/components/UserAvatar.test.tsx` passes

## 3. REQUIRED SKILLS
- frontend-ui-ux: For component design patterns

## 4. REQUIRED TOOLS
- Read: To read existing component patterns
- Write: To create new files
- Bash: To run tests

## 5. MUST DO
- Accept props: { name: string, imageUrl?: string, size?: 'sm' | 'md' | 'lg' }
- Default size to 'md'
- Use Tailwind CSS for styling (project standard)
- Generate initials from first letter of first and last name
- Handle edge cases: single name, empty string
- Export as named export
- Include loading state for image

## 6. MUST NOT DO
- Do NOT use CSS modules (project uses Tailwind)
- Do NOT add new dependencies
- Do NOT create separate stylesheet
- Do NOT use inline styles

## 7. CONTEXT
- Styling: Project uses Tailwind CSS exclusively
- Components: See src/components/Button.tsx for pattern reference
- Testing: Using Vitest + Testing Library
- Image: Use next/image for optimization
```

---

## Why Each Section Matters

| Section | Without It |
|---------|------------|
| TASK | Agent does something different than intended |
| EXPECTED OUTCOME | No way to verify success |
| REQUIRED SKILLS | Missing domain expertise |
| REQUIRED TOOLS | Agent uses wrong/inefficient tools |
| MUST DO | Agent misses requirements |
| MUST NOT DO | Agent adds unwanted features/changes |
| CONTEXT | Agent violates existing patterns |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Too vague TASK | "Add X to Y" not "Improve the code" |
| Missing file paths | Always include exact paths |
| Implicit requirements | Make EVERYTHING explicit |
| No verification command | Include `[command]` that proves success |
| Generic MUST NOT | Anticipate specific rogue behaviors |
| Missing CONTEXT | Include existing patterns with line numbers |

---

## Adoption Checklist

- [ ] Create template file for delegation prompts
- [ ] Review existing delegations for missing sections
- [ ] Add minimum length check to your workflow
- [ ] Include concrete file paths and line numbers
- [ ] Verify prompt is 30+ lines before sending
- [ ] Track common failures to improve MUST NOT section

---

## See Also

- [06-planning-execution.md](./06-planning-execution.md) - When to delegate
- [09-session-continuity.md](./09-session-continuity.md) - Continuing delegated work
- [10-category-skill-system.md](./10-category-skill-system.md) - Choosing the right agent
