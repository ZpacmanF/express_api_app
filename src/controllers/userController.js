const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');

const userController = {
    async createUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const sanitizedData = sanitize(req.body);
            const user = await User.create(sanitizedData);

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            console.log(`User created: ${user._id}`);
            res.status(201).json({ user: { ...user.toObject(), password: undefined }, token });
        } catch (error) {
            console.error(`Error creating user: ${error.message}`);
            res.status(400).json({
                message: 'Error creating user',
                error: error.message
            });
        }
    },

    async getAllUsers(req, res) {
        try {
            if (req.user.role !== 'admin') {
                console.log(`Access denied for user ${user._id}`);
                return res.status(403).json({ message: 'Access denied' });
            }

            const users = await User.find({}).select('-password');
            res.status(200).json(users);
        } catch (error) {
            console.error(`Error fetching users: ${error.message}`);
            res.status(500).json({ message: 'Error fetching users' });
        }
    },

    async getUserById(req, res) {
        try {
            if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            console.error(`Error fetching user: ${error.message}`);
            res.status(500).json({ message: 'Error fetching user' });
        }
    },

    async updateUser(req, res) {
        try {
            if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({ message: 'Invalid user ID format' });
            }
    
            if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
                console.log(`Access denied: User ${req.user._id} (role: ${req.user.role}) attempting to update user ${req.params.id}`);
                return res.status(403).json({ message: 'Access denied' });
            }
    
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation Errors:', errors.array());
                return res.status(400).json({ errors: errors.array() });
            }
    
            const userToUpdate = await User.findById(req.params.id);
            if (!userToUpdate) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const sanitizedData = sanitize(req.body);
    
            const user = await User.findByIdAndUpdate(
                req.params.id,
                sanitizedData,
                { new: true, runValidators: true }
            ).select('-password');
    
            res.status(200).json(user);
        } catch (error) {
            console.error(`Error updating user: ${error.message}`);
            res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    },

    async deleteUser(req, res) {
        try {
            if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
                return res.status(403).json({ message: 'Access denied' });
            }

            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(`Error deleting user: ${error.message}`);
            res.status(500).json({ message: 'Error deleting user' });
        }
    }
};

module.exports = userController;