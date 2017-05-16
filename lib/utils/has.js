module.exports = function (obj, key) {
    return obj ? obj.hasOwnProperty(key) : false;
};