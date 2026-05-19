const assert = require('assert');
const { planBootstrapSync } = require('../sync-logic.js');

const remoteState = {
  meta: { updatedAt: '2026-05-19T18:00:00.000Z' },
  einsatzabschnitte: { ea1: { id: 'ea1', name: 'Abschnitt 1' } },
};

const emptyLocalState = {
  meta: { updatedAt: '2026-05-19T17:00:00.000Z' },
  einsatzabschnitte: {},
};

const newerLocalState = {
  meta: { updatedAt: '2026-05-19T19:00:00.000Z' },
  einsatzabschnitte: { ea2: { id: 'ea2', name: 'Abschnitt 2' } },
};

const remotePreferred = planBootstrapSync(emptyLocalState, remoteState);
assert.equal(remotePreferred.preferredSource, 'remote');
assert.equal(remotePreferred.skipInitialPersist, true);
assert.deepEqual(remotePreferred.preferredState.einsatzabschnitte, remoteState.einsatzabschnitte);

const localPreferred = planBootstrapSync(newerLocalState, remoteState);
assert.equal(localPreferred.preferredSource, 'local');
assert.equal(localPreferred.skipInitialPersist, false);
assert.deepEqual(localPreferred.preferredState.einsatzabschnitte, newerLocalState.einsatzabschnitte);

const localOnly = planBootstrapSync(newerLocalState, null);
assert.equal(localOnly.preferredSource, 'local');
assert.equal(localOnly.skipInitialPersist, false);

console.log('cloud bootstrap tests passed');
