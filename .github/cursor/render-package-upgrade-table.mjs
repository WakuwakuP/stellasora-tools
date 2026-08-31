#!/usr/bin/env node
// Render a markdown table of direct-dependency upgrades for weekly PRs.
// Supports package.json (Yarn / npm / pnpm lockfiles) and Cargo.toml / Cargo.lock.

import { readFileSync } from "node:fs";

const NODE_SECTIONS = [
  ["dependencies", "dependencies"],
  ["devDependencies", "devDependencies"],
  ["optionalDependencies", "optionalDependencies"],
  ["resolutions", "resolutions"],
  ["overrides", "overrides"],
];

const CARGO_SECTIONS = new Map([
  ["dependencies", "dependencies"],
  ["dev-dependencies", "dev-dependencies"],
  ["build-dependencies", "build-dependencies"],
  ["workspace.dependencies", "workspace.dependencies"],
]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--") || i + 1 >= argv.length) {
      throw new Error(`Invalid argument: ${key}`);
    }
    args[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseDescriptors(rawKey) {
  return unquote(rawKey)
    .split(", ")
    .flatMap((descriptor) => {
      const match = descriptor.match(/^(.+?)@(?:([^:]+):)?(.+)$/);
      if (!match) {
        return [];
      }
      return [
        {
          name: match[1],
          protocol: match[2] ?? "npm",
          range: match[3],
        },
      ];
    });
}

function parseYarnLock(text) {
  const versions = new Map();
  let currentDescriptors = [];

  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("#") || line.trim() === "") {
      continue;
    }
    if (!line.startsWith(" ") && line.endsWith(":")) {
      currentDescriptors = parseDescriptors(line.slice(0, -1));
      continue;
    }
    const versionMatch = line.match(/^ {2}version: (.+)$/);
    if (!versionMatch || currentDescriptors.length === 0) {
      continue;
    }
    const version = unquote(versionMatch[1]);
    for (const descriptor of currentDescriptors) {
      versions.set(
        `${descriptor.name}\t${descriptor.protocol}\t${descriptor.range}`,
        version,
      );
    }
  }

  return versions;
}

function parseNpmLock(text) {
  const versions = new Map();
  const lock = JSON.parse(text);
  const packages = lock.packages ?? {};
  for (const [key, value] of Object.entries(packages)) {
    if (!key.startsWith("node_modules/") || !value || typeof value !== "object") {
      continue;
    }
    const rest = key.slice("node_modules/".length);
    if (rest.includes("/node_modules/") || typeof value.version !== "string") {
      continue;
    }
    versions.set(`${rest}\tnpm\t`, value.version);
  }
  return versions;
}

function pnpmResolvedVersion(raw) {
  if (!raw || raw.startsWith("link:") || raw.startsWith("file:")) {
    return "";
  }
  const paren = raw.indexOf("(");
  return paren === -1 ? raw : raw.slice(0, paren);
}

function parsePnpmLock(text) {
  const versions = new Map();
  const importerSections = new Set([
    "dependencies",
    "devDependencies",
    "optionalDependencies",
  ]);
  let inImporters = false;
  let importer = "";
  let section = "";
  let depName = "";
  let specifier = "";

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replaceAll("\t", "  ");
    if (!inImporters) {
      if (line === "importers:") {
        inImporters = true;
      }
      continue;
    }
    if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("#")) {
      break;
    }
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const indent = line.match(/^ */)[0].length;
    if (indent === 2 && trimmed.endsWith(":")) {
      importer = unquote(trimmed.slice(0, -1));
      section = "";
      depName = "";
      specifier = "";
      continue;
    }
    if (indent === 4 && trimmed.endsWith(":")) {
      const key = trimmed.slice(0, -1);
      section = importerSections.has(key) ? key : "";
      depName = "";
      specifier = "";
      continue;
    }
    if (indent === 6 && trimmed.endsWith(":") && section && importer) {
      depName = unquote(trimmed.slice(0, -1));
      specifier = "";
      continue;
    }
    if (indent !== 8 || !depName || !importer) {
      continue;
    }

    const specMatch = trimmed.match(/^specifier:\s*(.*)$/);
    if (specMatch) {
      specifier = unquote(specMatch[1].trim());
      continue;
    }
    const verMatch = trimmed.match(/^version:\s*(.*)$/);
    if (!verMatch) {
      continue;
    }
    const resolved = pnpmResolvedVersion(unquote(verMatch[1].trim()));
    if (!resolved) {
      continue;
    }
    versions.set(`${importer}\t${depName}\tnpm\t${specifier}`, resolved);
    versions.set(`${importer}\t${depName}\tnpm\t`, resolved);
  }

  return versions;
}

