#!/usr/bin/env node
/** Agent Validator - Usage: bun scripts/validate-agent.ts <agent-file> */

import { existsSync, readFileSync, statSync } from "fs";
import { basename, extname } from "path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface CursorFrontmatter {
  name?: string;
  description?: string;
  model?: string;
  readonly?: boolean;
  is_background?: boolean;
}

function parseCursorFrontmatter(content: string): { frontmatter: CursorFrontmatter; body: string } | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return null;

  const yamlContent = match[1];
  const body = match[2];
  const frontmatter: CursorFrontmatter = {};

  for (const line of yamlContent.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      if (key && !key.startsWith(" ")) {
        if (value === "true") {
          (frontmatter as Record<string, unknown>)[key] = true;
        } else if (value === "false") {
          (frontmatter as Record<string, unknown>)[key] = false;
        } else {
          (frontmatter as Record<string, unknown>)[key] = value.replace(/^["']|["']$/g, "");
        }
      }
    }
  }

  return { frontmatter, body };
}

function validateCursorAgent(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const content = readFileSync(filePath, "utf-8");
  const parsed = parseCursorFrontmatter(content);

  if (!parsed) {
    errors.push("No valid YAML frontmatter (--- ... --- format required)");
    return { valid: false, errors, warnings };
  }

  const { frontmatter, body } = parsed;
  const fileName = basename(filePath, ".md");

  if (frontmatter.name && frontmatter.name !== fileName) {
    warnings.push(`'name' (${frontmatter.name}) does not match filename (${fileName})`);
  }

  if (!frontmatter.description) {
    errors.push("Missing 'description' field in frontmatter");
  } else {
    const desc = String(frontmatter.description);
    if (desc.length < 10) {
      warnings.push("Description is too short (include trigger conditions)");
    }
  }

  if (frontmatter.model && !["fast", "inherit"].includes(frontmatter.model) && !frontmatter.model.includes("/")) {
    warnings.push(`Unusual model value: ${frontmatter.model} (expected: fast, inherit, or model ID)`);
  }

  const words = body.split(/\s+/).length;
  if (words > 500) {
    warnings.push(`Prompt is over 500 words (${words} words) - consider shortening`);
  }

  const todoMatches = content.match(/\[TODO[^\]]*\]/gi);
  if (todoMatches && todoMatches.length > 0) {
    errors.push(`${todoMatches.length} incomplete [TODO] items found`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateOpenCodeAgent(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const content = readFileSync(filePath, "utf-8");

  if (!content.includes("export function create")) {
    errors.push("Missing agent factory function (export function createXxxAgent)");
  }

  if (!content.includes(": AgentConfig")) {
    warnings.push("Missing AgentConfig return type annotation");
  }

  if (!content.includes("name:")) {
    errors.push("Missing 'name' field in agent config");
  }

  if (!content.includes("description:")) {
    errors.push("Missing 'description' field in agent config");
  }

  if (!content.includes("prompt:")) {
    errors.push("Missing 'prompt' field in agent config");
  }

  const todoMatches = content.match(/\[TODO[^\]]*\]/gi);
  if (todoMatches && todoMatches.length > 0) {
    errors.push(`${todoMatches.length} incomplete [TODO] items found`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateAgent(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(filePath)) {
    return { valid: false, errors: [`File not found: ${filePath}`], warnings };
  }

  if (statSync(filePath).isDirectory()) {
    return { valid: false, errors: [`Path is a directory, not a file: ${filePath}`], warnings };
  }

  const ext = extname(filePath);

  if (ext === ".md") {
    return validateCursorAgent(filePath);
  } else if (ext === ".ts") {
    return validateOpenCodeAgent(filePath);
  } else {
    return { valid: false, errors: [`Unsupported file type: ${ext} (expected .md or .ts)`], warnings };
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage: bun scripts/validate-agent.ts <agent-file>");
    console.log("\nExamples:");
    console.log("  bun scripts/validate-agent.ts .cursor/agents/my-agent.md");
    console.log("  bun scripts/validate-agent.ts src/agents/my-agent.ts");
    process.exit(1);
  }

  const filePath = args[0];
  console.log(`Validating agent: ${filePath}\n`);

  const result = validateAgent(filePath);

  if (result.errors.length > 0) {
    console.log("Errors:");
    for (const error of result.errors) {
      console.log(`   - ${error}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of result.warnings) {
      console.log(`   - ${warning}`);
    }
    console.log();
  }

  if (result.valid) {
    console.log("Agent validation passed");
    process.exit(0);
  } else {
    console.log("Agent validation failed");
    process.exit(1);
  }
}

main();
