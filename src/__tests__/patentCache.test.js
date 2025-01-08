const request = require('supertest');
const app = require('../app');
const Patent = require('../models/patentModel');
const User = require('../models/userModel');
const { redis } = require('../config/redis');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Patent Cache', () => {
    let token;
    let userId;

    beforeAll(async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@patent.com',
            password: '123456',
            role: 'admin'
        });
        userId = user._id;
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await Patent.create([
            {
                name: 'Test Patent 1',
                description: 'Test Description 1',
                category: 'Category A',
                createdBy: userId
            },
            {
                name: 'Test Patent 2',
                description: 'Test Description 2',
                category: 'Category A',
                createdBy: userId
            }
        ]);
    });

    afterAll(async () => {
        await Patent.deleteMany({});
        await User.deleteMany({});
        await redis.flushall();
        await mongoose.connection.close();
    });

    test('Deve cachear a busca de patentes', async () => {
        const firstResponse = await request(app)
            .get('/api/patents/search')
            .set('Authorization', `Bearer ${token}`)
            .query({ category: 'Category A' });

        expect(firstResponse.status).toBe(200);

        const cacheKey = `patent:search::Category A`;
        const cachedData = await redis.get(cacheKey);
        expect(cachedData).toBeTruthy();
        expect(JSON.parse(cachedData)).toEqual(firstResponse.body);

        const secondResponse = await request(app)
            .get('/api/patents/search')
            .set('Authorization', `Bearer ${token}`)
            .query({ category: 'Category A' });

        expect(secondResponse.status).toBe(200);
        expect(secondResponse.body).toEqual(firstResponse.body);
    });
});