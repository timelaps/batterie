module.exports = stats;
var fs = require('fs');
var stat = require('./stat');

function stats(files, inroot) {
    return Promise.all(files.map(function (f) {
        return stat(f, inroot);
    }));
}
