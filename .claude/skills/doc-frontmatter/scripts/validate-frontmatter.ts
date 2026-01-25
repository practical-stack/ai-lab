#!/usr/bin/env node
/**
 * validate-frontmatter.ts
 *
 * Validates frontmatter in docs folder markdown files.
 *
 * Usage:
 *   bun scripts/validate-frontmatter.ts <path>
 *
 * Examples:
 *   bun scripts/validate-frontmatter.ts docs/
 *   bun scripts/validate-frontmatter.ts docs/01-foundation/
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";

// ============================================================================
// Type Definitions
// ============================================================================

interface ValidationResult {
  file: string;
  errors: string[];
  warnings: string[];
}

type DocumentType =
  | "tutorial"
  | "guide"
  | "reference"
  | "explanation"
  | "adr"
  | "troubleshooting"
  | "pattern"
  | "index";

// ============================================================================
// Constants
// ============================================================================

const VALID_TAGS = [
  "React",
  "TypeScript",
  "Next.js",
  "Kubernetes",
  "Nx",
  "Tailwind",
  "API",
  "Testing",
  "Deployment",
  "CI-CD",
  "Security",
  "Setup",
  "Migration",
  "BestPractice",
  "Architecture",
  "Documentation",
  "Frontmatter",
  "AI",
];

const VALID_TYPES: DocumentType[] = [
  "tutorial",
  "guide",
  "reference",
  "explanation",
  "adr",
  "troubleshooting",
  "pattern",
  "index",
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Recursively find .md files
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Exclude node_modules, .git, etc.
      if (!item.startsWith(".") && item !== "node_modules") {
        files.push(...findMarkdownFiles(fullPath));
      }
    } else if (item.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse frontmatter
 */
function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yamlContent = match[1];
  const frontmatter: Record<string, unknown> = {};
  const lines = yamlContent.split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Array handling
    if (value.startsWith("[") && value.endsWith("]")) {
      const arrayContent = value.slice(1, -1);
      frontmatter[key] = arrayContent
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    // String handling
    else if (value.startsWith('"') && value.endsWith('"')) {
      frontmatter[key] = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      frontmatter[key] = value.slice(1, -1);
    }
    // Number handling
    else if (!isNaN(Number(value)) && value !== "") {
      frontmatter[key] = Number(value);
    }
    // Other
    else {
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * Validate single file
 */
function validateFile(filePath: string): ValidationResult {
  const result: ValidationResult = {
    file: filePath,
    errors: [],
    warnings: [],
  };

  const content = readFileSync(filePath, "utf-8");
  const frontmatter = parseFrontmatter(content);

  // Check frontmatter existence
  if (!frontmatter) {
    result.errors.push("No frontmatter found");
    return result;
  }

  // Required field validation
  if (!frontmatter.title) {
    result.errors.push("Missing required field: title");
  } else if (typeof frontmatter.title !== "string") {
    result.errors.push("title must be a string");
  }

  if (!frontmatter.description) {
    result.errors.push("Missing required field: description");
  } else if (typeof frontmatter.description !== "string") {
    result.errors.push("description must be a string");
  } else {
    const desc = frontmatter.description as string;
    if (desc.length < 50) {
      result.warnings.push(`description is too short (${desc.length} chars, recommended: 50-160)`);
    } else if (desc.length > 160) {
      result.warnings.push(`description is too long (${desc.length} chars, recommended: 50-160)`);
    }
  }

  if (!frontmatter.type) {
    result.errors.push("Missing required field: type");
  } else if (!VALID_TYPES.includes(frontmatter.type as DocumentType)) {
    result.errors.push(
      `Invalid type: ${frontmatter.type} (allowed: ${VALID_TYPES.join(", ")})`
    );
  }

  // Optional field validation
  if (frontmatter.tags) {
    if (!Array.isArray(frontmatter.tags)) {
      result.errors.push("tags must be an array");
    } else {
      const tags = frontmatter.tags as string[];
      if (tags.length > 5) {
        result.warnings.push(`Too many tags (${tags.length}, max: 5)`);
      }
      for (const tag of tags) {
        if (!VALID_TAGS.includes(tag)) {
          result.warnings.push(`Unknown tag: ${tag}`);
        }
      }
    }
  }

  if (frontmatter.order !== undefined) {
    if (typeof frontmatter.order !== "number") {
      result.errors.push("order must be a number");
    }
  }

  // Relationship field validation
  const relationFields = ["depends_on", "related", "used_by"];
  for (const field of relationFields) {
    if (frontmatter[field]) {
      if (!Array.isArray(frontmatter[field])) {
        result.errors.push(`${field} must be an array`);
      }
    }
  }

  return result;
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: bun validate-frontmatter.ts <path>

Examples:
  bun validate-frontmatter.ts docs/
  bun validate-frontmatter.ts docs/01-foundation/
  bun validate-frontmatter.ts docs/01-foundation/00-setup.md
`);
    process.exit(0);
  }

  const targetPath = args[0];

  if (!existsSync(targetPath)) {
    console.error(`❌ Path not found: ${targetPath}`);
    process.exit(1);
  }

  const stat = statSync(targetPath);
  const files = stat.isDirectory()
    ? findMarkdownFiles(targetPath)
    : [targetPath];

  console.log(`\n🔍 Validating ${files.length} file(s)...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const results: ValidationResult[] = [];

  for (const file of files) {
    const result = validateFile(file);
    results.push(result);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }

  // Output results
  for (const result of results) {
    if (result.errors.length > 0 || result.warnings.length > 0) {
      console.log(`📄 ${relative(process.cwd(), result.file)}`);

      for (const error of result.errors) {
        console.log(`   ❌ ${error}`);
      }

      for (const warning of result.warnings) {
        console.log(`   ⚠️  ${warning}`);
      }

      console.log();
    }
  }

  // Summary
  console.log("─".repeat(50));
  console.log(`\n📊 Validation Results:`);
  console.log(`   Total files: ${files.length}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`\n✅ All files are valid!`);
  } else if (totalErrors === 0) {
    console.log(`\n⚠️  Warnings found, but required fields are satisfied.`);
  } else {
    console.log(`\n❌ Please fix ${totalErrors} error(s).`);
    process.exit(1);
  }
}

main().catch(console.error);
