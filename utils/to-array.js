module.exports = function (item) {
    return Array.isArray(item) ? item : (item && item.length === 1 ? [item[0]] : Array.apply(null, item));
};