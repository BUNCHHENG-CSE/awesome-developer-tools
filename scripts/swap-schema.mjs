import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const target = process.argv[2];

if (!target || (target !== "sqlite" && target !== "postgres")) {
  console.error('[swap-schema] Error: Target must be "sqlite" or "postgres".');
  console.error("Usage: bun scripts/swap-schema.mjs [sqlite|postgres]");
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const sourceFile = path.resolve(rootDir, "prisma", `schema.${target}.prisma`);
const destFile = path.resolve(rootDir, "prisma", "schema.prisma");

if (!fs.existsSync(sourceFile)) {
  console.error(`[swap-schema] Error: Source schema file not found at ${sourceFile}`);
  process.exit(1);
}

fs.copyFileSync(sourceFile, destFile);
console.log(`[swap-schema] Active Prisma schema set to: ${target}`);
