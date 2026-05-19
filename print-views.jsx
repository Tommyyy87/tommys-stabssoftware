// print-views.jsx — Druckaufbereitete Ansichten für Kräfteübersicht und Tagebuch

function PrintHeader({ data, titel, blattInfo }) {
  const e = data.einsatz || {};
  const tbFhr = (data.funktionen || {}).tagebuch || {};
  const el    = (data.funktionen || {}).einsatzleiter || {};
  return (
    <header className="print-header">
      <div className="print-header-left">
        <img src="assets/biv-logo.png" alt="BIV 26/06" />
        <div>
          <div className="print-h-1">BIV 26/06</div>
          <div className="print-h-2">Stabsunterstützung von Tommy</div>
        </div>
      </div>
      <div className="print-header-center">
        <div className="print-titel">{titel}</div>
        <div className="print-sub">
          <span><strong>Einsatz-Nr.:</strong> {e.nummer || '—'}</span>
          <span><strong>Stichwort:</strong> {e.stichwort || '—'}</span>
          <span><strong>Stufe:</strong> {e.fuehrungsstufe || '—'}</span>
        </div>
        <div className="print-sub">
          <span><strong>Ort:</strong> {e.ort || '—'}</span>
          <span><strong>EL:</strong> {[el.dienstgrad, el.name].filter(Boolean).join(' ') || '—'}</span>
        </div>
      </div>
      <div className="print-header-right">
        <div className="print-meta">
          <div><strong>Druck:</strong> {fmtDate(nowISO())}</div>
          {blattInfo && <div><strong>{blattInfo}</strong></div>}
          {tbFhr.name && <div><strong>Tagebuchf.:</strong> {[tbFhr.dienstgrad, tbFhr.name].filter(Boolean).join(' ')}</div>}
        </div>
      </div>
    </header>
  );
}

// ===== Kräfteübersicht (Druck) =====
function PrintKraefte({ data }) {
  const summary = summarizeKraefte(data);

  const renderKraftRow = (k) => (
    <tr key={k.id}>
      <td className="col-tz"><TaktischesZeichen fach={k.fach} form={k.form} groesse={k.groesse} text={k.text} size="sm" /></td>
      <td className="col-name">
        <div className="bold">{k.name || k.text || '—'}</div>
        <div className="mono small">{k.funkruf || '—'}</div>
      </td>
      <td className="col-stk mono small">{k.staerke ? staerkeAnzeige(k.staerke) : ''}</td>
      <td className="col-dauer mono small">
        {k.einsatzSeit && <div>Einsatz: <strong>{dauerStr(k.einsatzSeit)}</strong></div>}
        {k.eaSince && <div>im EA: <strong>{dauerStr(k.eaSince)}</strong></div>}
      </td>
      <td className="col-fms"><span className={`fms-cell fms-${k.fms || '2'}`}>{(k.fms || '2').toUpperCase()}</span></td>
      <td className="col-bem">{k.bemerkung || ''}</td>
    </tr>
  );

  return (
    <div className="print-area print-kraefte">
      <div className="print-watermark" aria-hidden="true">
        <img src="assets/biv-logo.png" alt="" />
      </div>
      <PrintHeader
        data={data}
        titel="Kräfteübersicht"
        blattInfo={`${summary.abschnittCount} EA · ${summary.zugeordneteKraefte}/${summary.gesamtKraefte} Einh. · ${summary.zugeordnetesPersonal}/${summary.gesamtPersonal} Pers.`}
      />

      <div className="print-grid">
        {summary.abschnitte.map(ea => (
          <section className="print-ea" key={ea.id}>
            <header className="print-ea-head" style={{ borderLeftColor: ea.farbe || '#0E1F3D' }}>
              <h3>{ea.name}</h3>
              <div className="print-ea-meta">
                <span>Leiter: <strong>{ea.leiter || '—'}</strong></span>
                <span>{ea.kraefteCount} Kräfte</span>
                <span>{ea.personalCount} Pers.</span>
              </div>
            </header>
            {ea.kraefteCount === 0 ? (
              <div className="print-empty">— keine Kräfte zugeordnet —</div>
            ) : (
              <table className="print-table">
                <thead>
                  <tr>
                    <th className="col-tz">Zeichen</th>
                    <th className="col-name">Einheit / Funkrufname</th>
                    <th className="col-stk">Stärke</th>
                    <th className="col-dauer">Dauer</th>
                    <th className="col-fms">FMS</th>
                    <th className="col-bem">Bemerkung</th>
                  </tr>
                </thead>
                <tbody>
                  {ea.kraefte.map(renderKraftRow)}
                </tbody>
              </table>
            )}
          </section>
        ))}

        {summary.poolKraefte > 0 && (
          <section className="print-ea print-pool">
            <header className="print-ea-head" style={{ borderLeftColor: '#9097a8' }}>
              <h3>Pool · nicht zugeordnet</h3>
              <div className="print-ea-meta">
                <span>{summary.poolKraefte} Kräfte</span>
                <span>{summary.poolPersonal} Pers.</span>
              </div>
            </header>
            <table className="print-table">
              <thead>
                <tr>
                  <th className="col-tz">Zeichen</th>
                  <th className="col-name">Einheit / Funkrufname</th>
                  <th className="col-stk">Stärke</th>
                  <th className="col-dauer">Dauer</th>
                  <th className="col-fms">FMS</th>
                  <th className="col-bem">Bemerkung</th>
                </tr>
              </thead>
              <tbody>{summary.pool.map(renderKraftRow)}</tbody>
            </table>
          </section>
        )}
      </div>

      <section className="print-summary">
        <div className="print-summary-card">
          <span className="print-summary-label">Einsatzabschnitte</span>
          <strong>{summary.abschnittCount}</strong>
        </div>
        <div className="print-summary-card">
          <span className="print-summary-label">Zugeordnete Kräfte</span>
          <strong>{summary.zugeordneteKraefte}</strong>
        </div>
        <div className="print-summary-card">
          <span className="print-summary-label">Personal in Abschnitten</span>
          <strong>{summary.zugeordnetesPersonal}</strong>
        </div>
        <div className="print-summary-card">
          <span className="print-summary-label">Pool / nicht zugeordnet</span>
          <strong>{summary.poolKraefte} Kräfte · {summary.poolPersonal} Pers.</strong>
        </div>
        <div className="print-summary-card print-summary-total">
          <span className="print-summary-label">Gesamtpersonenzahl</span>
          <strong>{summary.gesamtPersonal}</strong>
        </div>
      </section>

      <footer className="print-foot">
        BIV 26/06 · Stabsunterstützung von Tommy · Kräfteübersicht — automatisch generiert
      </footer>
    </div>
  );
}

