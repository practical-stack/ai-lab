# Testing Guide

Complete testing methodology for skills based on Anthropic's official skill guide.

> **Pro Tip**: Iterate on a single task until Claude succeeds, then extract the winning approach. This leverages Claude's in-context learning and provides faster signal than broad testing.

## Testing Levels

| Level | Approach | Setup Required |
|-------|----------|---------------|
| Manual | Run queries directly in Claude.ai | None |
| Scripted | Automate test cases in Claude Code | Minimal |
| Programmatic | Evaluation suites via skills API | Moderate |

Choose based on quality requirements and skill visibility.

## 1. Triggering Tests

**Goal**: Ensure your skill loads at the right times.

### Test Cases

```text
Should trigger:
- "Help me set up a new [Service] workspace"        # obvious task
- "I need to create a project in [Service]"          # paraphrased
- "Initialize a [Service] project for Q4 planning"   # context variation

Should NOT trigger:
- "What's the weather in San Francisco?"              # unrelated
- "Help me write Python code"                         # different domain
- "Create a spreadsheet"                              # unless in scope
```

### Debugging Approach

Ask Claude: "When would you use the [skill name] skill?"

Claude will quote the description back. Adjust based on what's missing.

## 2. Functional Tests

**Goal**: Verify the skill produces correct outputs.

### Test Format

```text
Test: [Scenario name]
Given: [Input conditions]
When: Skill executes workflow
Then:
  - [Expected outcome 1]
  - [Expected outcome 2]
  - All API calls succeed
  - No errors
```

### Example

```text
Test: Create project with 5 tasks
Given: Project name "Q4 Planning", 5 task descriptions
When: Skill executes workflow
Then:
  - Project created in ProjectHub
  - 5 tasks created with correct properties
  - All tasks linked to project
  - No API errors
```

### Test Coverage

- Valid outputs generated
- API calls succeed
- Error handling works
- Edge cases covered (empty input, invalid data, timeout)

## 3. Performance Comparison

**Goal**: Prove the skill improves results vs. baseline.

### Measurement Template

| Metric | Without Skill | With Skill |
|--------|--------------|------------|
| Messages needed | 15 back-and-forth | 2 clarifying questions |
| Failed API calls | 3 requiring retry | 0 |
| Tokens consumed | 12,000 | 6,000 |
| User corrections | Multiple | None |
| Time to complete | ~10 min | ~2 min |

## 4. Iteration Signals

### Undertriggering

| Signal | Solution |
|--------|----------|
| Skill doesn't load when it should | Add more detail and nuance to description |
| Users manually enabling it | Add keywords for technical terms |
| Support questions about when to use | Make trigger phrases more explicit |

### Overtriggering

| Signal | Solution |
|--------|----------|
| Skill loads for irrelevant queries | Add negative triggers ("Do NOT use for...") |
| Users disabling it | Be more specific in description |
| Confusion about purpose | Clarify scope in description |

### Execution Issues

| Signal | Solution |
|--------|----------|
| Inconsistent results | Improve instructions, add validation |
| API call failures | Add error handling, retry logic |
| User corrections needed | Make steps more specific and actionable |
| Claude skips steps | Add "CRITICAL: Do not skip..." emphasis |

## 5. Pre-Upload Checklist

- [ ] Tested triggering on obvious tasks
- [ ] Tested triggering on paraphrased requests
- [ ] Verified doesn't trigger on unrelated topics
- [ ] Functional tests pass
- [ ] Tool integration works (if applicable)
- [ ] Compressed as `.zip` file

## 6. Post-Upload Monitoring

- [ ] Test in real conversations
- [ ] Monitor for under/over-triggering
- [ ] Collect user feedback
- [ ] Iterate on description and instructions
- [ ] Update version in metadata
