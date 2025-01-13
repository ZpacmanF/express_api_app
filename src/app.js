const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patentRoutes = require('./routes/patentRoutes');

const app = express();

connectDB();

// Configuração do Helmet com exceções para o Swagger
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    })
);

app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));

// Configuração do Swagger UI
const swaggerOptions = {
    swaggerOptions: {
        url: '/api/docs/swagger.json',  // Especifica onde encontrar o arquivo swagger.json
        persistAuthorization: true
    }
};

// Rota para servir o arquivo swagger.json
app.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

// Setup do Swagger UI
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(specs, swaggerOptions));

// Suas rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patents', patentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;