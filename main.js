const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Configuration de l'auto-updater
autoUpdater.autoDownload = false; // Désactiver le téléchargement automatique
autoUpdater.autoInstallOnAppQuit = true; // Installer automatiquement à la fermeture

// Détection de la plateforme
const platform = process.platform;
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

// Configuration des options de mise à jour selon la plateforme
if (isWindows) {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Syloww',
    repo: 'app'
  });
} else if (isMac) {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Syloww',
    repo: 'app'
  });
} else if (isLinux) {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Syloww',
    repo: 'app'
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false, // Supprime la barre de titre par défaut
    titleBarStyle: 'hidden', // Cache la barre de titre système
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optionnel : ajouter une icône
    title: 'Suivi des Dépenses',
    show: false // Ne pas afficher immédiatement
  });
  
  mainWindow.loadFile('index.html');
  
  // Afficher la fenêtre une fois que le contenu est chargé
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  // Ouvrir les DevTools en mode développement
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Exposer l'API Electron au renderer
  mainWindow.webContents.executeJavaScript(`
    const { ipcRenderer } = require('electron');
    window.electronAPI = {
      minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
      toggleMaximizeWindow: () => ipcRenderer.invoke('window-toggle-maximize'),
      closeWindow: () => ipcRenderer.invoke('window-close'),
      checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
      downloadUpdate: () => ipcRenderer.invoke('download-update'),
      installUpdate: () => ipcRenderer.invoke('install-update')
    };
    
    // Écouter les événements de mise à jour
    ipcRenderer.on('update-available', (event, info) => {
      if (window.app && window.app.handleUpdateAvailable) {
        window.app.handleUpdateAvailable(info);
      }
    });
    
    ipcRenderer.on('update-error', (event, error) => {
      if (window.app && window.app.handleUpdateError) {
        window.app.handleUpdateError(error);
      }
    });
    
    ipcRenderer.on('download-progress', (event, progress) => {
      if (window.app && window.app.handleDownloadProgress) {
        window.app.handleDownloadProgress(progress);
      }
    });
    
    ipcRenderer.on('update-downloaded', (event, info) => {
      if (window.app && window.app.handleUpdateDownloaded) {
        window.app.handleUpdateDownloaded(info);
      }
    });
  `);

  return mainWindow;
}

// Variables globales pour la fenêtre principale
let mainWindow;

// Gestionnaires d'événements pour les mises à jour automatiques
autoUpdater.on('checking-for-update', () => {
  console.log('Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Mise à jour disponible:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Aucune mise à jour disponible:', info);
});

autoUpdater.on('error', (err) => {
  console.error('Erreur lors de la vérification des mises à jour:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Vitesse de téléchargement: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Téléchargé ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Mise à jour téléchargée:', info);
  
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
  
  // Afficher une boîte de dialogue pour proposer l'installation
  const response = dialog.showMessageBoxSync(mainWindow, {
    type: 'info',
    title: 'Mise à jour disponible',
    message: 'Une nouvelle version de l\'application est disponible. Voulez-vous redémarrer maintenant pour l\'installer ?',
    detail: `Version ${info.version} est prête à être installée.`,
    buttons: ['Redémarrer maintenant', 'Plus tard'],
    defaultId: 0,
    cancelId: 1
  });

  if (response === 0) {
    autoUpdater.quitAndInstall();
  }
});

// Gestionnaires IPC pour les contrôles de fenêtre
ipcMain.handle('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.minimize();
  }
});

ipcMain.handle('window-toggle-maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.handle('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
});

// Gestionnaires IPC pour les mises à jour
ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return result;
  } catch (error) {
    console.error('Erreur lors de la vérification des mises à jour:', error);
    throw error;
  }
});

ipcMain.handle('download-update', async () => {
  try {
    const result = await autoUpdater.downloadUpdate();
    return result;
  } catch (error) {
    console.error('Erreur lors du téléchargement de la mise à jour:', error);
    throw error;
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

// Gestion du cycle de vie de l'application
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
