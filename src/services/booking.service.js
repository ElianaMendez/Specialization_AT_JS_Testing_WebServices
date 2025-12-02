const request = require('supertest');
const { BASE_URL } = require('../config/api.config');
const { AUTH, BOOKING } = require('../config/endpoints.config');

class BookingService {

    async getAllBookings() {
        return await request(BASE_URL)
            .get(BOOKING.ALL)
            .set('Accept', 'application/json');
    }

    async createBooking(payload) {
        return await request(BASE_URL)
            .post(BOOKING.ALL)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(payload);
    }

    async getBookingById(id) {
        return await request(BASE_URL)
            .get(`${BOOKING.ALL}/${id}`)
            .set('Accept', 'application/json');
    }

    async updateBooking(id, token, payload) {
        return await request(BASE_URL)
            .put(`${BOOKING.ALL}/${id}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .set('Cookie', [`token=${token}`])
            .send(payload);
    }

    async deleteBooking(id, token) {
        return await request(BASE_URL)
            .delete(`${BOOKING.ALL}/${id}`)
            .set('Accept', 'application/json')
            .set('Cookie', [`token=${token}`]);
    }

    async generateToken() {
        const res = await request(BASE_URL)
            .post(AUTH)
            .set('Content-Type', 'application/json')
            .send({ username: "admin", password: "password123" });

        return res.body.token;
    }
}

module.exports = new BookingService();