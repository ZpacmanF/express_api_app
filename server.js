const app = require('./src/app');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
}).on('error', (err) => {
    console.error('Error starting the server:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught error:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejected promise:', err);
    process.exit(1);
});
