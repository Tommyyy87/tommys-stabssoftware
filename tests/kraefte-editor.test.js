const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "krafte.jsx"),
  "utf8",
);
const styles = fs.readFileSync(
  path.join(__dirname, "..", "styles.css"),
  "utf8",
);

assert.match(
  source,
  /const closeEditor = \(\) => \{[\s\S]*if \(!current\?\.isNew\) return;[\s\S]*delete next\[editing\]/,
  "canceling a newly created kraft must remove the draft from the pool",
);

assert.match(
  source,
  /\[k\.id\]: k/,
  "new custom kraft should remain a draft until the editor is confirmed",
);

assert.match(
  styles,
  /\.kraft-staerke-grid\s*\{[\s\S]*minmax\(72px,\s*1fr\)/,
  "strength editor grid should reserve enough width for three-digit values",
);

console.log("kraefte editor tests passed");
