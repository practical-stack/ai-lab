# Pattern 07: Hierarchical AGENTS.md

**Effort:** 2-3 hours | **Impact:** High | **Level:** Foundation  
**Source:** [01-architecture.md](../01-architecture.md)

---

## The Problem

AI agents don't know your codebase. Without guidance:
- They read every file (wastes tokens)
- They make wrong assumptions about patterns
- They violate module constraints
- They don't know extension points

---

## The Solution

Each module has its own AGENTS.md explaining itself to AI.

---

## Directory Structure

```
project/
├── AGENTS.md                 # Project overview, global rules
├── src/
│   ├── auth/
│   │   ├── AGENTS.md         # Auth module specifics
│   │   └── ...
│   ├── database/
│   │   ├── AGENTS.md         # Database module specifics
│   │   └── ...
│   ├── api/
│   │   ├── AGENTS.md         # API module specifics
│   │   └── ...
```

---

## Root AGENTS.md Template

```markdown
# [Project Name]

## Overview
[One paragraph describing what this project does]

## Tech Stack
- Runtime: [Node/Bun/Deno]
- Framework: [Express/Next/Hono]
- Database: [PostgreSQL/MongoDB/SQLite]
- ORM: [Prisma/Drizzle/TypeORM]

## Directory Structure
| Directory | Purpose |
|-----------|---------|
| src/auth/ | Authentication and authorization |
| src/api/ | API routes and handlers |
| src/models/ | Database models |
| src/services/ | Business logic |

## Global Patterns
- Error handling: [approach]
- Logging: [library and format]
- Testing: [framework and patterns]

## Global Constraints (MUST NOT)
- Do NOT use `as any` or `@ts-ignore`
- Do NOT commit secrets or .env files
- Do NOT use npm (use bun)

## Commands
| Command | Purpose |
|---------|---------|
| `bun dev` | Start development server |
| `bun test` | Run all tests |
| `bun build` | Build for production |
```

---

## Module AGENTS.md Template

```markdown
# [Module Name]

## Purpose
What this module does and why it exists.

## Key Files

| File | Purpose |
|------|---------|
| index.ts | Module entry point, exports |
| types.ts | Type definitions |
| utils.ts | Helper functions |
| [main].ts | Main logic |
| [main].test.ts | Tests |

## Patterns to Follow

### [Pattern 1 Name]
When adding new [X], follow this pattern:
- See `[file:lines]` for reference
- [Specific instruction]

### [Pattern 2 Name]
Error handling in this module:
- Use `[ErrorClass]` from `[path]`
- [Specific instruction]

## Constraints (MUST NOT)
- Do NOT [forbidden action 1] - [reason]
- Do NOT [forbidden action 2] - [reason]

## Extension Points

### Adding a new [Entity]
1. Create type in `types.ts`
2. Add function in `[file].ts` following existing pattern
3. Export from `index.ts`
4. Add tests in `[file].test.ts`

## Dependencies
- Uses: [modules this depends on]
- Used by: [modules that depend on this]

## Testing
- Tests in `*.test.ts` alongside source
- Run: `bun test src/[module]/`
- Style: BDD with #given, #when, #then
```

---

## Real Example: Auth Module

```markdown
# Auth Module

## Purpose
Handles user authentication: registration, login, JWT tokens, session management.

## Key Files

| File | Purpose |
|------|---------|
| index.ts | Exports auth functions |
| types.ts | User, Token, Session types |
| service.ts | Core auth logic |
| middleware.ts | Express middleware |
| service.test.ts | Unit tests |

## Patterns to Follow

### Token Generation
When creating new token types:
- See `generateAccessToken` (service.ts:45-60) for pattern
- Use `jsonwebtoken` library
- Include `userId`, `type`, `iat`, `exp` in payload
- Store secret in `AUTH_SECRET` env var

### Password Hashing
- Use `bcryptjs` with salt rounds = 12
- See `hashPassword` (service.ts:20-25)

### Error Handling
- Throw `AuthError` for auth-specific errors
- Throw `ValidationError` for input errors
- See error classes in `src/errors/`

## Constraints (MUST NOT)
- Do NOT store passwords in plain text
- Do NOT log tokens or passwords
- Do NOT use MD5/SHA1 for passwords (use bcrypt)
- Do NOT expose internal user IDs in error messages

## Extension Points

### Adding a new auth method (OAuth, etc.)
1. Add provider type to `types.ts`
2. Create `providers/[name].ts` following Google OAuth pattern
3. Add route in `routes/auth.ts`
4. Export from `index.ts`

## Dependencies
- Uses: `src/database` (user storage), `src/errors`
- Used by: `src/api` (route protection), `src/services`

## Testing
- Run: `bun test src/auth/`
- Mock database with `src/test-utils/mockDb`
- Never use real tokens in tests
```

---

## Real Example: Database Module

```markdown
# Database Module

## Purpose
Database connection, models, and query utilities using Prisma.

## Key Files

| File | Purpose |
|------|---------|
| index.ts | Exports db client |
| client.ts | Prisma client initialization |
| schema.prisma | Database schema |
| migrations/ | Prisma migrations |

## Patterns to Follow

### Soft Delete
All entities use soft delete:
- Include `deletedAt: DateTime?` field
- Filter with `where: { deletedAt: null }` by default
- See User model (schema.prisma:10-20)

### Transactions
For multi-table operations:
- Use `db.$transaction([...])` for atomic operations
- See `transferFunds` (client.ts:45-60)

## Constraints (MUST NOT)
- Do NOT use raw SQL (use Prisma query builder)
- Do NOT hard delete (use soft delete)
- Do NOT modify schema without migration

## Extension Points

### Adding a new model
1. Add model to `schema.prisma`
2. Run `bun prisma migrate dev --name [name]`
3. Types auto-generated by Prisma
4. Export from `index.ts` if needed

## Commands
| Command | Purpose |
|---------|---------|
| `bun prisma generate` | Generate Prisma client |
| `bun prisma migrate dev` | Create and apply migration |
| `bun prisma studio` | Open database GUI |
```

---

## Benefits

| Without AGENTS.md | With AGENTS.md |
|-------------------|----------------|
| Agent reads every file | Agent reads AGENTS.md first |
| Guesses at patterns | Knows exact patterns to follow |
| May violate constraints | Knows explicit constraints |
| Doesn't know extension points | Clear extension instructions |

---

## Adoption Checklist

- [ ] Create root AGENTS.md with project overview
- [ ] Identify 3-5 key modules
- [ ] Create AGENTS.md for each module
- [ ] Include patterns with file:line references
- [ ] Include explicit MUST NOT constraints
- [ ] Add extension point documentation
- [ ] Keep updated as codebase evolves

---

## See Also

- [08-skill-format.md](./08-skill-format.md) - Related skill documentation
- [05-delegation-prompt.md](./05-delegation-prompt.md) - Reference AGENTS.md in context
- [../01-architecture.md](../01-architecture.md) - Architecture overview
