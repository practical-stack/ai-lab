# Pattern 06: Planning vs Execution Separation

**Effort:** 2-3 hours | **Impact:** Very High | **Level:** Foundation  
**Source:** [00-core-philosophy.md](../00-core-philosophy.md), [01-architecture.md](../01-architecture.md)

---

## The Problem

When planning and execution are mixed, you get:

| Problem | Description | Example |
|---------|-------------|---------|
| **Context Pollution** | Execution details contaminate planning context | Debugging logs mixed with architecture decisions |
| **Goal Drift** | Agent loses sight of original goal while executing | Starts adding unrelated features mid-task |
| **AI Slop** | Quality degrades as context window fills | Later code is worse than earlier code |
| **Token Waste** | Repeating planning context in execution | Re-explaining the goal every function |

**Without Separation:**
```
User: "Add authentication"
Agent: Starts coding → Gets confused → Adds unrelated features
       → Forgets original goal → Produces messy, incomplete code
```

---

## The Solution

Separate planning and execution into distinct phases with different agents.

**With Separation:**
```
Layer 1: Planning creates detailed plan → Reviews for gaps
Layer 2: Execution follows plan step by step → Stays focused
Result: Clean, complete implementation matching requirements
```

---

## Architecture

```
LAYER 1: PLANNING (Planner Agent)
├── Understands the full scope
├── Creates detailed plan
├── Reviews for gaps
└── Outputs: Plan document (NOT code)
           ↓
LAYER 2: EXECUTION (Executor Agent)
├── Reads the plan
├── Executes step by step
├── Stays focused on current step
└── Outputs: Working code
```

---

## Planning Agent

### Purpose
Create comprehensive plans without writing any code.

### Prompt Template

```markdown
<Role>
You are a Planning Agent. Your ONLY job is to create comprehensive plans.
You NEVER write code. You NEVER execute commands. You ONLY plan.
</Role>

<Behavior_Instructions>
## Phase 1: Interview
Ask clarifying questions to understand full scope:
- What is the desired outcome?
- What constraints exist?
- What dependencies need consideration?
- What edge cases matter?

## Phase 2: Gap Analysis
Identify what's missing from the request:
- Implicit requirements not stated
- Integration points with existing code
- Potential conflicts or breaking changes
- Missing infrastructure needs

## Phase 3: Plan Creation
Create detailed, step-by-step plan with:
- Clear task breakdown (atomic steps)
- Dependencies between tasks
- Success criteria for each step
- Edge cases to handle
- Estimated complexity per step

## Phase 4: Handoff
Output the plan in structured format for execution layer.
</Behavior_Instructions>

<Constraints>
- NEVER write code
- NEVER execute commands
- ONLY output plans in structured format
- Each step must be atomic (one action)
</Constraints>
```

### Plan Output Format

```markdown
# Plan: [Feature Name]

## Overview
[One paragraph summary of what will be built]

## Prerequisites
- [ ] [Prerequisite 1]
- [ ] [Prerequisite 2]

## Tasks

### Task 1: [Name]
- **File**: [path]
- **Action**: [create/modify/delete]
- **Description**: [what to do]
- **Success Criteria**: [how to verify]
- **Dependencies**: [previous tasks]

### Task 2: [Name]
...

## Edge Cases
- [Edge case 1]: [how to handle]
- [Edge case 2]: [how to handle]

## Verification
- [ ] All tasks complete
- [ ] Build passes
- [ ] Tests pass
- [ ] [Feature-specific verification]
```

---

## Execution Agent

### Purpose
Execute plans step by step without changing scope.

### Prompt Template

```markdown
<Role>
You are an Execution Agent. Your job is to execute plans step by step.
You follow the plan. You don't change the plan. You don't add features.
</Role>

<Behavior_Instructions>
## Phase 1: Plan Reading
Read and understand the plan completely before starting.
- Identify all tasks
- Note dependencies between tasks
- Understand success criteria for each

## Phase 2: Step Execution
For each task in order:
1. Mark task as in_progress
2. Execute the task exactly as specified
3. Verify against success criteria
4. Mark task as complete
5. Move to next task

## Phase 3: Verification
After all tasks complete:
- Run build
- Run tests
- Verify feature-specific criteria from plan
</Behavior_Instructions>

<Constraints>
- ONLY work on tasks defined in the plan
- Do NOT add features not in the plan
- Do NOT modify the plan
- Do NOT skip verification
- If blocked, report and wait (don't improvise)
</Constraints>
```

---

## Real Example

### User Request
"Add authentication to my Express app"

### Planning Phase Output

```markdown
# Plan: Express JWT Authentication

## Overview
Add JWT-based authentication with user registration, login, and protected routes.

## Prerequisites
- [ ] Express app exists with basic routing
- [ ] Database connection configured

## Tasks

### Task 1: Add Dependencies
- **Action**: Install packages
- **Command**: `bun add jsonwebtoken bcryptjs`
- **Success Criteria**: Packages in package.json

### Task 2: Create User Model
- **File**: src/models/user.ts
- **Action**: Create
- **Description**: User model with email, passwordHash, createdAt
- **Success Criteria**: Model exports User type

### Task 3: Create Auth Service
- **File**: src/services/auth.ts
- **Action**: Create
- **Description**: Functions: register, login, verifyToken
- **Success Criteria**: All functions exported, types defined

### Task 4: Create Auth Middleware
- **File**: src/middleware/auth.ts
- **Action**: Create
- **Description**: Middleware to verify JWT from Authorization header
- **Success Criteria**: Middleware exported

### Task 5: Add Auth Routes
- **File**: src/routes/auth.ts
- **Action**: Create
- **Description**: POST /register, POST /login
- **Success Criteria**: Routes respond correctly

### Task 6: Protect API Routes
- **File**: src/routes/api.ts
- **Action**: Modify
- **Description**: Add auth middleware to /api/* routes
- **Success Criteria**: Unauthenticated requests get 401

### Task 7: Add Tests
- **File**: src/services/auth.test.ts
- **Action**: Create
- **Description**: Tests for register, login, verifyToken
- **Success Criteria**: `bun test` passes

## Edge Cases
- Duplicate email registration: Return 409 Conflict
- Invalid credentials: Return 401 Unauthorized
- Expired token: Return 401 with "token expired" message
- Missing Authorization header: Return 401

## Verification
- [ ] All 7 tasks complete
- [ ] `bun run build` passes
- [ ] `bun test` passes
- [ ] Can register new user
- [ ] Can login and receive token
- [ ] Protected routes reject without token
```

### Execution Phase
Executor works through tasks 1-7 exactly as specified, marking each complete.

---

## Benefits

| Aspect | Without Separation | With Separation |
|--------|-------------------|-----------------|
| **Context** | Polluted with execution details | Planning context stays clean |
| **Focus** | Agent loses track of goal | Executor stays on task |
| **Quality** | Degrades over time | Consistent quality |
| **Review** | Hard to review mixed output | Review plan first, then code |
| **Recovery** | Hard to understand failures | Clear task-level failures |

---

## Adoption Checklist

- [ ] Define separate planning and execution prompts
- [ ] Planning agent produces document, not code
- [ ] Execution agent consumes plan, doesn't modify scope
- [ ] Plan includes atomic tasks with success criteria
- [ ] Executor marks progress on each task
- [ ] Clear handoff format between phases

---

## See Also

- [../01-architecture.md](../01-architecture.md) - Full architecture details
- [05-delegation-prompt.md](./05-delegation-prompt.md) - How to delegate to executor
- [11-todo-continuation.md](./11-todo-continuation.md) - Ensuring execution completes
