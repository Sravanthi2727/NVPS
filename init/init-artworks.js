const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Artwork = require('../models/Artwork');
const connectDB = require('../config/database');

// Connect to database
connectDB();

// Read artworks JSON file
const artworksData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'artworks.json'), 'utf8')
);

// Function to initialize artworks in database
async function initArtworks() {
  try {
    console.log('Starting artwork initialization...');
    
    // Clear existing artworks (optional - comment out if you want to keep existing data)
    // await Artwork.deleteMany({});
    // console.log('Cleared existing artworks');
    
    let created = 0;
    let skipped = 0;
    
    // Insert each artwork
    for (const artworkData of artworksData) {
      // Check if artwork already exists
      const existingArtwork = await Artwork.findOne({ 
        title: artworkData.title,
        artist: artworkData.artist 
      });
      
      if (existingArtwork) {
        console.log(`Skipping "${artworkData.title}" - already exists`);
        skipped++;
        continue;
      }
      
      // Create new artwork
      const artwork = new Artwork({
        title: artworkData.title,
        artist: artworkData.artist,
        price: artworkData.price,
        image: artworkData.image,
        category: artworkData.category,
        description: artworkData.description,
        isAvailable: true,
        displayOrder: artworkData.id
      });
      
      await artwork.save();
      console.log(`✓ Created: "${artworkData.title}" by ${artworkData.artist}`);
      created++;
    }
    
    console.log('\n=== Initialization Complete ===');
    console.log(`Created: ${created} artworks`);
    console.log(`Skipped: ${skipped} artworks (already exist)`);
    console.log(`Total: ${artworksData.length} artworks in JSON file`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing artworks:', error);
    process.exit(1);
  }
}

// Wait for database connection, then initialize
mongoose.connection.once('open', () => {
  console.log('Database connected. Starting initialization...\n');
  initArtworks();
});

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(1);
});

