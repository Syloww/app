const fs = require('fs');
const path = require('path');

// Créer un PNG simple de 512x512 avec un fond vert et un symbole $
function createSimpleIcon() {
  try {
    console.log('🎨 Création d\'une icône PNG simple 512x512...');
    
    // Créer un SVG de 512x512
    const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)" stroke="#1B5E20" stroke-width="8"/>
  
  <!-- Dollar sign -->
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="240" font-weight="bold" text-anchor="middle" fill="white">$</text>
  
  <!-- Chart bars -->
  <rect x="120" y="160" width="30" height="80" fill="white" opacity="0.8"/>
  <rect x="160" y="140" width="30" height="100" fill="white" opacity="0.9"/>
  <rect x="200" y="120" width="30" height="120" fill="white"/>
  <rect x="240" y="150" width="30" height="90" fill="white" opacity="0.7"/>
  <rect x="280" y="130" width="30" height="110" fill="white" opacity="0.8"/>
  <rect x="320" y="170" width="30" height="70" fill="white" opacity="0.6"/>
</svg>`;

    // Écrire le SVG
    const svgPath = path.join(__dirname, '..', 'icon-512.svg');
    fs.writeFileSync(svgPath, svgContent);
    
    console.log('✅ SVG 512x512 créé:', svgPath);
    console.log('');
    console.log('🔄 Étapes suivantes:');
    console.log('1. Ouvrez le fichier icon-512.svg dans un navigateur web');
    console.log('2. Faites un clic droit sur l\'image');
    console.log('3. Sélectionnez "Enregistrer l\'image sous..."');
    console.log('4. Choisissez le format PNG');
    console.log('5. Renommez le fichier en "icon.png"');
    console.log('6. Remplacez l\'ancien icon.png dans le dossier racine');
    console.log('');
    console.log('🌐 Ou utilisez un convertisseur en ligne:');
    console.log('   - https://convertio.co/svg-png/');
    console.log('   - https://cloudconvert.com/svg-to-png');
    console.log('   - https://www.freeconvert.com/svg-to-png');

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    process.exit(1);
  }
}

createSimpleIcon();
