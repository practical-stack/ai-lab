---
description: Create or update a draft PR with Summary and Test sections
allowed-tools: Bash, Read, Write, Question
argument-hint: "[--update | -u] [#PR_NUMBER]"
---

# Draft PR Command

Create a new draft PR or update an existing PR's description.

## Arguments

$ARGUMENTS

- **--update, -u** (optional): Update mode - modify existing PR
- **#PR_NUMBER** (optional): Specific PR to update (with -u flag)

## Mode Selection

| Command | Mode | Action |
|---------|------|--------|
| `/pr` | CREATE | Create new draft PR |
| `/pr -u` | UPDATE | Update current branch's PR |
| `/pr -u #123` | UPDATE | Update specific PR #123 |

## Instructions

### CREATE Mode (`/pr`)

#### Step 1: Validate Git State

```bash
git status --porcelain
git branch --show-current
```

**Fail if:**
- Uncommitted changes exist → "Commit changes first"
- On main/master → "Create a feature branch first"

#### Step 2: Gather Summary

Ask the user:

1. **요구사항/목적**: "이 PR의 목적이나 해결하려는 문제는 무엇인가요?"
2. **구현/수단**: "구체적으로 어떻게 구현했나요? 주요 변경사항은?"

#### Step 3: Compose Body

```markdown
## Summary
[filled from user input]

## Test
| Before / Requirements | After / Implementation |
| --------------------- | ---------------------- |
|                       |                        |
```

Note: "UI 테스트 이미지는 PR 생성 후 직접 추가하세요."

#### Step 4: Generate Title & Create

```bash
# Push if no upstream
git push -u origin $(git branch --show-current)

# Create draft PR
gh pr create --draft --title "$TITLE" --body "$BODY"
```

---

### UPDATE Mode (`/pr -u`)

#### Step 1: Find PR

```bash
# If PR number provided
gh pr view $PR_NUMBER --json number,title,url

# Else, find current branch's PR
gh pr view --json number,title,url
```

#### Step 2: Gather Summary

Same as CREATE mode.

#### Step 3: Update PR

```bash
gh pr edit $PR_NUMBER --body "$BODY"
```

---

## Output

### CREATE Success
```
✅ Draft PR created: https://github.com/user/repo/pull/123

Next steps:
1. Add test screenshots if needed
2. Mark as "Ready for review" when complete
```

### UPDATE Success
```
✅ PR #123 updated: https://github.com/user/repo/pull/123
```

### Failure
```
❌ Cannot create/update PR: [reason]
   [suggested action]
```

## Safety

| Check | Action |
|-------|--------|
| CREATE: Always `--draft` | Never create ready-for-review PR |
| UPDATE: Confirm before edit | Show preview of new body |
