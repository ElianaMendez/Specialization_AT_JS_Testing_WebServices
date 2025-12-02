function validateSchema(schema, data) {
    const { error } = schema.validate(data);
    if (error) throw new Error(`Schema validation error: ${error.message}`);
}

module.exports = { validateSchema };
