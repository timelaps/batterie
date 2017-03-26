module.exports = function forEach(list, iterator) {
    for (var i = 0; i < list.length; i++) {
        iterator(list[i], i, list);
    }
};