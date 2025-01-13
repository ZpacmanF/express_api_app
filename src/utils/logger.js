const winston = require('winston');
const path = require('path');

const logDirectory = path.join('/tmp', 'logs');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') })
  ]
});

module.exports = logger;