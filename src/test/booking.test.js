const { faker } = require('@faker-js/faker');
const bookingService = require('../services/booking.service');
const { validateSchema } = require('../helpers/validator.helper');
const { bookingSchema } = require('../schemas/booking.schema');
const { getResponseTime } = require('../helpers/time.helper'); // ⬅️ AÑADIDO

let bookingId;
let token;

const bookingPayload = {
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    totalprice: faker.datatype.number({ min: 100, max: 1000 }),
    depositpaid: true,
    bookingdates: {
        checkin: "2024-01-01",
        checkout: "2024-01-10"
    },
    additionalneeds: "Breakfast"
};

describe('Booking API Tests', () => {

    beforeAll(async () => {
        token = await bookingService.generateToken();
        console.log("Token generated:", token);
    });

    test('Get ALL bookings', async () => {
        const start = Date.now();
        const res = await bookingService.getAllBookings();
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');           // HEADER
        expect(duration).toBeLessThan(2000);                             // TIME
    });

    test('Create a new booking', async () => {
        const start = Date.now();
        const res = await bookingService.createBooking(bookingPayload);
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');           // HEADER
        expect(duration).toBeLessThan(2000);                             // TIME

        bookingId = res.body.bookingid;
        console.log("Booking created with ID:", bookingId);
    });

    test('Get booking by ID + Validate Schema', async () => {
        const start = Date.now();
        const res = await bookingService.getBookingById(bookingId);
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');           // HEADER
        expect(duration).toBeLessThan(2000);                             // TIME

        validateSchema(bookingSchema, res.body);
    });

    test('Update booking using token', async () => {
        const updatedPayload = { ...bookingPayload, firstname: "QAUpdated" };

        const start = Date.now();
        const res = await bookingService.updateBooking(bookingId, token, updatedPayload);
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');           // HEADER
        expect(duration).toBeLessThan(2000);                             // TIME

        validateSchema(bookingSchema, res.body);
    });

    test('Delete booking', async () => {
        const start = Date.now();
        const res = await bookingService.deleteBooking(bookingId, token);
        const duration = getResponseTime(start);

        expect([200, 201, 204]).toContain(res.status);
        expect(res.headers).toBeDefined();                               // HEADER
        expect(duration).toBeLessThan(2000);                             // TIME
    });
});