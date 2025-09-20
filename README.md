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

## 🚀 Installation et utilisation

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

---

**Version 1.0.0** - Application de suivi des dépenses personnelles
