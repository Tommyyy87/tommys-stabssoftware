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

  function shouldDeferCloudBootstrap(snapshotLike) {
    return !snapshotLike?.exists && !!snapshotLike?.metadata?.fromCache;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { planBootstrapSync, shouldDeferCloudBootstrap, tsOf };
  }

  globalScope.planBootstrapSync = planBootstrapSync;
  globalScope.shouldDeferCloudBootstrap = shouldDeferCloudBootstrap;
})(typeof window !== 'undefined' ? window : globalThis);
