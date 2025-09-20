const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertIcon() {
  try {
    console.log('🎨 Conversion de l\'icône...');
    
    // Chemin vers le fichier source
    const sourcePath = path.join(__dirname, '..', 'icon2.jpg');
    const outputPath = path.join(__dirname, '..', 'icon.png');
    
    if (!fs.existsSync(sourcePath)) {
      console.error('❌ Fichier icon2.jpg non trouvé');
      process.exit(1);
    }

    // Convertir JPG vers PNG 512x512
    await sharp(sourcePath)
      .resize(512, 512)
      .png()
      .toFile(outputPath);

    console.log('✅ Icône convertie avec succès (512x512)');
    console.log('📁 Fichier créé:', outputPath);

    // Vérifier la taille
    const stats = fs.statSync(outputPath);
    console.log(`📏 Taille du fichier: ${stats.size} bytes`);

  } catch (error) {
    console.error('❌ Erreur lors de la conversion:', error);
    process.exit(1);
  }
}

convertIcon();
