const User = require('../models/userModel');

const userController = {
    async createUser(req, res) {
        try {
            const user = await User.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({
                message: 'Erro ao criar usuário',
                error: error.message
            });
        }
    },

    async getAllUsers(req, res) {
        try {
            const users = await User.find({});
            console.log(users)
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao buscar usuários',
                error: error.message
            });
        }
    },

    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao buscar usuário',
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
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            
            res.status(200).json(user);
        } catch (error) {
            res.status(400).json({
                message: 'Erro ao atualizar usuário',
                error: error.message
            });
        }
    },

    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }
            
            res.status(200).json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            res.status(500).json({
                message: 'Erro ao deletar usuário',
                error: error.message
            });
        }
    }
};

module.exports = userController;