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
        expect(res.headers['content-type']).toContain('json');
        expect(duration).toBeLessThan(2000);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Get booking IDs filtered by firstname', async () => {
        const res = await bookingService.getAllBookings('?firstname=John');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET booking by ID - after creating one, validating schema', async () => {
        const createRes = await bookingService.createBooking(bookingPayload);
        bookingId = createRes.body.bookingid;

        const start = Date.now();
        const res = await bookingService.getBookingById(bookingId);
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');
        expect(duration).toBeLessThanOrEqual(2000);

        validateSchema(bookingSchema, res.body);
    });

    test('Create a new booking', async () => {
        const start = Date.now();
        const res = await bookingService.createBooking(bookingPayload);
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');
        expect(duration).toBeLessThanOrEqual(2000);
        expect(res.body.bookingid).toBeDefined();
        expect(res.body.booking).toBeDefined();
        expect(res.body.booking.firstname).toBe(bookingPayload.firstname);


        bookingId = res.body.bookingid;
        console.log("Booking created with ID:", bookingId);
    });

    test('Create a booking without additional information', async () => {
        const start = Date.now();
        const res = await bookingService.createBooking(minimalPayload);
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');
        expect(duration).toBeLessThanOrEqual(2000);
        expect(res.body.bookingid).toBeDefined();
        expect(res.body.booking.firstname).toBe(minimalPayload.firstname);


        bookingId = res.body.bookingid;
        console.log("Booking created with ID:", bookingId);
    });

    test('Update firstname of booking using token', async () => {
        const updatedPayload = { ...bookingPayload, firstname: "New name" };

        const start = Date.now();
        const res = await bookingService.updateBooking(bookingId, token, updatedPayload);
        const duration = getResponseTime(start);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');
        expect(duration).toBeLessThan(2000);
        expect(res.body.firstname).toBe("New name");

        validateSchema(bookingSchema, res.body);
    });

    test('Update checkin of booking using token', async () => {
        const updateCheckinPayload = {
            ...bookingPayload,
            bookingdates: {
                ...bookingPayload.bookingdates,
                checkin: "2024-05-01"
            }
        };

        const res = await bookingService.updateBooking(bookingId, token, updateCheckinPayload);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('json');
        expect(res.body.bookingdates).toBeDefined();
        expect(res.body.bookingdates.checkin).toBe("2024-05-01");

        validateSchema(bookingSchema, res.body);
    });

    test('Delete booking', async () => {
        const start = Date.now();
        const res = await bookingService.deleteBooking(bookingId, token);
        const duration = getResponseTime(start);

        expect([200, 201, 204]).toContain(res.status);
        expect(res.headers).toBeDefined();
        expect(duration).toBeLessThan(2000);
    });

    test("Delete a booking that no longer exists", async () => {
        const res = await bookingService.deleteBooking(bookingId, token);
        expect([404, 405]).toContain(res.status);
    });
});