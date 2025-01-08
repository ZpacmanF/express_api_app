const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

const productValidation = [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('description').trim().notEmpty().withMessage('Description is required'),
    check('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    check('category').trim().notEmpty().withMessage('Category is required'),
    check('stock').isInt({ min: 0 }).withMessage('Stock must be positive')
];

router.use(protect);

router.post('/', productValidation, productController.createProduct);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productValidation, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;