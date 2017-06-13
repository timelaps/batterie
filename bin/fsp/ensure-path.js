module.exports = ensurePath;
var mkdirp = require('mkdirp');
function ensurePath(p) {
    return new Promise(function (success, failure) {
        mkdirp(p, function (err) {
            if (err) {
                failure(err);
            } else {
                success();
            }
        });
    });
}
