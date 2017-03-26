module.exports = function logError(e) {
    console.error ? console.error(e) : console.log(e);
};