var forEach = require('../utils/for-each');
module.exports = function basicLog(batterie) {
    var expectations = batterie.expectations;
    var its = batterie.its;
    forEach(expectations.missed, function (missed) {
        console.log(missed.pretty());
    });
    forEach(expectations.failed, function (failed) {
        console.log(failed.pretty());
    });
    console.log('TOTAL:\t', its.every.length);
    console.log('PASSED:\t', its.passed.length);
    console.log('FAILED:\t', its.failed.length);
    console.log('MISSED:\t', its.missed.length);
    console.log('SYNC:\t', its.sync.length);
    console.log('ASYNC:\t', its.async.parallel.length);
    console.log('SERIAL:\t', its.async.serial.length);
};