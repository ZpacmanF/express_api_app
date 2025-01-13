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
            const user = await User.findOne({ email });

            if (!user || !(await user.matchPassword(password))) {
                console.log(`Failed login attempt for email: ${email}`);
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            console.log(`Successful login for user: ${user._id}`);
            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error(`Login error: ${error.message}`);
            res.status(500).json({ message: 'Server error' });
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
            console.error(`Token validation error: ${error.message}`);
            res.status(401).json({ message: 'Invalid token' });
        }
    }
};

module.exports = { authController, loginLimiter, loginValidation };