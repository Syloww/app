const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
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
  
  win.loadFile('index.html');
  
  // Afficher la fenêtre une fois que le contenu est chargé
  win.once('ready-to-show', () => {
    win.show();
  });
  
  // Ouvrir les DevTools en mode développement
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  // Exposer l'API Electron au renderer
  win.webContents.executeJavaScript(`
    const { ipcRenderer } = require('electron');
    window.electronAPI = {
      minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
      toggleMaximizeWindow: () => ipcRenderer.invoke('window-toggle-maximize'),
      closeWindow: () => ipcRenderer.invoke('window-close')
    };
  `);

  return win;
}

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
