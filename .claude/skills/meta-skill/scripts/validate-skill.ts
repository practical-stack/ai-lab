#!/usr/bin/env node
/**
 * Skill Validator - Validates skills against Anthropic's official specification
 * Usage: bun scripts/validate-skill.ts <skill-folder>
 *
 * Checks: frontmatter (name, description, security), structure (SKILL.md, no README.md),
 * content (TODO markers, examples, orchestration), and references (linked from SKILL.md).
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

interface Frontmatter {
  name?: string;
  description?: string;
  [key: string]: unknown;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; rawYaml: string; body: string } | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return null;

  const rawYaml = match[1];
  const body = match[2];
  const frontmatter: Frontmatter = {};

  let currentKey = "";
  let currentValue = "";

  for (const line of rawYaml.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
      if (currentKey) {
        frontmatter[currentKey] = currentValue.trim().replace(/^["']|["']$/g, "");
      }
      currentKey = line.slice(0, colonIndex).trim();
      const rawValue = line.slice(colonIndex + 1).trim();
      if (rawValue === "|" || rawValue === ">") {
        currentValue = "";
      } else {
        currentValue = rawValue;
      }
    } else if (currentKey && (line.startsWith("  ") || line.startsWith("\t"))) {
      currentValue += (currentValue ? "\n" : "") + line.trim();
    }
  }
  if (currentKey) {
    frontmatter[currentKey] = currentValue.trim().replace(/^["']|["']$/g, "");
  }

  return { frontmatter, rawYaml, body };
}

function validateSkill(skillPath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];
  const skillName = basename(skillPath);

  if (!existsSync(skillPath)) {
    return { valid: false, errors: [`Skill folder not found: ${skillPath}`], warnings, info };
  }

  if (!statSync(skillPath).isDirectory()) {
    return { valid: false, errors: [`Path is not a directory: ${skillPath}`], warnings, info };
  }

  const skillMdPath = join(skillPath, "SKILL.md");
  if (!existsSync(skillMdPath)) {
    return { valid: false, errors: ["SKILL.md file not found (must be exact case: SKILL.md)"], warnings, info };
  }

  const readmePath = join(skillPath, "README.md");
  if (existsSync(readmePath)) {
    errors.push("README.md found in skill folder — not allowed per Anthropic spec (use SKILL.md or references/ instead)");
  }

  const content = readFileSync(skillMdPath, "utf-8");
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    errors.push("SKILL.md has no valid YAML frontmatter (--- ... --- format required)");
    return { valid: false, errors, warnings, info };
  }

  const { frontmatter, rawYaml, body } = parsed;

  if (!frontmatter.name) {
    errors.push("Missing 'name' field in frontmatter");
  } else {
    const name = String(frontmatter.name);
    if (!/^[a-z0-9-]+$/.test(name)) {
      errors.push(`'name' is not kebab-case: ${name}`);
    }
    if (name.length > 64) {
      errors.push(`'name' exceeds 64 characters: ${name.length} chars`);
    }
    if (name !== skillName) {
      errors.push(`'name' does not match directory name: ${name} vs ${skillName}`);
    }
    if (name.includes("claude") || name.includes("anthropic")) {
      errors.push(`'name' contains reserved word ("claude" or "anthropic" are reserved by Anthropic): ${name}`);
    }
  }

  if (!frontmatter.description) {
    errors.push("Missing 'description' field in frontmatter");
  } else {
    const desc = String(frontmatter.description);
    if (desc.length < 20) {
      warnings.push("Description is too short (include [What it does] + [When to use it] + trigger phrases)");
    }
    if (desc.length > 1024) {
      warnings.push(`Description exceeds 1024 characters (${desc.length} chars) — may be truncated`);
    }
  }

  if (rawYaml.includes("<") || rawYaml.includes(">")) {
    errors.push("Frontmatter contains XML angle brackets (< or >) — forbidden per Anthropic security spec");
  }

  const bodyLines = body.split("\n");
  if (bodyLines.length > 500) {
    warnings.push(`SKILL.md body exceeds 500 lines (${bodyLines.length} lines) — consider splitting to references/`);
  }

  const todoMatches = content.match(/\[TODO[^\]]*\]/gi);
  if (todoMatches && todoMatches.length > 0) {
    warnings.push(`${todoMatches.length} unresolved TODO item(s) found`);
  }

  const hasExamples = /^#{1,3}\s+Example/im.test(body);
  if (!hasExamples) {
    info.push("No Examples section found — consider adding if skill has user-facing triggers");
  }

  const hasTroubleshooting = /^#{1,3}\s+Troubleshoot/im.test(body);
  if (!hasTroubleshooting) {
    info.push("No Troubleshooting section found — consider adding if skill involves MCP or scripts");
  }

  // Project convention: Flag excessive skill-to-skill coupling for review
  // Note: Claude Code officially supports Skill → Skill invocation via the Skill tool.
  // This check is an informational hint, not a hard rule.
  const orchestrationPatterns = [
    { pattern: /Load skill[:\s]/gi },
    { pattern: /Use skill[:\s]/gi },
    { pattern: /Invoke Skill[:\s]/gi },
    { pattern: /Run \/[a-z-]+/gi },
  ];

  let orchestrationCount = 0;
  for (const { pattern } of orchestrationPatterns) {
    const matches = content.match(pattern);
    if (matches) orchestrationCount += matches.length;
  }
  if (orchestrationCount >= 3) {
    warnings.push(`Skill invokes ${orchestrationCount} other skills/commands — consider whether a Command or Agent should own this pipeline instead`);
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

    const refEntries = readdirSync(refsDir);
    for (const entry of refEntries) {
      const entryPath = join(refsDir, entry);
      if (statSync(entryPath).isDirectory()) {
        warnings.push(`Deeply nested reference directory: references/${entry}/ — keep references 1 level deep`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings, info };
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage: bun scripts/validate-skill.ts <skill-folder>");
    console.log("\nValidates against Anthropic's official skill specification:");
    console.log("  - Frontmatter: name, description, security (XML brackets, reserved names)");
    console.log("  - Structure: SKILL.md (exact case), no README.md, line count");
    console.log("  - Content: TODO markers, examples, troubleshooting, orchestration");
    console.log("  - References: linked from SKILL.md, not deeply nested");
    process.exit(1);
  }

  const skillPath = args[0];
  console.log(`Validating skill: ${skillPath}\n`);

  const result = validateSkill(skillPath);

  if (result.errors.length > 0) {
    console.log("Errors:");
    for (const error of result.errors) {
      console.log(`  ✗ ${error}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`  ⚠ ${warning}`);
    }
    console.log();
  }

  if (result.info.length > 0) {
    console.log("Info:");
    for (const item of result.info) {
      console.log(`  ℹ ${item}`);
    }
    console.log();
  }

  const total = result.errors.length + result.warnings.length + result.info.length;
  console.log(`Summary: ${result.errors.length} error(s), ${result.warnings.length} warning(s), ${result.info.length} info`);

  if (result.valid) {
    console.log("\n✓ Skill validation passed");
    process.exit(0);
  } else {
    console.log("\n✗ Skill validation failed");
    process.exit(1);
  }
}

main();
