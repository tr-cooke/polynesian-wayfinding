#!/usr/bin/env node
// Ocean Adventure — pre-commit static checker
// Place in polynesian-wayfinding/ next to package.json
// Run: node check.cjs
// Auto-runs on git commit if .git/hooks/pre-commit is set up

const fs   = require("fs");
const path = require("path");

const APP  = fs.readFileSync("./src/App.jsx",  "utf8");
const DATA = fs.readFileSync("./src/data.jsx", "utf8");
const lines = APP.split("\n");

let errors   = 0;
let warnings = 0;

function err(msg)  { console.log(`  ✗ ERROR:   ${msg}`);   errors++;   }
function warn(msg) { console.log(`  ⚠ WARNING: ${msg}`);   warnings++; }
function ok(msg)   { console.log(`  ✓ ${msg}`); }

// ─────────────────────────────────────────────────────────────────────────────
// 1. HOOKS AFTER EARLY RETURNS
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 1. Hooks after early returns ──────────────────────────────");

let funcStart = -1, funcName = "";
let firstEarlyReturn = -1;
let hooksAfter = [];
let braceDepth = 0;

function stripStringsAndComments(line) {
  // Heuristic: remove string contents and line comments to avoid counting braces in JSX/text.
  // This is not a full parser, but it's enough to distinguish top-level returns from nested callbacks.
  return line
    .replace(/\/\/.*$/g, "")
    .replace(/'([^'\\]|\\.)*'/g, "''")
    .replace(/"([^"\\]|\\.)*"/g, '""')
    .replace(/`([^`\\]|\\.|\\\n)*`/g, "``");
}

for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();

  if (/^function [A-Z]\w+\(/.test(l)) {
    if (funcStart >= 0 && hooksAfter.length > 0) {
      err(`${funcName}: hook(s) after early return (L${firstEarlyReturn + 1}): lines ${hooksAfter.map(n => n+1).join(", ")}`);
    }
    funcStart = i;
    funcName = l.match(/^function (\w+)/)[1];
    firstEarlyReturn = -1;
    hooksAfter = [];
    braceDepth = 0;
    continue;
  }

  if (funcStart < 0) continue;

  // Track approximate nesting depth within the current function body.
  // We only treat "early returns" as those that occur at the top level of the component body,
  // not inside nested callbacks (e.g. inside useEffect).
  const stripped = stripStringsAndComments(lines[i]);
  for (const ch of stripped) {
    if (ch === "{") braceDepth++;
    else if (ch === "}") braceDepth = Math.max(0, braceDepth - 1);
  }

  if (firstEarlyReturn < 0 && braceDepth === 1 && /^\s*if \(/.test(lines[i])) {
    for (let j = i; j < Math.min(i + 5, lines.length); j++) {
      if (/return \(|return </.test(lines[j])) {
        firstEarlyReturn = i;
        break;
      }
    }
  }

  if (firstEarlyReturn >= 0 && braceDepth === 1 && /use(Effect|State|Ref|Callback|Memo)\(/.test(l)) {
    hooksAfter.push(i);
  }
}
if (funcStart >= 0 && hooksAfter.length > 0) {
  err(`${funcName}: hook(s) after early return (L${firstEarlyReturn + 1}): lines ${hooksAfter.map(n => n+1).join(", ")}`);
}
if (errors === 0) ok("No hooks-after-early-return violations found");

// ─────────────────────────────────────────────────────────────────────────────
// 2. BRIDGE_CONTENT required fields
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 2. BRIDGE_CONTENT required fields ─────────────────────────");

const BRIDGE_REQUIRED = ["destination", "arrivalScene", "paluLines", "storyTitle",
                          "story", "storyCitation", "bagItems", "bagNote", "bridgeLine"];

const bridgeMatch = DATA.match(/export const BRIDGE_CONTENT = \{([\s\S]*?)^};/m);
if (!bridgeMatch) {
  err("Could not find BRIDGE_CONTENT in data.jsx");
} else {
  const block = bridgeMatch[1];
  const entries = [...block.matchAll(/^\s+(\d+): \{/gm)].map(m => m[1]);
  entries.forEach(num => {
    const entryMatch = block.match(new RegExp(`\\s+${num}: \\{([\\s\\S]*?)(?=\\n\\s+\\d+: \\{|$)`));
    BRIDGE_REQUIRED.forEach(field => {
      if (entryMatch && !new RegExp(`\\b${field}:`).test(entryMatch[1])) {
        err(`BRIDGE_CONTENT[${num}] missing required field: "${field}"`);
      }
    });
  });
  ok(`BRIDGE_CONTENT entries checked: ${entries.join(", ")}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MODULE_CONTENT required fields
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 3. MODULE_CONTENT required fields ─────────────────────────");

const MODULE_REQUIRED = ["accent", "destination", "departure", "intro", "learn"];

const moduleMatch = DATA.match(/export const MODULE_CONTENT = \{([\s\S]*?)^};/m);
if (!moduleMatch) {
  err("Could not find MODULE_CONTENT in data.jsx");
} else {
  const block = moduleMatch[1];
  const entries = [...block.matchAll(/^\s+(\d+): \{/gm)].map(m => m[1]);
  entries.forEach(num => {
    const entryMatch = block.match(new RegExp(`\\s+${num}: \\{([\\s\\S]*?)(?=\\n\\s+\\d+: \\{|$)`));
    MODULE_REQUIRED.forEach(field => {
      if (entryMatch && !new RegExp(`\\b${field}:`).test(entryMatch[1])) {
        err(`MODULE_CONTENT[${num}] missing required field: "${field}"`);
      }
    });
  });
  ok(`MODULE_CONTENT entries checked: ${entries.join(", ")}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BridgeScreen moduleNum references must exist in BRIDGE_CONTENT
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 4. BridgeScreen moduleNum references ──────────────────────");

const validKeys = bridgeMatch
  ? [...bridgeMatch[1].matchAll(/^\s+(\d+): \{/gm)].map(m => m[1])
  : [];

const bridgeCalls = [...APP.matchAll(/<BridgeScreen moduleNum=\{(\d+)\}/g)];
bridgeCalls.forEach(m => {
  const num = m[1];
  if (!validKeys.includes(num)) {
    err(`BridgeScreen called with moduleNum={${num}} but BRIDGE_CONTENT[${num}] does not exist`);
  } else {
    ok(`BridgeScreen moduleNum={${num}} — key exists`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. BAG_ITEMS id references
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 5. BAG_ITEMS id references ────────────────────────────────");

const bagIdMatch = DATA.match(/export const BAG_ITEMS = \[([\s\S]*?)\];/);
const validBagIds = bagIdMatch
  ? [...bagIdMatch[1].matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1])
  : [];

let bagErrors = 0;
const bagItemRefs = [...DATA.matchAll(/bagItems:\s*\[([^\]]+)\]/g)];
bagItemRefs.forEach(m => {
  const ids = [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]);
  ids.forEach(id => {
    if (!validBagIds.includes(id)) {
      err(`bagItems references unknown id: "${id}" (not in BAG_ITEMS)`);
      bagErrors++;
    }
  });
});
if (bagErrors === 0) ok(`BAG_ITEMS ids all valid: ${validBagIds.join(", ")}`);

// ─────────────────────────────────────────────────────────────────────────────
// 6. Unsafe .toUpperCase() on object properties
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 6. Unsafe .toUpperCase() calls ────────────────────────────");

const upperLines = lines
  .map((l, i) => ({ l, i }))
  .filter(({ l }) => /\.toUpperCase\(\)/.test(l));

const risky = upperLines.filter(({ l }) =>
  (/\bb\./.test(l) || /destination\.toUpperCase/.test(l)) &&
  !/\|\| .{0,6}\)\.toUpperCase/.test(l)
);

if (risky.length > 0) {
  risky.forEach(({ l, i }) => warn(`L${i+1}: unguarded .toUpperCase() on object property — ${l.trim().slice(0, 80)}`));
} else {
  ok("No unguarded .toUpperCase() calls on object properties found");
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. JSX parse via esbuild
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 7. JSX parse check ────────────────────────────────────────");

const { execSync } = require("child_process");
const ESBUILD = "./node_modules/.bin/esbuild";

["./src/App.jsx", "./src/data.jsx"].forEach(fpath => {
  const fname = path.basename(fpath);
  try {
    const result = execSync(`"${ESBUILD}" --bundle=false --loader=jsx < "${fpath}" 2>&1 || true`, { encoding: "utf8" });
    if (result.includes("ERROR")) {
      const firstErr = result.split("\n").find(l => l.includes("ERROR")) || "";
      err(`${fname} parse error: ${firstErr.trim()}`);
    } else {
      ok(`${fname} parses clean`);
    }
  } catch (e) {
    err(`${fname} parse check failed: ${e.message.slice(0, 120)}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════════════");
if (errors === 0 && warnings === 0) {
  console.log("  ✓ All checks passed — safe to commit.");
} else {
  console.log(`  ${errors} error(s), ${warnings} warning(s).`);
  if (errors > 0) {
    console.log("  Fix errors before committing.");
    process.exit(1);
  }
}
console.log("══════════════════════════════════════════════════════════════\n");
