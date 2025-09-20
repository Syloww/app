const https = require('https');
const { execSync } = require('child_process');

async function checkReleaseStatus() {
  try {
    console.log('🔍 Vérification du statut de la release...\n');

    // Obtenir la version depuis package.json
    const packageJson = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
    const version = packageJson.version;
    const tagName = `v${version}`;

    console.log(`📦 Version: ${version}`);
    console.log(`🏷️  Tag: ${tagName}`);

    // Vérifier si le tag existe localement
    try {
      execSync(`git rev-parse ${tagName}`, { stdio: 'pipe' });
      console.log('✅ Tag local existe');
    } catch (error) {
      console.log('❌ Tag local manquant');
      return;
    }

    // Vérifier si le tag a été poussé
    try {
      const remoteTags = execSync('git ls-remote --tags origin', { encoding: 'utf8' });
      if (remoteTags.includes(tagName)) {
        console.log('✅ Tag poussé sur GitHub');
      } else {
        console.log('❌ Tag pas encore poussé sur GitHub');
        return;
      }
    } catch (error) {
      console.log('❌ Impossible de vérifier les tags distants');
      return;
    }

    console.log('\n🚀 Le workflow GitHub Actions devrait être en cours...');
    console.log('📋 Prochaines étapes:');
    console.log('   1. Aller sur https://github.com/Syloww/app/actions');
    console.log('   2. Vérifier que le workflow "Release" est en cours ou terminé');
    console.log('   3. Une fois terminé, aller sur https://github.com/Syloww/app/releases');
    console.log('   4. Télécharger les fichiers pour chaque plateforme');

    console.log('\n🍎 Note pour Mac:');
    console.log('   - Le build Mac se fait automatiquement sur GitHub Actions');
    console.log('   - Il n\'est pas possible de build pour Mac depuis Windows');
    console.log('   - Les fichiers .dmg et .zip seront disponibles dans la release');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkReleaseStatus();
