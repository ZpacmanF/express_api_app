const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, checkPermission, isAdmin } = require('../middleware/authMiddleware');
const { check } = require('express-validator');
const{ cacheUsers } = require('../config/redis');

const userValidation = [
    check('name').trim().notEmpty(),
    check('email').isEmail().normalizeEmail(),
    check('password').isLength({ min: 6 })
];

router.post('/', userValidation, userController.createUser);

router.use(protect);

router.get('/', protect, isAdmin, cacheUsers, userController.getAllUsers);
router.get('/:id', checkPermission, userController.getUserById);
router.put('/:id', checkPermission, userValidation, userController.updateUser); 
router.delete('/:id', checkPermission, userController.deleteUser);

module.exports = router;
