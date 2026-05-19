// app.jsx — Hauptanwendung: State, Auto-Save, Tabs, Export/Import

const STORAGE_KEY = 'einsatzleitung_v1';
const SCHEMA_VERSION = 1;

const EMPTY_STATE = {
  schemaVersion: SCHEMA_VERSION,
  einsatz: {
    nummer: '',
    stichwort: '',
    fuehrungsstufe: 'C',
    ort: '',
    befehlsstelle: '',
    leitstelle: '',
    anordnung: '',
    uebernommen: '',
    lage: '',
  },
  funktionen: {},
  kraefte: {},
  einsatzabschnitte: {},
  tagebuch: [],
  meta: { createdAt: nowISO(), updatedAt: nowISO() },
};

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STATE, ...parsed };
  } catch (err) {
    console.warn('Konnte gespeicherten Zustand nicht laden:', err);
    return EMPTY_STATE;
  }
}

// Tweaks (theme + density + Ablöseschwelle + Anzeige-Optionen)
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "density": "regular",
  "ablThreshold": 6,
  "showFms": false,
  "showFunkruf": false
}/*EDITMODE-END*/;

function App() {
  const [data, setDataRaw] = useState(loadInitial);
  const [tab, setTab] = useState('stamm');
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'saving'
  const [lastSavedAt, setLastSavedAt] = useState(nowISO());
  const [importOpen, setImportOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [printMode, setPrintMode] = useState(null); // 'kraefte' | 'tagebuch' | null
  const [confirmNode, askConfirm] = useConfirm();
  const fileInputRef = useRef(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Print/PDF handler
  const doPrint = useCallback((mode) => {
    setPrintMode(mode);
    // Wait for render
    setTimeout(() => {
      window.print();
      // After print dialog closes, clear (some browsers fire afterprint)
      setTimeout(() => setPrintMode(null), 100);
    }, 80);
  }, []);

  useEffect(() => {
    const onAfter = () => setPrintMode(null);
    window.addEventListener('afterprint', onAfter);
    return () => window.removeEventListener('afterprint', onAfter);
  }, []);

  const setData = useCallback((updater) => {
    setDataRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...next, meta: { ...(next.meta||{}), updatedAt: nowISO() } };
    });
  }, []);

  // Auto-save (debounced)
  const saveTimer = useRef(null);
  useEffect(() => {
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSaveState('saved');
        setLastSavedAt(nowISO());
      } catch (err) {
        console.error('Speichern fehlgeschlagen:', err);
        setSaveState('saved');
      }
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [data]);

  // Sync save on tab/window close — last chance to flush
  useEffect(() => {
    const flush = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
    };
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, [data]);

  // Periodic backup snapshot in sessionStorage (extra safety net)
  useEffect(() => {
    const id = setInterval(() => {
      try { sessionStorage.setItem(STORAGE_KEY + ':snap', JSON.stringify(data)); } catch {}
    }, 30000);
    return () => clearInterval(id);
  }, [data]);

  // --- Export / Import -------------------------------------------------------
  const exportJSON = () => {
    const fname = `einsatztagebuch_${(data.einsatz?.nummer || 'export').replace(/[^a-z0-9-_]/gi, '_')}_${new Date().toISOString().slice(0,10)}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        askConfirm({
          title: 'Sicherungskopie laden?',
          body: `Der aktuelle Stand wird durch die Datei "${file.name}" ersetzt. Optional kannst du zuvor eine Sicherungskopie des aktuellen Stands herunterladen.`,
          yesLabel: 'Stand ersetzen',
          onYes: () => {
            setData(() => ({ ...EMPTY_STATE, ...parsed }));
            setImportOpen(false);
          },
        });
      } catch (err) {
        alert('Datei konnte nicht gelesen werden: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const newEinsatz = () => {
    askConfirm({
      title: 'Neuen Einsatz beginnen?',
      body: 'Der aktuelle Stand wird gelöscht. Bitte vorher eine Sicherungskopie speichern, wenn der Stand archiviert werden soll.',
      yesLabel: 'Neuen Einsatz beginnen',
      onYes: () => { setData(() => ({ ...EMPTY_STATE, meta: { createdAt: nowISO(), updatedAt: nowISO() } })); setTab('stamm'); },
    });
  };

  // Counts for tab badges
  const kraefteCount = Object.keys(data.kraefte || {}).length;
  const eaCount      = Object.keys(data.einsatzabschnitte || {}).length;
  const tbCount      = (data.tagebuch || []).length;

  const einsatzLabel = (() => {
    const e = data.einsatz || {};
    const parts = [];
    if (e.nummer) parts.push(e.nummer);
    if (e.stichwort) parts.push(e.stichwort);
    return parts.length ? parts.join(' · ') : 'Neuer Einsatz (noch nicht benannt)';
  })();

  return (
    <div className="app" data-theme={t.theme} data-density={t.density}>
      {confirmNode}

      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <img src="assets/biv-logo.png" alt="BIV 26/06" />
          </div>
          <div className="brand-text">
            <span className="top">BIV 26/06</span>
            <span className="bottom">Stabsunterstützung von Tommy</span>
          </div>
        </div>

        <div className="einsatz-meta">
          <span className="sep"></span>
          <span><strong>{einsatzLabel}</strong></span>
          {data.einsatz?.fuehrungsstufe && (
            <>
              <span className="sep"></span>
              <span>Stufe <strong>{data.einsatz.fuehrungsstufe}</strong></span>
            </>
          )}
          {data.einsatz?.ort && (
            <>
              <span className="sep"></span>
              <span>{data.einsatz.ort}</span>
            </>
          )}
        </div>

        <div className="right">
          <div className="save-indicator" title={`Letzte Speicherung lokal: ${fmtDate(lastSavedAt)}`}>
            <span className={`save-dot ${saveState === 'saving' ? 'saving' : ''}`}></span>
            {saveState === 'saving' ? 'speichere…' : `Lokal gespeichert · ${fmtDate(lastSavedAt).slice(11)}`}
          </div>
          <div className="menu">
            <button className="icon-btn" onClick={exportJSON} title="Sicherungskopie als JSON-Datei herunterladen">
              <I.download /> Sicherungskopie
            </button>
            <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Sicherungskopie einlesen">
              <I.upload /> Laden
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.[0]) handleImport(e.target.files[0]); e.target.value = ''; }}
            />
            <button className="icon-btn danger" onClick={newEinsatz} title="Neuen Einsatz beginnen (aktueller Stand wird verworfen)">
              Neuer Einsatz
            </button>
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'stamm'}  className="tab" onClick={() => setTab('stamm')}>
          Stammdaten
        </button>
        <button role="tab" aria-selected={tab === 'kraft'}  className="tab" onClick={() => setTab('kraft')}>
          Kräfteübersicht <span className="badge">{kraefteCount}/{eaCount}EA</span>
        </button>
        <button role="tab" aria-selected={tab === 'tageb'}  className="tab" onClick={() => setTab('tageb')}>
          Einsatztagebuch <span className="badge">{tbCount}</span>
        </button>
        <div style={{ flex: 1 }} />
        <button className="tab" onClick={() => setAboutOpen(true)} title="Hinweise & Quellen" style={{ color: 'var(--text-dim)' }}>
          ⓘ Hinweise
        </button>
      </div>

      {tab === 'stamm' && <StammdatenTab data={data} setData={setData} />}
      {tab === 'kraft' && <KraefteTab    data={data} setData={setData} onPrint={() => doPrint('kraefte')} ablThreshold={t.ablThreshold || 6} showFms={!!t.showFms} showFunkruf={!!t.showFunkruf} />}
      {tab === 'tageb' && <TagebuchTab   data={data} setData={setData} onPrint={() => doPrint('tagebuch')} />}

      {/* Print views — only rendered when needed */}
      {printMode === 'kraefte'  && <PrintKraefte  data={data} />}
      {printMode === 'tagebuch' && <PrintTagebuch data={data} />}

      <TweaksPanel>
        <TweakSection label="Darstellung" />
        <TweakRadio label="Modus"   value={t.theme}    options={['light','dark']}        onChange={(v) => setTweak('theme', v)} />
        <TweakRadio label="Dichte"  value={t.density}  options={['compact','regular','comfy']} onChange={(v) => setTweak('density', v)} />
        <TweakSection label="Kräftekachel" />
        <TweakToggle label="FMS-Status anzeigen"  value={t.showFms}     onChange={(v) => setTweak('showFms', v)} />
        <TweakToggle label="Funkrufname anzeigen" value={t.showFunkruf} onChange={(v) => setTweak('showFunkruf', v)} />
        <TweakSlider label="Ablöseschwelle" value={t.ablThreshold} min={2} max={24} step={1} unit=" h"
                     onChange={(v) => setTweak('ablThreshold', v)} />
      </TweaksPanel>

      <Modal
        open={aboutOpen}
        title="Hinweise & Quellen"
        onClose={() => setAboutOpen(false)}
        footer={<button className="btn primary" onClick={() => setAboutOpen(false)}>Schließen</button>}
        width={620}
      >
        <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-soft)', display: 'grid', gap: 10 }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Datenhaltung.</strong> Alle Eingaben werden ausschließlich lokal im Browser
            (<code>localStorage</code>) gespeichert. Nach jeder Änderung erfolgt automatisch ein Schreibvorgang; eine
            Sicherungskopie wird zusätzlich alle 30 Sekunden in den <code>sessionStorage</code> geschrieben.
            Beim Schließen oder Neuladen der Seite bleibt der Stand erhalten.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Empfehlung.</strong> Am Ende jeder Lagebesprechung sowie beim Schichtwechsel
            eine <em>Sicherungskopie</em> als JSON-Datei exportieren und im Stabsordner ablegen — sie lässt sich auf jedem Gerät
            wieder einlesen.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Taktische Zeichen.</strong> Vereinfachte Darstellung nach
            FwDV 100 / BBK „Taktische Zeichen": Grundzeichen (Form), Fachaufgabe (Farbe) und Verbandskennzeichen (Punkte/Striche).
            Diese App ist eine Arbeitshilfe — kein Ersatz für ein behördlich geführtes Original-Tagebuch.
          </p>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 12 }}>
            Formularstruktur orientiert sich an der Vorlage „Einsatztagebuch der Einsatzleitung" (IdF NRW, Kapitel I).
          </p>
        </div>
      </Modal>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
