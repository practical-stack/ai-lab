# Workflow: Translate Learning Content (EN → KO)

Step-by-step guide to translate English learning content to Korean.

## Prerequisites

- English content exists in `docs/NN-topic/learning/*.en.md`
- All English content is finalized (no pending edits)

## Step 1: Inventory Files to Translate

```bash
# List all English files
ls docs/NN-topic/learning/*.en.md
```

Create translation checklist:

| English File | Korean File | Status |
|--------------|-------------|--------|
| README.en.md | README.ko.md | Pending |
| 01-fundamentals.en.md | 01-fundamentals.ko.md | Pending |
| ... | ... | ... |

## Step 2: Establish Translation Glossary

Before translating, define how to handle key terms:

### Keep in English (DO NOT translate)

| Category | Examples |
|----------|----------|
| Technical identifiers | `kebab-case`, `SKILL.md`, `frontmatter` |
| Code elements | Variable names, function names, file paths |
| Acronyms | API, LLM, CLI, CI/CD |
| Platform names | Claude Code, Cursor, OpenCode |
| Component types | Command, Skill, Agent (when used as proper nouns) |

### Translate

| Category | Examples |
|----------|----------|
| Headers | "Learning Objectives" → "학습 목표" |
| Explanatory text | Full paragraphs |
| Table content | Cell values (not code) |
| Exercise instructions | Problem descriptions |

### Common Translations

| English | Korean |
|---------|--------|
| Learning Objectives | 학습 목표 |
| Key Takeaways | 핵심 요점 |
| Prerequisites | 선행 조건 |
| Exercise | 연습 문제 |
| Example | 예시 |
| Next Steps | 다음 단계 |
| Quick Reference | 빠른 참조 |
| Overview | 개요 |
| Summary | 요약 |
| Best Practice | 베스트 프랙티스 |
| Anti-pattern | 안티패턴 |
| Decision Tree | 결정 트리 |
| Workflow | 워크플로우 |

## Step 3: Translate Each File

For each `.en.md` file:

### 3.1 Create Korean File

```bash
# Copy and rename
cp docs/NN-topic/learning/01-module.en.md docs/NN-topic/learning/01-module.ko.md
```

### 3.2 Translate Structure

1. **Title and Headers**: Translate all headings
2. **Paragraphs**: Full translation, maintain meaning and tone
3. **Lists**: Translate each item
4. **Tables**: Translate content cells, keep structure

### 3.3 Handle Code Blocks

```markdown
# English version
```bash
# This creates a new directory
mkdir my-project
```

# Korean version
```bash
# 새 디렉토리를 생성합니다
mkdir my-project
```
```

- Translate comments only
- Keep commands/code unchanged

### 3.4 Update Internal Links

```markdown
# English
See [Module 2](./02-relationships.en.md) for details.

# Korean
자세한 내용은 [모듈 2](./02-relationships.ko.md)를 참조하세요.
```

All `.en.md` links → `.ko.md` links

### 3.5 Handle Tables

```markdown
# English
| Term | Definition |
|------|------------|
| Command | Human-triggered action |

# Korean
| 용어 | 정의 |
|------|------|
| Command | 사용자가 트리거하는 액션 |
```

- Translate headers
- Translate content
- Keep technical terms as-is

## Step 4: Quality Check Each Translation

### Checklist per File

- [ ] All headers translated
- [ ] All paragraphs read naturally in Korean
- [ ] Technical terms consistently handled
- [ ] Code blocks unchanged (except comments)
- [ ] Links updated to .ko.md
- [ ] Tables render correctly
- [ ] No orphaned English text

### Common Issues to Watch

| Issue | Solution |
|-------|----------|
| Awkward literal translation | Rewrite for natural Korean |
| Inconsistent term usage | Refer to glossary |
| Broken links | Check all internal links |
| Missing sections | Compare line counts |

## Step 5: Cross-reference with English

For each Korean file:

1. Open English and Korean side by side
2. Verify section count matches
3. Verify all content is translated
4. Verify formatting is preserved

## Step 6: Final Review

### Document-level Check

- [ ] All English files have Korean counterparts
- [ ] File naming follows convention (`*.ko.md`)
- [ ] README.ko.md links to all Korean modules
- [ ] No mixed English/Korean in body text (except intentional)

### Test Navigation

1. Open README.ko.md
2. Click each module link → verify it opens .ko.md version
3. Navigate through all modules → verify flow

## Output

After completing this workflow:

```
docs/NN-topic/learning/
├── README.en.md          # English index
├── README.ko.md          # Korean index
├── 01-module.en.md       # English module 1
├── 01-module.ko.md       # Korean module 1
├── 02-module.en.md       # English module 2
├── 02-module.ko.md       # Korean module 2
...
```

## Next Step

Add frontmatter to all files. Load skill: `doc-frontmatter`
