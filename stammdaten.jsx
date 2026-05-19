// stammdaten.jsx — Reiter "Stammdaten" / Einsatz-Kopf + Funktionsbesetzung

const FUEHRUNGSSTUFEN = [
  ['A', 'A — Führen ohne Führungseinheit'],
  ['B', 'B — Führen mit örtl. Führungseinheit'],
  ['C', 'C — Führen mit Führungsgruppe (TEL)'],
  ['D', 'D — Führen mit Führungsstab'],
];

const FUNKTIONEN = [
  // Stab-Funktionen nach FwDV 100
  { key: 'einsatzleiter',     label: 'Einsatzleiter',           group: 'Leitung' },
  { key: 'leiter_stab',       label: 'Leiter Stab',             group: 'Leitung' },
  { key: 'S1',                label: 'S1 — Personal',           group: 'Sachgebiete' },
  { key: 'S2',                label: 'S2 — Lage',               group: 'Sachgebiete' },
  { key: 'S3',                label: 'S3 — Einsatz',            group: 'Sachgebiete' },
  { key: 'S4',                label: 'S4 — Versorgung',         group: 'Sachgebiete' },
  { key: 'S5',                label: 'S5 — Presse/Medien',      group: 'Sachgebiete' },
  { key: 'S6',                label: 'S6 — IuK',                group: 'Sachgebiete' },
  { key: 'tagebuch',          label: 'Einsatztagebuch',         group: 'Stabspersonal' },
  { key: 'lagekarte',         label: 'Lagekartenführer',        group: 'Stabspersonal' },
  { key: 'zustand',           label: 'Zustandsanzeigeführer',   group: 'Stabspersonal' },
  { key: 'sichter',           label: 'Sichter',                 group: 'Stabspersonal' },
  { key: 'bote_1',            label: 'Bote 1',                  group: 'Stabspersonal' },
  { key: 'bote_2',            label: 'Bote 2',                  group: 'Stabspersonal' },
  { key: 'vb_1',              label: 'Verbindungsperson 1',     group: 'Verbindungen' },
  { key: 'vb_2',              label: 'Verbindungsperson 2',     group: 'Verbindungen' },
  { key: 'vb_3',              label: 'Verbindungsperson 3',     group: 'Verbindungen' },
  { key: 'vb_4',              label: 'Verbindungsperson 4',     group: 'Verbindungen' },
  { key: 'fb_1',              label: 'Fachberater 1',           group: 'Fachberater' },
  { key: 'fb_2',              label: 'Fachberater 2',           group: 'Fachberater' },
  { key: 'fb_3',              label: 'Fachberater 3',           group: 'Fachberater' },
  { key: 'fb_4',              label: 'Fachberater 4',           group: 'Fachberater' },
  { key: 'lna',               label: 'LNA',                     group: 'Rettungsdienst' },
  { key: 'orgl',              label: 'OrgL RD',                 group: 'Rettungsdienst' },
];

