const { faker } = require('@faker-js/faker');

module.exports = {
    validBooking: () => ({
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        totalprice: faker.datatype.number({ min: 50, max: 150 }),
        depositpaid: true,
        bookingdates: {
            checkin: faker.date.future().toISOString().split('T')[0],
            checkout: faker.date.future().toISOString().split('T')[0],
        },
        additionalneeds: faker.lorem.word(),
    })
};