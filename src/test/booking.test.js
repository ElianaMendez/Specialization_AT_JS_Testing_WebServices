const { faker } = require('@faker-js/faker');
const bookingService = require('../services/booking.service');
const { validateSchema } = require('../helpers/validator.helper');
const { bookingSchema } = require('../schemas/booking.schema');

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
        const res = await bookingService.getAllBookings();
        expect(res.status).toBe(200);
    });

    test('Create a new booking', async () => {
        const res = await bookingService.createBooking(bookingPayload);
        expect(res.status).toBe(200);
        bookingId = res.body.bookingid;
        console.log("Booking created with ID:", bookingId);
    });

    test('Get booking by ID + Validate Schema', async () => {
        const res = await bookingService.getBookingById(bookingId);
        expect(res.status).toBe(200);
        validateSchema(bookingSchema, res.body);
    });

    test('Update booking using token', async () => {
        const updatedPayload = { ...bookingPayload, firstname: "QAUpdated" };

        const res = await bookingService.updateBooking(bookingId, token, updatedPayload);
        expect(res.status).toBe(200);
        validateSchema(bookingSchema, res.body);
    });

    test('Delete booking', async () => {
        const res = await bookingService.deleteBooking(bookingId, token);
        expect([200, 201, 204]).toContain(res.status);
    });
});