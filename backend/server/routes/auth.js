const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect); // Apply to all routes below

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/changepassword', changePassword);
router.get('/logout', logout);

module.exports = router;