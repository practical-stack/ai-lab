#!/usr/bin/env node
/** Skill Validator - Usage: bun scripts/validate-skill.ts <skill-folder> */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface Frontmatter {
  name?: string;
  description?: string;
  [key: string]: unknown;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return null;

  const yamlContent = match[1];
  const body = match[2];
  const frontmatter: Frontmatter = {};

  for (const line of yamlContent.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      if (key && !key.startsWith(" ")) {
        frontmatter[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  }

  return { frontmatter, body };
}

function validateSkill(skillPath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const skillName = basename(skillPath);

  if (!existsSync(skillPath)) {
    return { valid: false, errors: [`Skill folder not found: ${skillPath}`], warnings };
  }

  if (!statSync(skillPath).isDirectory()) {
    return { valid: false, errors: [`Path is not a directory: ${skillPath}`], warnings };
  }

  const skillMdPath = join(skillPath, "SKILL.md");
  if (!existsSync(skillMdPath)) {
    return { valid: false, errors: ["SKILL.md file not found"], warnings };
  }

  const content = readFileSync(skillMdPath, "utf-8");
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    errors.push("SKILL.md has no valid YAML frontmatter (--- ... --- format required)");
    return { valid: false, errors, warnings };
  }

  const { frontmatter, body } = parsed;

  if (!frontmatter.name) {
    errors.push("Missing 'name' field in frontmatter");
  } else {
    const name = String(frontmatter.name);
    if (!/^[a-z0-9-]+$/.test(name)) {
      errors.push(`'name' is not kebab-case: ${name}`);
    }
    if (name.length > 40) {
      errors.push(`'name' exceeds 40 characters: ${name.length} chars`);
    }
    if (name !== skillName) {
      errors.push(`'name' does not match directory name: ${name} vs ${skillName}`);
    }
  }

  if (!frontmatter.description) {
    errors.push("Missing 'description' field in frontmatter");
  } else {
    const desc = String(frontmatter.description);
    if (desc.length < 20) {
      warnings.push("Description is too short (include trigger conditions and purpose)");
    }
  }

  const lines = body.split("\n");
  if (lines.length > 500) {
    warnings.push(`SKILL.md exceeds 500 lines (${lines.length} lines) - consider splitting to references/`);
  }

  const todoMatches = content.match(/\[TODO[^\]]*\]/gi);
  if (todoMatches && todoMatches.length > 0) {
    errors.push(`${todoMatches.length} unresolved TODO item(s) found`);
  }

  const unnecessaryFiles = ["README.md", "CHANGELOG.md", "CONTRIBUTING.md", "LICENSE.md"];
  for (const file of unnecessaryFiles) {
    if (existsSync(join(skillPath, file))) {
      warnings.push(`Unnecessary file found: ${file}`);
    }
  }

  // Anti-Pattern 4: Skill Orchestrates Other Skills
  const orchestrationPatterns = [
    { pattern: /Load skill[:\s]/gi, desc: "Load skill" },
    { pattern: /Use skill[:\s]/gi, desc: "Use skill" },
    { pattern: /Run \/[a-z-]+/gi, desc: "Run /command" },
  ];
  
  for (const { pattern, desc } of orchestrationPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      errors.push(`Orchestration leakage: "${desc}" (${matches.length}x) - Skills must not invoke other Skills/Commands`);
    }
  }

  const refsDir = join(skillPath, "references");
  if (existsSync(refsDir) && statSync(refsDir).isDirectory()) {
    const refFiles = readdirSync(refsDir).filter((f) => f.endsWith(".md"));
    for (const refFile of refFiles) {
      const refPath = `references/${refFile}`;
      if (!content.includes(refPath) && !content.includes(refFile)) {
        warnings.push(`references/${refFile} is not linked from SKILL.md`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage: bun scripts/validate-skill.ts <skill-folder>");
    process.exit(1);
  }

  const skillPath = args[0];
  console.log(`Validating skill: ${skillPath}\n`);

  const result = validateSkill(skillPath);

  if (result.errors.length > 0) {
    console.log("Errors:");
    for (const error of result.errors) {
      console.log(`  - ${error}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`  - ${warning}`);
    }
    console.log();
  }

  if (result.valid) {
    console.log("Skill validation passed");
    process.exit(0);
  } else {
    console.log("Skill validation failed");
    process.exit(1);
  }
}

main();
