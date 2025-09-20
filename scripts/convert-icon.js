const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertIcon() {
  try {
    console.log('🔄 Conversion de l\'icône...');
    
    // Vérifier si icon2.jpg existe
    const jpgPath = path.join(__dirname, '..', 'icon2.jpg');
    if (!fs.existsSync(jpgPath)) {
      console.error('❌ Fichier icon2.jpg non trouvé');
      process.exit(1);
    }

    // Convertir JPG vers PNG 512x512
    await sharp(jpgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '..', 'icon.png'));

    console.log('✅ Icône convertie avec succès (512x512)');

    // Vérifier la taille
    const stats = fs.statSync(path.join(__dirname, '..', 'icon.png'));
    console.log(`📏 Taille du fichier: ${stats.size} bytes`);

  } catch (error) {
    console.error('❌ Erreur lors de la conversion:', error);
    process.exit(1);
  }
}

convertIcon();
