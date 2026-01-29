# Pattern: File Ownership Partitioning

**Difficulty:** Advanced
**Impact:** High
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-6-file-ownership-partitioning)

---

## Problem
Parallel agents create merge conflicts. LLM agents have no merge capability.

## Solution
Assign exclusive file ownership per worker. Handle shared files in a sequential integration phase.

## Implementation
Classify files into 3 categories:
1. **Exclusive** — one worker owns it
2. **Shared** — config files, handled sequentially
3. **Boundary** — cross-module imports, read-all / write-by-analysis

Store ownership in JSON: `{ "worker-1": ["src/api/**"], "worker-2": ["src/ui/**"], "shared": ["package.json"] }`

## Verification
- [ ] No two workers own the same file
- [ ] Shared files have explicit handling
- [ ] Integration phase runs sequentially
- [ ] Fallback to sequential if partitioning fails

## See Also
- [Autonomous Pipeline](./10-autonomous-pipeline.md) — Uses this for parallel execution
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-6-file-ownership-partitioning)
