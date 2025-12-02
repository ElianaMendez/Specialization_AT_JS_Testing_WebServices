const request = require('supertest');
const { BASE_URL } = require('../config/api.config');

async function getToken() {
    const credentials = {
        username: "admin",
        password: "password123"
    };

    const response = await request(BASE_URL)
        .post('/auth')
        .send(credentials);

    return response.body.token;
}

module.exports = { getToken };