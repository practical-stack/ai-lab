#!/usr/bin/env node
/**
 * generate-frontmatter.ts
 *
 * 문서 내용을 분석하여 YAML frontmatter를 생성합니다.
 *
 * 사용법:
 *   bun scripts/generate-frontmatter.ts <file-path>
 *
 * 예시:
 *   bun scripts/generate-frontmatter.ts docs/01-foundation/00-setup.md
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { basename, dirname, relative } from "path";

// ============================================================================
// 타입 정의
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
// 상수
// ============================================================================

const VALID_TAGS = [
  // 기술 스택
  "React",
  "TypeScript",
  "Next.js",
  "Kubernetes",
  "Nx",
  "Tailwind",
  // 도메인
  "API",
  "Testing",
  "Deployment",
  "CI-CD",
  "Security",
  // 작업 유형
  "Setup",
  "Migration",
  "BestPractice",
  "Architecture",
  // 기타
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
 * 기존 frontmatter 파싱
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

  // 간단한 YAML 파싱 (복잡한 경우 yaml 라이브러리 사용 권장)
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

  return { frontmatter, body };
}

/**
 * 첫 번째 H1 헤더 추출
 */
function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * 파일명에서 title 생성
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
 * 파일명에서 order 추출
 */
function extractOrder(filename: string): number | undefined {
  const match = basename(filename).match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * 문서 내용에서 description 생성
 */
function generateDescription(content: string, title: string): string {
  // H1 이후 첫 번째 단락 찾기
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

  // description이 없으면 title 기반 생성
  if (!description) {
    description = `${title}에 대한 문서입니다.`;
  }

  // 50-160자 제한
  if (description.length > 160) {
    description = description.slice(0, 157) + "...";
  }

  return description;
}

/**
 * 문서 type 결정
 */
function determineType(content: string, filename: string): DocumentType {
  const lowerContent = content.toLowerCase();
  const lowerFilename = filename.toLowerCase();

  // 파일명 기반 판단
  if (lowerFilename.includes("readme")) return "index";
  if (lowerFilename.includes(".adr.")) return "adr";
  if (lowerFilename.includes("troubleshoot")) return "troubleshooting";

  // 내용 기반 판단
  if (lowerContent.includes("## 상태") && lowerContent.includes("## 컨텍스트"))
    return "adr";
  if (lowerContent.includes("## 문제") && lowerContent.includes("## 해결"))
    return "troubleshooting";
  if (lowerContent.includes("패턴") || lowerContent.includes("pattern"))
    return "pattern";
  if (
    lowerContent.includes("단계") &&
    (lowerContent.includes("1.") || lowerContent.includes("step"))
  )
    return "tutorial";
  if (
    lowerContent.includes("방법") ||
    lowerContent.includes("how to") ||
    lowerContent.includes("가이드")
  )
    return "guide";
  if (
    lowerContent.includes("api") ||
    lowerContent.includes("스펙") ||
    lowerContent.includes("설정")
  )
    return "reference";
  if (lowerContent.includes("왜") || lowerContent.includes("배경"))
    return "explanation";

  return "guide"; // 기본값
}

/**
 * 문서 내용에서 tags 추출
 */
function extractTags(content: string): string[] {
  const lowerContent = content.toLowerCase();
  const tags: string[] = [];

  const tagKeywords: Record<string, string[]> = {
    React: ["react", "컴포넌트", "훅", "hook", "jsx"],
    TypeScript: ["typescript", "타입", "interface", "type"],
    "Next.js": ["next.js", "next", "ssr", "app router"],
    Kubernetes: ["kubernetes", "k8s", "pod", "deployment"],
    Nx: ["nx", "모노레포", "monorepo"],
    Tailwind: ["tailwind", "css", "스타일"],
    API: ["api", "fetch", "query", "mutation"],
    Testing: ["test", "테스트", "jest", "vitest"],
    Deployment: ["deploy", "배포", "argocd"],
    "CI-CD": ["ci", "cd", "github actions", "pipeline"],
    Security: ["security", "보안", "인증", "auth"],
    Setup: ["setup", "설치", "설정", "install"],
    Migration: ["migration", "마이그레이션", "upgrade"],
    BestPractice: ["best practice", "베스트", "권장"],
    Architecture: ["architecture", "아키텍처", "구조"],
    Documentation: ["documentation", "문서", "docs"],
    Frontmatter: ["frontmatter", "메타데이터"],
    AI: ["ai", "llm", "agent"],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((keyword) => lowerContent.includes(keyword))) {
      tags.push(tag);
    }
  }

  // 최대 5개로 제한
  return tags.slice(0, 5);
}

/**
 * Frontmatter를 YAML 문자열로 변환
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
// 메인 함수
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
사용법: bun generate-frontmatter.ts <file-path> [options]

옵션:
  --dry-run    파일을 수정하지 않고 결과만 출력
  --force      기존 frontmatter가 있어도 덮어쓰기

예시:
  bun generate-frontmatter.ts docs/01-foundation/00-setup.md
  bun generate-frontmatter.ts docs/01-foundation/00-setup.md --dry-run
`);
    process.exit(0);
  }

  const filePath = args[0];
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");

  if (!existsSync(filePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  const { frontmatter: existingFm, body } = parseFrontmatter(content);

  if (existingFm && !force) {
    console.log(`ℹ️  이미 frontmatter가 있습니다: ${filePath}`);
    console.log("   --force 옵션으로 덮어쓸 수 있습니다.");
    process.exit(0);
  }

  // Frontmatter 생성
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

  console.log(`\n📄 파일: ${filePath}`);
  console.log(`\n생성된 frontmatter:`);
  console.log(yamlContent);

  if (dryRun) {
    console.log("\n🔍 --dry-run 모드: 파일이 수정되지 않았습니다.");
  } else {
    writeFileSync(filePath, newContent, "utf-8");
    console.log("\n✅ frontmatter가 추가되었습니다.");
  }
}

main().catch(console.error);
