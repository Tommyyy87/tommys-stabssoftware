(function syncLogicInit(globalScope) {
  function tsOf(iso) {
    const ms = Date.parse(iso || '');
    return Number.isFinite(ms) ? ms : 0;
  }

  function planBootstrapSync(localState, remoteState) {
    if (!remoteState) {
      return {
        preferredState: localState,
        preferredSource: 'local',
        skipInitialPersist: false,
      };
    }

    const localTs = tsOf(localState?.meta?.updatedAt);
    const remoteTs = tsOf(remoteState?.meta?.updatedAt);
    const preferLocal = localTs > remoteTs;

    return {
      preferredState: preferLocal ? localState : remoteState,
      preferredSource: preferLocal ? 'local' : 'remote',
      skipInitialPersist: !preferLocal,
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { planBootstrapSync, tsOf };
  }

  globalScope.planBootstrapSync = planBootstrapSync;
})(typeof window !== 'undefined' ? window : globalThis);
