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
// 8. Long SVG text elements
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 8. Long SVG text elements ─────────────────────────────────");

// SVG <text> doesn't wrap — anything over ~30 chars will truncate or overflow.
// These should be foreignObject or moved to HTML overlays.
const svgTextMatches = [...APP.matchAll(/<text\b[^>]*>([^<]{31,})<\/text>/g)];
const longSvgTexts = svgTextMatches.filter(m => {
  const content = m[1].trim();
  // Allow template expressions and short dynamic values
  return !content.startsWith("{") && content.length > 30;
});
if (longSvgTexts.length > 0) {
  longSvgTexts.forEach(m => {
    const preview = m[1].trim().slice(0, 60);
    warn(`SVG <text> longer than 30 chars (will truncate): "${preview}..."`);
  });
} else {
  ok("No overlong SVG text elements found");
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Arrival screens missing SPEAKER pattern
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 9. Arrival screen SPEAKER pattern ─────────────────────────");

// Every *ArrivalScreen component should define a SPEAKER map to enforce
// one-speaker-at-a-time. Warn if a new arrival screen is missing it.
const arrivalScreens = [...APP.matchAll(/function (\w*ArrivalScreen)\b/g)].map(m => m[1]);
arrivalScreens.forEach(name => {
  const fnStart = APP.indexOf(`function ${name}`);
  const fnEnd   = APP.indexOf("\nfunction ", fnStart + 100);
  const block   = APP.slice(fnStart, fnEnd > 0 ? fnEnd : fnStart + 8000);
  if (!block.includes("SPEAKER")) {
    warn(`${name} has no SPEAKER constant — multiple speakers may show at once`);
  } else {
    ok(`${name} has SPEAKER pattern`);
  }
});
if (arrivalScreens.length === 0) ok("No ArrivalScreen components found to check");

// ─────────────────────────────────────────────────────────────────────────────
// 10. Overlapping z-index in arrival screens
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 10. Z-index layering in arrival screens ────────────────────");

// Overlays in arrival screens must follow the z-index contract:
// bottom bar=10, dialogue=20, story=30, farewell=40
// Warn on any position:absolute inside an ArrivalScreen that has no zIndex.
const absPositions = [...APP.matchAll(/position:\s*["']absolute["'][^}]{0,300}/g)];
let missingZ = 0;
absPositions.forEach(m => {
  const snippet = m[0];
  // Only flag if it looks like a panel overlay (has bottom:0 or inset:0)
  const isOverlay = (
    /bottom:\s*["']?0|inset:\s*["']?0/.test(snippet) &&
    !/pointerEvents:\s*["']none["']/.test(snippet) &&
    (
      /cursor:\s*["']pointer["']/.test(snippet) ||
      /background:\s*"rgba\([^)]+\.(9[5-9]|[1-9][0-9][0-9])\)/.test(snippet) ||
      /backdropFilter/.test(snippet)
    )
  );
  const hasZ      = /zIndex/.test(snippet);
  if (isOverlay && !hasZ) {
    missingZ++;
    const preview = snippet.slice(0, 80).replace(/\n/g, " ");
    warn(`position:absolute overlay missing zIndex — ${preview}...`);
  }
});
if (missingZ === 0) ok("All absolute overlays have zIndex set");

// ─────────────────────────────────────────────────────────────────────────────
// 11. Arrival screen FijiBirdMateScreen pattern check
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── 11. Arrival screen structural checks ───────────────────────");

// Every ArrivalScreen should have: a phase state, a RETURN TO THE OCEAN button,
// and all phases should transition via setPhase (not setTimeout to onReturn).
const requiredPatterns = [
  { pattern: /useState\(["']palu["']\)/,      label: 'initial phase state ("palu")' },
  { pattern: /RETURN TO THE OCEAN/,            label: '"RETURN TO THE OCEAN" button' },
  { pattern: /setPhase/,                       label: "setPhase transitions" },
  { pattern: /position:\s*["']absolute["']/,   label: "absolute overlay positioning" },
];

arrivalScreens.forEach(name => {
  const fnStart = APP.indexOf(`function ${name}`);
  const fnEnd   = APP.indexOf("\nfunction ", fnStart + 100);
  const block   = APP.slice(fnStart, fnEnd > 0 ? fnEnd : fnStart + 12000);
  requiredPatterns.forEach(({ pattern, label }) => {
    if (!pattern.test(block)) {
      warn(`${name} missing ${label}`);
    }
  });
  ok(`${name} checked`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary — checks: hooks, BRIDGE_CONTENT, MODULE_CONTENT, BridgeScreen refs,
//   BAG_ITEMS ids, toUpperCase safety, JSX parse, SVG text length,
//   SPEAKER pattern, z-index layering, arrival screen structure
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
