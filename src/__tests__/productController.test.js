const request = require('supertest');
const app = require('../app');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Product Controller', () => {
    let token;
    let userId;
    let productId;
    let user;

    beforeAll(async () => {
        user = await User.create({
            name: 'Test User',
            email: 'test@product.com',
            password: '123456',
            role: 'admin'
        });
        userId = user._id;
        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const product = await Product.create({
            name: 'Test Product',
            description: 'Test Description',
            price: 99.99,
            category: 'Test Category',
            stock: 10,
            createdBy: userId
        });
        productId = product._id;
    });

    afterAll(async () => {
        await Product.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    test('Deve criar um produto com autenticação', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New Product',
                description: 'New Description',
                price: 149.99,
                category: 'New Category',
                stock: 20
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toBe('New Product');
        expect(res.body.createdBy).toBe(userId.toString());
    });

    test('Deve falhar ao criar produto sem autenticação', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({
                name: 'New Product',
                description: 'New Description',
                price: 149.99,
                category: 'New Category',
                stock: 20
            });
        
        expect(res.statusCode).toBe(401);
    });

    test('Deve falhar ao criar produto com dados inválidos', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New Product',
            });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    test('Deve pesquisar produtos com autenticação', async () => {
        const res = await request(app)
            .get('/api/products/search')
            .set('Authorization', `Bearer ${token}`)
            .query({ query: 'Test', category: 'Test Category' });
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });

    test('Deve obter produto por ID com autenticação', async () => {
        const res = await request(app)
            .get(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(productId.toString());
        expect(res.body).toHaveProperty('createdBy');
    });

    test('Deve atualizar produto com autenticação', async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Product',
                description: 'Updated Description',
                price: 199.99,
                category: 'Updated Category',
                stock: 30
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated Product');
    });

    test('Deve falhar ao atualizar produto de outro usuário', async () => {
        const otherUser = await User.create({
            name: 'Other User',
            email: 'other@test.com',
            password: '123456',
            role: 'user'
        });
        const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send({
                name: 'Unauthorized Update',
                description: 'Test Description',
                price: 99.99,
                category: 'Test Category',
                stock: 10
            });
        
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('Product not found or unauthorized');
    });

    test('Deve excluir produto com autenticação', async () => {
        const res = await request(app)
            .delete(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Product deleted successfully');
    });
});