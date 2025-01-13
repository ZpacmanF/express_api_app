const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  }).on('error', (err) => {
    console.error('Error starting the server:', err);
    process.exit(1);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejected promise:', err);
  process.exit(1);
});

module.exports = app;