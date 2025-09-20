# 📊 Suivi des Dépenses

Une application Electron moderne et intuitive pour suivre vos dépenses personnelles avec sauvegarde locale et fonctionnalités avancées.

## ✨ Fonctionnalités

### 🏠 Tableau de bord
- **Statistiques en temps réel** : dépenses du jour, du mois, total et moyenne quotidienne
- **Graphiques interactifs** : répartition par catégorie et évolution dans le temps
- **Dépenses récentes** : aperçu des dernières transactions

### 💰 Gestion des dépenses
- **Ajout facile** : formulaire intuitif avec validation
- **Catégorisation** : organisation par catégories personnalisables
- **Moyens de paiement** : espèces, carte, virement, chèque
- **Historique complet** : visualisation et filtrage des dépenses

### 🏷️ Gestion des catégories
- **Catégories personnalisées** : nom, couleur et icône
- **Catégories par défaut** : nourriture, transport, shopping, loisirs, santé, logement
- **Suppression sécurisée** : vérification avant suppression

### ⚙️ Paramètres
- **Devise** : Euro, Dollar, Livre, Yen
- **Format de date** : DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
- **Thème** : Clair, Sombre, Automatique
- **Export/Import** : sauvegarde et restauration des données

### 💾 Sauvegarde et export
- **Sauvegarde automatique** : toutes les données sont sauvegardées localement
- **Export JSON** : sauvegarde complète des données
- **Import de données** : restauration depuis un fichier JSON
- **Effacement sécurisé** : suppression complète avec confirmation

## 📥 Téléchargement

### Version compilée (recommandée)
**Téléchargez directement l'application prête à utiliser pour votre système :**

