# Pattern: Atomic Task Claiming

**Difficulty:** Advanced
**Impact:** Medium
**Source:** [02-design-patterns.md](../02-design-patterns.md#pattern-7-atomic-task-claiming-sqlite-swarm)

---

## Problem
Multiple agents need to work from a shared task pool without duplication or lost tasks.

## Solution
SQLite database with ACID transactions for atomic task claiming.

## Implementation
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  description TEXT,
  status TEXT DEFAULT 'pending',
  agent_id TEXT,
  claimed_at INTEGER
);

-- Atomic claim (compare-and-swap)
BEGIN IMMEDIATE;
UPDATE tasks SET status='claimed', agent_id=?
  WHERE id=? AND status='pending';
COMMIT;
```

Heartbeat: 5-minute timeout. Stale claims auto-released every 60 seconds.

## Verification
- [ ] Tasks claimed atomically (no duplicates)
- [ ] Stale claims released automatically
- [ ] Agent failure doesn't lose tasks
- [ ] Completion tracked per-agent

## See Also
- [File Ownership](./09-file-ownership.md) — Static alternative for known task sets
- [Source: 02-design-patterns.md](../02-design-patterns.md#pattern-7-atomic-task-claiming-sqlite-swarm)
