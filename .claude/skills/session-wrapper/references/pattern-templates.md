# Pattern Templates

Common patterns that emerge from session work. Use these as starting points when abstracting your work.

## 1. Transform Pattern

Converting one format/structure to another.

```markdown
## Feature Request

### Name
[source]-to-[target]-transformer

### Description
Transform {source_type} into {target_type} with {optional_processing}.

### Trigger
"convert X to Y", "transform X", "generate Y from X"

### Inputs
- Source files/data in {source_format}
- Configuration options

### Outputs
- Transformed files in {target_format}

### Steps
1. Read source files
2. Parse/analyze content
3. Apply transformation rules
4. Generate output
5. Validate output

### Domain Knowledge
- Source format specifications
- Target format requirements
- Transformation rules

### Side Effects
- File creation

### Reusability
High - any time source format needs conversion
```

**Examples**:
- Research → Learning Content
- Markdown → HTML
- TypeScript → Documentation
- Logs → Reports

---

## 2. Validation Pattern

Checking that something meets criteria.

```markdown
## Feature Request

### Name
[domain]-validator

### Description
Validate {target} against {criteria/schema} and report issues.

### Trigger
"validate", "check", "verify", "lint"

### Inputs
- Files/resources to validate
- Schema/criteria reference

### Outputs
- Validation report (pass/fail, issues list)

### Steps
1. Load validation rules
2. Scan target resources
3. Check each rule
4. Collect violations
5. Generate report

### Domain Knowledge
- Validation schema
- Error classification
- Fix suggestions

### Side Effects
- None (read-only) OR
- Auto-fix mode (file modification)

### Reusability
High - continuous validation need
```

**Examples**:
- Frontmatter Validator
- Code Style Checker
- Schema Validator
- Security Auditor

---

## 3. Scaffold Pattern

Creating initial structure for something new.

```markdown
## Feature Request

### Name
[domain]-scaffolder

### Description
Create initial {structure_type} with proper {conventions}.

### Trigger
"init", "create new", "scaffold", "bootstrap"

### Inputs
- Name/identifier
- Configuration options
- Template selection

### Outputs
- Directory structure
- Template files
- Configuration files

### Steps
1. Gather parameters
2. Select template
3. Create directories
4. Generate files
5. Initialize (git, npm, etc.)

### Domain Knowledge
- Project conventions
- Best practices
- Template variations

### Side Effects
- Directory creation
- File creation
- Possible external init (git, npm)

### Reusability
Moderate - when starting new projects/components
```

**Examples**:
- Skill Scaffolder
- Project Initializer
- Component Generator
- Test Suite Creator

---

## 4. Analysis Pattern

Examining something and producing insights.

```markdown
## Feature Request

### Name
[domain]-analyzer

### Description
Analyze {target} and produce {insights/recommendations}.

### Trigger
"analyze", "review", "assess", "audit"

### Inputs
- Target to analyze
- Analysis scope/depth

### Outputs
- Analysis report
- Recommendations
- Metrics/scores

### Steps
1. Gather information
2. Apply analysis rules
3. Identify patterns/issues
4. Generate insights
5. Prioritize recommendations

### Domain Knowledge
- Analysis criteria
- Pattern recognition
- Best practices for domain

### Side Effects
- None (read-only)

### Reusability
High - ongoing analysis needs
```

**Examples**:
- Code Reviewer
- Performance Analyzer
- Security Scanner
- Dependency Auditor

---

## 5. Orchestration Pattern

Coordinating multiple steps/agents.

```markdown
## Feature Request

### Name
[workflow]-orchestrator

### Description
Coordinate {workflow_steps} to achieve {end_goal}.

### Trigger
Goal assignment requiring multi-step planning

### Inputs
- High-level goal
- Constraints/preferences

### Outputs
- Completed workflow
- Artifacts from each step

### Steps
1. Plan execution
2. Execute steps (sequential or parallel)
3. Handle failures/retries
4. Collect results
5. Verify completion

### Domain Knowledge
- Workflow steps
- Dependency ordering
- Error handling

### Side Effects
- Varies by workflow

### Reusability
Moderate - complex workflows
```

**Examples**:
- Bug Fix Orchestrator
- Release Manager
- Migration Coordinator
- Test Suite Runner

---

## 6. Localization Pattern

Creating language/locale variants.

```markdown
## Feature Request

### Name
[content]-localizer

### Description
Create {language} variants of {content_type} with {localization_rules}.

### Trigger
"translate", "localize", "create KO version"

### Inputs
- Source content (primary language)
- Target languages
- Translation guidelines

### Outputs
- Localized content files

### Steps
1. Identify translatable content
2. Apply translation rules
3. Handle non-translatable elements
4. Update internal references
5. Validate output

### Domain Knowledge
- Source language conventions
- Target language conventions
- Technical term handling

### Side Effects
- File creation

### Reusability
Moderate - when content needs localization
```

**Examples**:
- Documentation Translator
- UI String Localizer
- Content Internationalizer

---

## Pattern Selection Guide

| Your Work Involved... | Likely Pattern |
|----------------------|----------------|
| Converting format/structure | Transform |
| Checking rules/criteria | Validation |
| Creating new from template | Scaffold |
| Examining for insights | Analysis |
| Multi-step coordination | Orchestration |
| Language/locale variants | Localization |

## Combining Patterns

Complex workflows often combine multiple patterns:

```
Research → Learning (Transform)
    ↓
EN → KO (Localization)
    ↓
Add Frontmatter (Validation + Transform)
```

When abstracting, identify the primary pattern and note secondary patterns as sub-workflows.
