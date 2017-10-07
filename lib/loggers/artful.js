module.exports = artful;
var reduce = require('../utils/reduce');

function artful(batterie) {
    return makeArt(batterie.its);
}

function makeArt(its) {
    var previous = null;
    return reduce(its.every, function (memo, it) {
        var namePath = it.name;
        var namePathWithoutIt = namePath.slice(0, namePath.length - 1);
        var samePath = checkPaths(previous, namePathWithoutIt);
        var memoLength = memo.length;
        var memoIndex = memoLength - 1;
        var group = memo[memoIndex];
        var groupIndex = memoIndex;
        if (!samePath || !group) {
            group = '';
            groupIndex += 1;
            for (var i = 0; i < namePathWithoutIt.length; i += 1) {
                group += ' ';
            }
        }
        if (it.skip) {
            group += ' ';
        } else if (it.failed) {
            group += 'x';
        } else if (it.missed) {
            group += '-';
        } else {
            group += '.';
        }
        memo[groupIndex] = group;
        previous = namePathWithoutIt;
        return memo;
    }, ['TESTS']).concat('');
}

function checkPaths(a, b) {
    if (!a) {
        return;
    }
    var aLength = a.length;
    var bLength = b.length;
    if (aLength !== bLength) {
        return;
    }
    for (var i = 0; i < b.length; i += 1) {
        if (a[i] !== b[i]) {
            return;
        }
    }
    return true;
    // if (previous.length !== namePath)
}