/**
 * build.js — Claims Resilience Tool bundler
 *
 * Produces dist/index.html: a single self-contained file that works when
 * opened directly via file:// (no HTTP server needed).
 *
 * What it does:
 *   1. Reads index.html
 *   2. Reads every JSON config file
 *   3. Replaces the async loadAllConfig() function with a synchronous version
 *      that assigns the JSON data directly — no fetch() calls in the output.
 *   4. Writes the result to dist/index.html.
 *
 * The source index.html loadAllConfig() has two branches: an inline-detection
 * branch (typeof CONFIG_DEFAULTS !== 'undefined') and a fetch branch.
 * This build script replaces the *entire* function so neither branch is needed.
 *
 * Note on ES modules: the application currently uses a single inline <script>
 * with no import/export statements, so no module resolution is required.
 * If src/ modules are added in future, extend the "Inline JS modules" section.
 *
 * Usage:
 *   node build.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// ── Config file → global variable assignment in loadAllConfig() ─────────────
const CONFIG_MAP = [
  { file: 'config/defaults.json',              global: 'DEFAULT_CONFIG'              },
  { file: 'config/claim-categories.json',      global: 'CLAIM_CATEGORIES'            },
  { file: 'config/legal-framework.json',       global: 'UK_LEGAL_FRAMEWORK'          },
  { file: 'config/historical-data.json',       global: 'HISTORICAL_CLAIM_VOLUMES'    },
  { file: 'config/distribution-templates.json', global: 'CLAIM_DISTRIBUTION_TEMPLATES'},
  { file: 'config/time-horizons.json',         global: 'SEVERITY_TIME_HORIZONS'      },
  { file: 'config/claim-patterns.json',        global: 'CLAIM_PATTERNS'              },
  { file: 'config/claim-values.json',          global: 'AVERAGE_CLAIM_VALUES'        },
  { file: 'config/mc-defaults.json',           global: 'MC_DEFAULT_CONFIG'           },
  { file: 'config/historical-validation.json', global: 'HISTORICAL_VALIDATION'       },
];

// ── 1. Read source HTML ──────────────────────────────────────────────────────
const srcPath = path.join(ROOT, 'index.html');
if (!fs.existsSync(srcPath)) {
  console.error('ERROR: index.html not found at', srcPath);
  process.exit(1);
}
let html = fs.readFileSync(srcPath, 'utf8');

// ── 2. Read and validate all config JSON files ──────────────────────────────
const configs = CONFIG_MAP.map(({ file, global: globalName }) => {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: config file not found: ${file}`);
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`ERROR: failed to parse ${file}:`, e.message);
    process.exit(1);
  }
  return { file, globalName, json: JSON.stringify(data, null, 2) };
});

// ── 3. Build replacement loadAllConfig() ────────────────────────────────────
// Generate a synchronous function that directly assigns the parsed JSON
// objects to the module-level variables, completely replacing the fetch logic.
const assignments = configs.map(({ globalName, json }) =>
  `  ${globalName} = ${json};`
).join('\n');

const replacementFn =
  `async function loadAllConfig() {\n` +
  `  // ── Inlined by build.js — config data embedded, no fetch needed ──\n` +
  assignments + '\n' +
  `}`;

// ── 4. Replace the original loadAllConfig() in the HTML ─────────────────────
// Match the entire function body.  The function starts with
//   "async function loadAllConfig() {"
// and ends at the matching closing brace.  We locate it by finding the
// start marker, then counting braces to find the end.
const FUNC_START = 'async function loadAllConfig() {';
const funcStartIdx = html.indexOf(FUNC_START);
if (funcStartIdx === -1) {
  console.error('ERROR: could not find loadAllConfig() in index.html');
  process.exit(1);
}

// Walk forward from the opening brace counting { } to find the matching close.
let braceDepth = 0;
let funcEndIdx = -1;
for (let i = funcStartIdx + FUNC_START.length - 1; i < html.length; i++) {
  if (html[i] === '{') braceDepth++;
  else if (html[i] === '}') {
    braceDepth--;
    if (braceDepth === 0) {
      funcEndIdx = i + 1;  // include the closing brace
      break;
    }
  }
}
if (funcEndIdx === -1) {
  console.error('ERROR: could not find closing brace for loadAllConfig()');
  process.exit(1);
}

html = html.slice(0, funcStartIdx) + replacementFn + html.slice(funcEndIdx);

// ── 5. Inline JS modules (future use) ───────────────────────────────────────
// The application currently uses a single inline <script> with no ES module
// imports. When src/ modules are introduced, resolve and concatenate them here.

// ── 6. Write output ─────────────────────────────────────────────────────────
const OUT_FILENAME = 'Claims Resilience Tool.html';

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}
const outPath = path.join(DIST, OUT_FILENAME);
fs.writeFileSync(outPath, html, 'utf8');

const sizeKB = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
console.log(`Built dist/${OUT_FILENAME}  (${sizeKB} KB)`);
console.log(`Inlined ${configs.length} config files.`);
console.log();
console.log(`Send "dist/${OUT_FILENAME}" to the client — they double-click to open.`);
