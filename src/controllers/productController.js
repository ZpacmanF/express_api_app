const Product = require('../models/productModel');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const productController = {
    async createProduct(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.warn('Validation failed for product creation');
                return res.status(400).json({ errors: errors.array() });
            }

            const sanitizedData = sanitize(req.body);
            const product = await Product.create({
                ...sanitizedData,
                createdBy: req.user._id
            });
            
            logger.info(`Product created: ${product._id}`);
            res.status(201).json(product);
        } catch (error) {
            logger.error('Product creation error: ' + error.message);
            res.status(400).json({
                message: 'Error creating product',
                error: error.message
            });
        }
    },

    async searchProducts(req, res) {
        try {
            const { query = '', category } = sanitize(req.query);
            const searchCriteria = {};

            if (query) {
                searchCriteria.$text = { $search: query };
            }
            
            if (category) {
                searchCriteria.category = category;
            }

            const products = await Product.find(searchCriteria)
                .populate('createdBy', 'name email');

            logger.info('Search performed successfully');
            res.status(200).json(products);
        } catch (error) {
            logger.error('Search error: ' + error.message);
            res.status(500).json({
                message: 'Error searching products',
                error: error.message
            });
        }
    },

    async getProductById(req, res) {
        try {
            const product = await Product.findById(sanitize(req.params.id))
                .populate('createdBy', 'name email');

            if (!product) {
                logger.warn('Product not found');
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json(product);
        } catch (error) {
            logger.error('Error retrieving product: ' + error.message);
            res.status(500).json({
                message: 'Error retrieving product',
                error: error.message
            });
        }
    },

    async updateProduct(req, res) {
        try {
            const existingProduct = await Product.findOne({
                _id: req.params.id,
                createdBy: req.user._id
            });

            if (!existingProduct) {
                logger.warn('Product not found or unauthorized');
                return res.status(404).json({ message: 'Product not found or unauthorized' });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.warn('Validation failed for product update');
                return res.status(400).json({ errors: errors.array() });
            }

            const sanitizedData = sanitize(req.body);
            const product = await Product.findOneAndUpdate(
                { _id: req.params.id },
                sanitizedData,
                { new: true, runValidators: true }
            );

            logger.info(`Product updated: ${product._id}`);
            res.status(200).json(product);
        } catch (error) {
            logger.error('Product update error: ' + error.message);
            res.status(400).json({
                message: 'Error updating product',
                error: error.message
            });
        }
    },

    async deleteProduct(req, res) {
        try {
            const product = await Product.findOneAndDelete({
                _id: sanitize(req.params.id),
                createdBy: req.user._id
            });

            if (!product) {
                logger.warn('Product not found or unauthorized');
                return res.status(404).json({ message: 'Product not found or unauthorized' });
            }

            logger.info(`Product deleted: ${product._id}`);
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            logger.error('Product deletion error: ' + error.message);
            res.status(500).json({
                message: 'Error deleting product',
                error: error.message
            });
        }
    }
};

module.exports = productController;