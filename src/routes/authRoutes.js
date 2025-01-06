const express = require('express');
const router = express.Router();
const { authController, loginLimiter, loginValidation } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginLimiter, loginValidation, authController.login);
router.get('/validate', protect, authController.validateToken);

module.exports = router;