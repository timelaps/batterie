module.exports = reduce;

function reduce(array, fn, memo_) {
    var i = 0;
    var memo = memo_;
    while (i < array.length) {
        memo = fn(memo, array[i], i, array);
        i += 1;
    }
    return memo;
}