#!/usr/bin/env node
/**
 * Skill Initializer - Creates a new skill from template
 * Usage: bun scripts/init-skill.ts <skill-name> --path <path>
 * Example: bun scripts/init-skill.ts my-skill --path .cursor/skills
 */

import { mkdirSync, writeFileSync, existsSync, chmodSync } from "fs";
import { join, resolve } from "path";

const SKILL_MD_TEMPLATE = `---
name: {{SKILL_NAME}}
description: |
  [TODO: Clearly describe the skill's purpose and when to use it]
  [TODO: Include trigger conditions - e.g., "use when...", "activates on..."]
  Triggers: "keyword1", "keyword2", "keyword3"
---

# {{SKILL_TITLE}}

## Overview

[TODO: Describe what this skill does in 1-2 sentences]

## Quick Start

[TODO: Provide immediately usable examples]

\`\`\`bash
# Example command
bun scripts/example.ts
\`\`\`

## Usage Guide

### Basic Usage

[TODO: Explain basic usage]

### Advanced Features

[TODO: Describe advanced features if needed]

## Resources

### scripts/

Contains executable scripts.

- \`example.ts\` - Example script (modify or delete as needed)

### references/

Add detailed documentation here when needed.

- \`guide.md\` - Detailed guide (modify or delete as needed)

### assets/

Contains files used for outputs.

- Templates, images, config files, etc.

---

**Delete unnecessary directories or files.** Not all skills need all three resource types.
`;

const EXAMPLE_SCRIPT_TEMPLATE = `#!/usr/bin/env node

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  console.log("Running {{SKILL_NAME}} script...");
  console.log("Arguments:", args);
  console.log("✅ Script execution complete");
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
`;

const REFERENCE_TEMPLATE = `# {{SKILL_TITLE}} - Detailed Guide

This document is a placeholder for detailed reference documentation.
Replace with actual content or delete if not needed.

## When Reference Docs Are Useful

- Comprehensive API documentation
- Detailed workflow guides
- Complex multi-step processes
- Information too lengthy for SKILL.md
- Content needed only for specific use cases

## Suggested Structure

### API Reference Example

- Overview
- Authentication
- Endpoints and examples
- Error codes
- Rate limits

### Workflow Guide Example

- Prerequisites
- Step-by-step instructions
- Common patterns
- Troubleshooting
- Best practices
`;

function toTitleCase(skillName: string): string {
  return skillName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function validateSkillName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: "Skill name is required" };
  }
  if (name.length > 40) {
    return { valid: false, error: "Skill name cannot exceed 40 characters" };
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    return { valid: false, error: "Skill name must use only lowercase letters, numbers, and hyphens" };
  }
  if (name.startsWith("-") || name.endsWith("-")) {
    return { valid: false, error: "Skill name cannot start or end with a hyphen" };
  }
  return { valid: true };
}

function applyTemplate(template: string, skillName: string): string {
  const skillTitle = toTitleCase(skillName);
  return template
    .replace(/\{\{SKILL_NAME\}\}/g, skillName)
    .replace(/\{\{SKILL_TITLE\}\}/g, skillTitle);
}

interface InitResult {
  success: boolean;
  path?: string;
  error?: string;
}

function initSkill(skillName: string, basePath: string): InitResult {
  const validation = validateSkillName(skillName);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const skillDir = resolve(basePath, skillName);

  if (existsSync(skillDir)) {
    return { success: false, error: `Skill directory already exists: ${skillDir}` };
  }

  try {
    mkdirSync(skillDir, { recursive: true });
    mkdirSync(join(skillDir, "scripts"), { recursive: true });
    mkdirSync(join(skillDir, "references"), { recursive: true });
    mkdirSync(join(skillDir, "assets"), { recursive: true });
    console.log(`✅ Skill directory created: ${skillDir}`);

    const skillMdContent = applyTemplate(SKILL_MD_TEMPLATE, skillName);
    writeFileSync(join(skillDir, "SKILL.md"), skillMdContent, "utf-8");
    console.log("✅ SKILL.md created");

    const scriptContent = applyTemplate(EXAMPLE_SCRIPT_TEMPLATE, skillName);
    const scriptPath = join(skillDir, "scripts", "example.ts");
    writeFileSync(scriptPath, scriptContent, "utf-8");
    chmodSync(scriptPath, 0o755);
    console.log("✅ scripts/example.ts created");

    const refContent = applyTemplate(REFERENCE_TEMPLATE, skillName);
    writeFileSync(join(skillDir, "references", "guide.md"), refContent, "utf-8");
    console.log("✅ references/guide.md created");

    writeFileSync(join(skillDir, "assets", ".gitkeep"), "", "utf-8");
    console.log("✅ assets/.gitkeep created");

    console.log(`\n✅ Skill '${skillName}' initialized: ${skillDir}`);
    console.log("\nNext steps:");
    console.log("1. Complete the [TODO] items in SKILL.md");
    console.log("2. Modify or delete example files in scripts/, references/, assets/");
    console.log("3. Run validate-skill.ts to verify structure when ready");

    return { success: true, path: skillDir };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Directory creation error: ${message}` };
  }
}

function printUsage(): void {
  console.log(`
Skill Initializer

Usage:
  bun scripts/init-skill.ts <skill-name> --path <path>

Arguments:
  skill-name    Skill name (kebab-case, e.g., my-awesome-skill)
  --path        Path where skill will be created

Examples:
  bun scripts/init-skill.ts my-new-skill --path .claude/skills
  bun scripts/init-skill.ts api-helper --path .opencode/skills
`);
}

function main(): void {
  const args = process.argv.slice(2);
  const pathIndex = args.indexOf("--path");
  
  if (args.length < 3 || pathIndex === -1 || pathIndex + 1 >= args.length) {
    printUsage();
    process.exit(1);
  }

  const skillName = args[0];
  const basePath = args[pathIndex + 1];

  console.log(`🚀 Initializing skill: ${skillName}`);
  console.log(`   Location: ${basePath}\n`);

  const result = initSkill(skillName, basePath);

  if (result.success) {
    process.exit(0);
  } else {
    console.error(`❌ Error: ${result.error}`);
    process.exit(1);
  }
}

main();
