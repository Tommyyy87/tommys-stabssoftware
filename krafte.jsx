// krafte.jsx — Reiter "Kräfteübersicht" mit Pointer-basiertem Drag & Drop

// ===== Edit-Modal für einzelne Kraft ==========================================
function KraftEditor({ open, kraft, onClose, onSave, onDelete }) {
  const [k, setK] = useState(kraft || null);
  useEffect(() => { setK(kraft || null); }, [kraft, open]);
  if (!open || !k) return null;
  const set = (patch) => setK(prev => ({ ...prev, ...patch }));
  const staerkeParts = parseStaerkeParts(k.staerke);
  const updateStaerkePart = (part, value) => {
    const nextParts = {
      ...staerkeParts,
      [part]: value === '' ? 0 : Math.max(0, Number.parseInt(value, 10) || 0),
    };
    set({ staerke: formatStaerkeFromParts(nextParts) });
  };

  return (
    <Modal
      open
      title={k.isNew ? 'Neue Kraft anlegen' : 'Kraft bearbeiten'}
      onClose={onClose}
      width={560}
      footer={
        <>
          {!k.isNew && (
            <button className="btn danger" onClick={() => { onDelete(k.id); onClose(); }}>
              <I.trash /> Entfernen
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={onClose}>Abbrechen</button>
          <button className="btn primary" onClick={() => { onSave(k); onClose(); }}>
            <I.check /> Übernehmen
          </button>
        </>
      }
    >
      <div className="grid-2">
        <div>
          <label className="label">Funkrufname / Bezeichnung</label>
          <input className="input mono" autoFocus value={k.funkruf || ''} onChange={ev => set({ funkruf: ev.target.value })} placeholder="Florian Musterstadt 1-44-1" />
        </div>
        <div>
          <label className="label">Anzeigename (kurz)</label>
          <input className="input" value={k.name || ''} onChange={ev => set({ name: ev.target.value })} placeholder="LF 20" />
        </div>
      </div>

      <div>
        <label className="label">Vorlage (optional)</label>
        <select
          className="select"
          value=""
          onChange={ev => {
            const preset = KRAFT_TYPEN.find(t => t.key === ev.target.value);
            if (preset) set({
              fach: preset.fach, form: preset.form, groesse: preset.groesse, text: preset.text,
              name: k.name || preset.label,
            });
          }}
        >
          <option value="">– aus Vorlage übernehmen –</option>
          {KRAFT_TYPEN.map(t => (
            <option key={t.key} value={t.key}>{t.label} ({t.text})</option>
          ))}
        </select>
      </div>

      <div className="grid-3">
        <div>
          <label className="label">Fachaufgabe (Farbe)</label>
          <select className="select" value={k.fach || 'feuerwehr'} onChange={ev => set({ fach: ev.target.value })}>
            {FACH_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Grundform</label>
          <select className="select" value={k.form || 'fahrzeug'} onChange={ev => set({ form: ev.target.value })}>
            {FORM_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Größenklasse</label>
          <select className="select" value={k.groesse || 'gruppe'} onChange={ev => set({ groesse: ev.target.value })}>
            {GROESSE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid-3">
        <div>
          <label className="label">Kürzel im taktischen Zeichen</label>
          <input className="input mono" value={k.text || ''} onChange={ev => set({ text: ev.target.value.toUpperCase() })} placeholder="LZ, HLF, RTW …" maxLength={6} />
        </div>
        <div>
          <label className="label">Personalstärke</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div>
              <div className="label" style={{ marginBottom: 4, fontSize: 10 }}>F</div>
              <input
                className="input mono"
                type="number"
                min="0"
                inputMode="numeric"
                value={staerkeParts.f}
                onChange={ev => updateStaerkePart('f', ev.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4, fontSize: 10 }}>U</div>
              <input
                className="input mono"
                type="number"
                min="0"
                inputMode="numeric"
                value={staerkeParts.u}
                onChange={ev => updateStaerkePart('u', ev.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <div className="label" style={{ marginBottom: 4, fontSize: 10 }}>M</div>
              <input
                className="input mono"
                type="number"
                min="0"
                inputMode="numeric"
                value={staerkeParts.m}
                onChange={ev => updateStaerkePart('m', ev.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {`Schema ${formatStaerkeFromParts(staerkeParts)} · Gesamt = ${staerkeGesamt(k.staerke)} Pers.`}
          </div>
        </div>
        <div>
          <label className="label">FMS-Status</label>
          <select className="select" value={k.fms || '2'} onChange={ev => set({ fms: ev.target.value })}>
            {Object.entries(FMS_LABELS).map(([v, l]) => <option key={v} value={v}>{v.toUpperCase()} – {l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Bemerkung</label>
        <input className="input" value={k.bemerkung || ''} onChange={ev => set({ bemerkung: ev.target.value })} placeholder="z. B. Atemschutz 2 Trupps, Sonderlöschmittel …" />
      </div>

      <div className="grid-2">
        <div>
          <label className="label">Im Einsatz seit</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              className="input mono"
              type="datetime-local"
              value={toLocalInputValue(k.einsatzSeit)}
              onChange={ev => set({ einsatzSeit: fromLocalInputValue(ev.target.value) })}
              style={{ flex: 1 }}
            />
            <button className="btn" type="button" onClick={() => set({ einsatzSeit: nowISO() })} title="Auf jetzt setzen">jetzt</button>
            {k.einsatzSeit && (
              <button className="btn" type="button" onClick={() => set({ einsatzSeit: null })} title="Löschen">×</button>
            )}
          </div>
          {k.einsatzSeit && (
            <div className="hint-line">Läuft seit {dauerStr(k.einsatzSeit)}</div>
          )}
        </div>
        <div>
          <label className="label">Im Abschnitt seit</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              className="input mono"
              type="datetime-local"
              value={toLocalInputValue(k.eaSince)}
              onChange={ev => set({ eaSince: fromLocalInputValue(ev.target.value) })}
              style={{ flex: 1 }}
            />
            <button className="btn" type="button" onClick={() => set({ eaSince: nowISO() })} title="Auf jetzt setzen">jetzt</button>
            {k.eaSince && (
              <button className="btn" type="button" onClick={() => set({ eaSince: null })} title="Löschen">×</button>
            )}
          </div>
          {k.eaSince && (
            <div className="hint-line">Im EA seit {dauerStr(k.eaSince)}</div>
          )}
        </div>
      </div>

      <div style={{
        padding: '12px 14px', background: 'var(--bg-sunken)', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <TaktischesZeichen
          fach={k.fach || 'feuerwehr'}
          form={k.form || 'fahrzeug'}
          groesse={k.groesse || 'gruppe'}
          text={k.text || '?'}
          size="lg"
        />
        <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{k.name || 'Vorschau'}</div>
          <div className="mono" style={{ fontFamily: 'var(--font-mono)' }}>{k.funkruf || '—'}</div>
        </div>
      </div>
    </Modal>
  );
}

// ===== Kraft-Tile (drag handle + display) ====================================
function KraftTile({ kraft, draggingId, onPointerDown, onEdit, ablThreshold }) {
  const showTime = !!kraft.eaSince;
  const lvl = dauerLevel(kraft.eaSince, ablThreshold);
  const people = staerkeGesamt(kraft.staerke);
  return (
    <div
      className={`kraft ${draggingId === kraft.id ? 'is-dragging' : ''}`}
      data-kraft-id={kraft.id}
      onPointerDown={(e) => onPointerDown(e, kraft.id)}
      onDoubleClick={() => onEdit(kraft.id)}
    >
      <TaktischesZeichen
        fach={kraft.fach} form={kraft.form} groesse={kraft.groesse}
        text={kraft.text} size="sm"
      />
      <div className="kraft-main">
        <div className="kraft-name-row">
          <span className="name" title={kraft.name || kraft.text || ''}>
            {kraft.name || kraft.text || 'Kraft'}
          </span>
        </div>
        <div className="kraft-meta-row">
          <span
            className={`time-chip lvl-${lvl || 'ok'}`}
            title={
              showTime
                ? (
                    `Im Abschnitt seit ${fmtDate(kraft.eaSince)}` +
                    (kraft.einsatzSeit ? `\nEinsatz gesamt seit ${fmtDate(kraft.einsatzSeit)} (${dauerStr(kraft.einsatzSeit)})` : '') +
                    `\nAblöseschwelle: ${ablThreshold} h`
                  )
                : 'Noch keinem Abschnitt zugeordnet'
            }
          >
            <span className="time-dot"></span>
            <span className="time-label">Im Abschnitt</span>
            <span className="time-val">{showTime ? dauerStr(kraft.eaSince) : '0 min'}</span>
            {lvl === 'overdue' && <span className="time-flag">Ablöse</span>}
            {lvl === 'crit' && <span className="time-flag">bald</span>}
          </span>
          <span
            className="stk-chip"
            title={`Personalstärke ${kraft.staerke || 'unbekannt'} (Führer / Unterführer / Mannschaften) = ${people} Personen`}
          >
            <span className="stk-pers">{people}</span>
            <span className="stk-label">Pers.</span>
          </span>
        </div>
      </div>
      <div className="stat">
        <button
          className="kraft-edit-btn"
          title="Bearbeiten"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit(kraft.id); }}
        >
          <I.edit />
        </button>
      </div>
    </div>
  );
}

// ===== Hauptkomponente ========================================================
function KraefteTab({ data, setData, onPrint, ablThreshold = 6 }) {
  const kraefte  = data.kraefte  || {};
  const eas      = data.einsatzabschnitte || {};

  // Live-Ticker für Zeit-Anzeigen
  useTicker(30000);

  const [editing, setEditing]   = useState(null);    // id der Kraft im Editor
  const [filter,  setFilter]    = useState('alle');  // pool filter (fach)
  const [draggingId, setDragId] = useState(null);
  const [confirmNode, askConfirm] = useConfirm();

  // ---- DnD state -----------------------------------------------------------
  const dragRef = useRef({
    id: null,
    pointerId: null,
    started: false,
    startX: 0, startY: 0,
    ghost: null,
    sourceEl: null,
    lastDropTarget: null,
  });

  // Build pool / EA buckets
  const poolList = useMemo(() => Object.values(kraefte).filter(k => !k.ea), [kraefte]);
  const buckets  = useMemo(() => {
    const m = {};
    Object.values(eas).forEach(ea => { m[ea.id] = []; });
    Object.values(kraefte).forEach(k => { if (k.ea && m[k.ea]) m[k.ea].push(k); });
    return m;
  }, [kraefte, eas]);

  const filteredPool = useMemo(() => {
    if (filter === 'alle') return poolList;
    return poolList.filter(k => k.fach === filter);
  }, [poolList, filter]);

  // ---- Mutations -----------------------------------------------------------
  const moveKraft = useCallback((id, target) => {
    setData(d => {
      const k = (d.kraefte || {})[id];
      if (!k) return d;
      let newEa = null;
      if (target === 'pool') newEa = null;
      else if (target && target.startsWith('ea:')) newEa = target.slice(3);
      if (k.ea === newEa) return d;
      const now = nowISO();
      const patch = { ...k, ea: newEa };
      // Zeitstempel-Logik
      if (k.ea == null && newEa != null) {
        // Pool → EA: Einsatz beginnt, EA-Zeit beginnt
        patch.einsatzSeit = k.einsatzSeit || now;
        patch.eaSince     = now;
      } else if (k.ea != null && newEa != null && k.ea !== newEa) {
        // EA → EA: EA-Zeit reset (Einsatzdauer läuft weiter)
        patch.eaSince     = now;
      } else if (k.ea != null && newEa == null) {
        // EA → Pool: zurück in Reserve, Zeiten löschen
        patch.einsatzSeit = null;
        patch.eaSince     = null;
      }
      return { ...d, kraefte: { ...d.kraefte, [id]: patch } };
    });
  }, [setData]);

  const upsertKraftFromEditor = (k) => {
    setData(d => {
      const next = { ...(d.kraefte || {}) };
      const id = k.id;
      const { isNew, ...rest } = k;
      next[id] = { ...next[id], ...rest, id };
      return { ...d, kraefte: next };
    });
  };

  const removeKraft = (id) => setData(d => {
    const next = { ...(d.kraefte || {}) };
    delete next[id];
    return { ...d, kraefte: next };
  });

  const addKraftFromPreset = (preset) => {
    const k = {
      id: uid(),
      name: preset.label,
      funkruf: '',
      fach: preset.fach,
      form: preset.form,
      groesse: preset.groesse,
      text: preset.text,
      staerke: preset.staerke || '',
      fms: '2',
      bemerkung: '',
      ea: null,
    };
    setData(d => ({ ...d, kraefte: { ...(d.kraefte || {}), [k.id]: k } }));
    setEditing(k.id);
  };

  const addCustomKraft = () => {
    const k = {
      id: uid(),
      name: '',
      funkruf: '',
      fach: 'feuerwehr',
      form: 'fahrzeug',
      groesse: 'gruppe',
      text: '',
      fms: '2',
      bemerkung: '',
      ea: null,
      isNew: true,
    };
    setData(d => ({ ...d, kraefte: { ...(d.kraefte || {}), [k.id]: { ...k, isNew: false } } }));
    setEditing(k.id);
  };

  const addEA = () => {
    const id = uid();
    const count = Object.keys(eas).length;
    const colors = ['#dc2626', '#1d4ed8', '#3aa164', '#ee5a24', '#7a5ae0', '#f2b30b', '#15294b'];
    const ea = {
      id,
      name: `Einsatzabschnitt ${count + 1}`,
      leiter: '',
      farbe: colors[count % colors.length],
      ordnung: count,
    };
    setData(d => ({ ...d, einsatzabschnitte: { ...(d.einsatzabschnitte || {}), [id]: ea } }));
  };

  const updateEA = (id, patch) => setData(d => ({
    ...d,
    einsatzabschnitte: { ...(d.einsatzabschnitte || {}), [id]: { ...(d.einsatzabschnitte || {})[id], ...patch } },
  }));

  const removeEA = (id) => {
    askConfirm({
      title: 'Einsatzabschnitt entfernen?',
      body: 'Die zugeordneten Kräfte werden zurück in den Pool verschoben.',
      yesLabel: 'Entfernen',
      onYes: () => {
        setData(d => {
          const nextEas = { ...(d.einsatzabschnitte || {}) };
          delete nextEas[id];
          const nextK = { ...(d.kraefte || {}) };
          Object.values(nextK).forEach(k => {
            if (k.ea === id) nextK[k.id] = { ...k, ea: null };
          });
          return { ...d, einsatzabschnitte: nextEas, kraefte: nextK };
        });
      },
    });
  };

  // ---- DnD handlers --------------------------------------------------------
  const onTilePointerDown = useCallback((e, id) => {
    if (e.button !== undefined && e.button !== 0) return;
    const tile = e.currentTarget;
    dragRef.current = {
      id, pointerId: e.pointerId, started: false,
      startX: e.clientX, startY: e.clientY,
      ghost: null, sourceEl: tile, lastDropTarget: null,
    };
    tile.setPointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d.id) return;
      const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
      if (!d.started) {
        if (Math.hypot(dx, dy) < 5) return;
        d.started = true;
        setDragId(d.id);
        // Build ghost
        const ghost = d.sourceEl.cloneNode(true);
        ghost.className = 'drag-ghost ' + ghost.className.replace('is-dragging', '');
        ghost.style.width = d.sourceEl.offsetWidth + 'px';
        ghost.style.position = 'fixed';
        ghost.style.left = e.clientX + 'px';
        ghost.style.top  = e.clientY + 'px';
        document.body.appendChild(ghost);
        d.ghost = ghost;
        document.body.style.cursor = 'grabbing';
      }
      if (d.ghost) {
        d.ghost.style.left = e.clientX + 'px';
        d.ghost.style.top  = e.clientY + 'px';
      }
      // Highlight drop target
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const dropEl = el && el.closest && el.closest('[data-drop]');
      const target = dropEl ? dropEl.getAttribute('data-drop') : null;
      if (target !== d.lastDropTarget) {
        document.querySelectorAll('[data-drop].drop-active').forEach(n => n.classList.remove('drop-active'));
        if (dropEl) dropEl.classList.add('drop-active');
        d.lastDropTarget = target;
      }
    };
    const onUp = (e) => {
      const d = dragRef.current;
      if (!d.id) return;
      const wasStarted = d.started;
      const target = d.lastDropTarget;
      // cleanup
      if (d.ghost) d.ghost.remove();
      document.querySelectorAll('[data-drop].drop-active').forEach(n => n.classList.remove('drop-active'));
      document.body.style.cursor = '';
      dragRef.current = { id: null, pointerId: null, started: false, startX: 0, startY: 0, ghost: null, sourceEl: null, lastDropTarget: null };
      setDragId(null);
      if (wasStarted && target) moveKraft(d.id, target);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [moveKraft]);

  // ---- Render --------------------------------------------------------------
  const eaList = Object.values(eas).sort((a, b) => (a.ordnung||0) - (b.ordnung||0));
  const editingKraft = editing ? kraefte[editing] : null;

  // Stats
  const total = Object.keys(kraefte).length;
  const assigned = Object.values(kraefte).filter(k => !!k.ea).length;
  const totalPers = Object.values(kraefte).reduce((s, k) => s + staerkeGesamt(k.staerke), 0);
  const assignedPers = Object.values(kraefte).filter(k => !!k.ea).reduce((s, k) => s + staerkeGesamt(k.staerke), 0);

  const fachFilters = [['alle','Alle'], ...FACH_OPTIONS];

  return (
    <div className="kraefte">
      {confirmNode}

      {/* Left: Pool */}
      <div className="panel">
        <div className="panel-head">
          Kräftepool
          <span className="count">{poolList.length}</span>
          <div className="right">
            <button className="btn sm" onClick={addCustomKraft} title="Eigene Kraft anlegen">
              <I.plus /> Eigene
            </button>
          </div>
        </div>

        <div className="pool-filters">
          {fachFilters.map(([v, l]) => (
            <div
              key={v}
              className="chip"
              data-active={filter === v}
              onClick={() => setFilter(v)}
            >
              {v !== 'alle' && (
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: 2,
                  background: FACH_COLORS[v]?.bg, border: '1px solid #00000020',
                }} />
              )}
              {l.replace(/\s*\(.*\)/, '')}
            </div>
          ))}
        </div>

        <div className="panel-body" data-drop="pool">
          {filteredPool.length === 0 && (
            <div className="ea-empty" style={{ minHeight: 80 }}>Pool leer — Kräfte aus Vorlagen anlegen ↓</div>
          )}
          {filteredPool.map(k => (
            <KraftTile
              key={k.id} kraft={k}
              draggingId={draggingId}
              onPointerDown={onTilePointerDown}
              onEdit={(id) => setEditing(id)}
              ablThreshold={ablThreshold}
            />
          ))}

          <div className="divider" />

          <VorlagenBrowser
            fuehrungsstufe={data.einsatz?.fuehrungsstufe || 'C'}
            onPick={addKraftFromPreset}
          />
        </div>
      </div>

      {/* Right: Einsatzabschnitte */}
      <div className="panel">
        <div className="panel-head">
          Einsatzabschnitte
          <span className="count">{eaList.length}</span>
          <span className="count" style={{ marginLeft: 4 }}>Gebunden {assigned}/{total}</span>
          {totalPers > 0 && (
            <span className="count" style={{ marginLeft: 4 }}>{assignedPers}/{totalPers} Pers.</span>
          )}
          <div className="right">
            <button className="btn sm" onClick={onPrint} title="Kräfteübersicht drucken / als PDF speichern">
              <I.printer /> Drucken / PDF
            </button>
            <button className="btn sm primary" onClick={addEA}>
              <I.plus /> Neuer Abschnitt
            </button>
          </div>
        </div>

        <div className="panel-body" style={{ background: 'var(--bg)' }}>
          {eaList.length === 0 ? (
            <div className="empty-state">
              <h3>Noch keine Einsatzabschnitte</h3>
              <p>Lege Abschnitte an und ziehe Kräfte aus dem Pool per Drag & Drop hinein.</p>
              <div style={{ height: 12 }} />
              <button className="btn primary" onClick={addEA}><I.plus /> Ersten Abschnitt anlegen</button>
            </div>
          ) : (
            <div className="eas">
              {eaList.map(ea => (
                <div key={ea.id} className="ea">
                  <div className="ea-head">
                    <input
                      type="color"
                      value={ea.farbe || '#0E1F3D'}
                      onChange={(e) => updateEA(ea.id, { farbe: e.target.value })}
                      title="Farbe wählen"
                      style={{
                        width: 22, height: 22, padding: 0, border: '1px solid var(--line)',
                        borderRadius: 4, background: 'transparent', cursor: 'pointer', flexShrink: 0,
                      }}
                    />
                    <input
                      className="title"
                      value={ea.name}
                      onChange={(e) => updateEA(ea.id, { name: e.target.value })}
                    />
                    <button
                      className="btn-remove-ea"
                      title="Einsatzabschnitt entfernen"
                      aria-label="Einsatzabschnitt entfernen"
                      onClick={() => removeEA(ea.id)}
                    >
                      <I.trash />
                    </button>
                  </div>
                  <div className="ea-sub">
                    <span className="ea-leader-row">
                      <span className="ea-leader-label">Leiter:</span>
                      <input
                        className="ea-leader-input"
                        placeholder="—"
                        value={ea.leiter || ''}
                        onChange={(e) => updateEA(ea.id, { leiter: e.target.value })}
                      />
                    </span>
                  </div>
                  {(() => {
                    const list = buckets[ea.id] || [];
                    const totalPers = list.reduce((s, k) => s + staerkeGesamt(k.staerke), 0);
                    const totalUnits = list.length;
                    return (
                      <div className="ea-stats">
                        <span className="ea-stat">
                          <span className="ea-stat-num">{totalUnits}</span>
                          <span className="ea-stat-lbl">{totalUnits === 1 ? 'Einheit' : 'Einheiten'}</span>
                        </span>
                        <span className="ea-stat">
                          <span className="ea-stat-num">{totalPers}</span>
                          <span className="ea-stat-lbl">Pers. ges.</span>
                        </span>
                      </div>
                    );
                  })()}
                  <div className="ea-body" data-drop={`ea:${ea.id}`}>
                    {(buckets[ea.id] || []).length === 0 ? (
                      <div className="ea-empty">Kräfte hierhin ziehen</div>
                    ) : (
                      (buckets[ea.id] || []).map(k => (
                        <KraftTile
                          key={k.id} kraft={k}
                          draggingId={draggingId}
                          onPointerDown={onTilePointerDown}
                          onEdit={(id) => setEditing(id)}
                          ablThreshold={ablThreshold}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
              <button className="add-ea" onClick={addEA}>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <I.plus />
                  Weiterer Einsatzabschnitt
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <KraftEditor
        open={!!editingKraft}
        kraft={editingKraft}
        onClose={() => setEditing(null)}
        onSave={upsertKraftFromEditor}
        onDelete={removeKraft}
      />
    </div>
  );
}

// ===== Vorlagen-Browser: kategorisiert, mit Suche, je nach Führungsstufe sortiert
function VorlagenBrowser({ fuehrungsstufe, onPick }) {
  const [q, setQ] = useState('');
  const [openCat, setOpenCat] = useState(() => {
    // Default-Aufklappung passend zur Führungsstufe
    const stage = fuehrungsstufe || 'C';
    if (stage === 'D') return { verband: true, einheit: true, fuehrung: false, person: false, fahrzeug: false };
    if (stage === 'C') return { verband: false, einheit: true, fuehrung: true, person: false, fahrzeug: false };
    return { verband: false, einheit: true, fuehrung: false, person: false, fahrzeug: true };
  });

  // Re-sort: bei Stufe D Verbände/Einheiten zuerst, bei A/B Fahrzeuge nach oben
  const orderedCats = useMemo(() => {
    const order = (fuehrungsstufe === 'A' || fuehrungsstufe === 'B')
      ? ['fahrzeug', 'einheit', 'verband', 'fuehrung', 'person']
      : ['verband', 'einheit', 'fuehrung', 'person', 'fahrzeug'];
    return order.map(k => KATEGORIEN.find(c => c.key === k)).filter(Boolean);
  }, [fuehrungsstufe]);

  const filteredByCat = useMemo(() => {
    const map = {};
    KATEGORIEN.forEach(c => { map[c.key] = []; });
    const needle = q.trim().toLowerCase();
    KRAFT_TYPEN.forEach(t => {
      if (!map[t.kategorie]) return;
      if (needle) {
        const hay = (t.key + ' ' + t.label + ' ' + t.text).toLowerCase();
        if (!hay.includes(needle)) return;
      }
      map[t.kategorie].push(t);
    });
    return map;
  }, [q]);

  const matchCount = Object.values(filteredByCat).reduce((a, b) => a + b.length, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Vorlagen
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Stufe {fuehrungsstufe || 'C'}
        </span>
        <div style={{ flex: 1 }} />
        <input
          className="input"
          placeholder="Suchen…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ height: 26, padding: '0 8px', fontSize: 12, width: 130 }}
        />
      </div>

      {orderedCats.map(cat => {
        const items = filteredByCat[cat.key] || [];
        if (q && items.length === 0) return null;
        const isOpen = q ? true : !!openCat[cat.key];
        return (
          <div key={cat.key} className="vorl-cat">
            <button
              className="vorl-cat-head"
              onClick={() => setOpenCat(o => ({ ...o, [cat.key]: !o[cat.key] }))}
              type="button"
            >
              <span className={`caret ${isOpen ? 'open' : ''}`}>▸</span>
              <span className="vorl-cat-label">{cat.label}</span>
              <span className="vorl-cat-hint">{cat.hint}</span>
              <span className="vorl-cat-count">{items.length}</span>
            </button>
            {isOpen && (
              <div className="vorl-list">
                {items.map(t => (
                  <button
                    key={t.key}
                    className="vorl-card"
                    onClick={() => onPick(t)}
                    title={t.label + (t.staerke ? ' · ' + staerkeAnzeige(t.staerke) : '')}
                    type="button"
                  >
                    <TaktischesZeichen fach={t.fach} form={t.form} groesse={t.groesse} text={t.text} size="sm" />
                    <div className="vorl-info">
                      <div className="vorl-name">{t.label}</div>
                      {t.staerke && <div className="vorl-st">{staerkeAnzeige(t.staerke)}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {q && matchCount === 0 && (
        <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
          Keine Vorlage gefunden — „Eigene" verwenden.
        </div>
      )}
    </div>
  );
}

Object.assign(window, { KraefteTab });
