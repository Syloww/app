const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  try {
    console.log('🎨 Génération de l\'icône PNG...');
    
    // Lire le SVG
    const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
    if (!fs.existsSync(svgPath)) {
      console.error('❌ Fichier SVG non trouvé:', svgPath);
      process.exit(1);
    }

    // Générer PNG 256x256
    await sharp(svgPath)
      .resize(256, 256)
      .png()
      .toFile(path.join(__dirname, '..', 'icon.png'));

    console.log('✅ Icône PNG générée avec succès (256x256)');

    // Vérifier la taille
    const stats = fs.statSync(path.join(__dirname, '..', 'icon.png'));
    console.log(`📏 Taille du fichier: ${stats.size} bytes`);

  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'icône:', error);
    process.exit(1);
  }
}

generateIcon();
