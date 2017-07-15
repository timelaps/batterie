var forEach = require('../utils/for-each');
module.exports = basicLog;

function basicLog(batterie) {
    return function () {
        var erred = [];
        var missed = [];
        var failed = [];
        var expectations = batterie.expectations;
        var descriptions = batterie.descriptions;
        var its = batterie.its;
        append(descriptions.errors, erred);
        append(its.erred, erred);
        append(expectations.missed, missed);
        append(expectations.failed, failed);
        return [].concat(erred, //
            missed, //
            failed, //
            [ //
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
            ]);
    };

    function append(list, array) {
        forEach(list, function (item) {
            if (!item.skipping) {
                array.push(item.pretty());
            }
        });
    }
}