module.exports = createProps;
var forEach = require('./for-each');

function createProps(opts_, defaults) {
    var opts = opts_;
    if (opts) {
        if (typeof opts === 'number') {
            opts = {
                expects: opts
            };
        }
        forEach([ //
            'expects', 'async', 'serial', 'autoExpects', 'skip', 'resolve'
        ], function (key) {
            defaults[key] = undefinedOr(key);
        });
    }
    return defaults;

    function undefinedOr(key) {
        return opts[key] === undefined ? defaults[key] : opts[key];
    }
}