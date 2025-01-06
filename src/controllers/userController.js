const User = require('../models/userModel');

const userController = {
    async createUser(req, res) {
        try {
            const user = await User.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({
                message: 'Error creating user',
                error: error.message
            });
        }
    },

    async getAllUsers(req, res) {
        try {
            const users = await User.find({});
            console.log(users);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({
                message: 'Error retrieving users',
                error: error.message
            });
        }
    },

    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({
                message: 'Error retrieving user',
                error: error.message
            });
        }
    },

    async updateUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({
                message: 'Error updating user',
                error: error.message
            });
        }
    },

    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({
                message: 'Error deleting user',
                error: error.message
            });
        }
    }
};

module.exports = userController;
