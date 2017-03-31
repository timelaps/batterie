var forEach = require('../utils/for-each');
module.exports = basicLog;

function basicLog(batterie) {
    var expectations = batterie.expectations;
    var its = batterie.its;
    forEach(expectations.missed, function (missed) {
        console.log(missed.pretty());
    });
    forEach(expectations.failed, function (failed) {
        console.log(failed.pretty());
    });
    console.log('TOTAL:\t' + its.every.length + //
        '\nPASSED:\t' + its.passed.length + //
        '\nFAILED:\t' + its.failed.length + //
        '\nMISSED:\t' + its.missed.length + //
        '\nSYNC:\t' + its.sync.length + //
        '\nASYNC:\t' + its.async.parallel.length + //
        '\nSERIAL:\t' + its.async.serial.length + //
        '\n\nEXPECTATIONS' + //
        '\nTOTAL:\t' + expectations.every.length + //
        '\nPASSED:\t' + expectations.passed.length + //
        '\nFAILED:\t' + expectations.failed.length //
    );
}