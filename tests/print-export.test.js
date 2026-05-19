const assert = require('assert');
const fs = require('fs');
const path = require('path');

const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.jsx'), 'utf8');
const printCss = fs.readFileSync(path.join(__dirname, '..', 'print.css'), 'utf8');
const printViews = fs.readFileSync(path.join(__dirname, '..', 'print-views.jsx'), 'utf8');

assert.doesNotMatch(
  printCss,
  /#root\s*>\s*\*\s*\{\s*display:\s*none\s*!important;/,
  'print CSS must not hide the entire app subtree at #root level'
);

assert.match(
  printCss,
  /body\s*>\s*\*\s*\{\s*display:\s*none\s*!important;/,
  'print CSS should still suppress non-root body content'
);

assert.match(
  printCss,
  /\.app\s*>\s*\*\s*\{\s*display:\s*none\s*!important;/,
  'print CSS should hide normal app content while leaving .print-area visible'
);

assert.match(
  printCss,
  /\.app\s*>\s*\.print-area\s*\{\s*display:\s*block\s*!important;/,
  'print CSS should explicitly re-enable the print area'
);

assert.doesNotMatch(
  appSource,
  /setTimeout\(\(\)\s*=>\s*setPrintMode\(null\),\s*100\)/,
  'print mode must not be cleared after an arbitrary 100ms timeout'
);

assert.match(
  appSource,
  /const\s+nextTitle\s*=\s*buildPrintTitle\(data,\s*mode\)/,
  'print flow should set a context-aware document title for PDF filenames'
);

assert.match(
  printViews,
  /print-watermark/,
  'print view should include a subtle logo watermark hook'
);

console.log('print export tests passed');
