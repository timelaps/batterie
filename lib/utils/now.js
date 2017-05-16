var performance = global.performance;
module.exports = performance && performance.now || (global.process ? (function () {
    uptime = process.uptime;
    return function () {
        return uptime() / 1000;
    };
}()) : (function () {
    var then = now();
    return function () {
        return now() - then;
    };

    function now() {
        return +(new Date());
    }
}()));