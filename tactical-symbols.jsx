// tactical-symbols.jsx
// Taktische Zeichen nach FwDV 100 / BBK – vereinfacht.
//
// Aufbau (BBK / FwDV 100):
//   • Grundzeichen — Form & Farbe nach Organisation / Aufgabengebiet
//     - Taktische Formation: Rechteck (Einheit)
//     - Person/Führung:      Kreis (klein) - hier vereinfacht in Rechteck integriert
//     - Stelle / Einrichtung:Dreieck (Spitze oben)
//     - Maßnahme:            Dreieck (Spitze unten)
//     - Fahrzeug:            Rechteck mit "Reifen" / Schräglinie unten
//   • Verbandskennzeichen (oberhalb)
//     - Trupp:     1 Punkt
//     - Staffel:   2 Punkte
//     - Gruppe:    3 Punkte
//     - Zug:       1 Strich
//     - Bereit.:   1 Punkt + 1 Strich
//     - Verband:   2 Striche
//     - Abteilung: 3 Striche
//   • Fachaufgabe (innen) — Buchstaben/Symbole für die Funktion
//
// Quellen: PDV/DV 102 + FwDV 100 + BBK "Taktische Zeichen", öffentliche Lehrmittel.
// Implementiert als generisches Rechteck mit Farb-Code + Kürzel + Größen-Marker.

const FACH_COLORS = {
  brand:       { bg: '#dc2626', fg: '#fff' },  // Brandbekämpfung (rot)
  feuerwehr:   { bg: '#dc2626', fg: '#fff' },
  th:          { bg: '#1d4ed8', fg: '#fff' },  // Techn. Hilfeleistung / THW (blau)
  thw:         { bg: '#1d4ed8', fg: '#fff' },
  abc:         { bg: '#f2b30b', fg: '#1a1a1a' }, // ABC (gelb)
  rd:          { bg: '#ee5a24', fg: '#fff' },  // Rettungsdienst (orange)
  san:         { bg: '#ee5a24', fg: '#fff' },
  betreuung:   { bg: '#3aa164', fg: '#fff' },
  versorgung:  { bg: '#3aa164', fg: '#fff' },
  polizei:     { bg: '#1e7d3b', fg: '#fff' },
  fuehrung:    { bg: '#ffffff', fg: '#0d141f', border: '#0d141f' }, // Führung (weiß)
  wasserrett:  { bg: '#1d4ed8', fg: '#fff' },
  logistik:    { bg: '#3aa164', fg: '#fff' },
  sonst:       { bg: '#e7ebf3', fg: '#0d141f', border: '#0d141f' },
};

