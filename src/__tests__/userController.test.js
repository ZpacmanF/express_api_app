const request = require('supertest');
const app = require('../app');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('User Controller', () => {
    let token;
    let userId;
    let user;

    beforeAll(async () => {
        user = await User.create({
            name: 'Teste',
            email: 'teste@teste.com',
            password: '123456',
            role: 'admin'
        });
        userId = user._id;

        token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token:', token);
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    test('Deve criar um usuário', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Novo Usuário',
                email: 'novo@teste.com',
                password: '123456'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('name', 'Novo Usuário');
        expect(res.body.user).toHaveProperty('email', 'novo@teste.com');
    });

    test('Deve falhar ao criar um usuário sem dados obrigatórios', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ name: 'Novo Usuário' });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    test('Deve listar usuários com autenticação', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('Deve listar usuários sem autorização', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(401);
    });

    test('Deve atualizar usuário', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Nome Atualizado', email: 'novo@email.com', password: 'novaSenha' });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Nome Atualizado');
        expect(res.body.email).toBe('novo@email.com');
    });
    
    test('Deve falhar ao atualizar usuário com ID inválido', async () => {
        const res = await request(app)
            .put(`/api/users/invalidUserId`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Nome Invalido' });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user ID format');
    });
    
    test('Deve falhar ao atualizar usuário sem permissão', async () => {
        const regularUser = await User.create({
            name: 'Regular User',
            email: 'regular@test.com',
            password: '123456',
            role: 'user'
        });
    
        const targetUser = await User.create({
            name: 'Target User',
            email: 'target@test.com',
            password: '123456',
            role: 'user'
        });
    
        const regularToken = jwt.sign(
            { id: regularUser._id, role: regularUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    
        const res = await request(app)
            .put(`/api/users/${targetUser._id}`)
            .set('Authorization', `Bearer ${regularToken}`)
            .send({
                name: 'Nome Atualizado',
                email: 'target@test.com',
                password: '123456'
            });
    
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe('Access denied');
    
        await User.deleteMany({
            _id: { $in: [regularUser._id, targetUser._id] }
        });
    });

    test('Deve excluir usuário', async () => {
        const res = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('User deleted successfully');
    });

    test('Deve fazer login com credenciais válidas', async () => {
        const loginUser = await User.create({
            name: 'Login Test',
            email: 'login@test.com',
            password: '123456',
            role: 'user'
        });
    
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@test.com', password: '123456' });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('id');
    });
});