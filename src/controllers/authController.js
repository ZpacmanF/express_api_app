const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { validationResult, check } = require('express-validator');
const User = require('../models/userModel');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later'
});

const loginValidation = [
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 })
];

const authController = {
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation Errors:', errors.array());
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            const user = await User.findOne({ email }).select('+password');
            
            if (!user) {
                console.log('User not found with email:', email);
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isPasswordValid = await user.matchPassword(password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            const userResponse = user.toJSON();

            res.json({
                token,
                user: userResponse
            });
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    },

    async validateToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            res.json({ valid: true, user });
        } catch (error) {
            console.error('Token validation error:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            res.status(401).json({ message: 'Invalid token' });
        }
    }
};

module.exports = { authController, loginLimiter, loginValidation };