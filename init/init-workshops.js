const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Workshop = require('../models/Workshop');
const connectDB = require('../config/database');

// Connect to database
connectDB();

// Read workshops JSON file
const workshopsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'workshops.json'), 'utf8')
);

// Function to initialize workshops in database
async function initWorkshops() {
  try {
    console.log('Starting workshops initialization...');
    
    // Clear existing workshops (optional - comment out if you want to keep existing data)
    // await Workshop.deleteMany({});
    // console.log('Cleared existing workshops');
    
    let created = 0;
    let skipped = 0;
    
    // Insert each workshop
    for (const workshopData of workshopsData) {
      // Check if workshop already exists
      const existingWorkshop = await Workshop.findOne({ 
        title: workshopData.title,
        date: new Date(workshopData.date)
      });
      
      if (existingWorkshop) {
        console.log(`Skipping "${workshopData.title}" - already exists`);
        skipped++;
        continue;
      }
      
      // Create new workshop
      const workshop = new Workshop({
        title: workshopData.title,
        description: workshopData.description,
        date: new Date(workshopData.date),
        type: workshopData.type,
        category: workshopData.category,
        image: workshopData.image,
        meta: workshopData.meta || {},
        galleryImages: workshopData.galleryImages || [],
        isActive: workshopData.isActive !== undefined ? workshopData.isActive : true,
        displayOrder: workshopData.displayOrder || 0
      });
      
      await workshop.save();
      console.log(`✓ Created: "${workshopData.title}" (${workshopData.type})`);
      created++;
    }
    
    console.log('\n=== Initialization Complete ===');
    console.log(`Created: ${created} workshops`);
    console.log(`Skipped: ${skipped} workshops (already exist)`);
    console.log(`Total: ${workshopsData.length} workshops in JSON file`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing workshops:', error);
    process.exit(1);
  }
}

// Wait for database connection, then initialize
mongoose.connection.once('open', () => {
  console.log('Database connected. Starting initialization...\n');
  initWorkshops();
});

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(1);
});

