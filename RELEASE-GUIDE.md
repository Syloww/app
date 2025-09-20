# Guide de Publication - Suivi des Dépenses

## 🚀 Publication Automatique

### Méthode Recommandée (Script Automatisé)

```bash
npm run release
```

Ce script va :
1. ✅ Vérifier le statut Git
2. 📦 Lire la version depuis `package.json`
3. 🧹 Nettoyer le répertoire `dist/`
4. 📥 Installer les dépendances
5. 🔨 Construire l'application pour Windows, Mac et Linux
6. 🏷️ Créer et pousser le tag Git
7. 📋 Afficher un résumé des fichiers générés

### Méthode Simple (Manuelle)

```bash
npm run release:simple
```

## 📱 Plateformes Supportées

### Windows
- **Format**: `.exe` (portable)
- **Architecture**: x64
- **Signature**: Non signé (pas de problème antivirus)

### macOS
- **Format**: `.dmg` et `.zip`
- **Architecture**: x64 et ARM64 (Apple Silicon)
- **Signature**: Non signé (contournement Gatekeeper nécessaire)

### Linux
- **Format**: `.AppImage`
- **Architecture**: x64
- **Signature**: Non signé

## 🍎 Résolution du Problème Mac (Détection Antivirus)

### Pour les Utilisateurs Mac

Si macOS bloque l'application :

1. **Méthode 1 - Clic droit** :
   - Faire clic droit sur l'application
   - Sélectionner "Ouvrir"
   - Confirmer dans la boîte de dialogue

2. **Méthode 2 - Terminal** :
   ```bash
   xattr -cr "Suivi des Dépenses.app"
   ```

3. **Méthode 3 - Préférences Système** :
   - Aller dans Préférences Système > Sécurité et confidentialité
   - Cliquer sur "Ouvrir quand même" si l'option apparaît

### Pour les Développeurs

Le problème vient du fait que l'application n'est pas signée avec un certificat Apple Developer. Les solutions :

1. **Solution actuelle** : Configuration optimisée pour éviter les fausses détections
2. **Solution complète** : Obtenir un certificat Apple Developer (99$/an)

## 🔧 Configuration Technique

### Fichiers de Configuration

- `package.json` : Configuration electron-builder
- `build/entitlements.mac.plist` : Permissions macOS
- `.github/workflows/release.yml` : Pipeline CI/CD

### Variables d'Environnement

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false
ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
ELECTRON_SKIP_BINARY_DOWNLOAD=true
```

## 📋 Checklist de Publication

### Avant la Publication
- [ ] Tester l'application localement (`npm start`)
- [ ] Vérifier que tous les fichiers sont commités
- [ ] Mettre à jour la version dans `package.json`
- [ ] Vérifier que l'icône `icon.png` est à la racine

### Pendant la Publication
- [ ] Exécuter `npm run release`
- [ ] Surveiller les logs pour détecter les erreurs
- [ ] Vérifier que tous les fichiers sont générés

### Après la Publication
- [ ] Vérifier que le workflow GitHub Actions se déclenche
- [ ] Surveiller les builds dans l'onglet Actions
- [ ] Tester les téléchargements depuis l'onglet Releases
- [ ] Documenter les changements dans les notes de release

## 🐛 Dépannage

### Erreurs Communes

1. **"No files found"** :
   - Vérifier que `icon.png` existe à la racine
   - Nettoyer `node_modules` et réinstaller

2. **"Git tag already exists"** :
   - Supprimer le tag : `git tag -d v1.x.x && git push origin :refs/tags/v1.x.x`
   - Ou incrémenter la version

3. **"Build failed"** :
   - Vérifier les logs GitHub Actions
   - Tester localement avec `npm run build:win/mac/linux`

### Logs Utiles

```bash
# Vérifier les fichiers générés
ls -la dist/

# Tester un build spécifique
npm run build:win
npm run build:mac
npm run build:linux

# Vérifier les tags Git
git tag -l
```

## 📈 Améliorations Futures

1. **Signature de Code** :
   - Certificat Windows (Code Signing Certificate)
   - Certificat Apple Developer pour macOS
   - Notarisation macOS

2. **Tests Automatisés** :
   - Tests unitaires
   - Tests d'intégration
   - Tests de build

3. **CI/CD Avancé** :
   - Déploiement automatique
   - Notifications Slack/Discord
   - Métriques de téléchargement

## 📞 Support

En cas de problème :
1. Vérifier les logs GitHub Actions
2. Consulter ce guide
3. Tester localement
4. Créer une issue GitHub si nécessaire
