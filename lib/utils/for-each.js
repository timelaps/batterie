module.exports = function forEach(list, iterator) {
    var list2 = [];
    for (var i = 0; i < list.length; i++) {
        list2.push(iterator(list[i], i, list));
    }
    return list2;
};