// Größen-Marker (Verbandskennzeichen) – oberhalb des Grundzeichens
function GroessenMarker({ size, color, w = 56 }) {
  // size: 'trupp'|'staffel'|'gruppe'|'zug'|'bereitschaft'|'verband'|'abteilung'
  if (!size || size === 'keine') return null;
  const stroke = color || '#0d141f';

  const dots = { trupp: 1, staffel: 2, gruppe: 3 };
  if (dots[size]) {
    const n = dots[size];
    const r = 2.4;
    const gap = 7;
    const totalW = (n - 1) * gap;
    return (
      <g transform={`translate(${w/2 - totalW/2}, -6)`}>
        {Array.from({ length: n }).map((_, i) => (
          <circle key={i} cx={i * gap} cy={0} r={r} fill={stroke} />
        ))}
      </g>
    );
  }

  if (size === 'zug') {
    return <line x1={w/2 - 8} x2={w/2 + 8} y1={-6} y2={-6} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />;
  }
  if (size === 'bereitschaft') {
    return (
      <g>
        <circle cx={w/2 - 8} cy={-6} r={2.4} fill={stroke} />
        <line x1={w/2} x2={w/2 + 14} y1={-6} y2={-6} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  if (size === 'verband') {
    return (
      <g>
        <line x1={w/2 - 13} x2={w/2 - 3} y1={-6} y2={-6} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        <line x1={w/2 + 3}  x2={w/2 + 13} y1={-6} y2={-6} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  if (size === 'abteilung') {
    return (
      <g>
        <line x1={w/2 - 18} x2={w/2 - 8} y1={-6} y2={-6} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        <line x1={w/2 - 5}  x2={w/2 + 5}  y1={-6} y2={-6} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
        <line x1={w/2 + 8}  x2={w/2 + 18} y1={-6} y2={-6} stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  return null;
}

// Fahrzeug-Indikator: kleine "Räder" / schräglinien unten am Rechteck
function FahrzeugMarker({ w, h, color }) {
  return (
    <g>
      <circle cx={w * 0.25} cy={h + 4} r="2.8" fill={color} />
      <circle cx={w * 0.75} cy={h + 4} r="2.8" fill={color} />
    </g>
  );
}

// Hauptkomponente
function TaktischesZeichen({
  fach = 'feuerwehr',     // welche Aufgabe / Farbe
  groesse = 'gruppe',     // Verbandskennzeichen
  form = 'einheit',       // 'einheit' | 'fahrzeug' | 'einrichtung' | 'massnahme' | 'person'
  text = '',              // innerer Text (z.B. "LF20", "GW-S", "EL")
  size = 'md',            // 'sm' | 'md' | 'lg'
  title,                  // tooltip
}) {
  const colors = FACH_COLORS[fach] || FACH_COLORS.sonst;
  const dims = {
    sm: { w: 44, h: 28, fs: 11 },
    md: { w: 56, h: 36, fs: 13 },
    lg: { w: 80, h: 50, fs: 17 },
  }[size];
  const { w, h, fs } = dims;
  const pad = 12; // oben für Verbandskennz., unten für Fahrzeug-Marker
  const totalW = w + 12;
  const totalH = h + pad + 8;

  return (
    <span className="tz" title={title}>
      <svg width={totalW} height={totalH} viewBox={`-6 -${pad} ${totalW} ${totalH}`}>
        {/* Verbandskennzeichen */}
        <GroessenMarker size={groesse} color={colors.border || colors.bg} w={w} />

        {/* Grundzeichen */}
        {form === 'einrichtung' && (
          <polygon
            points={`${w/2},0 ${w},${h} 0,${h}`}
            fill={colors.bg}
            stroke={colors.border || '#0d141f'}
            strokeWidth="1.4"
          />
        )}
        {form === 'massnahme' && (
          <polygon
            points={`0,0 ${w},0 ${w/2},${h}`}
            fill={colors.bg}
            stroke={colors.border || '#0d141f'}
            strokeWidth="1.4"
          />
        )}
        {form === 'person' && (
          <ellipse
            cx={w/2} cy={h/2} rx={w/2 - 2} ry={h/2 - 2}
            fill={colors.bg}
            stroke={colors.border || '#0d141f'}
            strokeWidth="1.4"
          />
        )}
        {(form === 'einheit' || form === 'fahrzeug') && (
          <rect
            x="0" y="0" width={w} height={h}
            fill={colors.bg}
            stroke={colors.border || '#0d141f'}
            strokeWidth="1.4"
            rx="1.5"
          />
        )}

        {/* Text innen */}
        {text && (
          <text
            x={w/2} y={h/2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="700"
            fontSize={text.length > 4 ? fs - 2 : fs}
            fill={colors.fg}
            letterSpacing="0.02em"
          >
            {text}
          </text>
        )}

        {/* Fahrzeug-Räder */}
        {form === 'fahrzeug' && <FahrzeugMarker w={w} h={h} color={colors.border || colors.bg} />}
      </svg>
    </span>
  );
}

// Vordefinierte Kraft-Typen (für Quick-Add-Pool)
// kategorie: 'verband' | 'einheit' | 'fahrzeug' | 'fuehrung' | 'person'
//   Im Stab (Führungsstufe C/D) werden in der Regel ganze Einheiten geführt,
//   nicht Einzelfahrzeuge – Verbände/Bereitschaften/Züge stehen daher zuerst.
// staerke: "1/0/8" (Führer / Unterführer / Mannschaften) – Gesamt wird daraus berechnet.
const KRAFT_TYPEN = [
  // ─── Großverbände (Stufe D / überörtl. Hilfe) ────────────────────────────
  { key: 'VB',     kategorie: 'verband',  label: 'Verband',                     fach: 'feuerwehr', form: 'einheit',  groesse: 'verband',     text: 'VB',     staerke: '12/0/100' },
  { key: 'BVR',    kategorie: 'verband',  label: 'Bereitschaft (4 Züge)',       fach: 'feuerwehr', form: 'einheit',  groesse: 'bereitschaft',text: 'BVR',    staerke: '4/0/120' },
  { key: 'BVR-RD', kategorie: 'verband',  label: 'Bereitschaft Rettungsdienst', fach: 'rd',        form: 'einheit',  groesse: 'bereitschaft',text: 'BVR-RD', staerke: '4/0/60' },
  { key: 'THW-BV', kategorie: 'verband',  label: 'THW Bereitschaft',            fach: 'thw',       form: 'einheit',  groesse: 'bereitschaft',text: 'BV',     staerke: '4/0/100' },

  // ─── Züge ─────────────────────────────────────────────────────────────────
  { key: 'LZ',     kategorie: 'einheit', label: 'Löschzug',                     fach: 'feuerwehr', form: 'einheit',  groesse: 'zug',         text: 'LZ',     staerke: '1/3/18' },
  { key: 'LZ-V',   kategorie: 'einheit', label: 'Verstärkter Löschzug',         fach: 'feuerwehr', form: 'einheit',  groesse: 'zug',         text: 'LZ-V',   staerke: '1/4/22' },
  { key: 'TZ',     kategorie: 'einheit', label: 'Technischer Zug (Rüst)',       fach: 'th',        form: 'einheit',  groesse: 'zug',         text: 'TZ',     staerke: '1/3/16' },
  { key: 'GZ',     kategorie: 'einheit', label: 'Gefahrgutzug (ABC)',           fach: 'abc',       form: 'einheit',  groesse: 'zug',         text: 'GZ',     staerke: '1/3/14' },
  { key: 'RDZ',    kategorie: 'einheit', label: 'Rettungsdienstzug',            fach: 'rd',        form: 'einheit',  groesse: 'zug',         text: 'RDZ',    staerke: '1/2/12' },
  { key: 'MANV',   kategorie: 'einheit', label: 'MANV-Komponente',              fach: 'rd',        form: 'einheit',  groesse: 'zug',         text: 'MANV',   staerke: '1/3/20' },
  { key: 'BTZ',    kategorie: 'einheit', label: 'Betreuungszug',                fach: 'betreuung', form: 'einheit',  groesse: 'zug',         text: 'BtZ',    staerke: '1/3/22' },
  { key: 'VPZ',    kategorie: 'einheit', label: 'Verpflegungszug',              fach: 'versorgung',form: 'einheit',  groesse: 'zug',         text: 'VpZ',    staerke: '1/3/18' },
  { key: 'THW-Z',  kategorie: 'einheit', label: 'THW Technischer Zug',          fach: 'thw',       form: 'einheit',  groesse: 'zug',         text: 'TZ',     staerke: '1/3/14' },
  { key: 'WRZ',    kategorie: 'einheit', label: 'Wasserrettungszug',            fach: 'wasserrett',form: 'einheit',  groesse: 'zug',         text: 'WRZ',    staerke: '1/3/14' },

  // ─── Gruppen / Staffeln / SEG ───────────────────────────────────────────
  { key: 'LG',     kategorie: 'einheit', label: 'Löschgruppe',                  fach: 'feuerwehr', form: 'einheit',  groesse: 'gruppe',      text: 'LG',     staerke: '1/2/6' },
  { key: 'LST',   kategorie: 'einheit', label: 'Löschstaffel',                 fach: 'feuerwehr', form: 'einheit',  groesse: 'staffel',     text: 'LSt',    staerke: '1/0/5' },
  { key: 'SEG-S',  kategorie: 'einheit', label: 'SEG Sanität',                  fach: 'san',       form: 'einheit',  groesse: 'gruppe',      text: 'SEG-S',  staerke: '1/2/9' },
  { key: 'SEG-B',  kategorie: 'einheit', label: 'SEG Betreuung',                fach: 'betreuung', form: 'einheit',  groesse: 'gruppe',      text: 'SEG-B',  staerke: '1/2/9' },
  { key: 'SEG-T',  kategorie: 'einheit', label: 'SEG Transport',                fach: 'rd',        form: 'einheit',  groesse: 'gruppe',      text: 'SEG-T',  staerke: '1/2/9' },
  { key: 'THW-BG', kategorie: 'einheit', label: 'THW Bergungsgruppe',           fach: 'thw',       form: 'einheit',  groesse: 'gruppe',      text: 'B',      staerke: '1/1/7' },
  { key: 'THW-FK', kategorie: 'einheit', label: 'THW Fachgruppe',               fach: 'thw',       form: 'einheit',  groesse: 'gruppe',      text: 'FGr',    staerke: '1/1/7' },

  // ─── Führungs-Stellen / Einrichtungen ───────────────────────────────────
  { key: 'EL',     kategorie: 'fuehrung', label: 'Einsatzleitung',              fach: 'fuehrung',  form: 'einrichtung', groesse: 'keine',    text: 'EL',     staerke: '' },
  { key: 'TEL',    kategorie: 'fuehrung', label: 'Technische Einsatzleitung',   fach: 'fuehrung',  form: 'einrichtung', groesse: 'keine',    text: 'TEL',    staerke: '' },
  { key: 'UA',     kategorie: 'fuehrung', label: 'Unterabschnitt',              fach: 'fuehrung',  form: 'einrichtung', groesse: 'keine',    text: 'UA',     staerke: '' },
  { key: 'BR',     kategorie: 'fuehrung', label: 'Bereitstellungsraum',         fach: 'fuehrung',  form: 'einrichtung', groesse: 'keine',    text: 'BR',     staerke: '' },
  { key: 'BHP',    kategorie: 'fuehrung', label: 'Behandlungsplatz',            fach: 'rd',        form: 'einrichtung', groesse: 'keine',    text: 'BHP',    staerke: '' },
  { key: 'PA',     kategorie: 'fuehrung', label: 'Patientenablage',             fach: 'rd',        form: 'einrichtung', groesse: 'keine',    text: 'PA',     staerke: '' },
  { key: 'BTP',    kategorie: 'fuehrung', label: 'Betreuungsplatz',             fach: 'betreuung', form: 'einrichtung', groesse: 'keine',    text: 'BtP',    staerke: '' },

  // ─── Einzelfahrzeuge (eingeklappt, nur falls benötigt) ────────────────
  { key: 'LF',    kategorie: 'fahrzeug', label: 'Löschgruppenfahrzeug',         fach: 'feuerwehr', form: 'fahrzeug', groesse: 'gruppe',  text: 'LF',     staerke: '1/2/6' },
  { key: 'HLF',   kategorie: 'fahrzeug', label: 'Hilfeleistungs-LF',            fach: 'feuerwehr', form: 'fahrzeug', groesse: 'gruppe',  text: 'HLF',    staerke: '1/2/6' },
  { key: 'TLF',   kategorie: 'fahrzeug', label: 'Tanklöschfahrzeug',            fach: 'feuerwehr', form: 'fahrzeug', groesse: 'staffel', text: 'TLF',    staerke: '1/0/2' },
  { key: 'DLK',   kategorie: 'fahrzeug', label: 'Drehleiter',                   fach: 'feuerwehr', form: 'fahrzeug', groesse: 'trupp',   text: 'DLK',    staerke: '1/0/2' },
  { key: 'RW',    kategorie: 'fahrzeug', label: 'Rüstwagen',                    fach: 'th',        form: 'fahrzeug', groesse: 'trupp',   text: 'RW',     staerke: '1/0/2' },
  { key: 'GW-G',  kategorie: 'fahrzeug', label: 'Gerätewagen Gefahrgut',        fach: 'abc',       form: 'fahrzeug', groesse: 'trupp',   text: 'GW-G',   staerke: '1/0/2' },
  { key: 'GW-L',  kategorie: 'fahrzeug', label: 'Gerätewagen Logistik',         fach: 'versorgung',form: 'fahrzeug', groesse: 'trupp',   text: 'GW-L',   staerke: '1/0/2' },
  { key: 'ELW1',  kategorie: 'fahrzeug', label: 'Einsatzleitwagen 1',           fach: 'fuehrung',  form: 'fahrzeug', groesse: 'trupp',   text: 'ELW1',   staerke: '1/0/2' },
  { key: 'ELW2',  kategorie: 'fahrzeug', label: 'Einsatzleitwagen 2',           fach: 'fuehrung',  form: 'fahrzeug', groesse: 'staffel', text: 'ELW2',   staerke: '1/2/5' },
  { key: 'MTW',   kategorie: 'fahrzeug', label: 'Mannschaftstransport',         fach: 'feuerwehr', form: 'fahrzeug', groesse: 'gruppe',  text: 'MTW',    staerke: '1/0/8' },
  { key: 'RTW',   kategorie: 'fahrzeug', label: 'Rettungswagen',                fach: 'rd',        form: 'fahrzeug', groesse: 'trupp',   text: 'RTW',    staerke: '0/0/2' },
  { key: 'NEF',   kategorie: 'fahrzeug', label: 'Notarzteinsatzfahrzeug',       fach: 'rd',        form: 'fahrzeug', groesse: 'trupp',   text: 'NEF',    staerke: '0/0/2' },
  { key: 'KTW',   kategorie: 'fahrzeug', label: 'Krankentransportwagen',        fach: 'rd',        form: 'fahrzeug', groesse: 'trupp',   text: 'KTW',    staerke: '0/0/2' },

  // ─── Personen / Funktionsträger ──────────────────────────────────────
  { key: 'ZFhr',  kategorie: 'person',   label: 'Zugführer',                    fach: 'feuerwehr', form: 'person',   groesse: 'zug',     text: 'ZF',     staerke: '1/0/0' },
  { key: 'VbFhr', kategorie: 'person',   label: 'Verbandführer',                fach: 'feuerwehr', form: 'person',   groesse: 'verband', text: 'VbF',    staerke: '1/0/0' },
  { key: 'LNA',   kategorie: 'person',   label: 'Leitender Notarzt',            fach: 'rd',        form: 'person',   groesse: 'keine',   text: 'LNA',    staerke: '1/0/0' },
  { key: 'OrgL',  kategorie: 'person',   label: 'OrgL Rettungsdienst',          fach: 'rd',        form: 'person',   groesse: 'keine',   text: 'OrgL',   staerke: '1/0/0' },
  { key: 'FaBe',  kategorie: 'person',   label: 'Fachberater',                  fach: 'fuehrung',  form: 'person',   groesse: 'keine',   text: 'FB',     staerke: '1/0/0' },
];

const KATEGORIEN = [
  { key: 'verband',  label: 'Verbände / Bereitschaften', hint: 'Stab D — überörtliche Hilfe' },
  { key: 'einheit',  label: 'Züge & Gruppen',             hint: 'Standard im Stab' },
  { key: 'fuehrung', label: 'Führungsstellen',            hint: 'EL / TEL / Abschnitte' },
  { key: 'person',   label: 'Funktionsträger',            hint: 'Personen mit Funktion' },
  { key: 'fahrzeug', label: 'Einzelfahrzeuge',            hint: 'Nur bei kleiner Lage / Stufe A–B' },
];

const FACH_OPTIONS = [
  ['feuerwehr', 'Brandbekämpfung (rot)'],
  ['th',        'Techn. Hilfeleistung (blau)'],
  ['abc',       'ABC (gelb)'],
  ['rd',        'Rettungsdienst (orange)'],
  ['betreuung', 'Betreuung/Versorgung (grün)'],
  ['polizei',   'Polizei (grün)'],
  ['fuehrung',  'Führung (weiß)'],
  ['sonst',     'Sonstige'],
];

const FORM_OPTIONS = [
  ['einheit',     'Taktische Einheit (Rechteck)'],
  ['fahrzeug',    'Fahrzeug (Rechteck + Räder)'],
  ['einrichtung', 'Stelle/Einrichtung (Dreieck ▲)'],
  ['massnahme',   'Maßnahme (Dreieck ▼)'],
  ['person',      'Person (Oval)'],
];

const GROESSE_OPTIONS = [
  ['keine',        '— ohne —'],
  ['trupp',        'Trupp (•)'],
  ['staffel',      'Staffel (••)'],
  ['gruppe',       'Gruppe (•••)'],
  ['zug',          'Zug (—)'],
  ['bereitschaft', 'Bereitschaft (•—)'],
  ['verband',      'Verband (— —)'],
  ['abteilung',    'Abteilung (— — —)'],
];

// Personalstärke-Summe aus "a/b/c" berechnen
function staerkeGesamt(s) {
  if (!s) return 0;
  const parts = String(s).split('/').map(x => parseInt(x.trim(), 10)).filter(n => !isNaN(n));
  return parts.reduce((a, b) => a + b, 0);
}
function staerkeAnzeige(s) {
  if (!s) return '';
  const g = staerkeGesamt(s);
  return g ? `${s} = ${g}` : s;
}

Object.assign(window, {
  TaktischesZeichen, KRAFT_TYPEN, KATEGORIEN, FACH_OPTIONS, FORM_OPTIONS, GROESSE_OPTIONS, FACH_COLORS,
  staerkeGesamt, staerkeAnzeige,
});
