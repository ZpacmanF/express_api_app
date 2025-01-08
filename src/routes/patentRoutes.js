const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const patentController = require('../controllers/patentController');
const { protect } = require('../middleware/authMiddleware');
const { cachePatentSearch } = require('../config/redis');

const patentValidation = [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('description').trim().notEmpty().withMessage('Description is required'),
    check('category').trim().notEmpty().withMessage('Category is required'),
];

router.use(protect);

router.post('/', patentValidation, patentController.createPatent);
router.get('/search', cachePatentSearch, patentController.searchPatents);
router.get('/:id', patentController.getPatentById);
router.put('/:id', patentValidation, patentController.updatePatent);
router.delete('/:id', patentController.deletePatent);

module.exports = router;