const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Patents API',
      version: '1.0.0',
      description: 'API for managing patents and users'
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://express-api-app-alpha.vercel.app/api'
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
          properties: {
            name: { type: 'string', description: 'Patent name' },
            description: { type: 'string', description: 'Patent description' },
            category: { type: 'string', description: 'Patent category' },
            createdBy: { type: 'string', description: 'User ID who created the Patent' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          required: ['name', 'description', 'category']
        },
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
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
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: password123
 *     Patent:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           example: Sample Patent
 *         description:
 *           type: string
 *           example: Detailed description of the patent
 *         category:
 *           type: string
 *           example: Technology
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: securepass123
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 * 
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           examples:
 *             userLogin:
 *               value:
 *                 email: user@example.com
 *                 password: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               user:
 *                 id: "123"
 *                 name: "John Doe"
 *                 email: "user@example.com"
 *                 role: "user"
 *       401:
 *         description: Invalid credentials
 * 
 * /api/auth/validate:
 *   get:
 *     tags: [Authentication]
 *     summary: Validate JWT token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid token
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
 *             $ref: '#/components/schemas/Patent'
 *     responses:
 *       201:
 *         description: Patent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patent'
 * 
 * api/patents/search:
 *   get:
 *     tags: [Patents]
 *     summary: Search Patents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term
 *         example: technology
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *         example: Tech
 *     responses:
 *       200:
 *         description: List of Patents
 *         content:
 *           application/json:
 *             example:
 *               - id: "1"
 *                 name: "Patent 1"
 *                 description: "Description"
 *                 category: "Tech"
 * 
 * /api/patents/{id}:
 *   get:
 *     tags: [Patents]
 *     summary: Get Patent by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Patent details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patent'
 *   put:
 *     tags: [Patents]
 *     summary: Update Patent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patent'
 *     responses:
 *       200:
 *         description: Patent updated
 *   delete:
 *     tags: [Patents]
 *     summary: Delete Patent
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patent deleted
 * 
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             example:
 *               - id: "1"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 role: "user"
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
 *     responses:
 *       200:
 *         description: User details
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
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
 *     responses:
 *       200:
 *         description: User deleted
 */

const specs = swaggerJsdoc(options);

module.exports = specs;