module.exports = function callItem(item) {
    return function (handler) {
        handler(item);
    };
};