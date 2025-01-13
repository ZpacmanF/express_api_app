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
                ? 'https://express-api-fzftl8ybq-zpacmanfs-projects.vercel.app/api'
                : 'http://localhost:3000/',
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
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;