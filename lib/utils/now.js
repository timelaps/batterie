var performance = global.performance;
var now;
module.exports = performance && (now = performance.now) ? function () {
    return now.call(performance);
} : (global.process ? (function () {
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