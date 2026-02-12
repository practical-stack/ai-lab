# Skill Patterns

Five reusable architecture patterns from Anthropic's official skill guide. Choose the pattern that best fits your skill's use case.

## Choosing Your Approach

- **Problem-first:** "I need to set up a project workspace" — Skill orchestrates the right MCP calls in sequence. Users describe outcomes; the skill handles the tools.
- **Tool-first:** "I have Notion MCP connected" — Skill teaches Claude optimal workflows and best practices. Users have access; the skill provides expertise.

---

## Pattern 1: Sequential Workflow Orchestration

**Use when:** Multi-step processes in a specific order.

```markdown
## Workflow: Onboard New Customer

### Step 1: Create Account
Call MCP tool: `create_customer`
Parameters: name, email, company

### Step 2: Setup Payment
Call MCP tool: `setup_payment_method`
Wait for: payment method verification

### Step 3: Create Subscription
Call MCP tool: `create_subscription`
Parameters: plan_id, customer_id (from Step 1)

### Step 4: Send Welcome Email
Call MCP tool: `send_email`
Template: welcome_email_template
```

**Key techniques:**
- Explicit step ordering
- Dependencies between steps
- Validation at each stage
- Rollback instructions for failures

---

## Pattern 2: Multi-MCP Coordination

**Use when:** Workflows spanning multiple services.

```markdown
### Phase 1: Design Export (Figma MCP)
1. Export design assets from Figma
2. Generate design specifications
3. Create asset manifest

### Phase 2: Asset Storage (Drive MCP)
1. Create project folder in Drive
2. Upload all assets
3. Generate shareable links

### Phase 3: Task Creation (Linear MCP)
1. Create development tasks
2. Attach asset links to tasks
3. Assign to engineering team

### Phase 4: Notification (Slack MCP)
1. Post handoff summary to #engineering
2. Include asset links and task references
```

**Key techniques:**
- Clear phase separation
- Data passing between MCPs
- Validation before moving to next phase
- Centralized error handling

---

## Pattern 3: Iterative Refinement

**Use when:** Output quality improves with iteration.

```markdown
### Initial Draft
1. Fetch data via MCP
2. Generate first draft report
3. Save to temporary file

### Quality Check
1. Run validation script: `scripts/check_report.py`
2. Identify issues:
   - Missing sections
   - Inconsistent formatting
   - Data validation errors

### Refinement Loop
1. Address each identified issue
2. Regenerate affected sections
3. Re-validate
4. Repeat until quality threshold met

### Finalization
1. Apply final formatting
2. Generate summary
3. Save final version
```

**Key techniques:**
- Explicit quality criteria
- Iterative improvement
- Validation scripts
- Know when to stop iterating

---

## Pattern 4: Context-Aware Tool Selection

**Use when:** Same outcome, different tools depending on context.

```markdown
### Decision Tree
1. Check file type and size
2. Determine best storage location:
   - Large files (>10MB): Use cloud storage MCP
   - Collaborative docs: Use Notion/Docs MCP
   - Code files: Use GitHub MCP
   - Temporary files: Use local storage

### Execute Storage
Based on decision:
- Call appropriate MCP tool
- Apply service-specific metadata
- Generate access link

### Provide Context to User
Explain why that storage was chosen
```

**Key techniques:**
- Clear decision criteria
- Fallback options
- Transparency about choices

---

## Pattern 5: Domain-Specific Intelligence

**Use when:** Skill adds specialized knowledge beyond tool access.

```markdown
### Before Processing (Compliance Check)
1. Fetch transaction details via MCP
2. Apply compliance rules:
   - Check sanctions lists
   - Verify jurisdiction allowances
   - Assess risk level
3. Document compliance decision

### Processing
IF compliance passed:
- Call payment processing MCP tool
- Apply appropriate fraud checks
- Process transaction

ELSE:
- Flag for review
- Create compliance case

### Audit Trail
- Log all compliance checks
- Record processing decisions
- Generate audit report
```

**Key techniques:**
- Domain expertise embedded in logic
- Compliance before action
- Comprehensive documentation
- Clear governance

---

## Pattern Selection Guide

| Pattern | Best For | Complexity |
|---------|----------|------------|
| Sequential Workflow | Single-service multi-step processes | Low-Medium |
| Multi-MCP Coordination | Cross-service workflows | Medium-High |
| Iterative Refinement | Quality-sensitive output generation | Medium |
| Context-Aware Selection | Dynamic tool routing | Medium |
| Domain-Specific Intelligence | Expert knowledge + tool access | High |
