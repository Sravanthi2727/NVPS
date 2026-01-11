/**
 * Script to fix cart items that don't have proper type property
 * This will add type: 'art' to art items in existing user carts
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nehasharma221006:Neha%40123@cluster0.acne1i1.mongodb.net/rabuste-coffee?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('../models/User');

async function fixCartTypes() {
  try {
    console.log('Starting cart type fix...');
    
    // Find all users with cart items
    const users = await User.find({ 'cart.0': { ₹exists: true } });
    console.log(`Found ${users.length} users with cart items`);
    
    let updatedUsers = 0;
    let updatedItems = 0;
    
    for (const user of users) {
      let userUpdated = false;
      
      for (const cartItem of user.cart) {
        // Check if item doesn't have type property or has wrong type
        if (!cartItem.type) {
          // Detect if this is an art item based on name or image
          const isArtItem = (cartItem.image && cartItem.image.includes('/assets/gallery/')) ||
                           (cartItem.name && (
                             cartItem.name.includes('by ') || 
                             cartItem.name.includes('Wilderness') || 
                             cartItem.name.includes('Mountain') || 
                             cartItem.name.includes('Serenity') ||
                             cartItem.name.includes('Abstract') ||
                             cartItem.name.includes('Painting') ||
                             cartItem.name.includes('Photography')
                           ));
          
          if (isArtItem) {
            cartItem.type = 'art';
            cartItem.quantity = 1; // Ensure art items have quantity 1
            console.log(`Fixed art item: ${cartItem.name}`);
            userUpdated = true;
            updatedItems++;
          } else {
            cartItem.type = 'menu';
            console.log(`Fixed menu item: ${cartItem.name}`);
            userUpdated = true;
            updatedItems++;
          }
        }
      }
      
      if (userUpdated) {
        user.markModified('cart');
        await user.save();
        updatedUsers++;
        console.log(`Updated user: ${user.email}`);
      }
    }
    
    console.log(`\n✅ Migration completed!`);
    console.log(`Updated ${updatedUsers} users`);
    console.log(`Updated ${updatedItems} cart items`);
    
  } catch (error) {
    console.error('Error fixing cart types:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the fix
fixCartTypes();