function readNodeLock(path) {
  if (!path) {
    return new Map();
  }
  const text = readText(path);
  const trimmed = text.trimStart();
  if (trimmed.startsWith("{")) {
    return parseNpmLock(text);
  }
  if (/^lockfileVersion:/m.test(text)) {
    return parsePnpmLock(text);
  }
  return parseYarnLock(text);
}

function lockImporterFromPackagePath(packagePath) {
  if (!packagePath) {
    return ".";
  }
  const normalized = packagePath.replaceAll("\\", "/");
  if (!normalized.endsWith("package.json")) {
    return ".";
  }
  const dir = normalized.slice(0, -"package.json".length).replace(/\/$/, "");
  return dir && dir !== "." ? dir : ".";
}

function nodeLockVersion(lock, name, spec, importer) {
  if (!spec || spec.startsWith("workspace:")) {
    return "";
  }
  if (importer) {
    const scoped =
      lock.get(`${importer}\t${name}\tnpm\t${spec}`) ??
      lock.get(`${importer}\t${name}\tnpm\t`);
    if (scoped) {
      return scoped;
    }
  }
  return (
    lock.get(`${name}\tnpm\t${spec}`) ??
    lock.get(`${name}\tpatch\t${spec}`) ??
    lock.get(`${name}\tnpm\t`) ??
    ""
  );
}

function collectNodeSpecs(manifest) {
  const specs = new Map();
  for (const [field, kind] of NODE_SECTIONS) {
    const section = manifest[field];
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      continue;
    }
    for (const [name, spec] of Object.entries(section)) {
      if (typeof spec !== "string") {
        continue;
      }
      const key = `${kind}\t${name}`;
      if (!specs.has(key)) {
        specs.set(key, { kind, name, spec });
      }
    }
  }
  return specs;
}

function cargoInlineSpec(body) {
  const versionMatch = body.match(/version\s*=\s*"([^"]+)"/);
  if (versionMatch) {
    return versionMatch[1];
  }
  if (/\bworkspace\s*=/.test(body)) {
    return "workspace";
  }
  if (/\bpath\s*=/.test(body)) {
    return "path";
  }
  if (/\bgit\s*=/.test(body)) {
    return "git";
  }
  return body.trim();
}

function parseCargoToml(text) {
  const specs = new Map();
  let section = "";
  let pendingName = "";

  for (const rawLine of text.split(/\r?\n/)) {
    const trimmed = rawLine.replace(/#.*$/, "").trim();
    if (!trimmed) {
      continue;
    }

    const header = trimmed.match(/^\[(.+)\]$/);
    if (header) {
      const name = header[1];
      pendingName = "";
      if (CARGO_SECTIONS.has(name)) {
        section = CARGO_SECTIONS.get(name);
        continue;
      }
      const dotted = name.match(
        /^(dependencies|dev-dependencies|build-dependencies)\.(.+)$/,
      );
      if (dotted) {
        section = dotted[1];
        pendingName = dotted[2];
      } else {
        section = "";
      }
      continue;
    }
    if (!section) {
      continue;
    }

    if (pendingName) {
      const versionMatch = trimmed.match(/^version\s*=\s*"([^"]+)"/);
      if (versionMatch) {
        specs.set(`${section}\t${pendingName}`, {
          kind: section,
          name: pendingName,
          spec: versionMatch[1],
        });
      }
      continue;
    }

    const simple = trimmed.match(/^([A-Za-z0-9_-]+)\s*=\s*"([^"]+)"\s*$/);
    if (simple) {
      specs.set(`${section}\t${simple[1]}`, {
        kind: section,
        name: simple[1],
        spec: simple[2],
      });
      continue;
    }

    const inline = trimmed.match(/^([A-Za-z0-9_-]+)\s*=\s*\{(.+)\}\s*$/);
    if (inline) {
      specs.set(`${section}\t${inline[1]}`, {
        kind: section,
        name: inline[1],
        spec: cargoInlineSpec(inline[2]),
      });
    }
  }

  return specs;
}

