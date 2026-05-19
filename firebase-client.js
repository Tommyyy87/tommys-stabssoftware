(function initFirebaseClient() {
  const config = {
    projectId: 'tommy-stabssoftware',
    appId: '1:719892067146:web:65a2b331e7691d5fc907b3',
    storageBucket: 'tommy-stabssoftware.firebasestorage.app',
    apiKey: 'AIzaSyDnWAJC3g9f1dFIZ3XiRHjFHNmuAHov2l4',
    authDomain: 'tommy-stabssoftware.firebaseapp.com',
    messagingSenderId: '719892067146',
    measurementId: 'G-4VSH3H0334',
  };

  if (!window.firebase) {
    console.error('Firebase SDK wurde nicht geladen.');
    return;
  }

  const app = window.firebase.apps.length
    ? window.firebase.app()
    : window.firebase.initializeApp(config);
  const db = window.firebase.firestore(app);

  db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    console.warn('Firestore-Persistenz konnte nicht aktiviert werden:', err);
  });

  window.EINSATZ_CLOUD = {
    app,
    db,
    docRef: db.collection('einsatztagebuch').doc('live'),
  };
})();
