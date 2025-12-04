require('dotenv').config();

module.exports = {
  BASE_URL: process.env.BASE_URL || 'https://restful-booker.herokuapp.com',
  ADMIN_USER: process.env.ADMIN_USER,
  ADMIN_PASS: process.env.ADMIN_PASS
};
