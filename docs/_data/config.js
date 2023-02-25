require('dotenv').config({ path: '../.env'});

module.exports = function() {
  return {
    serverUrl: process.env.SERVER_URL || 'http://localhost',
  };
};
