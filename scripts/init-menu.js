/**
 * Initialize Menu Items Script
 * Run this to populate the database with sample menu items
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = require('../config/database');
const MenuItem = require('../models/MenuItem');

const sampleMenuItems = [
  // Hot Coffee - Robusta Non-Milk
  {
    name: 'Robusta Espresso',
    category: 'hot',
    subCategory: 'robusta-hot-non-milk',
    price: 120,
    description: 'Strong and bold robusta espresso shot',
    isAvailable: true,
    displayOrder: 1,
    image: '/assets/menu_images/espresso.jpg'
  },
  {
    name: 'Robusta Americano',
    category: 'hot',
    subCategory: 'robusta-hot-non-milk',
    price: 140,
    description: 'Classic americano with robusta coffee',
    isAvailable: true,
    displayOrder: 2,
    image: '/assets/menu_images/americano.jpg'
  },
  
  // Hot Coffee - Robusta Milk
  {
    name: 'Robusta Cappuccino',
    category: 'hot',
    subCategory: 'robusta-hot-milk',
    price: 160,
    description: 'Creamy cappuccino with robusta coffee',
    isAvailable: true,
    displayOrder: 3,
    image: '/assets/menu_images/cappuccino.jpg'
  },
  {
    name: 'Robusta Latte',
    category: 'hot',
    subCategory: 'robusta-hot-milk',
    price: 180,
    description: 'Smooth latte with robusta coffee',
    isAvailable: true,
    displayOrder: 4,
    image: '/assets/menu_images/latte.jpg'
  },
  
  // Cold Coffee - Robusta Non-Milk
  {
    name: 'Cold Brew',
    category: 'cold',
    subCategory: 'robusta-cold-non-milk',
    price: 200,
    description: 'Smooth cold brew coffee',
    isAvailable: true,
    displayOrder: 5,
    image: '/assets/menu_images/cold-brew.jpg'
  },
  {
    name: 'Iced Americano',
    category: 'cold',
    subCategory: 'robusta-cold-non-milk',
    price: 160,
    description: 'Refreshing iced americano',
    isAvailable: true,
    displayOrder: 6,
    image: '/assets/menu_images/iced-americano.jpg'
  },
  
  // Cold Coffee - Robusta Milk
  {
    name: 'Iced Latte',
    category: 'cold',
    subCategory: 'robusta-cold-milk',
    price: 200,
    description: 'Creamy iced latte',
    isAvailable: true,
    displayOrder: 7,
    image: '/assets/menu_images/iced-latte.jpg'
  },
  {
    name: 'Cold Coffee',
    category: 'cold',
    subCategory: 'robusta-cold-milk',
    price: 180,
    description: 'Classic cold coffee with milk',
    isAvailable: true,
    displayOrder: 8,
    image: '/assets/menu_images/cold-coffee.jpg'
  },
  
  // Manual Brew
  {
    name: 'V60 Pour Over',
    category: 'manual-brew',
    subCategory: 'pour-over',
    price: 250,
    description: 'Hand-brewed V60 pour over coffee',
    isAvailable: true,
    displayOrder: 9,
    image: '/assets/menu_images/v60.jpg'
  },
  {
    name: 'French Press',
    category: 'manual-brew',
    subCategory: 'cold-brew',
    price: 220,
    description: 'Rich French press coffee',
    isAvailable: true,
    displayOrder: 10,
    image: '/assets/menu_images/french-press.jpg'
  },
  
  // Shakes & Tea
  {
    name: 'Coffee Milkshake',
    category: 'shakes-tea',
    subCategory: 'shakes',
    price: 240,
    description: 'Creamy coffee milkshake',
    isAvailable: true,
    displayOrder: 11,
    image: '/assets/menu_images/coffee-shake.jpg'
  },
  {
    name: 'Iced Tea',
    category: 'shakes-tea',
    subCategory: 'cold-tea',
    price: 120,
    description: 'Refreshing iced tea',
    isAvailable: true,
    displayOrder: 12,
    image: '/assets/menu_images/iced-tea.jpg'
  },
  
  // Food
  {
    name: 'Croissant',
    category: 'food',
    subCategory: 'bagels-croissants',
    price: 80,
    description: 'Buttery croissant',
    isAvailable: true,
    displayOrder: 13,
    image: '/assets/menu_images/croissant.jpg'
  },
  {
    name: 'Sandwich',
    category: 'food',
    subCategory: 'snacks-sides',
    price: 150,
    description: 'Fresh sandwich',
    isAvailable: true,
    displayOrder: 14,
    image: '/assets/menu_images/sandwich.jpg'
  }
];

async function initializeMenuItems() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    console.log('📊 Checking existing menu items...');
    const existingItems = await MenuItem.find({});
    console.log(`Found ${existingItems.length} existing menu items`);
    
    if (existingItems.length === 0) {
      console.log('🔄 No menu items found, creating sample items...');
      await MenuItem.insertMany(sampleMenuItems);
      console.log(`✅ Created ${sampleMenuItems.length} sample menu items`);
    } else {
      console.log('✅ Menu items already exist, skipping initialization');
    }
    
    console.log('🔄 Final count check...');
    const finalCount = await MenuItem.find({});
    console.log(`📊 Total menu items in database: ${finalCount.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing menu items:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeMenuItems();
}

module.exports = { initializeMenuItems, sampleMenuItems };