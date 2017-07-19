var fsp = require('./fsp');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var minimatch = require('minimatch');
module.exports = lash;

function lash(inroot, position, ignores_) {
    var list = [];
    var ignores = ignores_ || 'node_modules/**/*';
    var dirposition = path.dirname(position);
    var relativeBase = path.relative(dirposition, inroot) + '/';
    return fsp.folder(inroot, inroot, pushIndexes).then(function () {
        var requires = list.sort().map(function (p) {
            return 'require(\'' + p + '\');';
        });
        var file = requires.join('\n');
        console.log(file);
        return fsp.write(position, file);
    });

    function pushIndexes(file) {
        var rel;
        if (file.base === 'index.test.js' && !minimatch(file.half, ignores)) {
            rel = file.half.slice(0, file.half.length - 3);
            list.push('./' + (relativeBase === '/' ? '' : relativeBase) + rel);
        }
    }
}