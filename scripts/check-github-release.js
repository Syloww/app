const https = require('https');

function checkGitHubRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/Syloww/app/releases',
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const releases = JSON.parse(data);
          resolve(releases);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('🔍 Vérification des releases GitHub...\n');

    const releases = await checkGitHubRelease();
    
    if (releases.length === 0) {
      console.log('❌ Aucune release trouvée');
      return;
    }

    // Trier par date de création (plus récente en premier)
    releases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`📦 ${releases.length} release(s) trouvée(s):\n`);

    releases.forEach((release, index) => {
      const isLatest = index === 0;
      const status = isLatest ? '🆕 DERNIÈRE' : '📋';
      
      console.log(`${status} ${release.tag_name} - ${release.name || 'Sans nom'}`);
      console.log(`   📅 Créée: ${new Date(release.created_at).toLocaleString('fr-FR')}`);
      console.log(`   📊 Assets: ${release.assets.length} fichier(s)`);
      
      if (release.assets.length > 0) {
        console.log('   📁 Fichiers:');
        release.assets.forEach(asset => {
          const size = (asset.size / 1024 / 1024).toFixed(1);
          const platform = asset.name.includes('.exe') ? '🪟 Windows' : 
                          asset.name.includes('.dmg') ? '🍎 macOS DMG' :
                          asset.name.includes('.zip') ? '🍎 macOS ZIP' :
                          asset.name.includes('.AppImage') ? '🐧 Linux' : '📄';
          console.log(`      ${platform} ${asset.name} (${size} MB)`);
        });
      } else {
        console.log('   ⏳ Aucun fichier encore disponible (build en cours...)');
      }
      
      console.log(`   🔗 URL: ${release.html_url}\n`);
    });

    // Vérifier spécifiquement v1.1.6
    const v116 = releases.find(r => r.tag_name === 'v1.1.6');
    if (v116) {
      console.log('🎯 Release v1.1.6:');
      if (v116.assets.length > 0) {
        console.log('✅ Fichiers disponibles !');
        const macFiles = v116.assets.filter(a => a.name.includes('.dmg') || a.name.includes('.zip'));
        if (macFiles.length > 0) {
          console.log('🍎 Fichiers Mac trouvés:');
          macFiles.forEach(file => console.log(`   - ${file.name}`));
        } else {
          console.log('❌ Aucun fichier Mac (.dmg/.zip) trouvé');
        }
      } else {
        console.log('⏳ Build encore en cours...');
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

main();
