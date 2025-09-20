const fs = require('fs');
const path = require('path');

function generateIconManual() {
  try {
    console.log('🎨 Génération de l\'icône PNG (méthode manuelle)...');
    
    // Vérifier si icon2.jpg existe
    const jpgPath = path.join(__dirname, '..', 'icon2.jpg');
    if (!fs.existsSync(jpgPath)) {
      console.error('❌ Fichier icon2.jpg non trouvé');
      process.exit(1);
    }

    console.log('✅ Fichier icon2.jpg trouvé');
    console.log('📝 Vous devez convertir manuellement icon2.jpg en PNG 512x512');
    console.log('🔧 Options:');
    console.log('   1. Utilisez Paint.NET, GIMP, ou Photoshop');
    console.log('   2. Redimensionnez à 512x512 pixels');
    console.log('   3. Sauvegardez en PNG');
    console.log('   4. Remplacez icon.png par le nouveau fichier');
    console.log('');
    console.log('🌐 Ou utilisez un convertisseur en ligne:');
    console.log('   - https://convertio.co/jpg-png/');
    console.log('   - https://cloudconvert.com/jpg-to-png');
    console.log('   - https://www.freeconvert.com/jpg-to-png');
    console.log('');
    console.log('📋 Instructions détaillées:');
    console.log('   1. Ouvrez icon2.jpg dans un éditeur d\'images');
    console.log('   2. Redimensionnez l\'image à 512x512 pixels');
    console.log('   3. Exportez/sauvegardez en tant que PNG');
    console.log('   4. Renommez le fichier en "icon.png"');
    console.log('   5. Remplacez l\'ancien icon.png dans le dossier racine');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

generateIconManual();
