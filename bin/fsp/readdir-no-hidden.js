module.exports = readdirNoHidden;
var readdir = require('./readdir');
var path = require('path');

function readdirNoHidden(p) {
    return readdir(p).then(function (list) {
        return list.filter(function (name) {
            return name[0] !== '.';
        }).map(function (file) {
            return path.join(p, file);
        }).slice(0).sort();
    });
}
