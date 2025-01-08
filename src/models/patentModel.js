const mongoose = require('mongoose');

const patentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a patent name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

patentSchema.index({ name: 'text', description: 'text' });

const Patent = mongoose.model('patents', patentSchema, 'patents');

module.exports = Patent;
