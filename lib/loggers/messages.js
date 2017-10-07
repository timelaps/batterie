var forEach = require('../utils/for-each');
module.exports = messages;

function messages(batterie) {
    var erred = [];
    var missed = [];
    var failed = [];
    var expectations = batterie.expectations;
    var its = batterie.its;
    var descriptions = batterie.descriptions;
    append(descriptions.errors, erred);
    append(its.erred, erred);
    append(expectations.missed, missed);
    append(expectations.failed, failed);
    return [ //
        erred, //
        missed, //
        failed
    ];

    function append(list, array) {
        forEach(list, function (item) {
            if (!item.skipping) {
                array.push(item.pretty());
            }
        });
    }
}