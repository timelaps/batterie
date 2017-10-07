var messages = require('./messages');
module.exports = basicLog;

function basicLog(batterie) {
    var expectations = batterie.expectations;
    var its = batterie.its;
    return [ //
        'RESULTS', //
        'TOTAL:\t' + its.every.length, //
        'PASSED:\t' + its.passed.length, //
        'SKIP:\t' + its.skipped.length, //
        'ERRED:\t' + its.erred.length, //
        'MISSED:\t' + its.missed.length, //
        'FAILED:\t' + its.failed.length, //
        '', //
        'ORDER', //
        'SYNC:\t' + its.sync.length, //
        'ASYNC:\t' + its.async.parallel.length, //
        'SERIAL:\t' + its.async.serial.length, //
        '', //
        'EXPECTATIONS', //
        'TOTAL:\t' + expectations.every.length, //
        'PASSED:\t' + expectations.passed.length, //
        'SKIP:\t' + expectations.skipped.length, //
        'FAILED:\t' + expectations.failed.length //
    ];
}