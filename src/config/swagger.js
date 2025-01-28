const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Patents API',
      version: '1.0.0',
      description: 'API for managing patents and users with authentication, caching, and rate limiting'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://express-api-app-d23u.vercel.app'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      }
    ],
    components: {
      schemas: {
        Patent: {
          type: 'object',
          required: ['name', 'description', 'category', 'createdBy'],
          properties: {
            name: { 
              type: 'string', 
              description: 'Patent name',
              minLength: 1 
            },
            description: { 
              type: 'string', 
              description: 'Patent description',
              minLength: 1 
            },
            category: { 
              type: 'string', 
              description: 'Patent category',
              minLength: 1 
            },
            createdBy: { 
              type: 'string', 
              description: 'MongoDB ObjectId of the user who created the patent',
              pattern: '^[0-9a-fA-F]{24}$'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Automatically set to current date'
            }
          }
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { 
              type: 'string',
              description: 'User name',
              minLength: 1
            },
            email: { 
              type: 'string', 
              format: 'email',
              description: 'Unique email address',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            },
            password: { 
              type: 'string',
              format: 'password',
              description: 'Will be hashed before storage',
              minLength: 6
            },
            role: { 
              type: 'string', 
              enum: ['user', 'admin'],
              default: 'user',
              description: 'User role, defaults to "user"'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Automatically set to current date'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, 'swagger.js')  
  ]
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login to the system
 *     description: Login with rate limiting (5 attempts per 15 minutes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       pattern: '^[0-9a-fA-F]{24}$'
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [user, admin]
 *
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: Register a new user in the system with validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *                 description: User's role in the system
 *                 example: user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The user ID
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only, with Redis cache)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users (cached for 1 hour)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     pattern: '^[0-9a-fA-F]{24}$'
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   role:
 *                     type: string
 *                     enum: [user, admin]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 * 
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

const specs = swaggerJsdoc(options);

module.exports = specs;