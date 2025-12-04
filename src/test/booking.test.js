const { faker } = require('@faker-js/faker');
const bookingService = require('../services/booking.service');
const { validateSchema } = require('../helpers/validator.helper');
const { bookingSchema } = require('../schemas/booking.schema');
const { getResponseTime } = require('../helpers/time.helper');

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

const minimalPayload = {
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    totalprice: faker.datatype.number({ min: 100, max: 1000 }),
    depositpaid: false,
    bookingdates: {
        checkin: "2025-02-01",
        checkout: "2025-02-05"
    }
};

describe('These are the Booking API Tests performed for the project', () => {

    beforeAll(async () => {
        token = await bookingService.generateToken();
        console.log("Token generated:", token);
    });

    test('Get all bookings', async () => {
        const start = Date.now();
        const response = await bookingService.getAllBookings();
        const duration = getResponseTime(start);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('json');
        expect(Array.isArray(response.body)).toBe(true);
        expect(duration).toBeLessThan(2000);
    });

    test('Get booking IDs filtered by first name', async () => {
        const response = await bookingService.getAllBookings('?firstname=John');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET booking by ID after creating one, then validate the schema.', async () => {
        const createResponse = await bookingService.createBooking(bookingPayload);
        bookingId = createResponse.body.bookingid;

        const start = Date.now();
        const response = await bookingService.getBookingById(bookingId);
        const duration = getResponseTime(start);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('json');
        expect(duration).toBeLessThanOrEqual(2000);

        validateSchema(bookingSchema, response.body);
    });

    test('Create a new booking', async () => {
        const start = Date.now();
        const response = await bookingService.createBooking(bookingPayload);
        const duration = getResponseTime(start);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('json');
        expect(response.body.bookingid).toBeDefined();
        expect(response.body.booking).toBeDefined();
        expect(response.body.booking.firstname).toBe(bookingPayload.firstname);
        expect(duration).toBeLessThanOrEqual(2000);

        bookingId = response.body.bookingid;
        console.log("Booking created with ID:", bookingId);
    });

    test('Create a booking without additional information', async () => {
        const start = Date.now();
        const response = await bookingService.createBooking(minimalPayload);
        const duration = getResponseTime(start);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('json');
        expect(response.body.bookingid).toBeDefined();
        expect(response.body.booking.firstname).toBe(minimalPayload.firstname);
        expect(duration).toBeLessThanOrEqual(2000);


        bookingId = response.body.bookingid;
        console.log("Booking created with ID:", bookingId);
    });

    test('Update the first name of a booking using a token', async () => {
        const updatedPayload = { ...bookingPayload, firstname: "New name" };

        const start = Date.now();
        const response = await bookingService.updateBooking(bookingId, token, updatedPayload);
        const duration = getResponseTime(start);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('json');
        expect(response.body.firstname).toBe("New name");
        expect(duration).toBeLessThan(2000);

        validateSchema(bookingSchema, response.body);
    });

    test('Update the check-in date of a booking using a token', async () => {
        const updateCheckinPayload = {
            ...bookingPayload,
            bookingdates: {
                ...bookingPayload.bookingdates,
                checkin: "2024-05-01"
            }
        };

        const response = await bookingService.updateBooking(bookingId, token, updateCheckinPayload);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('json');
        expect(response.body.bookingdates).toBeDefined();
        expect(response.body.bookingdates.checkin).toBe("2024-05-01");

        validateSchema(bookingSchema, response.body);
    });

    test('Delete the booking', async () => {
        const start = Date.now();
        const response = await bookingService.deleteBooking(bookingId, token);
        const duration = getResponseTime(start);

        expect([200, 201, 204]).toContain(response.status);
        expect(response.headers).toBeDefined();
        expect(duration).toBeLessThan(2000);
    });

    test("Attempt to delete a booking if it no longer exists", async () => {
        const response = await bookingService.deleteBooking(bookingId, token);
        expect([404, 405]).toContain(response.status);
    });
});