1. Allez sur la page des releases : **[https://github.com/Syloww/app/releases](https://github.com/Syloww/app/releases)**
2. Téléchargez le fichier correspondant à votre système :
   - **Windows** : `suivis-de-depense-1.0.0.exe` (81 MB)
   - **macOS** : 
     - `Suivi des Dépenses-1.0.0.dmg` (recommandé - environ 100 MB)
     - `Suivi des Dépenses-1.0.0.zip` (alternative si DMG ne fonctionne pas)
   - **Linux** : `suivis-de-depense-1.0.0.AppImage` (environ 100 MB)
3. Lancez l'application :
   - **Windows** : Double-cliquez sur le fichier `.exe`
   - **macOS** : 
     - **DMG** : Ouvrez le fichier `.dmg` et glissez l'app dans Applications
     - **ZIP** : Décompressez le fichier `.zip` et double-cliquez sur l'app
   - **Linux** : Rendez le fichier `.AppImage` exécutable et double-cliquez

> **Note :** Aucune installation requise, l'application se lance directement !

### Liens directs de téléchargement
- **[Télécharger la dernière version](https://github.com/Syloww/app/releases/latest)**
- **[Toutes les versions disponibles](https://github.com/Syloww/app/releases)**

### 🖥️ Compatibilité
- **Windows** : Windows 10/11 (64-bit)
- **macOS** : macOS 10.14 ou plus récent
- **Linux** : Ubuntu 18.04+ / Debian 10+ / Fedora 32+ / openSUSE 15.2+

---

## 🚀 Installation et utilisation (développeurs)

### Prérequis
- Node.js (version 14 ou supérieure)
- npm

### Installation
1. Clonez ou téléchargez le projet
2. Ouvrez un terminal dans le dossier du projet
3. Installez les dépendances :
   ```bash
   npm install
   ```

### Lancement
```bash
npm start
```

### Mode développement
```bash
npm run dev
```

## 📱 Interface utilisateur

### Navigation
L'application est organisée en 5 sections principales accessibles via des onglets :

1. **📊 Tableau de bord** - Vue d'ensemble et statistiques
2. **➕ Ajouter dépense** - Saisie de nouvelles dépenses
3. **📜 Historique** - Liste et filtrage des dépenses
4. **🏷️ Catégories** - Gestion des catégories
5. **⚙️ Paramètres** - Configuration de l'application

### Utilisation

#### Ajouter une dépense
1. Cliquez sur l'onglet "Ajouter dépense"
2. Remplissez le formulaire :
   - Montant (obligatoire)
   - Description (obligatoire)
   - Catégorie (obligatoire)
   - Date (par défaut : aujourd'hui)
   - Moyen de paiement
3. Cliquez sur "Ajouter la dépense"

#### Gérer les catégories
1. Cliquez sur l'onglet "Catégories"
2. Pour ajouter : remplissez le formulaire et cliquez sur "Ajouter"
3. Pour supprimer : cliquez sur l'icône poubelle (si la catégorie n'est pas utilisée)

#### Exporter/Importer des données
1. Cliquez sur l'onglet "Paramètres"
2. Utilisez les boutons "Exporter" ou "Importer" dans la section "Données"
3. Les fichiers sont au format JSON

## 🔧 Personnalisation

### Thèmes
- **Clair** : interface claire par défaut
- **Sombre** : interface sombre pour un usage nocturne
- **Automatique** : suit les préférences système

### Devises supportées
- € Euro
- $ Dollar américain
- £ Livre sterling
- ¥ Yen japonais

### Formats de date
- DD/MM/YYYY (français)
- MM/DD/YYYY (américain)
- YYYY-MM-DD (ISO)

## 📊 Données et sauvegarde

### Stockage local
Toutes les données sont stockées localement dans le navigateur (localStorage) :
- Dépenses
- Catégories
- Paramètres

### Export des données
L'export inclut :
- Toutes les dépenses
- Toutes les catégories
- Paramètres de l'application
- Date d'export

### Structure des données
```json
{
  "expenses": [
    {
      "id": "timestamp",
      "amount": 25.50,
      "description": "Déjeuner",
      "categoryId": "1",
      "date": "2024-01-15",
      "paymentMethod": "card",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ],
  "categories": [
    {
      "id": "1",
      "name": "Nourriture",
      "color": "#e74c3c",
      "icon": "fas fa-utensils"
    }
  ],
  "settings": {
    "currency": "€",
    "dateFormat": "DD/MM/YYYY",
    "theme": "light"
  }
}
```

## 🛠️ Technologies utilisées

- **Electron** : Framework pour applications desktop
- **HTML5/CSS3** : Structure et style
- **JavaScript ES6+** : Logique de l'application
- **Chart.js** : Graphiques interactifs
- **Font Awesome** : Icônes
- **localStorage** : Sauvegarde locale

## 📝 Notes importantes

- Les données sont stockées localement sur votre machine
- L'export/import permet de sauvegarder et transférer vos données
- La suppression de catégories n'est possible que si elles ne sont pas utilisées
- L'application fonctionne hors ligne une fois installée

## 🔒 Sécurité et confidentialité

- Aucune donnée n'est envoyée sur internet
- Toutes les informations restent sur votre ordinateur
- Pas de collecte de données personnelles
- Code source ouvert et transparent

## 🐛 Dépannage

### L'application ne se lance pas
- Vérifiez que Node.js est installé
- Exécutez `npm install` pour installer les dépendances
- Vérifiez les logs dans la console

### Les données ne se sauvegardent pas
- Vérifiez que JavaScript est activé
- Vérifiez les paramètres de confidentialité du navigateur
- Essayez de vider le cache et recharger

### Problèmes d'affichage
- Vérifiez que les fichiers CSS et JS sont chargés
- Essayez de recharger la page (Ctrl+F5)
- Vérifiez la console pour les erreurs

## 📞 Support

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez les logs de la console
3. Vérifiez que toutes les dépendances sont installées

## 🚀 Publication

### Compilation pour la distribution
```bash
# Compiler pour Windows
npm run build:win

# Compiler pour macOS  
npm run build:mac

# Compiler pour Linux
npm run build:linux

# Compiler pour toutes les plateformes
npm run build
```

### Publication automatique sur GitHub
1. Assurez-vous que votre fichier `.env` contient votre token GitHub :
   ```
   GH_TOKEN=votre_token_github
   ```

2. Mettez à jour le `package.json` avec vos informations :
   - `author` : Votre nom
   - `build.publish.owner` : Votre nom d'utilisateur GitHub
   - `build.publish.repo` : Nom de votre repository

3. Publiez automatiquement :
   ```bash
   npm run publish
   ```

### Configuration requise pour la publication
- Token GitHub avec les permissions de repository
- Repository GitHub configuré
- Fichier `.env` avec le token (ne pas commiter)
- Icônes dans le dossier `assets/`

---

**Version 1.0.0** - Application de suivi des dépenses personnelles
