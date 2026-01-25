#!/usr/bin/env node
/**
 * generate-frontmatter.ts
 *
 * Analyzes document content to generate YAML frontmatter.
 *
 * Usage:
 *   bun scripts/generate-frontmatter.ts <file-path>
 *
 * Examples:
 *   bun scripts/generate-frontmatter.ts docs/01-foundation/00-setup.md
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { basename, dirname, relative } from "path";

// ============================================================================
// Type Definitions
// ============================================================================

interface Frontmatter {
  title: string;
  description: string;
  type: DocumentType;
  tags?: string[];
  order?: number;
  depends_on?: string[];
  related?: string[];
  used_by?: string[];
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
  // Tech stack
  "React",
  "TypeScript",
  "Next.js",
  "Kubernetes",
  "Nx",
  "Tailwind",
  // Domain
  "API",
  "Testing",
  "Deployment",
  "CI-CD",
  "Security",
  // Task type
  "Setup",
  "Migration",
  "BestPractice",
  "Architecture",
  // Other
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
 * Parse existing frontmatter
 */
function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown> | null;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  const yamlContent = match[1];
  const body = match[2];

  // Simple YAML parsing (for complex cases, use yaml library)
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

  return { frontmatter, body };
}

/**
 * Extract first H1 header
 */
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Generate title from filename
 */
function titleFromFilename(filename: string): string {
  // 00-guide.md -> guide
  const name = basename(filename, ".md").replace(/^\d+-/, "");
  // kebab-case -> Title Case
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extract order from filename
 */
function extractOrder(filename: string): number | undefined {
  const match = basename(filename).match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Generate description from document content
 */
function generateDescription(content: string, title: string): string {
  // Find first paragraph after H1
  const lines = content.split("\n");
  let foundH1 = false;
  let description = "";

  for (const line of lines) {
    if (line.startsWith("# ")) {
      foundH1 = true;
      continue;
    }
    if (foundH1 && line.trim() && !line.startsWith("#") && !line.startsWith(">") && !line.startsWith("-") && !line.startsWith("|")) {
      description = line.trim();
      break;
    }
  }

  // Generate title-based description if none found
  if (!description) {
    description = `Documentation about ${title}.`;
  }

  // Limit to 50-160 characters
  if (description.length > 160) {
    description = description.slice(0, 157) + "...";
  }

  return description;
}

/**
 * Determine document type
 */
function determineType(content: string, filename: string): DocumentType {
  const lowerContent = content.toLowerCase();
  const lowerFilename = filename.toLowerCase();

  // Filename-based detection
  if (lowerFilename.includes("readme")) return "index";
  if (lowerFilename.includes(".adr.")) return "adr";
  if (lowerFilename.includes("troubleshoot")) return "troubleshooting";

  // Content-based detection
  if (lowerContent.includes("## status") && lowerContent.includes("## context"))
    return "adr";
  if (lowerContent.includes("## problem") && lowerContent.includes("## solution"))
    return "troubleshooting";
  if (lowerContent.includes("pattern"))
    return "pattern";
  if (
    lowerContent.includes("step") &&
    (lowerContent.includes("1.") || lowerContent.includes("step"))
  )
    return "tutorial";
  if (
    lowerContent.includes("how to") ||
    lowerContent.includes("guide")
  )
    return "guide";
  if (
    lowerContent.includes("api") ||
    lowerContent.includes("spec") ||
    lowerContent.includes("config")
  )
    return "reference";
  if (lowerContent.includes("why") || lowerContent.includes("background"))
    return "explanation";

  return "guide"; // Default
}

/**
 * Extract tags from document content
 */
function extractTags(content: string): string[] {
  const lowerContent = content.toLowerCase();
  const tags: string[] = [];

  const tagKeywords: Record<string, string[]> = {
    React: ["react", "component", "hook", "jsx"],
    TypeScript: ["typescript", "type", "interface"],
    "Next.js": ["next.js", "next", "ssr", "app router"],
    Kubernetes: ["kubernetes", "k8s", "pod", "deployment"],
    Nx: ["nx", "monorepo"],
    Tailwind: ["tailwind", "css", "style"],
    API: ["api", "fetch", "query", "mutation"],
    Testing: ["test", "jest", "vitest"],
    Deployment: ["deploy", "argocd"],
    "CI-CD": ["ci", "cd", "github actions", "pipeline"],
    Security: ["security", "auth"],
    Setup: ["setup", "install", "config"],
    Migration: ["migration", "upgrade"],
    BestPractice: ["best practice", "recommended"],
    Architecture: ["architecture", "structure"],
    Documentation: ["documentation", "docs"],
    Frontmatter: ["frontmatter", "metadata"],
    AI: ["ai", "llm", "agent"],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((keyword) => lowerContent.includes(keyword))) {
      tags.push(tag);
    }
  }

  // Limit to max 5
  return tags.slice(0, 5);
}

/**
 * Convert Frontmatter to YAML string
 */
function frontmatterToYaml(fm: Frontmatter): string {
  const lines: string[] = ["---"];

  lines.push(`title: "${fm.title}"`);
  lines.push(`description: "${fm.description}"`);
  lines.push(`type: ${fm.type}`);

  if (fm.tags && fm.tags.length > 0) {
    lines.push(`tags: [${fm.tags.join(", ")}]`);
  }

  if (fm.order !== undefined) {
    lines.push(`order: ${fm.order}`);
  }

  if (fm.depends_on && fm.depends_on.length > 0) {
    lines.push(`depends_on: [${fm.depends_on.join(", ")}]`);
  }

  if (fm.related && fm.related.length > 0) {
    lines.push(`related: [${fm.related.join(", ")}]`);
  }

  if (fm.used_by && fm.used_by.length > 0) {
    lines.push(`used_by: [${fm.used_by.join(", ")}]`);
  }

  lines.push("---");

  return lines.join("\n");
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: bun generate-frontmatter.ts <file-path> [options]

Options:
  --dry-run    Preview result without modifying file
  --force      Overwrite even if frontmatter exists

Examples:
  bun generate-frontmatter.ts docs/01-foundation/00-setup.md
  bun generate-frontmatter.ts docs/01-foundation/00-setup.md --dry-run
`);
    process.exit(0);
  }

  const filePath = args[0];
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");

  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const { frontmatter: existingFm, body } = parseFrontmatter(content);

  if (existingFm && !force) {
    console.log(`ℹ️  Frontmatter already exists: ${filePath}`);
    console.log("   Use --force option to overwrite.");
    process.exit(0);
  }

  // Generate frontmatter
  const title = extractTitle(body) || titleFromFilename(filePath);
  const description = generateDescription(body, title);
  const type = determineType(body, filePath);
  const tags = extractTags(body);
  const order = extractOrder(filePath);

  const newFrontmatter: Frontmatter = {
    title,
    description,
    type,
    ...(tags.length > 0 && { tags }),
    ...(order !== undefined && { order }),
  };

  const yamlContent = frontmatterToYaml(newFrontmatter);
  const newContent = `${yamlContent}\n${body.startsWith("\n") ? body : "\n" + body}`;

  console.log(`\n📄 File: ${filePath}`);
  console.log(`\nGenerated frontmatter:`);
  console.log(yamlContent);

  if (dryRun) {
    console.log("\n🔍 --dry-run mode: File was not modified.");
  } else {
    writeFileSync(filePath, newContent, "utf-8");
    console.log("\n✅ Frontmatter added successfully.");
  }
}

main().catch(console.error);
