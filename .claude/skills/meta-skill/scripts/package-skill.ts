#!/usr/bin/env node
/** Skill Packager - Usage: bun scripts/package-skill.ts <skill-folder> [output-dir] */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "fs";
import { join, basename, resolve } from "path";
import { execSync } from "child_process";

interface PackageResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function validateBeforePackage(skillPath: string): { valid: boolean; error?: string } {
  const skillMdPath = join(skillPath, "SKILL.md");
  
  if (!existsSync(skillMdPath)) {
    return { valid: false, error: "SKILL.md file not found" };
  }

  const content = readFileSync(skillMdPath, "utf-8");
  const todoMatches = content.match(/\[TODO[^\]]*\]/gi);
  
  if (todoMatches && todoMatches.length > 0) {
    return { valid: false, error: `${todoMatches.length} unresolved TODO item(s) found` };
  }

  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { valid: false, error: "YAML frontmatter not found" };
  }

  if (!frontmatterMatch[1].includes("name:")) {
    return { valid: false, error: "Missing 'name' field in frontmatter" };
  }

  if (!frontmatterMatch[1].includes("description:")) {
    return { valid: false, error: "Missing 'description' field in frontmatter" };
  }

  return { valid: true };
}

function packageSkill(skillPath: string, outputDir?: string): PackageResult {
  const resolvedPath = resolve(skillPath);
  const skillName = basename(resolvedPath);

  if (!existsSync(resolvedPath)) {
    return { success: false, error: `Skill folder not found: ${resolvedPath}` };
  }

  if (!statSync(resolvedPath).isDirectory()) {
    return { success: false, error: `Path is not a directory: ${resolvedPath}` };
  }

  console.log("🔍 Validating before packaging...");
  const validation = validateBeforePackage(resolvedPath);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  console.log("✅ Validation passed\n");

  const targetDir = outputDir ? resolve(outputDir) : process.cwd();
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const outputPath = join(targetDir, `${skillName}.skill`);
  const files = getAllFiles(resolvedPath);

  console.log("📦 Packaging files:");
  
  try {
    const zipCommand = `cd "${resolvedPath}" && zip -r "${outputPath}" .`;
    execSync(zipCommand, { stdio: "pipe" });

    for (const file of files) {
      const relativePath = file.replace(resolvedPath + "/", "");
      console.log(`   - ${relativePath}`);
    }

    console.log(`\n✅ Packaging complete: ${outputPath}`);
    return { success: true, outputPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Packaging error: ${message}` };
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage: bun scripts/package-skill.ts <skill-folder> [output-dir]");
    console.log("\nExamples:");
    console.log("  bun scripts/package-skill.ts .claude/skills/my-skill");
    console.log("  bun scripts/package-skill.ts .claude/skills/my-skill ./dist");
    process.exit(1);
  }

  const skillPath = args[0];
  const outputDir = args[1];

  console.log(`📦 Packaging skill: ${skillPath}`);
  if (outputDir) {
    console.log(`   Output directory: ${outputDir}`);
  }
  console.log();

  const result = packageSkill(skillPath, outputDir);

  if (result.success) {
    process.exit(0);
  } else {
    console.error(`❌ Error: ${result.error}`);
    process.exit(1);
  }
}

main();
