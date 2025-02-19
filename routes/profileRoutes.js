const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { updateProfile, getProfile } = require('../controllers/profileController');

// Get profile
router.get('/', auth, getProfile);

// Update profile
router.put('/', auth, updateProfile);

module.exports = router;
