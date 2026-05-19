const assert = require("assert");
const {
  parseStaerkeParts,
  formatStaerkeFromParts,
  staerkeGesamt,
  summarizeKraefte,
  stripDraftFlags,
} = require("../kraefte-logic.js");

const sample = {
  kraefte: {
    a: { id: "a", ea: "ea1", staerke: "1/2/6" },
    b: { id: "b", ea: "ea2", staerke: "1/0/5" },
    c: { id: "c", ea: null, staerke: "0/0/2" },
  },
  einsatzabschnitte: {
    ea1: { id: "ea1", name: "Abschnitt 1", ordnung: 0 },
    ea2: { id: "ea2", name: "Abschnitt 2", ordnung: 1 },
  },
};

assert.deepEqual(parseStaerkeParts("1/3/18"), { f: 1, u: 3, m: 18 });
assert.deepEqual(parseStaerkeParts("1//5"), { f: 1, u: 0, m: 5 });
assert.deepEqual(parseStaerkeParts("x/y/z"), { f: 0, u: 0, m: 0 });

assert.equal(formatStaerkeFromParts({ f: 1, u: 3, m: 18 }), "1/3/18");
assert.equal(formatStaerkeFromParts({ f: "", u: 2, m: "" }), "0/2/0");

assert.equal(staerkeGesamt("1/3/18"), 22);
assert.equal(staerkeGesamt(""), 0);

assert.deepEqual(
  stripDraftFlags({ id: "n1", name: "LF 20", isNew: true, ea: null }),
  { id: "n1", name: "LF 20", ea: null },
);

const summary = summarizeKraefte(sample);
assert.equal(summary.abschnittCount, 2);
assert.equal(summary.gesamtKraefte, 3);
assert.equal(summary.gesamtPersonal, 17);
assert.equal(summary.zugeordneteKraefte, 2);
assert.equal(summary.zugeordnetesPersonal, 15);
assert.equal(summary.poolKraefte, 1);
assert.equal(summary.poolPersonal, 2);
assert.equal(summary.abschnitte[0].kraefteCount, 1);
assert.equal(summary.abschnitte[0].personalCount, 9);
assert.equal(summary.abschnitte[1].kraefteCount, 1);
assert.equal(summary.abschnitte[1].personalCount, 6);

console.log("kraefte logic tests passed");
