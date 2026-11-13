#!/usr/bin/env node
// Copies skills/ from an ayinbox-skills checkout, or with --check fails when the two differ.
// Usage: node scripts/sync-skills.mjs [--check] [path-to-ayinbox-skills]
import { readdirSync, readFileSync, statSync, existsSync, rmSync, mkdirSync, copyFileSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";

const args = process.argv.slice(2);
const check = args.includes("--check");
const source = resolve(args.find((a) => !a.startsWith("--")) ?? "../ayinbox-skills");
const from = join(source, "skills");
const to = resolve("skills");

if (!existsSync(from)) {
  console.error(`no skills/ under ${source}; pass the path to an ayinbox-skills checkout`);
  process.exit(1);
}

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

const want = new Map(files(from).map((p) => [relative(from, p), readFileSync(p)]));
const have = new Map(files(to).map((p) => [relative(to, p), readFileSync(p)]));

if (check) {
  const drift = [];
  for (const [rel, buf] of want) {
    if (!have.has(rel)) drift.push(`missing here: skills/${rel}`);
    else if (!have.get(rel).equals(buf)) drift.push(`differs: skills/${rel}`);
  }
  for (const rel of have.keys()) if (!want.has(rel)) drift.push(`not in ayinbox-skills: skills/${rel}`);
  if (drift.length) {
    for (const d of drift) console.error(`drift: ${d}`);
    console.error("\nRun: node scripts/sync-skills.mjs <path-to-ayinbox-skills>");
    process.exit(1);
  }
  console.log(`ok: ${want.size} skill files match ${source}`);
} else {
  rmSync(to, { recursive: true, force: true });
  for (const rel of want.keys()) {
    mkdirSync(dirname(join(to, rel)), { recursive: true });
    copyFileSync(join(from, rel), join(to, rel));
  }
  console.log(`copied ${want.size} skill files from ${source}`);
}
