(function syncLogicInit(globalScope) {
  function tsOf(iso) {
    const ms = Date.parse(iso || "");
    return Number.isFinite(ms) ? ms : 0;
  }

  function hasSubstantiveState(state) {
    const einsatz = state?.einsatz || {};
    const hasEinsatzDetails = [
      einsatz.nummer,
      einsatz.stichwort,
      einsatz.ort,
      einsatz.befehlsstelle,
      einsatz.leitstelle,
      einsatz.anordnung,
      einsatz.uebernommen,
      einsatz.lage,
    ].some((value) => typeof value === "string" && value.trim());

    const hasNonDefaultFuehrungsstufe =
      typeof einsatz.fuehrungsstufe === "string" &&
      einsatz.fuehrungsstufe.trim() &&
      einsatz.fuehrungsstufe !== "C";

    return (
      hasEinsatzDetails ||
      hasNonDefaultFuehrungsstufe ||
      Object.keys(state?.funktionen || {}).length > 0 ||
      Object.keys(state?.kraefte || {}).length > 0 ||
      Object.keys(state?.einsatzabschnitte || {}).length > 0 ||
      (state?.tagebuch || []).length > 0
    );
  }

  function shouldWriteStateToCloud(state, options = {}) {
    if (hasSubstantiveState(state)) return true;
    return !!options.allowEmptyReset;
  }

  function planBootstrapSync(localState, remoteState) {
    if (!remoteState) {
      return {
        preferredState: localState,
        preferredSource: "local",
        skipInitialPersist: false,
      };
    }

    const localHasData = hasSubstantiveState(localState);
    const remoteHasData = hasSubstantiveState(remoteState);

    if (!localHasData && remoteHasData) {
      return {
        preferredState: remoteState,
        preferredSource: "remote",
        skipInitialPersist: true,
      };
    }

    if (localHasData && !remoteHasData) {
      return {
        preferredState: localState,
        preferredSource: "local",
        skipInitialPersist: false,
      };
    }

    const localTs = tsOf(localState?.meta?.updatedAt);
    const remoteTs = tsOf(remoteState?.meta?.updatedAt);
    const preferLocal = localTs > remoteTs;

    return {
      preferredState: preferLocal ? localState : remoteState,
      preferredSource: preferLocal ? "local" : "remote",
      skipInitialPersist: !preferLocal,
    };
  }

  function shouldDeferCloudBootstrap(snapshotLike) {
    return !snapshotLike?.exists && !!snapshotLike?.metadata?.fromCache;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      planBootstrapSync,
      shouldDeferCloudBootstrap,
      shouldWriteStateToCloud,
      tsOf,
      hasSubstantiveState,
    };
  }

  globalScope.planBootstrapSync = planBootstrapSync;
  globalScope.shouldDeferCloudBootstrap = shouldDeferCloudBootstrap;
  globalScope.shouldWriteStateToCloud = shouldWriteStateToCloud;
})(typeof window !== "undefined" ? window : globalThis);
