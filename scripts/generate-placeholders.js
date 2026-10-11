/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'placeholders');
fs.mkdirSync(dir, { recursive: true });

function createSvg(title, subtitle, w = 600, h = 750, bg = '#F3EBDD', fg = '#4A3A33') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="none" stroke="#E3D8C9" stroke-width="2" stroke-dasharray="6 6" rx="4"/>
  <text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="600" fill="${fg}">${title}</text>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#7A655B">${subtitle} (Placeholder)</text>
</svg>`;
}

fs.writeFileSync(path.join(dir, 'scrunchie-1.svg'), createSvg('Classic Scrunchie', 'Product Photo 1'));
fs.writeFileSync(path.join(dir, 'scrunchie-2.svg'), createSvg('Classic Scrunchie', 'Product Photo 2 (Detail)'));
fs.writeFileSync(path.join(dir, 'pouch-1.svg'), createSvg('Makeup Pouch', 'Product Photo 1'));
fs.writeFileSync(path.join(dir, 'pouch-2.svg'), createSvg('Makeup Pouch', 'Product Photo 2 (Inside)'));
fs.writeFileSync(path.join(dir, 'sleeve-1.svg'), createSvg('Eyewear Sleeve', 'Product Photo 1'));
fs.writeFileSync(path.join(dir, 'laptop-1.svg'), createSvg('Laptop Sleeve', 'Product Photo 1'));

fs.writeFileSync(path.join(dir, 'fabric-floral.svg'), createSvg('Floral', 'Fabric Swatch', 120, 120, '#EDE2D1', '#4A3A33'));
fs.writeFileSync(path.join(dir, 'fabric-corduroy.svg'), createSvg('Corduroy', 'Fabric Swatch', 120, 120, '#E3D8C9', '#4A3A33'));
fs.writeFileSync(path.join(dir, 'fabric-check.svg'), createSvg('Check', 'Fabric Swatch', 120, 120, '#F3EBDD', '#4A3A33'));
fs.writeFileSync(path.join(dir, 'fabric-linen.svg'), createSvg('Linen', 'Fabric Swatch', 120, 120, '#FAF6EF', '#4A3A33'));

console.log('Placeholders created successfully.');
