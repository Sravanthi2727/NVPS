const fs = require('fs');
const path = require('path');

// Read the menu.html file
const menuPath = path.join(__dirname, '../public/menu.html');
let menuContent = fs.readFileSync(menuPath, 'utf8');

// Image path mappings - old names to new names
const imageMappings = {
  'assets/menu_images/Iced latte &Iced Americano.jpeg': 'assets/menu_images/iced_latte_americano.jpeg',
  'assets/menu_images/iced-espresso.jpg': 'assets/menu_images/iced_espresso.jpg',
  'assets/menu_images/Cold Brew Tonic Ginger Ale Orange.webp': 'assets/menu_images/cold_brew_redbull.webp',
  'assets/menu_images/cranberry tonic.jpg': 'assets/menu_images/cranberry_tonic.jpg',
  'assets/menu_images/affogato cold blend.jpg': 'assets/menu_images/affogato_cold_blend.jpg',
  'assets/menu_images/cassic frappe.webp': 'assets/menu_images/classic_frappe.webp',
  'assets/menu_images/hazelnut cold blend.jpg': 'assets/menu_images/hazelnut_cold_blend.jpg',
  'assets/menu_images/Caramel-Iced-blend.jpg': 'assets/menu_images/caramel_iced_blend.jpg',
  'assets/menu_images/iced-mocha-blend.jpg': 'assets/menu_images/iced_mocha_blend.jpg',
  'assets/menu_images/biscoff cold blend.jpg': 'assets/menu_images/biscoff_cold_blend.jpg',
  'assets/menu_images/Vietnamese-Iced-Coffee.webp': 'assets/menu_images/vietnamese_iced_coffee.webp',
  'assets/menu_images/Cafe-suda.png': 'assets/menu_images/cafe_suda.png',
  'assets/menu_images/robco.webp': 'assets/menu_images/robco.webp',
  'assets/menu_images/hot americano.webp': 'assets/menu_images/hot_americano.webp',
  'assets/menu_images/hot espresso.webp': 'assets/menu_images/hot_espresso.webp',
  'assets/menu_images/Blend Hot latte.jpeg': 'assets/menu_images/blend_hot_latte.jpeg',
  'assets/menu_images/hot flat white.webp': 'assets/menu_images/hot_flat_white.webp',
  'assets/menu_images/v60 pour over.webp': 'assets/menu_images/v60_pour_over.webp',
  'assets/menu_images/chocolate shake.webp': 'assets/menu_images/chocolate_shake.webp',
  'assets/menu_images/nutella shake.webp': 'assets/menu_images/nutella_shake.webp',
  'assets/menu_images/lemon ice tea.jpg': 'assets/menu_images/lemon_ice_tea.jpg',
  'assets/menu_images/peach ice tea.webp': 'assets/menu_images/peach_ice_tea.webp',
  'assets/menu_images/ginger fizz.webp': 'assets/menu_images/ginger_fizz.webp',
  'assets/menu_images/classic orange mint.webp': 'assets/menu_images/classic_orange_mint.webp',
  'assets/menu_images/frenchfries.jpeg': 'assets/menu_images/french_fries.jpeg',
  'assets/menu_images/potato wedges.jpeg': 'assets/menu_images/potato_wedges.jpeg',
  'assets/menu_images/veg nuggets.webp': 'assets/menu_images/veg_nuggets.webp',
  'assets/menu_images/plain bagel.webp': 'assets/menu_images/plain_bagel.webp',
  'assets/menu_images/cream cheese bagel.jpg': 'assets/menu_images/cream_cheese_bagel.jpg',
  'assets/menu_images/jalopino bagel.webp': 'assets/menu_images/jalopino_bagel.webp',
  'assets/menu_images/pesto bagel.webp': 'assets/menu_images/pesto_bagel.webp',
  'assets/menu_images/butter croissant.webp': 'assets/menu_images/butter_croissant.webp',
  'assets/menu_images/nutella croissant.webp': 'assets/menu_images/nutella_croissant.webp',
  'assets/menu_images/cream chese croissant.webp': 'assets/menu_images/cream_cheese_croissant.webp',
  'assets/menu_images/grounded powder.jpeg': 'assets/menu_images/grounded_powder.jpeg'
};

// Replace all image paths
let replacementsCount = 0;
for (const [oldPath, newPath] of Object.entries(imageMappings)) {
  const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\₹&'), 'g');
  const matches = menuContent.match(regex);
  if (matches) {
    menuContent = menuContent.replace(regex, newPath);
    replacementsCount += matches.length;
    console.log(`Replaced ${matches.length} occurrences of: ${oldPath}`);
  }
}

// Write the fixed content back
fs.writeFileSync(menuPath, menuContent);

console.log(`\nFixed ${replacementsCount} image paths in menu.html`);
console.log('Menu image paths have been updated to use underscores instead of spaces.');
