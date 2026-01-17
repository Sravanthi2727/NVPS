/**
 * Art Routes
 * Routes for art request and art-related functionality
 */

const express = require('express');
const router = express.Router();

// Art request page
router.get('/art-request', (req, res) => {
  console.log('🎨 ART REQUEST ROUTE CALLED');
  res.render('art-request', {
    title: 'Submit Your Art - Rabuste Coffee',
    description: 'Submit your artwork to be featured in Rabuste Coffee gallery.',
    currentPage: '/art-request',
    layout: false // Use standalone layout
  });
});

// Handle art request submission
router.post('/submit-art-request', (req, res) => {
  console.log('🎨 ART REQUEST SUBMISSION:', req.body);
  // Handle form submission here
  // For now, just log and redirect back with success message
  res.redirect('/art-request?success=true');
});

module.exports = router;