function StammdatenTab({ data, setData }) {
  const e = data.einsatz || {};
  const setEinsatz = (patch) => setData(d => ({ ...d, einsatz: { ...(d.einsatz||{}), ...patch } }));

  const funk = data.funktionen || {};
  const setFunk = (key, field, value) => {
    setData(d => ({
      ...d,
      funktionen: {
        ...(d.funktionen || {}),
        [key]: { ...((d.funktionen||{})[key] || {}), [field]: value },
      },
    }));
  };

  const groups = useMemo(() => {
    const g = {};
    FUNKTIONEN.forEach(f => { (g[f.group] = g[f.group] || []).push(f); });
    return g;
  }, []);

  return (
    <div className="page">
      <div className="page-narrow stamm">
        <div className="card">
          <div className="card-head">Einsatz-Stammdaten</div>
          <div className="card-body">
            <div className="grid-3">
              <div>
                <label className="label">Einsatznummer</label>
                <input className="input mono" value={e.nummer || ''} onChange={ev => setEinsatz({ nummer: ev.target.value })} placeholder="2025-0001" />
              </div>
              <div>
                <label className="label">Einsatzstichwort</label>
                <input className="input" value={e.stichwort || ''} onChange={ev => setEinsatz({ stichwort: ev.target.value })} placeholder="z. B. Brand 4 / MANV 25" />
              </div>
              <div>
                <label className="label">Führungsstufe</label>
                <select className="select" value={e.fuehrungsstufe || 'C'} onChange={ev => setEinsatz({ fuehrungsstufe: ev.target.value })}>
                  {FUEHRUNGSSTUFEN.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className="grid-2">
              <div>
                <label className="label">Einsatzort / Adresse</label>
                <input className="input" value={e.ort || ''} onChange={ev => setEinsatz({ ort: ev.target.value })} placeholder="Straße, Hausnummer, Ort" />
              </div>
              <div>
                <label className="label">Befehlsstelle / Standort EL</label>
                <input className="input" value={e.befehlsstelle || ''} onChange={ev => setEinsatz({ befehlsstelle: ev.target.value })} placeholder="z. B. FW-Wache 1" />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className="grid-3">
              <div>
                <label className="label">Einsatz übernommen</label>
                <input
                  className="input mono"
                  type="datetime-local"
                  value={toLocalInputValue(e.uebernommen)}
                  onChange={ev => setEinsatz({ uebernommen: fromLocalInputValue(ev.target.value) })}
                />
              </div>
              <div>
                <label className="label">Anordnung durch</label>
                <input className="input" value={e.anordnung || ''} onChange={ev => setEinsatz({ anordnung: ev.target.value })} placeholder="Name, Dienststelle" />
              </div>
              <div>
                <label className="label">Zuständige Leitstelle</label>
                <input className="input" value={e.leitstelle || ''} onChange={ev => setEinsatz({ leitstelle: ev.target.value })} placeholder="z. B. KLST Musterstadt" />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div>
              <label className="label">Lage / Auftrag (Kurzbeschreibung)</label>
              <textarea className="textarea" value={e.lage || ''} onChange={ev => setEinsatz({ lage: ev.target.value })} placeholder="Stichwortartige Lagebeschreibung beim Einsatzbeginn …" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            Funktionsbesetzung
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              Stab-Funktionen nach FwDV 100
            </span>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {Object.entries(groups).map(([groupName, list]) => (
              <div key={groupName} style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, marginLeft: 4 }}>
                  {groupName}
                </div>
                <table className="funktionen-table">
                  <thead>
                    <tr>
                      <th>Funktion</th>
                      <th>Name, Vorname</th>
                      <th>Dienstgrad</th>
                      <th>Dienststelle / Organisation</th>
                      <th>Funkrufname</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(f => {
                      const v = funk[f.key] || {};
                      return (
                        <tr key={f.key}>
                          <td>{f.label}</td>
                          <td><input className="input" value={v.name || ''} onChange={ev => setFunk(f.key, 'name', ev.target.value)} /></td>
                          <td><input className="input" value={v.dienstgrad || ''} onChange={ev => setFunk(f.key, 'dienstgrad', ev.target.value)} /></td>
                          <td><input className="input" value={v.dienststelle || ''} onChange={ev => setFunk(f.key, 'dienststelle', ev.target.value)} /></td>
                          <td><input className="input mono" value={v.funkruf || ''} onChange={ev => setFunk(f.key, 'funkruf', ev.target.value)} placeholder="Florian 1-11-1" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
            <div className="aside-note" style={{ marginTop: 16 }}>
              Alle Eingaben werden automatisch gespeichert. Über <strong>Sicherungskopie</strong> in der Kopfzeile lässt sich der gesamte Einsatzstand zusätzlich als Datei exportieren und später wieder einlesen — empfohlen am Ende jeder Lagebesprechung.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StammdatenTab, FUNKTIONEN, FUEHRUNGSSTUFEN });
