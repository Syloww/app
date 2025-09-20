#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Fonction pour exécuter une commande et afficher le résultat
function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} terminé`);
    return output;
  } catch (error) {
    console.error(`❌ Erreur lors de ${description}:`, error.message);
    process.exit(1);
  }
}

// Fonction pour vérifier si un fichier existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Fonction pour lister les fichiers dans un répertoire
function listFiles(dir, pattern) {
  if (!fileExists(dir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  return files.filter(file => {
    if (pattern) {
      const regex = new RegExp(pattern);
      return regex.test(file);
    }
    return true;
  });
}

async function main() {
  console.log('🚀 Démarrage du processus de publication...\n');

  // 1. Vérifier que nous sommes dans un repo git propre
  try {
    const gitStatus = runCommand('git status --porcelain', 'Vérification du statut Git');
    if (gitStatus.trim()) {
      console.log('⚠️  Attention: Il y a des modifications non commitées');
      console.log('Voulez-vous continuer quand même ? (y/N)');
      // En mode automatique, on continue
    }
  } catch (error) {
    console.log('⚠️  Impossible de vérifier le statut Git, continuation...');
  }

  // 2. Lire la version depuis package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  console.log(`📦 Version actuelle: ${version}`);

  // 3. Vérifier si le tag existe déjà
  try {
    runCommand(`git rev-parse v${version}`, `Vérification de l'existence du tag v${version}`);
    console.log(`⚠️  Le tag v${version} existe déjà`);
    console.log('Voulez-vous continuer et créer une nouvelle release ? (y/N)');
  } catch (error) {
    console.log(`✅ Le tag v${version} n'existe pas, on peut continuer`);
  }

  // 4. Nettoyer le répertoire dist
  if (fileExists('dist')) {
    console.log('🧹 Nettoyage du répertoire dist...');
    // Utiliser la commande appropriée selon l'OS
    const isWindows = process.platform === 'win32';
    const cleanCommand = isWindows ? 'if exist dist rmdir /s /q dist && mkdir dist' : 'rm -rf dist/*';
    runCommand(cleanCommand, 'Nettoyage du répertoire dist');
  }

  // 5. Installer les dépendances
  runCommand('npm install', 'Installation des dépendances');

  // 6. Build pour toutes les plateformes
  console.log('\n🔨 Construction des applications...');
  
  // Windows
  console.log('\n📱 Construction pour Windows...');
  runCommand('npm run build:win', 'Build Windows');
  
  // macOS
  console.log('\n🍎 Construction pour macOS...');
  runCommand('npm run build:mac', 'Build macOS');
  
  // Linux
  console.log('\n🐧 Construction pour Linux...');
  runCommand('npm run build:linux', 'Build Linux');

  // 7. Vérifier les fichiers générés
  console.log('\n🔍 Vérification des fichiers générés...');
  
  const distFiles = listFiles('dist');
  console.log('Fichiers dans dist:', distFiles);

  // Vérifier les fichiers spécifiques
  const windowsFiles = distFiles.filter(f => f.endsWith('.exe'));
  const macFiles = distFiles.filter(f => f.endsWith('.dmg') || f.endsWith('.zip'));
  const linuxFiles = distFiles.filter(f => f.endsWith('.AppImage'));

  console.log(`\n📊 Résumé des builds:`);
  console.log(`   Windows: ${windowsFiles.length} fichier(s) - ${windowsFiles.join(', ')}`);
  console.log(`   macOS: ${macFiles.length} fichier(s) - ${macFiles.join(', ')}`);
  console.log(`   Linux: ${linuxFiles.length} fichier(s) - ${linuxFiles.join(', ')}`);

  if (windowsFiles.length === 0 && macFiles.length === 0 && linuxFiles.length === 0) {
    console.log('❌ Aucun fichier de build trouvé !');
    process.exit(1);
  }

  // 8. Créer le tag Git
  console.log('\n🏷️  Création du tag Git...');
  runCommand(`git tag v${version}`, `Création du tag v${version}`);
  runCommand(`git push origin v${version}`, `Push du tag v${version}`);

  console.log('\n✅ Publication terminée avec succès !');
  console.log('\n📋 Prochaines étapes:');
  console.log('   1. Vérifiez que le workflow GitHub Actions se déclenche');
  console.log('   2. Surveillez les builds dans l\'onglet Actions');
  console.log('   3. Une fois terminé, la release sera disponible dans l\'onglet Releases');
  
  if (macFiles.length > 0) {
    console.log('\n🍎 Note pour macOS:');
    console.log('   - L\'application n\'est pas signée (pas de certificat Apple Developer)');
    console.log('   - Les utilisateurs devront faire clic droit > Ouvrir pour contourner Gatekeeper');
    console.log('   - Ou utiliser: xattr -cr "nom-de-l-app.app" dans le terminal');
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Erreur non gérée:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
  process.exit(1);
});

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