// ===== Einsatztagebuch (Druck) =====
function PrintTagebuch({ data }) {
  const entries = [...(data.tagebuch || [])].sort((a,b) => (a.nr||0) - (b.nr||0));
  return (
    <div className="print-area print-tagebuch">
      <div className="print-watermark" aria-hidden="true">
        <img src="assets/biv-logo.png" alt="" />
      </div>
      <PrintHeader data={data} titel="Einsatztagebuch der Einsatzleitung" blattInfo={`${entries.length} Einträge`} />

      <table className="print-table tb">
        <thead>
          <tr>
            <th className="col-nr">lfd.</th>
            <th className="col-time">Datum / Uhrzeit</th>
            <th className="col-typ">Typ</th>
            <th className="col-kanal">Kanal</th>
            <th className="col-von">Von</th>
            <th className="col-an">An</th>
            <th>Inhalt — Ereignis, Beurteilung, Entschluss, Maßnahme</th>
            <th className="col-anlage">Anlage</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr><td colSpan={8} className="print-empty">— keine Einträge —</td></tr>
          ) : entries.map(e => (
            <tr key={e.id}>
              <td className="mono r">{e.nr}</td>
              <td className="mono">{fmtDate(e.ts)}</td>
              <td><span className={`typ-cell typ-${e.typ}`}>{e.typ}</span></td>
              <td className="mono small">{e.kanal || ''}</td>
              <td className="small">{e.von || ''}</td>
              <td className="small">{e.an || ''}</td>
              <td className="inhalt">{e.inhalt || ''}</td>
              <td className="small">{e.anlage || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="print-foot">
        <div className="sig-row">
          <div className="sig">
            <div className="sig-line"></div>
            <div className="sig-label">Einsatztagebuchführer (Name, Dienstgrad, Unterschrift)</div>
          </div>
          <div className="sig">
            <div className="sig-line"></div>
            <div className="sig-label">Einsatzleiter (Name, Dienstgrad, Unterschrift)</div>
          </div>
        </div>
        <div className="print-foot-meta">
          BIV 26/06 · Stabsunterstützung von Tommy · Einsatztagebuch — automatisch generiert
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { PrintKraefte, PrintTagebuch });
