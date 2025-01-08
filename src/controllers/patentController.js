const Patent = require('../models/patentModel');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

const patentController = {
    async createPatent(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.warn('Validation failed for patent creation');
                return res.status(400).json({ errors: errors.array() });
            }

            const sanitizedData = sanitize(req.body);
            const patent = await Patent.create({
                ...sanitizedData,
                createdBy: req.user._id
            });
            
            logger.info(`Patent created: ${patent._id}`);
            res.status(201).json(patent);
        } catch (error) {
            logger.error('Patent creation error: ' + error.message);
            res.status(400).json({
                message: 'Error creating patent',
                error: error.message
            });
        }
    },

    async searchPatents(req, res) {
        try {
            const { query = '', category } = sanitize(req.query);
            const searchCriteria = {};

            if (query) {
                searchCriteria.$text = { $search: query };
            }
            
            if (category) {
                searchCriteria.category = category;
            }

            const patents = await Patent.find(searchCriteria)
                .populate('createdBy', 'name email');

            logger.info('Search performed successfully');
            res.status(200).json(patents);
        } catch (error) {
            logger.error('Search error: ' + error.message);
            res.status(500).json({
                message: 'Error searching patents',
                error: error.message
            });
        }
    },

    async getPatentById(req, res) {
        try {
            const patent = await Patent.findById(sanitize(req.params.id))
                .populate('createdBy', 'name email');

            if (!patent) {
                logger.warn('Patent not found');
                return res.status(404).json({ message: 'Patent not found' });
            }

            res.status(200).json(patent);
        } catch (error) {
            logger.error('Error retrieving patent: ' + error.message);
            res.status(500).json({
                message: 'Error retrieving patent',
                error: error.message
            });
        }
    },

    async updatePatent(req, res) {
        try {
            const existingPatent = await Patent.findOne({
                _id: req.params.id,
                createdBy: req.user._id
            });

            if (!existingPatent) {
                logger.warn('Patent not found or unauthorized');
                return res.status(404).json({ message: 'Patent not found or unauthorized' });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                logger.warn('Validation failed for patent update');
                return res.status(400).json({ errors: errors.array() });
            }

            const sanitizedData = sanitize(req.body);
            const patent = await Patent.findOneAndUpdate(
                { _id: req.params.id },
                sanitizedData,
                { new: true, runValidators: true }
            );

            logger.info(`Patent updated: ${patent._id}`);
            res.status(200).json(patent);
        } catch (error) {
            logger.error('Patent update error: ' + error.message);
            res.status(400).json({
                message: 'Error updating patent',
                error: error.message
            });
        }
    },

    async deletePatent(req, res) {
        try {
            const patent = await Patent.findOneAndDelete({
                _id: sanitize(req.params.id),
                createdBy: req.user._id
            });

            if (!patent) {
                logger.warn('Patent not found or unauthorized');
                return res.status(404).json({ message: 'Patent not found or unauthorized' });
            }

            logger.info(`Patent deleted: ${patent._id}`);
            res.status(200).json({ message: 'Patent deleted successfully' });
        } catch (error) {
            logger.error('Patent deletion error: ' + error.message);
            res.status(500).json({
                message: 'Error deleting patent',
                error: error.message
            });
        }
    }
};

module.exports = patentController;