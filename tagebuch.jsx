// tagebuch.jsx — Reiter "Einsatztagebuch"
//
// Eintragsstruktur:
//   { id, nr, ts, typ, kanal, von, an, inhalt, anlage, locked, autor, additions }
//   additions: [{ id, ts, text, anlage }]
//   typ: EIN (Eingang) | AUS (Ausgang) | MASS (Maßnahme/Anordnung) | LAGE (Lagemeldung) | NOTIZ

const TYP_OPTIONS = [
  ["EIN", "Eingang"],
  ["AUS", "Ausgang"],
  ["MASS", "Maßnahme"],
  ["LAGE", "Lagemeldung"],
  ["NOTIZ", "Notiz"],
];

function createTagebuchEntry(values, nr) {
  return {
    id: uid(),
    nr,
    ts: values.ts || nowISO(),
    typ: values.typ || "NOTIZ",
    kanal: values.kanal || "",
    von: values.von || "",
    an: values.an || "",
    inhalt: values.inhalt || "",
    anlage: values.anlage || "",
    locked: true,
    additions: [],
  };
}

function normalizeTagebuchEntry(entry) {
  const src = entry && typeof entry === "object" ? entry : {};
  const additions = Array.isArray(src.additions) ? src.additions : [];
  return {
    id: src.id || uid(),
    nr: Number(src.nr) || 0,
    ts: src.ts || "",
    typ: src.typ || "NOTIZ",
    kanal: src.kanal || "",
    von: src.von || "",
    an: src.an || "",
    inhalt: src.inhalt || "",
    anlage: src.anlage || "",
    locked: src.locked !== false,
    additions: additions.map((item) => ({
      id: item?.id || uid(),
      ts: item?.ts || "",
      text: item?.text || "",
      anlage: item?.anlage || "",
    })),
  };
}

function createTagebuchAddition(values) {
  return {
    id: uid(),
    ts: values.ts || nowISO(),
    text: values.text || "",
    anlage: values.anlage || "",
  };
}

function tagebuchTs(iso) {
  const ms = Date.parse(iso || "");
  return Number.isFinite(ms) ? ms : 0;
}

function TagebuchEntryModal({
  open,
  mode,
  initialTyp = "NOTIZ",
  entry,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() => ({
    ts: nowISO(),
    typ: initialTyp,
    kanal: "",
    von: "",
    an: "",
    inhalt: "",
    anlage: "",
    text: "",
  }));

  useEffect(() => {
    if (!open) return;
    if (mode === "add") {
      setForm({
        ts: nowISO(),
        typ: initialTyp,
        kanal: "",
        von: "",
        an: "",
        inhalt: "",
        anlage: "",
        text: "",
      });
      return;
    }
    setForm({
      ts: nowISO(),
      typ: entry?.typ || initialTyp,
      kanal: "",
      von: "",
      an: "",
      inhalt: entry?.inhalt || "",
      anlage: "",
      text: "",
    });
  }, [open, mode, initialTyp, entry]);

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const isAddition = mode === "addition";
  const canSave = isAddition ? form.text.trim() : form.inhalt.trim();

  return (
    <Modal
      open={open}
      title={
        isAddition
          ? `Ergänzung zu Eintrag ${entry?.nr || "—"}`
          : "Neuen Eintrag anlegen"
      }
      width={760}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Abbrechen
          </button>
          <button
            className="btn primary"
            onClick={() => onSave(form)}
            disabled={!canSave}
          >
            {isAddition ? "Ergänzung speichern" : "Eintrag speichern"}
          </button>
        </>
      }
    >
      {isAddition ? (
        <>
          <div className="tb-modal-note">
            Der ursprüngliche Eintrag bleibt unverändert bestehen. Die Ergänzung
            wird mit eigener Uhrzeit direkt darunter dokumentiert.
          </div>
          <div className="tb-modal-grid tb-modal-grid-addition">
            <label className="tb-field">
              <span className="label">Zeitpunkt der Ergänzung</span>
              <input
                className="input mono"
                type="datetime-local"
                value={toLocalInputValue(form.ts)}
                onChange={(e) =>
                  patch("ts", fromLocalInputValue(e.target.value))
                }
              />
            </label>
            <label className="tb-field tb-field-span-2">
              <span className="label">Ergänzung</span>
              <textarea
                className="textarea"
                rows={5}
                value={form.text}
                onChange={(e) => patch("text", e.target.value)}
                placeholder="Ergänzung zum ursprünglichen Eintrag festhalten…"
                autoFocus
              />
            </label>
            <label className="tb-field tb-field-span-2">
              <span className="label">Anlage / Verweis</span>
              <input
                className="input"
                value={form.anlage}
                onChange={(e) => patch("anlage", e.target.value)}
                placeholder="z. B. Nachforderung, Foto, Rückmeldung"
              />
            </label>
          </div>
        </>
      ) : (
        <div className="tb-modal-grid">
          <label className="tb-field">
            <span className="label">Datum / Uhrzeit</span>
            <input
              className="input mono"
              type="datetime-local"
              value={toLocalInputValue(form.ts)}
              onChange={(e) => patch("ts", fromLocalInputValue(e.target.value))}
            />
          </label>
          <label className="tb-field">
            <span className="label">Typ</span>
            <select
              className="select"
              value={form.typ}
              onChange={(e) => patch("typ", e.target.value)}
            >
              {TYP_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="tb-field">
            <span className="label">Kanal / Quelle</span>
            <input
              className="input mono"
              value={form.kanal}
              onChange={(e) => patch("kanal", e.target.value)}
              placeholder="Funk / Tel / pers."
            />
          </label>
          <label className="tb-field">
            <span className="label">Von</span>
            <input
              className="input"
              value={form.von}
              onChange={(e) => patch("von", e.target.value)}
              placeholder="z. B. Florian 1-44-1"
            />
          </label>
          <label className="tb-field">
            <span className="label">An</span>
            <input
              className="input"
              value={form.an}
              onChange={(e) => patch("an", e.target.value)}
              placeholder="z. B. EL"
            />
          </label>
          <label className="tb-field tb-field-span-3">
            <span className="label">Inhalt</span>
            <textarea
              className="textarea"
              rows={6}
              value={form.inhalt}
              onChange={(e) => patch("inhalt", e.target.value)}
              placeholder="Wortlaut, Ereignis, Beurteilung, Entschluss oder Maßnahme…"
              autoFocus
            />
          </label>
          <label className="tb-field tb-field-span-3">
            <span className="label">Anlage / Verweis</span>
            <input
              className="input"
              value={form.anlage}
              onChange={(e) => patch("anlage", e.target.value)}
              placeholder="z. B. Lageskizze #3"
            />
          </label>
        </div>
      )}
    </Modal>
  );
}

