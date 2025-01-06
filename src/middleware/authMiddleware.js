const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.log('Access attempt without token');
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
            console.log(`Invalid user ID: ${decoded.id}`);
            return res.status(401).json({ message: 'Invalid user ID in token' });
        }

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            console.log(`User not found with ID: ${decoded.id}`);
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const checkPermission = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        console.log(`Access denied for user ${req.user._id}`);
        return res.status(403).json({ message: 'Access denied' });
    }
    next();  
};

module.exports = { protect, checkPermission };