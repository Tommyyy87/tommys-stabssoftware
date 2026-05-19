# Kraefte-Druck und Personalstaerke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Kraefteuebersicht druckt Personen je Einsatzabschnitt und als Gesamtsumme sauber aus, waehrend die Personalstaerke im Editor ueber getrennte F/U/M-Felder intuitiv erfasst wird.

**Architecture:** Die Kernlogik fuer Personalstaerke und Drucksummen wird in eine kleine, plain-JS-Hilfsdatei ausgelagert, damit sie sowohl im Browser als auch in Node-Tests genutzt werden kann. Editor und Druckansicht greifen nur noch auf diese Hilfsfunktionen zu und behalten das bestehende `staerke`-Stringformat fuer Kompatibilitaet.

**Tech Stack:** Plain JavaScript, React via Babel UMD im Browser, Node `assert` fuer Tests, Firebase Hosting fuer Deployment.

---

### Task 1: Testbare Hilfslogik fuer Personalstaerke und Drucksummen

**Files:**
- Create: `kraefte-logic.js`
- Create: `tests/kraefte-logic.test.js`
- Modify: `index.html`

- [ ] **Step 1: Write the failing test**

```js
const assert = require('assert');
const {
  parseStaerkeParts,
  formatStaerkeFromParts,
  staerkeGesamt,
  summarizeKraefte,
} = require('../kraefte-logic.js');

assert.deepEqual(parseStaerkeParts('1/3/18'), { f: 1, u: 3, m: 18 });
assert.equal(formatStaerkeFromParts({ f: 1, u: 3, m: 18 }), '1/3/18');
assert.equal(staerkeGesamt('1/3/18'), 22);
assert.equal(summarizeKraefte(sample).gesamtPersonal, 24);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/kraefte-logic.test.js`
Expected: FAIL because `../kraefte-logic.js` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
function parseStaerkeParts(value) { /* normalize to { f, u, m } */ }
function formatStaerkeFromParts(parts) { /* return "F/U/M" */ }
function staerkeGesamt(value) { /* sum parsed values */ }
function summarizeKraefte(data) { /* section, pool, total counts */ }

module.exports = { parseStaerkeParts, formatStaerkeFromParts, staerkeGesamt, summarizeKraefte };
window.parseStaerkeParts = parseStaerkeParts;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/kraefte-logic.test.js`
Expected: PASS with a confirmation line from the test file.

- [ ] **Step 5: Load helper in the browser**

```html
<script src="kraefte-logic.js"></script>
<script type="text/babel" src="tactical-symbols.jsx"></script>
```

### Task 2: Editor auf F/U/M-Eingabe umstellen

**Files:**
- Modify: `krafte.jsx`

- [ ] **Step 1: Write the failing test for helper behavior**

```js
assert.deepEqual(parseStaerkeParts('1//5'), { f: 1, u: 0, m: 5 });
assert.equal(formatStaerkeFromParts({ f: '', u: 2, m: '' }), '0/2/0');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/kraefte-logic.test.js`
Expected: FAIL until empty and malformed values are normalized correctly.

- [ ] **Step 3: Write minimal implementation and component wiring**

```jsx
const strengthParts = parseStaerkeParts(k.staerke);
<input type="number" value={strengthParts.f} />
<input type="number" value={strengthParts.u} />
<input type="number" value={strengthParts.m} />
set({ staerke: formatStaerkeFromParts(nextParts) });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/kraefte-logic.test.js`
Expected: PASS with malformed input coverage green.

### Task 3: Druckansicht und Summenblock

**Files:**
- Modify: `print-views.jsx`
- Modify: `print.css`

- [ ] **Step 1: Write the failing test for summary data**

```js
const summary = summarizeKraefte(sample);
assert.equal(summary.abschnittCount, 2);
assert.equal(summary.zugeordneteKraefte, 2);
assert.equal(summary.zugeordnetesPersonal, 22);
assert.equal(summary.poolKraefte, 1);
assert.equal(summary.poolPersonal, 2);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/kraefte-logic.test.js`
Expected: FAIL until `summarizeKraefte` returns section and pool totals.

- [ ] **Step 3: Write minimal implementation and print rendering**

```jsx
const summary = summarizeKraefte(data);
<span>{section.kraefteCount} Kraefte</span>
<span>{section.personalCount} Pers.</span>
<section className="print-summary">...</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/kraefte-logic.test.js`
Expected: PASS with summary assertions green.

- [ ] **Step 5: Style the summary block for print**

```css
.print-area .print-summary { display: grid; grid-template-columns: repeat(2, 1fr); }
.print-area .print-summary-card strong { font-size: 12pt; }
```

### Task 4: Vollstaendige Verifikation und Deployment

**Files:**
- Modify: `tests/kraefte-logic.test.js`
- Modify: `tests/cloud-bootstrap.test.js` (only if needed for compatibility)

- [ ] **Step 1: Run the full local verification**

Run: `node tests/cloud-bootstrap.test.js`
Expected: PASS with `cloud bootstrap tests passed`

Run: `node tests/kraefte-logic.test.js`
Expected: PASS with `kraefte logic tests passed`

- [ ] **Step 2: Check the changed files**

Run: `git status --short`
Expected: Only intended source, test, and plan/spec files are modified or added.

- [ ] **Step 3: Deploy to Firebase Hosting**

Run: `firebase deploy --only hosting`
Expected: Successful hosting deploy with the target site URL in output.

- [ ] **Step 4: Commit implementation**

```bash
git add index.html kraefte-logic.js krafte.jsx print-views.jsx print.css tests/kraefte-logic.test.js docs/superpowers/plans/2026-05-19-kraefte-druck-und-personalstaerke.md
git commit -m "Improve kraefte printout and strength input"
```
