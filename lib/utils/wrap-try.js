module.exports = function wraptry(fn, tries, finalies) {
    var res;
    try {
        res = fn && fn();
    } catch (e) {
        res = tries ? tries(e) : e;
    } finally {
        res = finalies ? finalies(res) : res;
    }
    return res;
};