// app.jsx - Hauptanwendung: State, Auto-Save, Tabs, Export/Import, Cloud-Sync

const STORAGE_KEY = 'einsatzleitung_v1';
const ACCESS_KEY = 'einsatzleitung_access_v1';
const ACCESS_PASSWORD = 'b42606idf';
const ACCESS_TTL_MS = 24 * 60 * 60 * 1000;
const BOT_DELAY_MS = 1600;
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

function normalizeState(input) {
  const state = input && typeof input === 'object' ? input : {};
  return {
    ...EMPTY_STATE,
    ...state,
    einsatz: { ...EMPTY_STATE.einsatz, ...(state.einsatz || {}) },
    funktionen: state.funktionen && typeof state.funktionen === 'object' ? state.funktionen : {},
    kraefte: state.kraefte && typeof state.kraefte === 'object' ? state.kraefte : {},
    einsatzabschnitte: state.einsatzabschnitte && typeof state.einsatzabschnitte === 'object' ? state.einsatzabschnitte : {},
    tagebuch: Array.isArray(state.tagebuch) ? state.tagebuch : [],
    meta: { ...EMPTY_STATE.meta, ...(state.meta || {}) },
  };
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeState(EMPTY_STATE);
    return normalizeState(JSON.parse(raw));
  } catch (err) {
    console.warn('Konnte gespeicherten Zustand nicht laden:', err);
    return normalizeState(EMPTY_STATE);
  }
}

function tsOf(iso) {
  const ms = Date.parse(iso || '');
  return Number.isFinite(ms) ? ms : 0;
}

function newerState(a, b) {
  const stateA = normalizeState(a);
  const stateB = normalizeState(b);
  return tsOf(stateB.meta?.updatedAt) > tsOf(stateA.meta?.updatedAt) ? stateB : stateA;
}