function parseCargoLock(text) {
  const versions = new Map();
  let name = "";

  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === "[[package]]") {
      name = "";
      continue;
    }
    const nameMatch = line.match(/^name = "([^"]+)"$/);
    if (nameMatch) {
      name = nameMatch[1];
      continue;
    }
    const versionMatch = line.match(/^version = "([^"]+)"$/);
    if (!versionMatch || !name) {
      continue;
    }
    const current = versions.get(name) ?? new Set();
    current.add(versionMatch[1]);
    versions.set(name, current);
  }

  return versions;
}

function cargoLockVersion(lock, name) {
  const set = lock.get(name);
  if (!set || set.size === 0) {
    return "";
  }
  return [...set].sort().join(", ");
}

function cell(value) {
  const text = value === "" ? "—" : value.replaceAll("|", "\\|");
  return `\`${text}\``;
}

function displayVersion(spec, resolved) {
  return resolved || spec || "";
}

function collectRowsFromSpecs(oldSpecs, newSpecs, resolveOld, resolveNew, kindOrder) {
  const names = new Set([...oldSpecs.keys(), ...newSpecs.keys()]);
  const rows = [];

  for (const key of names) {
    const before = oldSpecs.get(key);
    const after = newSpecs.get(key);
    const name = (after ?? before).name;
    const kind = (after ?? before).kind;
    const oldSpec = before?.spec ?? "";
    const newSpec = after?.spec ?? "";
    const oldResolved = resolveOld(name, oldSpec);
    const newResolved = resolveNew(name, newSpec);

    if (oldSpec === newSpec && oldResolved === newResolved) {
      continue;
    }

    rows.push({
      after: displayVersion(newSpec, newResolved),
      before: displayVersion(oldSpec, oldResolved),
      kind,
      name,
    });
  }

  rows.sort((a, b) => {
    const kindDiff = (kindOrder.get(a.kind) ?? 99) - (kindOrder.get(b.kind) ?? 99);
    if (kindDiff !== 0) {
      return kindDiff;
    }
    return a.name.localeCompare(b.name);
  });
  return rows;
}

function collectNodeRows(args) {
  if (!args["old-package"] || !args["new-package"]) {
    return [];
  }
  const kindOrder = new Map(NODE_SECTIONS.map(([field], index) => [field, index]));
  const importer = lockImporterFromPackagePath(args["new-package"]);
  const oldLock = readNodeLock(args["old-lock"]);
  const newLock = readNodeLock(args["new-lock"]);
  return collectRowsFromSpecs(
    collectNodeSpecs(readJson(args["old-package"])),
    collectNodeSpecs(readJson(args["new-package"])),
    (name, spec) => nodeLockVersion(oldLock, name, spec, importer),
    (name, spec) => nodeLockVersion(newLock, name, spec, importer),
    kindOrder,
  );
}

function collectCargoRows(args) {
  if (!args["old-cargo"] || !args["new-cargo"]) {
    return [];
  }
  const kindOrder = new Map(
    [...CARGO_SECTIONS.values()].map((kind, index) => [kind, index]),
  );
  const oldLock = args["old-cargo-lock"]
    ? parseCargoLock(readText(args["old-cargo-lock"]))
    : new Map();
  const newLock = args["new-cargo-lock"]
    ? parseCargoLock(readText(args["new-cargo-lock"]))
    : new Map();
  return collectRowsFromSpecs(
    parseCargoToml(readText(args["old-cargo"])),
    parseCargoToml(readText(args["new-cargo"])),
    (name) => cargoLockVersion(oldLock, name),
    (name) => cargoLockVersion(newLock, name),
    kindOrder,
  );
}

function renderTable(rows) {
  if (rows.length === 0) {
    return [
      "## 更新パッケージ",
      "",
      "直接依存のバージョンに変更はありません。",
      "",
    ].join("\n");
  }

  const lines = [
    "## 更新パッケージ",
    "",
    "| パッケージ | 区分 | 変更前 | 変更後 |",
    "| --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${cell(row.name)} | ${row.kind} | ${cell(row.before)} | ${cell(row.after)} |`,
    ),
    "",
  ];
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const hasNode = Boolean(args["old-package"] && args["new-package"]);
  const hasCargo = Boolean(args["old-cargo"] && args["new-cargo"]);
  if (!hasNode && !hasCargo) {
    throw new Error(
      "Usage: --old-package <path> --new-package <path> [--old-lock <path>] [--new-lock <path>] [--old-cargo <path> --new-cargo <path> [--old-cargo-lock <path>] [--new-cargo-lock <path>]]",
    );
  }

  const rows = [...collectNodeRows(args), ...collectCargoRows(args)];
  process.stdout.write(`${renderTable(rows)}\n`);
}

main();
