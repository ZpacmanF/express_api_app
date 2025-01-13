const express = require('express');
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

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false
    })
);

app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));

app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        url: '/api/docs/swagger.json',
        persistAuthorization: true
    }
}));

app.get('/api/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patents', patentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;