#!/usr/bin/env node
// Checks every plugin manifest parses, holds its required fields, agrees on name and version,
// points at files that exist, and registers the same MCP URL.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const MCP_URL = "https://api.ayinbox.com/v1/mcp";
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

function load(file) {
  const path = join(root, file);
  if (!existsSync(path)) {
    fail(file, "missing");
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(file, `invalid JSON: ${e.message}`);
    return null;
  }
}

function need(file, obj, path) {
  const value = path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  if (empty) fail(file, `required field "${path}" is missing`);
  return value;
}

function pathExists(file, p) {
  if (typeof p === "string" && !existsSync(join(root, p))) fail(file, `path ${p} does not exist`);
}

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const semver = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const claude = load(".claude-plugin/plugin.json");
const claudeMarket = load(".claude-plugin/marketplace.json");
const codex = load(".codex-plugin/plugin.json");
const codexMarket = load(".agents/plugins/marketplace.json");
const cursor = load(".cursor-plugin/plugin.json");
const cursorMarket = load(".cursor-plugin/marketplace.json");
const gemini = load("gemini-extension.json");
const mcpClaude = load(".mcp.json");
const mcpCursor = load("mcp.json");

const versions = new Map();
for (const [file, m] of [
  [".claude-plugin/plugin.json", claude],
  [".codex-plugin/plugin.json", codex],
  [".cursor-plugin/plugin.json", cursor],
  ["gemini-extension.json", gemini],
]) {
  if (!m) continue;
  const name = need(file, m, "name");
  if (name && !kebab.test(name)) fail(file, `name "${name}" is not kebab-case`);
  if (name && name !== "ayinbox") fail(file, `name "${name}" should be "ayinbox"`);
  const version = need(file, m, "version");
  if (version && !semver.test(version)) fail(file, `version "${version}" is not semver`);
  versions.set(file, version);
  need(file, m, "description");
}
if (new Set(versions.values()).size > 1) fail("manifests", `versions disagree: ${JSON.stringify(Object.fromEntries(versions))}`);

if (claude) {
  need(".claude-plugin/plugin.json", claude, "author.name");
  for (const key of ["commands", "skills", "agents", "hooks", "mcpServers"]) {
    const v = claude[key];
    for (const p of [v].flat()) if (typeof p === "string") {
      if (!p.startsWith("./")) fail(".claude-plugin/plugin.json", `${key} path must start with ./`);
      pathExists(".claude-plugin/plugin.json", p);
    }
  }
}

for (const [file, m] of [[".claude-plugin/marketplace.json", claudeMarket], [".cursor-plugin/marketplace.json", cursorMarket]]) {
  if (!m) continue;
  need(file, m, "name");
  need(file, m, "owner.name");
  const plugins = need(file, m, "plugins") ?? [];
  for (const [i, p] of plugins.entries()) {
    need(file, p, "name");
    need(file, p, "source");
    if (p.name && p.name !== "ayinbox") fail(file, `plugins[${i}].name should be "ayinbox"`);
    if (typeof p.source === "string") pathExists(file, p.source);
  }
}

if (codex) {
  const f = ".codex-plugin/plugin.json";
  need(f, codex, "author.name");
  pathExists(f, codex.skills);
  pathExists(f, codex.mcpServers);
  for (const k of ["displayName", "shortDescription", "longDescription", "developerName", "category", "capabilities", "composerIcon", "logo"]) {
    need(f, codex, `interface.${k}`);
  }
  pathExists(f, codex.interface?.composerIcon);
  pathExists(f, codex.interface?.logo);
}

if (codexMarket) {
  const f = ".agents/plugins/marketplace.json";
  need(f, codexMarket, "name");
  for (const [i, p] of (need(f, codexMarket, "plugins") ?? []).entries()) {
    need(f, p, "name");
    need(f, p, "source.source");
    need(f, p, "policy.installation");
    need(f, p, "policy.authentication");
    need(f, p, "category");
    if (p.source?.source === "local") pathExists(f, p.source.path);
    if (p.name !== "ayinbox") fail(f, `plugins[${i}].name should be "ayinbox"`);
  }
}

if (cursor?.logo) pathExists(".cursor-plugin/plugin.json", cursor.logo);
if (gemini?.contextFileName) pathExists("gemini-extension.json", gemini.contextFileName);

function checkServer(file, server, urlKey, typeRequired) {
  if (!server) return fail(file, 'no "ayinbox" server under mcpServers');
  if (server[urlKey] !== MCP_URL) fail(file, `${urlKey} should be ${MCP_URL}`);
  if (typeRequired && server.type !== "http") fail(file, 'type should be "http"');
  if (server.headers) fail(file, "headers must not be committed; OAuth is the default");
}
checkServer(".mcp.json", mcpClaude?.mcpServers?.ayinbox, "url", true);
checkServer("mcp.json", mcpCursor?.mcpServers?.ayinbox, "url", false);
checkServer("gemini-extension.json", gemini?.mcpServers?.ayinbox, "httpUrl", false);

const commandsDir = join(root, "commands");
if (existsSync(commandsDir)) {
  for (const name of readdirSync(commandsDir).filter((n) => n.endsWith(".md"))) {
    const text = readFileSync(join(commandsDir, name), "utf8");
    if (!/^---\n(?:[\s\S]*?\n)?description:[ \t]*\S[\s\S]*?\n---\n/.test(text)) fail(`commands/${name}`, "needs frontmatter with a description");
  }
}

if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}
console.log("ok: every manifest parses and agrees");