function hasValidAccess() {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Number(parsed?.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

function grantAccess() {
  localStorage.setItem(ACCESS_KEY, JSON.stringify({ expiresAt: Date.now() + ACCESS_TTL_MS }));
}

function syncCloudDoc() {
  return window.EINSATZ_CLOUD?.docRef || null;
}

function saveLocalSnapshot(state) {
  const serialized = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, serialized);
  sessionStorage.setItem(`${STORAGE_KEY}:snap`, serialized);
}

function cloudStatusText(cloudState, lastSavedAt) {
  if (cloudState === 'loading') return 'Cloud wird geladen';
  if (cloudState === 'saving') return 'Cloud wird synchronisiert';
  if (cloudState === 'error') return `Nur lokal gespeichert · ${fmtDate(lastSavedAt).slice(11)}`;
  return `Cloud synchronisiert · ${fmtDate(lastSavedAt).slice(11)}`;
}

function AccessScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const honeypotRef = useRef(null);

  useEffect(() => {
    setReady(false);
    const id = setTimeout(() => setReady(true), BOT_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const submit = (event) => {
    event.preventDefault();
    if ((honeypotRef.current?.value || '').trim()) {
      setError('Zugriff aktuell nicht moeglich.');
      return;
    }
    if (!ready) {
      setError('Einen kurzen Moment bitte.');
      return;
    }
    if (password !== ACCESS_PASSWORD) {
      setError('Passwort falsch.');
      return;
    }
    grantAccess();
    onUnlock();
  };

  return (
    <div className="access-shell" data-theme="dark">
      <div className="access-backdrop" />
      <div className="access-card">
        <div className="access-brand">
          <div className="access-brand-mark">
            <img src="assets/biv-logo.png" alt="BIV 26/06" />
          </div>
          <div className="access-brand-text">
            <span className="top">BIV 26/06</span>
            <span className="bottom">Stabsunterstuetzung von Tommy</span>
          </div>
        </div>

        <div className="access-copy">
          <h1>Einsatzoberflaeche entsperren</h1>
          <p>
            Diese Morgen-Version ist ueber ein gemeinsames Passwort geschuetzt.
            Der Einsatzstand wird nach dem Entsperren zentral gespeichert und kann
            auf einem anderen PC weitergefuehrt werden.
          </p>
        </div>

        <form className="access-form" onSubmit={submit}>
          <label className="label" htmlFor="access-password">Passwort</label>
          <input
            id="access-password"
            className="input access-input"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            autoFocus
            autoComplete="current-password"
            placeholder="Passwort eingeben"
          />
          <input
            ref={honeypotRef}
            type="text"
            tabIndex="-1"
            autoComplete="off"
            className="access-honeypot"
            aria-hidden="true"
          />
          <div className="access-actions">
            <button className="btn primary" type="submit" disabled={!ready}>
              {ready ? 'Zugang oeffnen' : 'Bitte kurz warten'}
            </button>
            <span className="access-note">Freigabe bleibt fuer 24 Stunden auf diesem Browser erhalten.</span>
          </div>
          {error && <div className="access-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}

function LoadingScreen({ title, body }) {
  return (
    <div className="access-shell" data-theme="dark">
      <div className="access-backdrop" />
      <div className="access-card loading-card">
        <div className="access-copy">
          <h1>{title}</h1>
          <p>{body}</p>
        </div>
      </div>
    </div>
  );
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
  const [saveState, setSaveState] = useState('saved');
  const [lastSavedAt, setLastSavedAt] = useState(loadInitial().meta?.updatedAt || nowISO());
  const [aboutOpen, setAboutOpen] = useState(false);
  const [printMode, setPrintMode] = useState(null);
  const [isUnlocked, setUnlocked] = useState(hasValidAccess);
  const [cloudState, setCloudState] = useState(hasValidAccess() ? 'loading' : 'locked');
  const [hydrated, setHydrated] = useState(!hasValidAccess());
  const [confirmNode, askConfirm] = useConfirm();
  const fileInputRef = useRef(null);
  const saveTimer = useRef(null);
  const skipNextPersistRef = useRef(false);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const doPrint = useCallback((mode) => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(null), 100);
    }, 80);
  }, []);

  useEffect(() => {
    const onAfter = () => setPrintMode(null);
    window.addEventListener('afterprint', onAfter);
    return () => window.removeEventListener('afterprint', onAfter);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.body.dataset.theme = t.theme;
    return () => {
      delete document.documentElement.dataset.theme;
      delete document.body.dataset.theme;
    };
  }, [t.theme]);

  const setData = useCallback((updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return normalizeState({
        ...next,
        meta: { ...(next.meta || {}), updatedAt: nowISO() },
      });
    });
  }, []);

  useEffect(() => {
    if (!isUnlocked) return undefined;
    const ref = syncCloudDoc();
    if (!ref) {
      console.error('Firestore-Dokument nicht verfuegbar.');
      setCloudState('error');
      setHydrated(true);
      return undefined;
    }

    setCloudState('loading');
    let initialDone = false;
    const unsubscribe = ref.onSnapshot((snapshot) => {
      const localState = loadInitial();
      if (snapshot.exists) {
        const remoteState = normalizeState(snapshot.data());
        const bootstrap = planBootstrapSync(localState, remoteState);
        const preferred = normalizeState(bootstrap.preferredState);
        skipNextPersistRef.current = bootstrap.skipInitialPersist;
        setDataRaw((prev) => newerState(prev, preferred));
        try {
          saveLocalSnapshot(preferred);
        } catch (err) {
          console.warn('Konnte Cloud-Stand nicht lokal puffern:', err);
        }
        setLastSavedAt(preferred.meta?.updatedAt || nowISO());
      } else {
        skipNextPersistRef.current = false;
      }

      setCloudState('ready');
      if (!initialDone) {
        setHydrated(true);
        initialDone = true;
      }
    }, (err) => {
      console.error('Cloud-Laden fehlgeschlagen:', err);
      setCloudState('error');
      if (!initialDone) {
        setHydrated(true);
        initialDone = true;
      }
    });

    return () => unsubscribe();
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked || !hydrated) return undefined;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return undefined;
    }

    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        saveLocalSnapshot(data);
      } catch (err) {
        console.error('Lokales Speichern fehlgeschlagen:', err);
      }

      const ref = syncCloudDoc();
      if (ref) {
        try {
          setCloudState('saving');
          await ref.set(normalizeState(data));
          setCloudState('ready');
        } catch (err) {
          console.error('Cloud-Sync fehlgeschlagen:', err);
          setCloudState('error');
        }
      } else {
        setCloudState('error');
      }

      setSaveState('saved');
      setLastSavedAt(data.meta?.updatedAt || nowISO());
    }, 500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, hydrated, isUnlocked]);

  useEffect(() => {
    const flush = () => {
      try {
        saveLocalSnapshot(data);
      } catch {}
    };
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, [data]);

  useEffect(() => {
    const id = setInterval(() => {
      try {
        sessionStorage.setItem(`${STORAGE_KEY}:snap`, JSON.stringify(data));
      } catch {}
    }, 30000);
    return () => clearInterval(id);
  }, [data]);

  const exportJSON = () => {
    const fname = `einsatztagebuch_${(data.einsatz?.nummer || 'export').replace(/[^a-z0-9-_]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = normalizeState(JSON.parse(reader.result));
        askConfirm({
          title: 'Sicherungskopie laden?',
          body: `Der aktuelle Stand wird durch die Datei "${file.name}" ersetzt. Optional kannst du zuvor eine Sicherungskopie des aktuellen Stands herunterladen.`,
          yesLabel: 'Stand ersetzen',
          onYes: () => setData(() => parsed),
        });
      } catch (err) {
        alert(`Datei konnte nicht gelesen werden: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const newEinsatz = () => {
    askConfirm({
      title: 'Neuen Einsatz beginnen?',
      body: 'Der aktuelle Stand wird geloescht. Bitte vorher eine Sicherungskopie speichern, wenn der Stand archiviert werden soll.',
      yesLabel: 'Neuen Einsatz beginnen',
      onYes: () => {
        setData(() => normalizeState({
          ...EMPTY_STATE,
          meta: { createdAt: nowISO(), updatedAt: nowISO() },
        }));
        setTab('stamm');
      },
    });
  };

  const kraefteCount = Object.keys(data.kraefte || {}).length;
  const eaCount = Object.keys(data.einsatzabschnitte || {}).length;
  const tbCount = (data.tagebuch || []).length;

  const einsatzLabel = (() => {
    const e = data.einsatz || {};
    const parts = [];
    if (e.nummer) parts.push(e.nummer);
    if (e.stichwort) parts.push(e.stichwort);
    return parts.length ? parts.join(' · ') : 'Neuer Einsatz (noch nicht benannt)';
  })();

  const syncBusy = saveState === 'saving' || cloudState === 'loading' || cloudState === 'saving';

  if (!isUnlocked) {
    return <AccessScreen onUnlock={() => {
      setUnlocked(true);
      setCloudState('loading');
      setHydrated(false);
    }} />;
  }

  if (!hydrated) {
    return <LoadingScreen title="Cloud-Stand wird geladen" body="Der zuletzt gespeicherte Einsatzstand wird aus Firebase geladen." />;
  }

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
            <span className="bottom">Stabsunterstuetzung von Tommy</span>
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
          <div className="save-indicator" title={`Letzte Synchronisierung: ${fmtDate(lastSavedAt)}`}>
            <span className={`save-dot ${syncBusy ? 'saving' : ''} ${cloudState === 'error' ? 'error' : ''}`}></span>
            {cloudStatusText(cloudState, lastSavedAt)}
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
              onChange={(e) => {
                if (e.target.files?.[0]) handleImport(e.target.files[0]);
                e.target.value = '';
              }}
            />
            <button className="icon-btn danger" onClick={newEinsatz} title="Neuen Einsatz beginnen (aktueller Stand wird verworfen)">
              Neuer Einsatz
            </button>
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'stamm'} className="tab" onClick={() => setTab('stamm')}>
          Stammdaten
        </button>
        <button role="tab" aria-selected={tab === 'kraft'} className="tab" onClick={() => setTab('kraft')}>
          Kraefteuebersicht <span className="badge">{kraefteCount}/{eaCount}EA</span>
        </button>
        <button role="tab" aria-selected={tab === 'tageb'} className="tab" onClick={() => setTab('tageb')}>
          Einsatztagebuch <span className="badge">{tbCount}</span>
        </button>
        <div style={{ flex: 1 }} />
        <button className="tab" onClick={() => setAboutOpen(true)} title="Hinweise & Quellen" style={{ color: 'var(--text-dim)' }}>
          Hinweise
        </button>
      </div>

      {tab === 'stamm' && <StammdatenTab data={data} setData={setData} />}
      {tab === 'kraft' && (
        <KraefteTab
          data={data}
          setData={setData}
          onPrint={() => doPrint('kraefte')}
          ablThreshold={t.ablThreshold || 6}
          showFms={!!t.showFms}
          showFunkruf={!!t.showFunkruf}
        />
      )}
      {tab === 'tageb' && <TagebuchTab data={data} setData={setData} onPrint={() => doPrint('tagebuch')} />}

      {printMode === 'kraefte' && <PrintKraefte data={data} />}
      {printMode === 'tagebuch' && <PrintTagebuch data={data} />}

      <TweaksPanel>
        <TweakSection label="Darstellung" />
        <TweakRadio label="Modus" value={t.theme} options={['light', 'dark']} onChange={(v) => setTweak('theme', v)} />
        <TweakRadio label="Dichte" value={t.density} options={['compact', 'regular', 'comfy']} onChange={(v) => setTweak('density', v)} />
        <TweakSection label="Kraeftekachel" />
        <TweakToggle label="FMS-Status anzeigen" value={t.showFms} onChange={(v) => setTweak('showFms', v)} />
        <TweakToggle label="Funkrufname anzeigen" value={t.showFunkruf} onChange={(v) => setTweak('showFunkruf', v)} />
        <TweakSlider label="Abloeseschwelle" value={t.ablThreshold} min={2} max={24} step={1} unit=" h" onChange={(v) => setTweak('ablThreshold', v)} />
      </TweaksPanel>

      <Modal
        open={aboutOpen}
        title="Hinweise & Quellen"
        onClose={() => setAboutOpen(false)}
        footer={<button className="btn primary" onClick={() => setAboutOpen(false)}>Schliessen</button>}
        width={620}
      >
        <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-soft)', display: 'grid', gap: 10 }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Datenhaltung.</strong> Alle Eingaben werden lokal im Browser gepuffert
            und parallel in Firebase Firestore gespeichert. Dadurch bleibt der Stand nach Browser-Schliessen, Neustart
            oder Geraetewechsel erhalten, solange die Cloud-Synchronisierung erreichbar ist.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Empfehlung.</strong> Am Ende jeder Lagebesprechung sowie beim Schichtwechsel
            weiterhin eine <em>Sicherungskopie</em> als JSON-Datei exportieren und im Stabsordner ablegen.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Zugang.</strong> Die vorgeschaltete Passwortmaske ist fuer den morgigen Einsatz
            als einfache Huerde gedacht. Sie ersetzt keine vollwertige Benutzerverwaltung.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: 'var(--text)' }}>Taktische Zeichen.</strong> Vereinfachte Darstellung nach
            FwDV 100 / BBK "Taktische Zeichen": Grundzeichen (Form), Fachaufgabe (Farbe) und Verbandskennzeichen (Punkte/Striche).
            Diese App ist eine Arbeitshilfe - kein Ersatz fuer ein behoerdlich gefuehrtes Original-Tagebuch.
          </p>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 12 }}>
            Formularstruktur orientiert sich an der Vorlage "Einsatztagebuch der Einsatzleitung" (IdF NRW, Kapitel I).
          </p>
        </div>
      </Modal>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
