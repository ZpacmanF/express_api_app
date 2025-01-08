const { closeConnection } = require('./src/config/redis');

jest.setTimeout(10000);

afterAll(async () => {
  await closeConnection();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
});