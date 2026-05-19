const assert = require("assert");
const fs = require("fs");
const path = require("path");

const tagebuchSource = fs.readFileSync(
  path.join(__dirname, "..", "tagebuch.jsx"),
  "utf8",
);
const printViews = fs.readFileSync(
  path.join(__dirname, "..", "print-views.jsx"),
  "utf8",
);
const stylesSource = fs.readFileSync(
  path.join(__dirname, "..", "styles.css"),
  "utf8",
);

assert.match(
  tagebuchSource,
  /function\s+TagebuchEntryModal\s*\(/,
  "tagebuch should use a dedicated modal workflow for new entries and additions",
);

assert.match(
  tagebuchSource,
  /locked:\s*true/,
  "new diary entries should be created in a locked, immutable state",
);

assert.match(
  tagebuchSource,
  /additions:\s*\[\]/,
  "new diary entries should initialize an additions collection",
);

assert.match(
  tagebuchSource,
  /tb-addition-label/,
  "entry rendering should show additions as a subordinate note below the original entry",
);

assert.match(
  printViews,
  /Erg(ae|ä)nzung:/,
  "print view should label additions explicitly",
);

assert.match(
  stylesSource,
  /\.tb-additions\s*\{/,
  "styles should include a dedicated additions block for diary entries",
);

console.log("tagebuch workflow tests passed");
