// components.jsx — Shared UI primitives

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// ---- Modal --------------------------------------------------------------
function Modal({ open, title, children, onClose, footer, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="modal" style={{ maxWidth: width }}>
        <div className="modal-head">{title}</div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ---- Confirm dialog -----------------------------------------------------
function useConfirm() {
  const [state, setState] = useState(null); // { title, body, onYes }
  const node = state ? (
    <Modal
      open
      title={state.title}
      onClose={() => setState(null)}
      footer={
        <>
          <button className="btn" onClick={() => setState(null)}>Abbrechen</button>
          <button className="btn danger" onClick={() => { state.onYes(); setState(null); }}>{state.yesLabel || 'Bestätigen'}</button>
        </>
      }
    >
      <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-soft)' }}>{state.body}</div>
    </Modal>
  ) : null;
  const ask = (opts) => setState(opts);
  return [node, ask];
}

// ---- FMS Status pill ----------------------------------------------------
const FMS_LABELS = {
  '1': 'Frei über Funk',
  '2': 'Frei auf Wache',
  '3': 'Einsatz übernommen',
  '4': 'Am Einsatzort',
  '5': 'Sprechwunsch',
  '6': 'Außer Dienst',
  'c': 'Notruf / Voll',
};
function FmsPill({ value, onChange }) {
  return (
    <select
      className="select"
      value={value || '2'}
      onChange={(e) => onChange && onChange(e.target.value)}
      title={FMS_LABELS[value] || ''}
      style={{
        width: 'auto', padding: '2px 4px',
        fontFamily: 'var(--font-mono)', fontWeight: 600,
        textAlign: 'center',
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {Object.entries(FMS_LABELS).map(([k, lbl]) => (
        <option key={k} value={k}>{k.toUpperCase()} – {lbl}</option>
      ))}
    </select>
  );
}

// ---- Tiny inline icon ---------------------------------------------------
const I = {
  plus:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  trash:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>,
  x:       (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M6 6l12 12M6 18L18 6"/></svg>,
  download:(p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v12M6 11l6 6 6-6M5 21h14"/></svg>,
  upload:  (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21V9M6 13l6-6 6 6M5 3h14"/></svg>,
  check:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>,
  edit:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9M4 20h2l11-11-3-3L3 17v3z"/></svg>,
  lock:    (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>,
  unlock:  (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1"/></svg>,
  clock:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  printer: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="1.5"/><path d="M6 14h12v7H6z"/></svg>,
};

// ---- Helpers ------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function nowISO() {
  return new Date().toISOString();
}
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInputValue(v) {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString();
}

// ---- Dauer-Helpers -------------------------------------------------------
function dauerMinuten(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
}
function dauerStr(iso) {
  const m = dauerMinuten(iso);
  if (m === null) return '';
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm} min`;
  return `${h}h ${String(mm).padStart(2, '0')}m`;
}
// Level relativ zur Schwelle (in Stunden): ok | warn | crit | overdue
function dauerLevel(iso, thresholdH) {
  const m = dauerMinuten(iso);
  if (m === null) return null;
  const t = (thresholdH || 6) * 60;
  if (m < t * 0.5) return 'ok';
  if (m < t)       return 'warn';
  if (m < t * 1.25) return 'crit';
  return 'overdue';
}

// Re-render-Tick alle N ms (für laufende Zeitanzeigen)
function useTicker(intervalMs = 30000) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set(x => x + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

Object.assign(window, {
  Modal, useConfirm, FmsPill, FMS_LABELS, I,
  uid, nowISO, fmtDate, toLocalInputValue, fromLocalInputValue,
  dauerMinuten, dauerStr, dauerLevel, useTicker,
});
