// Script de test pour le système de mise à jour
// Ce script simule une nouvelle version pour tester les mises à jour

const { autoUpdater } = require('electron-updater');

console.log('Test du système de mise à jour...');

// Configuration pour les tests
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'Syloww',
  repo: 'app'
});

// Écouter les événements
autoUpdater.on('checking-for-update', () => {
  console.log('✓ Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
  console.log('✓ Mise à jour disponible:', info.version);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✓ Aucune mise à jour disponible');
});

autoUpdater.on('error', (err) => {
  console.error('✗ Erreur:', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`✓ Téléchargement: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✓ Mise à jour téléchargée:', info.version);
});

// Tester la vérification des mises à jour
console.log('Test de vérification des mises à jour...');
autoUpdater.checkForUpdatesAndNotify().then(() => {
  console.log('Test terminé');
}).catch(err => {
  console.error('Erreur lors du test:', err);
});
