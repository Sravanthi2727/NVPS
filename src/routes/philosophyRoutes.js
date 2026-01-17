/**
 * Philosophy Routes
 * Routes for philosophy page
 */

const express = require('express');
const router = express.Router();

// Philosophy page
router.get('/philosophy', (req, res) => {
  res.render('philosophy', {
    title: 'The Robusta Philosophy Experience | Rabuste',
    currentPage: '/philosophy',
    additionalCSS: `
      <link rel="stylesheet" href="/css/philosophy.css">
    `,
    additionalJS: `
      <script src="/js/philosophy.js"></script>
    `
  });
});

module.exports = router;
