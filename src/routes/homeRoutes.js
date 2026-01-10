/**
 * Home Routes
 * Routes for main website pages
 */

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page
router.get('/', homeController.getHome);

// About page
router.get('/about', homeController.getAbout);

// Menu page
router.get('/menu', homeController.getMenu);

// Gallery page
router.get('/gallery', homeController.getGallery);

// Workshops page
router.get('/workshops', homeController.getWorkshops);

// Franchise page
router.get('/franchise', homeController.getFranchise);

// Art request page
router.get('/art-request', homeController.getArtRequest);

// Handle art request submission
router.post('/submit-art-request', homeController.submitArtRequest);

// User dashboard page
router.get('/dashboard', homeController.getUserDashboard);

module.exports = router;