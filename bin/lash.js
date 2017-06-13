var fsp = require('./fsp');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
module.exports = lash;

function lash(inroot, position) {
    var list = [];
    var dirposition = path.dirname(position);
    var relativeBase = path.relative(dirposition, inroot) + '/';
    return fsp.folder(inroot, inroot, pushIndexes).then(function () {
        var requires = list.map(function (p) {
            return 'require(\'' + p + '\');';
        });
        var file = requires.join('\n');
        console.log(file);
        return fsp.write(position, file);
    });

    function pushIndexes(file) {
        var rel;
        if (file.base === 'index.test.js') {
            rel = file.half.slice(0, file.half.length - 3);
            list.push('./' + relativeBase + rel);
        }
    }
}