function TagebuchTab({ data, setData, onPrint }) {
  const entries = data.tagebuch || [];
  const [search, setSearch] = useState("");
  const [filterTyp, setFilterTyp] = useState("alle");
  const [createModal, setCreateModal] = useState({ open: false, typ: "NOTIZ" });
  const [additionModal, setAdditionModal] = useState({
    open: false,
    entryId: null,
  });
  const lastRowRef = useRef(null);

  const sorted = useMemo(() => {
    return [...entries]
      .map(normalizeTagebuchEntry)
      .sort((a, b) => (a.nr || 0) - (b.nr || 0));
  }, [entries]);

  const filtered = useMemo(() => {
    let list = sorted;
    if (filterTyp !== "alle") list = list.filter((e) => e.typ === filterTyp);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        const additionMatch = (e.additions || []).some(
          (item) =>
            (item.text || "").toLowerCase().includes(q) ||
            (item.anlage || "").toLowerCase().includes(q) ||
            fmtDate(item.ts).toLowerCase().includes(q),
        );
        return (
          (e.inhalt || "").toLowerCase().includes(q) ||
          (e.von || "").toLowerCase().includes(q) ||
          (e.an || "").toLowerCase().includes(q) ||
          (e.kanal || "").toLowerCase().includes(q) ||
          (e.anlage || "").toLowerCase().includes(q) ||
          String(e.nr || "").includes(q) ||
          additionMatch
        );
      });
    }
    return list;
  }, [sorted, filterTyp, search]);

  const nextNr = () => {
    if (entries.length === 0) return 1;
    return Math.max(...entries.map((e) => Number(e?.nr) || 0)) + 1;
  };

  const activeAdditionEntry = useMemo(
    () => sorted.find((entry) => entry.id === additionModal.entryId) || null,
    [sorted, additionModal.entryId],
  );

  const openCreate = (typ = "NOTIZ") => setCreateModal({ open: true, typ });

  const saveEntry = (values) => {
    const nextEntry = createTagebuchEntry(values, nextNr());
    setData((d) => ({ ...d, tagebuch: [...(d.tagebuch || []), nextEntry] }));
    setCreateModal({ open: false, typ: "NOTIZ" });
    setTimeout(() => {
      if (lastRowRef.current)
        lastRowRef.current.scrollIntoView({ block: "nearest" });
    }, 50);
  };

  const saveAddition = (values) => {
    if (!additionModal.entryId) return;
    const nextAddition = createTagebuchAddition(values);
    setData((d) => ({
      ...d,
      tagebuch: (d.tagebuch || []).map((entry) => {
        if (entry.id !== additionModal.entryId) return entry;
        const normalized = normalizeTagebuchEntry(entry);
        return {
          ...normalized,
          additions: [...normalized.additions, nextAddition].sort(
            (a, b) => tagebuchTs(a.ts) - tagebuchTs(b.ts),
          ),
        };
      }),
    }));
    setAdditionModal({ open: false, entryId: null });
  };

  return (
    <div className="tagebuch">
      <div className="tagebuch-bar">
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn primary" onClick={() => openCreate("NOTIZ")}>
            <I.plus /> Neuer Eintrag
          </button>
          <button
            className="btn"
            onClick={() => openCreate("EIN")}
            title="Eingang (z. B. Funkspruch eingehend)"
          >
            + Eingang
          </button>
          <button
            className="btn"
            onClick={() => openCreate("AUS")}
            title="Ausgang (Anordnung/Funkspruch ausgehend)"
          >
            + Ausgang
          </button>
          <button className="btn" onClick={() => openCreate("MASS")}>
            + Maßnahme
          </button>
          <button className="btn" onClick={() => openCreate("LAGE")}>
            + Lage
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select
            className="select"
            style={{ width: "auto", height: 30 }}
            value={filterTyp}
            onChange={(e) => setFilterTyp(e.target.value)}
          >
            <option value="alle">Alle Typen</option>
            {TYP_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <input
            className="input"
            style={{ width: 240 }}
            placeholder="Suchen in Inhalt, Von, Ergänzungen …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn"
            onClick={onPrint}
            title="Einsatztagebuch drucken / als PDF speichern"
          >
            <I.printer /> Drucken / PDF
          </button>
        </div>
      </div>

      <div className="entries">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Noch keine Einträge</h3>
            <p>
              Beginne das Einsatztagebuch mit einem ersten Eintrag — die
              laufende Nummer wird automatisch vergeben und danach unveränderbar
              archiviert.
            </p>
            <div style={{ height: 12 }} />
            <button className="btn primary" onClick={() => openCreate("LAGE")}>
              <I.plus /> Ersten Eintrag anlegen
            </button>
          </div>
        ) : (
          <table className="entries-table">
            <thead>
              <tr>
                <th className="col-nr" style={{ textAlign: "right" }}>
                  lfd.
                </th>
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
                  <React.Fragment key={e.id}>
                    <tr
                      data-entry-id={e.id}
                      className="row-locked row-main"
                      ref={isLast ? lastRowRef : null}
                    >
                      <td>
                        <span className="nr">{e.nr}</span>
                      </td>
                      <td>
                        <div className="tb-cell mono">{fmtDate(e.ts)}</div>
                      </td>
                      <td>
                        <div className="tb-cell">
                          <span className={`typ-pill typ-${e.typ}`}>
                            {e.typ}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="tb-cell mono">{e.kanal || "—"}</div>
                      </td>
                      <td>
                        <div className="tb-cell">{e.von || "—"}</div>
                      </td>
                      <td>
                        <div className="tb-cell">{e.an || "—"}</div>
                      </td>
                      <td>
                        <div className="tb-cell tb-cell-content">
                          <div className="tb-entry-text">{e.inhalt || "—"}</div>
                        </div>
                      </td>
                      <td>
                        <div className="tb-cell">{e.anlage || "—"}</div>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-x icon-action"
                            title={`Ergänzung zu Eintrag ${e.nr} erfassen`}
                            onClick={() =>
                              setAdditionModal({ open: true, entryId: e.id })
                            }
                          >
                            <I.plus />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {e.additions.length > 0 && (
                      <tr className="row-additions">
                        <td colSpan={9}>
                          <div className="tb-additions">
                            <div className="tb-additions-head">
                              Ergänzungen zu Eintrag {e.nr}
                            </div>
                            {e.additions.map((item) => (
                              <div className="tb-addition-item" key={item.id}>
                                <div className="tb-addition-meta">
                                  <span className="tb-addition-badge">
                                    Ergänzung
                                  </span>
                                  <span className="mono">
                                    {fmtDate(item.ts)}
                                  </span>
                                  {item.anlage && (
                                    <span className="tb-addition-anlage">
                                      Anlage: {item.anlage}
                                    </span>
                                  )}
                                </div>
                                <div className="tb-addition-text">
                                  {item.text || "—"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <TagebuchEntryModal
        open={createModal.open}
        mode="add"
        initialTyp={createModal.typ}
        onClose={() => setCreateModal({ open: false, typ: "NOTIZ" })}
        onSave={saveEntry}
      />

      <TagebuchEntryModal
        open={additionModal.open}
        mode="addition"
        entry={activeAdditionEntry}
        onClose={() => setAdditionModal({ open: false, entryId: null })}
        onSave={saveAddition}
      />
    </div>
  );
}

Object.assign(window, {
  TagebuchTab,
  TYP_OPTIONS,
  createTagebuchEntry,
  normalizeTagebuchEntry,
  createTagebuchAddition,
});
