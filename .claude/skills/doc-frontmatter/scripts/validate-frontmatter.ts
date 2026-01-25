#!/usr/bin/env node
/**
 * validate-frontmatter.ts
 *
 * docs 폴더의 frontmatter 유효성을 검증합니다.
 *
 * 사용법:
 *   bun scripts/validate-frontmatter.ts <path>
 *
 * 예시:
 *   bun scripts/validate-frontmatter.ts docs/
 *   bun scripts/validate-frontmatter.ts docs/01-foundation/
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";

// ============================================================================
// 타입 정의
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
// 상수
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
// 유틸리티 함수
// ============================================================================

/**
 * 재귀적으로 .md 파일 찾기
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // node_modules, .git 등 제외
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
 * Frontmatter 파싱
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

    // 배열 처리
    if (value.startsWith("[") && value.endsWith("]")) {
      const arrayContent = value.slice(1, -1);
      frontmatter[key] = arrayContent
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    // 문자열 처리
    else if (value.startsWith('"') && value.endsWith('"')) {
      frontmatter[key] = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      frontmatter[key] = value.slice(1, -1);
    }
    // 숫자 처리
    else if (!isNaN(Number(value)) && value !== "") {
      frontmatter[key] = Number(value);
    }
    // 기타
    else {
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

/**
 * 단일 파일 검증
 */
function validateFile(filePath: string): ValidationResult {
  const result: ValidationResult = {
    file: filePath,
    errors: [],
    warnings: [],
  };

  const content = readFileSync(filePath, "utf-8");
  const frontmatter = parseFrontmatter(content);

  // Frontmatter 존재 여부
  if (!frontmatter) {
    result.errors.push("frontmatter가 없습니다");
    return result;
  }

  // 필수 필드 검증
  if (!frontmatter.title) {
    result.errors.push("필수 필드 누락: title");
  } else if (typeof frontmatter.title !== "string") {
    result.errors.push("title은 문자열이어야 합니다");
  }

  if (!frontmatter.description) {
    result.errors.push("필수 필드 누락: description");
  } else if (typeof frontmatter.description !== "string") {
    result.errors.push("description은 문자열이어야 합니다");
  } else {
    const desc = frontmatter.description as string;
    if (desc.length < 50) {
      result.warnings.push(`description이 너무 짧습니다 (${desc.length}자, 권장: 50-160자)`);
    } else if (desc.length > 160) {
      result.warnings.push(`description이 너무 깁니다 (${desc.length}자, 권장: 50-160자)`);
    }
  }

  if (!frontmatter.type) {
    result.errors.push("필수 필드 누락: type");
  } else if (!VALID_TYPES.includes(frontmatter.type as DocumentType)) {
    result.errors.push(
      `유효하지 않은 type: ${frontmatter.type} (허용: ${VALID_TYPES.join(", ")})`
    );
  }

  // 선택 필드 검증
  if (frontmatter.tags) {
    if (!Array.isArray(frontmatter.tags)) {
      result.errors.push("tags는 배열이어야 합니다");
    } else {
      const tags = frontmatter.tags as string[];
      if (tags.length > 5) {
        result.warnings.push(`tags가 너무 많습니다 (${tags.length}개, 최대: 5개)`);
      }
      for (const tag of tags) {
        if (!VALID_TAGS.includes(tag)) {
          result.warnings.push(`알 수 없는 tag: ${tag}`);
        }
      }
    }
  }

  if (frontmatter.order !== undefined) {
    if (typeof frontmatter.order !== "number") {
      result.errors.push("order는 숫자여야 합니다");
    }
  }

  // 관계 필드 검증
  const relationFields = ["depends_on", "related", "used_by"];
  for (const field of relationFields) {
    if (frontmatter[field]) {
      if (!Array.isArray(frontmatter[field])) {
        result.errors.push(`${field}는 배열이어야 합니다`);
      }
    }
  }

  return result;
}

// ============================================================================
// 메인 함수
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
사용법: bun validate-frontmatter.ts <path>

예시:
  bun validate-frontmatter.ts docs/
  bun validate-frontmatter.ts docs/01-foundation/
  bun validate-frontmatter.ts docs/01-foundation/00-setup.md
`);
    process.exit(0);
  }

  const targetPath = args[0];

  if (!existsSync(targetPath)) {
    console.error(`❌ 경로를 찾을 수 없습니다: ${targetPath}`);
    process.exit(1);
  }

  const stat = statSync(targetPath);
  const files = stat.isDirectory()
    ? findMarkdownFiles(targetPath)
    : [targetPath];

  console.log(`\n🔍 ${files.length}개 파일 검증 중...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  const results: ValidationResult[] = [];

  for (const file of files) {
    const result = validateFile(file);
    results.push(result);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }

  // 결과 출력
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

  // 요약
  console.log("─".repeat(50));
  console.log(`\n📊 검증 결과:`);
  console.log(`   총 파일: ${files.length}개`);
  console.log(`   에러: ${totalErrors}개`);
  console.log(`   경고: ${totalWarnings}개`);

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(`\n✅ 모든 파일이 유효합니다!`);
  } else if (totalErrors === 0) {
    console.log(`\n⚠️  경고가 있지만 필수 요구사항은 충족합니다.`);
  } else {
    console.log(`\n❌ ${totalErrors}개의 에러를 수정해주세요.`);
    process.exit(1);
  }
}

main().catch(console.error);
