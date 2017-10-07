module.exports = function callItem(item) {
    return function (handler) {
        return handler(item);
    };
};