// tagebuch.jsx — Reiter "Einsatztagebuch"
//
// Eintragsstruktur:
//   { id, nr, ts, typ, kanal, von, an, inhalt, anlage, locked, autor }
//   typ: EIN (Eingang) | AUS (Ausgang) | MASS (Maßnahme/Anordnung) | LAGE (Lagemeldung) | NOTIZ

const TYP_OPTIONS = [
  ['EIN',   'Eingang'],
  ['AUS',   'Ausgang'],
  ['MASS',  'Maßnahme'],
  ['LAGE',  'Lagemeldung'],
  ['NOTIZ', 'Notiz'],
];

function TagebuchTab({ data, setData, onPrint }) {
  const entries = data.tagebuch || [];
  const [search, setSearch] = useState('');
  const [filterTyp, setFilterTyp] = useState('alle');
  const [confirmNode, askConfirm] = useConfirm();
  const lastRowRef = useRef(null);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => (a.nr || 0) - (b.nr || 0));
  }, [entries]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterTyp !== 'alle') list = list.filter(e => e.typ === filterTyp);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        (e.inhalt || '').toLowerCase().includes(q)
        || (e.von || '').toLowerCase().includes(q)
        || (e.an || '').toLowerCase().includes(q)
        || (e.kanal || '').toLowerCase().includes(q)
        || (e.anlage || '').toLowerCase().includes(q)
        || String(e.nr || '').includes(q)
      );
    }
    return list;
  }, [sorted, filterTyp, search]);

  const nextNr = () => {
    if (entries.length === 0) return 1;
    return Math.max(...entries.map(e => Number(e.nr) || 0)) + 1;
  };

  const addEntry = (typ = 'NOTIZ') => {
    const ne = {
      id: uid(),
      nr: nextNr(),
      ts: nowISO(),
      typ,
      kanal: '',
      von: '',
      an: '',
      inhalt: '',
      anlage: '',
      locked: false,
    };
    setData(d => ({ ...d, tagebuch: [...(d.tagebuch || []), ne] }));
    // scroll to bottom
    setTimeout(() => {
      if (lastRowRef.current) lastRowRef.current.scrollIntoView({ block: 'nearest' });
      const tex = document.querySelector(`[data-entry-id="${ne.id}"] .first-edit`);
      if (tex) tex.focus();
    }, 50);
  };

  const updateEntry = (id, patch) => setData(d => ({
    ...d,
    tagebuch: (d.tagebuch || []).map(e => e.id === id ? { ...e, ...patch } : e),
  }));

  const removeEntry = (id) => {
    askConfirm({
      title: 'Eintrag löschen?',
      body: 'Im realen Einsatztagebuch sollten Einträge nicht gelöscht, sondern nur ergänzt/widerrufen werden. Trotzdem entfernen?',
      yesLabel: 'Löschen',
      onYes: () => setData(d => ({ ...d, tagebuch: (d.tagebuch || []).filter(e => e.id !== id) })),
    });
  };

  const toggleLock = (id) => setData(d => ({
    ...d,
    tagebuch: (d.tagebuch || []).map(e => e.id === id ? { ...e, locked: !e.locked } : e),
  }));

  return (
    <div className="tagebuch">
      {confirmNode}
      <div className="tagebuch-bar">
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn primary" onClick={() => addEntry('NOTIZ')}>
            <I.plus /> Neuer Eintrag
          </button>
          <button className="btn" onClick={() => addEntry('EIN')} title="Eingang (z. B. Funkspruch eingehend)">+ Eingang</button>
          <button className="btn" onClick={() => addEntry('AUS')} title="Ausgang (Anordnung/Funkspruch ausgehend)">+ Ausgang</button>
          <button className="btn" onClick={() => addEntry('MASS')}>+ Maßnahme</button>
          <button className="btn" onClick={() => addEntry('LAGE')}>+ Lage</button>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select className="select" style={{ width: 'auto', height: 30 }} value={filterTyp} onChange={(e) => setFilterTyp(e.target.value)}>
            <option value="alle">Alle Typen</option>
            {TYP_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input
            className="input"
            style={{ width: 240 }}
            placeholder="Suchen in Inhalt, Von, An …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn" onClick={onPrint} title="Einsatztagebuch drucken / als PDF speichern">
            <I.printer /> Drucken / PDF
          </button>
        </div>
      </div>

      <div className="entries">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Noch keine Einträge</h3>
            <p>Beginne das Einsatztagebuch mit einem ersten Eintrag — die laufende Nummer wird automatisch vergeben.</p>
            <div style={{ height: 12 }} />
            <button className="btn primary" onClick={() => addEntry('LAGE')}>
              <I.plus /> Ersten Eintrag anlegen
            </button>
          </div>
        ) : (
          <table className="entries-table">
            <thead>
              <tr>
                <th className="col-nr" style={{ textAlign: 'right' }}>lfd.</th>
                <th className="col-time">Datum / Uhrzeit</th>
                <th className="col-typ">Typ</th>
                <th className="col-kanal">Kanal / Quelle</th>
                <th className="col-von">Von</th>
                <th className="col-an">An</th>
                <th>Inhalt — Ereignis, Beurteilung, Entschluss, Maßnahme</th>
                <th className="col-anlage">Anlage / Verweis</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const isLast = i === filtered.length - 1;
                return (
                  <tr
                    key={e.id}
                    data-entry-id={e.id}
                    className={e.locked ? 'row-locked' : ''}
                    ref={isLast ? lastRowRef : null}
                  >
                    <td><span className="nr">{e.nr}</span></td>
                    <td>
                      <input
                        className="input mono"
                        type="datetime-local"
                        value={toLocalInputValue(e.ts)}
                        readOnly={e.locked}
                        onChange={(ev) => updateEntry(e.id, { ts: fromLocalInputValue(ev.target.value) })}
                      />
                    </td>
                    <td>
                      <select
                        className="select"
                        value={e.typ || 'NOTIZ'}
                        disabled={e.locked}
                        onChange={(ev) => updateEntry(e.id, { typ: ev.target.value })}
                        style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                      >
                        {TYP_OPTIONS.map(([v, l]) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        className="input mono"
                        value={e.kanal || ''}
                        readOnly={e.locked}
                        onChange={(ev) => updateEntry(e.id, { kanal: ev.target.value })}
                        placeholder="Funk / Tel / pers."
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={e.von || ''}
                        readOnly={e.locked}
                        onChange={(ev) => updateEntry(e.id, { von: ev.target.value })}
                        placeholder="z. B. Florian 1-44-1"
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={e.an || ''}
                        readOnly={e.locked}
                        onChange={(ev) => updateEntry(e.id, { an: ev.target.value })}
                        placeholder="z. B. EL"
                      />
                    </td>
                    <td>
                      <textarea
                        className="textarea first-edit"
                        value={e.inhalt || ''}
                        readOnly={e.locked}
                        onChange={(ev) => updateEntry(e.id, { inhalt: ev.target.value })}
                        placeholder="Wortlaut/Maßnahme/Entschluss…"
                        rows={1}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={e.anlage || ''}
                        readOnly={e.locked}
                        onChange={(ev) => updateEntry(e.id, { anlage: ev.target.value })}
                        placeholder="z. B. Lageskizze #3"
                      />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-x"
                          title={e.locked ? 'Entsperren' : 'Eintrag sperren (gegen Versehen)'}
                          onClick={() => toggleLock(e.id)}
                        >
                          {e.locked ? <I.lock /> : <I.unlock />}
                        </button>
                        <button
                          className="icon-x"
                          title="Eintrag entfernen"
                          onClick={() => removeEntry(e.id)}
                        >
                          <I.trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { TagebuchTab, TYP_OPTIONS });
