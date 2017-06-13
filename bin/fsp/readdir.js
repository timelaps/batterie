module.exports = readdir;
var fs = require('fs');

function readdir(p) {
    return new Promise(function (success, failure) {
        fs.readdir(p, function (err, list) {
            if (err) {
                failure(err);
            } else {
                success(list);
            }
        });
    });
}