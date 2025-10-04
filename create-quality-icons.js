const fs = require('fs');
const path = require('path');

// Создаем более качественную иконку шута
function createQualityJesterIcon() {
  // Создаем SVG с более детальным дизайном
  const svgContent = `
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- Фон с градиентом -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5B21B6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FEF3C7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FDE68A;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#DC2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#991B1B;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="sideHatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16A34A;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#15803D;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Фон -->
  <rect width="256" height="256" fill="url(#bgGradient)" rx="32"/>
  
  <!-- Лицо шута -->
  <ellipse cx="128" cy="140" rx="60" ry="80" fill="url(#faceGradient)" stroke="#1F2937" stroke-width="3"/>
  
  <!-- Глаза -->
  <ellipse cx="110" cy="120" rx="8" ry="12" fill="#1F2937"/>
  <ellipse cx="146" cy="120" rx="8" ry="12" fill="#1F2937"/>
  
  <!-- Блики в глазах -->
  <ellipse cx="112" cy="118" rx="3" ry="4" fill="#FFFFFF"/>
  <ellipse cx="148" cy="118" rx="3" ry="4" fill="#FFFFFF"/>
  
  <!-- Нос -->
  <ellipse cx="128" cy="135" rx="4" ry="6" fill="#1F2937"/>
  
  <!-- Улыбка -->
  <path d="M100 160 Q128 180 156 160" stroke="#1F2937" stroke-width="4" fill="none" stroke-linecap="round"/>
  
  <!-- Шляпа шута - центральная часть -->
  <path d="M80 60 L128 20 L176 60 L170 100 L86 100 Z" fill="url(#hatGradient)" stroke="#1F2937" stroke-width="3"/>
  
  <!-- Левая боковая часть шляпы -->
  <path d="M60 80 L86 60 L100 80 L86 100 Z" fill="url(#sideHatGradient)" stroke="#1F2937" stroke-width="3"/>
  
  <!-- Правая боковая часть шляпы -->
  <path d="M156 60 L170 80 L184 80 L170 100 Z" fill="url(#sideHatGradient)" stroke="#1F2937" stroke-width="3"/>
  
  <!-- Колокольчики -->
  <circle cx="90" cy="80" r="8" fill="#FCD34D" stroke="#1F2937" stroke-width="2"/>
  <circle cx="128" cy="60" r="8" fill="#FCD34D" stroke="#1F2937" stroke-width="2"/>
  <circle cx="166" cy="80" r="8" fill="#FCD34D" stroke="#1F2937" stroke-width="2"/>
  <circle cx="128" cy="100" r="6" fill="#FCD34D" stroke="#1F2937" stroke-width="2"/>
  
  <!-- Детали колокольчиков -->
  <circle cx="90" cy="80" r="3" fill="#F59E0B"/>
  <circle cx="128" cy="60" r="3" fill="#F59E0B"/>
  <circle cx="166" cy="80" r="3" fill="#F59E0B"/>
  <circle cx="128" cy="100" r="2" fill="#F59E0B"/>
  
  <!-- Воротник -->
  <path d="M80 200 Q128 220 176 200" stroke="#FCD34D" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M80 200 Q128 210 176 200" stroke="#F59E0B" stroke-width="4" fill="none" stroke-linecap="round"/>
  
  <!-- Тени для объема -->
  <ellipse cx="128" cy="140" rx="60" ry="80" fill="none" stroke="#1F2937" stroke-width="1" opacity="0.3"/>
</svg>`;

  // Сохраняем SVG
  const svgPath = path.join(__dirname, 'public', 'jester-icon.svg');
  fs.writeFileSync(svgPath, svgContent);
  console.log('✅ Качественная SVG иконка создана:', svgPath);

  // Создаем упрощенную PNG иконку для трея
  const simplePngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x20, // 32x32 dimensions
    0x08, 0x06, 0x00, 0x00, 0x00, 0x73, 0x7A, 0x7A, // 8-bit RGBA
    0xF4, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45, 0x58, // tEXt chunk
    0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61, 0x72,
    0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65, 0x20,
    0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65, 0x61,
    0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00, 0x00,
    0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA,
    0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
    0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  // Перезаписываем существующие иконки
  const iconPath = path.join(__dirname, 'public', 'icon.png');
  fs.writeFileSync(iconPath, simplePngData);
  console.log('✅ PNG иконка обновлена:', iconPath);

  const trayIconPath = path.join(__dirname, 'public', 'tray-icon.png');
  fs.writeFileSync(trayIconPath, simplePngData);
  console.log('✅ Иконка трея обновлена:', trayIconPath);

  // Создаем favicon
  const faviconData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, // 16x16 dimensions
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF, // 8-bit RGBA
    0x61, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45, 0x58, // tEXt chunk
    0x74, 0x53, 0x6F, 0x66, 0x74, 0x77, 0x61, 0x72,
    0x65, 0x00, 0x41, 0x64, 0x6F, 0x62, 0x65, 0x20,
    0x49, 0x6D, 0x61, 0x67, 0x65, 0x52, 0x65, 0x61,
    0x64, 0x79, 0x71, 0xC9, 0x65, 0x3C, 0x00, 0x00,
    0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA,
    0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
    0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
  fs.writeFileSync(faviconPath, faviconData);
  console.log('✅ Favicon создан:', faviconPath);
}

// Создаем качественные иконки
createQualityJesterIcon();

