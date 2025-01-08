const request = require('supertest');
const app = require('../app');
const Patent = require('../models/patentModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Patent Controller', () => {
    let token;
    let userId;
    let patentId;
    let user;

    beforeAll(async () => {
        user = await User.create({
            name: 'Test User',
            email: 'test@patent.com',
            password: '123456',
            role: 'admin'
        });
        userId = user._id;
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const patent = await Patent.create({
            name: 'Test Patent',
            description: 'Test Description',
            category: 'Test Category',
            createdBy: userId
        });
        patentId = patent._id;
    });

    afterAll(async () => {
        await Patent.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    test('Deve criar um patent com autenticação', async () => {
        const res = await request(app)
            .post('/api/patents')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New Patent',
                description: 'New Description',
                category: 'New Category',
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toBe('New Patent');
        expect(res.body.createdBy).toBe(userId.toString());
    });

    test('Deve falhar ao criar patent sem autenticação', async () => {
        const res = await request(app)
            .post('/api/patents')
            .send({
                name: 'New Patent',
                description: 'New Description',
                category: 'New Category',
            });
        
        expect(res.statusCode).toBe(401);
    });

    test('Deve falhar ao criar patent com dados inválidos', async () => {
        const res = await request(app)
            .post('/api/patents')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New Patent',
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    test('Deve pesquisar patents com autenticação', async () => {
        const res = await request(app)
            .get('/api/patents/search')
            .set('Authorization', `Bearer ${token}`)
            .query({ query: 'Test', category: 'Test Category' });
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('Deve obter patent por ID com autenticação', async () => {
        const res = await request(app)
            .get(`/api/patents/${patentId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(patentId.toString());
        expect(res.body).toHaveProperty('createdBy');
    });

    test('Deve atualizar patent com autenticação', async () => {
        const res = await request(app)
            .put(`/api/patents/${patentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Patent',
                description: 'Updated Description',
                category: 'Updated Category',
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated Patent');
    });

    test('Deve falhar ao atualizar patent de outro usuário', async () => {
        const otherUser = await User.create({
            name: 'Other User',
            email: 'other@test.com',
            password: '123456',
            role: 'user'
        });
        const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        const res = await request(app)
            .put(`/api/patents/${patentId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({
                name: 'Unauthorized Update',
                description: 'Test Description',
                category: 'Test Category',
            });
        
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Patent not found or unauthorized');
    });

    test('Deve excluir patent com autenticação', async () => {
        const res = await request(app)
            .delete(`/api/patents/${patentId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Patent deleted successfully');
    });
});