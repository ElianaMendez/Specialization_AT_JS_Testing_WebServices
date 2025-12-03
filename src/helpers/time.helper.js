function getResponseTime(start) {
    return Date.now() - start;
}

module.exports = { getResponseTime };