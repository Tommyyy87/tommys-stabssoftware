const assert = require('assert');
const fs = require('fs');
const path = require('path');

const appSource = fs.readFileSync(path.join(__dirname, '..', 'app.jsx'), 'utf8');
const stylesSource = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');

assert.match(
  appSource,
  /document\.body\.dataset\.theme\s*=\s*t\.theme/,
  'App should mirror the active theme onto document.body'
);

assert.match(
  appSource,
  /document\.documentElement\.dataset\.theme\s*=\s*t\.theme/,
  'App should mirror the active theme onto document.documentElement'
);

assert.match(
  stylesSource,
  /html,\s*body,\s*#root\s*\{[\s\S]*overflow-x:\s*hidden;/,
  'Outer shell should suppress horizontal page overflow'
);

assert.match(
  stylesSource,
  /\.app\s*\{[\s\S]*overflow:\s*hidden;/,
  'App shell should clip stray inner overflow instead of exposing body background'
);

console.log('layout shell tests passed');
