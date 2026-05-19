(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
    return;
  }

  const api = factory();
  Object.assign(root, api);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function normalizePart(value) {
    const num = Number.parseInt(String(value ?? "").trim(), 10);
    return Number.isFinite(num) && num > 0 ? num : 0;
  }

  function parseStaerkeParts(value) {
    const raw = String(value ?? "").split("/");
    return {
      f: normalizePart(raw[0]),
      u: normalizePart(raw[1]),
      m: normalizePart(raw[2]),
    };
  }

  function formatStaerkeFromParts(parts) {
    const normalized = parseStaerkeParts(
      [parts?.f ?? 0, parts?.u ?? 0, parts?.m ?? 0].join("/"),
    );
    return `${normalized.f}/${normalized.u}/${normalized.m}`;
  }

  function staerkeGesamt(value) {
    const parts = parseStaerkeParts(value);
    return parts.f + parts.u + parts.m;
  }

  function staerkeAnzeige(value) {
    if (!value) return "";
    const normalized = formatStaerkeFromParts(parseStaerkeParts(value));
    const total = staerkeGesamt(normalized);
    return `${normalized} = ${total}`;
  }

  function summarizeKraefte(data) {
    const kraefte = data?.kraefte || {};
    const eas = data?.einsatzabschnitte || {};
    const abschnitte = Object.values(eas)
      .sort((a, b) => (a.ordnung || 0) - (b.ordnung || 0))
      .map((ea) => ({
        ...ea,
        kraefte: [],
        kraefteCount: 0,
        personalCount: 0,
      }));

    const byId = {};
    abschnitte.forEach((ea) => {
      byId[ea.id] = ea;
    });

    const pool = [];
    Object.values(kraefte).forEach((kraft) => {
      const target = kraft?.ea ? byId[kraft.ea] : null;
      if (target) {
        target.kraefte.push(kraft);
        target.kraefteCount += 1;
        target.personalCount += staerkeGesamt(kraft.staerke);
        return;
      }
      pool.push(kraft);
    });

    const poolPersonal = pool.reduce(
      (sum, kraft) => sum + staerkeGesamt(kraft.staerke),
      0,
    );
    const zugeordneteKraefte = abschnitte.reduce(
      (sum, ea) => sum + ea.kraefteCount,
      0,
    );
    const zugeordnetesPersonal = abschnitte.reduce(
      (sum, ea) => sum + ea.personalCount,
      0,
    );

    return {
      abschnitte,
      abschnittCount: abschnitte.length,
      pool,
      poolKraefte: pool.length,
      poolPersonal,
      gesamtKraefte: Object.keys(kraefte).length,
      gesamtPersonal: Object.values(kraefte).reduce(
        (sum, kraft) => sum + staerkeGesamt(kraft.staerke),
        0,
      ),
      zugeordneteKraefte,
      zugeordnetesPersonal,
    };
  }

  function stripDraftFlags(kraft) {
    if (!kraft || typeof kraft !== "object") return kraft;
    const { isNew, ...rest } = kraft;
    return rest;
  }

  return {
    parseStaerkeParts,
    formatStaerkeFromParts,
    staerkeGesamt,
    staerkeAnzeige,
    summarizeKraefte,
    stripDraftFlags,
  };
});
