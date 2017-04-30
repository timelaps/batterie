var forEach = require('../utils/for-each');
module.exports = basicLog;

function basicLog(batterie) {
    return function () {
        var expectations = batterie.expectations;
        var descriptions = batterie.descriptions;
        var its = batterie.its;
        var missed = [];
        var failed = [];
        var erred = [];
        forEach(descriptions.errors, function (item) {
            erred.push(item.pretty());
        });
        forEach(expectations.missed, function (item) {
            missed.push(item.pretty());
        });
        forEach(expectations.failed, function (item) {
            failed.push(item.pretty());
        });
        batterie.write('results', erred.concat(missed, failed, ['RESULTS', //
            'TOTAL:\t' + its.every.length, 'PASSED:\t' + its.passed.length, 'FAILED:\t' + its.failed.length, 'MISSED:\t' + its.missed.length, 'SYNC:\t' + its.sync.length, 'ASYNC:\t' + its.async.parallel.length, 'SERIAL:\t' + its.async.serial.length, 'EXPECTATIONS', 'TOTAL:\t' + expectations.every.length, 'PASSED:\t' + expectations.passed.length, 'FAILED:\t' + expectations.failed.length
        ]))
    };
}