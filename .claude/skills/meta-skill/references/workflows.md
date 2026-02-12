# Workflow Patterns

Detailed guidance for structuring skill workflows.

## Sequential Workflows

For complex tasks, break operations into clear, sequential steps:

```markdown
## Workflow

PDF form filling follows these steps:

1. Analyze form (run analyze-form.ts)
2. Create field mappings (edit fields.json)
3. Validate mappings (run validate-fields.ts)
4. Fill form (run fill-form.ts)
5. Verify output (run verify-output.ts)
```

## Conditional Workflows

For tasks with branching logic, guide through decision points:

```markdown
## Workflow Decision Tree

1. Determine task type:
   **Creating new content?** → Follow "Creation Workflow"
   **Modifying existing content?** → Follow "Editing Workflow"

### Creation Workflow
1. Select template
2. Enter data
3. Validate and output

### Editing Workflow
1. Load file
2. Apply changes
3. Backup and save
```

## Iteration Patterns

For workflows that may need multiple passes:

```markdown
## Iteration Workflow

1. Perform initial implementation
2. Run validation
3. Validation passed?
   - ✅ Yes: Complete
   - ❌ No: Fix errors and return to step 2

Maximum iterations: 3 (notify user if exceeded)
```

## Error Handling Patterns

```markdown
## Error Handling

### Retryable Errors
- Network timeout → Retry up to 3 times
- Transient API errors → Retry with exponential backoff

### Non-Recoverable Errors
- File corruption → Notify user and abort
- Insufficient permissions → Guide on required permissions and abort
```

## Verification Patterns

```markdown
## Verification Checklist

After each task completion:
- [ ] Verify output file exists
- [ ] Validate file format
- [ ] Compare with expected results
- [ ] Confirm no side effects
```
