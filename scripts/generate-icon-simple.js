const fs = require('fs');
const path = require('path');

async function generateIconSimple() {
  try {
    console.log('🎨 Génération de l\'icône PNG (méthode simple)...');
    
    // Lire le SVG
    const svgPath = path.join(__dirname, '..', 'assets', 'icon.svg');
    if (!fs.existsSync(svgPath)) {
      console.error('❌ Fichier SVG non trouvé:', svgPath);
      process.exit(1);
    }

    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Modifier le SVG pour avoir une taille de 512x512
    const modifiedSvg = svgContent
      .replace('width="256"', 'width="512"')
      .replace('height="256"', 'height="512"')
      .replace('viewBox="0 0 256 256"', 'viewBox="0 0 512 512"')
      .replace('r="120"', 'r="240"')
      .replace('cx="128"', 'cx="256"')
      .replace('cy="128"', 'cy="256"')
      .replace('font-size="120"', 'font-size="240"')
      .replace('x="128"', 'x="256"')
      .replace('y="160"', 'y="320"')
      .replace('x="60"', 'x="120"')
      .replace('x="80"', 'x="160"')
      .replace('x="100"', 'x="200"')
      .replace('x="120"', 'x="240"')
      .replace('x="140"', 'x="280"')
      .replace('x="160"', 'x="320"')
      .replace('y="80"', 'y="160"')
      .replace('y="70"', 'y="140"')
      .replace('y="60"', 'y="120"')
      .replace('y="75"', 'y="150"')
      .replace('y="65"', 'y="130"')
      .replace('y="85"', 'y="170"')
      .replace('width="15"', 'width="30"')
      .replace('height="40"', 'height="80"')
      .replace('height="50"', 'height="100"')
      .replace('height="60"', 'height="120"')
      .replace('height="45"', 'height="90"')
      .replace('height="55"', 'height="110"')
      .replace('height="35"', 'height="70"');

    // Écrire le SVG modifié
    const modifiedSvgPath = path.join(__dirname, '..', 'icon-512.svg');
    fs.writeFileSync(modifiedSvgPath, modifiedSvg);
    
    console.log('✅ SVG modifié créé (512x512)');
    console.log('📝 Fichier créé:', modifiedSvgPath);
    console.log('⚠️  Vous devez convertir ce SVG en PNG manuellement ou utiliser un outil en ligne');
    console.log('🔗 Recommandation: https://convertio.co/svg-png/ ou https://cloudconvert.com/svg-to-png');

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    process.exit(1);
  }
}

generateIconSimple();
