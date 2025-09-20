# Système de Mise à Jour Automatique

## Fonctionnalités

✅ **Détection automatique des plateformes** (Windows, Mac, Linux)  
✅ **Vérification des mises à jour au démarrage**  
✅ **Téléchargement automatique optionnel**  
✅ **Interface utilisateur intuitive**  
✅ **Notifications en temps réel**  
✅ **Barre de progression**  
✅ **Installation en un clic**  

## Configuration

### 1. Variables d'environnement GitHub

Pour que les mises à jour fonctionnent, vous devez configurer un token GitHub :

```bash
# Créer un token GitHub avec les permissions "repo"
export GH_TOKEN=your_github_token_here
```

### 2. Configuration de publication

Le fichier `package.json` est déjà configuré pour publier sur GitHub :

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "Syloww",
        "repo": "app",
        "releaseType": "release"
      }
    ]
  }
}
```

## Utilisation

### Vérification manuelle des mises à jour

1. Ouvrir l'application
2. Aller dans **Paramètres** > **Mises à jour**
3. Cliquer sur **"Vérifier les mises à jour"**

### Configuration des mises à jour automatiques

Dans les paramètres, vous pouvez :
- ✅ Activer/désactiver la vérification automatique
- ✅ Activer/désactiver le téléchargement automatique

## Publication d'une nouvelle version

### 1. Mettre à jour la version

```bash
# Mettre à jour la version dans package.json
npm version patch  # ou minor, major
```

### 2. Créer une release GitHub

```bash
# Construire et publier automatiquement
npm run publish
```

### 3. Vérifier la release

- Aller sur https://github.com/Syloww/app/releases
- Vérifier que les fichiers sont bien uploadés
- La version doit correspondre à celle du package.json

## Test du système

### Test local

```bash
# Tester la vérification des mises à jour
node test-update.js
```

### Test avec une nouvelle version

1. Modifier la version dans `package.json`
2. Construire l'application : `npm run build`
3. Publier : `npm run publish`
4. Tester avec l'ancienne version

## Plateformes supportées

| Plateforme | Format | Statut |
|------------|--------|--------|
| Windows    | .exe   | ✅     |
| Mac        | .dmg   | ✅     |
| Linux      | AppImage| ✅     |

## Dépannage

### Problème : "Aucune mise à jour trouvée"

- Vérifier que le token GitHub est configuré
- Vérifier que la release existe sur GitHub
- Vérifier que la version est supérieure à l'actuelle

### Problème : "Erreur de téléchargement"

- Vérifier la connexion internet
- Vérifier les permissions du dossier de téléchargement
- Vérifier l'espace disque disponible

### Problème : "Installation échouée"

- Vérifier les permissions d'écriture
- Fermer l'application avant l'installation
- Redémarrer en tant qu'administrateur (Windows)

## Structure des fichiers

```
├── main.js              # Configuration electron-updater
├── app.js               # Interface utilisateur des mises à jour
├── index.html           # Interface des paramètres
├── styles.css           # Styles des notifications
├── test-update.js       # Script de test
└── package.json         # Configuration de publication
```

## API des mises à jour

### Méthodes disponibles

```javascript
// Vérifier les mises à jour
await window.electronAPI.checkForUpdates();

// Télécharger la mise à jour
await window.electronAPI.downloadUpdate();

// Installer la mise à jour
window.electronAPI.installUpdate();
```

### Événements écoutés

```javascript
// Mise à jour disponible
ipcRenderer.on('update-available', (event, info) => {
  console.log('Nouvelle version:', info.version);
});

// Progression du téléchargement
ipcRenderer.on('download-progress', (event, progress) => {
  console.log('Progression:', progress.percent + '%');
});

// Mise à jour téléchargée
ipcRenderer.on('update-downloaded', (event, info) => {
  console.log('Prête à installer:', info.version);
});
```

## Sécurité

- Les mises à jour sont signées numériquement
- Vérification de l'intégrité des fichiers
- Téléchargement sécurisé via HTTPS
- Validation des signatures GitHub

## Support

Pour toute question ou problème :
1. Vérifier les logs dans la console
2. Consulter la documentation electron-updater
3. Créer une issue sur GitHub
