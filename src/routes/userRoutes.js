const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, checkPermission } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

const userValidation = [
    check('name').trim().notEmpty(),
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 })
];

router.post('/', userValidation, userController.createUser);

router.use(protect);

router.get('/', userController.getAllUsers);

router.get('/:id', userController.getUserById);

router.put('/:id', userValidation, checkPermission, userController.updateUser);

router.delete('/:id', checkPermission, userController.deleteUser);

module.exports = router;