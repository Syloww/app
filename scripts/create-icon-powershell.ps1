# Script PowerShell pour créer une icône PNG simple
Write-Host "🎨 Création d'une icône PNG 512x512 avec PowerShell..." -ForegroundColor Green

# Créer un SVG simple
$svgContent = @'
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
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
</svg>
'@

# Écrire le SVG
$svgPath = "icon-512.svg"
$svgContent | Out-File -FilePath $svgPath -Encoding UTF8

Write-Host "✅ SVG 512x512 créé: $svgPath" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Étapes suivantes:" -ForegroundColor Yellow
Write-Host "1. Ouvrez le fichier icon-512.svg dans un navigateur web"
Write-Host "2. Faites un clic droit sur l'image"
Write-Host "3. Sélectionnez 'Enregistrer l'image sous...'"
Write-Host "4. Choisissez le format PNG"
Write-Host "5. Renommez le fichier en 'icon.png'"
Write-Host "6. Remplacez l'ancien icon.png dans le dossier racine"
Write-Host ""
Write-Host "🌐 Ou utilisez un convertisseur en ligne:" -ForegroundColor Cyan
Write-Host "   - https://convertio.co/svg-png/"
Write-Host "   - https://cloudconvert.com/svg-to-png"
Write-Host "   - https://www.freeconvert.com/svg-to-png"
