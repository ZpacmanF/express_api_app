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
          ? 'https://express-api-app-alpha.vercel.app'
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
 * /api/patents/search:
 *   get:
 *     tags: [Patents]
 *     summary: Search Patents
 *     description: Performs text search on name and description fields using MongoDB text index
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Text search query (uses MongoDB text index)
 *     responses:
 *       200:
 *         description: List of Patents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Patent'
 *                   - type: object
 *                     properties:
 *                       createdBy:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 * 
 * /api/patents:
 *   post:
 *     tags: [Patents]
 *     summary: Create a new Patent
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, category]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *               description:
 *                 type: string
 *                 minLength: 1
 *               category:
 *                 type: string
 *                 minLength: 1
 *     responses:
 *       201:
 *         description: Patent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Patent'
 *                 - type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       pattern: '^[0-9a-fA-F]{24}$'
 * 
 * /api/users:
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
 */

const specs = swaggerJsdoc(options);

module.exports = specs;